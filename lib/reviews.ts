import type { EscapeRecord } from "./store";
import { isMurder } from "./kind";
import { brandOf } from "./cafe";

// ─────────────────────────────────────────────────────────────
// 테마 상세의 "내 기록 / 모두의 후기".
// 기록은 테마 id 가 아니라 이름으로 남기므로, 이름이 같고 브랜드가 같은(또는 매장을
// 안 적은) 기록만 그 테마의 후기로 본다. 같은 이름의 다른 브랜드 테마와 섞이지 않게.
// ─────────────────────────────────────────────────────────────

const norm = (s: string) => (s || "").replace(/\s+/g, "").toLowerCase();

export function isSameTheme(
  r: Pick<EscapeRecord, "themeName" | "cafeName" | "kind">,
  theme: { name: string; cafe: string }
): boolean {
  if (isMurder(r)) return false; // 테마 상세는 방탈출 후기만(같은 이름의 머더미스터리 시나리오가 섞이지 않게)
  if (norm(r.themeName) !== norm(theme.name)) return false;
  if (!r.cafeName.trim()) return true;
  return norm(brandOf(r.cafeName)) === norm(brandOf(theme.cafe));
}

export type ReviewSummary = {
  count: number;
  successRate: number; // %
  avgRating: number; // 소수 첫째 자리
  noHint: number;
  avgHint: number | null; // 힌트 개수를 적은 기록만(무제한 -1 제외). 없으면 null
  avgDifficulty: number; // 체감 난이도 1~5
  avgFear: number; // 체감 공포 1~5
  ratingDist: number[]; // [흙길, 풀길, 꽃길, 꽃밭길, 인생테마] 개수
};

const avg1 = (all: number[]) => {
  const xs = all.filter((x) => Number.isFinite(x));
  return xs.length ? Math.round((xs.reduce((s, x) => s + x, 0) / xs.length) * 10) / 10 : 0;
};

export function summarizeReviews(list: EscapeRecord[]): ReviewSummary | null {
  if (!list.length) return null;
  const success = list.filter((r) => r.success).length;
  const hints = list.map((r) => r.hintCount).filter((n) => n >= 0);
  const ratingDist = [0, 0, 0, 0, 0];
  for (const r of list) {
    const k = Math.round(r.rating);
    if (k >= 1 && k <= 5) ratingDist[k - 1] += 1;
  }
  return {
    count: list.length,
    successRate: Math.round((success / list.length) * 100),
    avgRating: avg1(list.map((r) => r.rating)),
    noHint: list.filter((r) => r.success && r.hintCount === 0).length,
    avgHint: hints.length ? avg1(hints) : null,
    avgDifficulty: avg1(list.map((r) => r.difficulty)),
    avgFear: avg1(list.map((r) => r.fearLevel)),
    ratingDist,
  };
}

// 그 테마의 첫 공개 후기: 가장 먼저 올라온 것(작성 시각 기준, 같으면 id 순).
// 첫 후기 작성자가 나중에 비공개로 돌리거나 지우면 다음 후기가 첫 후기가 된다.
export function pickFirstReview<T extends Pick<EscapeRecord, "id" | "createdAt">>(
  list: T[]
): T | null {
  if (!list.length) return null;
  return [...list].sort(
    (a, b) => (a.createdAt || "").localeCompare(b.createdAt || "") || a.id.localeCompare(b.id)
  )[0];
}
