import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AdminLoginClient from "@/components/AdminLoginClient"
import { ADMIN_SESSION_COOKIE, isAdminAuthenticatedFromCookie } from "@/lib/adminAuth"

export default function AdminLoginPage() {
  const cookieStore = cookies()
  const isAuthenticated = isAdminAuthenticatedFromCookie(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)

  if (isAuthenticated) {
    redirect("/admin")
  }

  return (
    <main className="min-h-screen bg-transparent px-4 py-6 sm:px-5 sm:py-8 md:px-8 md:py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <section className="knot-panel rounded-[1.2rem] p-6 md:p-8">
          <div className="inline-flex rounded-full bg-knot-red/10 px-4 py-2 text-sm font-bold text-knot-red">
            관리자 전용
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-knot-ink md:text-5xl">관리자 로그인</h1>
          <p className="mt-3 text-lg text-knot-brown">
            관리자 메뉴는 로그인한 계정에서만 확인할 수 있습니다. 데모 계정으로 로그인해 주세요.
          </p>
          <div className="mt-5 rounded-[1rem] bg-knot-paper px-4 py-4 text-base text-knot-brown">
            <p className="font-semibold text-knot-ink">데모 계정</p>
            <p className="mt-1">ID: admin</p>
            <p>PW: admin1234!</p>
          </div>
        </section>

        <AdminLoginClient />
      </div>
    </main>
  )
}
