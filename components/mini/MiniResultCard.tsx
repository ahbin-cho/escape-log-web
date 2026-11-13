import Link from "next/link";
import type { MiniQuiz, MiniResult } from "@/lib/mini/types";

// 미니 진단 결과 카드. 위쪽 먹색 띠에 결과 이름, 아래에 설명·한 칸 수치·추천 링크.
export default function MiniResultCard({
  quiz,
  result,
  eyebrow,
}: {
  quiz: MiniQuiz;
  result: MiniResult;
  eyebrow: string;
}) {
  return (
    <article className="overflow-hidden rounded-[28px] border-2 border-edge bg-panel shadow-[6px_6px_0_0_#1D1D1D]">
      <div className="relative overflow-hidden bg-edge px-6 pb-7 pt-6 text-ink">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-3 -top-4 select-none font-display text-[88px] leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(245,240,230,0.16)]"
        >
          {quiz.mark}
        </span>
        <p className="text-xs font-extrabold tracking-[0.04em] text-candy">{eyebrow}</p>
        <h2 className="relative mt-3 text-[34px] leading-tight text-ink [word-break:keep-all]">
          {result.title}
        </h2>
        <p className="relative mt-2 text-[15px] font-bold leading-snug text-ink/75 [word-break:keep-all]">
          {result.oneLiner}
        </p>
      </div>

      <div className="space-y-5 px-6 pb-6 pt-6">
        <p className="text-[15px] leading-relaxed text-cream/80 [word-break:keep-all]">
          {result.desc}
        </p>

        {result.stat && (
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-ink px-4 py-3.5">
            <span className="shrink-0 text-xs font-extrabold text-cream/50">
              {result.stat.label}
            </span>
            <span className="text-right text-[15px] font-extrabold [word-break:keep-all]">
              {result.stat.value}
            </span>
          </div>
        )}

        <div className="border-t-2 border-dashed border-edge/15 pt-5">
          <p className="text-xs font-extrabold tracking-[0.04em] text-candy">이런 방 추천</p>
          <p className="mt-1.5 font-display text-lg leading-snug">{result.recommend.label}</p>
          <p className="mt-1 text-sm leading-snug text-cream/60 [word-break:keep-all]">
            {result.recommend.hint}
          </p>
          <Link
            href={result.recommend.href}
            className="mt-4 flex items-center justify-between rounded-2xl border-2 border-edge bg-panel px-4 py-3 text-sm font-extrabold transition [@media(hover:hover){&:hover}]:bg-edge [@media(hover:hover){&:hover}]:text-ink"
          >
            {result.recommend.cta}
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
