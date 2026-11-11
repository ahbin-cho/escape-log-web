import { describe, expect, it } from "vitest";
import { INDEXNOW_KEY, indexNowPayload, recentThemeUrls } from "./indexnow";

const SITE = "https://example.com";

describe("indexNowPayload", () => {
  it("키 위치는 사이트 루트의 {키}.txt", () => {
    const p = indexNowPayload([`${SITE}/a`], SITE);
    expect(p).toEqual({
      host: "example.com",
      key: INDEXNOW_KEY,
      keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
      urlList: [`${SITE}/a`],
    });
  });

  it("중복과 다른 호스트 주소는 뺀다", () => {
    const p = indexNowPayload([`${SITE}/a`, `${SITE}/a`, "https://other.com/x"], `${SITE}/`);
    expect(p.urlList).toEqual([`${SITE}/a`]);
  });
});

describe("recentThemeUrls", () => {
  const now = new Date("2026-11-11T12:00:00Z");
  it("최근 n시간 안에 들어온 테마만", () => {
    const themes = [
      { id: "new", created_at: "2026-11-11T01:00:00Z" },
      { id: "old", created_at: "2026-11-08T01:00:00Z" },
      { id: "none", created_at: null },
    ];
    expect(recentThemeUrls(themes, now, 48, SITE)).toEqual([`${SITE}/theme/new`]);
  });
});
