import { unstable_noStore as noStore } from "next/cache"
import { randomInt } from "node:crypto"

import { prisma } from "@/lib/prisma"

import TopPageClient from "./TopPageClient"
import KeyVisual from "./components/KeyVisual"

type PreviewItem = {
  id: string
  title: string
  author: string
  imageUrl: string
  href: string
  kind: "research" | "works"
}

type ResearchPreviewSource = {
  id: string
  title: string | null
  image_url: string | null
  image_thumb_url: string | null
  student: { name: string | null } | null
}

type PortfolioPreviewSource = {
  id: string
  title1: string | null
  title2: string | null
  image1_url: string | null
  image1_thumb_url: string | null
  image2_url: string | null
  image2_thumb_url: string | null
  student: { name: string | null } | null
}

export default async function Home() {
  // ランダム表示を都度更新するため、トップページはキャッシュを無効化します。
  noStore()

  // 進路データは非公開以外のみ集計し、トップページのグラフに反映します。
  // Prismaの戻り値がビルド時にany扱いになるのを防ぐため、必要最小限の型を明示します。
  const careers: Array<{ category: string | null }> =
    await prisma.career.findMany({
      where: {
        NOT: {
          visibility: "非公開",
        },
      },
      select: {
        category: true,
      },
    })

  // 研究・作品のプレビューはトップページ用に軽量な項目だけ取得します。
  // Vercel のビルド環境で Prisma 型が解決できず any 扱いになることがあるため、
  // ここで明示的に型付けして implicit any を防止します。
  const [researchList, portfolioList]: [
    ResearchPreviewSource[],
    PortfolioPreviewSource[],
  ] = await Promise.all([
    prisma.research.findMany({
      select: {
        id: true,
        title: true,
        image_url: true,
        image_thumb_url: true,
        student: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.portfolio.findMany({
      select: {
        id: true,
        title1: true,
        title2: true,
        image1_url: true,
        image1_thumb_url: true,
        image2_url: true,
        image2_thumb_url: true,
        student: {
          select: {
            name: true,
          },
        },
      },
    }),
  ])

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
  // 研究・作品のどちらでも同じUIで扱えるよう、共通のプレビュー構造に変換します。
  const previewFallbackImage = "/image/preview.png"
  const pickImage = (
    original?: string | null,
    thumb?: string | null,
  ): string => {
    // 画像はサムネイル優先で無ければオリジナルを使い、どちらも無い場合は固定画像にします。
    const cleanedThumb = thumb?.trim()
    const cleanedOriginal = original?.trim()
    return cleanedThumb || cleanedOriginal || previewFallbackImage
  }
  const normalizeTitle = (value?: string | null) => value?.trim() || ""

  const researchItems: PreviewItem[] = researchList
    .map((item) => ({
      id: `research-${item.id}`,
      title: normalizeTitle(item.title),
      author: item.student?.name?.trim() || "氏名未登録",
      imageUrl: pickImage(item.image_url, item.image_thumb_url),
      href: `/research/${item.id}`,
      kind: "research" as const,
    }))
    // タイトルが無い研究は表示対象から外し、空のカードが出ないようにします。
    .filter((item) => item.title.length > 0)

  const portfolioItems: PreviewItem[] = portfolioList
    .map((item) => {
      const title = normalizeTitle(item.title1) || normalizeTitle(item.title2)
      return {
        id: `works-${item.id}`,
        title,
        author: item.student?.name?.trim() || "氏名未登録",
        imageUrl: pickImage(
          item.image1_url || item.image2_url,
          item.image1_thumb_url || item.image2_thumb_url,
        ),
        href: `/works/${item.id}`,
        kind: "works" as const,
      }
    })
    // 作品タイトルが無い場合は見た目が崩れるので除外します。
    .filter((item) => item.title.length > 0)

  const mixedItems = [...researchItems, ...portfolioItems]
  // ランダム表示用にFisher-Yatesでシャッフルします。
  for (let i = mixedItems.length - 1; i > 0; i -= 1) {
    // React の purity ルールに抵触しないよう Math.random は使わず、
    // サーバー実行で安全に使える node:crypto の randomInt で同等の乱択を行う。
    // 既存の「毎回ランダム表示する」仕様は維持される。
    const j = randomInt(i + 1)
    ;[mixedItems[i], mixedItems[j]] = [mixedItems[j], mixedItems[i]]
  }
  // Figmaの3枚レイアウトに合わせて3件に絞ります。
  const previewItems = mixedItems.slice(0, 3)

  return (
    <>
      <KeyVisual />
      <main className="min-h-screen bg-[#F9F9F9] text-[#2E3437]">
        {/* トップページはFigmaの構成に合わせてクライアント側のUIで描画します。 */}
        <TopPageClient
          careerStats={{
            total,
            gradCount,
            jobCount,
            otherCount,
          }}
          previewItems={previewItems}
        />
      </main>
    </>
  )
}
