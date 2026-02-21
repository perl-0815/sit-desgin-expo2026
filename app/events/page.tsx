import EventsClient from "./EventsClient"

export default function EventsPage() {
  // 変更理由: タブ切替用の searchParams 依存を撤去したため、Suspenseラップは不要です。
  return <EventsClient />
}
