import type { Metadata } from "next";
import Link from "next/link";
import { MINI_QUIZZES, isMiniOpen, isMiniUpcoming } from "@/lib/mini/quizzes";
import type { MiniQuiz } from "@/lib/mini/types";
import { DEFAULT_OG_IMAGE } from "@/lib/site";

// 1분 미니 진단 모음. 열림 기간(openFrom/openUntil)이 날짜로 바뀌므로 한 시간마다 다시 그린다.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "1분 테스트",
  description:
    "질문 몇 개로 끝나는 방탈출 미니 테스트. 방탈 밸런스 게임, 공포방에서 나는 몇 분 버틸까 등 결과는 링크로 친구와 나눠 보세요.",
  alternates: { canonical: "/mini" },
  openGraph: {
    title: "방탈출 1분 테스트 | 방탈로그",
    description: "질문 몇 개로 끝나는 방탈출 미니 테스트. 너는 어떤 결과야?",
    url: "/mini",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function MiniListPage() {
  const now = new Date();
  const open = MINI_QUIZZES.filter((q) => isMiniOpen(q, now));
  const past = MINI_QUIZZES.filter((q) => !isMiniOpen(q, now) && !isMiniUpcoming(q, now));

  return (
    <div className="mx-auto max-w-md space-y-8">
      <header className="space-y-2 pt-2">
        <p className="text-xs font-extrabold tracking-[0.04em] text-candy">1분 테스트</p>
        <h1 className="text-[28px] leading-tight">가볍게 해 보는 미니 진단</h1>
        <p className="text-[15px] leading-relaxed text-cream/65 [word-break:keep-all]">
          질문 몇 개면 1분 안에 끝나요. 결과는 링크로 친구에게 보내 보세요.
        </p>
      </header>

      {open.length > 0 ? (
        <ul className="space-y-4">
          {open.map((q) => (
            <li key={q.slug}>
              <QuizCard quiz={q} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-3xl border-2 border-dashed border-edge/25 bg-panel p-6 text-center text-sm font-bold text-cream/70">
          지금은 열려 있는 테스트가 없어요. 곧 새 테스트로 돌아올게요.
        </p>
      )}

      <Link
        href="/quiz"
        className="group flex items-center gap-4 rounded-3xl border-2 border-edge bg-edge p-5 text-ink transition [@media(hover:hover){&:hover}]:-translate-y-0.5 [@media(hover:hover){&:hover}]:shadow-[3px_3px_0_0_#E49A4A]"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-extrabold tracking-[0.04em] text-candy">
            제대로 알고 싶다면
          </span>
          <span className="mt-1 block font-display text-lg leading-snug text-ink">
            방탈출 취향 찾기
          </span>
          <span className="mt-1 block text-sm leading-snug text-ink/65 [word-break:keep-all]">
            16가지 유형 진단과 나에게 맞는 테마 추천까지
          </span>
        </span>
        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-ink/60 transition group-hover:translate-x-0.5 group-hover:text-ink" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      </Link>

      {past.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm text-cream/70">지난 테스트</h2>
          <ul className="divide-y divide-edge/10 rounded-2xl border border-edge/15 bg-panel">
            {past.map((q) => (
              <li key={q.slug}>
                <Link
                  href={`/mini/${q.slug}`}
                  className="flex items-center justify-between px-4 py-3 text-sm font-bold text-cream/70 hover:text-cream"
                >
                  {q.title}
                  <span aria-hidden className="text-cream/70">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function QuizCard({ quiz }: { quiz: MiniQuiz }) {
  return (
    <Link
      href={`/mini/${quiz.slug}`}
      className="group block overflow-hidden rounded-[26px] border-2 border-edge bg-panel transition [@media(hover:hover){&:hover}]:-translate-y-0.5 [@media(hover:hover){&:hover}]:shadow-[4px_4px_0_0_#1D1D1D]"
    >
      <div className="relative overflow-hidden bg-edge px-5 pb-5 pt-5 text-ink">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-2 -top-3 select-none font-display text-[64px] leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(245,240,230,0.16)]"
        >
          {quiz.mark}
        </span>
        <p className="text-[11px] font-extrabold tracking-[0.04em] text-candy">{quiz.kicker}</p>
        <p className="relative mt-2 font-display text-[22px] leading-tight text-ink [word-break:keep-all]">
          {quiz.title}
        </p>
      </div>
      <div className="flex items-center gap-3 px-5 py-4">
        <p className="min-w-0 flex-1 text-sm font-bold text-cream/70">
          질문 {quiz.questions.length}개 · 약 1분
        </p>
        <span className="flex items-center gap-1.5 rounded-full bg-candy px-4 py-2 text-sm font-extrabold text-edge transition group-hover:gap-2.5">
          시작
          <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
