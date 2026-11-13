import Link from "next/link";

// 취향 진단으로 가는 조용한 한 줄(옅은 주황 바탕 + 탈출귀).
export default function QuizRow({
  title,
  sub,
  href = "/quiz",
  className = "",
}: {
  title: string;
  sub: string;
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-[14px] bg-[#FFF3E6] px-4 py-3.5 transition active:scale-[0.99] ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/mascot.png" alt="" width={42} height={42} className="h-[42px] w-[42px] shrink-0 object-contain" />
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-extrabold">{title}</span>
        <span className="block text-[13px] text-cream/60 [word-break:keep-all]">{sub}</span>
      </span>
      <span aria-hidden className="font-extrabold text-[#A85A14]">
        ›
      </span>
    </Link>
  );
}
