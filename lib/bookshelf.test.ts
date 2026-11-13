import { describe, expect, it } from "vitest";
import { packRows, shelfStats, shelvesByYear, spineTitle, toBook } from "./bookshelf";
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
  it("평점이 높을수록 키가 크고 5점은 인생테마 장정", () => {
    const low = toBook(rec({ id: "a", rating: 1 }));
    const high = toBook(rec({ id: "a", rating: 5 }));
    expect(high.height).toBeGreaterThan(low.height);
    expect(high.legend).toBe(true);
    expect(low.legend).toBe(false);
  });

  it("같은 기록은 늘 같은 모양", () => {
    expect(toBook(rec({ id: "x" }))).toEqual(toBook(rec({ id: "x" })));
  });

  it("연도별로 묶고 최근 해가 먼저, 해 안에서는 오래된 순", () => {
    const s = shelvesByYear([
      rec({ id: "1", playedAt: "2025-12-01" }),
      rec({ id: "2", playedAt: "2026-03-01" }),
      rec({ id: "3", playedAt: "2026-01-01" }),
    ]);
    expect(s.map((x) => x.year)).toEqual(["2026", "2025"]);
    expect(s[0].books.map((b) => b.id)).toEqual(["3", "2"]);
  });

  it("너비에 맞춰 줄을 나눈다", () => {
    const books = Array.from({ length: 10 }, (_, i) => ({ ...toBook(rec({ id: String(i) })), width: 40 }));
    const rows = packRows(books, 130, 5); // 40+5+40+5+40 = 130 → 한 줄에 3권
    expect(rows.map((r) => r.length)).toEqual([3, 3, 3, 1]);
  });

  it("통계", () => {
    const st = shelfStats([rec({ rating: 5 }), rec({ rating: 4, success: false, genre: "공포" }), rec({ rating: 5 })]);
    expect(st).toEqual({ total: 3, legends: 2, escaped: 2, topGenre: "추리" });
  });

  it("책등 제목 말줄임", () => {
    expect(spineTitle("짧은", 180)).toBe("짧은");
    expect(spineTitle("아주아주아주아주아주아주긴제목입니다", 130).endsWith("…")).toBe(true);
    expect(spineTitle("미명도감: 최초의 어둑시니", 140)).toBe("미명도감");
    expect(spineTitle("커닝시티, 사라진 사람들", 140)).toBe("커닝시티");
  });
});
