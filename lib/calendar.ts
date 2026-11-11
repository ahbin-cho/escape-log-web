import type { EscapeRecord } from "./store";
import { recordDate } from "./diary";

// ─────────────────────────────────────────────────────────────
// 기록 달력: 한 달을 일~토 칸으로 펼치고, 날짜마다 그날 한 방을 채운다.
// 칸 그림은 인증샷 → 테마 포스터 → 장르 이모지 순. 화면과 테스트가 같이 쓰는 순수 함수.
// ─────────────────────────────────────────────────────────────

// "2026-11" 달의 칸: 첫 주 앞쪽 빈칸은 null, 나머지는 "2026-11-01" 같은 날짜
export function monthCells(month: string): (string | null)[] {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(y, m - 1, 1).getDay();
  const days = new Date(y, m, 0).getDate();
  const cells: (string | null)[] = Array(first).fill(null);
  for (let d = 1; d <= days; d++) cells.push(`${month}-${String(d).padStart(2, "0")}`);
  while (cells.length % 7) cells.push(null);
  return cells;
}

// "2026-11" ± n달
export function shiftMonth(month: string, n: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// 날짜별 기록 (같은 날은 먼저 쓴 기록이 앞)
export function recordsByDay(records: EscapeRecord[]): Map<string, EscapeRecord[]> {
  const map = new Map<string, EscapeRecord[]>();
  const sorted = [...records].sort((a, b) =>
    (a.createdAt || "").localeCompare(b.createdAt || "")
  );
  for (const r of sorted) {
    const day = recordDate(r);
    if (!day) continue;
    map.set(day, [...(map.get(day) ?? []), r]);
  }
  return map;
}

// 처음 펼칠 달: 이번 달에 기록이 있으면 이번 달, 없으면 가장 최근 기록이 있는 달
export function initialMonth(records: EscapeRecord[], today: string): string {
  const now = today.slice(0, 7);
  const months = records.map((r) => recordDate(r).slice(0, 7)).filter(Boolean);
  if (!months.length || months.includes(now)) return now;
  return months.sort().at(-1)!;
}

// 포스터 찾기 키: 띄어쓰기·대소문자 무시
const norm = (s: string) => s.replace(/\s+/g, "").toLowerCase();

export type PosterIndex = { byTheme: Map<string, string>; byName: Map<string, string | null> };

export function buildPosterIndex(
  rows: { name: string; cafe: string; posterUrl: string }[]
): PosterIndex {
  const byTheme = new Map<string, string>();
  const byName = new Map<string, string | null>();
  for (const r of rows) {
    const url = r.posterUrl.trim();
    if (!/^https?:\/\//.test(url)) continue; // 빈 값·줄바꿈 같은 깨진 값은 건너뜀
    byTheme.set(`${norm(r.cafe)}|${norm(r.name)}`, url);
    // 이름만으로 찾는 건 그 이름의 테마가 한 곳뿐일 때만 (여러 곳이면 null 로 막음)
    const key = norm(r.name);
    byName.set(key, byName.has(key) && byName.get(key) !== url ? null : url);
  }
  return { byTheme, byName };
}

// 칸에 깔 그림: 인증샷 → 같은 매장·테마 포스터 → 이름이 하나뿐인 테마 포스터
export function cellImage(r: EscapeRecord, idx: PosterIndex): string {
  if (r.photoUrl) return r.photoUrl;
  const name = norm(r.themeName);
  if (!name) return "";
  return idx.byTheme.get(`${norm(r.cafeName)}|${name}`) ?? idx.byName.get(name) ?? "";
}

// 하루 칸의 대표 기록: 그림이 있는 기록을 먼저, 없으면 그날 첫 기록
export function dayCover(
  list: EscapeRecord[],
  idx: PosterIndex
): { record: EscapeRecord; image: string } | null {
  if (!list.length) return null;
  for (const record of list) {
    const image = cellImage(record, idx);
    if (image) return { record, image };
  }
  return { record: list[0], image: "" };
}
