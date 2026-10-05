import { describe, expect, it } from "vitest";
import { SLOT_IDS, isValidSlotValue } from "./slots";
import { QUESTIONS, answerBonus, answerValue } from "./questions";

describe("질문 데이터", () => {
  it("슬롯마다 변형이 정확히 3개다", () => {
    for (const slot of SLOT_IDS) {
      expect(QUESTIONS.filter((q) => q.slot === slot), slot).toHaveLength(3);
    }
    expect(QUESTIONS).toHaveLength(33);
  });

  it("질문 ID가 겹치지 않는다", () => {
    const ids = QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("모든 선택지 값이 그 슬롯의 값 범위 안에 있다", () => {
    for (const q of QUESTIONS) {
      for (const o of q.options) {
        expect(isValidSlotValue(q.slot, o.value), `${q.id}: ${o.label}`).toBe(true);
      }
    }
  });

  it("형식 규칙을 지킨다", () => {
    for (const q of QUESTIONS) {
      if (q.format === "binary") {
        expect(q.options, q.id).toHaveLength(2);
        expect(["fear", "difficulty", "hint", "time"], q.id).toContain(q.slot);
      }
      if (q.format === "slider") {
        expect(q.options, q.id).toHaveLength(0);
        expect(["fear", "difficulty", "hint"], q.id).toContain(q.slot);
        expect(q.minLabel, q.id).toBeTruthy();
        expect(q.maxLabel, q.id).toBeTruthy();
      }
      if (q.format === "choice") {
        expect(q.options.length, q.id).toBeGreaterThanOrEqual(4);
        expect(q.options.length, q.id).toBeLessThanOrEqual(6);
      }
    }
  });

  it("보조 점수는 플레이 방식 슬롯에만 붙는다", () => {
    for (const q of QUESTIONS) {
      const hasBonus = q.options.some((o) => o.bonus);
      if (hasBonus) expect(["play1", "play2"], q.id).toContain(q.slot);
    }
  });
});

describe("answerValue", () => {
  const byId = (id: string) => QUESTIONS.find((q) => q.id === id)!;

  it("choice 는 선택지의 값을 돌려준다", () => {
    expect(answerValue(byId("draw1-a"), 1)).toBe("brain");
  });

  it("없는 선택 번호는 undefined", () => {
    expect(answerValue(byId("draw1-a"), 9)).toBeUndefined();
    expect(answerValue(byId("draw1-a"), -1)).toBeUndefined();
  });

  it("slider 는 값 그대로, 범위를 벗어나면 1~5로 자른다", () => {
    const q = byId("fear-a");
    expect(answerValue(q, 4)).toBe(4);
    expect(answerValue(q, 0)).toBe(1);
    expect(answerValue(q, 6)).toBe(5);
    expect(answerValue(q, 2.6)).toBe(3);
  });

  it("hint-c 는 값을 뒤집는다", () => {
    const q = byId("hint-c");
    expect(answerValue(q, 1)).toBe(5);
    expect(answerValue(q, 5)).toBe(1);
    expect(answerValue(q, 9)).toBe(1);
    expect(answerValue(q, 0)).toBe(5);
  });

  it("answerBonus 는 보조 점수가 있는 선택지에서만 값을 준다", () => {
    expect(answerBonus(byId("play2-a"), 1)).toBe("team");
    expect(answerBonus(byId("play2-a"), 0)).toBeUndefined();
    expect(answerBonus(byId("fear-a"), 3)).toBeUndefined();
  });
});
