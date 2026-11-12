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
    expect(tags[0]).toBe("#강남방탈출"); // 동네 태그가 맨 앞
    expect(tags).toContain("#강남데이트");
    expect(tags.some((x) => x.includes("키이스케이프"))).toBe(false); // 브랜드(정답) 태그 없음
    expect(tags.length).toBeLessThanOrEqual(30);
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

describe("districtFromText", () => {
  it("매장명 속 동네 이름, 시도 이름은 제외", async () => {
    const { districtFromText } = await import("./region");
    expect(districtFromText("키이스케이프 강남점")).toBe("강남");
    expect(districtFromText("비트포비아 서면던전")).toBe("서면");
    expect(districtFromText("제로월드 홍익대점")).toBe("홍대");
    expect(districtFromText("셜록홈즈 부산점")).toBeNull();
  });
});

describe("게시 일정", () => {
  it("일정에 있는 날은 그 묶음, 없으면 null", async () => {
    const { scheduledSet, setImagePaths, SET_CAPTIONS } = await import("./instagram");
    expect(scheduledSet("2026-11-12")).toBe("intro");
        expect(setImagePaths("intro")).toHaveLength(6);
    expect(setImagePaths("ad-diary")).toEqual(["/api/ig/slides?ad=diary"]);
    expect(scheduledSet("2026-11-15")).toBe("record-story");
    expect(scheduledSet("2026-11-13")).toBe("collection:수원");
    expect(scheduledSet("2026-11-17")).toBeNull();
    expect(scheduledSet("2026-11-27")).toBe("cafes:yearend");
    expect(scheduledSet("2026-11-19")).toBe("reel:b60b538b-618e-4102-ab57-06f369f56a4b");
    expect(setImagePaths("record-story")).toHaveLength(4);
    // 첫 줄이 서로 달라야 중복 확인이 된다
    const firsts = Object.values(SET_CAPTIONS).map((c) => c.split("\n")[0]);
    expect(new Set(firsts).size).toBe(firsts.length);
    expect(Object.values(SET_CAPTIONS).every((c) => c.length <= 2200)).toBe(true);
  });
});

describe("resolvePost", () => {
  it("지역 모음·이 방의 이야기 묶음을 만든다", async () => {
    const { resolvePost } = await import("./instagram");
    const th = (id: string, p: Partial<ThemeRow>): ThemeRow => ({
      id, name: id, cafe: "상상의문 수원점", genre: "공포", difficulty: 3, fear_level: 4, tags: null,
      teaser: "같은 기척, 같은 냄새, 같은 어둠.", time_limit: null, players: null, reservation_url: null, ...p,
    });
    const pool = [
      th("a", {}), th("b", { cafe: "셜록홈즈 수원역점" }),
      th("c", { genre: "코믹", fear_level: 1, difficulty: 2 }), th("d", { genre: "감성", fear_level: 1, cafe: "셜록홈즈 수원역점" }),
    ];
    const col = resolvePost("collection:수원", pool)!;
    expect(col.imagePaths[0]).toContain("page=1");
    expect(col.caption.split("\n")[0]).toContain("수원 방탈출");
    const story = resolvePost("story:a", pool)!;
    expect(story.imagePaths).toEqual(["/api/ig/story?id=a"]);
    expect(story.caption).toContain("이 방의 이야기 · a");
    expect(resolvePost("story:없음", pool)).toBeNull();
    expect(resolvePost("이상한값", pool)).toBeNull();
  });
});
