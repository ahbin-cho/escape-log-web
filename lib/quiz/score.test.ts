import { describe, expect, it } from "vitest";
import { DRAWS, PLAYS, QUIZ_GENRES, type QuizValues } from "./slots";
import { QUESTIONS, type QuizAnswers } from "./questions";
import {
  brandAffinity,
  determineDraw,
  determinePlay,
  determineType,
  focusTagsOf,
  quizPrefs,
  quizToTaste,
  toValues,
} from "./score";

const base: QuizValues = {
  draw1: "thrill",
  draw2: "thrill",
  play1: "rush",
  play2: "rush",
  genre: "공포",
  fear: 3,
  difficulty: 3,
  hint: 3,
  atmosphere: "bright",
  players: 0,
  time: "any",
  playBonus: [],
};
const v = (over: Partial<QuizValues>): QuizValues => ({ ...base, ...over });

const pick = (...ids: string[]) => ids.map((id) => QUESTIONS.find((q) => q.id === id)!);
const A_SET = pick(
  "draw1-a", "draw2-a", "play1-a", "play2-a", "genre-a", "fear-a",
  "difficulty-a", "hint-a", "atmosphere-a", "players-a", "time-a"
);

describe("toValues", () => {
  const answers: QuizAnswers = {
    "draw1-a": 1, "draw2-a": 2, "play1-a": 0, "play2-a": 1, "genre-a": 1,
    "fear-a": 4, "difficulty-a": 2, "hint-a": 0, "atmosphere-a": 3,
    "players-a": 2, "time-a": 1,
  };

  it("답을 슬롯 값으로 환산한다", () => {
    expect(toValues(A_SET, answers)).toEqual({
      draw1: "brain", draw2: "story", play1: "rush", play2: "analyze",
      genre: "추리", fear: 4, difficulty: 2, hint: 1, atmosphere: "epic",
      players: 4, time: "normal", playBonus: ["team"],
    });
  });

  it("답이 하나라도 빠지면 null", () => {
    const { "time-a": _omit, ...partial } = answers;
    expect(toValues(A_SET, partial)).toBeNull();
  });

  it("고를 수 없는 선택 번호가 있으면 null", () => {
    expect(toValues(A_SET, { ...answers, "draw1-a": 9 })).toBeNull();
  });

  it("뒤로 가서 답을 바꿔도 보조 점수는 마지막 답 기준으로 한 번만 들어간다", () => {
    // play2-a: 1번은 +team, 3번은 +analyze. 1번을 골랐다가 3번으로 바꾼 상황.
    const changed = toValues(A_SET, { ...answers, "play2-a": 3 })!;
    expect(changed.playBonus).toEqual(["analyze"]);
    expect(changed.play2).toBe("team");
  });

  it("뽑히지 않은 질문의 답은 무시한다", () => {
    const withStale = toValues(A_SET, { ...answers, "play2-c": 2 })!;
    expect(withStale.playBonus).toEqual(["team"]);
  });
});

describe("determineDraw", () => {
  it("두 문항이 같으면 그 값", () => {
    expect(determineDraw(v({ draw1: "brain", draw2: "brain", genre: "공포" }))).toBe("brain");
  });

  it("두 문항이 다르면 장르가 가리키는 쪽", () => {
    expect(determineDraw(v({ draw1: "brain", draw2: "story", genre: "감성" }))).toBe("story");
    expect(determineDraw(v({ draw1: "brain", draw2: "explore", genre: "SF" }))).toBe("explore");
  });

  it("두 문항이 다르고 장르가 제3의 값이면 draw1", () => {
    expect(determineDraw(v({ draw1: "brain", draw2: "story", genre: "공포" }))).toBe("brain");
  });

  it("코믹은 이야기, 모험은 탐험으로 센다", () => {
    expect(determineDraw(v({ draw1: "thrill", draw2: "story", genre: "코믹" }))).toBe("story");
    expect(determineDraw(v({ draw1: "thrill", draw2: "explore", genre: "모험" }))).toBe("explore");
  });
});

describe("determinePlay", () => {
  it("두 문항이 다르고 다른 점수가 없으면 play1", () => {
    expect(determinePlay(v({ play1: "savor", play2: "team", hint: 3 }))).toBe("savor");
  });

  it("보조 점수가 동점을 가른다", () => {
    expect(
      determinePlay(v({ play1: "savor", play2: "team", hint: 3, playBonus: ["team"] }))
    ).toBe("team");
  });

  it("힌트를 안 쓰면 분석, 바로 쓰면 돌격에 1점", () => {
    expect(determinePlay(v({ play1: "rush", play2: "analyze", hint: 1 }))).toBe("analyze");
    expect(determinePlay(v({ play1: "analyze", play2: "rush", hint: 5 }))).toBe("rush");
    expect(determinePlay(v({ play1: "analyze", play2: "rush", hint: 3 }))).toBe("analyze");
  });

  it("힌트 점수만으로는 두 문항이 같은 답을 뒤집지 못한다", () => {
    expect(determinePlay(v({ play1: "savor", play2: "savor", hint: 5 }))).toBe("savor");
  });
});

