"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { dispatchAdminSessionChangedEvent } from "@/lib/adminSessionClient"

// 관리자 세션을 종료하고 로그인 화면으로 이동시키는 버튼입니다.
export default function AdminLogoutButton() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadSession = async () => {
      try {
        const response = await fetch("/api/admin/session", {
          cache: "no-store",
        })

        if (!response.ok) {
          if (isMounted) {
            setIsAuthenticated(false)
          }
          return
        }

        const data: { isAuthenticated: boolean } = await response.json()

        if (isMounted) {
          setIsAuthenticated(data.isAuthenticated)
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false)
        }
      } finally {
        if (isMounted) {
          setIsCheckingSession(false)
        }
      }
    }

    void loadSession()

    return () => {
      isMounted = false
    }
  }, [])

  const handleLogout = async () => {
    setIsSubmitting(true)

    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      })
      setIsAuthenticated(false)
      dispatchAdminSessionChangedEvent()
      router.push("/")
      router.refresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCheckingSession || !isAuthenticated) {
    return null
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
