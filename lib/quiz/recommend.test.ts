import { describe, expect, it } from "vitest";
import type { CandidateTheme, Genre } from "../store";
import type { QuizValues } from "./slots";
import { recommendForQuiz, regionsIn } from "./recommend";

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

describe("지역·인원·이유·더 보기", () => {
  const BUSAN = [
    theme("비트포비아 서면점", "공포"),
    theme("비트포비아 서면점", "공포"),
    theme("룸즈에이 해운대점", "공포"),
  ];
  const ALL = [...CATALOG, ...BUSAN];

  it("지역을 고르면 그 지역 방만 나온다", () => {
    const { recs } = recommendForQuiz(ALL, v({}), [], { region: "부산" });
    expect(recs).toHaveLength(3);
    expect(recs.every((r) => /서면|해운대/.test(r.cafe))).toBe(true);
  });

  it("지역에 방이 없으면 빈 결과", () => {
    expect(recommendForQuiz(ALL, v({}), [], { region: "제주" })).toEqual({ recs: [], brand: null });
  });

  it("지역을 안 고르면 전국에서 뽑는다", () => {
    const { recs } = recommendForQuiz(ALL, v({}), []);
    expect(recs).toHaveLength(4);
  });

  it("인원을 답했으면 그 인원이 못 들어가는 방은 뺀다", () => {
    const cat = [
      theme("룸즈에이 강남점", "공포", { players: "2~4" }),
      theme("제로월드 홍대점", "공포", { players: "3~6" }),
      theme("지구별 건대점", "공포", { players: "" }),
      theme("상상의문 강남점", "공포", { players: "1~2" }),
    ];
    const names = (players: number) =>
      recommendForQuiz(cat, v({ players }), []).recs.map((r) => r.cafe.split(" ")[0]).sort();
    expect(names(1)).toEqual(["상상의문", "지구별"]);
    expect(names(2)).toEqual(["룸즈에이", "상상의문", "지구별"]);
    expect(names(4)).toEqual(["룸즈에이", "제로월드", "지구별"]); // 3~4명
    expect(names(5)).toEqual(["제로월드", "지구별"]); // 5명 이상
    expect(names(0)).toHaveLength(4); // 상관없음
  });

  it("추천마다 이유가 1~3개 붙고, 유형과 이어지는 이유가 맨 앞이다", () => {
    const { recs } = recommendForQuiz(
      CATALOG,
      v({ draw1: "brain", draw2: "brain", genre: "공포" }),
      []
    );
    for (const r of recs) {
      expect(r.reasons.length).toBeGreaterThanOrEqual(1);
      expect(r.reasons.length).toBeLessThanOrEqual(3);
    }
    expect(recs.find((r) => r.genre === "추리")!.reasons[0]).toBe("두뇌형이 좋아하는 추리");
    expect(recs.find((r) => r.genre === "공포")!.reasons[0]).toBe("네가 고른 공포 장르");
  });

  it("공포 수위·난이도·인원·시간이 맞으면 이유에 들어간다", () => {
    const cat = [theme("룸즈에이 강남점", "모험", { fearLevel: 3, difficulty: 3, players: "2~4", timeLimit: 60 })];
    const { recs } = recommendForQuiz(cat, v({ players: 2, time: "normal" }), []);
    // 장르가 유형·답 어느 쪽도 아니므로 나머지 이유가 앞에서부터 3개
    expect(recs[0].reasons).toEqual(["공포 수위가 딱 맞아", "난이도가 딱 맞아", "2인이 하기 좋아"]);
  });

  it("맞는 게 하나도 없으면 '새로운 도전'", () => {
    const cat = [theme("룸즈에이 강남점", "모험", { fearLevel: 1, difficulty: 1 })];
    const { recs } = recommendForQuiz(cat, v({ fear: 5, difficulty: 5 }), []);
    expect(recs[0].reasons).toEqual(["새로운 도전"]);
  });

  it("limit 을 늘리면 앞의 추천은 그대로 두고 뒤에 이어 붙인다", () => {
    const four = recommendForQuiz(ALL, v({}), [], { limit: 4 }).recs.map((r) => r.id);
    const eight = recommendForQuiz(ALL, v({}), [], { limit: 8 }).recs.map((r) => r.id);
    expect(eight).toHaveLength(8);
    expect(eight.slice(0, 4)).toEqual(four);
  });

  it("남은 방보다 limit 이 크면 있는 만큼만 준다", () => {
    expect(recommendForQuiz(BUSAN, v({}), [], { limit: 8 }).recs).toHaveLength(3);
  });
});

describe("regionsIn", () => {
  it("카탈로그에 있는 지역만, 정해진 순서로, 개수와 함께 준다", () => {
    const cat = [
      theme("비트포비아 서면점", "공포"),
      theme("룸즈에이 강남점", "공포"),
      theme("제로월드 홍대점", "공포"),
      theme("어딘지모름 본점", "공포"),
    ];
    expect(regionsIn(cat)).toEqual([
      { region: "서울", count: 2 },
      { region: "부산", count: 1 },
    ]);
  });
});
