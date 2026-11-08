import type { EscapeRecord } from "./store";
import { brandOf } from "./cafe";

// ─────────────────────────────────────────────────────────────
// 테마 상세의 "내 기록 / 모두의 후기".
// 기록은 테마 id 가 아니라 이름으로 남기므로, 이름이 같고 브랜드가 같은(또는 매장을
// 안 적은) 기록만 그 테마의 후기로 본다. 같은 이름의 다른 브랜드 테마와 섞이지 않게.
// ─────────────────────────────────────────────────────────────

const norm = (s: string) => (s || "").replace(/\s+/g, "").toLowerCase();

export function isSameTheme(
  r: Pick<EscapeRecord, "themeName" | "cafeName">,
  theme: { name: string; cafe: string }
): boolean {
  if (norm(r.themeName) !== norm(theme.name)) return false;
  if (!r.cafeName.trim()) return true;
  return norm(brandOf(r.cafeName)) === norm(brandOf(theme.cafe));
}

export type ReviewSummary = {
  count: number;
  successRate: number; // %
  avgRating: number; // 소수 첫째 자리
  noHint: number;
};

export function summarizeReviews(list: EscapeRecord[]): ReviewSummary | null {
  if (!list.length) return null;
  const success = list.filter((r) => r.success).length;
  return {
    count: list.length,
    successRate: Math.round((success / list.length) * 100),
    avgRating: Math.round((list.reduce((s, r) => s + r.rating, 0) / list.length) * 10) / 10,
    noHint: list.filter((r) => r.success && r.hintCount === 0).length,
  };
}
