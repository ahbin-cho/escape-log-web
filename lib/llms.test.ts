import { describe, expect, it } from "vitest";
import type { ThemeRow } from "./catalog-server";
import { llmsFullTxt, llmsTxt } from "./llms";

const t = (p: Partial<ThemeRow>): ThemeRow => ({
  id: "a1", name: "테마", cafe: "키이스케이프 강남점", genre: "추리", difficulty: 3, fear_level: 0,
  tags: null, teaser: null, time_limit: 60, players: "2~6명", reservation_url: null, ...p,
});

describe("llms.txt", () => {
  it("숫자는 목록에서 세고, 한글 주소는 인코딩한다(대기실 안내용 항목은 세지 않는다)", () => {
    const txt = llmsTxt({
      themes: [t({}), t({ id: "b", name: "WELCOME (대기실 컨텐츠, 현장 안내)" })],
      regions: [{ key: "서울", count: 1 }], brands: [{ key: "키이스케이프", count: 1 }], conditions: [], updated: "2026-11-19",
    });
    expect(txt).toContain("방탈출 테마 1개");
    expect(txt).toContain("/region/%EC%84%9C%EC%9A%B8): 테마 1개");
    expect(txt).toContain("/theme/{id}");
  });
  it("전체 목록: 없는 값은 건너뛰고 '명'이 겹치지 않는다", () => {
    const txt = llmsFullTxt([t({}), t({ id: "c", genre: "기타", players: "", time_limit: null })], "2026-11-19");
    expect(txt).toContain("- [테마](https://talkkaknote.com/theme/a1): 키이스케이프 강남점 · 서울 · 추리 · 난이도 3/5 · 2~6명 · 60분");
    expect(txt).toContain("/theme/c): 키이스케이프 강남점 · 서울 · 난이도 3/5\n");
  });
});
