import { describe, expect, it } from "vitest";
import type { EscapeRecord } from "./store";
import { isSameTheme, summarizeReviews } from "./reviews";

const r = (p: Partial<EscapeRecord>) =>
  ({ themeName: "후즈데어", cafeName: "키이스케이프 강남점", success: true, rating: 4, hintCount: 1, ...p }) as EscapeRecord;
const theme = { name: "후즈데어", cafe: "키이스케이프 후즈데어" };

describe("isSameTheme", () => {
  it("이름(공백·대소문자 무시)과 브랜드가 같으면 같은 테마", () => {
    expect(isSameTheme(r({ themeName: "후즈 데어" }), theme)).toBe(true);
  });
  it("매장을 안 적었으면 이름만 본다", () => {
    expect(isSameTheme(r({ cafeName: "" }), theme)).toBe(true);
  });
  it("이름이 같아도 다른 브랜드면 다른 테마", () => {
    expect(isSameTheme(r({ cafeName: "제로월드 홍대점" }), theme)).toBe(false);
  });
});

describe("summarizeReviews", () => {
  it("없으면 null, 있으면 성공률·평균 별점·노힌트", () => {
    expect(summarizeReviews([])).toBeNull();
    expect(
      summarizeReviews([r({ rating: 5, hintCount: 0 }), r({ rating: 4 }), r({ success: false, rating: 2 })])
    ).toEqual({ count: 3, successRate: 67, avgRating: 3.7, noHint: 1 });
  });
});
