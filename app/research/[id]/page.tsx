import ResearchDetailClient from "./ResearchDetailClient"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ResearchDetailPage({ params }: PageProps) {
  // Next.js 16 の動的ルート params は Promise になるため await してから渡す
  const resolvedParams = await params
  return <ResearchDetailClient id={resolvedParams.id} />
}
