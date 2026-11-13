import { cache } from "react";
import { publicClient } from "@/lib/supabase/public";
import { normalizeGenre } from "@/lib/genre";

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
