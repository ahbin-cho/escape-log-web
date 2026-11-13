import Link from "next/link";

// 홈 검색창 아래 조용한 배너 한 줄: 취향 진단으로 보낸다.
// (기록이 있는 사람에게는 HomeClient 가 이 자리 대신 '내 기록' 줄을 보여 준다)
export default function LoggedOutCTA() {
  return (
    <Link
      href="/quiz"
      className="flex items-center gap-3 rounded-[14px] bg-[#FFF3E6] px-4 py-3.5 transition active:scale-[0.99]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/mascot.png" alt="" width={44} height={44} className="h-11 w-11 shrink-0 object-contain" />
      <span className="min-w-0 flex-1">
        <b className="block text-[15px] font-extrabold">내 방탈 유형은?</b>
        <span className="block truncate text-[13px] text-cream/70">1분 진단하고 맞는 방 추천받기</span>
      </span>
      <Chevron className="text-[#C9762B]" />
    </Link>
  );
}

export function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}
