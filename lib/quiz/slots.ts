import type { Genre } from "../store";

// ─────────────────────────────────────────────────────────────
// 취향 찾기의 "재는 것"(슬롯)과 그 값. 질문 문장이 바뀌어도
// 슬롯 값은 같으므로 유형 판정과 추천은 여기 값만 본다.
// ─────────────────────────────────────────────────────────────

export const DRAWS = ["thrill", "brain", "story", "explore"] as const;
export type Draw = (typeof DRAWS)[number];

export const PLAYS = ["rush", "analyze", "savor", "team"] as const;
export type Play = (typeof PLAYS)[number];

export const QUIZ_GENRES = ["공포", "추리", "감성", "모험", "SF", "코믹"] as const;
export type QuizGenre = (typeof QUIZ_GENRES)[number] & Genre;

export const ATMOSPHERES = ["dark", "bright", "grungy", "epic", "cute"] as const;
export type Atmosphere = (typeof ATMOSPHERES)[number];

export const TIME_PREFS = ["short", "normal", "long", "extra", "any"] as const;
export type TimePref = (typeof TIME_PREFS)[number];

// 인원 선호: 0 = 상관없음
export const PLAYER_PREFS = [1, 2, 4, 5, 0] as const;

export const SLOT_IDS = [
  "draw1",
  "draw2",
  "play1",
  "play2",
  "genre",
  "fear",
  "difficulty",
  "hint",
  "atmosphere",
  "players",
  "time",
] as const;
export type SlotId = (typeof SLOT_IDS)[number];

export type TypeId = `${Draw}-${Play}`;

// 한 회차의 답을 슬롯 값으로 환산한 결과.
export interface QuizValues {
  draw1: Draw;
  draw2: Draw;
  play1: Play;
  play2: Play;
  genre: QuizGenre;
  fear: number; // 1~5
  difficulty: number; // 1~5
  hint: number; // 1(안 씀)~5(바로 씀)
  atmosphere: Atmosphere;
  players: number; // 1 | 2 | 4 | 5 | 0
  time: TimePref;
  playBonus: Play[]; // 선택지가 준 플레이 방식 보조 점수(각 1점)
}

// 슬롯별로 허용되는 값인지 검사 (질문 데이터 검증용).
export function isValidSlotValue(slot: SlotId, value: string | number): boolean {
  switch (slot) {
    case "draw1":
    case "draw2":
      return (DRAWS as readonly string[]).includes(value as string);
    case "play1":
    case "play2":
      return (PLAYS as readonly string[]).includes(value as string);
    case "genre":
      return (QUIZ_GENRES as readonly string[]).includes(value as string);
    case "fear":
    case "difficulty":
    case "hint":
      return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5;
    case "atmosphere":
      return (ATMOSPHERES as readonly string[]).includes(value as string);
    case "players":
      return (PLAYER_PREFS as readonly number[]).includes(value as number);
    case "time":
      return (TIME_PREFS as readonly string[]).includes(value as string);
  }
}
