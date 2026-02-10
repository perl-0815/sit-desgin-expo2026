"use client"

import { CSSProperties, useEffect, useRef } from "react"

type LensConfig = {
  x: number
  y: number
  radius: number
  strength?: number
  edgeSoftness?: number
  contourWidth?: number
  contourStrength?: number
  chromaticAberration?: number
  reflectionStrength?: number
  dispersionStrength?: number
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
uniform float u_strength;
uniform float u_edgeSoftnessPx;
uniform float u_contourWidthPx;
uniform float u_contourStrength;
uniform float u_chromaticAberrationPx;
uniform float u_reflectionStrength;
uniform float u_dispersionStrength;
uniform float u_opacity;

varying vec2 v_uv;

void main() {
  vec2 fragPx = v_uv * u_resolution;
  vec2 delta = fragPx - u_centerPx;
  float distPx = length(delta);
  vec2 dir = distPx > 0.0 ? normalize(delta) : vec2(0.0);

  float ringDist = abs(distPx - u_radiusPx);
  float contour = 1.0 - smoothstep(max(u_contourWidthPx - u_edgeSoftnessPx, 0.0), u_contourWidthPx + u_edgeSoftnessPx, ringDist);
  float contourCore = 1.0 - clamp(ringDist / max(u_contourWidthPx, 0.0001), 0.0, 1.0);

  float warpPx = contour * (u_contourStrength + contourCore * contourCore * u_strength);
  vec2 samplePx = fragPx - dir * warpPx;
  vec2 sampleUv = samplePx / u_resolution;
  vec4 baseColor = texture2D(u_texture, v_uv);

  vec2 ab = dir * (u_chromaticAberrationPx * contour);
  vec3 distortedColor = vec3(
    texture2D(u_texture, sampleUv + ab / u_resolution).r,
    texture2D(u_texture, sampleUv).g,
    texture2D(u_texture, sampleUv - ab / u_resolution).b
  );

  float angle = atan(dir.y, dir.x);
  float angleNorm = angle / 6.28318530718 + 0.5;
  vec3 spectral = 0.5 + 0.5 * cos(6.28318530718 * (vec3(0.0, 0.33, 0.67) + angleNorm + contourCore * 0.12));
  vec2 lightDir = normalize(vec2(-0.7, -0.6));
  float highlight = pow(max(dot(dir, lightDir), 0.0), 14.0) * contour;

  vec3 ringOptics = spectral * (u_dispersionStrength * contour) + vec3(highlight * u_reflectionStrength);
  vec3 mixed = mix(baseColor.rgb, distortedColor + ringOptics, contour);

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
    const strengthLocation = gl.getUniformLocation(program, "u_strength")
    const edgeSoftnessLocation = gl.getUniformLocation(program, "u_edgeSoftnessPx")
    const contourWidthLocation = gl.getUniformLocation(program, "u_contourWidthPx")
    const contourStrengthLocation = gl.getUniformLocation(program, "u_contourStrength")
    const chromaticAberrationLocation = gl.getUniformLocation(program, "u_chromaticAberrationPx")
    const reflectionStrengthLocation = gl.getUniformLocation(program, "u_reflectionStrength")
    const dispersionStrengthLocation = gl.getUniformLocation(program, "u_dispersionStrength")
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

    image.onload = () => {
      if (isDisposed) {
        return
      }

      canvas.width = width
      canvas.height = height
      gl.viewport(0, 0, width, height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

      gl.useProgram(program)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.enableVertexAttribArray(positionLocation)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

      gl.uniform2f(resolutionLocation, width, height)
      gl.uniform2f(centerLocation, lens.x, lens.y)
      gl.uniform1f(radiusLocation, lens.radius)
      gl.uniform1f(strengthLocation, lens.strength ?? 24)
      gl.uniform1f(edgeSoftnessLocation, lens.edgeSoftness ?? 8)
      gl.uniform1f(contourWidthLocation, lens.contourWidth ?? 10)
      gl.uniform1f(contourStrengthLocation, lens.contourStrength ?? 8)
      gl.uniform1f(chromaticAberrationLocation, lens.chromaticAberration ?? 1.2)
      gl.uniform1f(reflectionStrengthLocation, lens.reflectionStrength ?? 0.18)
      gl.uniform1f(dispersionStrengthLocation, lens.dispersionStrength ?? 0.16)
      gl.uniform1f(opacityLocation, opacity)
      gl.uniform1i(textureLocation, 0)

      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    return () => {
      isDisposed = true
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
    lens.strength,
    lens.edgeSoftness,
    lens.contourWidth,
    lens.contourStrength,
    lens.chromaticAberration,
    lens.reflectionStrength,
    lens.dispersionStrength,
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
