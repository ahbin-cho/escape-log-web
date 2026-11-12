import type { EscapeRecord, Genre } from "./store";
import { DRAWS, PLAYS, type Draw, type Play, type TypeId } from "./quiz/slots";

// ─────────────────────────────────────────────────────────────
// 기록으로 보는 방탈출 유형. 취향 찾기(질문)와 같은 16유형을
// 실제로 다녀온 방에서 읽어 낸다. 순수 함수(테스트 대상).
//  · 끌리는 것(draw): 어떤 장르를 많이, 그리고 좋게 했는가
//  · 노는 방식(play): 힌트·남은 시간·인원·후기를 남기는 습관
// ─────────────────────────────────────────────────────────────

export const TYPE_MIN_RECORDS = 3; // 이보다 적으면 유형을 말하지 않는다

const GENRE_DRAW: Partial<Record<Genre, Draw>> = {
  공포: "thrill",
  스릴러: "thrill",
  추리: "brain",
  아케이드: "brain",
  감성: "story",
  코믹: "story",
  모험: "explore",
  SF: "explore",
  판타지: "explore",
};

export interface RecordType {
  typeId: TypeId;
  draw: Draw;
  play: Play;
  evidence: string[]; // 왜 이 유형인지(기록에서 나온 사실)
}

const minutesLeft = (s: string) => {
  const m = s.match(/(\d+)\s*분/) ?? s.match(/^\s*(\d+)\s*[:：]/) ?? s.match(/^\s*(\d+)\s*$/);
  return m ? Number(m[1]) : null;
};

function top<T extends string>(order: readonly T[], scores: Record<T, number>): T {
  const max = Math.max(...order.map((k) => scores[k]));
  return order.find((k) => scores[k] === max)!;
}

export function typeFromRecords(records: EscapeRecord[]): RecordType | null {
  if (records.length < TYPE_MIN_RECORDS) return null;
  const n = records.length;

  // ── 끌리는 것: 장르 수 × 별점 가중(좋았던 방일수록 크게) ──
  const drawScore: Record<Draw, number> = { thrill: 0, brain: 0, story: 0, explore: 0 };
  const drawCount: Record<Draw, number> = { thrill: 0, brain: 0, story: 0, explore: 0 };
  for (const r of records) {
    const d = GENRE_DRAW[r.genre];
    if (!d) continue;
    const rating = Number(r.rating) || 0;
    drawScore[d] += rating >= 4 ? 2 : rating === 3 || rating === 0 ? 1 : 0.4;
    drawCount[d] += 1;
    if (d !== "brain" && (r.themeType === "문제" || r.themeType === "자물쇠")) drawScore.brain += 0.5;
  }
  const draw = top(DRAWS, drawScore);

  // ── 노는 방식 ──
  const cleared = records.filter((r) => r.success);
  const noHint = cleared.filter((r) => r.hintCount === 0).length;
  const hinted = records.filter((r) => r.hintCount > 0);
  const avgHints = hinted.length ? hinted.reduce((s, r) => s + r.hintCount, 0) / hinted.length : 0;
  const manyHints = records.filter((r) => r.hintCount >= 3 || r.hintCount < 0).length;
  const fast = cleared.filter((r) => (minutesLeft(r.remainingTime) ?? 0) >= 15).length;
  const sized = records.filter((r) => r.partySize > 0);
  const avgParty = sized.length ? sized.reduce((s, r) => s + r.partySize, 0) / sized.length : 0;
  const wrote = records.filter((r) => r.oneLiner.trim() || r.memo.trim()).length;
  const loved = records.filter((r) => Number(r.rating) >= 4).length;

  const playScore: Record<Play, number> = {
    analyze: (noHint / n) * 4,
    rush: (fast / n) * 3 + (manyHints / n) * 2,
    team: avgParty >= 4 ? 2 + (avgParty - 4) * 0.5 : avgParty >= 3.5 ? 1 : 0,
    savor: (wrote / n) * 2 + (loved / n) * 1,
  };
  // 정의 순서(rush, analyze, savor, team)대로 동점 처리
  const play = top(PLAYS, playScore);

  // ── 근거 문장 ──
  const DRAW_WORD: Record<Draw, string> = {
    thrill: "공포·스릴러",
    brain: "추리·문제",
    story: "감성·이야기",
    explore: "모험·판타지·SF",
  };
  const evidence: string[] = [`${n}방 중 ${drawCount[draw]}방이 ${DRAW_WORD[draw]} 쪽이에요`];
  if (play === "analyze") evidence.push(`노힌트 탈출이 ${noHint}번이에요`);
  if (play === "rush")
    evidence.push(
      fast >= manyHints ? `15분 넘게 남기고 나온 방이 ${fast}번이에요` : `힌트를 아끼지 않고 쓴 방이 ${manyHints}번이에요`
    );
  if (play === "team") evidence.push(`평균 ${avgParty.toFixed(1)}명이서 다녔어요`);
  if (play === "savor") evidence.push(`${n}방 중 ${wrote}방에 후기·메모를 남겼어요`);
  if (play !== "analyze" && hinted.length >= 2) evidence.push(`힌트는 평균 ${avgHints.toFixed(1)}개 썼어요`);

  return { typeId: `${draw}-${play}`, draw, play, evidence };
}
