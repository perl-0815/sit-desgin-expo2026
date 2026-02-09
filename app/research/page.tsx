import ResearchWorksClient from "./ResearchWorksClient"

export default function ResearchPage() {
  return (
    <main className="min-h-screen bg-[#F9F9F9] text-[#2E3437]">
      {/* Suspense なしで描画し、初期表示をブロックしない構成にします */}
      <ResearchWorksClient />
    </main>
  )
}
