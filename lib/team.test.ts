import { describe, expect, it } from "vitest";
import type { CandidateTheme } from "./store";
import type { MateTaste } from "./match";
import { decodeTeam, encodeTeam, pickForTeam, teamProfile } from "./team";

const m = (name: string, p: Partial<MateTaste> = {}): MateTaste => ({
  name,
  genre: "추리",
  fear: 3,
  diff: 3,
  ...p,
});

const theme = (name: string, p: Partial<CandidateTheme> = {}): CandidateTheme => ({
  id: name,
  name,
  cafe: "브랜드 강남점",
  genre: "추리",
  difficulty: 3,
  fearLevel: 1,
  tags: [],
  teaser: "",
  hint: "",
  spoiler: "",
  players: "2~5",
  ...p,
});

describe("teamProfile", () => {
  it("공포 기준은 제일 겁 많은 사람, 난이도는 평균", () => {
    const p = teamProfile([
      m("가", { fear: 5, diff: 4 }),
      m("나", { fear: 2, diff: 2 }),
      m("다", { fear: 4, diff: 3, genre: "공포" }),
    ]);
    expect(p.size).toBe(3);
    expect(p.fearCap).toBe(2);
    expect(p.scaredest).toBe("나");
    expect(p.diffTarget).toBe(3);
    expect(p.genres[0]).toEqual({ genre: "추리", votes: 2 });
  });

  it("겁 많은 사람이 여럿이면 지목하지 않는다", () => {
    expect(teamProfile([m("가", { fear: 1 }), m("나", { fear: 1 })]).scaredest).toBeNull();
  });

  it("모두 같은 취향이면 팀 궁합 100", () => {
    expect(teamProfile([m("가"), m("나"), m("다")]).harmony).toBe(100);
  });
});

describe("pickForTeam", () => {
  const team = [m("가", { fear: 5 }), m("나", { fear: 2 }), m("다", { fear: 3 })];

  it("제일 겁 많은 사람보다 무서운 방은 뺀다", () => {
    const picks = pickForTeam(
      [theme("무서움", { fearLevel: 3 }), theme("괜찮음", { fearLevel: 2 })],
      team
    );
    expect(picks.map((p) => p.name)).toEqual(["괜찮음"]);
  });

  it("팀 인원이 못 들어가는 방은 빼고, 인원 정보 없는 방은 남긴다", () => {
    const picks = pickForTeam(
      [
        theme("2인전용", { players: "2" }),
        theme("모름", { players: "" }),
        theme("딱맞음", { players: "3~4" }),
      ],
      team
    );
    expect(picks.map((p) => p.name)).toEqual(["딱맞음", "모름"]);
  });

  it("많이 고른 장르가 앞에 온다", () => {
    const picks = pickForTeam(
      [theme("감성방", { genre: "감성" }), theme("추리방", { genre: "추리" })],
      team
    );
    expect(picks[0].name).toBe("추리방");
    expect(picks[0].reasons[0]).toBe("3명 중 3명이 좋아하는 추리");
  });
});

describe("팀 링크", () => {
  it("인코딩한 팀을 그대로 되살린다", () => {
    const team = [m("가", { genre: "공포", fear: 5 }), m("나나", { genre: null })];
    expect(decodeTeam(encodeTeam(team))).toEqual(team);
  });

  it("깨진 코드는 건너뛴다", () => {
    const code = encodeTeam([m("가")]) + ".!!!깨짐";
    expect(decodeTeam(code).map((x) => x.name)).toEqual(["가"]);
  });
});
