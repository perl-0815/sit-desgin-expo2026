import ExhibitionDetailClient from "./ExhibitionDetailClient"

type ExhibitionDetailPageProps = {
  params: { id: string }
}

export default function ExhibitionDetailPage({
  params,
}: ExhibitionDetailPageProps) {
  return <ExhibitionDetailClient id={params.id} />
}
