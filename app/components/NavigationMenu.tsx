// メニューを閉じるボタンのクリック処理に対応するため、クライアントコンポーネントとして定義します。
"use client"

import Link from "next/link"

type NavigationItem = {
  id: string
  label: string
  href: string
}

type NavigationMenuProps = {
  className?: string
  items: NavigationItem[]
  activeId?: string
  isVisible?: boolean
  onClose?: () => void
}

// Figmaの右上メニューを共通コンポーネントとして再利用できるように切り出しています。
export default function NavigationMenu({
  className,
  items,
  activeId,
  isVisible = true,
  onClose,
}: NavigationMenuProps) {
  return (
    <div
      onClick={(event) => {
        // 背景クリックで閉じる処理と競合しないよう、パネル内クリックは伝播を止めます。
        event.stopPropagation()
      }}
      className={
        className ??
        // 横幅はヘッダー本体と同じ基準に揃えるため、固定max幅を外して100%で追従させます。
        "mx-auto w-full"
      }
    >
      <div
        // 閉じる時に上端が浮いて見えないよう、Y方向の移動は使わずに
        // 高さ(grid-template-rows)と透明度(opacity)のみでロール開閉を表現します。
        className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isVisible
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        {/* 高さアニメーションのガタつきを防ぐため、内側にmin-h-0ラッパーを置きます。 */}
        <div className="min-h-0 rounded-[16px] bg-white/80 shadow-[0_0_8px_rgba(106,115,120,0.1)] backdrop-blur-[4px]">
          {/* Figma準拠の位置に合わせ、閉じるボタンはパネル内右上に固定します。 */}
          <div className="flex w-full justify-end px-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              aria-label="メニューを閉じる"
              className="grid h-12 w-12 place-items-center rounded-[24px] p-2"
            >
              <svg
                aria-hidden="true"
                className="h-8 w-8"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M6 6L18 18M18 6L6 18"
                  stroke="#6A7378"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* 各項目は高さ75px・左余白24pxで統一し、アクティブのみ橙ドットと橙文字を表示します。 */}
          <nav className="pb-2">
            {items.map((item) => {
              const isActive = item.id === activeId
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  // 同一ページへの遷移でもメニューを閉じるため、クリック時に明示的に閉じます。
                  onClick={() => {
                    if (onClose) onClose()
                  }}
                  className="group block h-[75px] px-6"
                >
                  <span className="flex h-full items-center gap-2 border-b border-[#EBEEF0] px-1">
                    <span
                      className={`h-2 w-2 rounded-full transition-opacity duration-300 ease-in-out ${
                        isActive
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100 group-active:opacity-100"
                      }`}
                      style={{
                        // PC版と同じ意匠で一貫させるため、指定グラデーションを8pxドットにも適用します。
                        background:
                          "linear-gradient(135deg, #FB9678 0%, #E5A967 100%)",
                      }}
                      aria-hidden="true"
                    />
                    <span className="px-2 py-1">
                      <span
                        className={`text-[16px] font-medium leading-[2.2] tracking-[0.64px] transition-colors duration-300 ease-in-out ${
                          isActive
                            ? "text-[#D3793D]"
                            : "text-[#6A7378] group-hover:text-[#6A7378] group-active:text-[#6A7378]"
                        }`}
                      >
                        {item.label}
                      </span>
                    </span>
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
