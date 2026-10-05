"use client";

import { useEffect, useRef, useState } from "react";
import type { QuizQuestion } from "@/lib/quiz/questions";

const OPTION =
  "w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-bold transition hover:border-edge active:scale-[0.98]";

// 형식(choice·binary·slider)에 맞춰 한 문항을 그린다.
// 부모가 key={question.id} 로 넘겨야 슬라이더 상태가 문항마다 초기화된다.
export default function QuestionView({
  question,
  initial,
  focusOnMount = false,
  onAnswer,
}: {
  question: QuizQuestion;
  initial?: number;
  focusOnMount?: boolean; // 문항이 바뀐 직후엔 제목으로 포커스를 옮긴다
  onAnswer: (answer: number) => void;
}) {
  const [level, setLevel] = useState(initial ?? 3);
  const heading = useRef<HTMLHeadingElement>(null);

  // 문항마다 새로 마운트되므로 눌렀던 버튼이 사라진다. 포커스가 페이지 맨 위로
  // 돌아가지 않게 새 질문 제목으로 옮긴다(스크린리더도 새 질문을 읽는다).
  useEffect(() => {
    if (focusOnMount) heading.current?.focus();
  }, [focusOnMount]);

  return (
    <div className="rough rounded-2xl border-2 border-edge bg-panel p-6 shadow-cute">
      <h1
        ref={heading}
        tabIndex={-1}
        className="text-lg leading-snug outline-none [word-break:keep-all]"
      >
        {question.prompt}
      </h1>

      {question.format === "choice" && (
        <div className="mt-5 space-y-2.5">
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => onAnswer(i)}
              aria-pressed={initial === i}
              className={`${OPTION} ${
                initial === i
                  ? "border-edge bg-candy/15 text-cream"
                  : "border-edge/40 bg-ink text-cream/80"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {question.format === "binary" && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => onAnswer(i)}
              aria-pressed={initial === i}
              className={`flex min-h-[112px] items-center justify-center rounded-2xl border-2 px-4 py-5 text-center text-base font-extrabold transition [word-break:keep-all] hover:border-edge hover:bg-candy/10 active:scale-[0.98] ${
                initial === i ? "border-edge bg-candy/15" : "border-edge/40 bg-ink"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {question.format === "slider" && (
        <div className="mt-6">
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            aria-label={question.prompt}
            aria-valuetext={`${level} / 5`}
            className="candy-range w-full"
          />
          <div className="mt-2 flex justify-between gap-4 text-xs font-bold text-cream/60">
            <span>{question.minLabel}</span>
            <span className="text-right">{question.maxLabel}</span>
          </div>
          <button
            onClick={() => onAnswer(level)}
            className="rough mt-5 w-full rounded-xl border-2 border-edge bg-candy px-4 py-3 text-sm font-extrabold text-white shadow-cute transition active:scale-[0.97]"
          >
            이걸로
          </button>
        </div>
      )}
    </div>
  );
}
