import { describe, expect, it } from "vitest";
import { rankHot } from "./hot";

const themes = [
  { id: "n", name: "NOX", cafe: "제로월드 홍대점", genre: "추리", poster_url: "" },
  { id: "b", name: "FILM BY BOB", cafe: "키이스케이프 메모리컴퍼니", genre: "기타", poster_url: "" },
];
const now = new Date("2026-11-17T00:00:00Z");
const r = (themeName: string, cafeName: string, playedAt: string, success = true, isSample = false) => ({ themeName, cafeName, playedAt, success, isSample });

describe("rankHot", () => {
  it("최근 30일 기록을 테마별로 세고, 표기가 달라도 같은 테마로 묶는다", () => {
    const { rows, recent } = rankHot(
      [r("NOX", "제로월드 홍대점", "2026-11-10"), r("녹스", "제로월드 홍대점", "2026-11-01", false), r("필름 바이 밥", "키이스케이프 메모리컴퍼니", "2026-11-05"), r("없는방", "어딘가", "2026-11-03")],
      themes,
      now
    );
    expect(recent).toBe(true);
    expect(rows[0]).toMatchObject({ key: "n", count: 2, successRate: 50 });
    expect(rows.map((x) => x.name)).toContain("없는방");
  });
  it("최근 기록이 적으면 전체 기간으로, 예시 후기는 세지 않는다", () => {
    const { rows, recent } = rankHot([r("NOX", "제로월드 홍대점", "2024-10-13"), r("NOX", "", "2026-11-10", true, true)], themes, now);
    expect(recent).toBe(false);
    expect(rows).toHaveLength(1);
    expect(rows[0].count).toBe(1);
  });
});
