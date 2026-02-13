import { Suspense } from "react"

import EventsClient from "./EventsClient"

export default function EventsPage() {
  // Next.js 16 では useSearchParams を使うクライアントコンポーネントを
  // Suspense 境界で包まないと prerender 時にビルドエラーになるため、
  // /events 配下全体をここでラップして静的生成時の失敗を防ぎます。
  return (
    <Suspense fallback={null}>
      <EventsClient />
    </Suspense>
  )
}
