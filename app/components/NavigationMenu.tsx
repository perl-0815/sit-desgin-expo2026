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
  onClose?: () => void
}

// Figmaの右上メニューを共通コンポーネントとして再利用できるように切り出しています。
export default function NavigationMenu({
  className,
  items,
  activeId,
  onClose,
}: NavigationMenuProps) {
  return (
    <div
      className={
        className ??
        "relative flex h-[852px] w-[393px] flex-col items-start bg-[#F9F9F9] pt-[62px]"
      }
    >
      {/* 研究ページのメニューボタンと同じ位置（右16px・上24px）に固定します。 */}
      <button
        type="button"
        onClick={onClose}
        aria-label="メニューを閉じる"
        className="absolute right-4 top-6 grid h-12 w-12 place-items-center"
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
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* メニュー項目は各行24pxの上下余白で区切り、区切り線は薄いグレーで統一します。 */}
      <nav className="flex h-[710px] w-full flex-col">
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
              className="flex w-full items-center justify-center border-b border-[#EBEEF0] px-[10px] py-6"
            >
              {/* アクティブ項目は下線2pxと濃い文字色で強調します。 */}
              <span
                className={`px-4 py-1 ${
                  isActive ? "border-b-2 border-[#FB9678]" : ""
                }`}
              >
                <span
                  className={`text-[24px] font-extrabold tracking-[0.48px] [font-family:var(--font-shippori-mincho-b1),'Hiragino_Mincho_ProN',serif] ${
                    isActive ? "text-[#2E3437]" : "text-[#6A7378]"
                  }`}
                >
                  {item.label}
                </span>
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
