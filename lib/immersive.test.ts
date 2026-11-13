import { describe, expect, it } from "vitest";
import { immersiveKind, priceLabel, splitImmersive, untilLabel } from "./immersive";

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

  it("기간 한정 공연: 끝나는 날까지만 보이고, 곧 끝나는 것 먼저", () => {
    const now = new Date("2026-12-31T14:59:00Z"); // 한국 12/31 23:59
    const r = splitImmersive(
      [
        { id: 1, tags: ["이머시브", "이머시브연극"], run_until: "2026-12-31" },
        { id: 2, tags: ["이머시브"], run_until: "2026-12-30" },
        { id: 3, tags: ["이머시브", "이머시브연극"], run_until: "2027-01-15" },
        { id: 4, tags: ["이머시브"], run_until: null },
      ],
      now
    );
    expect(r.limited.map((x) => x.id)).toEqual([1, 3]);
    expect(r.escape.map((x) => x.id)).toEqual([4]);
    expect(splitImmersive([{ id: 1, tags: ["이머시브"], run_until: "2026-12-31" }], new Date("2026-12-31T15:00:00Z")).limited).toEqual([]);
  });

  it("끝나는 날 글", () => {
    expect(untilLabel("2026-12-31")).toBe("~12/31까지");
    expect(untilLabel(null)).toBeNull();
  });
});
