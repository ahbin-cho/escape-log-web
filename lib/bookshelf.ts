import type { EscapeRecord } from "./store";

// ─────────────────────────────────────────────────────────────
// 내 서재: 기록 하나 = 포스터 표지 한 장. 순수 함수만 둔다(테스트 대상).
// - 최근에 다녀온 방이 먼저, 해가 바뀌는 곳에 얇은 연도 표시
// - 평가 5(인생테마)는 표지에 주황 꼬리표, 실패한 방은 옅은 '실패' 표시
// ─────────────────────────────────────────────────────────────

export type Book = {
  id: string;
  title: string;
  cafe: string;
  playedAt: string; // YYYY-MM-DD (없으면 작성일)
  year: string;
  rating: number; // 1~5
  genre: string;
  success: boolean;
  legend: boolean; // 인생테마
  record: EscapeRecord;
};

export function toBook(r: EscapeRecord): Book {
  const rating = Math.min(5, Math.max(1, Math.round(r.rating || 3)));
  const date = r.playedAt || r.createdAt?.slice(0, 10) || "";
  return {
    id: r.id,
    title: r.themeName,
    cafe: r.cafeName,
    playedAt: date,
    year: date.slice(0, 4) || "—",
    rating,
    genre: r.genre,
    success: r.success,
    legend: rating === 5,
    record: r,
  };
}

// 연도별로 묶는다. 최근 해가 먼저, 해 안에서도 최근에 다녀온 방이 먼저.
export function shelvesByYear(records: EscapeRecord[]): { year: string; books: Book[] }[] {
  const books = records
    .map(toBook)
    .sort(
      (a, b) =>
        b.playedAt.localeCompare(a.playedAt) ||
        (b.record.createdAt || "").localeCompare(a.record.createdAt || "") ||
        b.id.localeCompare(a.id)
    );
  const map = new Map<string, Book[]>();
  for (const b of books) {
    const list = map.get(b.year);
    if (list) list.push(b);
    else map.set(b.year, [b]);
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] === "—" ? 1 : b[0] === "—" ? -1 : b[0].localeCompare(a[0])))
    .map(([year, list]) => ({ year, books: list }));
}

// 표지 아래 날짜: 2026-11-08 → 2026.11.08
export function coverDate(playedAt: string): string {
  return playedAt ? playedAt.replace(/-/g, ".") : "날짜 없음";
}

export function shelfStats(records: EscapeRecord[]) {
  const legends = records.filter((r) => Math.round(r.rating) >= 5).length;
  const escaped = records.filter((r) => r.success).length;
  const genreCount = new Map<string, number>();
  for (const r of records) genreCount.set(r.genre, (genreCount.get(r.genre) ?? 0) + 1);
  const topGenre = [...genreCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  return { total: records.length, legends, escaped, topGenre };
}
