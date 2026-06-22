"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

// 데모용 관리자 로그인 폼을 처리하는 클라이언트 컴포넌트입니다.
export default function AdminLoginClient() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const payload = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(payload.error ?? "로그인에 실패했습니다.")
      }

      router.push("/admin")
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "로그인에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[1.1rem] border border-knot-sand bg-white/92 p-5 shadow-card md:p-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="admin-username" className="block text-base font-semibold text-knot-brown">
            관리자 아이디
          </label>
          <input
            id="admin-username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mt-2 min-h-14 w-full rounded-[0.95rem] border border-knot-sand bg-knot-ivory px-4 py-3 text-lg text-knot-ink outline-none transition focus:border-knot-red"
            placeholder="아이디를 입력하세요"
            autoComplete="username"
          />
        </div>

        <div>
          <label htmlFor="admin-password" className="block text-base font-semibold text-knot-brown">
            비밀번호
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 min-h-14 w-full rounded-[0.95rem] border border-knot-sand bg-knot-ivory px-4 py-3 text-lg text-knot-ink outline-none transition focus:border-knot-red"
            placeholder="비밀번호를 입력하세요"
            autoComplete="current-password"
          />
        </div>
      </div>

      {error ? <p className="mt-4 text-base font-semibold text-fail">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting || username === "" || password === ""}
        className="soft-press mt-5 flex min-h-16 w-full items-center justify-center rounded-[1rem] bg-knot-ink px-6 py-4 text-xl font-bold text-white hover:bg-knot-brown disabled:cursor-not-allowed disabled:bg-knot-sand disabled:text-knot-brown"
      >
        {isSubmitting ? "로그인 중..." : "관리자 로그인"}
      </button>
    </form>
  )
}
