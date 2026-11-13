import { describe, expect, it } from "vitest";
import type { EscapeRecord } from "./store";
import { monthCardLayout, monthStats, statChips, wrapWords } from "./month-card";

let seq = 0;
const rec = (p: Partial<EscapeRecord>): EscapeRecord => ({
  id: `guest-${++seq}`,
  themeName: "테마",
  cafeName: "",
  playedAt: "",
  genre: "추리",
  difficulty: 3,
  fearLevel: 3,
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
  createdAt: `2026-01-01T00:00:${String(seq).padStart(2, "0")}Z`,
  ...p,
});

describe("monthCardLayout", () => {
  it("2026년 11월: 일요일 시작, 5주", () => {
    const L = monthCardLayout("2026-11", []);
    expect(L.title).toBe("2026년 11월의 방탈출");
    expect(L.year).toBe(2026);
    expect(L.month).toBe(11);
    expect(L.weeks).toHaveLength(5);
    expect(L.weeks.every((w) => w.length === 7)).toBe(true);
    expect(L.weeks[0][0]).toMatchObject({ day: "2026-11-01", dayNum: 1, weekday: 0 });
    expect(L.weeks[4][1]).toMatchObject({ day: "2026-11-30", dayNum: 30, weekday: 1 });
    expect(L.weeks[4][2]).toBeNull();
  });

  it("6주짜리 달(2026년 8월은 토요일 시작)", () => {
    const L = monthCardLayout("2026-08", []);
    expect(L.weeks).toHaveLength(6);
    expect(L.weeks[0].slice(0, 6).every((c) => c === null)).toBe(true);
    expect(L.weeks[0][6]?.day).toBe("2026-08-01");
    expect(L.weeks[5][1]?.day).toBe("2026-08-31");
  });

  it("하루에 두 방이면 먼저 쓴 기록이 앞, 다른 달 기록은 빠진다", () => {
    const a = rec({ themeName: "첫 방", playedAt: "2026-11-07" });
    const b = rec({ themeName: "둘째 방", playedAt: "2026-11-07" });
    const other = rec({ playedAt: "2026-10-31" });
    const L = monthCardLayout("2026-11", [b, other, a]);
    const day7 = L.weeks.flat().find((c) => c?.day === "2026-11-07")!;
    expect(day7.records.map((r) => r.themeName)).toEqual(["첫 방", "둘째 방"]);
    expect(L.stats.total).toBe(2);
  });

  it("가입 전(guest-) 기록도 그대로 들어간다", () => {
    const L = monthCardLayout("2026-11", [rec({ id: "guest-abc", playedAt: "2026-11-02" })]);
    expect(L.weeks.flat().find((c) => c?.dayNum === 2)?.records[0].id).toBe("guest-abc");
  });
});

describe("monthStats · statChips", () => {
  it("방 수, 탈출, 인생테마(별점 5)", () => {
    const s = monthStats([
      rec({ success: true, rating: 5 }),
      rec({ success: false, rating: 5 }),
      rec({ success: true, rating: 4 }),
    ]);
    expect(s).toEqual({ total: 3, escaped: 2, lifeThemes: 2 });
    expect(statChips(s)).toEqual(["이번 달 3방", "탈출 2", "인생테마 2"]);
  });

  it("인생테마가 없으면 칩을 뺀다", () => {
    expect(statChips({ total: 2, escaped: 0, lifeThemes: 0 })).toEqual(["이번 달 2방", "탈출 0"]);
  });

  it("기록이 없는 달", () => {
    expect(statChips(monthStats([]))).toEqual(["이번 달 기록 없음"]);
  });
});

describe("wrapWords", () => {
  const measure = (s: string) => Array.from(s).length; // 한 글자 = 1
  it("띄어쓰기 단위로 끊는다", () => {
    expect(wrapWords(measure, "네온 아케이드", 5, 3)).toEqual(["네온", "아케이드"]);
    expect(wrapWords(measure, "셜록 홈즈의 서재", 6, 3)).toEqual(["셜록 홈즈의", "서재"]);
  });
  it("칸보다 긴 단어만 글자로 쪼갠다", () => {
    expect(wrapWords(measure, "마법학교입학시험", 4, 3)).toEqual(["마법학교", "입학시험"]);
  });
  it("줄이 모자라면 마지막 줄 끝을 …", () => {
    const out = wrapWords(measure, "잊혀진 왕국의 마지막 수호자", 4, 2);
    expect(out).toHaveLength(2);
    expect(out[1].endsWith("…")).toBe(true);
    expect(measure(out[1])).toBeLessThanOrEqual(4);
  });
});
