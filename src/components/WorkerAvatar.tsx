import { getWorkerInitials } from "@/lib/workerProfilesShared"

type WorkerAvatarProps = {
  name: string
}

// 작업자 이름 이니셜을 원형 아바타로 보여주는 컴포넌트입니다.
export default function WorkerAvatar({ name }: WorkerAvatarProps) {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-lg font-black text-white">
      {getWorkerInitials(name)}
    </div>
  )
}
