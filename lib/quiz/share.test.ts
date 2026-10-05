import { describe, expect, it } from "vitest";
import { DRAWS, PLAYER_PREFS, PLAYS, QUIZ_GENRES, TIME_PREFS, type QuizValues } from "./slots";
import { decodeShare, encodeShare, shareFromValues, shareToMate, type SharedResult } from "./share";

const sample: SharedResult = {
  name: "지수",
  typeId: "thrill-rush",
  genre: "공포",
  fear: 4,
  difficulty: 3,
  hint: 2,
  players: 4,
  time: "long",
};

describe("공유 코드", () => {
  it("인코딩한 결과를 그대로 되돌린다", () => {
    expect(decodeShare(encodeShare(sample))).toEqual(sample);
  });

  it("주소 경로에 그대로 쓸 수 있는 글자만 쓴다", () => {
    expect(encodeShare(sample)).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("모든 유형·장르·인원·시간 조합이 왕복된다", () => {
    for (const d of DRAWS)
      for (const p of PLAYS)
        for (const genre of QUIZ_GENRES)
          for (const players of PLAYER_PREFS)
            for (const time of TIME_PREFS) {
              const r: SharedResult = { ...sample, typeId: `${d}-${p}`, genre, players, time };
              expect(decodeShare(encodeShare(r))).toEqual(r);
            }
  });

  it("별명이 비면 '친구'가 된다", () => {
    expect(decodeShare(encodeShare({ ...sample, name: "" }))!.name).toBe("친구");
    expect(decodeShare(encodeShare({ ...sample, name: "   " }))!.name).toBe("친구");
  });

  it("별명은 앞뒤 공백을 떼고 12자로 자른다", () => {
    const long = decodeShare(encodeShare({ ...sample, name: "  가나다라마바사아자차카타파하  " }))!;
    expect(long.name).toBe("가나다라마바사아자차카타");
  });

  it("별명의 줄바꿈·제어문자는 지운다", () => {
    expect(decodeShare(encodeShare({ ...sample, name: "지\n수\u0000" }))!.name).toBe("지수");
  });

  it("이모지 별명도 왕복된다", () => {
    expect(decodeShare(encodeShare({ ...sample, name: "탈출왕👻" }))!.name).toBe("탈출왕👻");
  });

  it("깨진 코드는 null", () => {
    for (const bad of ["", "abc", "zzzzzzz", "0000000", "0099999", "f5111110", "!!!!!!!!", "0141324%%%"]) {
      expect(decodeShare(bad), bad).toBeNull();
    }
  });

  it("주소에서 퍼센트 인코딩된 채로 와도 읽는다", () => {
    expect(decodeShare(encodeURIComponent(encodeShare(sample)))).toEqual(sample);
  });

  it("손으로 늘린 별명도 12자로 잘린다", () => {
    const code = encodeShare(sample).slice(0, 7) + Buffer.from("가".repeat(40), "utf-8").toString("base64url");
    expect(decodeShare(code)!.name).toBe("가".repeat(12));
  });
});

describe("공유 결과 만들기", () => {
  const values: QuizValues = {
    draw1: "brain", draw2: "brain", play1: "analyze", play2: "analyze", genre: "추리",
    fear: 2, difficulty: 5, hint: 1, atmosphere: "dark", players: 2, time: "extra", playBonus: [],
  };

  it("슬롯 값에서 유형과 세부 성향을 옮긴다", () => {
    expect(shareFromValues(values, " 민 ")).toEqual({
      name: "민", typeId: "brain-analyze", genre: "추리",
      fear: 2, difficulty: 5, hint: 1, players: 2, time: "extra",
    });
  });

  it("친구 궁합이 쓰는 형태로 바꾼다", () => {
    expect(shareToMate(sample)).toEqual({ name: "지수", genre: "공포", fear: 4, diff: 3 });
  });
});
