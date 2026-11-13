import { describe, expect, it } from "vitest";
import { immersiveKind, priceLabel, splitImmersive } from "./immersive";

describe("immersive", () => {
  it("꼬리표로 연극형/방탈출형을 나눈다", () => {
    expect(immersiveKind(["공포", "이머시브", "이머시브연극"])).toBe("theatre");
    expect(immersiveKind(["이머시브연극"])).toBe("theatre");
    expect(immersiveKind(["스릴러", "이머시브"])).toBe("escape");
    expect(immersiveKind(["배우연출"])).toBeNull();
    expect(immersiveKind(null)).toBeNull();
  });

  it("모음 나누기", () => {
    const r = splitImmersive([
      { id: 1, tags: ["이머시브", "이머시브연극"] },
      { id: 2, tags: ["이머시브"] },
      { id: 3, tags: ["공포"] },
    ]);
    expect(r.theatre.map((x) => x.id)).toEqual([1]);
    expect(r.escape.map((x) => x.id)).toEqual([2]);
  });

  it("가격 글", () => {
    expect(priceLabel(69000)).toBe("69,000원");
    expect(priceLabel("1인 25,000원")).toBe("1인 25,000원");
    expect(priceLabel(" ")).toBeNull();
    expect(priceLabel(null)).toBeNull();
    expect(priceLabel(0)).toBeNull();
  });
});
