import Link from "next/link";
import { listedConditions } from "@/lib/best";
import { getAllThemes } from "@/lib/catalog-server";

// 홈 상단 "어떤 방 찾아?": 조건별 추천 진입 + 우리 팀 궁합 진입.
// 서버 컴포넌트라 링크가 HTML 에 그대로 실려 검색엔진이 /best 페이지들을 따라간다.
export default async function HomeDiscover() {
  const conditions = listedConditions(await getAllThemes());

  return (
    <section className="space-y-3" aria-labelledby="home-discover">
      <div className="flex items-baseline justify-between">
        <h2 id="home-discover" className="text-xl">
          🎯 어떤 방 찾아?
        </h2>
        {conditions.length > 0 && (
          <Link href="/best" className="text-xs font-bold text-candy">
            조건 전체 보기 →
          </Link>
        )}
      </div>

      {conditions.length > 0 && (
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {conditions.map(({ condition: c, count }) => (
            <li key={c.slug}>
              <Link
                href={`/best/${c.slug}`}
                className="rough flex h-full items-center gap-2.5 rounded-2xl border-2 border-edge bg-panel px-3 py-3 transition hover:border-candy active:scale-[0.97]"
              >
                <span className="text-2xl leading-none" aria-hidden>
                  {c.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-extrabold">
                    {c.label}
                  </span>
                  <span className="block text-xs font-bold text-cream/50">
                    테마 {count}곳
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/match"
        className="rough flex items-center gap-4 rounded-2xl border-2 border-edge bg-grape/10 p-4 transition hover:border-grape active:scale-[0.99]"
      >
        <span className="text-3xl leading-none" aria-hidden>
          👥
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-extrabold">
            여럿이 가? 우리 팀 궁합부터
          </span>
          <span className="mt-0.5 block text-sm text-cream/70 [word-break:keep-all]">
            팀 궁합 점수에, 제일 겁 많은 친구도 들어갈 수 있는 방까지 골라 줄게.
            링크 하나로 단톡방에 공유.
          </span>
        </span>
        <span className="shrink-0 text-sm font-extrabold text-grape">시작 →</span>
      </Link>
    </section>
  );
}
