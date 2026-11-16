import { describe, expect, it } from "vitest";
import { brandAnchor, branchCounts, hiddenBrands } from "./discover";

const r = (cafe: string) => ({ cafe });

describe("숨은 매장", () => {
  const all = ["키이스케이프 강남점", "키이스케이프 홍대점", "키이스케이프 부산점", "키이스케이프 대전점", "골목방탈출 홍대점", "작은방 홍대"].map(r);
  it("지점 수를 센다", () => {
    expect(branchCounts(all).get("키이스케이프")).toBe(4);
  });
  it("지점 3곳 이상 브랜드는 빼고, 작은 매장만 테마 많은 순", () => {
    const here = ["키이스케이프 홍대점", "골목방탈출 홍대점", "골목방탈출 홍대점", "작은방 홍대"].map(r);
    const h = hiddenBrands(all, here);
    expect(h.map(([b]) => b)).not.toContain("키이스케이프");
    expect(h[0][1]).toBe(2);
  });
  it("테마가 많은 브랜드도 뺀다", () => {
    const big = Array.from({ length: 12 }, (_, i) => r(`큰방 강남점${i % 2}`));
    expect(hiddenBrands([...all, ...big], [r("큰방 강남점0")])).toEqual([]);
  });
  it("앵커 id", () => {
    expect(brandAnchor("룸 이스케이프!")).toBe("b-룸-이스케이프-");
  });
});
