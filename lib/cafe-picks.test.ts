import { describe, expect, it } from "vitest";
import type { ThemeRow } from "./catalog-server";
import { pickYearEndCafes, summarizeCafe } from "./cafe-picks";

let n = 0;
const t = (p: Partial<ThemeRow>): ThemeRow => ({
  id: `t${++n}`, name: `테마${n}`, cafe: "키이스케이프 강남점", genre: "추리", difficulty: 3, fear_level: 1,
  tags: null, teaser: null, time_limit: null, players: null, reservation_url: null, ...p,
});

describe("매장 요약", () => {
  it("장르 구성·평균·대표 테마(덜 무서운 순)·이런 분께", () => {
    const s = summarizeCafe("A 강남점", [
      t({ name: "무서움", fear_level: 5, genre: "공포" }),
      t({ name: "잔잔", fear_level: 1, genre: "감성" }),
      t({ name: "추리방", fear_level: 1 }),
      t({ name: "추리방2", fear_level: 2 }),
    ]);
    expect(s.count).toBe(4);
    expect(s.genres[0]).toEqual({ genre: "추리", n: 2 });
    expect(s.picks[0]).not.toBe("무서움");
    expect(s.calmShare).toBe(0.75);
    expect(s.forWhom).toContain("모임");
  });
});

describe("연말 모임 매장 고르기", () => {
  it("서울·테마 3개 이상·덜 무서운 곳·브랜드당 1곳", () => {
    const pool = [
      ...Array.from({ length: 4 }, () => t({ cafe: "키이스케이프 강남점" })),
      ...Array.from({ length: 3 }, () => t({ cafe: "키이스케이프 홍대점" })), // 같은 브랜드 → 하나만
      ...Array.from({ length: 3 }, () => t({ cafe: "공포집 강남점", fear_level: 5, genre: "공포" })), // 무서움 → 제외
      ...Array.from({ length: 5 }, () => t({ cafe: "제로월드 부산점" })), // 서울 아님 → 제외
      ...Array.from({ length: 2 }, () => t({ cafe: "작은곳 홍대점" })), // 테마 2개 → 제외
      t({ cafe: "키이스케이프 강남점", name: "WELCOME LOCK (대기실 컨텐츠)" }), // 대기실 → 제외
    ];
    const picks = pickYearEndCafes(pool);
    expect(picks.map((p) => p.cafe)).toEqual(["키이스케이프 강남점"]);
    expect(picks[0].count).toBe(4);
  });
});
