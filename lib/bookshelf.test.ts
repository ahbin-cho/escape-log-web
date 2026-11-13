import { describe, expect, it } from "vitest";
import { coverDate, shelfStats, shelvesByYear, toBook } from "./bookshelf";
import type { EscapeRecord } from "./store";

const rec = (o: Partial<EscapeRecord>): EscapeRecord => ({
  id: "r1",
  themeName: "테마",
  cafeName: "매장",
  playedAt: "2026-05-01",
  genre: "추리",
  difficulty: 3,
  fearLevel: 1,
  rating: 3,
  success: true,
  remainingTime: "",
  hintCount: 0,
  oneLiner: "",
  memo: "",
  region: "",
  photoUrl: "",
  partySize: 0,
  themeType: "",
  isPublic: false,
  hidden: false,
  createdAt: "2026-05-01T00:00:00Z",
  ...o,
});

describe("bookshelf", () => {
  it("평가 5는 인생테마, 그 아래는 아니다", () => {
    expect(toBook(rec({ rating: 5 })).legend).toBe(true);
    expect(toBook(rec({ rating: 4 })).legend).toBe(false);
    expect(toBook(rec({ rating: 0 })).rating).toBe(3);
  });

  it("같은 기록은 늘 같은 모양", () => {
    expect(toBook(rec({ id: "x" }))).toEqual(toBook(rec({ id: "x" })));
  });

  it("날짜가 없으면 작성일을 쓴다", () => {
    const b = toBook(rec({ playedAt: "", createdAt: "2025-03-04T10:00:00Z" }));
    expect(b.playedAt).toBe("2025-03-04");
    expect(b.year).toBe("2025");
  });

  it("연도별로 묶고 최근 해가 먼저, 해 안에서도 최근 순", () => {
    const s = shelvesByYear([
      rec({ id: "1", playedAt: "2025-12-01" }),
      rec({ id: "2", playedAt: "2026-03-01" }),
      rec({ id: "3", playedAt: "2026-01-01" }),
    ]);
    expect(s.map((x) => x.year)).toEqual(["2026", "2025"]);
    expect(s[0].books.map((b) => b.id)).toEqual(["2", "3"]);
  });

  it("같은 날이면 나중에 쓴 기록이 먼저", () => {
    const s = shelvesByYear([
      rec({ id: "a", createdAt: "2026-05-01T01:00:00Z" }),
      rec({ id: "b", createdAt: "2026-05-01T09:00:00Z" }),
    ]);
    expect(s[0].books.map((b) => b.id)).toEqual(["b", "a"]);
  });

  it("통계", () => {
    const st = shelfStats([rec({ rating: 5 }), rec({ rating: 4, success: false, genre: "공포" }), rec({ rating: 5 })]);
    expect(st).toEqual({ total: 3, legends: 2, escaped: 2, topGenre: "추리" });
  });

  it("표지 날짜", () => {
    expect(coverDate("2026-11-08")).toBe("2026.11.08");
    expect(coverDate("")).toBe("날짜 없음");
  });
});
