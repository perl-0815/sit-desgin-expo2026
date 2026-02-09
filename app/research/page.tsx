import { Suspense } from "react"
import ResearchWorksClient from "./ResearchWorksClient"

export default function ResearchPage() {
  return (
    <main className="min-h-screen bg-[#F9F9F9] text-[#2E3437]">
      {/* useSearchParams を使用するクライアントコンポーネントのCSRバイルアウトを許容するため、Suspense でラップ */}
      {/* 読み込み中の文字表示は違和感が出るため、スケルトン表示に置き換えます。 */}
      <Suspense
        fallback={
          <div className="px-4 py-10 md:px-[128px]">
            <div className="space-y-6">
              <div className="h-7 w-40 rounded-md bg-[#EBEEF0] skeleton-shimmer" />
              <div className="h-12 w-full rounded-full bg-[#EBEEF0] skeleton-shimmer" />
              <div className="space-y-4">
                <div className="h-6 w-56 rounded-md bg-[#EBEEF0] skeleton-shimmer" />
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={`skeleton-card-${index}`}
                      className="space-y-2"
                    >
                      <div className="aspect-video w-full rounded-[4px] bg-[#EBEEF0] skeleton-shimmer" />
                      <div className="h-4 w-11/12 rounded-md bg-[#EBEEF0] skeleton-shimmer" />
                      <div className="h-4 w-1/2 rounded-md bg-[#EBEEF0] skeleton-shimmer" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        }
      >
        <ResearchWorksClient />
      </Suspense>
    </main>
  )
}
