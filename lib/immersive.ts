// 배우가 나오는 방(이머시브) 모음. 순수 함수만(테스트 대상).
// catalog.tags 에 '이머시브'(공식 소개가 이머시브·체험형) 가 있으면 모음에 들어간다.
// '이머시브연극' 도 있으면 연극형(공연장), 없으면 방탈출형(방탈출 매장).
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

// 기간 한정 공연(catalog.run_until 이 있는 것): 끝난 날 다음부터는 목록에서 사라진다(한국 날짜 기준).
export function kstToday(now: Date): string {
  return new Date(now.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

export function untilLabel(runUntil: string | null | undefined): string | null {
  const m = (runUntil ?? "").match(/^\d{4}-(\d{2})-(\d{2})/);
  return m ? `~${Number(m[1])}/${Number(m[2])}까지` : null;
}

export function splitImmersive<T extends { tags: string[] | null; run_until?: string | null }>(
  rows: T[],
  now: Date = new Date()
): { limited: T[]; theatre: T[]; escape: T[] } {
  const today = kstToday(now);
  const limited: T[] = [];
  const theatre: T[] = [];
  const escape: T[] = [];
  for (const r of rows) {
    const k = immersiveKind(r.tags);
    if (!k) continue;
    const until = (r.run_until ?? "").slice(0, 10);
    if (until) {
      if (until >= today) limited.push(r); // 끝난 공연은 숨김
      continue;
    }
    if (k === "theatre") theatre.push(r);
    else escape.push(r);
  }
  limited.sort((a, b) => (a.run_until ?? "").localeCompare(b.run_until ?? "")); // 곧 끝나는 것 먼저
  return { limited, theatre, escape };
}

// 가격 칸은 자유 글(예: "69,000원", "1인 25,000원") → 그대로 보여 주되 비어 있으면 없음
export function priceLabel(price: string | number | null | undefined): string | null {
  if (price === null || price === undefined) return null;
  const s = String(price).trim();
  if (!s || /^0+$/.test(s)) return null; // 0 = 모름(화면에 안 보임)
  return /^\d+$/.test(s) ? `${Number(s).toLocaleString("ko-KR")}원` : s;
}
