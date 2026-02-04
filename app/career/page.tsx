import Link from "next/link"

export default function CareerPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[960px] flex-col gap-6 px-6 py-16">
      {/* このページは「卒業生の進路」用の仮置きです。後日デザイン確定時に差し替えます。 */}
      <div className="rounded-2xl border border-dashed border-[#EBEEF0] bg-white p-8">
        <h1 className="text-2xl font-bold text-[#2E3437]">卒業生の進路</h1>
        <p className="mt-3 text-sm leading-6 text-[#6A7378]">
          ここは仮のページです。内容・レイアウトは確定後に更新します。
        </p>
        <p className="mt-2 text-sm leading-6 text-[#6A7378]">
          右上メニューの導線確認のために用意しています。
        </p>
      </div>

      {/* 仮ページであることが分かるようにホームへの戻りリンクを設置しています。 */}
      <div>
        <Link className="text-sm text-[#2C68D3] underline" href="/">
          TOPへ戻る
        </Link>
      </div>
    </main>
  )
}
