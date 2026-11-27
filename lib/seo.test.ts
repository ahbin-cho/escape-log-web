import { describe, expect, it } from "vitest";
import type { ThemeRow } from "./catalog-server";
import { brandFaq, MIN_DESCRIPTION, MIN_TITLE, padDescription, padTitle, parsePlayers, regionFaq, themeEntityLd } from "./seo";

const t = (p: Partial<ThemeRow>): ThemeRow => ({
  id: "1", name: "테마", cafe: "키이스케이프 강남점", genre: "추리", difficulty: 3, fear_level: 1,
  tags: null, teaser: null, time_limit: 60, players: "2~6", reservation_url: null, ...p,
});

describe("parsePlayers", () => {
  it("범위·단일·단위 붙은 값을 읽고, 이상한 값은 null", () => {
    expect(parsePlayers("2~6")).toEqual([2, 6]);
    expect(parsePlayers("2~6명")).toEqual([2, 6]);
    expect(parsePlayers("1")).toEqual([1, 1]);
    expect(parsePlayers("")).toBeNull();
    expect(parsePlayers(null)).toBeNull();
  });
});

describe("themeEntityLd", () => {
  it("있는 값만 넣는다", () => {
    const ld = themeEntityLd(t({}), { url: "https://x/theme/1", region: "서울" });
    expect(ld["@type"]).toBe("Game");
    expect(ld.numberOfPlayers).toMatchObject({ minValue: 2, maxValue: 6 });
    expect(ld.timeRequired).toBe("PT60M");
    expect(ld.genre).toBe("추리 방탈출");
    const bare = themeEntityLd(t({ players: "", time_limit: null, genre: "기타" }), { url: "u" });
    expect(bare).not.toHaveProperty("numberOfPlayers");
    expect(bare).not.toHaveProperty("timeRequired");
    expect(bare).not.toHaveProperty("genre");
  });
});

describe("문답", () => {
  const list = [
    t({ id: "1" }), t({ id: "2", genre: "공포", difficulty: 2 }), t({ id: "3", difficulty: 1, players: "2~4" }),
    t({ id: "4", cafe: "제로월드 강남점", difficulty: 2 }),
  ];
  it("지역: 개수·브랜드 수가 맞고, 근거가 적으면 질문을 만들지 않는다", () => {
    const faq = regionFaq("서울", list);
    expect(faq[0].a).toContain("4개");
    expect(faq[0].a).toContain("브랜드는 2곳");
    expect(faq.some((f) => f.q.includes("처음"))).toBe(true); // 난이도 2 이하 3개
    expect(regionFaq("서울", [])).toEqual([]);
    expect(regionFaq("서울", [t({ difficulty: 4, players: "" })]).some((f) => f.q.includes("처음"))).toBe(false);
  });
  it("브랜드: 테마 수와 지점 수", () => {
    const faq = brandFaq("키이스케이프", list.slice(0, 3));
    expect(faq[0].a).toContain("3개");
    expect(faq[0].a).toContain("지점은 1곳");
  });
});

describe("짧은 제목·설명 늘리기", () => {
  it("짧은 설명에만 꼬리 문장을 붙인다", () => {
    expect(padDescription("짧아요", "더 읽어 보세요.")).toBe("짧아요. 더 읽어 보세요.");
    const long = "가".repeat(MIN_DESCRIPTION);
    expect(padDescription(long, "꼬리")).toBe(long);
  });
  it("짧은 제목에만 설명을 붙인다", () => {
    expect(padTitle("Carder — 셜록홈즈 방탈출", "난이도·예약 정보")).toBe("Carder — 셜록홈즈 방탈출 난이도·예약 정보");
    const long = "가".repeat(MIN_TITLE);
    expect(padTitle(long, "꼬리")).toBe(long);
  });
});
