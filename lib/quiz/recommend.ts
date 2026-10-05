import {
  recommend,
  type CandidateTheme,
  type Genre,
  type Recommendation,
} from "../store";
import { brandOf } from "../cafe";
import { regionFromText, REGIONS, type Region } from "../region";
import type { Draw, QuizValues } from "./slots";
import { determineDraw, focusTagsOf, quizPrefs, quizToTaste } from "./score";
import { PLAYERS_LABEL } from "./types";

// ─────────────────────────────────────────────────────────────
// 퀴즈 결과용 추천. 유형(끌리는 것)·장르 답·어울리는 브랜드가
// 서로 어긋나지 않도록 한 곳에서 같이 정한다.
//  - 유형이 가리키는 장르를 먼저, 장르 답이 다른 쪽이면 번갈아 담는다.
//  - 한 브랜드가 추천의 절반을 넘지 않게 한다.
//  - "어울리는 브랜드"는 실제로 추천에 가장 많이 담긴 브랜드다.
//  - 지역을 고르면 그 지역 방만, 인원을 답했으면 그 인원이 들어갈 수 있는 방만.
//  - 추천마다 왜 맞는지 이유를 최대 3개 붙인다.
// ─────────────────────────────────────────────────────────────

const DRAW_GENRES: Record<Draw, Genre[]> = {
  thrill: ["공포"],
  brain: ["추리"],
  story: ["감성", "코믹"],
  explore: ["모험", "SF"],
};

const PAGE = 4; // 한 번에 보여 주는 개수("더 보기"마다 한 묶음씩)
const PER_BRAND = 2; // 한 묶음 안에서 한 브랜드가 차지할 수 있는 최대 개수
const MAX_REASONS = 3;

const DRAW_LABEL: Record<Draw, string> = {
  thrill: "스릴",
  brain: "두뇌",
  story: "이야기",
  explore: "탐험",
};

export type QuizRec = Recommendation & { reasons: string[] };

export interface QuizRecommendation {
  recs: QuizRec[];
  // reason 은 항상 빈 문자열(저장 형식 호환용). 브랜드 성격을 단정하는 문구는 쓰지 않는다.
  brand: { name: string; reason: string } | null;
}

export interface RecommendOptions {
  region?: Region | null; // null·미지정 = 전국
  limit?: number; // 기본 4. 늘리면 앞의 추천은 그대로 두고 뒤에 이어 붙는다.
}

// "2~4" → [2,4], "3" → [3,3], "" → null(정보 없음)
function playersRange(s: string | undefined): [number, number] | null {
  const nums = ((s ?? "").match(/\d+/g) || []).map(Number);
  if (!nums.length) return null;
  return [Math.min(...nums), Math.max(...nums)];
}

// 선호 인원(1 | 2 | 4=3~4명 | 5=5명 이상 | 0=상관없음)이 그 방에 들어갈 수 있는가.
// 인원 정보가 없는 방은 알 수 없으므로 통과시킨다.
function fitsPlayers(players: string | undefined, pref: number): boolean {
  const range = playersRange(players);
  if (!pref || !range) return true;
  const [min, max] = range;
  if (pref === 4) return min <= 4 && max >= 3;
  if (pref === 5) return max >= 5;
  return min <= pref && max >= pref;
}

function reasonsFor(
  c: CandidateTheme,
  values: QuizValues,
  draw: Draw,
  focusTags: string[],
  timePref: number
): string[] {
  const out: string[] = [];
  if (DRAW_GENRES[draw].includes(c.genre)) out.push(`${DRAW_LABEL[draw]}형이 좋아하는 ${c.genre}`);
  else if (c.genre === values.genre) out.push(`네가 고른 ${c.genre} 장르`);
  const fearGap = Math.abs(c.fearLevel - values.fear);
  if (fearGap <= 1) out.push(`공포 수위가 ${fearGap === 0 ? "딱" : "잘"} 맞아`);
  const diffGap = Math.abs(c.difficulty - values.difficulty);
  if (diffGap <= 1) out.push(`난이도가 ${diffGap === 0 ? "딱" : "잘"} 맞아`);
  if (values.players && playersRange(c.players) && fitsPlayers(c.players, values.players)) {
    const label = PLAYERS_LABEL[values.players];
    out.push(values.players === 1 ? `${label} 하기 좋아` : `${label}이 하기 좋아`);
  }
  if (timePref && c.timeLimit && Math.abs(c.timeLimit - timePref) <= 10) {
    out.push("플레이 시간이 맞아");
  }
  const tag = c.tags.find((t) => focusTags.includes(t));
  if (tag) out.push(`#${tag} 취향`);
  return out.length ? out.slice(0, MAX_REASONS) : ["새로운 도전"];
}

