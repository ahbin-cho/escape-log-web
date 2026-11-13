import Link from "next/link";
import { getPublicFeed } from "@/lib/store";
import ReviewCard from "@/components/ReviewCard";
import { publicClient } from "@/lib/supabase/public";

// 공개 후기는 서버에서 그려 검색엔진이 받는 HTML 에도 실리게 한다.
// 새 후기가 배포 없이도 보이도록 10분마다 다시 만든다.
export const revalidate = 600;

export default async function FeedPage() {
  let reviews: Awaited<ReturnType<typeof getPublicFeed>> = [];
  try {
    reviews = await getPublicFeed(60, publicClient());
  } catch {
    reviews = []; // DB 못 읽으면 빈 목록(빌드는 통과)
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-extrabold sm:text-2xl">모두의 후기</h1>
        <p className="text-sm text-cream/70">
          다른 사람들이 공개한 방탈출 후기예요. 기록을 남길 때 “공개 후기로 올리기”를 켜면 여기에 보여요.
          카드 오른쪽 위 “공유”를 누르면 이미지로 저장하거나 보낼 수 있어요.
        </p>
      </header>

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
            <ReviewCard key={r.id} review={r} byline={`— ${r.nickname}${r.isSample ? " · 예시" : ""}`} />
          ))}
        </div>
      )}
    </div>
  );
}
