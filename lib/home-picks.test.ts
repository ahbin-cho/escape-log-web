import { describe, expect, it } from "vitest";
import type { ThemeRow } from "./catalog-server";
import { agoLabel, dailyMystery, kstDate, mysteryCandidates, newestThemes, teaserPreview } from "./home-picks";

const t = (p: Partial<ThemeRow>): ThemeRow => ({
  id: p.name ?? "x", name: "x", cafe: "브랜드 지점", genre: "추리", difficulty: 3, fear_level: 2,
  tags: null, teaser: null, time_limit: null, players: null, reservation_url: null, created_at: null, ...p,
});
const long = "어두운 방에서 눈을 뜬 당신, 낡은 편지 한 장과 멈춘 시계만이 남아 있다. 시간이 없다.";

describe("미스터리 방", () => {
  it("줄거리가 짧거나 이름이 드러나면 후보에서 뺀다", () => {
    const ok = t({ name: "멈춘 시간", teaser: long });
    const short = t({ name: "짧음", teaser: "짧은 줄거리" });
    const spoil = t({ name: "낡은 편지", teaser: long });
    expect(mysteryCandidates([ok, short, spoil]).map((x) => x.name)).toEqual(["멈춘 시간"]);
  });

  it("같은 날엔 같은 방, 후보가 없으면 null", () => {
    const list = ["a", "b", "c", "d", "e"].map((n) => t({ name: n, teaser: long }));
    const d = new Date("2026-11-08T01:00:00Z");
    expect(dailyMystery(list, d)?.id).toBe(dailyMystery([...list].reverse(), new Date("2026-11-08T10:00:00Z"))?.id);
    expect(dailyMystery([], d)).toBeNull();
  });

  it("한국 날짜 기준 (UTC 15시 = 다음날 0시)", () => {
    expect(kstDate(new Date("2026-11-08T14:59:00Z"))).toBe("2026-11-08");
    expect(kstDate(new Date("2026-11-08T15:00:00Z"))).toBe("2026-11-09");
  });
});

describe("새로 들어온 테마", () => {
  it("등록 최신순, 등록일 없는 건 제외", () => {
    const out = newestThemes(
      [t({ name: "옛날", created_at: "2026-01-01" }), t({ name: "최신", created_at: "2026-11-01" }), t({ name: "없음" })],
      5
    );
    expect(out.map((x) => x.name)).toEqual(["최신", "옛날"]);
  });

  it("며칠 전 표시", () => {
    const now = new Date("2026-11-08T03:00:00Z");
    expect(agoLabel("2026-11-08T00:00:00Z", now)).toBe("오늘");
    expect(agoLabel("2026-11-07T03:00:00Z", now)).toBe("어제");
    expect(agoLabel("2026-11-05T03:00:00Z", now)).toBe("3일 전");
    expect(agoLabel("2026-10-25T03:00:00Z", now)).toBe("2주 전");
  });
});

describe("teaserPreview", () => {
  it("길면 단어 경계에서 자르고 말줄임", () => {
    const out = teaserPreview(long, 30);
    expect(out.endsWith("…")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(31);
    expect(teaserPreview("짧다")).toBe("짧다");
  });
});
