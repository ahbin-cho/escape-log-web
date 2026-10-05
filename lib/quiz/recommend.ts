import {
  recommend,
  type CandidateTheme,
  type Genre,
  type Recommendation,
} from "../store";
import { brandOf } from "../cafe";
import type { Draw, QuizValues } from "./slots";
import { determineDraw, focusTagsOf, quizPrefs, quizToTaste } from "./score";

// ─────────────────────────────────────────────────────────────
// 퀴즈 결과용 추천. 유형(끌리는 것)·장르 답·어울리는 브랜드가
// 서로 어긋나지 않도록 한 곳에서 같이 정한다.
//  - 유형이 가리키는 장르를 먼저, 장르 답이 다른 쪽이면 번갈아 담는다.
//  - 한 브랜드가 추천의 절반을 넘지 않게 한다.
//  - "어울리는 브랜드"는 실제로 추천에 가장 많이 담긴 브랜드다.
// ─────────────────────────────────────────────────────────────

const DRAW_GENRES: Record<Draw, Genre[]> = {
  thrill: ["공포"],
  brain: ["추리"],
  story: ["감성", "코믹"],
  explore: ["모험", "SF"],
};

const BRAND_STYLE: Record<string, string> = {
  키이스케이프: "탄탄한 스토리와 완성도",
  제로월드: "강렬한 공포·연출과 높은 난이도",
  비트포비아: "활동적이고 몰입감 큰 모험",
  셜록홈즈: "정통 추리와 두뇌 플레이",
};

const LIMIT = 4;
const PER_BRAND = 2;

export interface QuizRecommendation {
  recs: Recommendation[];
  brand: { name: string; reason: string } | null; // reason 은 아는 브랜드만
}

export function recommendForQuiz(
  catalog: CandidateTheme[],
  values: QuizValues,
  playedNames: string[]
): QuizRecommendation {
  const taste = quizToTaste(values);
  const focusTags = focusTagsOf(values);
  const prefs = quizPrefs(values);
  const typeGenres = DRAW_GENRES[determineDraw(values)];

  // 장르 g 를 좋아한다고 보고 점수를 매긴 전체 순위
  const ranked = (g: Genre) =>
    recommend(catalog, { ...taste, topGenre: g }, playedNames, catalog.length, focusTags, prefs);
  const ofGenre = (g: Genre) => ranked(g).filter((r) => r.genre === g);

  // 장르 답이 유형 쪽이면 그 장르만, 아니면 유형 장르 → 장르 답 순서로 번갈아.
  const main: Genre[] = typeGenres.includes(values.genre)
    ? [values.genre]
    : [...typeGenres, values.genre];
  const siblings = typeGenres.filter((g) => !main.includes(g));

  const recs: Recommendation[] = [];
  const used = new Set<string>();
  const perBrand = new Map<string, number>();
  const take = (r: Recommendation, cap: boolean) => {
    const b = brandOf(r.cafe);
    if (used.has(r.id) || (cap && (perBrand.get(b) ?? 0) >= PER_BRAND)) return false;
    recs.push(r);
    used.add(r.id);
    perBrand.set(b, (perBrand.get(b) ?? 0) + 1);
    return true;
  };
  // 목록들에서 한 개씩 돌아가며 담는다.
  const roundRobin = (lists: Recommendation[][], cap: boolean) => {
    const at = lists.map(() => 0);
    let took = true;
    while (recs.length < LIMIT && took) {
      took = false;
      for (let i = 0; i < lists.length && recs.length < LIMIT; i++) {
        while (at[i] < lists[i].length) {
          if (take(lists[i][at[i]++], cap)) {
            took = true;
            break;
          }
        }
      }
    }
  };

  roundRobin(main.map(ofGenre), true);
  roundRobin(siblings.map(ofGenre), true); // 같은 유형의 다른 장르로 채움
  roundRobin([ranked(main[0])], true); // 그래도 모자라면 장르 무관 상위
  roundRobin([ranked(main[0])], false); // 브랜드가 적은 카탈로그면 상한을 푼다

  if (recs.length === 0) return { recs, brand: null };
  let name = brandOf(recs[0].cafe);
  for (const [b, count] of perBrand) {
    if (count > (perBrand.get(name) ?? 0)) name = b;
  }
  return { recs, brand: { name, reason: BRAND_STYLE[name] ?? "" } };
}
