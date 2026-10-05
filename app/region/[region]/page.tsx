import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ThemeList from "@/components/ThemeList";
import { brandOf } from "@/lib/cafe";
import {
  decodeParam,
  listedBrands,
  listedRegions,
  themesByRegion,
  type ThemeRow,
} from "@/lib/catalog-server";
import { REGIONS, type Region } from "@/lib/region";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 순수 SSG: 테마가 충분한 시·도만 빌드 시 생성. 그 외 주소는 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await listedRegions()).map((r) => ({ region: r.key }));
}

type Props = { params: { region: string } };

async function load(param: string) {
  const region = decodeParam(param) as Region | null;
  if (!region || !(REGIONS as string[]).includes(region)) return null;
  const themes = (await themesByRegion()).get(region) ?? [];
  if (themes.length === 0) return null;

  // 브랜드별 섹션 (테마 많은 브랜드부터)
  const byBrand = new Map<string, ThemeRow[]>();
  for (const t of themes) {
    const brand = brandOf(t.cafe);
    byBrand.set(brand, [...(byBrand.get(brand) ?? []), t]);
  }
  const sections = [...byBrand.entries()].sort(
    (a, b) => b[1].length - a[1].length
  );
  return { region, themes, sections };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await load(params.region);
  if (!data) return { title: "지역을 찾을 수 없어요", robots: { index: false } };
  const { region, themes, sections } = data;
  const brands = sections.slice(0, 4).map(([b]) => b).join(", ");
  const title = `${region} 방탈출 추천 테마 ${themes.length}곳`;
  const description = `${region} 지역 방탈출 테마 ${themes.length}곳을 브랜드별로 정리했어요. ${brands} 등 매장별 장르·난이도·플레이 시간을 한눈에 비교해 보세요.`;

  return {
    title,
    description,
    alternates: { canonical: `/region/${region}` },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/region/${region}`,
    },
  };
}

export default async function RegionThemesPage({ params }: Props) {
  const data = await load(params.region);
  if (!data) notFound();
  const { region, themes, sections } = data;

  const [regions, brands] = await Promise.all([listedRegions(), listedBrands()]);
  const brandPages = new Set(brands.map((b) => b.key));

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "지역별 방탈출",
          item: `${SITE_URL}/region`,
        },
        { "@type": "ListItem", position: 3, name: `${region} 방탈출` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${region} 방탈출 테마`,
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
        <Link href="/region" className="hover:text-candy">
          지역별 방탈출
        </Link>
        <span aria-hidden>›</span>
        <span className="text-cream/70">{region}</span>
      </nav>

      <header className="space-y-1">
        <h1 className="text-xl font-extrabold sm:text-2xl">
          📍 {region} 방탈출 테마 {themes.length}곳
        </h1>
        <p className="text-sm text-cream/70">
          {region}에서 즐길 수 있는 방탈출 테마를 브랜드별로 모았어요. 테마를
          누르면 줄거리와 예약 정보를 볼 수 있어요.
        </p>
      </header>

      {sections.map(([brand, list]) => (
        <section key={brand} className="space-y-3">
          <h2 className="text-lg font-extrabold">
            {brandPages.has(brand) ? (
              <Link href={`/cafe/${brand}`} className="hover:text-candy">
                {brand}
              </Link>
            ) : (
              brand
            )}{" "}
            <span className="text-sm font-bold text-cream/50">
              {list.length}개
            </span>
          </h2>
          <ThemeList themes={list} />
        </section>
      ))}

      <nav className="space-y-3 border-t-2 border-edge/15 pt-6">
        <h2 className="text-lg font-extrabold">다른 지역 방탈출</h2>
        <ul className="flex flex-wrap gap-1.5">
          {regions
            .filter((r) => r.key !== region)
            .map((r) => (
              <li key={r.key}>
                <Link
                  href={`/region/${r.key}`}
                  className="rough-sm inline-block rounded-full border border-edge/20 bg-panel px-3 py-1.5 text-sm font-bold text-cream/70 transition hover:border-candy hover:text-candy"
                >
                  {r.key} <span className="text-cream/45">{r.count}</span>
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
    </article>
  );
}
