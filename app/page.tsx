import { prisma } from "@/lib/prisma"

import TopPageClient from "./TopPageClient"

export default async function Home() {
  // 進路データは非公開以外のみ集計し、トップページのグラフに反映します。
  const careers = await prisma.career.findMany({
    where: {
      NOT: {
        visibility: "非公開",
      },
    },
    select: {
      category: true,
    },
  })

  let gradCount = 0
  let jobCount = 0
  let otherCount = 0

  careers.forEach((career) => {
    const category = career.category ?? ""

    if (category.includes("大学院")) {
      gradCount += 1
    } else if (category.includes("就職")) {
      jobCount += 1
    } else {
      otherCount += 1
    }
  })

  const total = careers.length
  return (
    <main className="min-h-screen bg-[#F9F9F9] text-[#2E3437]">
      {/* トップページはFigmaの構成に合わせてクライアント側のUIで描画します。 */}
      <TopPageClient
        careerStats={{
          total,
          gradCount,
          jobCount,
          otherCount,
        }}
      />
    </main>
  )
}
