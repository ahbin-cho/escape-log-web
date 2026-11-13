import Link from "next/link";
import { listedConditions } from "@/lib/best";
import { getAllThemes, listedBrands } from "@/lib/catalog-server";
import { immersiveKind } from "@/lib/immersive";

// 홈 상단 "어떤 방 찾아?": 조건별 추천 진입 + 우리 팀 궁합 진입.
// 서버 컴포넌트라 링크가 HTML 에 그대로 실려 검색엔진이 /best 페이지들을 따라간다.
export default async function HomeDiscover() {
  const [all, brands] = await Promise.all([getAllThemes(), listedBrands()]);
  const conditions = listedConditions(all);
  const topBrands = brands.slice(0, 12);
  const immersiveCount = all.filter((t) => immersiveKind(t.tags)).length;

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
                    테마 {count}개
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {topBrands.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-baseline justify-between">
            <h3 className="text-base font-extrabold">🏠 브랜드로 찾기</h3>
            <Link href="/cafe" className="text-xs font-bold text-candy">
              전체 브랜드 {brands.length}개 →
            </Link>
          </div>
          <ul className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:flex-wrap">
            {topBrands.map((b) => (
              <li key={b.key} className="shrink-0">
                <Link
                  href={`/cafe/${b.key}`}
                  className="rough-sm inline-block whitespace-nowrap rounded-full border-2 border-edge/30 bg-panel px-3 py-1.5 text-sm font-bold transition hover:border-candy hover:text-candy"
                >
                  {b.key} <span className="text-cream/45">{b.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {immersiveCount > 0 && (
        <Link
          href="/immersive"
          className="rough flex items-center gap-4 rounded-2xl border-2 border-edge bg-candy/15 p-4 transition hover:border-candy active:scale-[0.99]"
        >
          <span className="text-3xl leading-none" aria-hidden>
            🎭
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-extrabold">자물쇠 대신 배우가 있는 방</span>
            <span className="mt-0.5 block text-sm text-cream/70 [word-break:keep-all]">
              배우가 처음부터 끝까지 같이 연기하는 이머시브 연극·방탈출 {immersiveCount}곳
            </span>
          </span>
          <span className="shrink-0 text-sm font-extrabold text-candy">보기 →</span>
        </Link>
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
