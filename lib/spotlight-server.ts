import { cache } from "react";
import { publicClient } from "@/lib/supabase/public";
import { normalizeGenre } from "@/lib/genre";
import { SPOTLIGHTS, spotlightFromRow, type Spotlight, type SpotlightRow } from "@/lib/spotlight";

// 화제의 방 목록: DB(spotlights 표)에서 읽는다(최근에 넣은 것이 앞).
// 표가 아직 없거나 못 읽으면 코드에 있는 예비 목록을 쓴다.
export const getSpotlights = cache(async (): Promise<Spotlight[]> => {
  try {
    const { data, error } = await publicClient()
      .from("spotlights")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) return SPOTLIGHTS;
    return (data as SpotlightRow[]).map(spotlightFromRow);
  } catch {
    return SPOTLIGHTS;
  }
});

export async function getSpotlight(slug: string): Promise<Spotlight | undefined> {
  return (await getSpotlights()).find((s) => s.slug === slug);
}

export type SpotlightTheme = {
  id: string;
  name: string;
  cafe: string;
  genre: string;
  difficulty: number;
  fear_level: number;
  teaser: string | null;
  tags: string[] | null;
  time_limit: number | null;
  players: string | null;
  reservation_url: string | null;
  poster_url: string | null;
};

// 스포트라이트에 묶인 테마(포스터 포함). DB 를 못 읽으면 빈 배열.
export const spotlightThemes = cache(async (cafeIncludes: string): Promise<SpotlightTheme[]> => {
  try {
    const { data } = await publicClient()
      .from("catalog")
      .select("id,name,cafe,genre,difficulty,fear_level,teaser,tags,time_limit,players,reservation_url,poster_url")
      .ilike("cafe", `%${cafeIncludes}%`)
      .order("created_at", { ascending: true });
    return ((data as SpotlightTheme[]) ?? []).map((t) => ({ ...t, genre: normalizeGenre(t.genre, t.tags) }));
  } catch {
    return [];
  }
});
