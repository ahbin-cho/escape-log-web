import type { Metadata } from "next";
import Link from "next/link";
import ThemeList from "@/components/ThemeList";
import { getAllThemes, listedBrands } from "@/lib/catalog-server";
import { listedConditions } from "@/lib/best";
import { norm, searchThemes } from "@/lib/search";
import { NOINDEX } from "@/lib/site";

// 검색 결과 페이지. 검색어마다 주소가 달라 색인하지 않는다(얇은·중복 페이지 방지).
export const metadata: Metadata = { title: "테마 검색", ...NOINDEX };

type Props = { searchParams: { q?: string } };

export default async function SearchPage({ searchParams }: Props) {
  const q = (searchParams.q ?? "").trim().slice(0, 50);
  const all = await getAllThemes();
  const hits = q ? searchThemes(all, q, 60) : [];
  const conditions = listedConditions(all);
  const brands = await listedBrands();
  const k = norm(q);
  const brandMatch = k
    ? brands.find((b) => norm(b.key) === k || (k.length >= 2 && norm(b.key).startsWith(k)))
    : undefined;

  return (
    <div className="space-y-6">
      <form action="/search" className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="테마·매장·지역 검색 (초성도 돼요)"
          className="w-full rounded-xl border-2 border-edge bg-panel px-4 py-2.5 text-base font-bold outline-none placeholder:text-cream/45 focus:border-candy"
          enterKeyHint="search"
        />
        <button
          type="submit"
          className="rough shrink-0 rounded-xl border-2 border-edge bg-candy px-4 py-2.5 text-sm font-extrabold text-white shadow-cute"
        >
          검색
        </button>
      </form>

      {q && (
        <h1 className="text-lg font-extrabold">
          “{q}” 검색 결과 <span className="text-cream/50">{hits.length}개</span>
        </h1>
      )}

      {brandMatch && (
        <Link
          href={`/cafe/${brandMatch.key}`}
          className="rough block rounded-2xl border-2 border-candy bg-candy/10 px-4 py-3 font-extrabold text-candy"
        >
          🏠 {brandMatch.key} 전 지점 테마 {brandMatch.count}개 · 지점별로 보기 →
        </Link>
      )}

      {q && hits.length > 0 && <ThemeList themes={hits.map((h) => h.theme)} />}

      {q && hits.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-edge/40 bg-panel p-6 text-center">
          <p className="font-bold">맞는 테마가 없어요</p>
          <p className="mt-1 text-sm text-cream/60">
            테마 이름 일부나 매장·동네 이름으로 다시 찾아보세요. 초성(ㅎㅈㄷㅇ)도 돼요.
          </p>
          <Link
            href="/quiz"
            className="mt-3 inline-block text-sm font-extrabold text-candy underline"
          >
            어떤 방을 찾는지 모르겠다면 취향 찾기 →
          </Link>
        </div>
      )}

      {!q && brands.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-cream/70">브랜드로 찾기</h2>
          <ul className="flex flex-wrap gap-1.5">
            {brands.map((b) => (
              <li key={b.key}>
                <Link
                  href={`/cafe/${b.key}`}
                  className="rough-sm inline-block rounded-full border border-edge/20 bg-panel px-3 py-1.5 text-sm font-bold text-cream/70 transition hover:border-candy hover:text-candy"
                >
                  {b.key} <span className="text-cream/45">{b.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {conditions.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-cream/70">조건으로 찾기</h2>
          <ul className="flex flex-wrap gap-1.5">
            {conditions.map(({ condition: c, count }) => (
              <li key={c.slug}>
                <Link
                  href={`/best/${c.slug}`}
                  className="rough-sm inline-block rounded-full border border-edge/20 bg-panel px-3 py-1.5 text-sm font-bold text-cream/70 transition hover:border-candy hover:text-candy"
                >
                  {c.emoji} {c.label} <span className="text-cream/45">{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
