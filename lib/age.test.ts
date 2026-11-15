import { describe, expect, it } from "vitest";
import { ageLimit, isAdultOnly, isSoftOpen } from "./age";
import { freshPicks, mysteryCandidates } from "./home-picks";
import type { ThemeRow } from "./catalog-server";

const row = (p: Partial<ThemeRow>): ThemeRow =>
  ({ id: "a", name: "테마", cafe: "매장 홍대점", genre: "기타", difficulty: 3, fear_level: 1, tags: [], teaser: "", time_limit: 60, players: "2~4", reservation_url: "", poster_url: "", booking_open: null, created_at: "2026-11-15T00:00:00Z", ...p }) as ThemeRow;

describe("나이 제한", () => {
  it("태그에서 제한을 읽는다", () => {
    expect(ageLimit(["19금", "19세 미만 불가", "홍대"])).toEqual({ label: "19세 미만 이용 불가", adultOnly: true });
    expect(ageLimit(["스릴러", "고등학생 미만 불가"])).toEqual({ label: "고등학생 미만 이용 불가", adultOnly: false });
    expect(ageLimit(["공포", "홍대"])).toBeNull();
    expect(ageLimit(null)).toBeNull();
  });

  it("가오픈 태그를 읽는다", () => {
    expect(isSoftOpen(["공포", "가오픈"])).toBe(true);
    expect(isSoftOpen(["공포", "홍대"])).toBe(false);
    expect(isSoftOpen(null)).toBe(false);
  });

  it("성인 전용 테마는 홈 새 테마·오늘의 미스터리(인스타 자동 게시)에 나오지 않는다", () => {
    const long = "아주 긴 줄거리입니다. ".repeat(6);
    const adult = row({ id: "x", name: "성인테마", tags: ["19금"], teaser: long });
    const teen = row({ id: "y", name: "추격테마", tags: ["고등학생 미만 불가"], teaser: long });
    expect(isAdultOnly(adult.tags)).toBe(true);
    expect(mysteryCandidates([adult, teen]).map((t) => t.id)).toEqual(["y"]);
    expect(freshPicks([adult, teen], 5).map((t) => t.id)).toEqual(["y"]);
  });
});
