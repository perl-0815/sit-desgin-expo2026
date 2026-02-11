"use client"

import { CSSProperties, useEffect, useRef } from "react"

type LensConfig = {
  x: number
  y: number
  radius: number
  refraction?: number
  depth?: number
  dispersion?: number
  frost?: number
  spread?: number
}

type CircularLensEffectProps = {
  width: number
  height: number
  textureSrc: string
  lens: LensConfig
  className?: string
  style?: CSSProperties
  opacity?: number
}

const vertexShaderSource = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const fragmentShaderSource = `
precision mediump float;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform vec2 u_centerPx;
uniform float u_radiusPx;
uniform float u_refraction;
uniform float u_depth;
uniform float u_dispersion;
uniform float u_frost;
uniform float u_spreadPx;
uniform float u_opacity;

varying vec2 v_uv;

void main() {
  vec2 fragPx = v_uv * u_resolution;
  vec2 delta = fragPx - u_centerPx;
  float distPx = length(delta);
  vec2 dir = distPx > 0.0 ? normalize(delta) : vec2(0.0);
  vec4 baseColor = texture2D(u_texture, v_uv);
  float rNorm = distPx / max(u_radiusPx, 0.0001);
  float spreadNorm = u_spreadPx / max(u_radiusPx, 0.0001);
  float coreMask = 1.0 - smoothstep(0.0, 0.86, rNorm);
  float transitionMask = smoothstep(0.58, 1.02, rNorm);
  float outerMask = 1.0 - smoothstep(1.04 + spreadNorm, 1.30 + spreadNorm, rNorm);
  float edgeMask = transitionMask * outerMask;
  float rimMask = 1.0 - smoothstep(0.0, 0.2 + spreadNorm * 0.38, abs(rNorm - 1.0));
  float glassMask = clamp(coreMask * 0.2 + edgeMask * 0.82 + rimMask * 0.28, 0.0, 1.0);

  vec2 coreSampleUv = fragPx / u_resolution;
  vec2 coreBlurOffset = vec2(max(0.4, u_frost * 0.65)) / u_resolution;
  vec3 coreBlur =
    texture2D(u_texture, coreSampleUv).rgb * 0.42 +
    texture2D(u_texture, coreSampleUv + vec2(coreBlurOffset.x, 0.0)).rgb * 0.145 +
    texture2D(u_texture, coreSampleUv - vec2(coreBlurOffset.x, 0.0)).rgb * 0.145 +
    texture2D(u_texture, coreSampleUv + vec2(0.0, coreBlurOffset.y)).rgb * 0.145 +
    texture2D(u_texture, coreSampleUv - vec2(0.0, coreBlurOffset.y)).rgb * 0.145;
  float coreHaze = clamp((u_frost / 42.0) * coreMask, 0.0, 0.18);
  vec3 colorAfterCore = mix(baseColor.rgb, mix(coreBlur, vec3(0.94, 0.96, 0.99), 0.24), coreHaze);

  float edgeWarpFactor = edgeMask * (0.08 + 0.62 * edgeMask);
  float edgeWarpPx = edgeWarpFactor * (u_refraction * 1.55 + u_depth * 0.44);
  vec2 edgeSamplePx = fragPx - dir * edgeWarpPx;
  vec2 edgeSampleUv = edgeSamplePx / u_resolution;
  vec2 dispersionOffset = dir * (u_dispersion * (0.14 + edgeMask * 0.9 + rimMask * 0.45)) / u_resolution;
  vec3 refractedColor = vec3(
    texture2D(u_texture, edgeSampleUv + dispersionOffset).r,
    texture2D(u_texture, edgeSampleUv).g,
    texture2D(u_texture, edgeSampleUv - dispersionOffset).b
  );

  vec2 lightDir = normalize(vec2(-0.64, -0.77));
  float rimHighlight = pow(max(dot(dir, lightDir), 0.0), 9.0) * rimMask;
  float topHighlight = smoothstep(0.25, 1.0, v_uv.y) * edgeMask;
  float highlight = (rimHighlight * 0.92 + topHighlight * 0.36) * clamp(u_depth / 18.0, 0.0, 1.0);
  float shadow = smoothstep(-0.18, 1.0, dot(dir, normalize(vec2(0.74, 0.45)))) * edgeMask * clamp(u_depth / 20.0, 0.0, 0.32);
  vec3 edgeColor = refractedColor + vec3(highlight) - vec3(shadow * 0.12);
  float edgeMix = clamp(edgeMask * 0.64 + rimMask * 0.16, 0.0, 1.0);

  vec3 mixed = mix(colorAfterCore, edgeColor, edgeMix);

  gl_FragColor = vec4(mixed, baseColor.a * u_opacity);
}
`

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) {
    return null
  }
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createProgram(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
  if (!vertexShader || !fragmentShader) {
    if (vertexShader) gl.deleteShader(vertexShader)
    if (fragmentShader) gl.deleteShader(fragmentShader)
    return null
  }

  const program = gl.createProgram()
  if (!program) {
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)
    return null
  }

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  gl.deleteShader(vertexShader)
  gl.deleteShader(fragmentShader)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    return null
  }
  return program
}

