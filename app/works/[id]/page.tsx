import WorksDetailClient from "./WorksDetailClient"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function WorksDetailPage({ params }: PageProps) {
  // Next.js 16 の動的ルート params は Promise になるため await してから渡す
  const resolvedParams = await params
  return <WorksDetailClient id={resolvedParams.id} />
}
