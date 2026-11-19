import { buildPosterIndex, findPoster } from "./poster";
import { isMurder } from "./kind";
import { brandOf } from "./cafe";

// "요즘 많이 다녀온 방": 공개 후기(글 공개)를 테마별로 세어 순위를 낸다. 순수 함수.
// 최근 days 일 안에 다녀온(없으면 올린) 기록만 세고, 그 기간에 순위가 min 개도 안 나오면 전체 기간으로 넓힌다.
export type HotReview = {
  themeName: string;
  cafeName: string;
  playedAt?: string;
  createdAt?: string;
  success: boolean;
  isSample?: boolean;
  kind?: string;
};
export type HotTheme = { id: string; name: string; cafe: string; genre: string; poster_url?: string | null };
export type HotRow = { key: string; theme: HotTheme | null; name: string; cafe: string; count: number; successRate: number };

const norm = (s: string) => (s || "").toLowerCase().replace(/[^0-9a-z가-힣]/g, "");

function tally(reviews: HotReview[], themes: HotTheme[]): HotRow[] {
  const index = buildPosterIndex(themes);
  const byId = new Map(themes.map((t) => [t.id, t]));
  const groups = new Map<string, { theme: HotTheme | null; name: string; cafe: string; n: number; ok: number }>();
  for (const r of reviews) {
    if (r.isSample || !r.themeName.trim() || isMurder(r)) continue;
    const hit = findPoster(index, r.themeName, r.cafeName);
    const theme = hit ? (byId.get(hit.id) ?? null) : null;
    const key = theme ? theme.id : `${norm(r.themeName)}|${norm(brandOf(r.cafeName))}`;
    const g = groups.get(key) ?? { theme, name: theme?.name ?? r.themeName.trim(), cafe: theme?.cafe ?? r.cafeName.trim(), n: 0, ok: 0 };
    g.n += 1;
    if (r.success) g.ok += 1;
    groups.set(key, g);
  }
  return [...groups]
    .map(([key, g]) => ({ key, theme: g.theme, name: g.name, cafe: g.cafe, count: g.n, successRate: Math.round((g.ok / g.n) * 100) }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ko"));
}

export function rankHot(
  reviews: HotReview[],
  themes: HotTheme[],
  now: Date,
  { days = 30, top = 5, min = 3 }: { days?: number; top?: number; min?: number } = {}
): { rows: HotRow[]; recent: boolean } {
  const since = now.getTime() - days * 86400000;
  const when = (r: HotReview) => Date.parse(r.playedAt || r.createdAt || "") || 0;
  const recent = tally(reviews.filter((r) => when(r) >= since), themes);
  if (recent.length >= min) return { rows: recent.slice(0, top), recent: true };
  return { rows: tally(reviews, themes).slice(0, top), recent: false };
}
