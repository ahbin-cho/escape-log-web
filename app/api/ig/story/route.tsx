import { getAllThemes } from "@/lib/catalog-server";
import { genreCard } from "@/lib/genre-card";
import { jpegResponse } from "@/lib/og-card";
import { teaserPreview } from "@/lib/home-picks";
import { regionFromText } from "@/lib/region";

// "이 방의 이야기" 카드: ?id=<테마 id>. 매장 공식 줄거리를 장르 분위기로 들려준다(이름 공개).
// 실제 사건처럼 지어낸 괴담이 아니라, 매장이 공개한 설정만 쓴다.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? "";
  const t = (await getAllThemes()).find((x) => x.id === id);
  if (!t || !t.teaser) return new Response("테마를 찾을 수 없어요", { status: 404 });
  return jpegResponse(
    genreCard({
      teaser: teaserPreview(t.teaser, 120),
      genre: t.genre,
      difficulty: t.difficulty,
      fear: t.fear_level,
      region: regionFromText(t.cafe),
      date: "이 방의 이야기",
      origin: url.origin,
      seed: id.split("").reduce((a, c) => a + c.charCodeAt(0), 0),
      reveal: { name: t.name, cafe: t.cafe },
    }),
    86400
  );
}
