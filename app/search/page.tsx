import type { Metadata } from "next";
import Link from "next/link";
import ThemeList from "@/components/ThemeList";
import { getAllThemes, listedBrands } from "@/lib/catalog-server";
import { listedConditions } from "@/lib/best";
import { norm, searchThemes } from "@/lib/search";
import { NOINDEX } from "@/lib/site";
import { CHIP } from "@/lib/ui";

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
      <form
        action="/search"
        role="search"
        className="flex items-center gap-2 rounded-xl bg-ink px-3.5 focus-within:ring-2 focus-within:ring-edge"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="h-[18px] w-[18px] shrink-0 text-cream/50"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          name="q"
          type="search"
          aria-label="테마 검색"
          defaultValue={q}
          placeholder="테마, 매장, 동네로 찾기 (초성도 돼요)"
          className="w-full bg-transparent py-3.5 text-base outline-none placeholder:text-cream/50"
          enterKeyHint="search"
        />
        <button type="submit" className="shrink-0 py-2 pl-2 text-sm font-extrabold">
          검색
        </button>
      </form>

      {q && (
        <h1 className="text-lg font-extrabold">
          “{q}” 검색 결과 <span className="font-normal text-cream/60">{hits.length}개</span>
        </h1>
      )}

      {brandMatch && (
        <Link
          href={`/cafe/${brandMatch.key}`}
          className="flex items-center justify-between gap-3 rounded-[14px] bg-[#FFF3E6] px-4 py-3.5 text-[15px] font-extrabold"
        >
          <span>
            {brandMatch.key} 전 지점 테마 {brandMatch.count}개 · 지점별로 보기
          </span>
          <span aria-hidden className="text-[#A85A14]">
            ›
          </span>
        </Link>
      )}

      {q && hits.length > 0 && <ThemeList themes={hits.map((h) => h.theme)} />}

      {q && hits.length === 0 && (
        <div className="rounded-[14px] bg-ink p-6 text-center">
          <p className="font-bold">맞는 테마가 없어요</p>
          <p className="mt-1 text-sm text-cream/60">
            테마 이름 일부나 매장·동네 이름으로 다시 찾아보세요. 초성(ㅎㅈㄷㅇ)도 돼요.
          </p>
          <Link
            href="/quiz"
            className="mt-3 inline-block text-sm font-extrabold underline underline-offset-2"
          >
            어떤 방을 찾는지 모르겠다면 취향 찾기
          </Link>
        </div>
      )}

      {!q && brands.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-extrabold">브랜드로 찾기</h2>
          <ul className="flex flex-wrap gap-1.5">
            {brands.map((b) => (
              <li key={b.key}>
                <Link
                  href={`/cafe/${b.key}`}
                  className={CHIP}
                >
                  {b.key} <span className="text-cream/60">{b.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {conditions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-extrabold">조건으로 찾기</h2>
          <ul className="flex flex-wrap gap-1.5">
            {conditions.map(({ condition: c, count }) => (
              <li key={c.slug}>
                <Link
                  href={`/best/${c.slug}`}
                  className={CHIP}
                >
                  {c.label} <span className="text-cream/60">{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
