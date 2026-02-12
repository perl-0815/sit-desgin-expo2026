import ResearchDetailClient from "./ResearchDetailClient"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ResearchDetailPage({ params }: PageProps) {
  // Next.js 16 の動的ルート params は Promise になるため await してから渡す
  const resolvedParams = await params
  return (
    <main className="min-h-screen bg-white text-[#2E3437]">
      {/* 他ページと同じ枠組みに合わせ、余白が増えないように統一します。 */}
      <ResearchDetailClient id={resolvedParams.id} />
    </main>
  )
}
