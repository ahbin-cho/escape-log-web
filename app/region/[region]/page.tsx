import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ThemeList from "@/components/ThemeList";
import QuizRow from "@/components/QuizRow";
import { CHIP, CRUMB } from "@/lib/ui";
import { brandOf } from "@/lib/cafe";
import { listedConditions } from "@/lib/best";
import {
  decodeParam,
  getAllThemes,
  listedBrands,
  listedRegions,
  staticParam,
  themesByRegion,
  type ThemeRow,
} from "@/lib/catalog-server";
import { REGIONS, type Region } from "@/lib/region";
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/site";

// DB(catalog)를 고치면 10분 안에 화면에 반영된다(재배포 불필요). 새 브랜드·지역도 첫 방문 때 페이지가 생긴다.
export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await listedRegions()).map((r) => ({ region: staticParam(r.key) }));
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
  const title = `${region} 방탈출 추천 테마 ${themes.length}개`;
  const description = `${region} 지역 방탈출 테마 ${themes.length}개를 브랜드별로 정리했어요. ${brands} 등 매장별 장르·난이도·플레이 시간을 한눈에 비교해 보세요.`;

  return {
    // region/layout 의 title 이 문자열이라 루트 템플릿("%s · 방탈로그")이 안 붙어 직접 붙인다
    title: { absolute: `${title} · ${SITE_NAME}` },
    description,
    alternates: { canonical: `/region/${region}` },
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
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

  const [regions, brands, all] = await Promise.all([
    listedRegions(),
    listedBrands(),
    getAllThemes(),
  ]);
  // 이 지역 테마가 하나라도 걸리는 조건만 (링크가 해당 지역 섹션으로 바로 감)
  const conditions = listedConditions(all).filter(({ condition: c }) =>
    themes.some(c.match)
  );
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

      <nav aria-label="경로" className={CRUMB}>
        <Link href="/" className="hover:text-cream">
          방탈로그
        </Link>
        <span aria-hidden>·</span>
        <Link href="/region" className="hover:text-cream">
          지역별 방탈출
        </Link>
        <span aria-hidden>·</span>
        <span className="text-cream/80">{region}</span>
      </nav>

      <header className="space-y-1">
        <h1 className="text-[22px] font-extrabold leading-tight">
          {region} 방탈출 테마 {themes.length}개
        </h1>
        <p className="text-sm text-cream/60">
          {region}에서 즐길 수 있는 방탈출 테마를 브랜드별로 모았어요. 테마를
          누르면 줄거리와 예약 정보를 볼 수 있어요.
        </p>
      </header>

      {sections.map(([brand, list]) => (
        <section key={brand} className="space-y-3">
          <h2 className="text-lg font-extrabold">
            {brandPages.has(brand) ? (
              <Link href={`/cafe/${brand}`} className="hover:underline">
                {brand}
              </Link>
            ) : (
              brand
            )}{" "}
            <span className="text-sm font-normal text-cream/60">
              {list.length}개
            </span>
          </h2>
          <ThemeList themes={list} />
        </section>
      ))}

      {conditions.length > 0 && (
        <nav className="space-y-3 border-t border-line pt-6">
          <h2 className="text-lg font-extrabold">조건별로 찾기</h2>
          <ul className="flex flex-wrap gap-1.5">
            {conditions.map(({ condition: c }) => (
              <li key={c.slug}>
                <Link
                  href={`/best/${c.slug}#${region}`}
                  className={CHIP}
                >
                  {region} {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <nav className="space-y-3 border-t border-line pt-6">
        <h2 className="text-lg font-extrabold">다른 지역 방탈출</h2>
        <ul className="flex flex-wrap gap-1.5">
          {regions
            .filter((r) => r.key !== region)
            .map((r) => (
              <li key={r.key}>
                <Link
                  href={`/region/${r.key}`}
                  className={CHIP}
                >
                  {r.key} <span className="text-cream/60">{r.count}</span>
                </Link>
              </li>
            ))}
        </ul>
      </nav>

      <QuizRow title="어떤 테마가 내 취향일까?" sub="질문 몇 개로 방탈출 취향을 진단하고 맞는 방을 추천받아요" />
    </article>
  );
}
