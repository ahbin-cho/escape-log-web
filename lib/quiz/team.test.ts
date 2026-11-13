import { describe, expect, it } from "vitest";
import { encodeShare, type SharedResult } from "./share";
import type { TypeId } from "./slots";
import {
  ROLE_IDS,
  TEAM_MAX,
  addToTeam,
  analyzeTeam,
  assignRoles,
  parseTeam,
  spreadBrands,
  quizForTeamPath,
  teamName,
  teamParam,
  teamPath,
  teamStrengths,
  teamWatchOut,
} from "./team";

const base: SharedResult = {
  name: "친구",
  typeId: "thrill-rush",
  genre: "공포",
  fear: 3,
  difficulty: 3,
  hint: 3,
  players: 4,
  time: "normal",
};
const code = (name: string, typeId: TypeId, extra: Partial<SharedResult> = {}) =>
  encodeShare({ ...base, name, typeId, ...extra });

describe("팀 주소", () => {
  it("코드를 점으로 이어 읽고 다시 쓴다", () => {
    const param = [code("지수", "thrill-rush"), code("민호", "brain-analyze")].join(".");
    const team = parseTeam(param);
    expect(team.map((m) => m.name)).toEqual(["지수", "민호"]);
    expect(team[1]).toMatchObject({ draw: "brain", play: "analyze" });
    expect(teamParam(team)).toBe(param);
    expect(teamPath(param)).toBe(`/team?m=${param}`);
    expect(teamPath("")).toBe("/team");
    expect(quizForTeamPath(param)).toBe(`/quiz?team=${param}`);
  });

  it("쉼표로 이어도 읽는다", () => {
    expect(parseTeam(`${code("a", "story-team")},${code("b", "story-savor")}`)).toHaveLength(2);
  });

  it("깨진 코드·중복은 버리고 최대 6명", () => {
    const codes = ["지", "민", "수", "현", "우", "진", "하"].map((n) => code(n, "explore-team"));
    expect(parseTeam(["zz!", codes[0], codes[0], ...codes].join("."))).toHaveLength(TEAM_MAX);
    expect(parseTeam(null)).toEqual([]);
    expect(parseTeam("")).toEqual([]);
  });

  it("이름이 같으면 화면용 이름에 번호를 붙인다", () => {
    const team = parseTeam([code("친구", "thrill-rush"), code("친구", "brain-rush")].join("."));
    expect(team.map((m) => m.label)).toEqual(["친구", "친구 2"]);
  });

  it("addToTeam: 붙이고, 이미 있거나 꽉 차면 그대로", () => {
    const a = code("a", "thrill-rush");
    const b = code("b", "brain-rush");
    expect(addToTeam("", a)).toBe(a);
    expect(addToTeam(a, b)).toBe(`${a}.${b}`);
    expect(addToTeam(`${a}.${b}`, a)).toBe(`${a}.${b}`);
    expect(addToTeam(a, "broken!")).toBe(a);
    const full = ["1", "2", "3", "4", "5", "6"].map((n) => code(n, "story-team")).join(".");
    expect(addToTeam(full, a)).toBe(full);
  });
});

describe("역할 배정", () => {
  const m = (typeId: TypeId, extra: Partial<SharedResult> = {}) =>
    parseTeam(code("x", typeId, extra))[0];

  it("성향에 맞는 역할을 준다", () => {
    const roles = assignRoles([
      m("brain-rush"),
      m("story-analyze"),
      m("thrill-team"),
      m("explore-savor"),
    ]);
    expect(roles).toEqual(["lock", "record", "mood", "device"]);
  });

  it("같은 유형만 6명이어도 역할이 겹치지 않는다", () => {
    const six = Array.from({ length: 6 }, () => m("brain-rush"));
    const roles = assignRoles(six);
    expect(new Set(roles).size).toBe(6);
    expect([...roles].sort()).toEqual([...ROLE_IDS].sort());
  });

  it("힌트를 아끼는 협동형은 힌트 지킴이", () => {
    const roles = assignRoles([m("thrill-team", { hint: 3 }), m("brain-team", { hint: 1 }), m("brain-rush")]);
    expect(roles).toEqual(["mood", "hint", "lock"]);
  });

  it("항상 같은 결과", () => {
    const team = [m("story-savor"), m("explore-rush"), m("brain-analyze")];
    expect(assignRoles(team)).toEqual(assignRoles(team));
  });
});

describe("팀 이름", () => {
  const t = (...ids: TypeId[]) =>
    ids.map((id) => {
      const [draw, play] = id.split("-");
      return { draw, play } as Parameters<typeof teamName>[0][number];
    });

  it("많은 쪽으로 짓는다", () => {
    expect(teamName(t("thrill-rush", "thrill-rush", "brain-analyze")).name).toBe("한밤의 돌격대");
    expect(teamName(t("explore-team", "explore-team", "story-team", "brain-rush")).name).toBe(
      "지도 밖 원정대"
    );
  });

  it("고르게 섞이면 올라운드 원정대", () => {
    const n = teamName(t("thrill-rush", "brain-analyze", "story-savor"));
    expect(n.name).toBe("올라운드 원정대");
    expect(n.line).toContain("골고루");
  });

  it("동점이면 색깔을 정하지 않는다", () => {
    expect(teamName(t("thrill-savor", "thrill-savor", "brain-savor", "brain-rush")).name).toBe(
      "올라운드 탐방단"
    );
  });
});

describe("강점·조심할 점", () => {
  const team = (...xs: [TypeId, Partial<SharedResult>?][]) =>
    parseTeam(xs.map(([id, e], i) => code(`p${i}`, id, e)).join("."));

  it("강점은 최대 3개", () => {
    const s = teamStrengths(team(["thrill-rush"], ["brain-analyze"], ["story-team"], ["explore-savor"]));
    expect(s).toHaveLength(3);
    expect(s[0]).toContain("고르게");
  });

  it("공포 차이가 크면 그걸 먼저 말한다", () => {
    const w = teamWatchOut(team(["thrill-rush", { fear: 5 }], ["story-savor", { fear: 1 }], ["brain-team"]));
    expect(w).toContain("공포 1단계");
  });

  it("돌격형뿐이면 단서 정리를 권한다", () => {
    expect(teamWatchOut(team(["thrill-rush"], ["brain-rush"], ["story-team"]))).toContain("단서");
  });

  it("문제 풀이 담당이 없으면 난이도를 낮추라고 한다", () => {
    expect(teamWatchOut(team(["story-savor"], ["explore-team"], ["thrill-savor"]))).toContain(
      "난이도"
    );
  });

  it("analyzeTeam 은 사람마다 역할과 추천용 취향을 붙인다", () => {
    const r = analyzeTeam(team(["brain-rush"], ["story-analyze"], ["thrill-team"]));
    expect(r.members.map((x) => x.role)).toEqual(["lock", "record", "mood"]);
    expect(r.mates[0]).toMatchObject({ name: "p0", genre: "공포", fear: 3, diff: 3 });
    expect(r.name.name).toBeTruthy();
  });
});

describe("spreadBrands", () => {
  const t = (id: string, cafe: string) => ({ id, cafe });
  it("한 브랜드가 2개를 넘지 않게, 모자라면 채운다", () => {
    const list = [t("1", "A 1점"), t("2", "A 2점"), t("3", "A 3점"), t("4", "B 1점")];
    expect(spreadBrands(list, 3).map((x) => x.id)).toEqual(["1", "2", "4"]);
    expect(spreadBrands(list, 4).map((x) => x.id)).toEqual(["1", "2", "4", "3"]);
  });
});
