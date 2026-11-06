import { describe, expect, it } from "vitest";
import type { ThemeRow } from "@/lib/catalog-server";
import {
  BEST_CONDITIONS,
  conditionBySlug,
  listedConditions,
  MIN_BEST_THEMES,
  playersRange,
  themesForCondition,
} from "./best";

function theme(p: Partial<ThemeRow>): ThemeRow {
  return {
    id: p.name ?? "x",
    name: "x",
    cafe: "브랜드 강남점",
    genre: "모험",
    difficulty: 3,
    fear_level: 1,
    tags: null,
    teaser: null,
    time_limit: null,
    players: null,
    reservation_url: null,
    ...p,
  };
}

const must = (slug: string) => {
  const c = conditionBySlug(slug);
  if (!c) throw new Error(slug);
  return c;
};

describe("playersRange", () => {
  it("범위·단일·빈 값을 읽는다", () => {
    expect(playersRange("2~4")).toEqual([2, 4]);
    expect(playersRange("3인")).toEqual([3, 3]);
    expect(playersRange("")).toBeNull();
    expect(playersRange(null)).toBeNull();
  });
});

describe("조건 판정", () => {
  it("슬러그가 서로 겹치지 않는다", () => {
    const slugs = BEST_CONDITIONS.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("안 무서운: 공포 장르는 공포도가 낮아도 빠진다", () => {
    const c = must("안-무서운-방탈출");
    expect(c.match(theme({ genre: "감성", fear_level: 2 }))).toBe(true);
    expect(c.match(theme({ genre: "공포", fear_level: 1 }))).toBe(false);
    expect(c.match(theme({ genre: "추리", fear_level: 3 }))).toBe(false);
  });

  it("2인: 인원 정보가 없으면 넣지 않는다", () => {
    const c = must("2인-방탈출");
    expect(c.match(theme({ players: "2~4" }))).toBe(true);
    expect(c.match(theme({ players: "3~5" }))).toBe(false);
    expect(c.match(theme({ players: "" }))).toBe(false);
  });

  it("단체: 최대 인원 5명 이상", () => {
    const c = must("단체-방탈출");
    expect(c.match(theme({ players: "4~6" }))).toBe(true);
    expect(c.match(theme({ players: "2~4" }))).toBe(false);
  });
});

describe("정렬과 페이지 생성", () => {
  it("공포 목록은 무서운 순", () => {
    const c = must("공포-방탈출");
    const out = themesForCondition(c, [
      theme({ name: "덜", genre: "공포", fear_level: 3 }),
      theme({ name: "더", genre: "공포", fear_level: 5 }),
      theme({ name: "무관", genre: "감성", fear_level: 1 }),
    ]);
    expect(out.map((t) => t.name)).toEqual(["더", "덜"]);
  });

  it("최소 개수 미만인 조건은 페이지를 만들지 않는다", () => {
    const few = Array.from({ length: MIN_BEST_THEMES - 1 }, (_, i) =>
      theme({ name: `t${i}`, genre: "추리", fear_level: 1 })
    );
    expect(
      listedConditions(few).some((x) => x.condition.slug === "추리-방탈출")
    ).toBe(false);
    const enough = [...few, theme({ name: "more", genre: "추리", fear_level: 1 })];
    expect(
      listedConditions(enough).find((x) => x.condition.slug === "추리-방탈출")
        ?.count
    ).toBe(MIN_BEST_THEMES);
  });
});
