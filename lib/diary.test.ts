import { describe, expect, it } from "vitest";
import type { EscapeRecord } from "./store";
import {
  groupByMonth,
  nextMilestone,
  playNumbers,
  reachedMilestone,
  recapShareText,
  recapYear,
  yearRecap,
} from "./diary";

let seq = 0;
const rec = (p: Partial<EscapeRecord>): EscapeRecord => ({
  id: `r${++seq}`,
  themeName: "테마",
  cafeName: "키이스케이프 강남점",
  playedAt: "",
  genre: "추리",
  difficulty: 3,
  fearLevel: 2,
  rating: 3,
  success: true,
  remainingTime: "",
  hintCount: 1,
  oneLiner: "",
  memo: "",
  region: "",
  photoUrl: "",
  partySize: 0,
  themeType: "",
  isPublic: false,
  hidden: false,
  createdAt: "2026-01-01T00:00:00Z",
  ...p,
});

describe("playNumbers", () => {
  it("오래된 기록부터 1번, 날짜 없으면 작성일 기준", () => {
    const a = rec({ id: "a", playedAt: "2026-03-01" });
    const b = rec({ id: "b", playedAt: "2025-12-31" });
    const c = rec({ id: "c", playedAt: "", createdAt: "2026-02-01T00:00:00Z" });
    const n = playNumbers([a, b, c]);
    expect([n.get("b"), n.get("c"), n.get("a")]).toEqual([1, 2, 3]);
  });
});

describe("groupByMonth", () => {
  it("최신 달이 먼저, 달 안에서는 최신순, 성공 수", () => {
    const g = groupByMonth([
      rec({ id: "x", playedAt: "2026-10-02" }),
      rec({ id: "y", playedAt: "2026-11-05", success: false }),
      rec({ id: "z", playedAt: "2026-11-20" }),
    ]);
    expect(g.map((m) => m.label)).toEqual(["2026년 11월", "2026년 10월"]);
    expect(g[0].records.map((r) => r.id)).toEqual(["z", "y"]);
    expect(g[0].success).toBe(1);
  });
});

describe("마일스톤", () => {
  it("다음 기념 숫자와 남은 수", () => {
    expect(nextMilestone(0)).toEqual({ next: 1, left: 1 });
    expect(nextMilestone(47)).toEqual({ next: 50, left: 3 });
    expect(nextMilestone(1000)).toBeNull();
    expect(reachedMilestone(100)).toBe(100);
    expect(reachedMilestone(99)).toBeNull();
  });
});

describe("yearRecap", () => {
  const list = [
    rec({ playedAt: "2026-02-01", hintCount: 0, genre: "공포", cafeName: "제로월드 부산점" }),
    rec({ playedAt: "2026-02-15", rating: 5, themeName: "인생방" }),
    rec({ playedAt: "2026-07-01", success: false }),
    rec({ playedAt: "2026-07-03" }),
    rec({ playedAt: "2025-12-31", rating: 5 }), // 작년 → 제외
  ];

  it("그 해 기록만으로 계산한다", () => {
    const r = yearRecap(list, 2026);
    expect(r.count).toBe(4);
    expect(r.successRate).toBe(75);
    expect(r.noHint).toBe(1);
    expect(r.lifeThemes.map((x) => x.themeName)).toEqual(["인생방"]);
    expect(r.topGenre).toEqual({ genre: "추리", count: 3 });
    expect(r.regions).toEqual(["서울", "부산"]);
    expect(r.busiestMonth?.count).toBe(2);
  });

  it("결산할 해: 올해 기록이 없으면 가장 최근 해", () => {
    expect(recapYear(list, new Date("2026-11-08"))).toBe(2026);
    expect(recapYear([list[4]], new Date("2026-11-08"))).toBe(2025);
    expect(recapYear([], new Date())).toBeNull();
  });

  it("공유 문구", () => {
    const text = recapShareText(yearRecap(list, 2026), "https://x.app");
    expect(text).toContain("2026 방탈출 결산");
    expect(text).toContain("4방 플레이, 탈출 성공률 75%");
    expect(text).toContain("올해의 인생테마: 인생방");
    expect(text).toContain("2개 지역 원정");
  });
});
