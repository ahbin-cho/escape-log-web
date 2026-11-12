import type { ThemeRow } from "./catalog-server";
import { brandOf } from "./cafe";

// ─────────────────────────────────────────────────────────────
// 지역 모음 캐러셀("수원 방탈출" 등)의 테마 고르기. 순수 함수(테스트 대상).
// 정보성 소개라 한 매장에 쏠리지 않게 섹션마다 같은 매장은 최대 2개,
// 섹션끼리 겹치지 않게, 대기실·현장 안내용 항목은 뺀다.
// ─────────────────────────────────────────────────────────────

export type CollectionSection = { key: string; title: string; sub: string; themes: ThemeRow[] };

const PER_SECTION = 4;
const PER_CAFE = 2;

export function isRealTheme(t: ThemeRow): boolean {
  return !/대기실|현장 안내|현장안내/.test(t.name);
}

export function areaThemes(all: ThemeRow[], area: string): ThemeRow[] {
  return all.filter((t) => t.cafe.includes(area) && isRealTheme(t));
}

const SECTIONS: {
  key: string;
  title: string;
  sub: string;
  match: (t: ThemeRow) => boolean;
  rank: (t: ThemeRow) => number;
}[] = [
  {
    key: "fear",
    title: "무서운 게 좋다면",
    sub: "공포도 높은 순",
    match: (t) => t.fear_level >= 4,
    rank: (t) => -(t.fear_level * 10 + t.difficulty),
  },
  {
    key: "calm",
    title: "무서운 건 싫다면",
    sub: "공포도 1 · 장르 다양하게",
    match: (t) => t.fear_level <= 1 && t.genre !== "기타",
    rank: (t) => t.difficulty,
  },
  {
    key: "first",
    title: "방탈출이 처음이라면",
    sub: "난이도 낮고 덜 무서운 순",
    match: (t) => t.difficulty <= 3 && t.fear_level <= 2,
    rank: (t) => t.difficulty * 10 + t.fear_level,
  },
  {
    key: "story",
    title: "이야기가 좋다면",
    sub: "추리 · 감성 · 판타지",
    match: (t) => ["추리", "감성", "판타지"].includes(t.genre),
    rank: (t) => t.fear_level * 10 + t.difficulty,
  },
];

export function pickCollection(themes: ThemeRow[]): CollectionSection[] {
  const used = new Set<string>();
  return SECTIONS.map((s) => {
    const perCafe = new Map<string, number>();
    const picked: ThemeRow[] = [];
    const candidates = themes
      .filter((t) => s.match(t) && !used.has(t.id))
      .sort((a, b) => s.rank(a) - s.rank(b) || a.name.localeCompare(b.name, "ko"));
    // 브랜드가 섞이도록: 먼저 브랜드별 1개씩, 그다음 채우기
    const seenBrand = new Set<string>();
    const ordered = [
      ...candidates.filter((t) => (seenBrand.has(brandOf(t.cafe)) ? false : (seenBrand.add(brandOf(t.cafe)), true))),
      ...candidates,
    ];
    for (const t of ordered) {
      if (picked.length >= PER_SECTION) break;
      if (picked.includes(t)) continue;
      const n = perCafe.get(t.cafe) ?? 0;
      if (n >= PER_CAFE) continue;
      perCafe.set(t.cafe, n + 1);
      picked.push(t);
    }
    picked.forEach((t) => used.add(t.id));
    return { key: s.key, title: s.title, sub: s.sub, themes: picked };
  }).filter((s) => s.themes.length >= 2);
}