// 카탈로그에 실제로 있는 지역과 테마 수(지역 칩용). REGIONS 순서를 따른다.
export function regionsIn(catalog: CandidateTheme[]): { region: Region; count: number }[] {
  const counts = new Map<Region, number>();
  for (const c of catalog) {
    const r = regionFromText(c.cafe);
    if (r) counts.set(r, (counts.get(r) ?? 0) + 1);
  }
  return REGIONS.filter((r) => counts.has(r)).map((region) => ({
    region,
    count: counts.get(region)!,
  }));
}

export function recommendForQuiz(
  catalog: CandidateTheme[],
  values: QuizValues,
  playedNames: string[],
  { region = null, limit = PAGE }: RecommendOptions = {}
): QuizRecommendation {
  const taste = quizToTaste(values);
  const focusTags = focusTagsOf(values);
  const prefs = quizPrefs(values);
  const draw = determineDraw(values);
  const typeGenres = DRAW_GENRES[draw];

  const pool = catalog.filter(
    (c) =>
      (!region || regionFromText(c.cafe) === region) &&
      fitsPlayers(c.players, values.players)
  );

  // 장르 g 를 좋아한다고 보고 점수를 매긴 전체 순위
  const ranked = (g: Genre) =>
    recommend(pool, { ...taste, topGenre: g }, playedNames, pool.length, focusTags, prefs);
  const ofGenre = (g: Genre) => ranked(g).filter((r) => r.genre === g);

  // 장르 답이 유형 쪽이면 그 장르만, 아니면 유형 장르 → 장르 답 순서로 번갈아.
  const main: Genre[] = typeGenres.includes(values.genre)
    ? [values.genre]
    : [...typeGenres, values.genre];
  const siblings = typeGenres.filter((g) => !main.includes(g));
  const mainLists = main.map(ofGenre);
  const siblingLists = siblings.map(ofGenre);
  const anyList = [ranked(main[0])];

  const recs: QuizRec[] = [];
  const used = new Set<string>();
  // 한 묶음(4개)씩 채운다. 묶음마다 브랜드 상한을 새로 세므로, limit 을 늘려도
  // 앞 묶음의 결과가 바뀌지 않는다.
  while (recs.length < limit) {
    const target = Math.min(limit, recs.length + PAGE);
    const before = recs.length;
    const perBrand = new Map<string, number>();
    const take = (r: Recommendation, cap: boolean) => {
      const b = brandOf(r.cafe);
      if (used.has(r.id) || (cap && (perBrand.get(b) ?? 0) >= PER_BRAND)) return false;
      recs.push({ ...r, reasons: reasonsFor(r, values, draw, focusTags, prefs.timePref) });
      used.add(r.id);
      perBrand.set(b, (perBrand.get(b) ?? 0) + 1);
      return true;
    };
    // 목록들에서 한 개씩 돌아가며 담는다.
    const roundRobin = (lists: Recommendation[][], cap: boolean) => {
      const at = lists.map(() => 0);
      let took = true;
      while (recs.length < target && took) {
        took = false;
        for (let i = 0; i < lists.length && recs.length < target; i++) {
          while (at[i] < lists[i].length) {
            if (take(lists[i][at[i]++], cap)) {
              took = true;
              break;
            }
          }
        }
      }
    };
    roundRobin(mainLists, true);
    roundRobin(siblingLists, true); // 같은 유형의 다른 장르로 채움
    roundRobin(anyList, true); // 그래도 모자라면 장르 무관 상위
    roundRobin(anyList, false); // 브랜드가 적으면 상한을 푼다
    if (recs.length === before) break; // 더 담을 방이 없다
  }

  if (recs.length === 0) return { recs, brand: null };
  const tally = new Map<string, number>();
  for (const r of recs) tally.set(brandOf(r.cafe), (tally.get(brandOf(r.cafe)) ?? 0) + 1);
  let name = brandOf(recs[0].cafe);
  for (const [b, count] of tally) {
    if (count > (tally.get(name) ?? 0)) name = b;
  }
  return { recs, brand: { name, reason: "" } };
}
