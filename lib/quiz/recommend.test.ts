import { describe, expect, it } from "vitest";
import type { CandidateTheme, Genre } from "../store";
import type { QuizValues } from "./slots";
import { recommendForQuiz } from "./recommend";

let n = 0;
const theme = (cafe: string, genre: Genre, over: Partial<CandidateTheme> = {}): CandidateTheme => ({
  id: `t${++n}`,
  name: `테마${n}`,
  cafe,
  genre,
  difficulty: 3,
  fearLevel: 3,
  tags: [],
  teaser: "",
  hint: "",
  spoiler: "",
  ...over,
});

const base: QuizValues = {
  draw1: "thrill", draw2: "thrill", play1: "rush", play2: "rush", genre: "공포",
  fear: 3, difficulty: 3, hint: 3, atmosphere: "bright", players: 0, time: "any",
  playBonus: [],
};
const v = (over: Partial<QuizValues>): QuizValues => ({ ...base, ...over });

const CATALOG: CandidateTheme[] = [
  ...Array.from({ length: 6 }, () => theme("룸즈에이 강남점", "공포")),
  ...Array.from({ length: 3 }, () => theme("제로월드 홍대점", "공포")),
  ...Array.from({ length: 4 }, () => theme("셜록홈즈 건대점", "추리")),
  ...Array.from({ length: 3 }, () => theme("키이스케이프 강남점", "추리")),
  ...Array.from({ length: 3 }, () => theme("비트포비아 홍대점", "모험")),
  ...Array.from({ length: 2 }, () => theme("키이스케이프 홍대점", "감성")),
];

describe("recommendForQuiz", () => {
  it("유형과 장르 답이 같은 쪽이면 추천이 전부 그 장르다", () => {
    const { recs } = recommendForQuiz(CATALOG, v({}), []);
    expect(recs).toHaveLength(4);
    expect(recs.every((r) => r.genre === "공포")).toBe(true);
  });

  it("유형(두뇌)과 장르 답(공포)이 다르면 두 장르를 번갈아 담는다", () => {
    const { recs } = recommendForQuiz(
      CATALOG,
      v({ draw1: "brain", draw2: "brain", genre: "공포" }),
      []
    );
    const genres = recs.map((r) => r.genre);
    expect(genres.filter((g) => g === "추리")).toHaveLength(2);
    expect(genres.filter((g) => g === "공포")).toHaveLength(2);
  });

  it("유형 쪽 장르가 먼저 나온다", () => {
    const { recs } = recommendForQuiz(
      CATALOG,
      v({ draw1: "brain", draw2: "brain", genre: "공포" }),
      []
    );
    expect(recs[0].genre).toBe("추리");
  });

  it("한 브랜드가 추천의 절반을 넘지 않는다", () => {
    const { recs } = recommendForQuiz(CATALOG, v({}), []);
    const rooms = recs.filter((r) => r.cafe.startsWith("룸즈에이"));
    expect(rooms.length).toBeLessThanOrEqual(2);
  });

  it("어울리는 브랜드는 추천에 실제로 들어 있는 브랜드다", () => {
    for (const values of [v({}), v({ draw1: "brain", draw2: "brain", genre: "추리" }), v({ draw1: "explore", draw2: "explore", genre: "모험" })]) {
      const { recs, brand } = recommendForQuiz(CATALOG, values, []);
      expect(brand).not.toBeNull();
      expect(recs.some((r) => r.cafe.startsWith(brand!.name))).toBe(true);
      expect(recs.filter((r) => r.cafe.startsWith(brand!.name)).length).toBe(
        Math.max(...Object.values(recs.reduce<Record<string, number>>((m, r) => {
          const b = r.cafe.split(" ")[0];
          m[b] = (m[b] ?? 0) + 1;
          return m;
        }, {})))
      );
    }
  });

  it("해 본 테마는 빼고, 그 장르가 모자라면 다른 추천으로 4개를 채운다", () => {
    const sad = CATALOG.filter((t) => t.genre === "감성").map((t) => t.name);
    const { recs } = recommendForQuiz(
      CATALOG,
      v({ draw1: "story", draw2: "story", genre: "감성" }),
      [sad[0]]
    );
    expect(recs).toHaveLength(4);
    expect(recs.some((r) => r.name === sad[0])).toBe(false);
    expect(recs[0].genre).toBe("감성");
    expect(new Set(recs.map((r) => r.id)).size).toBe(4);
  });

  it("카탈로그가 비면 추천도 브랜드도 없다", () => {
    expect(recommendForQuiz([], v({}), [])).toEqual({ recs: [], brand: null });
  });
});
