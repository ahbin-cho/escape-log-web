import type { MateTaste } from "../match";
import type { Draw, Play } from "./slots";
import { DRAWS, PLAYS } from "./slots";
import { decodeShare, shareToMate, type SharedResult } from "./share";
import { brandOf } from "../cafe";

// ─────────────────────────────────────────────────────────────
// 팀 조합 진단(/team). 3~6명이 각자 취향 진단을 하고, 결과 공유 코드를
// 주소 하나(/team?m=코드.코드.코드)에 모은다. 서버에 저장하지 않는다.
//  - 팀 이름: 끌리는 것(draw)·플레이 방식(play) 중 팀에서 많은 쪽으로 짓는다.
//  - 방 안 역할: 사람마다 6개 역할 적성 점수를 매기고, 겹치지 않게
//    팀 전체 점수가 가장 높은 배정을 고른다(최대 6명이라 전부 따져 봐도 720가지).
//  - 강점 최대 3개, 조심할 점 1개.
// 누구나 주소를 고쳐 쓸 수 있으므로 코드는 읽을 때마다 decodeShare 로 다시 검증한다.
// ─────────────────────────────────────────────────────────────

export const TEAM_MIN = 3;
export const TEAM_MAX = 6;
const SEP = ".";

export interface TeamMember extends SharedResult {
  code: string;
  label: string; // 화면용 이름. 같은 이름이 둘이면 "친구 2" 처럼 번호를 붙인다.
  draw: Draw;
  play: Play;
}

// 주소의 m 값 → 팀원. 깨진 코드는 버리고, 똑같은 코드는 한 번만, 최대 6명.
export function parseTeam(raw: string | null | undefined): TeamMember[] {
  const seen = new Set<string>();
  const out: TeamMember[] = [];
  for (const code of (raw ?? "").split(/[.,\s]+/)) {
    if (!code || seen.has(code) || out.length >= TEAM_MAX) continue;
    const r = decodeShare(code);
    if (!r) continue;
    seen.add(code);
    const [draw, play] = r.typeId.split("-") as [Draw, Play];
    out.push({ ...r, code, label: r.name, draw, play });
  }
  const count = new Map<string, number>();
  for (const m of out) {
    const n = (count.get(m.name) ?? 0) + 1;
    count.set(m.name, n);
    if (n > 1) m.label = `${m.name} ${n}`;
  }
  return out;
}

export function teamParam(members: { code: string }[]): string {
  return members.map((m) => m.code).join(SEP);
}

// 팀에 내 코드를 붙인 새 m 값. 이미 있거나 6명이 차 있으면 그대로 돌려준다.
export function addToTeam(raw: string | null | undefined, code: string): string {
  const members = parseTeam(raw);
  const param = teamParam(members);
  if (!decodeShare(code) || members.some((m) => m.code === code)) return param;
  if (members.length >= TEAM_MAX) return param;
  return param ? param + SEP + code : code;
}

export function teamPath(param: string): string {
  return param ? `/team?m=${param}` : "/team";
}

// 진단하러 갔다가 끝나면 이 팀에 붙도록 퀴즈로 보내는 주소.
export function quizForTeamPath(param: string): string {
  return `/quiz?team=${param}`;
}

// ── 방 안 역할 ───────────────────────────────────────────────

export const ROLE_IDS = ["lock", "device", "guide", "record", "mood", "hint"] as const;
export type RoleId = (typeof ROLE_IDS)[number];

export interface TeamRole {
  name: string;
  job: string; // 방 안에서 하는 일 한 줄
}

export const TEAM_ROLES: Record<RoleId, TeamRole> = {
  lock: { name: "자물쇠 담당", job: "번호가 나오면 제일 먼저 돌려 봐요. 자물쇠 앞은 이 사람 자리." },
  device: { name: "장치 해결사", job: "움직이는 장치, 숨은 버튼을 끝까지 만져 보고 작동시켜요." },
  guide: { name: "길잡이", job: "새 공간에 먼저 들어가 구조를 훑고, 다음 동선을 잡아요." },
  record: { name: "기록 담당", job: "찾은 숫자와 단서를 한곳에 모아 두고, 흩어진 걸 이어 붙여요." },
  mood: { name: "분위기 메이커", job: "막히거나 무서운 구간에서 팀 텐션을 끌어올려요." },
  hint: { name: "힌트 지킴이", job: "힌트를 언제 쓸지 정하고 남은 시간을 챙겨요." },
};

type Weights = { draw: Partial<Record<Draw, number>>; play: Partial<Record<Play, number>> };

