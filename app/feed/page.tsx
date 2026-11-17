import Link from "next/link";
import { getPublicFeed } from "@/lib/store";
import ReviewCard from "@/components/ReviewCard";
import HotThemes from "@/components/HotThemes";
import { publicClient } from "@/lib/supabase/public";
import { buildPosterIndex, findPoster } from "@/lib/poster";
import { posterSrc } from "@/lib/ui";
import { brandOf } from "@/lib/cafe";

// 공개 후기는 서버에서 그려 검색엔진이 받는 HTML 에도 실리게 한다.
// 새 후기가 배포 없이도 보이도록 10분마다 다시 만든다.
export const revalidate = 600;

export default async function FeedPage() {
  let reviews: Awaited<ReturnType<typeof getPublicFeed>> = [];
  try {
    // 스포일러 표시한 후기는 카드 모음에는 싣지 않는다(테마 페이지에서 가려서 보여 준다)
    reviews = (await getPublicFeed(60, publicClient())).filter((r) => !r.spoiler);
  } catch {
    reviews = []; // DB 못 읽으면 빈 목록(빌드는 통과)
  }
  // 사진 없는 후기는 공식 포스터를 깔아 준다(출처 표기). 못 읽으면 장르 색 그대로
  let posters: ReturnType<typeof buildPosterIndex> = {};
  try {
    const { data } = await publicClient().from("catalog").select("id,name,cafe,poster_url").neq("poster_url", "");
    posters = buildPosterIndex((data as { id: string; name: string; cafe: string; poster_url: string | null }[]) ?? []);
  } catch {
    posters = {};
  }
  const posterFor = (name: string, cafe: string) => {
    const src = posterSrc(findPoster(posters, name, cafe)?.poster);
    return src ? { src, credit: `포스터: ${brandOf(cafe) || cafe} 공식` } : undefined;
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-extrabold sm:text-2xl">모두의 후기</h1>
        <p className="text-sm text-cream/70">
          다른 사람들이 남긴 방탈출 후기예요. 기록할 때 “후기 공개”가 켜져 있으면 여기에 보여요(사진은 따로 켠 것만).
          카드 오른쪽 위 “공유”를 누르면 이미지로 저장하거나 보낼 수 있어요.
        </p>
      </header>

      <HotThemes />

      {reviews.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-edge/40 bg-panel py-16 text-center">
          <p className="text-sm text-cream/60">아직 공개된 후기가 없어요</p>
          <Link
            href="/new"
            className="rough mt-3 inline-block rounded-xl border-2 border-edge bg-candy px-4 py-2 text-sm font-bold text-edge shadow-cute transition active:scale-[0.97]"
          >
            첫 후기 남기기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} poster={posterFor(r.themeName, r.cafeName)} byline={`— ${r.nickname}${r.isSample ? " · 예시" : ""}`} />
          ))}
        </div>
      )}
    </div>
  );
}
