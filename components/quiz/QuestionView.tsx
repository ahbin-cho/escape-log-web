"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/quiz/questions";

const OPTION =
  "w-full rounded-xl border-2 border-edge/40 bg-ink px-4 py-3 text-left text-sm font-bold text-cream/80 transition hover:border-edge active:scale-[0.98]";

// 형식(choice·binary·slider)에 맞춰 한 문항을 그린다.
// 부모가 key={question.id} 로 넘겨야 슬라이더 상태가 문항마다 초기화된다.
export default function QuestionView({
  question,
  initial,
  onAnswer,
}: {
  question: QuizQuestion;
  initial?: number;
  onAnswer: (answer: number) => void;
}) {
  const [level, setLevel] = useState(initial ?? 3);

  return (
    <div className="rough rounded-2xl border-2 border-edge bg-panel p-6 shadow-cute">
      <h1 className="text-lg leading-snug [word-break:keep-all]">
        {question.prompt}
      </h1>

      {question.format === "choice" && (
        <div className="mt-5 space-y-2.5">
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => onAnswer(i)}
              aria-pressed={initial === i}
              className={`${OPTION} ${initial === i ? "border-edge" : ""}`}
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
              className={`flex min-h-[112px] items-center justify-center rounded-2xl border-2 bg-ink px-4 py-5 text-center text-base font-extrabold transition [word-break:keep-all] hover:border-edge hover:bg-candy/10 active:scale-[0.98] ${
                initial === i ? "border-edge" : "border-edge/40"
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
