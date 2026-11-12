import type { ThemeRow } from "./catalog-server";
import { brandOf } from "./cafe";
import { regionFromText } from "./region";
import { isRealTheme } from "./collection";

// ─────────────────────────────────────────────────────────────
// 매장 탐방 캐러셀("연말 모임용 서울 방탈출 카페 N곳" 등)의 매장 고르기·소개 문구.
// 우리 카탈로그 데이터로 계산한 것만 쓴다(사진·수상·영업시간 같은 확인 안 된 정보는 넣지 않음).
// ─────────────────────────────────────────────────────────────

export type CafeSummary = {
  cafe: string;
  brand: string;
  count: number;
  genres: { genre: string; n: number }[]; // 많은 순
  avgDifficulty: number; // 소수 첫째 자리
  avgFear: number;
  calmShare: number; // 공포도 2 이하 비율(0~1)
  picks: string[]; // 대표 테마(덜 무서운 순 3개)
  forWhom: string; // 이런 분께
};

const round1 = (x: number) => Math.round(x * 10) / 10;

export function summarizeCafe(cafe: string, list: ThemeRow[]): CafeSummary {
  const genreMap = new Map<string, number>();
  for (const t of list) genreMap.set(t.genre, (genreMap.get(t.genre) ?? 0) + 1);
  const genres = [...genreMap.entries()]
    .map(([genre, n]) => ({ genre, n }))
    .sort((a, b) => b.n - a.n || a.genre.localeCompare(b.genre, "ko"));
  const avgDifficulty = round1(list.reduce((s, t) => s + t.difficulty, 0) / list.length);
  const avgFear = round1(list.reduce((s, t) => s + t.fear_level, 0) / list.length);
  const calmShare = list.filter((t) => t.fear_level <= 2).length / list.length;
  const picks = [...list]
    .sort((a, b) => a.fear_level - b.fear_level || a.difficulty - b.difficulty || a.name.localeCompare(b.name, "ko"))
    .slice(0, 3)
    .map((t) => t.name);

  const top = genres[0]?.genre ?? "";
  let forWhom: string;
  if (avgFear <= 1.5 && ["추리", "감성", "판타지"].includes(top)) forWhom = "무서운 건 싫고 이야기에 빠지고 싶은 모임";
  else if (avgFear <= 1.5 && ["코믹", "아케이드", "모험"].includes(top)) forWhom = "다 같이 웃고 떠들고 싶은 모임";
  else if (avgFear <= 2.2) forWhom = "겁 많은 친구도 같이 가는 모임";
  else forWhom = "골라 가는 재미가 있는 모임(공포 테마도 있어요)";
  if (avgDifficulty >= 3.8) forWhom += " · 머리 좀 쓰고 싶다면";

  return { cafe, brand: brandOf(cafe), count: list.length, genres, avgDifficulty, avgFear, calmShare, picks, forWhom };
}

// 연말 모임용: 서울 · 테마 3개 이상 · 덜 무서운 테마가 대부분 · 브랜드당 1곳
export function pickYearEndCafes(all: ThemeRow[], limit = 6): CafeSummary[] {
  const byCafe = new Map<string, ThemeRow[]>();
  for (const t of all) {
    if (!isRealTheme(t) || regionFromText(t.cafe) !== "서울") continue;
    byCafe.set(t.cafe, [...(byCafe.get(t.cafe) ?? []), t]);
  }
  const summaries = [...byCafe.entries()]
    .filter(([, list]) => list.length >= 3)
    .map(([cafe, list]) => summarizeCafe(cafe, list))
    .filter((s) => s.calmShare >= 0.6)
    .sort((a, b) => b.count - a.count || b.calmShare - a.calmShare || a.cafe.localeCompare(b.cafe, "ko"));
  const seen = new Set<string>();
  const out: CafeSummary[] = [];
  for (const s of summaries) {
    if (seen.has(s.brand)) continue;
    seen.add(s.brand);
    out.push(s);
    if (out.length >= limit) break;
  }
  return out;
}
