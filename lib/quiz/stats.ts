// 유형별 비율. 표본이 적을 때의 숫자는 의미가 없으므로 minTotal 미만이면 숨긴다.
export const MIN_TOTAL = 200;
const RARE_BELOW = 0.05;

export interface TypeShare {
  percent: number; // 반올림한 정수 퍼센트
  rare: boolean; // 실제 비율이 5% 미만
  label: string; // "전체의 15%" | "전체의 1% 미만"
}

export function typeShare(
  counts: Record<string, number>,
  typeId: string,
  minTotal = MIN_TOTAL
): TypeShare | null {
  const n = (v: number | undefined) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? v : 0);
  const total = Object.values(counts).reduce((sum, v) => sum + n(v), 0);
  if (total < minTotal) return null;
  const ratio = n(counts[typeId]) / total;
  const percent = Math.round(ratio * 100);
  return {
    percent,
    rare: ratio < RARE_BELOW,
    label: ratio < 0.01 ? "전체의 1% 미만" : `전체의 ${percent}%`,
  };
}
