import { getAllThemes } from "@/lib/catalog-server";
import { posterSrc } from "@/lib/ui";

// 헤더 검색창이 한 번만 받아 가는 가벼운 테마 목록(검색에 필요한 칸만).
// 글자를 칠 때마다 서버에 묻지 않고 브라우저에서 바로 찾게 한다. 10분마다 갱신.
export const revalidate = 3600;

export async function GET() {
  const rows = (await getAllThemes()).map((t) => ({
    id: t.id,
    name: t.name,
    cafe: t.cafe,
    genre: t.genre,
    difficulty: t.difficulty,
    fear_level: t.fear_level,
    tags: t.tags,
    // 검색 결과 썸네일용. 없으면 칸 자체를 빼서 응답을 가볍게 둔다
    ...(posterSrc(t.poster_url) ? { poster_url: t.poster_url } : {}),
  }));
  return Response.json(rows, {
    headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" },
  });
}
