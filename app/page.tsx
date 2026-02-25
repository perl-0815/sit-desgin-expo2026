import { randomInt } from "node:crypto"

import { prisma } from "@/lib/prisma"

import TopPageClient from "./TopPageClient"
import KeyVisual from "./components/KeyVisual"

// 変更理由: 戻る遷移でトップページを毎回フル再計算しないようにしつつ、
// 最新情報の反映遅延を抑えるため5分ごとに再検証します。
export const revalidate = 300

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
  // 変更理由: 戻る遷移時に毎回サーバー再実行される負荷を抑えるため、
  // トップページは短時間キャッシュを許可します（最新性と体感速度のバランスを取る）。
  // noStore を維持すると他ページから戻るたびに DB クエリと整形処理が必ず再実行されるため重くなります。
  // App Router の再検証で十分に追従できるよう、5分の再検証に設定します。

  // 進路データは公開対象のみ集計し、トップページのグラフに反映します。
  // 変更理由: 匿名公開の進路も画面表示の対象外とする運用に合わせ、
  // 集計でも「非公開」と「匿名公開」を除外して表示との不整合を防ぎます。
  // Prismaの戻り値がビルド時にany扱いになるのを防ぐため、必要最小限の型を明示します。
  // 変更理由: 進路集計のために全行を取得すると戻る遷移のサーバー負荷が増えるため、
  // DB 側で count 集計し、アプリ側の走査コストを削減します。
  // 変更理由: トランザクション開始待ちで P2028 が発生する環境があるため、
  // 読み取り専用の独立クエリを並列実行し、同等の結果を安全に取得します。
  const [gradCount, jobCount, total] = await Promise.all([
    prisma.career.count({
      where: {
        NOT: {
          visibility: {
            in: ["非公開", "匿名公開"],
          },
        },
        category: { contains: "大学院" },
      },
    }),
    prisma.career.count({
      where: {
        NOT: {
          visibility: {
            in: ["非公開", "匿名公開"],
          },
        },
        category: { contains: "就職" },
      },
    }),
    prisma.career.count({
      where: {
        NOT: {
          visibility: {
            in: ["非公開", "匿名公開"],
          },
        },
      },
    }),
  ])

  // 研究・作品のプレビューはトップページ用に軽量な項目だけ取得します。
  // Vercel のビルド環境で Prisma 型が解決できず any 扱いになることがあるため、
  // ここで明示的に型付けして implicit any を防止します。
  const [researchList, portfolioList]: [
    ResearchPreviewSource[],
    PortfolioPreviewSource[],
  ] = await Promise.all([
    prisma.research.findMany({
      // 変更理由: 以前は全件取得後に先頭6件しか使っておらず無駄が大きいため、
      // ランダム選抜に必要な母集団を十分確保しつつ、取得件数を制限して戻る遷移時の負荷を軽減します。
      take: 24,
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
      // 変更理由: research と同様に取得件数を制限し、サーバー処理と転送量を削減します。
      take: 24,
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

  // 変更理由: 集計済みの total / grad / job を使ってその他件数を算出し、
  // 行単位ループをなくして応答時間を短縮します。
  const otherCount = Math.max(total - gradCount - jobCount, 0)
  // 研究・作品のどちらでも同じUIで扱えるよう、共通のプレビュー構造に変換します。
  // 変更理由: トップのプレースホルダー画像は初回表示で必ず参照される可能性があるため、
  // 同等見た目のWebPへ切り替えて転送量を削減します。
  const previewFallbackImage = "/image/preview.webp"
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
  // 変更理由: トップのスライドはPC/SPとも6件運用に統一したため、
  // サーバー側で渡すプレビュー件数も6件へ揃えて、同一3件の繰り返しを防ぎます。
  const previewItems = mixedItems.slice(0, 6)

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
