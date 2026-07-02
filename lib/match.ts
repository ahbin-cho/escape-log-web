import type { Genre } from "./store";

// ─────────────────────────────────────────────────────────────
// 친구 취향 궁합/랭킹 (무료 바이럴 훅)
// 서버 없이 동작: 각자의 취향을 짧은 "공유 코드"로 인코딩해 주고받음.
// ─────────────────────────────────────────────────────────────

export interface MateTaste {
  name: string;
  genre: Genre | null;
  fear: number; // 1~5
  diff: number; // 1~5
}

// 취향을 공유 코드로 인코딩 (base64url) — 링크/메시지로 주고받기 좋게
export function encodeTaste(t: MateTaste): string {
  const compact = { n: t.name, g: t.genre, f: t.fear, d: t.diff };
  const json = JSON.stringify(compact);
  const b64 =
    typeof window !== "undefined"
      ? window.btoa(unescape(encodeURIComponent(json)))
      : Buffer.from(json, "utf-8").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeTaste(code: string): MateTaste | null {
  try {
    const b64 = code.trim().replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof window !== "undefined"
        ? decodeURIComponent(escape(window.atob(b64)))
        : Buffer.from(b64, "base64").toString("utf-8");
    const o = JSON.parse(json);
    if (typeof o !== "object" || o === null) return null;
    return {
      name: String(o.n ?? "친구"),
      genre: (o.g ?? null) as Genre | null,
      fear: Number(o.f) || 3,
      diff: Number(o.d) || 3,
    };
  } catch {
    return null;
  }
}

export interface MatchResult {
  mate: MateTaste;
  score: number; // 0~100
  tier: string; // 등급 라벨
  emoji: string;
  comment: string; // 한 줄 코멘트 (탈출귀 톤)
}

// 두 사람 취향 궁합 점수: 장르40 + 공포30 + 난이도30
export function compatibility(me: MateTaste, mate: MateTaste): number {
  let score = 0;
  if (me.genre && mate.genre && me.genre === mate.genre) score += 40;
  else if (!me.genre || !mate.genre) score += 15; // 정보 부족 시 중립 가점
  score += Math.max(0, 30 - Math.abs(me.fear - mate.fear) * 8);
  score += Math.max(0, 30 - Math.abs(me.diff - mate.diff) * 8);
  return Math.round(Math.min(100, score));
}

function tierOf(score: number): { tier: string; emoji: string; comment: string } {
  if (score >= 85)
    return {
      tier: "천생연분 파티",
      emoji: "💞",
      comment: "이건 무조건 같이 가야 돼. 손발이 착착 맞을걸?",
    };
  if (score >= 65)
    return {
      tier: "합 좋은 동료",
      emoji: "🤝",
      comment: "취향 잘 맞아. 같이 예약 잡아도 후회 없겠어.",
    };
  if (score >= 45)
    return {
      tier: "무난한 조합",
      emoji: "🙂",
      comment: "장르만 잘 고르면 재밌게 놀 수 있어.",
    };
  return {
    tier: "정반대 취향",
    emoji: "🌗",
    comment: "취향은 갈리지만… 서로 새로운 방을 알려줄 수 있지!",
  };
}

export function rankMates(me: MateTaste, mates: MateTaste[]): MatchResult[] {
  return mates
    .map((mate) => {
      const score = compatibility(me, mate);
      const t = tierOf(score);
      return { mate, score, ...t };
    })
    .sort((a, b) => b.score - a.score);
}