const ROLE_WEIGHTS: Record<RoleId, Weights> = {
  lock: { draw: { brain: 3, explore: 1 }, play: { rush: 3, analyze: 1 } },
  device: { draw: { brain: 2, explore: 2 }, play: { savor: 3, analyze: 1 } },
  guide: { draw: { explore: 3, thrill: 1 }, play: { analyze: 2, rush: 1, team: 1 } },
  record: { draw: { story: 3, brain: 1 }, play: { analyze: 3, savor: 1 } },
  mood: { draw: { thrill: 3, story: 1 }, play: { team: 3, savor: 1 } },
  hint: { draw: {}, play: { team: 2, analyze: 1 } },
};

// 한 사람이 그 역할에 얼마나 맞는지(정수). 끌리는 것·플레이 방식이 기본,
// 공포를 잘 견디면 길잡이, 힌트를 아끼는 사람이면 힌트 지킴이에 더한다.
export function roleFit(m: Pick<TeamMember, "draw" | "play" | "fear" | "hint">, role: RoleId): number {
  const w = ROLE_WEIGHTS[role];
  let score = (w.draw[m.draw] ?? 0) + (w.play[m.play] ?? 0);
  if (role === "guide" && m.fear >= 4) score += 1;
  if (role === "hint") score += m.hint <= 2 ? 2 : m.hint === 3 ? 1 : 0;
  return score;
}

// 역할을 겹치지 않게 나눈다. 팀 전체 적성 합이 가장 큰 배정을 고르고,
// 같으면 앞사람이 ROLE_IDS 앞쪽 역할을 먼저 갖는 배정(먼저 찾은 것)을 쓴다.
export function assignRoles(
  members: Pick<TeamMember, "draw" | "play" | "fear" | "hint">[]
): RoleId[] {
  const n = Math.min(members.length, ROLE_IDS.length);
  const fit = members.slice(0, n).map((m) => ROLE_IDS.map((r) => roleFit(m, r)));
  let best: number[] = [];
  let bestScore = -1;
  const cur: number[] = [];
  const used = new Array(ROLE_IDS.length).fill(false);
  const walk = (i: number, score: number) => {
    if (i === n) {
      if (score > bestScore) {
        bestScore = score;
        best = [...cur];
      }
      return;
    }
    for (let r = 0; r < ROLE_IDS.length; r++) {
      if (used[r]) continue;
      used[r] = true;
      cur.push(r);
      walk(i + 1, score + fit[i][r]);
      cur.pop();
      used[r] = false;
    }
  };
  walk(0, 0);
  return best.map((r) => ROLE_IDS[r]);
}

// ── 팀 이름 ─────────────────────────────────────────────────

const DRAW_PREFIX: Record<Draw, string> = {
  thrill: "한밤의",
  brain: "두뇌파",
  story: "과몰입",
  explore: "지도 밖",
};
const PLAY_SUFFIX: Record<Play, string> = {
  rush: "돌격대",
  analyze: "수사대",
  savor: "탐방단",
  team: "원정대",
};
const DRAW_PHRASE: Record<Draw, string> = {
  thrill: "무서운 방일수록 신나는",
  brain: "문제 앞에서 눈이 반짝이는",
  story: "이야기에 푹 빠지는",
  explore: "새 공간을 찾아다니는",
};
const PLAY_PHRASE: Record<Play, string> = {
  rush: "손이 빠른 팀",
  analyze: "꼼꼼한 팀",
  savor: "천천히 음미하는 팀",
  team: "합이 좋은 팀",
};

// 2명 이상이 같고, 다른 어떤 값보다 많을 때만 그 값이 팀 색깔이다.
function dominant<T extends string>(values: T[], order: readonly T[]): T | null {
  const counts = order.map((v) => values.filter((x) => x === v).length);
  const max = Math.max(0, ...counts);
  if (max < 2 || counts.filter((c) => c === max).length > 1) return null;
  return order[counts.indexOf(max)];
}

export interface TeamName {
  name: string; // 예: "한밤의 돌격대", "올라운드 원정대"
  line: string; // 예: "무서운 방일수록 신나는, 손이 빠른 팀"
}

export function teamName(members: Pick<TeamMember, "draw" | "play">[]): TeamName {
  const d = dominant(members.map((m) => m.draw), DRAWS);
  const p = dominant(members.map((m) => m.play), PLAYS);
  return {
    name: `${d ? DRAW_PREFIX[d] : "올라운드"} ${p ? PLAY_SUFFIX[p] : "원정대"}`,
    line: `${d ? DRAW_PHRASE[d] : "취향이 골고루 섞인"}, ${p ? PLAY_PHRASE[p] : "역할이 잘 나뉘는 팀"}`,
  };
}

