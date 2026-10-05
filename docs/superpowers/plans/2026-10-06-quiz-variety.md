# 취향 찾기 개편 1단계 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 취향 찾기를 슬롯 11개 × 변형 3개(질문 33개) 풀에서 매번 다르게 뽑고, 결과를 고정 유형 16개 중 하나로 보여 준다.

**Architecture:** `lib/quiz.ts`를 `lib/quiz/` 폴더의 순수 모듈(슬롯 정의, 질문 데이터, 뽑기, 판정, 유형 데이터)로 나눈다. 화면은 "문항 → 선택 번호"만 들고 있다가 끝에서 한 번에 슬롯 값으로 환산하므로, 뒤로 가서 답을 바꿔도 점수가 중복되지 않는다. 기존 `recommend()`와 친구 궁합은 같은 `TasteProfile`을 받으므로 수정하지 않는다.

**Tech Stack:** Next.js 14.2 (App Router), React 18, TypeScript 5, Tailwind 3, vitest(신규, 개발 의존성)

**Spec:** `docs/superpowers/specs/2026-10-06-quiz-variety-design.md` — 질문 33개의 문장과 유형 16개의 이름·설명은 스펙이 원본이다. 이 계획의 코드와 스펙이 다르면 스펙을 따른다.

## Global Constraints

- 한 번에 묻는 문항은 11개(슬롯마다 1개). 화면에 문항 수 숫자를 그리지 않는다.
- 첫 문항은 항상 `draw1` 슬롯.
- `binary` 형식은 `fear`·`difficulty`·`hint`·`time` 슬롯에만, `slider`는 `fear`·`difficulty`·`hint`에만 쓴다.
- 유형 ID는 `<draw>-<play>` (예: `thrill-rush`). 16개 모두 유효.
- 저장 키는 `escapelog:quiz:v1` 그대로. 직전 변형은 `escapelog:quiz:last-variants`.
- 유형 그림 경로는 `public/types/<유형ID>.jpg`. 없으면 탈출귀 이모지로 대체.
- `lib/ai.ts`, `app/api/persona/route.ts`, `recommend()`, `lib/match.ts`는 수정하지 않는다.
- 문구는 탈출귀 반말. 색·테두리는 기존 토큰(`candy`, `edge`, `panel`, `ink`, `cream`)과 `rough`·`shadow-cute` 클래스를 쓴다.
- `lib/quiz/` 안에서는 상대 경로로 import 한다(`../store`). vitest 가 `@/` 별칭 없이 돌 수 있게 하기 위해서다.
- 커밋은 `quiz-variety` 브랜치에. 커밋 메시지 끝에 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **뒤로 가서 답을 바꿈** → 마지막에 고른 답만 반영되고 플레이 방식 보조 점수가 두 번 들어가지 않는다. (Task 2 테스트)
2. **`localStorage`가 막혔거나 저장값이 깨짐**(사파리 개인정보 보호 모드, 손상된 JSON) → 퀴즈가 그대로 시작되고 직전 변형 제외만 건너뛴다. (Task 3 테스트)
3. **슬라이더 값이 범위를 벗어남**(0, 6, 소수) → 1~5로 잘리고, 뒤집는 문항도 1~5 안에 머문다. (Task 1 테스트)
4. **카탈로그·기록을 못 불러옴**(오프라인, Supabase 오류) → 분석 화면에 갇히지 않고 유형 결과는 보여 주며 추천 자리에는 안내 문구가 나온다. (Task 6 수동 확인 + try/catch)
5. **마지막 문항을 빠르게 두 번 누름** → 분석과 저장이 한 번만 일어난다. (Task 6 가드 + 수동 확인)

---

### Task 1: vitest 설정 + 슬롯 정의 + 질문 33개

**Files:**
- Modify: `package.json` (scripts, devDependencies)
- Create: `vitest.config.ts`
- Create: `lib/quiz/slots.ts`
- Create: `lib/quiz/questions.ts`
- Test: `lib/quiz/questions.test.ts`

**Interfaces:**
- Consumes: `Genre` 타입 (`lib/store.ts`)
- Produces:
  - `slots.ts`: `Draw`, `Play`, `QuizGenre`, `Atmosphere`, `TimePref`, `SlotId`, `TypeId`, `QuizValues`, 상수 `SLOT_IDS`, `DRAWS`, `PLAYS`, `QUIZ_GENRES`, `ATMOSPHERES`, `TIME_PREFS`, `PLAYER_PREFS`
  - `questions.ts`: `QuizFormat`, `QuizOption`, `QuizQuestion`, `QuizAnswers`, 상수 `QUESTIONS: QuizQuestion[]`, 함수 `answerValue(q: QuizQuestion, answer: number): string | number | undefined`, `answerBonus(q: QuizQuestion, answer: number): Play | undefined`

이 단계에서는 `lib/quiz.ts`(기존 파일)를 그대로 둔다. `lib/quiz/index.ts`는 Task 6에서 만든다.

- [ ] **Step 1: vitest 설치와 설정**

```bash
npm install -D vitest
```

`package.json`의 `scripts`에 추가:

```json
"test": "vitest run"
```

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["lib/**/*.test.ts"],
    environment: "node",
  },
});
```

- [ ] **Step 2: 슬롯 정의 작성** — `lib/quiz/slots.ts`

```ts
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
```

- [ ] **Step 3: 실패하는 테스트 작성** — `lib/quiz/questions.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { SLOT_IDS, isValidSlotValue } from "./slots";
import { QUESTIONS, answerBonus, answerValue } from "./questions";

