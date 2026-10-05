import { GENRES, type Genre, type TasteProfile } from "../store";
import {
  DRAWS,
  PLAYS,
  SLOT_IDS,
  type Draw,
  type Play,
  type QuizGenre,
  type QuizValues,
  type TypeId,
} from "./slots";
import {
  answerBonus,
  answerValue,
  type QuizAnswers,
  type QuizQuestion,
} from "./questions";

// ─────────────────────────────────────────────────────────────
// 답 → 슬롯 값 환산, 유형 판정, 추천에 넘길 값.
// 판정은 슬롯 값만 본다(어떤 변형 문장이 나왔는지는 쓰지 않는다).
// ─────────────────────────────────────────────────────────────

// 이번 회차에 뽑힌 질문과 답을 슬롯 값으로 환산. 빠진 답이 있으면 null.
// 매번 처음부터 다시 계산하므로 뒤로 가서 답을 바꿔도 점수가 쌓이지 않는다.
export function toValues(
  questions: QuizQuestion[],
  answers: QuizAnswers
): QuizValues | null {
  const out: Record<string, string | number> = {};
  const playBonus: Play[] = [];
  for (const q of questions) {
    const answer = answers[q.id];
    if (answer == null) return null;
    const value = answerValue(q, answer);
    if (value === undefined) return null;
    out[q.slot] = value;
    const bonus = answerBonus(q, answer);
    if (bonus) playBonus.push(bonus);
  }
  if (SLOT_IDS.some((slot) => !(slot in out))) return null;
  return { ...(out as unknown as Omit<QuizValues, "playBonus">), playBonus };
}

const GENRE_DRAW: Record<QuizGenre, Draw> = {
  공포: "thrill",
  추리: "brain",
  감성: "story",
  코믹: "story",
  모험: "explore",
  SF: "explore",
};

// 점수가 가장 높은 값. 동점이면 tieBreak 가 그 안에 있을 때 tieBreak, 아니면 정의 순서.
function top<T extends string>(
  order: readonly T[],
  scores: Record<T, number>,
  tieBreak: T
): T {
  const max = Math.max(...order.map((k) => scores[k]));
  if (scores[tieBreak] === max) return tieBreak;
  return order.find((k) => scores[k] === max)!;
}

export function determineDraw(v: QuizValues): Draw {
  const scores: Record<Draw, number> = { thrill: 0, brain: 0, story: 0, explore: 0 };
  scores[v.draw1] += 2;
  scores[v.draw2] += 2;
  scores[GENRE_DRAW[v.genre]] += 1;
  return top(DRAWS, scores, v.draw1);
}

export function determinePlay(v: QuizValues): Play {
  const scores: Record<Play, number> = { rush: 0, analyze: 0, savor: 0, team: 0 };
  scores[v.play1] += 2;
  scores[v.play2] += 2;
  for (const b of v.playBonus) scores[b] += 1;
  if (v.hint <= 2) scores.analyze += 1;
  else if (v.hint >= 4) scores.rush += 1;
  return top(PLAYS, scores, v.play1);
}

export function determineType(v: QuizValues): TypeId {
  return `${determineDraw(v)}-${determinePlay(v)}`;
}

/** 슬롯 값 → TasteProfile (recommend()와 친구 궁합이 그대로 사용) */
export function quizToTaste(v: QuizValues): TasteProfile {
  const genreCounts = GENRES.reduce(
    (acc, g) => ({ ...acc, [g]: 0 }),
    {} as Record<Genre, number>
  );
  genreCounts[v.genre] = 1;
  return {
    count: SLOT_IDS.length,
    topGenre: v.genre,
    genreCounts,
    fearComfort: v.fear,
    difficultyFit: v.difficulty,
  };
}

// 포커스 → 카탈로그 태그 매핑 (추천 보정용)
export const FOCUS_TAGS: Record<string, string[]> = {
  story: ["몰입", "스토리", "따뜻함", "편지", "힐링"],
  device: ["장치"],
  staging: ["청각연출", "배우연출", "귀신"],
  coop: ["협동", "가족"],
  cozy: ["아기자기", "힐링", "귀여움", "따뜻함", "디저트"],
};

const DRAW_FOCUS: Record<Draw, string> = {
  thrill: "staging",
  explore: "staging",
  brain: "device",
  story: "story",
};

export function focusTagsOf(v: QuizValues): string[] {
  const keys = [DRAW_FOCUS[determineDraw(v)]];
  const play = determinePlay(v);
  if (play === "team") keys.push("coop");
  if (play === "savor") keys.push("cozy");
  return [...new Set(keys.flatMap((k) => FOCUS_TAGS[k] ?? []))];
}

// 추천 점수 보정용 선호값 (크롤 데이터의 timeLimit·players 매칭)
export interface QuizPrefs {
  timePref: number; // 선호 분(0 = 상관없음)
  playersPref: number; // 선호 인원(0 = 상관없음)
}

const TIME_MINUTES: Record<QuizValues["time"], number> = {
  short: 40,
  normal: 60,
  long: 75,
  extra: 95,
  any: 0,
};

export function quizPrefs(v: QuizValues): QuizPrefs {
  return { timePref: TIME_MINUTES[v.time], playersPref: v.players };
}
