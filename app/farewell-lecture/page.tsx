import { permanentRedirect } from "next/navigation"

// 変更理由: 実運用の正規URLを /events/farewell-lecture に統一するため、
// 旧エイリアス(/farewell-lecture)は恒久リダイレクトで正規URLへ集約します。
export default function FarewellLectureAliasPage() {
  permanentRedirect("/events/farewell-lecture")
}
