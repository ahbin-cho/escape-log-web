// 공용 모양: 지금 사이트와 같은 규칙.
// 칩 = 연한 먹선 테두리 + 흰 종이 / 고른 칩 = 주황 + 먹선 / 버튼 = 굵은 먹선 + 그림자 + 손그림 선.
export const CHIP =
  "inline-block whitespace-nowrap rounded-full border-2 border-edge/40 bg-ink px-3 py-1.5 text-[13px] font-bold transition hover:border-edge hover:bg-candy active:scale-[0.97]";
export const CHIP_ON =
  "inline-block whitespace-nowrap rounded-full border-2 border-edge bg-candy px-3 py-1.5 text-[13px] font-extrabold text-edge active:scale-[0.97]";
// 주 버튼(주황) · 보조 버튼(흰색), 둘 다 굵은 먹선
export const BTN_PRIMARY =
  "rough rounded-xl border-2 border-edge bg-candy px-5 py-3 text-center text-[15px] font-extrabold text-edge shadow-cute transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";
export const BTN_LINE =
  "rough rounded-xl border-2 border-edge bg-panel px-5 py-3 text-center text-[15px] font-extrabold transition hover:bg-ink active:scale-[0.98]";
// 빵부스러기 한 줄
export const CRUMB = "flex flex-wrap items-center gap-1 text-[13px] text-cream/60";
// 구역 제목
export const H2 = "text-xl";

// 포스터 주소 다듬기: 빈칸·줄바꿈만 들어 있는 값은 없는 것으로 본다(깨진 그림 방지).
export function posterSrc(url: string | null | undefined): string | null {
  const u = (url ?? "").trim();
  return /^https?:\/\//.test(u) ? u : null;
}

// 포스터가 있는 테마를 앞으로(순서는 그대로 유지). 포스터를 못 구한 테마가 위에 몰려 있으면 목록이 비어 보인다(운영자 요청 2026-11-20).
export function posterFirst<T extends { poster_url?: string | null }>(list: T[]): T[] {
  return [...list.filter((t) => posterSrc(t.poster_url)), ...list.filter((t) => !posterSrc(t.poster_url))];
}

/** 묶음(브랜드·지점 등) 정렬: 포스터가 하나도 없는 묶음은 맨 아래로, 그 안에서는 테마 많은 순. 묶음 안 테마도 포스터 있는 것 먼저. */
export function sortGroupsPosterFirst<K, T extends { poster_url?: string | null }>(groups: [K, T[]][]): [K, T[]][] {
  const has = (list: T[]) => (list.some((t) => posterSrc(t.poster_url)) ? 1 : 0);
  return groups
    .map(([k, list]) => [k, posterFirst(list)] as [K, T[]])
    .sort((a, b) => has(b[1]) - has(a[1]) || b[1].length - a[1].length);
}

// 공개 화면 날짜: 연도 없이 "MM.DD" (운영자 결정 2026-11-17). "2024-10-13" → "10.13"
export function shortDate(d: string | null | undefined): string {
  const m = (d ?? "").match(/^\d{4}-(\d{2})-(\d{2})/);
  return m ? `${m[1]}.${m[2]}` : (d ?? "");
}
