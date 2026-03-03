import type { MetadataRoute } from "next";
import { fallbackSiteUrl, siteUrl } from "@/lib/site-metadata";

// SNS クローラや検索クローラが robots 判定で停止しないよう、
// 本番ドメイン配下を明示的に Allow する robots.txt を返す。
// 共有プレビュー不達時に「robots 未定義/解釈差分」が疑いになるのを避ける目的。
export default function robots(): MetadataRoute.Robots {
  // 変更理由: 独自ドメイン障害時にもクローラがVercel側サイトマップへ到達できるよう、
  // sitemap はメインURLとフォールバックURLの両方を返します（重複は除去）。
  const sitemapUrls = Array.from(
    new Set([`${siteUrl}/sitemap.xml`, `${fallbackSiteUrl}/sitemap.xml`]),
  );

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: sitemapUrls,
  };
}
