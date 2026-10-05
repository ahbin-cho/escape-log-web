import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ThemeList from "@/components/ThemeList";
import OwnerCTA from "@/components/OwnerCTA";
import { branchOf } from "@/lib/cafe";
import {
  decodeParam,
  listedBrands,
  listedRegions,
  themesByBrand,
  type ThemeRow,
} from "@/lib/catalog-server";
import { regionFromText } from "@/lib/region";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 순수 SSG: 테마가 충분한 브랜드만 빌드 시 생성. 그 외 주소는 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await listedBrands()).map((b) => ({ brand: b.key }));
}

type Props = { params: { brand: string } };

async function load(param: string) {
  const brand = decodeParam(param);
  if (!brand) return null;
  const themes = (await themesByBrand()).get(brand) ?? [];
  if (themes.length === 0) return null;

  // 지점별 섹션 (등록 순서 유지). 지점명이 없는 데이터는 "" 한 묶음.
  const byBranch = new Map<string, ThemeRow[]>();
  for (const t of themes) {
    const branch = branchOf(t.cafe);
    byBranch.set(branch, [...(byBranch.get(branch) ?? []), t]);
  }
  return { brand, themes, sections: [...byBranch.entries()] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await load(params.brand);
  if (!data) return { title: "브랜드를 찾을 수 없어요", robots: { index: false } };
  const { brand, themes, sections } = data;
  const branches = sections.map(([b]) => b).filter(Boolean);
  const title =
    branches.length > 1
      ? `${brand} 방탈출 테마 ${themes.length}곳 · 지점별 정리`
      : `${brand} 방탈출 테마 ${themes.length}곳`;
  const description = `${brand} 방탈출 테마 ${themes.length}곳의 장르·난이도·플레이 시간을 정리했어요.${
    branches.length ? ` ${branches.slice(0, 5).join(", ")} 등 지점별로 비교해 보세요.` : ""
  }`;

  return {
    title,
    description,
    alternates: { canonical: `/cafe/${brand}` },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/cafe/${brand}`,
    },
  };
}

export default async function BrandPage({ params }: Props) {
  const data = await load(params.brand);
  if (!data) notFound();
  const { brand, themes, sections } = data;

  const [regions, brands] = await Promise.all([listedRegions(), listedBrands()]);
  const regionPages = new Set<string>(regions.map((r) => r.key));

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "브랜드별 방탈출",
          item: `${SITE_URL}/cafe`,
        },
        { "@type": "ListItem", position: 3, name: brand },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${brand} 방탈출 테마`,
      numberOfItems: themes.length,
      itemListElement: themes.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.name,
        url: `${SITE_URL}/theme/${t.id}`,
      })),
    },
  ];

  return (
    <article className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="flex flex-wrap items-center gap-1 text-xs font-bold text-cream/50">
        <Link href="/" className="hover:text-candy">
          방탈로그
        </Link>
        <span aria-hidden>›</span>
        <Link href="/cafe" className="hover:text-candy">
          브랜드별 방탈출
        </Link>
        <span aria-hidden>›</span>
        <span className="text-cream/70">{brand}</span>
      </nav>

      <header className="space-y-1">
        <h1 className="text-xl font-extrabold sm:text-2xl">
          🏠 {brand} 방탈출 테마 {themes.length}곳
        </h1>
        <p className="text-sm text-cream/70">
          {brand}의 테마를 지점별로 모았어요. 테마를 누르면 줄거리와 예약
          정보를 볼 수 있어요.
        </p>
      </header>

      {sections.map(([branch, list]) => {
        const region = regionFromText(list[0].cafe);
        return (
          <section key={branch || brand} className="space-y-3">
            {branch && (
              <h2 className="text-lg font-extrabold">
                {brand} {branch}{" "}
                <span className="text-sm font-bold text-cream/50">
                  {list.length}개
                </span>
                {region && regionPages.has(region) && (
                  <Link
                    href={`/region/${region}`}
                    className="ml-2 text-xs font-bold text-cream/50 hover:text-candy"
                  >
                    {region} 방탈출 더보기 ›
                  </Link>
                )}
              </h2>
            )}
            <ThemeList themes={list} />
          </section>
        );
      })}

      <nav className="space-y-3 border-t-2 border-edge/15 pt-6">
        <h2 className="text-lg font-extrabold">다른 브랜드</h2>
        <ul className="flex flex-wrap gap-1.5">
          {brands
            .filter((b) => b.key !== brand)
            .map((b) => (
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
      </nav>

      <section className="rough rounded-2xl border-2 border-dashed border-edge/30 bg-panel/60 p-5 text-center">
        <p className="text-sm font-bold">어떤 테마가 내 취향일까?</p>
        <p className="mt-1 text-sm text-cream/60">
          질문 몇 개로 방탈출 취향을 진단하고 딱 맞는 방을 추천받아요.
        </p>
        <Link
          href="/quiz"
          className="rough mt-3 inline-block rounded-xl border-2 border-edge bg-candy px-5 py-2.5 text-sm font-extrabold text-white shadow-cute transition active:scale-[0.97]"
        >
          🔮 취향 찾기
        </Link>
      </section>

      <OwnerCTA cafe={brand} />
    </article>
  );
}
