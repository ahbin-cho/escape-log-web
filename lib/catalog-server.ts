import { cache } from "react";
import { publicClient } from "@/lib/supabase/public";
import { brandOf } from "@/lib/cafe";
import { regionFromText, REGIONS, type Region } from "@/lib/region";
import type { Genre } from "@/lib/store";

// ─────────────────────────────────────────────────────────────
// 서버 전용 카탈로그 읽기 + 지역/브랜드 묶음.
// 목록 페이지(/region/[region], /cafe/[brand])·테마 상세·사이트맵이 공유한다.
// 카탈로그를 한 번만 읽고 메모리에서 묶는다(지역은 DB 컬럼이 아니라 코드 추론값).
// ─────────────────────────────────────────────────────────────

export type ThemeRow = {
  id: string;
  name: string;
  cafe: string;
  genre: Genre;
  difficulty: number;
  fear_level: number;
  tags: string[] | null;
  teaser: string | null;
  time_limit: number | null;
  players: string | null;
  reservation_url: string | null;
};

// 이보다 테마가 적은 지역·브랜드는 페이지를 만들지 않는다(얇은 페이지 방지).
export const MIN_THEMES = 3;

// DB 못 읽으면 빈 배열 → 목록 페이지가 생성되지 않을 뿐 빌드는 통과.
export const getAllThemes = cache(async (): Promise<ThemeRow[]> => {
  try {
    const { data } = await publicClient()
      .from("catalog")
      .select(
        "id,name,cafe,genre,difficulty,fear_level,tags,teaser,time_limit,players,reservation_url"
      )
      .order("created_at", { ascending: true });
    return (data as ThemeRow[]) ?? [];
  } catch {
    return [];
  }
});

function groupBy<K>(rows: ThemeRow[], keyOf: (t: ThemeRow) => K | null) {
  const map = new Map<K, ThemeRow[]>();
  for (const t of rows) {
    const key = keyOf(t);
    if (key === null) continue;
    const list = map.get(key);
    if (list) list.push(t);
    else map.set(key, [t]);
  }
  return map;
}

export async function themesByRegion(): Promise<Map<Region, ThemeRow[]>> {
  return groupBy(await getAllThemes(), (t) => regionFromText(t.cafe));
}

export async function themesByBrand(): Promise<Map<string, ThemeRow[]>> {
  return groupBy(await getAllThemes(), (t) => brandOf(t.cafe) || null);
}

export type Listed<K> = { key: K; count: number };

// 페이지가 실제로 존재하는 지역 (REGIONS 순서 유지)
export async function listedRegions(): Promise<Listed<Region>[]> {
  const map = await themesByRegion();
  return REGIONS.map((key) => ({ key, count: map.get(key)?.length ?? 0 })).filter(
    (r) => r.count >= MIN_THEMES
  );
}

// 페이지가 실제로 존재하는 브랜드 (테마 많은 순)
export async function listedBrands(): Promise<Listed<string>[]> {
  const map = await themesByBrand();
  return [...map.entries()]
    .map(([key, list]) => ({ key, count: list.length }))
    .filter((b) => b.count >= MIN_THEMES)
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key, "ko"));
}

// generateStaticParams 용 경로 값. dev 서버는 dynamicParams = false 일 때
// 요청 경로를 인코딩된 채로 비교해서, 한글 값을 그대로 주면 전부 404 가 된다.
// 빌드(프로덕션)는 원래 값 그대로 써야 하므로 dev 에서만 인코딩한다.
export function staticParam(value: string): string {
  return process.env.NODE_ENV === "development"
    ? encodeURIComponent(value)
    : value;
}

// 한글 경로 파라미터 복원. 잘못 인코딩된 값은 null → 호출부에서 404.
export function decodeParam(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}
