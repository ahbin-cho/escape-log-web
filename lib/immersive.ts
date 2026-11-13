// 배우가 나오는 방(이머시브) 모음. 순수 함수만(테스트 대상).
// catalog.tags 에 '이머시브'(배우가 처음부터 끝까지 함께) 가 있으면 모음에 들어간다.
// '이머시브연극' 도 있으면 퍼즐 없는 연극형, 없으면 퍼즐이 있는 방탈출형.
// 공식 안내로 확인된 것에만 꼬리표를 단다(docs/immersive.md).

export const IMMERSIVE_TAG = "이머시브";
export const THEATRE_TAG = "이머시브연극";

export type ImmersiveKind = "theatre" | "escape";

export function immersiveKind(tags: string[] | null | undefined): ImmersiveKind | null {
  const t = tags ?? [];
  if (t.includes(THEATRE_TAG)) return "theatre";
  if (t.includes(IMMERSIVE_TAG)) return "escape";
  return null;
}

export function splitImmersive<T extends { tags: string[] | null }>(rows: T[]): { theatre: T[]; escape: T[] } {
  const theatre: T[] = [];
  const escape: T[] = [];
  for (const r of rows) {
    const k = immersiveKind(r.tags);
    if (k === "theatre") theatre.push(r);
    else if (k === "escape") escape.push(r);
  }
  return { theatre, escape };
}

// 가격 칸은 자유 글(예: "69,000원", "1인 25,000원") → 그대로 보여 주되 비어 있으면 없음
export function priceLabel(price: string | number | null | undefined): string | null {
  if (price === null || price === undefined) return null;
  const s = String(price).trim();
  if (!s || /^0+$/.test(s)) return null; // 0 = 모름(화면에 안 보임)
  return /^\d+$/.test(s) ? `${Number(s).toLocaleString("ko-KR")}원` : s;
}