export default function CircularLensEffect({
  width,
  height,
  textureSrc,
  lens,
  className,
  style,
  opacity = 1,
}: CircularLensEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || width <= 0 || height <= 0) {
      return
    }

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
    })
    if (!gl) {
      return
    }

    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource)
    if (!program) {
      return
    }

    const positionLocation = gl.getAttribLocation(program, "a_position")
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution")
    const centerLocation = gl.getUniformLocation(program, "u_centerPx")
    const radiusLocation = gl.getUniformLocation(program, "u_radiusPx")
    const refractionLocation = gl.getUniformLocation(program, "u_refraction")
    const depthLocation = gl.getUniformLocation(program, "u_depth")
    const dispersionLocation = gl.getUniformLocation(program, "u_dispersion")
    const frostLocation = gl.getUniformLocation(program, "u_frost")
    const spreadLocation = gl.getUniformLocation(program, "u_spreadPx")
    const opacityLocation = gl.getUniformLocation(program, "u_opacity")
    const textureLocation = gl.getUniformLocation(program, "u_texture")

    const positionBuffer = gl.createBuffer()
    if (!positionBuffer) {
      gl.deleteProgram(program)
      return
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    )

    const texture = gl.createTexture()
    if (!texture) {
      gl.deleteBuffer(positionBuffer)
      gl.deleteProgram(program)
      return
    }

    const image = new Image()
    image.decoding = "async"
    image.src = textureSrc

    let isDisposed = false

    const render = () => {
      if (isDisposed || !image.complete) {
        return
      }

      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      const cssWidth = rect.width > 0 ? rect.width : width
      const cssHeight = rect.height > 0 ? rect.height : height
      const renderWidth = Math.max(1, Math.round(cssWidth * dpr))
      const renderHeight = Math.max(1, Math.round(cssHeight * dpr))
      const scaleX = renderWidth / width
      const scaleY = renderHeight / height
      const scale = (scaleX + scaleY) / 2

      if (canvas.width !== renderWidth || canvas.height !== renderHeight) {
        canvas.width = renderWidth
        canvas.height = renderHeight
      }

      gl.viewport(0, 0, renderWidth, renderHeight)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      const sourceCanvas = document.createElement("canvas")
      sourceCanvas.width = renderWidth
      sourceCanvas.height = renderHeight
      const sourceCtx = sourceCanvas.getContext("2d")
      if (!sourceCtx) {
        return
      }
      sourceCtx.drawImage(image, 0, 0, renderWidth, renderHeight)

      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sourceCanvas)

      gl.useProgram(program)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.enableVertexAttribArray(positionLocation)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

      gl.uniform2f(resolutionLocation, renderWidth, renderHeight)
      gl.uniform2f(centerLocation, lens.x * scaleX, lens.y * scaleY)
      gl.uniform1f(radiusLocation, lens.radius * scale)
      gl.uniform1f(refractionLocation, (lens.refraction ?? 5.6) * scale)
      gl.uniform1f(depthLocation, (lens.depth ?? 6.2) * scale)
      gl.uniform1f(dispersionLocation, (lens.dispersion ?? 1.4) * scale)
      gl.uniform1f(frostLocation, (lens.frost ?? 4.0) * scale)
      gl.uniform1f(spreadLocation, (lens.spread ?? 18.0) * scale)
      gl.uniform1f(opacityLocation, opacity)
      gl.uniform1i(textureLocation, 0)

      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    image.onload = render
    if (image.complete) {
      render()
    }
    window.addEventListener("resize", render)

    return () => {
      isDisposed = true
      window.removeEventListener("resize", render)
      gl.deleteTexture(texture)
      gl.deleteBuffer(positionBuffer)
      gl.deleteProgram(program)
    }
  }, [
    width,
    height,
    textureSrc,
    lens.x,
    lens.y,
    lens.radius,
    lens.refraction,
    lens.depth,
    lens.dispersion,
    lens.frost,
    lens.spread,
    opacity,
  ])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        ...style,
      }}
    />
  )
}
