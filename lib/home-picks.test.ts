import { describe, expect, it } from "vitest";
import type { ThemeRow } from "./catalog-server";
import {
  agoLabel, cleanTeaser, dailyMystery, freshPicks, kstDate, mysteryCandidates, newestThemes, teaserPreview,
} from "./home-picks";

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

  it("'제작자의 한마디' 같은 안내글은 후보에서 뺀다", () => {
    const note = t({ name: "웰컴", teaser: "제작자의 한마디 : 웰컴티처럼 본 매장에 처음 방문하신 플레이어 분들께 환영의 의미를 담아 선물" });
    expect(mysteryCandidates([note])).toEqual([]);
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

describe("홈 새로 들어온 테마 고르기", () => {
  const day = "2026-11-11T02:00:00Z";
  it("지점만 다른 같은 이름 테마는 하나만", () => {
    const out = freshPicks(
      [t({ id: "1", name: "호텔", cafe: "셜록 구리점", created_at: day }), t({ id: "2", name: "호텔", cafe: "셜록 성신여대점", created_at: day })],
      6
    );
    expect(out).toHaveLength(1);
  });

  it("한 브랜드가 몰려 들어와도 브랜드를 번갈아 섞는다", () => {
    const many = ["a", "b", "c", "d", "e"].map((n) => t({ id: n, name: n, cafe: "셜록 지점", created_at: day }));
    const one = t({ id: "z", name: "z", cafe: "단편선 강남점", created_at: day });
    const out = freshPicks([...many, one], 3);
    expect(out.map((x) => x.cafe.split(" ")[0])).toContain("단편선");
    expect(out[0].cafe.split(" ")[0]).not.toBe(out[1].cafe.split(" ")[0]);
  });

  it("최신 묶음이 충분하면 오래된 테마는 끼워 넣지 않는다", () => {
    const fresh = ["a", "b", "c"].map((n) => t({ id: n, name: n, cafe: "셜록 지점", created_at: day }));
    const old = t({ id: "o", name: "o", cafe: "옛브랜드 지점", created_at: "2026-07-01T00:00:00Z" });
    expect(freshPicks([...fresh, old], 3).map((x) => x.name)).not.toContain("o");
  });
});

describe("cleanTeaser", () => {
  it("대괄호 안내·예약 괄호·주의사항 표시 뒤를 걷어낸다", () => {
    expect(cleanTeaser("[무비무드 방문시 1인 1음료 구매 필수입니다.] 낡은 극장의 마지막 상영")).toBe("낡은 극장의 마지막 상영");
    expect(cleanTeaser("(3인 이상 추천, 5인 이상 이용 시 매장 문의) 당신의 감각을 깨울 게임")).toBe("당신의 감각을 깨울 게임");
    expect(cleanTeaser("그들은 이미 알고 있었다 * 고소공포증이 있는 경우 지장이 있을 수 있습니다.")).toBe("그들은 이미 알고 있었다");
    expect(cleanTeaser("감옥 같은 창고였다. ✓ 몰입이 굉장히 중요한 테마입니다.")).toBe("감옥 같은 창고였다.");
  });

  it("앞에 붙은 '장르 - … 난이도 - n/5' 머리말을 뗀다", () => {
    expect(cleanTeaser("장르 - 힐링/판타지 시간 - 60분 난이도 - 3/5 낭랑 카페는 오랫동안 존재해 왔습니다.")).toBe("낭랑 카페는 오랫동안 존재해 왔습니다.");
    expect(cleanTeaser("스토리/로맨스 난이도 : 4/5 작가님 ~ 마감이 코앞인데...")).toBe("작가님 ~ 마감이 코앞인데...");
  });

  it("줄거리 속 평범한 괄호는 남긴다", () => {
    expect(cleanTeaser("비밀경찰 Gestapo(게슈타포)의 요원")).toBe("비밀경찰 Gestapo(게슈타포)의 요원");
  });
});
