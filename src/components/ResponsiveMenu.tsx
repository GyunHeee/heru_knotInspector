"use client"

import Link from "next/link"
import { useState } from "react"

export type ResponsiveMenuLink = {
  href: string
  label: string
  badgeCount?: number
}

type ResponsiveMenuProps = {
  links: ResponsiveMenuLink[]
  title?: string
}

// 작은 화면에서 주요 이동 링크를 햄버거 메뉴로 보여주는 컴포넌트입니다.
export default function ResponsiveMenu({ links, title = "메뉴" }: ResponsiveMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="메뉴 열기"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="soft-press inline-flex h-14 w-14 items-center justify-center rounded-[1rem] border border-knot-sand bg-white/90 text-knot-ink shadow-card"
      >
        <span className="flex flex-col gap-1.5">
          <span className="h-0.5 w-6 rounded-full bg-current" />
          <span className="h-0.5 w-6 rounded-full bg-current" />
          <span className="h-0.5 w-6 rounded-full bg-current" />
        </span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 bg-knot-ink/35 px-4 py-4 backdrop-blur-sm">
          <div className="ml-auto w-full max-w-xs rounded-[1.1rem] border border-knot-sand bg-knot-ivory p-4 shadow-knot">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-knot-brown">바로가기</p>
                <h2 className="text-xl font-black text-knot-ink">{title}</h2>
              </div>
              <button
                type="button"
                aria-label="메뉴 닫기"
                onClick={() => setIsOpen(false)}
                className="soft-press inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-knot-brown"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="soft-press inline-flex min-h-14 items-center justify-between rounded-[0.95rem] border border-knot-sand bg-white px-4 py-3 text-lg font-bold text-knot-ink"
                >
                  <span>{link.label}</span>
                  {link.badgeCount && link.badgeCount > 0 ? (
                    <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-fail px-2 py-1 text-sm font-black text-white">
                      {link.badgeCount}
                    </span>
                  ) : (
                    <span className="text-knot-brown">›</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
