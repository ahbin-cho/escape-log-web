import type { EscapeRecord } from "./store";

// ─────────────────────────────────────────────────────────────
// 내 서재(책장 보기): 기록 하나 = 책 한 권. 순수 함수만 둔다(테스트 대상).
// - 책 색 = 장르(천 장정 색), 키 = 평점, 인생테마(5)는 가죽·금박 + 리본
// - 왼쪽부터 오래된 순, 해마다 칸을 나눈다
// ─────────────────────────────────────────────────────────────

export type Cloth = { base: string; shade: string; foil: string };

// 달력 미니 포스터(components/PosterTile TONE)와 같은 색: 어두운 바탕 + 장르 강조색
export const CLOTH: Record<string, Cloth> = {
  공포: { base: "#2A1215", shade: "#1C0B0D", foil: "#E5604C" },
  스릴러: { base: "#1A1E2C", shade: "#10131D", foil: "#8FA3D9" },
  추리: { base: "#17282A", shade: "#0E1A1B", foil: "#6FC2A6" },
  감성: { base: "#3A2033", shade: "#281522", foil: "#F0A7C0" },
  판타지: { base: "#2A2142", shade: "#1B152C", foil: "#B9A6F2" },
  SF: { base: "#11253B", shade: "#0A1827", foil: "#6DB8F2" },
  모험: { base: "#3A2912", shade: "#271B0B", foil: "#F0B45C" },
  코믹: { base: "#3B3210", shade: "#28210A", foil: "#F2D75C" },
  아케이드: { base: "#10302F", shade: "#0A201F", foil: "#5FD0C5" },
  기타: { base: "#2B2926", shade: "#1D1B19", foil: "#D9CFC0" },
};

// 인생테마: 주황(사이트 강조색) 장정 + 먹색 글씨
export const LEGEND: Cloth = { base: "#E49A4A", shade: "#C9792D", foil: "#1D1D1D" };

export type Book = {
  id: string;
  title: string;
  cafe: string;
  playedAt: string;
  year: string;
  rating: number;
  genre: string;
  success: boolean;
  legend: boolean;
  height: number; // px (선반 안쪽 높이 대비)
  width: number; // px
  cloth: Cloth;
  record: EscapeRecord;
};

export const SHELF_INNER = 196; // 선반 안쪽 높이(px)

// 같은 기록이면 항상 같은 값(새로고침해도 책 두께가 바뀌지 않게)
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function toBook(r: EscapeRecord): Book {
  const rating = Math.min(5, Math.max(1, Math.round(r.rating || 3)));
  const legend = rating === 5;
  const h = hash(r.id || r.themeName);
  // 평점이 높을수록 키가 크다: 1점 132px ~ 5점 186px, 같은 점수끼리도 ±4px 흔들림
  const height = 118 + rating * 13.5 + ((h % 9) - 4);
  // 제목이 길수록 조금 두껍게(세로 글자가 들어가게), 34~50px
  const len = r.themeName.replace(/\s+/g, "").length;
  const width = Math.min(50, Math.max(34, 30 + Math.ceil(len / 3) * 3 + (h % 5)));
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
    legend,
    height: Math.round(height),
    width,
    cloth: legend ? LEGEND : CLOTH[r.genre] ?? CLOTH["기타"],
    record: r,
  };
}

// 연도별로 묶고(최근 해가 위), 각 해 안에서는 오래된 순(왼쪽부터 꽂은 순서)
export function shelvesByYear(records: EscapeRecord[]): { year: string; books: Book[] }[] {
  const books = records.map(toBook).sort((a, b) => a.playedAt.localeCompare(b.playedAt) || a.id.localeCompare(b.id));
  const map = new Map<string, Book[]>();
  for (const b of books) {
    const list = map.get(b.year);
    if (list) list.push(b);
    else map.set(b.year, [b]);
  }
  return [...map.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, list]) => ({ year, books: list }));
}

// 선반 너비에 맞춰 줄 나누기(책 사이 간격 gap 포함)
export function packRows(books: Book[], innerWidth: number, gap = 3): Book[][] {
  const rows: Book[][] = [];
  let row: Book[] = [];
  let used = 0;
  for (const b of books) {
    const need = (row.length ? gap : 0) + b.width;
    if (row.length && used + need > innerWidth) {
      rows.push(row);
      row = [];
      used = 0;
    }
    used += (row.length ? gap : 0) + b.width;
    row.push(b);
  }
  if (row.length) rows.push(row);
  return rows;
}

export function shelfStats(records: EscapeRecord[]) {
  const legends = records.filter((r) => Math.round(r.rating) >= 5).length;
  const escaped = records.filter((r) => r.success).length;
  const genreCount = new Map<string, number>();
  for (const r of records) genreCount.set(r.genre, (genreCount.get(r.genre) ?? 0) + 1);
  const topGenre = [...genreCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  return { total: records.length, legends, escaped, topGenre };
}

// 세로 책등에 들어갈 제목: 길면 부제(콜론·쉼표 뒤)를 떼고, 그래도 길면 말줄임
export function spineTitle(title: string, height: number): string {
  const max = Math.max(3, Math.floor((height - 58) / 14));
  let t = title.trim();
  if (t.length > max) {
    const head = t.split(/\s*[:,：]\s*/)[0].replace(/[!?.~]+$/, "").trim();
    if (head.length >= 2) t = head;
  }
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}
