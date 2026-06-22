"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

// 관리자 세션을 종료하고 로그인 화면으로 이동시키는 버튼입니다.
export default function AdminLogoutButton() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogout = async () => {
    setIsSubmitting(true)

    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      })
      router.push("/admin/login")
      router.refresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
      disabled={isSubmitting}
      className="soft-press inline-flex min-h-14 items-center justify-center rounded-[0.95rem] border border-knot-sand bg-white/90 px-5 py-3 text-base font-bold text-knot-ink hover:border-knot-red/40 hover:bg-knot-ivory disabled:cursor-not-allowed disabled:bg-knot-mist disabled:text-knot-brown"
    >
      {isSubmitting ? "로그아웃 중..." : "로그아웃"}
    </button>
  )
}