describe("질문 데이터", () => {
  it("슬롯마다 변형이 정확히 3개다", () => {
    for (const slot of SLOT_IDS) {
      expect(QUESTIONS.filter((q) => q.slot === slot), slot).toHaveLength(3);
    }
    expect(QUESTIONS).toHaveLength(33);
  });

  it("질문 ID가 겹치지 않는다", () => {
    const ids = QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("모든 선택지 값이 그 슬롯의 값 범위 안에 있다", () => {
    for (const q of QUESTIONS) {
      for (const o of q.options) {
        expect(isValidSlotValue(q.slot, o.value), `${q.id}: ${o.label}`).toBe(true);
      }
    }
  });

  it("형식 규칙을 지킨다", () => {
    for (const q of QUESTIONS) {
      if (q.format === "binary") {
        expect(q.options, q.id).toHaveLength(2);
        expect(["fear", "difficulty", "hint", "time"], q.id).toContain(q.slot);
      }
      if (q.format === "slider") {
        expect(q.options, q.id).toHaveLength(0);
        expect(["fear", "difficulty", "hint"], q.id).toContain(q.slot);
        expect(q.minLabel, q.id).toBeTruthy();
        expect(q.maxLabel, q.id).toBeTruthy();
      }
      if (q.format === "choice") {
        expect(q.options.length, q.id).toBeGreaterThanOrEqual(4);
        expect(q.options.length, q.id).toBeLessThanOrEqual(6);
      }
    }
  });

  it("보조 점수는 플레이 방식 슬롯에만 붙는다", () => {
    for (const q of QUESTIONS) {
      const hasBonus = q.options.some((o) => o.bonus);
      if (hasBonus) expect(["play1", "play2"], q.id).toContain(q.slot);
    }
  });
});

describe("answerValue", () => {
  const byId = (id: string) => QUESTIONS.find((q) => q.id === id)!;

  it("choice 는 선택지의 값을 돌려준다", () => {
    expect(answerValue(byId("draw1-a"), 1)).toBe("brain");
  });

  it("없는 선택 번호는 undefined", () => {
    expect(answerValue(byId("draw1-a"), 9)).toBeUndefined();
    expect(answerValue(byId("draw1-a"), -1)).toBeUndefined();
  });

  it("slider 는 값 그대로, 범위를 벗어나면 1~5로 자른다", () => {
    const q = byId("fear-a");
    expect(answerValue(q, 4)).toBe(4);
    expect(answerValue(q, 0)).toBe(1);
    expect(answerValue(q, 6)).toBe(5);
    expect(answerValue(q, 2.6)).toBe(3);
  });

  it("hint-c 는 값을 뒤집는다", () => {
    const q = byId("hint-c");
    expect(answerValue(q, 1)).toBe(5);
    expect(answerValue(q, 5)).toBe(1);
    expect(answerValue(q, 9)).toBe(1);
    expect(answerValue(q, 0)).toBe(5);
  });

  it("answerBonus 는 보조 점수가 있는 선택지에서만 값을 준다", () => {
    expect(answerBonus(byId("play2-a"), 1)).toBe("team");
    expect(answerBonus(byId("play2-a"), 0)).toBeUndefined();
    expect(answerBonus(byId("fear-a"), 3)).toBeUndefined();
  });
});
```

- [ ] **Step 4: 테스트가 실패하는지 확인**

Run: `npm test`
Expected: FAIL — `./questions` 모듈을 찾을 수 없음

- [ ] **Step 5: 질문 데이터 작성** — `lib/quiz/questions.ts`

```ts
import type { Play, SlotId } from "./slots";

// ─────────────────────────────────────────────────────────────
// 질문 33개 = 슬롯 11개 × 변형 3개. 문장의 원본은
// docs/superpowers/specs/2026-10-06-quiz-variety-design.md 6장.
// 변형이 달라도 선택지는 같은 슬롯 값으로 환산된다.
// ─────────────────────────────────────────────────────────────

export type QuizFormat = "choice" | "binary" | "slider";

export interface QuizOption {
  label: string;
  value: string | number;
  bonus?: Play; // 플레이 방식 보조 1점
}

export interface QuizQuestion {
  id: string; // "<slot>-<a|b|c>"
  slot: SlotId;
  format: QuizFormat;
  prompt: string;
  options: QuizOption[]; // slider 는 빈 배열
  minLabel?: string; // slider 왼쪽 끝(1)
  maxLabel?: string; // slider 오른쪽 끝(5)
  reverse?: boolean; // slider 값을 뒤집어 저장(1↔5)
}

// 화면이 들고 있는 답: 질문 ID → 선택 번호(choice·binary) 또는 슬라이더 값(1~5)
export type QuizAnswers = Record<string, number>;

const c = (
  id: string,
  slot: SlotId,
  prompt: string,
  options: QuizOption[]
): QuizQuestion => ({ id, slot, format: "choice", prompt, options });

const b = (
  id: string,
  slot: SlotId,
  prompt: string,
  options: [QuizOption, QuizOption]
): QuizQuestion => ({ id, slot, format: "binary", prompt, options });

const s = (
  id: string,
  slot: SlotId,
  prompt: string,
  minLabel: string,
  maxLabel: string,
  reverse = false
): QuizQuestion => ({
  id,
  slot,
  format: "slider",
  prompt,
  options: [],
  minLabel,
  maxLabel,
  reverse,
});

const o = (label: string, value: string | number, bonus?: Play): QuizOption =>
  bonus ? { label, value, bonus } : { label, value };

export const QUESTIONS: QuizQuestion[] = [
  // ── draw1: 끌리는 것 A ──
  c("draw1-a", "draw1", "방 문이 열렸다. 제일 먼저 눈이 가는 건?", [
    o("어둠 속에서 뭔가 움직인 것 같은 구석", "thrill"),
    o("벽에 적힌 숫자와 기호", "brain"),
    o("책상 위 누군가의 일기장", "story"),
    o("저 끝에 살짝 열린 또 다른 문", "explore"),
  ]),
  c("draw1-b", "draw1", "방탈출 하면 심장이 뛰는 순간은?", [
    o("오싹한 연출에 소름이 돋을 때", "thrill"),
    o("흩어진 실마리가 한 번에 이어질 때", "brain"),
    o("이야기의 반전을 알아챘을 때", "story"),
    o("숨겨진 공간이 열릴 때", "explore"),
  ]),
  c("draw1-c", "draw1", "친구가 방 하나를 추천한다. 어떤 한마디에 바로 예약해?", [
    o("\"나 거기서 진짜 주저앉았어, 무서워서\"", "thrill"),
    o("\"문제 퀄리티가 미쳤어\"", "brain"),
    o("\"스토리 때문에 끝나고 한참 멍했어\"", "story"),
    o("\"방이 계속 나와, 끝이 없어\"", "explore"),
  ]),

  // ── draw2: 끌리는 것 B ──
  c("draw2-a", "draw2", "방탈출이 끝났다. 제일 오래 남는 기억은?", [
    o("갑자기 튀어나온 그 장면", "thrill"),
    o("끝까지 안 풀리다 풀린 그 문제", "brain"),
    o("마지막에 읽은 편지 한 줄", "story"),
    o("벽이 통째로 열리던 순간", "explore"),
  ]),
  c("draw2-b", "draw2", "방탈출 테마를 직접 만든다면?", [
    o("불 꺼진 폐병원", "thrill"),
    o("단서만 백 개인 탐정 사무소", "brain"),
    o("한 사람의 인생을 따라가는 방", "story"),
    o("방이 일곱 개 이어지는 유적", "explore"),
  ]),
  c("draw2-c", "draw2", "이 중 하나만 평생 할 수 있다면?", [
    o("무서운 방만", "thrill"),
    o("문제 어려운 방만", "brain"),
    o("스토리 좋은 방만", "story"),
    o("스케일 큰 방만", "explore"),
  ]),

  // ── play1: 플레이 방식 A ──
  c("play1-a", "play1", "문이 잠겼다. 제일 먼저 하는 행동은?", [
    o("보이는 자물쇠를 일단 다 돌려본다", "rush"),
    o("방 전체를 훑고 단서를 정리한다", "analyze"),
    o("소품과 인테리어부터 구경한다", "savor"),
    o("\"각자 구역 나누자\"고 말한다", "team"),
  ]),
  c("play1-b", "play1", "타이머가 10분 남았다. 나는?", [
    o("손에 잡히는 대로 다 시도한다", "rush"),
    o("남은 문제를 순서대로 정리한다", "analyze"),
    o("시간보다 엔딩 연출이 더 궁금하다", "savor"),
    o("누가 뭘 맡을지 빠르게 정한다", "team"),
  ]),
  c("play1-c", "play1", "방 안에서 나는 주로?", [
    o("먼저 움직이는 사람", "rush"),
    o("가만히 생각하는 사람", "analyze"),
    o("구경하는 사람", "savor"),
    o("정리해서 알려 주는 사람", "team"),
  ]),

  // ── play2: 플레이 방식 B ──
  c("play2-a", "play2", "일행이 한 문제에 5분째 막혔다. 나는?", [
    o("그 사이 다른 자물쇠를 연다", "rush"),
    o("옆에서 같이 처음부터 다시 본다", "analyze", "team"),
    o("그동안 방을 한 바퀴 구경한다", "savor"),
    o("지금까지 나온 단서를 모아 공유한다", "team", "analyze"),
  ]),
  c("play2-b", "play2", "방탈출 끝나고 제일 먼저 하는 말은?", [
    o("\"몇 분 남았어? 기록 몇 등이야?\"", "rush"),
    o("\"아까 그 문제 원리가 뭐였냐면\"", "analyze"),
    o("\"그 연출 진짜 좋았다, 사진 찍자\"", "savor"),
    o("\"너 아까 그거 진짜 잘했어\"", "team"),
  ]),
  c("play2-c", "play2", "새 방에 들어가기 직전, 나의 준비는?", [
    o("준비는 무슨, 들어가서 본다", "rush"),
    o("후기로 난이도와 장치 유형을 파악한다", "analyze"),
    o("스포 없이 분위기만 기대한다", "savor", "rush"),
    o("역할 분담부터 정한다", "team"),
  ]),

  // ── genre: 장르 ──
  c("genre-a", "genre", "오늘 딱 한 방만 간다면?", [
    o("공포", "공포"),
    o("추리", "추리"),
    o("감성", "감성"),
    o("모험", "모험"),
    o("SF", "SF"),
    o("코믹", "코믹"),
  ]),
  c("genre-b", "genre", "영화로 치면 내 취향은?", [
    o("불 끄고 보는 공포 영화", "공포"),
    o("범인을 맞히는 추리 영화", "추리"),
    o("휴지가 필요한 감성 영화", "감성"),
    o("보물을 찾아 떠나는 모험 영화", "모험"),
    o("우주로 나가는 SF 영화", "SF"),
    o("배꼽 잡는 코미디 영화", "코믹"),
  ]),
  c("genre-c", "genre", "방 소개글 첫 줄, 어디에 끌려?", [
    o("\"이 집에서는 아무도 살아 나오지 못했다\"", "공포"),
    o("\"범인은 이 안에 있다\"", "추리"),
    o("\"10년 전 부치지 못한 편지\"", "감성"),
    o("\"지도의 마지막 조각을 찾아라\"", "모험"),
    o("\"우주선의 산소가 60분 남았다\"", "SF"),
    o("\"사장님 몰래 야근 탈출\"", "코믹"),
  ]),

  // ── fear: 공포 내성 ──
  s("fear-a", "fear", "무서움, 어디까지 괜찮아요?", "하나도 안 무섭게", "심장 쫄깃 대환영"),
  b("fear-b", "fear", "둘 중 하나만 갈 수 있다면?", [
    o("귀신이 직접 나오는 방", 4),
    o("귀신 이야기만 나오는 방", 2),
  ]),
  c("fear-c", "fear", "복도 끝에서 발소리가 다가온다. 나는?", [
    o("일행 뒤로 숨는다", 1),
    o("눈 감고 지나가길 기다린다", 2),
    o("움찔하고 하던 걸 계속한다", 3),
    o("놀라지만 그게 재밌다", 4),
    o("소리 나는 쪽으로 간다", 5),
  ]),

  // ── difficulty: 선호 난이도 ──
  s("difficulty-a", "difficulty", "난이도는 어느 정도가 좋아?", "술술 풀리게", "머리 쥐어뜯게"),
  b("difficulty-b", "difficulty", "어느 쪽이 더 억울해?", [
    o("너무 쉬워서 20분 만에 나온 방", 4),
    o("너무 어려워서 절반도 못 간 방", 2),
  ]),
  c("difficulty-c", "difficulty", "한 문제에 15분째 막혔다. 솔직한 심정은?", [
    o("집에 가고 싶다", 1),
    o("슬슬 지친다", 2),
    o("그럴 수 있지", 3),
    o("이 맛에 한다", 4),
    o("더 어려워도 된다", 5),
  ]),

  // ── hint: 힌트 성향 (1 안 씀 ~ 5 바로 씀) ──
  c("hint-a", "hint", "막히면 힌트, 쓰는 편?", [
    o("절대 안 쓰고 버틴다", 1),
    o("정말 최후에만", 2),
    o("적당히 쓰는 편", 3),
    o("막히면 바로바로", 4),
    o("힌트 뭐 어때, 다 쓴다", 5),
  ]),
  b("hint-b", "hint", "힌트 버튼 앞에서 나는?", [
    o("끝까지 버틴다", 2),
    o("시간이 아깝다, 누른다", 4),
  ]),
  s("hint-c", "hint", "힌트 없이 얼마나 버텨?", "1분이면 누른다", "끝까지 안 누른다", true),

  // ── atmosphere: 분위기 ──
  c("atmosphere-a", "atmosphere", "어떤 분위기가 끌려?", [
    o("어둡고 으스스한", "dark"),
    o("밝고 화사한", "bright"),
    o("낡고 퇴폐적인", "grungy"),
    o("웅장하고 판타지 같은", "epic"),
    o("아기자기 귀여운", "cute"),
  ]),
  c("atmosphere-b", "atmosphere", "방 조명을 내가 고른다면?", [
    o("촛불 하나", "dark"),
    o("햇살 드는 창", "bright"),
    o("깜빡이는 형광등", "grungy"),
    o("스테인드글라스", "epic"),
    o("알전구 가랜드", "cute"),
  ]),
  c("atmosphere-c", "atmosphere", "하룻밤 묵어야 한다면?", [
    o("안개 낀 숲속 산장", "dark"),
    o("바닷가 하얀 집", "bright"),
    o("문 닫은 놀이공원", "grungy"),
    o("오래된 성", "epic"),
    o("인형 가득한 다락방", "cute"),
  ]),

  // ── players: 인원 (0 = 상관없음) ──
  c("players-a", "players", "보통 몇 명이서 가요?", [
    o("혼자", 1),
    o("둘이서", 2),
    o("3~4명이서", 4),
    o("5명 이상", 5),
    o("그때그때 달라", 0),
  ]),
  c("players-b", "players", "방탈출 단톡방, 이상적인 인원은?", [
    o("단톡방 없음, 혼자 간다", 1),
    o("둘이면 충분하다", 2),
    o("서너 명이 딱이다", 4),
    o("많을수록 좋다", 5),
    o("모이는 대로", 0),
  ]),
  c("players-c", "players", "방 안이 제일 재밌는 순간은?", [
    o("혼자 조용히 풀어낼 때", 1),
    o("둘이 눈빛만으로 통할 때", 2),
    o("서넛이 동시에 다른 걸 풀 때", 4),
    o("여럿이 한꺼번에 소리 지를 때", 5),
    o("인원은 상관없다", 0),
  ]),

  // ── time: 플레이 시간 ──
  c("time-a", "time", "플레이 시간은 어느 정도가 좋아?", [
    o("40분 이내로 후다닥", "short"),
    o("60분 정도", "normal"),
    o("75분쯤 넉넉하게", "long"),
    o("90분 이상 길게", "extra"),
    o("상관없어", "any"),
  ]),
  b("time-b", "time", "둘 중 고른다면?", [
    o("짧고 굵은 45분", "short"),
    o("느긋하게 즐기는 80분", "long"),
  ]),
  c("time-c", "time", "탈출했는데 직원이 말한다. \"사실 방이 하나 더 있어요.\"", [
    o("이미 지쳤다", "short"),
    o("딱 여기까지가 좋았다", "normal"),
    o("오, 좋아요", "long"),
    o("두 개 더 있어도 된다", "extra"),
    o("재밌으면 다 좋다", "any"),
  ]),
];

// 답(선택 번호 또는 슬라이더 값) → 슬롯 값. 고를 수 없는 답이면 undefined.
export function answerValue(
  q: QuizQuestion,
  answer: number
): string | number | undefined {
  if (q.format === "slider") {
    const n = Math.min(5, Math.max(1, Math.round(answer)));
    return q.reverse ? 6 - n : n;
  }
  return q.options[answer]?.value;
}

export function answerBonus(q: QuizQuestion, answer: number): Play | undefined {
  if (q.format === "slider") return undefined;
  return q.options[answer]?.bonus;
}
```

- [ ] **Step 6: 테스트 통과 확인**

Run: `npm test`
Expected: PASS (10 tests)

Run: `npx tsc --noEmit`
Expected: 출력 없음

- [ ] **Step 7: 커밋**

```bash
git add package.json package-lock.json vitest.config.ts lib/quiz/slots.ts lib/quiz/questions.ts lib/quiz/questions.test.ts
git commit -m "취향 찾기: 슬롯 정의와 질문 33개 풀 + vitest 도입"
```

---

### Task 2: 답 → 슬롯 값 환산과 유형 판정

**Files:**
- Create: `lib/quiz/score.ts`
- Test: `lib/quiz/score.test.ts`

**Interfaces:**
- Consumes: `slots.ts`의 타입·상수, `questions.ts`의 `QuizQuestion`, `QuizAnswers`, `answerValue`, `answerBonus`; `lib/store.ts`의 `GENRES`, `Genre`, `TasteProfile`
- Produces:
  - `toValues(questions: QuizQuestion[], answers: QuizAnswers): QuizValues | null`
  - `determineDraw(v: QuizValues): Draw`, `determinePlay(v: QuizValues): Play`, `determineType(v: QuizValues): TypeId`
  - `quizToTaste(v: QuizValues): TasteProfile`
  - `focusTagsOf(v: QuizValues): string[]`
  - `interface QuizPrefs { timePref: number; playersPref: number }`, `quizPrefs(v: QuizValues): QuizPrefs`
  - `brandAffinity(v: QuizValues): { name: string; reason: string }`
  - `FOCUS_TAGS: Record<string, string[]>`

- [ ] **Step 1: 실패하는 테스트 작성** — `lib/quiz/score.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { DRAWS, PLAYS, QUIZ_GENRES, type QuizValues } from "./slots";
import { QUESTIONS, type QuizAnswers } from "./questions";
import {
  brandAffinity,
  determineDraw,
  determinePlay,
  determineType,
  focusTagsOf,
  quizPrefs,
  quizToTaste,
  toValues,
} from "./score";

const base: QuizValues = {
  draw1: "thrill",
  draw2: "thrill",
  play1: "rush",
  play2: "rush",
  genre: "공포",
  fear: 3,
  difficulty: 3,
  hint: 3,
  atmosphere: "bright",
  players: 0,
  time: "any",
  playBonus: [],
};
const v = (over: Partial<QuizValues>): QuizValues => ({ ...base, ...over });

const pick = (...ids: string[]) => ids.map((id) => QUESTIONS.find((q) => q.id === id)!);
const A_SET = pick(
  "draw1-a", "draw2-a", "play1-a", "play2-a", "genre-a", "fear-a",
  "difficulty-a", "hint-a", "atmosphere-a", "players-a", "time-a"
);

describe("toValues", () => {
  const answers: QuizAnswers = {
    "draw1-a": 1, "draw2-a": 2, "play1-a": 0, "play2-a": 1, "genre-a": 1,
    "fear-a": 4, "difficulty-a": 2, "hint-a": 0, "atmosphere-a": 3,
    "players-a": 2, "time-a": 1,
  };

  it("답을 슬롯 값으로 환산한다", () => {
    expect(toValues(A_SET, answers)).toEqual({
      draw1: "brain", draw2: "story", play1: "rush", play2: "analyze",
      genre: "추리", fear: 4, difficulty: 2, hint: 1, atmosphere: "epic",
      players: 4, time: "normal", playBonus: ["team"],
    });
  });

  it("답이 하나라도 빠지면 null", () => {
    const { "time-a": _omit, ...partial } = answers;
    expect(toValues(A_SET, partial)).toBeNull();
  });

  it("고를 수 없는 선택 번호가 있으면 null", () => {
    expect(toValues(A_SET, { ...answers, "draw1-a": 9 })).toBeNull();
  });

  it("뒤로 가서 답을 바꿔도 보조 점수는 마지막 답 기준으로 한 번만 들어간다", () => {
    // play2-a: 1번은 +team, 3번은 +analyze. 1번을 골랐다가 3번으로 바꾼 상황.
    const changed = toValues(A_SET, { ...answers, "play2-a": 3 })!;
    expect(changed.playBonus).toEqual(["analyze"]);
    expect(changed.play2).toBe("team");
  });

  it("뽑히지 않은 질문의 답은 무시한다", () => {
    const withStale = toValues(A_SET, { ...answers, "play2-c": 2 })!;
    expect(withStale.playBonus).toEqual(["team"]);
  });
});

describe("determineDraw", () => {
  it("두 문항이 같으면 그 값", () => {
    expect(determineDraw(v({ draw1: "brain", draw2: "brain", genre: "공포" }))).toBe("brain");
  });

  it("두 문항이 다르면 장르가 가리키는 쪽", () => {
    expect(determineDraw(v({ draw1: "brain", draw2: "story", genre: "감성" }))).toBe("story");
    expect(determineDraw(v({ draw1: "brain", draw2: "explore", genre: "SF" }))).toBe("explore");
  });

  it("두 문항이 다르고 장르가 제3의 값이면 draw1", () => {
    expect(determineDraw(v({ draw1: "brain", draw2: "story", genre: "공포" }))).toBe("brain");
  });

  it("코믹은 이야기, 모험은 탐험으로 센다", () => {
    expect(determineDraw(v({ draw1: "thrill", draw2: "story", genre: "코믹" }))).toBe("story");
    expect(determineDraw(v({ draw1: "thrill", draw2: "explore", genre: "모험" }))).toBe("explore");
  });
});

describe("determinePlay", () => {
  it("두 문항이 다르고 다른 점수가 없으면 play1", () => {
    expect(determinePlay(v({ play1: "savor", play2: "team", hint: 3 }))).toBe("savor");
  });

  it("보조 점수가 동점을 가른다", () => {
    expect(
      determinePlay(v({ play1: "savor", play2: "team", hint: 3, playBonus: ["team"] }))
    ).toBe("team");
  });

  it("힌트를 안 쓰면 분석, 바로 쓰면 돌격에 1점", () => {
    expect(determinePlay(v({ play1: "rush", play2: "analyze", hint: 1 }))).toBe("analyze");
    expect(determinePlay(v({ play1: "analyze", play2: "rush", hint: 5 }))).toBe("rush");
    expect(determinePlay(v({ play1: "analyze", play2: "rush", hint: 3 }))).toBe("analyze");
  });

  it("힌트 점수만으로는 두 문항이 같은 답을 뒤집지 못한다", () => {
    expect(determinePlay(v({ play1: "savor", play2: "savor", hint: 5 }))).toBe("savor");
  });
});

describe("determineType", () => {
  it("모든 조합에서 16개 유형 중 하나를 돌려준다", () => {
    const valid = new Set(DRAWS.flatMap((d) => PLAYS.map((p) => `${d}-${p}`)));
    const seen = new Set<string>();
    for (const draw1 of DRAWS)
      for (const draw2 of DRAWS)
        for (const play1 of PLAYS)
          for (const play2 of PLAYS)
            for (const genre of QUIZ_GENRES)
              for (const hint of [1, 2, 3, 4, 5]) {
                const t = determineType(v({ draw1, draw2, play1, play2, genre, hint }));
                expect(valid.has(t)).toBe(true);
                seen.add(t);
              }
    expect(seen.size).toBe(16);
  });

  it("같은 슬롯 값이면 어떤 변형에서 왔든 같은 유형이다", () => {
    // draw1-a 1번과 draw1-b 1번은 둘 다 brain.
    const fromA = toValues(A_SET, {
      "draw1-a": 1, "draw2-a": 1, "play1-a": 1, "play2-a": 1, "genre-a": 1,
      "fear-a": 3, "difficulty-a": 3, "hint-a": 2, "atmosphere-a": 0,
      "players-a": 0, "time-a": 0,
    })!;
    const B_SET = pick(
      "draw1-b", "draw2-b", "play1-b", "play2-b", "genre-b", "fear-c",
      "difficulty-c", "hint-a", "atmosphere-b", "players-b", "time-a"
    );
    const fromB = toValues(B_SET, {
      "draw1-b": 1, "draw2-b": 1, "play1-b": 1, "play2-b": 1, "genre-b": 1,
      "fear-c": 2, "difficulty-c": 2, "hint-a": 2, "atmosphere-b": 0,
      "players-b": 0, "time-a": 0,
    })!;
    expect(determineType(fromA)).toBe("brain-analyze");
    expect(determineType(fromB)).toBe("brain-analyze");
  });
});

describe("추천에 넘기는 값", () => {
  it("quizToTaste 는 recommend() 가 받는 TasteProfile 형태다", () => {
    const t = quizToTaste(v({ genre: "추리", fear: 2, difficulty: 4 }));
    expect(t.topGenre).toBe("추리");
    expect(t.genreCounts["추리"]).toBe(1);
    expect(t.genreCounts["공포"]).toBe(0);
    expect(Object.keys(t.genreCounts)).toContain("기타");
    expect(t.fearComfort).toBe(2);
    expect(t.difficultyFit).toBe(4);
    expect(t.count).toBe(11);
  });

  it("quizPrefs 는 시간을 분으로, 상관없음을 0으로 바꾼다", () => {
    expect(quizPrefs(v({ time: "short", players: 2 }))).toEqual({ timePref: 40, playersPref: 2 });
    expect(quizPrefs(v({ time: "extra", players: 5 }))).toEqual({ timePref: 95, playersPref: 5 });
    expect(quizPrefs(v({ time: "any", players: 0 }))).toEqual({ timePref: 0, playersPref: 0 });
  });

  it("focusTagsOf 는 유형에서 태그를 만들고 중복을 없앤다", () => {
    const brainTeam = focusTagsOf(v({ draw1: "brain", draw2: "brain", genre: "추리", play1: "team", play2: "team" }));
    expect(brainTeam).toEqual(["장치", "협동", "가족"]);
    const storySavor = focusTagsOf(v({ draw1: "story", draw2: "story", genre: "감성", play1: "savor", play2: "savor" }));
    expect(new Set(storySavor).size).toBe(storySavor.length);
    expect(storySavor).toContain("스토리");
    expect(storySavor).toContain("아기자기");
  });

  it("brandAffinity 는 네 브랜드 중 하나와 이유를 돌려준다", () => {
    expect(brandAffinity(v({ genre: "공포", fear: 5 })).name).toBe("제로월드");
    expect(brandAffinity(v({ genre: "추리", atmosphere: "bright" })).name).toBe("셜록홈즈");
    expect(brandAffinity(v({ genre: "모험", atmosphere: "bright" })).name).toBe("비트포비아");
    expect(brandAffinity(v({ genre: "감성", atmosphere: "cute", play1: "savor", play2: "savor" })).name).toBe("키이스케이프");
    expect(brandAffinity(v({ genre: "감성", atmosphere: "cute" })).reason).toBeTruthy();
  });
});
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

Run: `npm test`
Expected: FAIL — `./score` 모듈을 찾을 수 없음

- [ ] **Step 3: 구현** — `lib/quiz/score.ts`

```ts
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

// 취향 → 어울리는 브랜드 추천 (크롤한 4개 브랜드 성격 기반)
const BRAND_STYLE: Record<string, string> = {
  키이스케이프: "탄탄한 스토리와 완성도",
  제로월드: "강렬한 공포·연출과 높은 난이도",
  비트포비아: "활동적이고 몰입감 큰 모험",
  셜록홈즈: "정통 추리와 두뇌 플레이",
};

export function brandAffinity(v: QuizValues): { name: string; reason: string } {
  let name = "키이스케이프";
  if (v.genre === "공포" && (v.fear >= 4 || v.difficulty >= 4)) name = "제로월드";
  else if (v.atmosphere === "grungy" || v.atmosphere === "dark") name = "제로월드";
  else if (v.genre === "추리") name = "셜록홈즈";
  else if (v.genre === "모험" || determinePlay(v) === "rush") name = "비트포비아";
  return { name, reason: BRAND_STYLE[name] };
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm test`
Expected: PASS (questions 10 + score 19)

`brandAffinity` 테스트의 `감성`·`cute` 기본값은 `play1: "rush"`라 비트포비아가 나온다. 이유(`reason`)만 확인하는 마지막 줄은 그대로 통과한다. 다른 줄이 실패하면 테스트의 값이 아니라 구현의 분기 순서를 스펙 9장과 대조한다.

Run: `npx tsc --noEmit`
Expected: 출력 없음

- [ ] **Step 5: 커밋**

```bash
git add lib/quiz/score.ts lib/quiz/score.test.ts
git commit -m "취향 찾기: 슬롯 값 환산과 16유형 판정"
```

---

### Task 3: 질문 뽑기와 직전 변형 저장

**Files:**
- Create: `lib/quiz/pick.ts`
- Test: `lib/quiz/pick.test.ts`

**Interfaces:**
- Consumes: `SLOT_IDS` (`slots.ts`), `QUESTIONS`, `QuizQuestion` (`questions.ts`)
- Produces:
  - `pickQuestions(lastVariantIds?: readonly string[], random?: () => number): QuizQuestion[]`
  - `LAST_VARIANTS_KEY = "escapelog:quiz:last-variants"`
  - `loadLastVariants(storage?: Pick<Storage, "getItem"> | null): string[]`
  - `saveLastVariants(ids: readonly string[], storage?: Pick<Storage, "setItem"> | null): void`

- [ ] **Step 1: 실패하는 테스트 작성** — `lib/quiz/pick.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { SLOT_IDS } from "./slots";
import { QUESTIONS } from "./questions";
import {
  LAST_VARIANTS_KEY,
  loadLastVariants,
  pickQuestions,
  saveLastVariants,
} from "./pick";

// 0, 0.37, 0.74, 0.11 … 로 도는 결정적 난수
function seeded(start = 0) {
  let n = start;
  return () => {
    const x = (n * 0.37) % 1;
    n += 1;
    return x;
  };
}

describe("pickQuestions", () => {
  it("슬롯마다 하나씩 11개를 돌려준다", () => {
    const picked = pickQuestions([], seeded());
    expect(picked).toHaveLength(11);
    expect(new Set(picked.map((q) => q.slot))).toEqual(new Set(SLOT_IDS));
  });

  it("첫 문항은 항상 draw1 이다", () => {
    for (let i = 0; i < 20; i++) {
      expect(pickQuestions([], seeded(i))[0].slot).toBe("draw1");
    }
  });

  it("직전 변형은 뽑지 않는다", () => {
    for (let i = 0; i < 20; i++) {
      const first = pickQuestions([], seeded(i)).map((q) => q.id);
      const second = pickQuestions(first, seeded(i)).map((q) => q.id);
      expect(second.filter((id) => first.includes(id))).toEqual([]);
    }
  });

  it("한 슬롯의 변형이 전부 직전에 나왔으면 그 슬롯은 제외 없이 뽑는다", () => {
    const allFear = QUESTIONS.filter((q) => q.slot === "fear").map((q) => q.id);
    const picked = pickQuestions(allFear, seeded());
    expect(picked.filter((q) => q.slot === "fear")).toHaveLength(1);
  });

  it("난수가 1에 가까워도 범위를 벗어나지 않는다", () => {
    const picked = pickQuestions([], () => 0.999999);
    expect(picked).toHaveLength(11);
    expect(picked.every(Boolean)).toBe(true);
  });

  it("순서가 회차마다 달라질 수 있다", () => {
    const orders = new Set(
      Array.from({ length: 10 }, (_, i) =>
        pickQuestions([], seeded(i)).map((q) => q.slot).join(",")
      )
    );
    expect(orders.size).toBeGreaterThan(1);
  });
});

describe("직전 변형 저장", () => {
  it("저장한 값을 다시 읽는다", () => {
    const map = new Map<string, string>();
    const storage = {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => void map.set(k, v),
    };
    saveLastVariants(["draw1-a", "fear-b"], storage);
    expect(map.has(LAST_VARIANTS_KEY)).toBe(true);
    expect(loadLastVariants(storage)).toEqual(["draw1-a", "fear-b"]);
  });

  it("저장소가 없으면 빈 배열", () => {
    expect(loadLastVariants(null)).toEqual([]);
    expect(() => saveLastVariants(["draw1-a"], null)).not.toThrow();
  });

  it("저장소가 예외를 던져도 빈 배열 (개인정보 보호 모드)", () => {
    const broken = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
    };
    expect(loadLastVariants(broken)).toEqual([]);
    expect(() => saveLastVariants(["draw1-a"], broken)).not.toThrow();
  });

  it("깨진 값이나 배열이 아닌 값은 빈 배열", () => {
    const of = (raw: string) => ({ getItem: () => raw });
    expect(loadLastVariants(of("{not json"))).toEqual([]);
    expect(loadLastVariants(of('{"a":1}'))).toEqual([]);
    expect(loadLastVariants(of('["draw1-a", 3, null]'))).toEqual(["draw1-a"]);
  });
});
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

Run: `npm test`
Expected: FAIL — `./pick` 모듈을 찾을 수 없음

- [ ] **Step 3: 구현** — `lib/quiz/pick.ts`

```ts
import { SLOT_IDS } from "./slots";
import { QUESTIONS, type QuizQuestion } from "./questions";

// ─────────────────────────────────────────────────────────────
// 한 회차의 질문 뽑기. 슬롯마다 변형 하나, 직전 회차에 나온 변형은 제외.
// 첫 문항은 draw1 로 고정하고 나머지 순서는 섞는다.
// ─────────────────────────────────────────────────────────────

export function pickQuestions(
  lastVariantIds: readonly string[] = [],
  random: () => number = Math.random
): QuizQuestion[] {
  const last = new Set(lastVariantIds);
  const at = (n: number) => Math.min(n - 1, Math.floor(random() * n));

  const picked = SLOT_IDS.map((slot) => {
    const all = QUESTIONS.filter((q) => q.slot === slot);
    const fresh = all.filter((q) => !last.has(q.id));
    const pool = fresh.length ? fresh : all;
    return pool[at(pool.length)];
  });

  const [first, ...rest] = picked; // SLOT_IDS[0] === "draw1"
  for (let i = rest.length - 1; i > 0; i--) {
    const j = at(i + 1);
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [first, ...rest];
}

export const LAST_VARIANTS_KEY = "escapelog:quiz:last-variants";

function browserStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

// 직전 회차에 나온 변형 ID들. 읽을 수 없으면 빈 배열(제외 없이 뽑게 됨).
export function loadLastVariants(
  storage: Pick<Storage, "getItem"> | null = browserStorage()
): string[] {
  if (!storage) return [];
  try {
    const parsed: unknown = JSON.parse(storage.getItem(LAST_VARIANTS_KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

export function saveLastVariants(
  ids: readonly string[],
  storage: Pick<Storage, "setItem"> | null = browserStorage()
): void {
  if (!storage) return;
  try {
    storage.setItem(LAST_VARIANTS_KEY, JSON.stringify(ids));
  } catch {
    // 저장 실패는 무시: 다음 회차에 같은 질문이 나올 수 있을 뿐이다.
  }
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm test`
Expected: PASS (pick 10 포함 전체 통과)

"순서가 회차마다 달라질 수 있다"가 실패하면 `seeded`의 곱수 때문에 섞기가 같은 자리만 고르는 것이다. 구현이 아니라 테스트의 난수(`0.37`)를 `0.61`로 바꿔 다시 돌린다.

- [ ] **Step 5: 커밋**

```bash
git add lib/quiz/pick.ts lib/quiz/pick.test.ts
git commit -m "취향 찾기: 회차마다 다른 질문 뽑기 + 직전 변형 제외"
```

---

### Task 4: 유형 16개 데이터

**Files:**
- Create: `lib/quiz/types.ts`
- Test: `lib/quiz/types.test.ts`

**Interfaces:**
- Consumes: `DRAWS`, `PLAYS`, `TypeId`, `QuizValues` (`slots.ts`)
- Produces:
  - `MASCOT` (기존 `lib/quiz.ts`의 것과 동일한 값)
  - `interface QuizType { title: string; tagline: string }`
  - `QUIZ_TYPES: Record<TypeId, QuizType>`
  - `typeImage(id: TypeId): string` → `/types/<id>.jpg`
  - `PLAYERS_LABEL: Record<number, string>`, `TIME_LABEL: Record<QuizValues["time"], string>`
  - `interface Persona { title: string; emoji: string; blurb: string; brand?: { name: string; reason: string } }`

- [ ] **Step 1: 실패하는 테스트 작성** — `lib/quiz/types.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { DRAWS, PLAYER_PREFS, PLAYS, TIME_PREFS } from "./slots";
import { PLAYERS_LABEL, QUIZ_TYPES, TIME_LABEL, typeImage } from "./types";

describe("유형 데이터", () => {
  it("16개 조합 모두에 이름과 한 줄 설명이 있다", () => {
    for (const d of DRAWS)
      for (const p of PLAYS) {
        const t = QUIZ_TYPES[`${d}-${p}`];
        expect(t, `${d}-${p}`).toBeDefined();
        expect(t.title.length).toBeGreaterThan(0);
        expect(t.tagline.length).toBeGreaterThan(0);
      }
    expect(Object.keys(QUIZ_TYPES)).toHaveLength(16);
  });

  it("유형 이름이 겹치지 않는다", () => {
    const titles = Object.values(QUIZ_TYPES).map((t) => t.title);
    expect(new Set(titles).size).toBe(16);
  });

  it("그림 경로는 /types/<id>.jpg", () => {
    expect(typeImage("thrill-rush")).toBe("/types/thrill-rush.jpg");
  });

  it("인원·시간 값마다 표시 문구가 있다", () => {
    for (const n of PLAYER_PREFS) expect(PLAYERS_LABEL[n]).toBeTruthy();
    for (const t of TIME_PREFS) expect(TIME_LABEL[t]).toBeTruthy();
  });
});
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

Run: `npm test`
Expected: FAIL — `./types` 모듈을 찾을 수 없음

- [ ] **Step 3: 구현** — `lib/quiz/types.ts`

```ts
import type { QuizValues, TypeId } from "./slots";

// 서비스 마스코트 (사주유 '옥냥이'와 겹치지 않게 방탈출 유령 가이드)
export const MASCOT = {
  name: "탈출귀",
  emoji: "👻",
  tagline: "방 좀 깨본 유령이 취향 딱 짚어줄게",
} as const;

export interface QuizType {
  title: string;
  tagline: string; // 탈출귀 반말 한 줄
}

// 유형 16개. 이름·설명의 원본은 스펙 7장. 판정 로직과 무관하게 고칠 수 있다.
export const QUIZ_TYPES: Record<TypeId, QuizType> = {
  "thrill-rush": {
    title: "공포방 돌격대장",
    tagline: "무서울수록 먼저 들어가. 비명은 지르지만 발은 안 멈춰.",
  },
  "thrill-analyze": {
    title: "침착한 퇴마사",
    tagline: "귀신이 나와도 단서부터 챙겨. 놀라는 건 탈출하고 나서.",
  },
  "thrill-savor": {
    title: "호러 연출 수집가",
    tagline: "문제보다 연출이 먼저야. 소름 돋는 장면을 모으러 다녀.",
  },
  "thrill-team": {
    title: "비명 합창단장",
    tagline: "혼자는 못 가도 같이면 어디든 가. 같이 놀라는 게 제일 재밌어.",
  },
  "brain-rush": {
    title: "자물쇠 폭격기",
    tagline: "생각보다 손이 빨라. 되는 번호가 나올 때까지 돌려.",
  },
  "brain-analyze": {
    title: "노힌트 명탐정",
    tagline: "힌트는 자존심이 허락 안 해. 끝까지 직접 풀어내.",
  },
  "brain-savor": {
    title: "장치 감별사",
    tagline: "문제가 풀리는 순간보다 장치가 움직이는 순간이 좋아.",
  },
  "brain-team": {
    title: "작전 참모",
    tagline: "누가 뭘 풀지 정리해 주는 사람. 팀의 속도가 달라져.",
  },
  "story-rush": {
    title: "급전개 직진러",
    tagline: "다음 장면이 궁금해서 못 참아. 결말을 향해 직진해.",
  },
  "story-analyze": {
    title: "복선 회수꾼",
    tagline: "흘린 떡밥을 다 기억해. 마지막에 전부 이어 붙여.",
  },
  "story-savor": {
    title: "과몰입 주인공",
    tagline: "방에 들어가면 그 사람이 돼. 엔딩에서 제일 오래 서 있어.",
  },
  "story-team": {
    title: "눈물 나눔 메이트",
    tagline: "좋은 이야기는 같이 봐야 해. 끝나고 수다가 본편이야.",
  },
  "explore-rush": {
    title: "문 다 여는 개척자",
    tagline: "열 수 있는 건 다 열어 봐. 새 공간이 제일 큰 보상이야.",
  },
  "explore-analyze": {
    title: "지도 그리는 탐사대원",
    tagline: "방 구조부터 머리에 넣어. 어디에 뭐가 있었는지 다 기억해.",
  },
  "explore-savor": {
    title: "세계관 여행자",
    tagline: "탈출보다 구경이야. 다른 세계에 온 기분이 좋아서 가.",
  },
  "explore-team": {
    title: "원정대 대장",
    tagline: "스케일 큰 방일수록 사람을 모아. 다 같이 넘는 게 재밌어.",
  },
};

// 운영자가 public/types/ 에 넣는 그림. 없으면 화면이 마스코트로 대체한다.
export function typeImage(id: TypeId): string {
  return `/types/${id}.jpg`;
}

export const PLAYERS_LABEL: Record<number, string> = {
  1: "혼자",
  2: "2인",
  4: "3~4인",
  5: "5인 이상",
  0: "상관없음",
};

export const TIME_LABEL: Record<QuizValues["time"], string> = {
  short: "40분",
  normal: "60분",
  long: "75분",
  extra: "90분 이상",
  any: "상관없음",
};

// 저장용 요약(친구 궁합 등 기존 화면이 읽는 형태).
export interface Persona {
  title: string;
  emoji: string;
  blurb: string;
  brand?: { name: string; reason: string };
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm test`
Expected: PASS (전체)

- [ ] **Step 5: 커밋**

```bash
git add lib/quiz/types.ts lib/quiz/types.test.ts
git commit -m "취향 찾기: 유형 16개 이름·설명 데이터"
```

---

### Task 5: 퀴즈 화면 컴포넌트 3개

**Files:**
- Create: `components/quiz/QuestionView.tsx`
- Create: `components/quiz/DoorProgress.tsx`
- Create: `components/quiz/QuizResult.tsx`

**Interfaces:**
- Consumes: `QuizQuestion` (`lib/quiz/questions`), `QuizValues`, `TypeId` (`lib/quiz/slots`), `MASCOT`, `QUIZ_TYPES`, `typeImage`, `PLAYERS_LABEL`, `TIME_LABEL` (`lib/quiz/types`), `fearTrait` (`lib/terms`), `Recommendation` (`lib/store`), `RecommendCard` (`components/RecommendCard`)
- Produces:
  - `QuestionView({ question, initial, onAnswer }: { question: QuizQuestion; initial?: number; onAnswer: (answer: number) => void })`
  - `DoorProgress({ progress }: { progress: number })` — `progress`는 0~1
  - `QuizResult({ typeId, values, brand, recs, onRestart }: { typeId: TypeId; values: QuizValues; brand: { name: string; reason: string }; recs: Recommendation[]; onRestart: () => void })`

이 단계의 컴포넌트는 아직 어디서도 쓰이지 않는다. import 는 `@/lib/quiz/...` 하위 경로로 한다(`@/lib/quiz`는 Task 6 전까지 기존 파일을 가리킨다). 테스트 도구가 화면을 다루지 않으므로 타입 체크로 확인한다.

- [ ] **Step 1: 질문 렌더러 작성** — `components/quiz/QuestionView.tsx`

```tsx
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
```

- [ ] **Step 2: 진행 표시 작성** — `components/quiz/DoorProgress.tsx`

```tsx
import Image from "next/image";

// 문항 수를 숫자로 보여 주지 않고, 닫힌 문 위에 열린 문을 겹쳐
// 진행할수록 열리는 것처럼 보이게 한다. progress 는 0~1.
export default function DoorProgress({ progress }: { progress: number }) {
  const p = Math.min(1, Math.max(0, progress));
  return (
    <div
      role="progressbar"
      aria-label="진행 상황"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(p * 100)}
      className="relative mx-auto h-24 w-24"
    >
      <Image
        src="/door.png"
        alt=""
        width={96}
        height={96}
        priority
        className="absolute inset-0 h-full w-full object-contain"
      />
      <Image
        src="/door-open.png"
        alt=""
        width={96}
        height={96}
        priority
        style={{ opacity: p }}
        className="absolute inset-0 h-full w-full object-contain transition-opacity duration-500 motion-reduce:transition-none"
      />
    </div>
  );
}
```

- [ ] **Step 3: 결과 화면 작성** — `components/quiz/QuizResult.tsx`

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { QuizValues, TypeId } from "@/lib/quiz/slots";
import {
  MASCOT,
  PLAYERS_LABEL,
  QUIZ_TYPES,
  TIME_LABEL,
  typeImage,
} from "@/lib/quiz/types";
import { fearTrait } from "@/lib/terms";
import type { Recommendation } from "@/lib/store";
import RecommendCard from "@/components/RecommendCard";

function Bar({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="flex items-center gap-3">
      <dt className="w-20 shrink-0 text-sm font-bold text-cream/70">{label}</dt>
      <dd className="flex flex-1 items-center gap-3">
        <span className="flex gap-1" aria-hidden>
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`h-2.5 w-6 rounded-full border border-edge ${
                i <= value ? "bg-candy" : "bg-ink"
              }`}
            />
          ))}
        </span>
        <span className="text-xs font-bold text-cream/60">
          <span className="sr-only">5단계 중 {value}단계. </span>
          {note}
        </span>
      </dd>
    </div>
  );
}

function Text({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <dt className="w-20 shrink-0 text-sm font-bold text-cream/70">{label}</dt>
      <dd className="text-sm font-extrabold">{value}</dd>
    </div>
  );
}

const HINT_NOTE = ["", "끝까지 버틴다", "웬만하면 버틴다", "적당히 쓴다", "막히면 쓴다", "바로 쓴다"];

export default function QuizResult({
  typeId,
  values,
  brand,
  recs,
  onRestart,
}: {
  typeId: TypeId;
  values: QuizValues;
  brand: { name: string; reason: string };
  recs: Recommendation[];
  onRestart: () => void;
}) {
  const type = QUIZ_TYPES[typeId];
  const [noImage, setNoImage] = useState(false);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border-2 border-edge bg-panel p-6 text-center sm:p-8">
        <p className="text-xs font-bold text-cream/60">너의 방탈출 유형</p>
        {/* 그림은 배경까지 그려진 정사각형 장면이라 둥근 틀에 꽉 채워 넣는다 */}
        <div className="mx-auto mt-4 aspect-square w-56 overflow-hidden rounded-2xl border-2 border-edge bg-candy/15 sm:w-64">
          {noImage ? (
            <span
              aria-hidden
              className="flex h-full w-full items-center justify-center text-7xl"
            >
              {MASCOT.emoji}
            </span>
          ) : (
            <Image
              src={typeImage(typeId)}
              alt=""
              width={512}
              height={512}
              priority
              onError={() => setNoImage(true)}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <h1 className="mt-4 text-2xl sm:text-3xl">{type.title}</h1>
        <p className="mx-auto mt-2 max-w-md leading-relaxed text-cream/70 [word-break:keep-all]">
          {type.tagline}
        </p>

        <dl className="mx-auto mt-6 max-w-sm space-y-2.5 text-left">
          <Bar label="공포 내성" value={values.fear} note={fearTrait(values.fear)} />
          <Bar label="난이도" value={values.difficulty} />
          <Bar label="힌트" value={values.hint} note={HINT_NOTE[values.hint]} />
          <Text label="인원" value={PLAYERS_LABEL[values.players] ?? "상관없음"} />
          <Text label="시간" value={TIME_LABEL[values.time]} />
        </dl>

        <p className="mt-6 text-sm font-bold text-cream/70">
          <span className="font-extrabold text-candy">{brand.name}</span>
          {" "}쪽이 잘 맞아. {brand.reason}.
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl">추천 테마</h2>
          {recs.length > 0 && (
            <span className="text-xs text-cream/55">스포 수위는 카드마다 조절 가능</span>
          )}
        </div>
        {recs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {recs.map((r) => (
              <RecommendCard key={r.id} rec={r} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border-2 border-dashed border-edge/40 bg-panel px-4 py-10 text-center text-sm text-cream/60">
            추천 테마를 불러오지 못했어. 잠시 뒤에 다시 진단해 줘.
          </p>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onRestart}
          className="rough rounded-xl border-2 border-edge bg-panel px-4 py-2 text-sm font-bold transition active:scale-[0.97]"
        >
          다시 진단
        </button>
        <Link
          href="/region"
          className="rough rounded-xl border-2 border-edge bg-panel px-4 py-2 text-sm font-bold transition active:scale-[0.97]"
        >
          지역별 테마
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
```

- [ ] **Step 4: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 출력 없음

- [ ] **Step 5: 커밋**

```bash
git add components/quiz
git commit -m "취향 찾기: 문항 렌더러·문 진행 표시·유형 결과 컴포넌트"
```

---

### Task 6: 퀴즈 페이지 전환과 기존 코드 정리

**Files:**
- Delete: `lib/quiz.ts`
- Create: `lib/quiz/index.ts`
- Modify: `lib/store.ts` (`SavedQuiz`)
- Modify: `app/quiz/page.tsx` (전체 교체)
- Modify: `app/quiz/layout.tsx` (description)
- Modify: `components/LoggedOutCTA.tsx` (문구)
- Modify: `app/theme/[id]/page.tsx:270` (문구)
- Create: `public/types/.gitkeep`

**Interfaces:**
- Consumes: Task 1~5가 만든 모든 것
- Produces: `@/lib/quiz`에서 `MASCOT`, `QUESTIONS`, `pickQuestions`, `loadLastVariants`, `saveLastVariants`, `toValues`, `determineType`, `quizToTaste`, `focusTagsOf`, `quizPrefs`, `brandAffinity`, `QUIZ_TYPES`, 타입들을 가져올 수 있다. `SavedQuiz`에 `typeId?: string`, `values?: QuizValues`가 생기고 `answers`가 선택 필드가 된다.

- [ ] **Step 1: 기존 파일을 지우고 묶음 파일 작성**

```bash
git rm lib/quiz.ts
```

`lib/quiz/index.ts`:

```ts
export * from "./slots";
export * from "./questions";
export * from "./pick";
export * from "./score";
export * from "./types";
```

- [ ] **Step 2: 저장 형식 갱신** — `lib/store.ts`

파일 맨 위 import 들 아래에 추가:

```ts
import type { QuizValues } from "./quiz/slots";
```

`SavedQuiz` 인터페이스를 다음으로 교체:

```ts
export interface SavedQuiz {
  taste: TasteProfile;
  focusTags: string[];
  persona: {
    title: string;
    emoji: string;
    blurb: string;
    brand?: { name: string; reason: string };
  };
  typeId?: string; // 유형 16개 중 하나. 개편 전 저장분에는 없다.
  values?: QuizValues; // 슬롯별 값. 개편 전 저장분에는 없다.
  answers?: Record<string, number>; // 개편 전 형식(문항 → 선택 번호). 새로 저장하지 않는다.
  savedAt: string;
}
```

- [ ] **Step 3: 퀴즈 페이지 교체** — `app/quiz/page.tsx` 전체를 다음으로 바꾼다.

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  getRecords,
  getCatalog,
  recommend,
  saveQuiz,
  type Recommendation,
} from "@/lib/store";
import {
  MASCOT,
  QUIZ_TYPES,
  brandAffinity,
  determineType,
  focusTagsOf,
  loadLastVariants,
  pickQuestions,
  quizPrefs,
  quizToTaste,
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
  brand: { name: string; reason: string };
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
    const brand = brandAffinity(values);

    // 추천을 못 불러와도 유형 결과는 보여 준다.
    const loadRecs = async (): Promise<Recommendation[]> => {
      try {
        const [records, catalog] = await Promise.all([getRecords(), getCatalog()]);
        const played = records.map((r) => r.themeName);
        return recommend(catalog, taste, played, 4, focusTags, quizPrefs(values));
      } catch {
        return [];
      }
    };
    const [recs] = await Promise.all([
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
          brand,
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
        onAnswer={choose}
      />
      {step > 0 && (
        <button
          onClick={() => setStep(step - 1)}
          className="rounded-lg px-1 py-2 text-sm font-bold text-cream/60 transition hover:text-cream"
        >
          ← 이전 질문
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 4: 문항 수를 말하는 문구 수정**

`app/quiz/layout.tsx`의 `description`:

```ts
  description:
    "질문에 답하면 나의 방탈출 유형을 진단하고, 딱 맞는 테마를 추천받아요. 내 방탈 유형은?",
```

같은 파일 `openGraph.description`:

```ts
    description: "질문 몇 개로 방탈 유형 진단 + 맞춤 테마 추천.",
```

`components/LoggedOutCTA.tsx`:

```tsx
          {MASCOT.name}가 방탈출 취향을 진단하고 딱 맞는 방까지 추천해줘.
```

`app/theme/[id]/page.tsx` 270행 근처의 `6문항이면 방탈출 취향을 진단하고 딱 맞는 방을 추천받아요.`를 다음으로:

```tsx
          질문 몇 개로 방탈출 유형을 진단하고 딱 맞는 방을 추천받아요.
```

수정 뒤 확인:

Run: `grep -rn "문항\|11개 질문" app components --include="*.tsx" --include="*.ts"`
Expected: 출력 없음

- [ ] **Step 5: 그림 폴더 만들기**

```bash
mkdir -p public/types && touch public/types/.gitkeep
```

- [ ] **Step 6: 자동 검증**

Run: `npm test`
Expected: PASS (전체)

Run: `npx tsc --noEmit`
Expected: 출력 없음

Run: `grep -rn "buildPersona\|api/persona" app components lib --include="*.tsx" --include="*.ts" | grep -v "^app/api/persona\|^lib/ai.ts"`
Expected: 출력 없음

Run: `npx next build`
Expected: `✓ Compiled successfully`, `/quiz` 가 목록에 있음

- [ ] **Step 7: 화면 수동 확인** (`npm run dev` 후 `/quiz`)

각 항목을 실제로 해 보고 결과를 기록한다. 하나라도 다르면 고친 뒤 Step 6부터 다시 한다.

1. 화면 어디에도 문항 수 숫자나 단계 점이 없다. 문 그림이 답할수록 열리고 마지막 문항에서 완전히 열려 있다.
2. 한 회차 안에 `choice`·`binary`·`slider`가 섞여 나올 수 있다(안 나오면 "다시 진단"을 두세 번 반복해 세 형식을 모두 본다). 390px 폭에서 `binary` 카드 두 장이 위아래로 쌓이고, 슬라이더가 손가락으로 움직인다.
3. 끝까지 답하면 유형 이름·한 줄 설명·세부 성향 다섯 줄·브랜드·추천 테마 4개가 나온다. `public/types/`에 그 유형의 그림이 있으면 둥근 사각 틀에 꽉 차게 보이고, 없으면 같은 틀 안에 탈출귀 이모지가 보인다.
4. "다시 진단"을 누르면 질문 11개가 모두 직전과 다른 문장이다.
5. 중간에 "← 이전 질문"으로 돌아가면 같은 질문이 그대로 있고, 골랐던 답이 표시된다. 답을 바꾸고 끝까지 가면 결과가 나온다.
6. 마지막 문항의 선택지를 빠르게 두 번 누른다. 분석 화면이 한 번만 지나가고, 개발자 도구 Application → Local Storage 의 `escapelog:quiz:v1`에 `typeId`와 `values`가 있다.
7. 개발자 도구 Network 를 Offline 으로 바꾸고 새로 진단한다. 분석 화면에 갇히지 않고 유형 결과가 나오며 추천 자리에는 "추천 테마를 불러오지 못했어" 문구가 보인다.
8. 개발자 도구 Console 에서 `localStorage.setItem("escapelog:quiz:last-variants", "{깨짐")` 실행 후 새로고침한다. 퀴즈가 정상 시작된다.
9. `/match`를 연다. 방금 결과의 장르·공포·난이도가 "나"로 들어와 있다.
10. Console 에서 `localStorage.setItem("escapelog:quiz:v1", JSON.stringify({taste:{count:11,topGenre:"추리",genreCounts:{},fearComfort:2,difficultyFit:4},focusTags:[],persona:{title:"옛 결과",emoji:"👻",blurb:""},answers:{genre:1},savedAt:"2026-01-01T00:00:00.000Z"}))` 실행 후 `/match`를 새로고침한다. 오류 없이 추리·2·4가 들어온다(개편 전 저장분 호환).
11. 홈(로그아웃 상태)의 히어로 문구에 "6문항"이 없다.

- [ ] **Step 8: 커밋**

```bash
git add -A lib app components public/types
git commit -m "취향 찾기 개편: 회차마다 다른 질문 + 고정 유형 16개 결과로 전환"
```

---

## Self-Review 결과

- **스펙 대조:** 4장 슬롯·형식·뽑기 규칙 → Task 1·3. 5장 판정 → Task 2. 6장 질문 33개 → Task 1. 7장 유형·세부 성향 → Task 4·5. 8장 화면·문구 → Task 5·6. 9장 구조·호환·저장 → Task 2·6. 10장 그림 경로·대체 → Task 4·5·6(프롬프트 자체는 운영자 작업이라 코드 없음). 11장 테스트 → Task 1~4. 빠진 항목 없음.
- **이름 일관성:** `toValues`, `determineType`, `quizToTaste`, `focusTagsOf`, `quizPrefs`, `brandAffinity`, `pickQuestions`, `loadLastVariants`, `saveLastVariants`, `QUIZ_TYPES`, `typeImage`, `PLAYERS_LABEL`, `TIME_LABEL`, `MASCOT` — 정의한 Task 와 쓰는 Task 에서 같은 이름·인자다.
- **Review Focus:** 1 → Task 2 `toValues` 테스트 두 개. 2 → Task 3 "직전 변형 저장" 테스트 세 개. 3 → Task 1 `answerValue` 슬라이더 테스트. 4 → Task 6 `loadRecs` try/catch + 수동 7번. 5 → Task 6 `analyzing` ref + 수동 6번.
