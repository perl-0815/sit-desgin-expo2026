import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 変更理由: KVで使う静的画像(`/public/key-visual/*`)は再訪時に同一アセットが頻出するため、
  // HTTPキャッシュを明示してネットワーク再取得を減らし、トップ復帰時の体感速度を改善します。
  // なお、ファイル名を差し替えて更新する運用に備え、`immutable` は付けずに再検証可能な設定にします。
  async headers() {
    return [
      {
        source: "/key-visual/:path*",
        headers: [
          {
            key: "Cache-Control",
            // 変更理由: ブラウザ側で1日保持しつつ、期限後は再検証可能にして更新反映と高速化を両立します。
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
