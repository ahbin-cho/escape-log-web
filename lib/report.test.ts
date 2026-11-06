import { describe, expect, it } from "vitest";
import {
  buildBrandReport,
  MIN_TYPED_FOR_SHARE,
  reportMessage,
  type ClickRow,
} from "./report";

const row = (p: Partial<ClickRow>): ClickRow => ({
  theme_name: "테마A",
  cafe: "브랜드 강남점",
  source: "theme",
  type_id: null,
  // 2026-11-02 월요일 12:00 KST
  created_at: "2026-11-02T03:00:00Z",
  ...p,
});

describe("buildBrandReport", () => {
  it("테마·지점·경로를 많은 순으로 센다", () => {
    const r = buildBrandReport([
      row({}),
      row({ theme_name: "테마B", source: "recommend" }),
      row({ theme_name: "테마B", cafe: "브랜드 홍대점" }),
    ]);
    expect(r.total).toBe(3);
    expect(r.themes.map((t) => [t.key, t.count, t.percent])).toEqual([
      ["테마B", 2, 67],
      ["테마A", 1, 33],
    ]);
    expect(r.branches[0]).toMatchObject({ key: "브랜드 강남점", count: 2 });
    expect(r.sources.find((s) => s.key === "recommend")?.label).toBe("취향 맞춤 추천");
  });

  it("요일은 한국 시간 기준, 월~일 순서", () => {
    // 일요일 23:30 KST = 일요일 14:30 UTC
    const r = buildBrandReport([
      row({}),
      row({ created_at: "2026-11-08T14:30:00Z" }),
      // 월요일 00:30 KST = 일요일 15:30 UTC → 월요일로 세야 함
      row({ created_at: "2026-11-08T15:30:00Z" }),
    ]);
    expect(r.weekdays.map((d) => d.key)).toEqual(["월", "화", "수", "목", "금", "토", "일"]);
    expect(r.weekdays[0].count).toBe(2);
    expect(r.weekdays[6].count).toBe(1);
  });

  it("유형 표본이 적으면 유형 비율을 숨긴다", () => {
    const few = Array.from({ length: MIN_TYPED_FOR_SHARE - 1 }, () =>
      row({ type_id: "story-savor" })
    );
    expect(buildBrandReport(few).types).toEqual([]);
    const enough = [...few, row({ type_id: "thrill-rush" }), row({})];
    const r = buildBrandReport(enough);
    expect(r.typed).toBe(MIN_TYPED_FOR_SHARE);
    expect(r.types[0]).toMatchObject({ key: "story-savor", percent: 90 });
    expect(r.types[0].label).not.toBe("story-savor"); // 사람이 읽는 유형 이름
  });
});

describe("reportMessage", () => {
  it("숫자를 넣은 메일 초안을 만든다", () => {
    const r = buildBrandReport([row({ source: "recommend" }), row({})]);
    const msg = reportMessage("브랜드", r, "방탈로그");
    expect(msg).toContain("예약 페이지로 이동한 횟수는 2회");
    expect(msg).toContain("테마A(2회)");
    expect(msg).toContain("1회는 취향 맞춤 추천");
    expect(msg).not.toContain("취향 진단 결과가 있는"); // 유형 표본 부족
  });
});
