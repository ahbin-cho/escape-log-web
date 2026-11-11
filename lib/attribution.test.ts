import { describe, expect, it } from "vitest";
import { buildTrackedUrl, cleanTag, detectAttribution, fromReferrer, isFresh, ATTRIBUTION_TTL_MS } from "./attribution";

const HOST = "bantallog.com";

describe("detectAttribution", () => {
  it("꼬리표가 있으면 꼬리표 우선", () => {
    const a = detectAttribution("?utm_source=DCInside&utm_campaign=첫글", "https://cafe.naver.com/x", HOST, 1);
    expect(a).toEqual({ source: "dcinside", medium: "link", campaign: "첫글", at: 1 });
  });
  it("꼬리표가 없으면 넘어온 사이트로 판별", () => {
    expect(detectAttribution("", "https://gall.dcinside.com/m/roomescape/1", HOST, 1)?.source).toBe("dcinside");
    expect(detectAttribution("", "https://m.search.naver.com/search.naver?q=x", HOST, 1)).toMatchObject({ source: "naver_search", medium: "search" });
    expect(detectAttribution("", "https://cafe.naver.com/escaperoomcafe", HOST, 1)?.source).toBe("naver_cafe");
    expect(detectAttribution("", "https://www.google.co.kr/", HOST, 1)?.source).toBe("google");
    expect(detectAttribution("", "https://l.instagram.com/?u=x", HOST, 1)?.source).toBe("instagram");
  });
  it("직접 방문·우리 사이트 안 이동은 null", () => {
    expect(detectAttribution("", "", HOST, 1)).toBeNull();
    expect(detectAttribution("", "https://bantallog.com/best", HOST, 1)).toBeNull();
    expect(detectAttribution("", "not a url", HOST, 1)).toBeNull();
  });
  it("모르는 사이트는 도메인 이름으로", () => {
    expect(fromReferrer("https://www.some-blog.co.kr/post", HOST)).toEqual({ source: "some-blog_co_kr", medium: "referral" });
  });
});

describe("cleanTag / isFresh / buildTrackedUrl", () => {
  it("꼬리표 정리: 공백·특수문자 제거, 50자", () => {
    expect(cleanTag("  Naver Cafe!! ")).toBe("naver_cafe");
    expect(cleanTag("a".repeat(80)).length).toBe(50);
  });
  it("30일 지나면 만료", () => {
    expect(isFresh({ source: "x", medium: "y", campaign: "", at: 0 }, ATTRIBUTION_TTL_MS - 1)).toBe(true);
    expect(isFresh({ source: "x", medium: "y", campaign: "", at: 0 }, ATTRIBUTION_TTL_MS)).toBe(false);
    expect(isFresh(null, 0)).toBe(false);
  });
  it("추적 링크", () => {
    const u = buildTrackedUrl("https://bantallog.com", "/quiz", "dcinside", "community", "첫 글");
    const p = new URL(u).searchParams;
    expect(new URL(u).pathname).toBe("/quiz");
    expect([p.get("utm_source"), p.get("utm_medium"), p.get("utm_campaign")]).toEqual(["dcinside", "community", "첫_글"]);
  });
});

describe("rateLabel", () => {
  it("방문자 대비 비율", async () => {
    const { rateLabel } = await import("./attribution");
    expect(rateLabel(1, 3)).toBe("33%");
    expect(rateLabel(0, 0)).toBe("–");
  });
});