// ── 강점·조심할 점 ──────────────────────────────────────────

type Axes = Pick<TeamMember, "draw" | "play" | "fear" | "hint" | "difficulty">;

export function teamStrengths(members: Axes[]): string[] {
  const draws = new Set(members.map((m) => m.draw));
  const has = (k: Draw | Play) => members.some((m) => m.draw === k || m.play === k);
  const out: string[] = [];
  if (draws.size >= 3) out.push("취향이 고르게 섞여서 어떤 장르든 누군가는 신나요.");
  if (has("brain")) out.push("문제 푸는 걸 즐기는 사람이 있어 자물쇠 앞에서 오래 안 막혀요.");
  if (has("analyze")) out.push("단서를 꼼꼼히 챙기는 사람이 있어 놓치는 게 적어요.");
  if (has("team")) out.push("팀을 챙기는 사람이 있어 역할 분담이 자연스러워요.");
  if (has("explore")) out.push("넓은 방에서도 동선을 빨리 잡아요.");
  if (has("thrill")) out.push("무서운 구간에서 앞장설 사람이 있어요.");
  if (has("story")) out.push("이야기에 몰입해서 연출을 제대로 즐겨요.");
  if (has("rush")) out.push("손이 빨라 시간이 넉넉한 편이에요.");
  if (has("savor")) out.push("장치와 연출을 꼼꼼히 구경해서 끝나고 할 얘기가 많아요.");
  return out.slice(0, 3);
}

export function teamWatchOut(members: Axes[]): string {
  const n = members.length || 1;
  const count = (k: Draw | Play) => members.filter((m) => m.draw === k || m.play === k).length;
  const fears = members.map((m) => m.fear);
  const minFear = Math.min(...fears);
  const avgHint = members.reduce((s, m) => s + m.hint, 0) / n;

  if (fears.length && Math.max(...fears) - minFear >= 2 && minFear <= 2) {
    return `공포를 받아들이는 정도가 많이 달라요. 공포 ${minFear}단계 이하인 방을 고르면 다 같이 즐길 수 있어요.`;
  }
  if (count("rush") * 2 >= n && count("analyze") === 0) {
    return "다들 손이 빨라 단서를 흘리기 쉬워요. 찾은 단서는 바로 한곳에 모아 두세요.";
  }
  if (count("brain") === 0 && count("analyze") === 0) {
    return "문제 풀이를 맡을 사람이 비어 있어요. 난이도는 한 단계 낮춰 고르는 걸 추천해요.";
  }
  if (count("analyze") * 2 >= n) {
    return "다들 신중해서 시간이 빠듯할 수 있어요. 10분마다 진행 상황을 짧게 나눠요.";
  }
  if (avgHint <= 2) {
    return "다들 힌트를 아끼는 편이에요. 몇 분 남으면 힌트를 쓸지 들어가기 전에 정해 두세요.";
  }
  return "시작하자마자 누가 어디를 볼지 1분만 나눠 보세요. 같은 자리를 두 번 뒤지는 일이 줄어요.";
}

// ── 한 번에 ─────────────────────────────────────────────────

export interface TeamReport {
  members: (TeamMember & { role: RoleId })[];
  name: TeamName;
  strengths: string[];
  watchOut: string;
  mates: MateTaste[]; // 방 추천(lib/team pickForTeam)용
}

export function analyzeTeam(members: TeamMember[]): TeamReport {
  const roles = assignRoles(members);
  return {
    members: members.map((m, i) => ({ ...m, role: roles[i] })),
    name: teamName(members),
    strengths: teamStrengths(members),
    watchOut: teamWatchOut(members),
    mates: members.map((m) => ({ ...shareToMate(m), name: m.label })),
  };
}

// 추천 목록에서 한 브랜드가 perBrand 개를 넘지 않게 앞에서부터 고른다.
// 모자라면 남은 것으로 채운다(브랜드가 적은 지역).
export function spreadBrands<T extends { id: string; cafe: string }>(
  list: T[],
  limit: number,
  perBrand = 2
): T[] {
  const out: T[] = [];
  const count = new Map<string, number>();
  for (const t of list) {
    if (out.length >= limit) break;
    const b = brandOf(t.cafe);
    if ((count.get(b) ?? 0) >= perBrand) continue;
    count.set(b, (count.get(b) ?? 0) + 1);
    out.push(t);
  }
  for (const t of list) {
    if (out.length >= limit) break;
    if (!out.includes(t)) out.push(t);
  }
  return out;
}
