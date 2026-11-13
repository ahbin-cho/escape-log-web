"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { miniBySlug, miniResult } from "@/lib/mini/quizzes";
import { scoreMini } from "@/lib/mini/score";
import type { MiniQuiz } from "@/lib/mini/types";
import MiniResultCard from "./MiniResultCard";
import MiniShareButton from "./MiniShareButton";
import s from "./mini.module.css";

type Stage = "intro" | "question" | "result";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

function pathOf(slug: string, key?: string) {
  return key ? `/mini/${slug}?r=${encodeURIComponent(key)}` : `/mini/${slug}`;
}

// 미니 진단 진행 화면: 시작 → 한 화면에 한 문제 → 결과.
// 주소에 ?r= 가 붙어 들어오면(공유 링크) 결과부터 보여 준다.
export default function MiniQuizClient({
  slug,
  initialKey,
}: {
  slug: string;
  initialKey?: string | null;
}) {
  const quiz = miniBySlug(slug) as MiniQuiz;
  const linked = miniResult(quiz, initialKey);

  const [stage, setStage] = useState<Stage>(linked ? "result" : "intro");
  const [answers, setAnswers] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [resultKey, setResultKey] = useState<string | null>(linked?.key ?? null);
  // 링크로 들어와서 본 결과인지(버튼 문구가 달라진다)
  const [fromLink, setFromLink] = useState(!!linked);
  const busy = useRef(false);
  const top = useRef<HTMLDivElement>(null);

  const idx = answers.length;
  const total = quiz.questions.length;

  useEffect(() => {
    // 화면이 바뀌면 맨 위로(폰에서 결과 카드가 아래에서 시작하지 않게)
    const el = top.current;
    if (stage === "result" || (el && el.getBoundingClientRect().top < 0)) {
      window.scrollTo({ top: 0 });
    }
  }, [stage, idx]);

  function start() {
    setAnswers([]);
    setPicked(null);
    setResultKey(null);
    setFromLink(false);
    setStage("question");
    window.history.replaceState(null, "", pathOf(slug));
  }

  function choose(i: number) {
    if (busy.current) return;
    busy.current = true;
    setPicked(i);
    // 고른 칸이 잠깐 표시된 뒤 다음으로
    window.setTimeout(() => {
      const next = [...answers, i];
      setPicked(null);
      busy.current = false;
      if (next.length < total) {
        setAnswers(next);
        return;
      }
      const key = scoreMini(quiz, next);
      setAnswers(next);
      setResultKey(key);
      setStage("result");
      if (key) window.history.replaceState(null, "", pathOf(slug, key));
    }, 240);
  }

  function back() {
    if (busy.current) return;
    if (idx === 0) setStage("intro");
    else setAnswers(answers.slice(0, -1));
  }

  return (
    <div ref={top} className="mx-auto max-w-md">
      {stage === "intro" && <Intro quiz={quiz} onStart={start} />}

      {stage === "question" && (
        <div className="min-h-[64vh]">
          <div className="mb-7">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={back}
                className="-ml-2 flex min-h-[44px] items-center gap-1 rounded-lg px-2 text-sm font-bold text-cream/70 transition hover:text-cream"
              >
                <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                이전
              </button>
              <p className="text-sm font-extrabold tabular-nums tracking-wide">
                {String(idx + 1).padStart(2, "0")}
                <span className="text-cream/70"> / {String(total).padStart(2, "0")}</span>
              </p>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-edge/10"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={idx + 1}
              aria-label="진행"
            >
              <div
                className="h-full rounded-full bg-candy transition-[width] duration-500 ease-out"
                style={{ width: `${((idx + 1) / total) * 100}%` }}
              />
            </div>
          </div>

          <Question
            key={idx}
            quiz={quiz}
            index={idx}
            picked={picked}
            onChoose={choose}
          />
        </div>
      )}

      {stage === "result" && resultKey && (
        <ResultScreen
          quiz={quiz}
          resultKey={resultKey}
          fromLink={fromLink}
          onRestart={start}
        />
      )}
    </div>
  );
}

