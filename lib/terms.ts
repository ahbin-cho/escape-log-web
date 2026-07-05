// ─────────────────────────────────────────────────────────────
// 방탈출 커뮤니티 용어
// 별점(1~5) → "길" 등급 (진흙길…인생테마 스케일을 5단계로 압축)
// ─────────────────────────────────────────────────────────────

export const RATING_LABELS = [
  "흙길",
  "풀길",
  "꽃길",
  "꽃밭길",
  "인생테마",
] as const;

export const RATING_EMOJI = ["🟤", "🌱", "🌸", "🌷", "🏆"] as const;

export function ratingLabel(rating: number): string {
  const r = Math.round(rating);
  if (r <= 0) return "";
  return RATING_LABELS[Math.min(5, Math.max(1, r)) - 1];
}

export function ratingEmoji(rating: number): string {
  const r = Math.round(rating);
  if (r <= 0) return "";
  return RATING_EMOJI[Math.min(5, Math.max(1, r)) - 1];
}

// 공포도(테마 무서움) → 매운맛 스케일 라벨
const FEAR_LABELS = ["무공포", "순한맛", "적당맛", "매운맛", "핵불닭"] as const;
export function fearLabel(fear: number): string {
  const f = Math.round(fear);
  if (f <= 0) return "";
  return FEAR_LABELS[Math.min(5, Math.max(1, f)) - 1];
}

// 기록 → 성취 뱃지 (방탈 커뮤니티 용어)
//  · 노힌트: 힌트 0 + 성공 (노힌노탈)
//  · 반갈죽: 제한시간 절반 이상(30분+) 남기고 클리어
export function achievements(r: {
  hintCount: number;
  success: boolean;
  remainingTime: string;
}): string[] {
  const out: string[] = [];
  if (r.success && r.hintCount === 0) out.push("노힌트");
  if (r.success) {
    const min = Number((r.remainingTime.match(/(\d+)/) || [])[1]);
    if (min >= 30) out.push("반갈죽");
  }
  return out;
}

// 공포 취향(퀴즈 답 1~5) → 탱/쫄 성향어
export function fearTrait(fearComfort: number): string {
  if (fearComfort >= 5) return "찐 탱";
  if (fearComfort >= 4) return "탱 기질";
  if (fearComfort <= 1) return "쫄보";
  if (fearComfort <= 2) return "약간 쫄";
  return "";
}
