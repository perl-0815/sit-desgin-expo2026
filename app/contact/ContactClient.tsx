"use client";

import { useRef, useState } from "react";

import Footer from "../components/Footer";
import GlobalHeader from "../components/GlobalHeader";
import useSectionReveal from "../components/useSectionReveal";

const contactEmail = "shibadesign2026sotsuten@gmail.com";
// お問い合せフォームのURLが確定していないため、後から差し替えできるよう定数化します。
const contactFormUrl = "https://forms.gle/9pBuxBWgC9YuFo8j8";

export default function ContactClient() {
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const copyTimeoutRef = useRef<number | null>(null);

  // お問い合せページの各セクションにスライドインを適用します。
  useSectionReveal();

  const resetCopyStatus = () => {
    setCopyStatus("idle");
  };

  const showInlineMessage = (status: "success" | "error") => {
    setCopyStatus(status);
    if (copyTimeoutRef.current) {
      window.clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = window.setTimeout(() => {
      resetCopyStatus();
      copyTimeoutRef.current = null;
    }, 3000);
  };

  const handleCopyEmail = async () => {
    // クリップボードAPIはセキュアコンテキスト必須のため、使えない場合は確実に動くフォールバックへ回します。
    const tryClipboardApi = async () => {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(contactEmail);
        return true;
      }
      return false;
    };

    const fallbackCopy = () => {
      const textarea = document.createElement("textarea");
      textarea.value = contactEmail;
      // iOS Safari などでのコピー失敗を避けるため、フォーカス可能にして画面外へ退避します。
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      textarea.style.left = "-9999px";
      textarea.style.top = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      // iOS での選択範囲指定を明示し、コピー成功率を上げます。
      textarea.setSelectionRange(0, textarea.value.length);
      const succeeded = document.execCommand("copy");
      document.body.removeChild(textarea);
      return succeeded;
    };

    try {
      if (window.isSecureContext && (await tryClipboardApi())) {
        showInlineMessage("success");
        return;
      }
    } catch {
      // クリップボードAPIが拒否されてもフォールバックで継続します。
    }

    const succeeded = fallbackCopy();
    if (succeeded) {
      showInlineMessage("success");
    } else {
      showInlineMessage("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* フッターが下端に揃うように、ページ全体の最小高さを確保します。 */}
      {/* モバイルは画面幅いっぱいに広げるため、最大幅の制限はmd以上に限定します。 */}
      <div className="mx-auto flex min-h-screen w-full flex-col bg-neutral-50 md:max-w-[1200px] lg:max-w-[1280px]">
      {/* デスクトップは横幅のみ広げ、シングルカラムの構成は維持します。 */}
      {/* 全ページ共通のヘッダーを配置し、スクロール中も固定表示します。 */}
      <GlobalHeader activeId="contact" />

      {/* 固定ヘッダーとコンテンツが重ならないよう、他ページと同じ上余白を確保します。 */}
      <div className="pt-[84px] md:pt-[96px]">
        {/* 見出し行は左のグラデーションバーと右上メニューでFigma構成を再現します。 */}
        <div className="flex items-center justify-between px-4 pt-6 md:px-[128px] md:pt-[36px] md:pb-3">
          <div className="flex items-center gap-3 md:gap-4">
            {/* 研究ページと同様に、左のオレンジバーは縦グラデーションで表現します。 */}
            <span className="h-6 w-2 rounded-[4px] bg-gradient-to-b from-[#FB9678] to-[#E5A967] md:h-8" />
            <h1 className="text-[24px] font-extrabold tracking-[0.04em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] md:text-[28px] md:tracking-[0.02em]">
              お問い合せ
            </h1>
          </div>
          {/* メニューボタンは共通ヘッダー側で固定表示しています。 */}
        </div>

        {/* リード文はFigma通りに左寄せし、行間を広めに設定します。 */}
        <div className="px-4 pt-6 md:px-[128px] md:pt-3">
          <p className="text-[15px] leading-[2] tracking-[0.04em] text-[#4B5459] md:text-[18px]">
            卒展に関するご質問などがありましたら、こちらからご連絡をお願いします。
          </p>
        </div>

        {/* 変更理由: 画面幅が狭い中間サイズでGoogleフォーム側が圧縮されるため、2カラム化は十分な横幅があるxl以上に限定します。 */}
        {/* これにより、幅が不足する場合はモバイルと同様に上下配置へ戻して可読性を確保します。 */}
        <div className="flex flex-col xl:flex-row xl:gap-[64px]">
          {/* メールお問い合せブロック */}
          <section
            data-reveal
            // 変更理由: 縦積み時もイベント見出しと同じPCガイド（左右128px）に揃えるため、md以上は横余白を128pxに固定します。
            // 2カラム時の左右非対称余白は従来どおりxl以上でのみ適用します。
            className="px-4 py-12 md:px-[128px] xl:flex-1 xl:pb-[128px] xl:pl-[128px] xl:pr-0 xl:pt-[56px]"
          >
            {/* 見出し下のラインカラーはFigma指定のソーシャルカラーに合わせます。 */}
            <div className="border-b border-[#FB9678] pb-1 xl:mx-auto xl:w-full xl:max-w-[361px] xl:pb-2">
              <h2 className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] xl:text-center xl:text-[24px]">
                メールでのお問い合せ
              </h2>
            </div>
            {/* 変更理由: Figma更新で見出し下の説明文が Body/M 指定になったため、サイズと行間を 13px / 1.9 に統一します。 */}
            <p className="mt-2 text-[13px] leading-[1.9] tracking-[0.02em] text-[#4B5459] xl:mt-3 xl:text-center xl:text-[13px]">
              以下のメールアドレスまで直接ご連絡ください。
            </p>
            {/* デスクトップ版ではコピー欄の前に少し余白を足して視線の抜けを作ります。 */}
            <div className="mt-3 xl:mt-12 xl:pb-[20px]">
              <button
                type="button"
                onClick={handleCopyEmail}
                className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#EBEEF0] px-3 py-2 xl:mx-auto xl:min-h-[56px] xl:max-w-[361px] xl:px-5 xl:py-3"
                aria-live="polite"
                aria-label={`${contactEmail} をコピー`}
              >
                {copyStatus === "idle" ? (
                  <>
                    <span className="text-center text-[15px] leading-[2] tracking-[0.04em] text-[#4B5459]">
                      {contactEmail}
                    </span>
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4 text-[#6A7378]"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M16 4H8C6.89543 4 6 4.89543 6 6V16M8 8H16C17.1046 8 18 8.89543 18 10V18C18 19.1046 17.1046 20 16 20H8C6.89543 20 6 19.1046 6 18V10C6 8.89543 6.89543 8 8 8Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                ) : (
                  // コピー結果の文言はメール欄内に表示し、3秒後に戻します。
                  <span className="text-center text-[15px] leading-[2] tracking-[0.04em] text-[#4B5459]">
                    {copyStatus === "success"
                      ? "コピーしました！"
                      : "コピーに失敗しました。"}
                  </span>
                )}
              </button>
            </div>
          </section>

          {/* その他方法のお問い合せブロック */}
          <section
            data-reveal
            // 変更理由: 縦積み時もイベント見出しと同じPCガイド（左右128px）へ揃え、中間幅でも可読性と整列を維持します。
            // 2カラム時の左右非対称余白は従来どおりxl以上でのみ適用します。
            className="px-4 py-12 md:px-[128px] xl:flex-1 xl:pb-[128px] xl:pl-0 xl:pr-[128px] xl:pt-[56px]"
          >
            <div className="border-b border-[#FB9678] pb-1 xl:mx-auto xl:w-full xl:max-w-[361px] xl:pb-2">
              <h2 className="text-[20px] font-extrabold tracking-[0.02em] text-[#2E3437] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] xl:text-center xl:text-[24px]">
                {/* 変更理由: Figma（1783:5213）の最新文言に合わせ、Googleフォーム誘導であることを見出しで明確化します。 */}
                Googleフォームでのお問い合せ
              </h2>
            </div>
            {/* 変更理由: Figma更新で見出し下の説明文が Body/M 指定になったため、サイズと行間を 13px / 1.9 に統一します。 */}
            <p className="mt-2 text-[13px] leading-[1.9] tracking-[0.02em] text-[#4B5459] xl:mt-3 xl:text-center xl:text-[13px]">
              {/* 変更理由: PC/SP共通でFigmaの説明文に統一し、表記ゆれ（Google Forms）を解消します。 */}
              メール以外のお問い合せはこちらから行うことができます。
              <br />
              （Googleフォームに遷移します。）
            </p>
            <div className="mt-3 flex justify-center xl:mt-5 xl:pb-[20px]">
              <a
                href={contactFormUrl}
                // 枠線ボタンはFigmaのマウスオーバー仕様に合わせ、オレンジ塗りへ300msで遷移させます。
                className="inline-flex items-center gap-2 rounded-full border border-[#FB9678] bg-[#F9F9F9] px-8 py-4 text-[13px] font-medium text-[#4B5459] shadow-[0_0_8px_rgba(106,115,120,0.1)] transition-[background-color,color,border-color] duration-300 ease-in-out hover:bg-[#D3793D] hover:text-[#F9F9F9] xl:min-h-[56px] xl:px-[56px] xl:py-[24px]"
              >
                お問い合せフォーム
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M14 5H19V10"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 14L19 5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5 7V19H17"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </section>
        </div>
      </div>
      </div>
      <Footer />
    </div>

  );
}