function Intro({ quiz, onStart }: { quiz: MiniQuiz; onStart: () => void }) {
  return (
    <div className={s.pop}>
      <div className="overflow-hidden rounded-[28px] border-2 border-edge bg-panel shadow-[5px_5px_0_0_#1D1D1D]">
        <div className="relative overflow-hidden bg-edge px-6 pb-8 pt-7 text-ink">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-3 -top-4 select-none font-display text-[88px] leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(245,240,230,0.16)]"
          >
            {quiz.mark}
          </span>
          <p className="text-xs font-extrabold tracking-[0.04em] text-candy">
            1분 테스트 · {quiz.kicker}
          </p>
          <h1 className="relative mt-3 text-[28px] leading-tight text-ink [word-break:keep-all]">
            {quiz.title}
          </h1>
        </div>
        <div className="space-y-6 px-6 pb-6 pt-6">
          <p className="text-[15px] leading-relaxed text-cream/75 [word-break:keep-all]">
            {quiz.intro}
          </p>
          <ul className="flex gap-2 text-xs font-bold text-cream/70">
            <li className="rounded-full border border-edge/15 bg-ink px-3 py-1.5">
              질문 {quiz.questions.length}개
            </li>
            <li className="rounded-full border border-edge/15 bg-ink px-3 py-1.5">약 1분</li>
            <li className="rounded-full border border-edge/15 bg-ink px-3 py-1.5">
              결과 {quiz.results.length}가지
            </li>
          </ul>
          <button
            type="button"
            onClick={onStart}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-edge bg-candy px-5 py-4 text-base font-extrabold text-edge shadow-[3px_3px_0_0_#1D1D1D] transition [@media(hover:hover){&:hover}]:-translate-y-px active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            시작하기
            <Arrow />
          </button>
        </div>
      </div>
      <p className="mt-5 text-center text-xs font-bold text-cream/70">
        고른 답은 저장하지 않아요. 결과만 링크로 나눌 수 있어요.
      </p>
    </div>
  );
}

