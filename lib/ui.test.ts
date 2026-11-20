import { describe, expect, it } from "vitest";
import { posterFirst, sortGroupsPosterFirst } from "./ui";

const t = (id: string, poster = "") => ({ id, poster_url: poster });
const P = "https://example.com/p.jpg";

describe("포스터 있는 것 먼저", () => {
  it("테마: 포스터 있는 것이 앞으로, 그 안의 순서는 그대로", () => {
    expect(posterFirst([t("a"), t("b", P), t("c"), t("d", P)]).map((x) => x.id)).toEqual(["b", "d", "a", "c"]);
  });
  it("묶음: 포스터가 절반도 안 되는 묶음은 테마가 많아도 아래로", () => {
    const groups: [string, { id: string; poster_url: string }[]][] = [
      ["황금열쇠", [t("a"), t("b"), t("c"), t("d"), t("e")]], // 0/5
      ["룸즈에이", [t("1"), t("2"), t("3"), t("3b", P)]], // 1/4
      ["상상의문", [t("4", P)]], // 1/1
      ["제로월드", [t("5"), t("6", P)]], // 1/2
    ];
    const out = sortGroupsPosterFirst(groups);
    expect(out.map(([k]) => k)).toEqual(["제로월드", "상상의문", "룸즈에이", "황금열쇠"]);
    expect(out[0][1].map((x) => x.id)).toEqual(["6", "5"]);
  });
});
