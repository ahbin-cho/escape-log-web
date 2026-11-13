// 공용 모양: 지금 사이트(bangtallog.com)와 같은 규칙.
// 칩 = 연한 먹선 테두리 + 흰 종이 / 고른 칩 = 주황 + 먹선 / 버튼 = 굵은 먹선 + 그림자 + 손그림 선.
export const CHIP =
  "inline-block whitespace-nowrap rounded-full border-2 border-edge/30 bg-panel px-3 py-1.5 text-[13px] font-bold transition hover:border-candy hover:text-candy active:scale-[0.97]";
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
