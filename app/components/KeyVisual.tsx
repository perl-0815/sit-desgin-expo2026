import SvgCanvas from "./SvgCanvas"
import KeyVisualShapes from "./KeyVisualShapes"

export default function KeyVisual() {
  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden">
      <SvgCanvas>
        <KeyVisualShapes />
      </SvgCanvas>

      <div className="relative z-10 text-center text-black">
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">
          SIT Design Expo 2026
        </p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight md:text-7xl">
          キービジュアル
        </h1>
        <p className="mt-6 text-lg text-zinc-300">
          ここにメインビジュアルが入ります
        </p>
      </div>
    </section>
  )
}
