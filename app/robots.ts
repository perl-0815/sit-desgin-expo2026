import type { MetadataRoute } from "next";

// SNS クローラや検索クローラが robots 判定で停止しないよう、
// 本番ドメイン配下を明示的に Allow する robots.txt を返す。
// 共有プレビュー不達時に「robots 未定義/解釈差分」が疑いになるのを避ける目的。
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://www.sit-design-expo2026.jp/sitemap.xml",
  };
}
