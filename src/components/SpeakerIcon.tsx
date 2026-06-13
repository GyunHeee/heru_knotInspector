// 음성 안내 상태를 보여주는 스피커 아이콘입니다.
export default function SpeakerIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M5 14H8L13 19V5L8 10H5V14Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M16 9C17.4 10.1 18 11.4 18 12C18 12.6 17.4 13.9 16 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18.8 6.5C21 8.2 22 10.4 22 12C22 13.6 21 15.8 18.8 17.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
