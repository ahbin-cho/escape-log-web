import { describe, expect, it } from "vitest";
import { MINI_QUIZZES, isMiniOpen, isMiniUpcoming, miniBySlug, miniResult } from "./quizzes";
import { scoreMini, totalScore } from "./score";
import type { MiniQuiz } from "./types";

// 모든 답 조합을 돈다(문항 수가 적어 전수 확인 가능).
function allAnswers(quiz: MiniQuiz): number[][] {
  let combos: number[][] = [[]];
  for (const q of quiz.questions) {
    const next: number[][] = [];
    for (const c of combos) for (let i = 0; i < q.options.length; i++) next.push([...c, i]);
    combos = next;
  }
  return combos;
}

describe("미니 진단 데이터", () => {
  it("slug·결과 키가 겹치지 않고 주소에 쓸 수 있는 영문이다", () => {
    const slugs = MINI_QUIZZES.map((q) => q.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const quiz of MINI_QUIZZES) {
      expect(quiz.slug).toMatch(/^[a-z0-9-]+$/);
      const keys = quiz.results.map((r) => r.key);
      expect(new Set(keys).size).toBe(keys.length);
      for (const k of keys) expect(k).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("문항 수는 5~7개, 결과는 4~5개", () => {
    for (const quiz of MINI_QUIZZES) {
      expect(quiz.questions.length).toBeGreaterThanOrEqual(5);
      expect(quiz.questions.length).toBeLessThanOrEqual(7);
      expect(quiz.results.length).toBeGreaterThanOrEqual(4);
      expect(quiz.results.length).toBeLessThanOrEqual(5);
    }
  });

  it("추천 링크는 사이트 안 주소다", () => {
    for (const quiz of MINI_QUIZZES)
      for (const r of quiz.results) expect(r.recommend.href.startsWith("/")).toBe(true);
  });

  it("가산점·구간이 가리키는 결과가 실제로 있다", () => {
    for (const quiz of MINI_QUIZZES) {
      const keys = new Set(quiz.results.map((r) => r.key));
      for (const q of quiz.questions)
        for (const o of q.options)
          for (const k of Object.keys(o.to ?? {})) expect(keys.has(k)).toBe(true);
      if (quiz.scoring.kind === "scale")
        for (const t of quiz.scoring.tiers) expect(keys.has(t.key)).toBe(true);
    }
  });

  it("금지 문구를 쓰지 않는다", () => {
    const text = JSON.stringify(MINI_QUIZZES);
    expect(text).not.toContain("전부 무료");
    expect(text).not.toContain("로그인 없이");
    expect(text).not.toMatch(/\d+\s*%/); // 가짜 비율 금지
  });
});

describe("scoreMini", () => {
  it("모든 결과가 어떤 답 조합으로든 나온다", () => {
    for (const quiz of MINI_QUIZZES) {
      const seen = new Set<string>();
      for (const a of allAnswers(quiz)) {
        const r = scoreMini(quiz, a);
        expect(r).not.toBeNull();
        seen.add(r!);
      }
      expect([...seen].sort()).toEqual(quiz.results.map((r) => r.key).sort());
    }
  });

  it("답이 모자라거나 범위를 벗어나면 null", () => {
    const quiz = MINI_QUIZZES[0];
    expect(scoreMini(quiz, [])).toBeNull();
    expect(scoreMini(quiz, quiz.questions.map(() => 9))).toBeNull();
    expect(scoreMini(quiz, quiz.questions.map(() => -1))).toBeNull();
  });

  it("밸런스 게임: 퍼즐 쪽만 고르면 노힌트 장인", () => {
    const quiz = miniBySlug("balance")!;
    // 노힌트 / 퍼즐 / 2인 / 성공 / 자물쇠 / 서재 / 다음 방
    expect(scoreMini(quiz, [0, 1, 0, 0, 0, 1, 1])).toBe("puzzle");
    // 힌트 무제한 / 공포 / 6인 / 성공 / 자물쇠 / 배우 / 수다
    expect(scoreMini(quiz, [1, 0, 1, 0, 0, 0, 0])).toBe("party");
  });

  it("공포 테스트: 점수 구간대로 나뉜다", () => {
    const quiz = miniBySlug("horror-time")!;
    expect(scoreMini(quiz, [0, 0, 0, 0, 0, 0])).toBe("entrance");
    expect(scoreMini(quiz, [1, 1, 1, 1, 0, 0])).toBe("back");
    expect(scoreMini(quiz, [2, 2, 2, 2, 0, 0])).toBe("middle");
    expect(scoreMini(quiz, [2, 2, 2, 2, 2, 2])).toBe("front");
    expect(scoreMini(quiz, [3, 3, 3, 3, 3, 3])).toBe("hunter");
    expect(totalScore(quiz, [3, 3, 3, 3, 3, 3])).toBe(18);
  });
});

describe("열림 기간", () => {
  const base = MINI_QUIZZES[0];
  it("기간이 없으면 늘 열림", () => {
    expect(isMiniOpen({ ...base, openFrom: undefined, openUntil: undefined })).toBe(true);
  });
  it("한국 시간 기준으로 첫날·마지막 날을 포함한다", () => {
    const q = { ...base, openFrom: "2026-12-01", openUntil: "2026-12-31" };
    expect(isMiniOpen(q, new Date("2026-11-30T14:59:59Z"))).toBe(false); // KST 11/30 23:59
    expect(isMiniOpen(q, new Date("2026-11-30T15:00:00Z"))).toBe(true); // KST 12/1 0:00
    expect(isMiniOpen(q, new Date("2026-12-31T14:59:00Z"))).toBe(true); // KST 12/31 23:59
    expect(isMiniOpen(q, new Date("2026-12-31T15:00:01Z"))).toBe(false);
    expect(isMiniUpcoming(q, new Date("2026-11-01T00:00:00Z"))).toBe(true);
    expect(isMiniUpcoming(q, new Date("2027-01-05T00:00:00Z"))).toBe(false);
  });
});

describe("miniResult", () => {
  it("없는 키는 null", () => {
    const quiz = MINI_QUIZZES[0];
    expect(miniResult(quiz, "nope")).toBeNull();
    expect(miniResult(quiz, null)).toBeNull();
    expect(miniResult(quiz, quiz.results[0].key)).toBe(quiz.results[0]);
  });
});
