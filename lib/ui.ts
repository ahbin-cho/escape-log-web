// 디자인 D(친근한 버전) 공용 모양(테마 둘러보기 화면들이 같이 쓴다).
// 칩: 옅은 채움. 고른 칩은 먹색 채움 + 흰 글씨.
export const CHIP =
  "inline-block rounded-full bg-ink px-3 py-1.5 text-[13px] font-bold text-cream/75 transition hover:bg-line active:scale-[0.97]";
export const CHIP_ON =
  "inline-block rounded-full border-[2px] border-[#1D1D1D] bg-candy px-3 py-1 text-[13px] font-extrabold text-[#1D1D1D] transition active:scale-[0.97]";
// 주 버튼(먹색) · 보조 버튼(선)
export const BTN_PRIMARY =
  "rounded-xl border-[2px] border-[#1D1D1D] bg-candy px-5 py-3 text-center text-[15px] font-extrabold text-[#1D1D1D] shadow-[3px_3px_0_0_#1D1D1D] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";
export const BTN_LINE =
  "rounded-xl border-[2px] border-[#1D1D1D] bg-white px-5 py-3 text-center text-[15px] font-extrabold transition hover:bg-ink active:scale-[0.98]";
// 빵부스러기 한 줄
export const CRUMB = "flex flex-wrap items-center gap-1 text-[13px] text-cream/60";
// 구역 제목
export const H2 = "text-xl";

// 포스터 주소 다듬기: 빈칸·줄바꿈만 들어 있는 값은 없는 것으로 본다(깨진 그림 방지).
export function posterSrc(url: string | null | undefined): string | null {
  const u = (url ?? "").trim();
  return /^https?:\/\//.test(u) ? u : null;
}
