import Link from "next/link";
import { listedConditions } from "@/lib/best";
import { getAllThemes, listedBrands, listedRegions } from "@/lib/catalog-server";

// 홈 상단 "어떤 방 찾아?": 조건별 추천 · 지역 · 브랜드로 찾기.
// (이머시브·팀 궁합 배너는 운영자 결정 2026-11-17로 홈에서 뺐다. 페이지는 그대로 있다)
// 서버 컴포넌트라 링크가 HTML 에 그대로 실려 검색엔진이 /best 페이지들을 따라간다.
export default async function HomeDiscover() {
  const [all, brands, regionsRaw] = await Promise.all([getAllThemes(), listedBrands(), listedRegions()]);
  const conditions = listedConditions(all);
  const topBrands = brands.slice(0, 12);
  const regions = [...regionsRaw].sort((a, b) => b.count - a.count).slice(0, 8); // 많은 순 8곳(나머지는 전체 지역에서)

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

      {regions.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-baseline justify-between">
            <h3 className="text-base font-extrabold">📍 지역으로 찾기</h3>
            <Link href="/region" className="text-xs font-bold text-candy">
              전체 지역 {regionsRaw.length}곳 →
            </Link>
          </div>
          <ul className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {regions.map((r) => (
              <li key={r.key}>
                <Link
                  href={`/region/${r.key}`}
                  className="rough flex h-full flex-col items-center justify-center rounded-2xl border-2 border-edge bg-panel px-1 py-2.5 text-center transition hover:border-candy active:scale-[0.97]"
                >
                  <span className="text-[15px] font-extrabold">{r.key}</span>
                  <span className="mt-0.5 text-[11px] font-bold text-cream/50">{r.count}개</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
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

    </section>
  );
}