describe("determineType", () => {
  it("모든 조합에서 16개 유형 중 하나를 돌려준다", () => {
    const valid = new Set(DRAWS.flatMap((d) => PLAYS.map((p) => `${d}-${p}`)));
    const seen = new Set<string>();
    for (const draw1 of DRAWS)
      for (const draw2 of DRAWS)
        for (const play1 of PLAYS)
          for (const play2 of PLAYS)
            for (const genre of QUIZ_GENRES)
              for (const hint of [1, 2, 3, 4, 5]) {
                const t = determineType(v({ draw1, draw2, play1, play2, genre, hint }));
                expect(valid.has(t)).toBe(true);
                seen.add(t);
              }
    expect(seen.size).toBe(16);
  });

  it("같은 슬롯 값이면 어떤 변형에서 왔든 같은 유형이다", () => {
    // draw1-a 1번과 draw1-b 1번은 둘 다 brain.
    const fromA = toValues(A_SET, {
      "draw1-a": 1, "draw2-a": 1, "play1-a": 1, "play2-a": 1, "genre-a": 1,
      "fear-a": 3, "difficulty-a": 3, "hint-a": 2, "atmosphere-a": 0,
      "players-a": 0, "time-a": 0,
    })!;
    const B_SET = pick(
      "draw1-b", "draw2-b", "play1-b", "play2-b", "genre-b", "fear-c",
      "difficulty-c", "hint-a", "atmosphere-b", "players-b", "time-a"
    );
    const fromB = toValues(B_SET, {
      "draw1-b": 1, "draw2-b": 1, "play1-b": 1, "play2-b": 1, "genre-b": 1,
      "fear-c": 2, "difficulty-c": 2, "hint-a": 2, "atmosphere-b": 0,
      "players-b": 0, "time-a": 0,
    })!;
    expect(determineType(fromA)).toBe("brain-analyze");
    expect(determineType(fromB)).toBe("brain-analyze");
  });
});

describe("추천에 넘기는 값", () => {
  it("quizToTaste 는 recommend() 가 받는 TasteProfile 형태다", () => {
    const t = quizToTaste(v({ genre: "추리", fear: 2, difficulty: 4 }));
    expect(t.topGenre).toBe("추리");
    expect(t.genreCounts["추리"]).toBe(1);
    expect(t.genreCounts["공포"]).toBe(0);
    expect(Object.keys(t.genreCounts)).toContain("기타");
    expect(t.fearComfort).toBe(2);
    expect(t.difficultyFit).toBe(4);
    expect(t.count).toBe(11);
  });

  it("quizPrefs 는 시간을 분으로, 상관없음을 0으로 바꾼다", () => {
    expect(quizPrefs(v({ time: "short", players: 2 }))).toEqual({ timePref: 40, playersPref: 2 });
    expect(quizPrefs(v({ time: "extra", players: 5 }))).toEqual({ timePref: 95, playersPref: 5 });
    expect(quizPrefs(v({ time: "any", players: 0 }))).toEqual({ timePref: 0, playersPref: 0 });
  });

  it("focusTagsOf 는 유형에서 태그를 만들고 중복을 없앤다", () => {
    const brainTeam = focusTagsOf(v({ draw1: "brain", draw2: "brain", genre: "추리", play1: "team", play2: "team" }));
    expect(brainTeam).toEqual(["장치", "협동", "가족"]);
    const storySavor = focusTagsOf(v({ draw1: "story", draw2: "story", genre: "감성", play1: "savor", play2: "savor" }));
    expect(new Set(storySavor).size).toBe(storySavor.length);
    expect(storySavor).toContain("스토리");
    expect(storySavor).toContain("아기자기");
  });

  it("brandAffinity 는 네 브랜드 중 하나와 이유를 돌려준다", () => {
    expect(brandAffinity(v({ genre: "공포", fear: 5 })).name).toBe("제로월드");
    expect(brandAffinity(v({ genre: "추리", atmosphere: "bright" })).name).toBe("셜록홈즈");
    expect(brandAffinity(v({ genre: "모험", atmosphere: "bright" })).name).toBe("비트포비아");
    expect(brandAffinity(v({ genre: "감성", atmosphere: "cute", play1: "savor", play2: "savor" })).name).toBe("키이스케이프");
    expect(brandAffinity(v({ genre: "감성", atmosphere: "cute" })).reason).toBeTruthy();
  });
});
