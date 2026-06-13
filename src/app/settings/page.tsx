import Link from "next/link"
import VoiceSettingsClient from "@/components/VoiceSettingsClient"

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 sm:px-5 sm:py-6 md:px-8 md:py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 md:gap-8">
        <VoiceSettingsClient />

        <div className="flex flex-wrap justify-end gap-4">
          <Link href="/" className="text-base font-semibold text-slate-500 underline-offset-4 hover:underline">
            검사 화면으로
          </Link>
        </div>
      </div>
    </main>
  )
}
