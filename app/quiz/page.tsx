"use client";

import { useEffect, useRef, useState } from "react";
import {
  getRecords,
  getCatalog,
  saveQuiz,
  type Recommendation,
} from "@/lib/store";
import {
  MASCOT,
  QUIZ_TYPES,
  determineType,
  focusTagsOf,
  loadLastVariants,
  pickQuestions,
  quizToTaste,
  recommendForQuiz,
  saveLastVariants,
  toValues,
  type QuizAnswers,
  type QuizQuestion,
  type QuizValues,
  type TypeId,
} from "@/lib/quiz";
import Loader from "@/components/Loader";
import QuestionView from "@/components/quiz/QuestionView";
import DoorProgress from "@/components/quiz/DoorProgress";
import QuizResult from "@/components/quiz/QuizResult";

type Phase = "quiz" | "analyzing" | "result";

interface Result {
  typeId: TypeId;
  values: QuizValues;
  brand: { name: string; reason: string } | null;
  recs: Recommendation[];
}

const ANALYZING_MSGS = [
  "취향을 분석하는 중…",
  "맞는 방을 고르는 중…",
  "유형을 맞춰 보는 중…",
];
const ANALYZING_MS = 1500;

export default function QuizPage() {
  // 질문은 마운트 뒤에 뽑는다(서버 렌더와 무작위 결과가 어긋나지 않게).
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [phase, setPhase] = useState<Phase>("quiz");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [result, setResult] = useState<Result | null>(null);
  const [msgIdx, setMsgIdx] = useState(0);
  const moved = useRef(false); // 첫 화면에서는 포커스를 건드리지 않는다
  const analyzing = useRef(false); // 마지막 문항 연타로 분석이 두 번 도는 것 방지

  useEffect(() => {
    setQuestions(pickQuestions(loadLastVariants()));
  }, []);

  useEffect(() => {
    if (phase !== "analyzing") return;
    const t = setInterval(
      () => setMsgIdx((i) => (i + 1) % ANALYZING_MSGS.length),
      500
    );
    return () => clearInterval(t);
  }, [phase]);

  if (!questions) return <Loader />;

  const q = questions[step];
  const lastStep = questions.length - 1;

  function choose(answer: number) {
    if (!questions || analyzing.current) return;
    moved.current = true;
    const next = { ...answers, [q.id]: answer };
    setAnswers(next);
    if (step < lastStep) setStep(step + 1);
    else runAnalysis(questions, next);
  }

  async function runAnalysis(asked: QuizQuestion[], finalAnswers: QuizAnswers) {
    const values = toValues(asked, finalAnswers);
    if (!values) return; // 빠진 답이 있으면 그 문항에 머문다
    analyzing.current = true;
    setPhase("analyzing");

    const typeId = determineType(values);
    const taste = quizToTaste(values);
    const focusTags = focusTagsOf(values);

    // 추천을 못 불러와도 유형 결과는 보여 준다.
    const loadRecs = async () => {
      try {
        const [records, catalog] = await Promise.all([getRecords(), getCatalog()]);
        const played = records.map((r) => r.themeName);
        return recommendForQuiz(catalog, values, played);
      } catch {
        return { recs: [], brand: null };
      }
    };
    const [{ recs, brand }] = await Promise.all([
      loadRecs(),
      new Promise((res) => setTimeout(res, ANALYZING_MS)),
    ]);

    try {
      saveQuiz({
        taste,
        focusTags,
        persona: {
          title: QUIZ_TYPES[typeId].title,
          emoji: MASCOT.emoji,
          blurb: QUIZ_TYPES[typeId].tagline,
          brand: brand ?? undefined,
        },
        typeId,
        values,
        savedAt: new Date().toISOString(),
      });
    } catch {
      // 저장 실패(저장소 차단)는 결과 표시를 막지 않는다.
    }
    saveLastVariants(asked.map((x) => x.id));

    setResult({ typeId, values, brand, recs });
    setPhase("result");
  }

  function restart() {
    analyzing.current = false;
    moved.current = false;
    setQuestions(pickQuestions(loadLastVariants()));
    setAnswers({});
    setStep(0);
    setResult(null);
    setPhase("quiz");
  }

  if (phase === "analyzing") {
    return (
      <div
        role="status"
        className="flex min-h-[50vh] flex-col items-center justify-center gap-5 text-center"
      >
        <div className="flex gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-3 w-3 animate-bounce rounded-full bg-candy"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="text-base font-extrabold">{ANALYZING_MSGS[msgIdx]}</p>
      </div>
    );
  }

  if (phase === "result" && result) {
    return <QuizResult {...result} onRestart={restart} />;
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <DoorProgress progress={step / lastStep} />
      <QuestionView
        key={q.id}
        question={q}
        initial={answers[q.id]}
        focusOnMount={moved.current}
        onAnswer={choose}
      />
      {step > 0 && (
        <button
          onClick={() => {
            moved.current = true;
            setStep(step - 1);
          }}
          className="rounded-lg px-1 py-2 text-sm font-bold text-cream/60 transition hover:text-cream"
        >
          ← 이전 질문
        </button>
      )}
    </div>
  );
}
