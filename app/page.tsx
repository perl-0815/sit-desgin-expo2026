import TopPageClient from "./TopPageClient"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F9F9F9] text-[#2E3437]">
      {/* 先行公開向け簡易版ではトップページの情報を厳選し、クライアント側UIのみ描画します。 */}
      <TopPageClient />
    </main>
  )
}
