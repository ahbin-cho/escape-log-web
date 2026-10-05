import { describe, expect, it } from "vitest";
import { SLOT_IDS } from "./slots";
import { QUESTIONS } from "./questions";
import {
  LAST_VARIANTS_KEY,
  loadLastVariants,
  pickQuestions,
  saveLastVariants,
} from "./pick";

// 0, 0.37, 0.74, 0.11 … 로 도는 결정적 난수
function seeded(start = 0) {
  let n = start;
  return () => {
    const x = (n * 0.37) % 1;
    n += 1;
    return x;
  };
}

describe("pickQuestions", () => {
  it("슬롯마다 하나씩 11개를 돌려준다", () => {
    const picked = pickQuestions([], seeded());
    expect(picked).toHaveLength(11);
    expect(new Set(picked.map((q) => q.slot))).toEqual(new Set(SLOT_IDS));
  });

  it("첫 문항은 항상 draw1 이다", () => {
    for (let i = 0; i < 20; i++) {
      expect(pickQuestions([], seeded(i))[0].slot).toBe("draw1");
    }
  });

  it("직전 변형은 뽑지 않는다", () => {
    for (let i = 0; i < 20; i++) {
      const first = pickQuestions([], seeded(i)).map((q) => q.id);
      const second = pickQuestions(first, seeded(i)).map((q) => q.id);
      expect(second.filter((id) => first.includes(id))).toEqual([]);
    }
  });

  it("한 슬롯의 변형이 전부 직전에 나왔으면 그 슬롯은 제외 없이 뽑는다", () => {
    const allFear = QUESTIONS.filter((q) => q.slot === "fear").map((q) => q.id);
    const picked = pickQuestions(allFear, seeded());
    expect(picked.filter((q) => q.slot === "fear")).toHaveLength(1);
  });

  it("난수가 1에 가까워도 범위를 벗어나지 않는다", () => {
    const picked = pickQuestions([], () => 0.999999);
    expect(picked).toHaveLength(11);
    expect(picked.every(Boolean)).toBe(true);
  });

  it("순서가 회차마다 달라질 수 있다", () => {
    const orders = new Set(
      Array.from({ length: 10 }, (_, i) =>
        pickQuestions([], seeded(i)).map((q) => q.slot).join(",")
      )
    );
    expect(orders.size).toBeGreaterThan(1);
  });
});

describe("직전 변형 저장", () => {
  it("저장한 값을 다시 읽는다", () => {
    const map = new Map<string, string>();
    const storage = {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => void map.set(k, v),
    };
    saveLastVariants(["draw1-a", "fear-b"], storage);
    expect(map.has(LAST_VARIANTS_KEY)).toBe(true);
    expect(loadLastVariants(storage)).toEqual(["draw1-a", "fear-b"]);
  });

  it("저장소가 없으면 빈 배열", () => {
    expect(loadLastVariants(null)).toEqual([]);
    expect(() => saveLastVariants(["draw1-a"], null)).not.toThrow();
  });

  it("저장소가 예외를 던져도 빈 배열 (개인정보 보호 모드)", () => {
    const broken = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
    };
    expect(loadLastVariants(broken)).toEqual([]);
    expect(() => saveLastVariants(["draw1-a"], broken)).not.toThrow();
  });

  it("깨진 값이나 배열이 아닌 값은 빈 배열", () => {
    const of = (raw: string) => ({ getItem: () => raw });
    expect(loadLastVariants(of("{not json"))).toEqual([]);
    expect(loadLastVariants(of('{"a":1}'))).toEqual([]);
    expect(loadLastVariants(of('["draw1-a", 3, null]'))).toEqual(["draw1-a"]);
  });
});
