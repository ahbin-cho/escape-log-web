import { getAllThemes } from "@/lib/catalog-server";
import { paperStoryCard } from "@/lib/paper-card";
import { jpegResponse } from "@/lib/og-card";
import { cleanTeaser, teaserPreview } from "@/lib/home-picks";
import { regionFromText } from "@/lib/region";

// "이 방의 이야기" 카드: ?id=<테마 id>. 매장 공식 줄거리를 디자인 D 종이 카드로 들려준다(이름 공개, 포스터 대신 장르 색 표지).
// 실제 사건처럼 지어낸 괴담이 아니라, 매장이 공개한 설정만 쓴다.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? "";
  const t = (await getAllThemes()).find((x) => x.id === id);
  if (!t || !t.teaser) return new Response("테마를 찾을 수 없어요", { status: 404 });
  return jpegResponse(
    paperStoryCard({
      // 줄거리 뒤에 붙은 예약·이용 안내(※ …)는 카드에서 뺀다. 캡션에는 원문 그대로 들어간다.
      teaser: teaserPreview(cleanTeaser(t.teaser) || t.teaser, 120),
      genre: t.genre,
      difficulty: t.difficulty,
      fear: t.fear_level,
      region: regionFromText(t.cafe),
      date: "",
      origin: url.origin,
      reveal: { name: t.name, cafe: t.cafe },
    }),
    86400
  );
}
