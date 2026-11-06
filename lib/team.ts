import type { CandidateTheme, Genre } from "./store";
import { compatibility, decodeTaste, encodeTaste, type MateTaste } from "./match";

// ─────────────────────────────────────────────────────────────
// 우리 팀 궁합: 3~6명이 함께 갈 방을 고른다.
// 원칙: 제일 겁 많은 사람이 못 들어가는 방은 빼고, 난이도는 팀 평균에 맞추고,
//       장르는 많이 겹치는 쪽, 인원은 팀 인원이 들어가는 방.
// 팀 링크 하나로 단톡방에서 같은 결과를 본다(서버 저장 없음).
// ─────────────────────────────────────────────────────────────

export const TEAM_MAX = 8;

export type TeamProfile = {
  size: number;
  fearCap: number; // 이보다 무서운 방은 제외 (제일 겁 많은 사람 기준)
  diffTarget: number; // 팀 평균 난이도 (소수 첫째 자리)
  genres: { genre: Genre; votes: number }[]; // 많이 고른 순
  harmony: number; // 팀 전체 궁합(모든 쌍 평균, 0~100)
  scaredest: string | null; // 공포 기준을 정한 사람 이름
};

export type TeamPick = CandidateTheme & { score: number; reasons: string[] };

export function teamProfile(members: MateTaste[]): TeamProfile {
  const size = members.length;
  const fearCap = size ? Math.min(...members.map((m) => m.fear)) : 3;
  const diffTarget = size
    ? Math.round((members.reduce((s, m) => s + m.diff, 0) / size) * 10) / 10
    : 3;

  const votes = new Map<Genre, number>();
  for (const m of members) if (m.genre) votes.set(m.genre, (votes.get(m.genre) ?? 0) + 1);
  const genres = [...votes.entries()]
    .map(([genre, v]) => ({ genre, votes: v }))
    .sort((a, b) => b.votes - a.votes);

  let sum = 0;
  let pairs = 0;
  for (let i = 0; i < size; i++)
    for (let j = i + 1; j < size; j++) {
      sum += compatibility(members[i], members[j]);
      pairs++;
    }

  const scared = members.filter((m) => m.fear === fearCap);
  return {
    size,
    fearCap,
    diffTarget,
    genres,
    harmony: pairs ? Math.round(sum / pairs) : 0,
    // 여러 명이 같으면 특정인을 지목하지 않는다
    scaredest: size > 1 && scared.length === 1 ? scared[0].name : null,
  };
}

function playersRange(s: string | undefined): [number, number] | null {
  const nums = ((s ?? "").match(/\d+/g) || []).map(Number);
  if (!nums.length) return null;
  return [Math.min(...nums), Math.max(...nums)];
}

export function pickForTeam(
  catalog: CandidateTheme[],
  members: MateTaste[],
  limit = 4
): TeamPick[] {
  const p = teamProfile(members);
  const votesOf = new Map(p.genres.map((g) => [g.genre, g.votes]));

  return catalog
    .filter((c) => c.fearLevel <= p.fearCap)
    .filter((c) => {
      const r = playersRange(c.players);
      return !r || (r[0] <= p.size && r[1] >= p.size); // 인원 정보 없으면 통과
    })
    .map((c) => {
      const votes = votesOf.get(c.genre as Genre) ?? 0;
      const diffGap = Math.abs(c.difficulty - p.diffTarget);
      const r = playersRange(c.players);
      const score =
        (p.size ? (votes / p.size) * 50 : 0) +
        Math.max(0, 30 - diffGap * 12) +
        (r ? 10 : 0) + // 인원이 확인된 방 우대
        (5 - c.fearLevel); // 같은 조건이면 덜 무서운 방

      const reasons: string[] = [];
      if (votes > 0) reasons.push(`${p.size}명 중 ${votes}명이 좋아하는 ${c.genre}`);
      if (diffGap <= 0.5) reasons.push(`난이도 ${c.difficulty}, 팀 평균이랑 딱`);
      if (r) reasons.push(`${p.size}명이 들어갈 수 있어`);
      if (p.size > 1) reasons.push(`공포 ${c.fearLevel}/5라 다 같이 들어가도 OK`);
      return { ...c, score, reasons: reasons.slice(0, 3) };
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "ko"))
    .slice(0, limit);
}

// 팀 링크(?t=코드.코드.코드) — 각자의 공유 코드를 점으로 잇는다(base64url 에는 점이 없음).
export function encodeTeam(members: MateTaste[]): string {
  return members.slice(0, TEAM_MAX).map(encodeTaste).join(".");
}

export function decodeTeam(param: string): MateTaste[] {
  return param
    .split(".")
    .slice(0, TEAM_MAX)
    .map((c) => decodeTaste(c))
    .filter((m): m is MateTaste => !!m);
}

export function teamTier(harmony: number): { label: string; emoji: string } {
  if (harmony >= 80) return { label: "환상의 원팀", emoji: "🏆" };
  if (harmony >= 60) return { label: "손발 맞는 팀", emoji: "🤝" };
  if (harmony >= 40) return { label: "방만 잘 고르면 되는 팀", emoji: "🧩" };
  return { label: "취향 대잔치 팀", emoji: "🎪" };
}
