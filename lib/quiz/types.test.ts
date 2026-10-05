import { describe, expect, it } from "vitest";
import { DRAWS, PLAYER_PREFS, PLAYS, TIME_PREFS } from "./slots";
import { PLAYERS_LABEL, QUIZ_TYPES, TIME_LABEL, typeImage } from "./types";

describe("유형 데이터", () => {
  it("16개 조합 모두에 이름과 한 줄 설명이 있다", () => {
    for (const d of DRAWS)
      for (const p of PLAYS) {
        const t = QUIZ_TYPES[`${d}-${p}`];
        expect(t, `${d}-${p}`).toBeDefined();
        expect(t.title.length).toBeGreaterThan(0);
        expect(t.tagline.length).toBeGreaterThan(0);
      }
    expect(Object.keys(QUIZ_TYPES)).toHaveLength(16);
  });

  it("유형 이름이 겹치지 않는다", () => {
    const titles = Object.values(QUIZ_TYPES).map((t) => t.title);
    expect(new Set(titles).size).toBe(16);
  });

  it("그림 경로는 /types/<id>.jpg", () => {
    expect(typeImage("thrill-rush")).toBe("/types/thrill-rush.jpg");
  });

  it("인원·시간 값마다 표시 문구가 있다", () => {
    for (const n of PLAYER_PREFS) expect(PLAYERS_LABEL[n]).toBeTruthy();
    for (const t of TIME_PREFS) expect(TIME_LABEL[t]).toBeTruthy();
  });
});
