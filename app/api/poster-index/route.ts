import { getAllThemes } from "@/lib/catalog-server";
import { buildPosterIndex } from "@/lib/poster";

// 내 기록(달력·서재)이 공식 포스터를 붙일 때 한 번 받아 가는 목록. 1시간마다 갱신.
export const revalidate = 3600;

export async function GET() {
  return Response.json(buildPosterIndex(await getAllThemes()), {
    headers: { "Cache-Control": "public, max-age=600, stale-while-revalidate=3600" },
  });
}
