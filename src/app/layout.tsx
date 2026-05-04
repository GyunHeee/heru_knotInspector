import type { Metadata } from "next"
import "@/app/globals.css"

export const metadata: Metadata = {
  title: "매듭 품질 검사 MVP",
  description: "시니어 작업자를 위한 매듭 품질 검사 데모 웹앱",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
