import { describe, expect, it } from "vitest";
import type { EscapeRecord } from "./store";
import {
  buildPosterIndex,
  cellImage,
  dayCover,
  initialMonth,
  monthCells,
  recordsByDay,
  shiftMonth,
} from "./calendar";

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
  createdAt: "2026-11-01T00:00:00Z",
  ...p,
});

describe("monthCells", () => {
  it("2026년 11월은 일요일에 시작해 30일, 5주", () => {
    const cells = monthCells("2026-11");
    expect(cells[0]).toBe("2026-11-01");
    expect(cells.filter(Boolean)).toHaveLength(30);
    expect(cells).toHaveLength(35);
  });

  it("첫 주 앞쪽은 빈칸 (2026년 10월 1일은 목요일)", () => {
    const cells = monthCells("2026-10");
    expect(cells.slice(0, 4)).toEqual([null, null, null, null]);
    expect(cells[4]).toBe("2026-10-01");
    expect(cells.length % 7).toBe(0);
  });
});

describe("shiftMonth", () => {
  it("해를 넘긴다", () => {
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
  });
});

describe("recordsByDay", () => {
  it("플레이 날짜로 묶고, 없으면 작성일로", () => {
    const a = rec({ playedAt: "2026-11-03", createdAt: "2026-11-04T01:00:00Z" });
    const b = rec({ playedAt: "2026-11-03", createdAt: "2026-11-03T01:00:00Z" });
    const c = rec({ playedAt: "", createdAt: "2026-11-05T01:00:00Z" });
    const map = recordsByDay([a, b, c]);
    expect(map.get("2026-11-03")!.map((r) => r.id)).toEqual([b.id, a.id]);
    expect(map.get("2026-11-05")).toEqual([c]);
  });
});

describe("initialMonth", () => {
  it("이번 달 기록이 있으면 이번 달", () => {
    expect(initialMonth([rec({ playedAt: "2026-11-02" })], "2026-11-11")).toBe("2026-11");
  });
  it("없으면 가장 최근 기록 달", () => {
    const list = [rec({ playedAt: "2026-08-02" }), rec({ playedAt: "2026-09-20" })];
    expect(initialMonth(list, "2026-11-11")).toBe("2026-09");
  });
  it("기록이 없으면 이번 달", () => {
    expect(initialMonth([], "2026-11-11")).toBe("2026-11");
  });
});

describe("cellImage", () => {
  const idx = buildPosterIndex([
    { name: "고백", cafe: "키이스케이프 강남점", posterUrl: "https://x/p1" },
    { name: "고백", cafe: "키이스케이프 홍대점", posterUrl: "https://x/p2" },
    { name: "유일한 테마", cafe: "다른카페 지점", posterUrl: "https://x/p3" },
    { name: "포스터없음", cafe: "다른카페 지점", posterUrl: "" },
    { name: "깨진값", cafe: "다른카페 지점", posterUrl: "\n" },
  ]);

  it("인증샷이 먼저", () => {
    expect(cellImage(rec({ themeName: "고백", photoUrl: "me.jpg" }), idx)).toBe("me.jpg");
  });
  it("매장·테마가 맞는 포스터 (띄어쓰기 무시)", () => {
    expect(cellImage(rec({ themeName: "고 백", cafeName: "키이스케이프  홍대점" }), idx)).toBe("https://x/p2");
  });
  it("매장이 달라도 이름이 하나뿐이면 그 포스터", () => {
    expect(cellImage(rec({ themeName: "유일한 테마", cafeName: "" }), idx)).toBe("https://x/p3");
  });
  it("같은 이름이 여러 곳이면 매장이 안 맞을 때 비움", () => {
    expect(cellImage(rec({ themeName: "고백", cafeName: "모르는 곳" }), idx)).toBe("");
    expect(cellImage(rec({ themeName: "포스터없음" }), idx)).toBe("");
    expect(cellImage(rec({ themeName: "깨진값", cafeName: "다른카페 지점" }), idx)).toBe("");
  });

  it("하루 칸은 그림 있는 기록을 대표로", () => {
    const plain = rec({ themeName: "모르는 테마" });
    const pic = rec({ themeName: "유일한 테마" });
    expect(dayCover([plain, pic], idx)).toEqual({ record: pic, image: "https://x/p3" });
    expect(dayCover([plain], idx)).toEqual({ record: plain, image: "" });
    expect(dayCover([], idx)).toBeNull();
  });
});
