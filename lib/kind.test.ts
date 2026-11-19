import { describe, expect, it } from "vitest";
import { escapeOnly, isMurder, kindOf, resultWord } from "./kind";

describe("기록 종류", () => {
  it("값이 없거나 모르는 값이면 방탈출", () => {
    expect(kindOf({})).toBe("escape");
    expect(kindOf({ kind: null })).toBe("escape");
    expect(kindOf({ kind: "boardgame" })).toBe("escape");
    expect(isMurder({ kind: "murder" })).toBe(true);
  });
  it("방탈출 통계에서는 머더미스터리를 뺀다", () => {
    expect(escapeOnly([{ kind: "murder" }, {}, { kind: "escape" }])).toHaveLength(2);
  });
  it("결과 한마디가 종류마다 다르다", () => {
    expect(resultWord({ success: true })).toBe("탈출");
    expect(resultWord({ success: false }, true)).toBe("탈출 실패");
    expect(resultWord({ kind: "murder", success: true })).toBe("목표 달성");
    expect(resultWord({ kind: "murder", success: false }, true)).toBe("목표 실패");
  });
});
