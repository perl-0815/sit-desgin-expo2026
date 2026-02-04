import { Suspense } from "react"
import ResearchWorksClient from "./ResearchWorksClient"

export default function ResearchPage() {
  return (
    <main className="min-h-screen bg-[#F9F9F9] text-[#2E3437]">
      {/* useSearchParams を使用するクライアントコンポーネントのCSRバイルアウトを許容するため、Suspense でラップ */}
      <Suspense fallback={<div className="px-6 py-10">読み込み中...</div>}>
        <ResearchWorksClient />
      </Suspense>
    </main>
  )
}
