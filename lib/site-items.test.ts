import { describe, expect, it } from "vitest";
import { liveItems, safePath, toBanners, toChips, type SiteItemRow } from "./site-items";

const row = (o: Partial<SiteItemRow>): SiteItemRow => ({
  id: 1, kind: "chip", label: "강남", body: "", cta: "", href: "", art: "", tone: "candy", ad: false,
  sort: 100, active: true, until: null, ...o,
});

describe("site-items", () => {
  it("사이트 안 주소만 통과", () => {
    expect(safePath("/region/수원")).toBe("/region/수원");
    expect(safePath("https://x.com")).toBe("");
    expect(safePath("//x.com")).toBe("");
    expect(safePath("javascript:alert(1)")).toBe("");
  });
  it("숨김·기간 지남·다른 종류는 빼고 순서대로", () => {
    const rows = [
      row({ id: 1, label: "B", sort: 2 }),
      row({ id: 2, label: "A", sort: 1 }),
      row({ id: 3, label: "끝남", until: "2026-11-14" }),
      row({ id: 4, label: "숨김", active: false }),
      row({ id: 5, label: "배너", kind: "banner" }),
      row({ id: 6, label: "오늘까지", until: "2026-11-15", sort: 3 }),
    ];
    expect(liveItems(rows, "chip", "2026-11-15").map((r) => r.label)).toEqual(["A", "B", "오늘까지"]);
  });
  it("칩: 바깥 주소는 검색 칩으로", () => {
    expect(toChips([row({ href: "https://evil.com" })], "2026-11-15")).toEqual([{ label: "강남", href: "" }]);
  });
  it("배너: 주소·그림이 없으면 빼고, 색은 정해진 셋만", () => {
    const b = toBanners(
      [
        row({ id: 1, kind: "banner", label: "퀴즈", href: "/quiz", art: "/mascot.png", tone: "pink" }),
        row({ id: 2, kind: "banner", label: "그림 없음", href: "/quiz" }),
      ],
      "2026-11-15"
    );
    expect(b).toHaveLength(1);
    expect(b[0]).toMatchObject({ title: "퀴즈", tone: "candy", cta: "보러 가기" });
  });
});
