import type { EscapeRecord, Genre } from "./store";
import { inferRegion } from "./region";

// ─────────────────────────────────────────────────────────────
// 방탈 다이어리: 기록을 시간순으로 번호 매기고("N번째 방"), 달별로 묶고,
// 한 해를 결산한다. 방탈출 마니아들은 "몇 방 했는지"를 정체성처럼 세기 때문에
// 번호와 기념 숫자(마일스톤)를 앞에 둔다. 화면과 테스트가 같이 쓰는 순수 함수.
// ─────────────────────────────────────────────────────────────

// 기록의 날짜: 플레이 날짜, 없으면 작성일
export function recordDate(r: EscapeRecord): string {
  return (r.playedAt || r.createdAt || "").slice(0, 10);
}

function chronoKey(r: EscapeRecord): string {
  return `${recordDate(r)}|${r.createdAt || ""}`;
}

// 기록 id → 몇 번째 방인지 (가장 오래된 기록이 1번)
export function playNumbers(records: EscapeRecord[]): Map<string, number> {
  const sorted = [...records].sort((a, b) => chronoKey(a).localeCompare(chronoKey(b)));
  return new Map(sorted.map((r, i) => [r.id, i + 1]));
}

export type MonthGroup = {
  key: string; // "2026-11" (날짜 없으면 "")
  label: string; // "2026년 11월"
  records: EscapeRecord[]; // 최신순
  success: number;
};

// 달별 묶음, 최신 달이 먼저
export function groupByMonth(records: EscapeRecord[]): MonthGroup[] {
  const map = new Map<string, EscapeRecord[]>();
  for (const r of records) {
    const key = recordDate(r).slice(0, 7);
    map.set(key, [...(map.get(key) ?? []), r]);
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] === "" ? 1 : b[0] === "" ? -1 : b[0].localeCompare(a[0])))
    .map(([key, list]) => {
      const [y, m] = key.split("-");
      return {
        key,
        label: key ? `${y}년 ${Number(m)}월` : "날짜 없음",
        records: list.sort((a, b) => chronoKey(b).localeCompare(chronoKey(a))),
        success: list.filter((r) => r.success).length,
      };
    });
}

// 기념 숫자. 마니아 문화에서 "100방", "300방" 같은 단위로 센다.
const MILESTONES = [1, 10, 30, 50, 100, 200, 300, 500, 700, 1000];

export function nextMilestone(total: number): { next: number; left: number } | null {
  const next = MILESTONES.find((m) => m > total);
  return next ? { next, left: next - total } : null;
}

// 방금 도달한 기념 숫자 (정확히 그 숫자일 때만)
export function reachedMilestone(total: number): number | null {
  return MILESTONES.includes(total) ? total : null;
}

export type YearRecap = {
  year: number;
  count: number;
  success: number;
  successRate: number; // %
  noHint: number; // 노힌트 탈출
  lifeThemes: EscapeRecord[]; // 별점 5 (최신순)
  topGenre: { genre: Genre; count: number } | null;
  regions: string[]; // 다녀온 지역 (많은 순)
  busiestMonth: { month: number; count: number } | null;
  firstOfYear: EscapeRecord | null;
};

export function yearRecap(records: EscapeRecord[], year: number): YearRecap {
  const list = records.filter((r) => recordDate(r).startsWith(`${year}-`));
  const count = list.length;
  const success = list.filter((r) => r.success).length;

  const genres = new Map<Genre, number>();
  const regions = new Map<string, number>();
  const months = new Map<number, number>();
  for (const r of list) {
    genres.set(r.genre, (genres.get(r.genre) ?? 0) + 1);
    const reg = inferRegion(r);
    if (reg) regions.set(reg, (regions.get(reg) ?? 0) + 1);
    const m = Number(recordDate(r).slice(5, 7));
    if (m) months.set(m, (months.get(m) ?? 0) + 1);
  }
  const top = <K,>(map: Map<K, number>) =>
    [...map.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;

  const g = top(genres);
  const bm = top(months);
  const chrono = [...list].sort((a, b) => chronoKey(a).localeCompare(chronoKey(b)));

  return {
    year,
    count,
    success,
    successRate: count ? Math.round((success / count) * 100) : 0,
    noHint: list.filter((r) => r.success && r.hintCount === 0).length,
    lifeThemes: list
      .filter((r) => Math.round(r.rating) === 5)
      .sort((a, b) => chronoKey(b).localeCompare(chronoKey(a))),
    topGenre: g ? { genre: g[0], count: g[1] } : null,
    regions: [...regions.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k),
    busiestMonth: bm ? { month: bm[0], count: bm[1] } : null,
    firstOfYear: chrono[0] ?? null,
  };
}

// 결산을 보여 줄 해: 올해 기록이 있으면 올해, 없으면 기록이 있는 가장 최근 해
export function recapYear(records: EscapeRecord[], now: Date): number | null {
  const years = [...new Set(records.map((r) => Number(recordDate(r).slice(0, 4))).filter(Boolean))];
  if (!years.length) return null;
  const thisYear = now.getFullYear();
  return years.includes(thisYear) ? thisYear : Math.max(...years);
}

// 단톡방·SNS에 붙여 넣는 결산 문구
export function recapShareText(r: YearRecap, url: string): string {
  const lines = [`📓 나의 ${r.year} 방탈출 결산`, `· ${r.count}방 플레이, 탈출 성공률 ${r.successRate}%`];
  if (r.noHint) lines.push(`· 노힌트 탈출 ${r.noHint}번`);
  if (r.topGenre) lines.push(`· 최애 장르 ${r.topGenre.genre} (${r.topGenre.count}방)`);
  if (r.lifeThemes[0]) lines.push(`· 올해의 인생테마: ${r.lifeThemes[0].themeName}`);
  if (r.regions.length > 1) lines.push(`· ${r.regions.length}개 지역 원정`);
  lines.push("", `너도 기록해 봐 👉 ${url}`);
  return lines.join("\n");
}
