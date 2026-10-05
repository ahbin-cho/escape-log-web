import { describe, expect, it } from "vitest";
import { typeShare } from "./stats";

describe("typeShare", () => {
  it("표본이 200건 미만이면 null", () => {
    expect(typeShare({ "thrill-rush": 50, "brain-team": 149 }, "thrill-rush")).toBeNull();
  });

  it("전체 대비 비율을 정수 퍼센트로 준다", () => {
    expect(typeShare({ "thrill-rush": 30, "brain-team": 170 }, "thrill-rush")).toEqual({
      percent: 15, rare: false, label: "전체의 15%",
    });
  });

  it("5% 미만이면 희귀", () => {
    const s = typeShare({ "thrill-rush": 9, "brain-team": 191 }, "thrill-rush")!;
    expect(s.rare).toBe(true);
    expect(s.label).toBe("전체의 5%"); // 4.5% → 반올림 표시는 5%, 판정은 실제 비율
    expect(typeShare({ "thrill-rush": 10, "brain-team": 190 }, "thrill-rush")!.rare).toBe(false);
  });

  it("1% 미만은 '1% 미만'으로 적는다", () => {
    expect(typeShare({ "thrill-rush": 1, "brain-team": 999 }, "thrill-rush")!.label).toBe("전체의 1% 미만");
  });

  it("아직 한 명도 없는 유형은 '1% 미만'이고 희귀", () => {
    expect(typeShare({ "brain-team": 300 }, "thrill-rush")).toEqual({
      percent: 0, rare: true, label: "전체의 1% 미만",
    });
  });

  it("음수·숫자가 아닌 값은 0으로 본다", () => {
    const counts = { "thrill-rush": -5, "brain-team": 300, x: Number.NaN } as Record<string, number>;
    expect(typeShare(counts, "brain-team")!.percent).toBe(100);
  });
});
