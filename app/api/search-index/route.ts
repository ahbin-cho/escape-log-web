import { getAllThemes } from "@/lib/catalog-server";

// 헤더 검색창이 한 번만 받아 가는 가벼운 테마 목록(검색에 필요한 칸만).
// 글자를 칠 때마다 서버에 묻지 않고 브라우저에서 바로 찾게 한다. 1시간마다 갱신.
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
  }));
  return Response.json(rows, {
    headers: { "Cache-Control": "public, max-age=600, stale-while-revalidate=3600" },
  });
}
