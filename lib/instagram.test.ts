import { describe, expect, it } from "vitest";
import type { ThemeRow } from "./catalog-server";
import { IG_CAPTION_MAX, mysteryCaption, mysteryHashtags } from "./instagram";

const t = (p: Partial<ThemeRow> = {}): ThemeRow => ({
  id: "1", name: "비밀의 방", cafe: "키이스케이프 강남점", genre: "공포", difficulty: 2, fear_level: 5,
  tags: null, teaser: "어두운 방에서 눈을 뜬 당신.", time_limit: 60, players: "2~4", reservation_url: null, ...p,
});

describe("mysteryCaption", () => {
  it("정답(테마 이름·매장)은 캡션에 없다", () => {
    const c = mysteryCaption(t());
    expect(c).not.toContain("비밀의 방");
    expect(c).not.toContain("키이스케이프");
    expect(c).toContain("어두운 방에서 눈을 뜬 당신.");
    expect(c).toContain("공포 · 난이도 2/5 · 공포도 5/5 · 서울");
  });

  it("해시태그: 장르·지역·조건, 중복·특수문자 없음", () => {
    const tags = mysteryHashtags(t());
    expect(tags).toContain("#공포방탈출");
    expect(tags).toContain("#서울방탈출");
    expect(tags).toContain("#방탈출입문");
    expect(new Set(tags).size).toBe(tags.length);
    expect(tags.every((x) => /^#[0-9A-Za-z가-힣_]+$/.test(x))).toBe(true);
  });

  it("너무 긴 줄거리는 잘라서 2200자 안으로", () => {
    expect(mysteryCaption(t({ teaser: "가".repeat(5000) })).length).toBeLessThanOrEqual(IG_CAPTION_MAX);
  });
});

describe("alreadyPostedToday", () => {
  it("한국 날짜로 오늘 올린 미스터리 글이 있으면 true", async () => {
    const { alreadyPostedToday } = await import("./instagram");
    const now = new Date("2026-11-12T03:00:00Z"); // 한국 12시
    expect(alreadyPostedToday([{ caption: "👻 오늘의 미스터리 방 …", timestamp: "2026-11-11T16:00:00+0000" }], now)).toBe(true); // 한국 12일 1시
    expect(alreadyPostedToday([{ caption: "👻 오늘의 미스터리 방 …", timestamp: "2026-11-11T14:00:00+0000" }], now)).toBe(false); // 한국 11일
    expect(alreadyPostedToday([{ caption: "다른 글", timestamp: "2026-11-12T01:00:00+0000" }], now)).toBe(false);
  });
});

describe("graphHost", () => {
  it("토큰 종류로 주소를 고른다", async () => {
    const { graphHost } = await import("./instagram");
    expect(graphHost("IGAAxxxx")).toBe("graph.instagram.com");
    expect(graphHost("EAAxxxx")).toBe("graph.facebook.com");
  });
});
