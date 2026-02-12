import CareerClient from "./CareerClient"

export default function CareerPage() {
  return (
    <main className="min-h-screen bg-[#F9F9F9] text-[#2E3437]">
      {/* 卒業生の進路ページはインタラクションがあるため、クライアント側のUIに委譲します。 */}
      <CareerClient />
    </main>
  )
}
