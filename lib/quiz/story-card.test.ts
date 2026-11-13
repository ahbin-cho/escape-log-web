import { describe, expect, it } from "vitest";
import { DRAWS, PLAYS } from "./slots";
import { QUIZ_TYPES } from "./types";
import { DRAW_TONE, storyCardContent } from "./story-card";

describe("결과 스토리 카드 내용", () => {
  it("유형 이름·설명·그림·번호를 담는다", () => {
    const d = storyCardContent({ typeId: "brain-analyze", fear: 4, hint: 1, players: 2 });
    expect(d.title).toBe(QUIZ_TYPES["brain-analyze"].title);
    expect(d.tagline).toBe(QUIZ_TYPES["brain-analyze"].tagline);
    expect(d.image).toBe("/types/brain-analyze.jpg");
    expect(d.no).toBe("06 / 16");
    expect(d.eyebrow).toBe("나의 방탈출 유형");
    expect(d.tone).toBe(DRAW_TONE.brain);
  });

  it("성향은 공포 내성·힌트·인원 3칸", () => {
    const d = storyCardContent({ typeId: "thrill-rush", fear: 5, hint: 1, players: 0 });
    expect(d.traits).toEqual([
      { label: "공포 내성", value: "찐 탱", dots: 5 },
      { label: "힌트", value: "끝까지 버틴다" },
      { label: "인원", value: "상관없음" },
    ]);
  });

  it("범위 밖 값은 1~5 로 맞춘다", () => {
    const d = storyCardContent({ typeId: "story-team", fear: 9, hint: 0, players: 3 });
    expect(d.traits[0].dots).toBe(5);
    expect(d.traits[1].value).toBe("끝까지 버틴다");
    expect(d.traits[2].value).toBe("상관없음");
  });

  it("16개 유형 모두 번호가 다르다", () => {
    const nos = DRAWS.flatMap((dr) =>
      PLAYS.map((p) => storyCardContent({ typeId: `${dr}-${p}`, fear: 3, hint: 3, players: 2 }).no)
    );
    expect(new Set(nos).size).toBe(16);
  });
});
