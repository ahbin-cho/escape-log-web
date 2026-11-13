import type { MiniQuiz } from "./types";

// ─────────────────────────────────────────────────────────────
// 미니 진단 점수 계산(순수 함수). answers[i] = i번째 질문에서 고른 선택지 번호.
// 답이 모자라거나 범위를 벗어나면 null.
// ─────────────────────────────────────────────────────────────

function validAnswers(quiz: MiniQuiz, answers: number[]): boolean {
  return (
    answers.length === quiz.questions.length &&
    answers.every(
      (a, i) => Number.isInteger(a) && a >= 0 && a < quiz.questions[i].options.length
    )
  );
}

// 결과별 가산점 합계(kind: "type")
export function tally(quiz: MiniQuiz, answers: number[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of quiz.results) out[r.key] = 0;
  answers.forEach((a, i) => {
    const opt = quiz.questions[i]?.options[a];
    for (const [k, v] of Object.entries(opt?.to ?? {})) {
      if (k in out) out[k] += v;
    }
  });
  return out;
}

// 점수 합(kind: "scale")
export function totalScore(quiz: MiniQuiz, answers: number[]): number {
  return answers.reduce((s, a, i) => s + (quiz.questions[i]?.options[a]?.score ?? 0), 0);
}

export function scoreMini(quiz: MiniQuiz, answers: number[]): string | null {
  if (!validAnswers(quiz, answers)) return null;

  if (quiz.scoring.kind === "scale") {
    const total = totalScore(quiz, answers);
    let key: string | null = null;
    for (const t of quiz.scoring.tiers) if (total >= t.min) key = t.key;
    return key;
  }

  // 가장 높은 점수. 동점이면 results 에 먼저 적힌 결과.
  const scores = tally(quiz, answers);
  let best: string | null = null;
  for (const r of quiz.results) {
    if (best === null || scores[r.key] > scores[best]) best = r.key;
  }
  return best;
}
