import { describe, expect, it } from "vitest";
import type { ThemeRow } from "./catalog-server";
import { areaThemes, pickCollection } from "./collection";

let n = 0;
const t = (p: Partial<ThemeRow>): ThemeRow => ({
  id: `t${++n}`, name: `테마${n}`, cafe: "브랜드A 수원점", genre: "추리", difficulty: 3, fear_level: 1,
  tags: null, teaser: null, time_limit: null, players: null, reservation_url: null, ...p,
});

describe("지역 모음", () => {
  it("지역 이름으로 거르고 대기실·현장 안내 항목은 뺀다", () => {
    const list = areaThemes(
      [t({}), t({ cafe: "브랜드A 강남점" }), t({ name: "NINE LOCKS (대기실 컨텐츠, 현장 안내)" })],
      "수원"
    );
    expect(list).toHaveLength(1);
  });

  it("섹션끼리 겹치지 않고, 섹션당 같은 매장은 최대 2개", () => {
    const pool = [
      ...Array.from({ length: 5 }, () => t({ cafe: "상상의문 수원점", genre: "공포", fear_level: 4 })),
      t({ cafe: "셜록홈즈 수원역점", genre: "공포", fear_level: 4 }),
      ...Array.from({ length: 4 }, () => t({ cafe: "룸즈에이 수원역점", genre: "코믹", fear_level: 1, difficulty: 2 })),
      t({ cafe: "셜록홈즈 수원역점", genre: "감성", fear_level: 1 }),
    ];
    const secs = pickCollection(pool);
    const fear = secs.find((s) => s.key === "fear")!;
    expect(fear.themes.filter((x) => x.cafe === "상상의문 수원점").length).toBeLessThanOrEqual(2);
    expect(fear.themes.map((x) => x.cafe)).toContain("셜록홈즈 수원역점");
    const ids = secs.flatMap((s) => s.themes.map((x) => x.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
