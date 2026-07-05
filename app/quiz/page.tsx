"use client";

import { Fragment, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getRecords,
  getCatalog,
  recommend,
  saveQuiz,
  type Recommendation
} from "@/lib/store";
import {
  QUIZ,
  quizToTaste,
  focusTagsOf,
  quizPrefs,
  buildPersona,
  type QuizAnswers,
  type Persona
} from "@/lib/quiz";
import RecommendCard from "@/components/RecommendCard";

type Phase = "quiz" | "analyzing" | "result";

const ANALYZING_MSGS = [
  "취향을 분석하는 중…",
  "맞는 방을 고르는 중…",
  "매칭 점수를 계산하는 중…"
];

export default function QuizPage() {
  const [phase, setPhase] = useState<Phase>("quiz");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [persona, setPersona] = useState<Persona | null>(null);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [msgIdx, setMsgIdx] = useState(0);

  const q = QUIZ[step];
  const progress = Math.round((step / QUIZ.length) * 100);

  function choose(optIdx: number) {
    const next = { ...answers, [q.id]: optIdx };
    setAnswers(next);
    if (step + 1 < QUIZ.length) {
      setStep(step + 1);
    } else {
      runAnalysis(next);
    }
  }

  async function runAnalysis(finalAnswers: QuizAnswers) {
    setPhase("analyzing");
    const taste = quizToTaste(finalAnswers);
    const focusTags = focusTagsOf(finalAnswers);
    const rulePersona = buildPersona(finalAnswers);
    const [records, catalog] = await Promise.all([getRecords(), getCatalog()]);
    const played = records.map((r) => r.themeName);
    const prefs = quizPrefs(finalAnswers);
    const result = recommend(catalog, taste, played, 4, focusTags, prefs);

    const labelOf = (id: string) => {
      const qq = QUIZ.find((x) => x.id === id);
      const idx = finalAnswers[id];
      return qq && idx != null ? (qq.options[idx]?.label ?? "") : "";
    };
    const payload = {
      profile: {
        선호장르: labelOf("genre"),
        공포도: labelOf("fear"),
        난이도: labelOf("difficulty"),
        중요요소: labelOf("focus"),
        동행스타일: labelOf("party"),
        힌트성향: labelOf("hint"),
        플레이스타일: labelOf("activity"),
        분위기: labelOf("atmosphere"),
        시간선호: labelOf("time")
      },
      recs: result.map((r) => ({
        name: r.name,
        genre: r.genre,
        difficulty: r.difficulty,
        fearLevel: r.fearLevel
      }))
    };

    const aiCall = fetch("/api/persona", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((r) => r.json())
      .catch(() => null);

    const [aiRes] = await Promise.all([
      aiCall,
      new Promise((res) => setTimeout(res, 1900))
    ]);

    const finalPersona =
      aiRes && aiRes.enabled && aiRes.persona
        ? { ...aiRes.persona, brand: rulePersona.brand }
        : rulePersona;

    saveQuiz({
      taste,
      focusTags,
      persona: finalPersona,
      answers: finalAnswers,
      savedAt: new Date().toISOString()
    });

    setPersona(finalPersona);
    setRecs(result);
    setPhase("result");
  }

  useEffect(() => {
    if (phase !== "analyzing") return;
    const t = setInterval(
      () => setMsgIdx((i) => (i + 1) % ANALYZING_MSGS.length),
      650
    );
    return () => clearInterval(t);
  }, [phase]);

  function restart() {
    setAnswers({});
    setStep(0);
    setPersona(null);
    setRecs([]);
    setPhase("quiz");
  }

  // ── 분석 중 ──
  if (phase === "analyzing") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5 text-center">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-3 w-3 animate-bounce rounded-full bg-candy"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="text-base font-extrabold">{ANALYZING_MSGS[msgIdx]}</p>
        <p className="text-sm text-cream/55">잠시만 기다려주세요</p>
      </div>
    );
  }

  // ── 결과 ──
  if (phase === "result" && persona) {
    return (
      <div className="space-y-8">
        <section className="rough rounded-2xl border-2 border-edge bg-panel p-6 shadow-cute">
          <p className="text-xs text-cream/60">취향 진단 결과</p>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-extrabold">
            <span className="text-3xl">{persona.emoji}</span>
            {persona.title}
          </h1>
          <p className="mt-3 leading-relaxed text-cream/60">{persona.blurb}</p>
          {persona.brand && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border-2 border-edge bg-ink p-3">
              <span className="shrink-0 rounded-md border-2 border-edge bg-candy px-2 py-0.5 text-xs font-extrabold text-white">
                {persona.brand.name}
              </span>
              <span className="text-sm font-bold text-cream/70">
                이 브랜드가 잘 맞아요 · {persona.brand.reason}
              </span>
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-extrabold">추천 테마</h2>
            <span className="text-xs text-cream/55">
              스포 수위는 카드마다 조절 가능
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {recs.map((r) => (
              <RecommendCard key={r.id} rec={r} />
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={restart}
            className="rough rounded-xl border-2 border-edge bg-panel px-4 py-2 text-sm font-bold transition active:scale-[0.97]"
          >
            다시 진단
          </button>
          <Link
            href="/region"
            className="rough rounded-xl border-2 border-edge bg-panel px-4 py-2 text-sm font-bold transition active:scale-[0.97]"
          >
            🗺️ 지역별 테마
          </Link>
          <Link
            href="/taste"
            className="rough rounded-xl border-2 border-edge bg-candy px-4 py-2 text-sm font-bold text-white shadow-cute transition active:scale-[0.97]"
          >
            취향 페이지로
          </Link>
        </div>
      </div>
    );
  }

  // ── 퀴즈 ──
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-center gap-1 px-3 pb-6 pt-2">
        {QUIZ.map((_, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <Fragment key={i}>
              {/* 노드 — 현재 질문은 열쇠, 나머지는 링 */}
              <div className="relative flex shrink-0 flex-col items-center">
                {current ? (
                  <Image
                    src="/key.png"
                    alt="현재 질문"
                    width={44}
                    height={44}
                    priority
                    className="pointer-events-none h-10 w-10 -rotate-12 object-contain drop-shadow-sm"
                  />
                ) : (
                  <div
                    className={`rounded-full bg-transparent transition-all duration-300 ${
                      done
                        ? "h-4 w-4 border-2 border-candy"
                        : "h-3.5 w-3.5 border-2 border-cream/25"
                    }`}
                  />
                )}
                <span
                  className={`absolute top-full mt-1 whitespace-nowrap text-[10px] font-bold ${
                    current
                      ? "text-candy"
                      : done
                        ? "text-candy/70"
                        : "text-cream/35"
                  }`}
                >
                  {current ? "현재 질문" : i + 1}
                </span>
              </div>

              {/* 노드 뒤 진행선 — 지나온 길만 주황 */}
              {i < QUIZ.length - 1 && (
                <div
                  className={`min-w-[10px] flex-1 transition-all duration-500 ${
                    i < step
                      ? "h-[2px] rounded-full bg-candy"
                      : "border-t-2 border-dotted border-cream/25"
                  }`}
                />
              )}
            </Fragment>
          );
        })}

        {/* 마지막 진행선 + 탈출문 */}
        <div className="min-w-[10px] flex-1 border-t-2 border-dotted border-cream/25 transition-all duration-500" />
        <div className="relative flex shrink-0 flex-col items-center">
          <Image
            src={step === QUIZ.length - 1 ? "/door-open.png" : "/door.png"}
            alt="탈출문"
            width={56}
            height={56}
            priority
            className={`h-12 w-12 object-contain transition-all duration-500 ${
              step === QUIZ.length - 1 ? "scale-110" : "scale-100"
            }`}
          />
          <span className="absolute top-full mt-1 whitespace-nowrap text-[10px] font-bold text-candy">
            탈출 완료!
          </span>
        </div>
      </div>

      <div className="rough rounded-2xl border-2 border-edge bg-panel p-6 shadow-cute">
        <h1 className="text-lg font-extrabold">
          <span className="mr-1">{q.emoji}</span>
          {q.prompt}
        </h1>
        <div className="mt-5 space-y-2.5">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => choose(i)}
              className="flex w-full items-center gap-3 rounded-xl border-2 border-edge/40 bg-ink px-4 py-3 text-left transition hover:border-edge active:scale-[0.98]"
            >
              <span className="text-xl">{opt.emoji}</span>
              <span className="text-sm font-bold text-cream/80">
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {step > 0 && (
        <button
          onClick={() => setStep(step - 1)}
          className="text-sm font-bold text-cream/60 transition hover:text-cream/60"
        >
          ← 이전 질문
        </button>
      )}
    </div>
  );
}