function Question({
  quiz,
  index,
  picked,
  onChoose,
}: {
  quiz: MiniQuiz;
  index: number;
  picked: number | null;
  onChoose: (i: number) => void;
}) {
  const q = quiz.questions[index];
  const versus = quiz.layout === "versus";

  return (
    <div className={s.enter}>
      <p className="text-xs font-extrabold tracking-[0.04em] text-candy">
        Q{index + 1}
      </p>
      <h2 className="mt-2 text-[26px] leading-snug [word-break:keep-all]">{q.prompt}</h2>

      {versus ? (
        <div className={`mt-7 flex flex-col ${s.stagger}`}>
          {q.options.map((o, i) => (
            <Fragment key={i}>
              {i > 0 && (
                <div className="relative z-10 -my-3 flex justify-center" aria-hidden>
                  <span className="rounded-full border-2 border-edge bg-ink px-3 py-1 font-display text-xs tracking-widest">
                    VS
                  </span>
                </div>
              )}
              <OptionButton
                letter={LETTERS[i]}
                label={o.label}
                sub={o.sub}
                selected={picked === i}
                dimmed={picked !== null && picked !== i}
                big
                onClick={() => onChoose(i)}
              />
            </Fragment>
          ))}
        </div>
      ) : (
        <div className={`mt-7 space-y-2.5 ${s.stagger}`}>
          {q.options.map((o, i) => (
            <OptionButton
              key={i}
              letter={LETTERS[i]}
              label={o.label}
              sub={o.sub}
              selected={picked === i}
              dimmed={picked !== null && picked !== i}
              onClick={() => onChoose(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OptionButton({
  letter,
  label,
  sub,
  selected,
  dimmed,
  big,
  onClick,
}: {
  letter: string;
  label: string;
  sub?: string;
  selected: boolean;
  dimmed: boolean;
  big?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "group flex w-full items-center gap-4 border-2 border-edge text-left transition duration-200",
        big ? "min-h-[118px] rounded-3xl px-5 py-5" : "rounded-2xl px-4 py-4",
        selected
          ? "bg-edge text-ink shadow-none"
          : "bg-panel [@media(hover:hover){&:hover}]:-translate-y-0.5 [@media(hover:hover){&:hover}]:shadow-[3px_3px_0_0_#1D1D1D] active:translate-y-0 active:shadow-none",
        dimmed ? "opacity-40" : "",
      ].join(" ")}
    >
      <span
        className={[
          "flex shrink-0 items-center justify-center rounded-full border-2 font-display transition",
          big ? "h-10 w-10 text-base" : "h-8 w-8 text-sm",
          selected
            ? "border-candy bg-candy text-edge"
            : "border-edge/20 bg-ink text-cream/70 group-hover:border-edge",
        ].join(" ")}
      >
        {letter}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block font-extrabold leading-snug [word-break:keep-all] ${
            big ? "text-[19px]" : "text-[16px]"
          }`}
        >
          {label}
        </span>
        {sub && (
          <span
            className={`mt-1 block text-sm leading-snug [word-break:keep-all] ${
              selected ? "text-ink/70" : "text-cream/70"
            }`}
          >
            {sub}
          </span>
        )}
      </span>
    </button>
  );
}

function ResultScreen({
  quiz,
  resultKey,
  fromLink,
  onRestart,
}: {
  quiz: MiniQuiz;
  resultKey: string;
  fromLink: boolean;
  onRestart: () => void;
}) {
  const result = miniResult(quiz, resultKey);
  if (!result) return null;
  const path = pathOf(quiz.slug, result.key);

  return (
    <div className="space-y-6">
      <div className={s.pop}>
        <MiniResultCard
          quiz={quiz}
          result={result}
          eyebrow={fromLink ? `친구가 받은 결과 · ${quiz.kicker}` : `나의 결과 · ${quiz.kicker}`}
        />
      </div>

      <div className={`space-y-2 ${s.enter}`}>
        {fromLink ? (
          <button
            type="button"
            onClick={onRestart}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-edge bg-candy px-5 py-4 text-[15px] font-extrabold text-edge shadow-[3px_3px_0_0_#1D1D1D] transition [@media(hover:hover){&:hover}]:-translate-y-px active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            나도 해 보기
            <Arrow />
          </button>
        ) : (
          <>
            <MiniShareButton
              path={path}
              title={`${quiz.title} · ${result.title}`}
              text={`나는 ‘${result.title}’ 나왔어. ${result.oneLiner} 너는?`}
            />
            <button
              type="button"
              onClick={onRestart}
              className="w-full rounded-2xl px-5 py-2 text-sm font-bold text-cream/70 transition hover:text-cream"
            >
              처음부터 다시 하기
            </button>
          </>
        )}
      </div>

      <FullQuizCta />

      <p className="text-center">
        <Link
          href="/mini"
          className="text-sm font-bold text-cream/70 underline decoration-edge/20 underline-offset-4 transition hover:text-cream"
        >
          다른 1분 테스트 보기
        </Link>
      </p>
    </div>
  );
}

function FullQuizCta() {
  return (
    <Link
      href="/quiz"
      className="group flex items-center gap-4 rounded-3xl border-2 border-edge bg-panel p-5 transition [@media(hover:hover){&:hover}]:-translate-y-0.5 [@media(hover:hover){&:hover}]:shadow-[3px_3px_0_0_#1D1D1D]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/mascot.png" alt="" width={56} height={56} className="h-14 w-14 shrink-0 object-contain" />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-extrabold tracking-[0.04em] text-candy">
          더 정확하게 알고 싶다면
        </span>
        <span className="mt-1 block font-display text-[17px] leading-snug">방탈출 취향 찾기</span>
        <span className="mt-1 block text-sm leading-snug text-cream/70 [word-break:keep-all]">
          16가지 유형 중 내 유형과, 공포도·난이도까지 맞춘 테마 추천
        </span>
      </span>
      <span className="shrink-0 text-cream/70 transition group-hover:translate-x-0.5 group-hover:text-cream">
        <Arrow />
      </span>
    </Link>
  );
}

function Arrow() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}
