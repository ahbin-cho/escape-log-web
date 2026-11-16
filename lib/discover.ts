import { brandOf } from "./cafe";

// 지역 페이지의 '숨은 매장 찾기': 여러 지점을 가진 큰 브랜드 말고, 한두 곳뿐인 작은 매장을 앞에 꺼내 준다.
// 기준은 데이터만으로 정한다: 전국에 지점(매장 이름)이 BIG_BRANCHES 곳 이상이거나
// 전국 테마가 BIG_THEMES 개 이상이면 '이미 유명한 브랜드'로 보고 뺀다.
export const BIG_BRANCHES = 3;
export const BIG_THEMES = 12;

type Row = { cafe: string };

export function branchCounts(all: Row[]): Map<string, number> {
  const cafes = new Map<string, Set<string>>();
  for (const t of all) {
    const b = brandOf(t.cafe);
    if (!cafes.has(b)) cafes.set(b, new Set());
    cafes.get(b)!.add(t.cafe);
  }
  return new Map([...cafes].map(([b, s]) => [b, s.size]));
}

// 이 지역 테마 중 작은 브랜드만, 테마 많은 순 → [브랜드, 이 지역 테마 수]
export function hiddenBrands(all: Row[], here: Row[], big = BIG_BRANCHES, bigThemes = BIG_THEMES): [string, number][] {
  const counts = branchCounts(all);
  const themes = new Map<string, number>();
  for (const t of all) themes.set(brandOf(t.cafe), (themes.get(brandOf(t.cafe)) ?? 0) + 1);
  const local = new Map<string, number>();
  for (const t of here) {
    const b = brandOf(t.cafe);
    if ((counts.get(b) ?? 0) >= big || (themes.get(b) ?? 0) >= bigThemes) continue;
    local.set(b, (local.get(b) ?? 0) + 1);
  }
  return [...local].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko"));
}

// 앵커 id 로 쓸 수 있게(공백·기호 → -)
export const brandAnchor = (brand: string) => "b-" + brand.replace(/[^\p{L}\p{N}]+/gu, "-");
