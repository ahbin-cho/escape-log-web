import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ThemeList from "@/components/ThemeList";
import {
  conditionBySlug,
  listedConditions,
  MIN_BEST_THEMES,
  themesForCondition,
} from "@/lib/best";
import {
  decodeParam,
  getAllThemes,
  staticParam,
  type ThemeRow,
} from "@/lib/catalog-server";
import { regionFromText, REGIONS } from "@/lib/region";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 순수 SSG: 테마가 충분히 걸리는 조건만 빌드 시 생성. 그 외 주소는 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return listedConditions(await getAllThemes()).map((x) => ({
    slug: staticParam(x.condition.slug),
  }));
}

type Props = { params: { slug: string } };

const OTHER = "기타 지역";
// 지역 바로가기 앵커 id (공백 없이)
const anchorOf = (region: string) => (region === OTHER ? "기타" : region);

async function load(param: string) {
  const slug = decodeParam(param);
  const condition = slug ? conditionBySlug(slug) : null;
  if (!condition) return null;
  const all = await getAllThemes();
  const themes = themesForCondition(condition, all);
  if (themes.length < MIN_BEST_THEMES) return null;

  // 지역별 섹션 (REGIONS 순서, 지역을 못 잡은 매장은 맨 뒤)
  const byRegion = new Map<string, ThemeRow[]>();
  for (const t of themes) {
    const key = regionFromText(t.cafe) ?? OTHER;
    byRegion.set(key, [...(byRegion.get(key) ?? []), t]);
  }
  const order = [...REGIONS, OTHER] as string[];
  const sections = [...byRegion.entries()].sort(
    (a, b) => order.indexOf(a[0]) - order.indexOf(b[0])
  );
  return { condition, themes, sections, all };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await load(params.slug);
  if (!data) return { title: "목록을 찾을 수 없어요", robots: { index: false } };
  const { condition, themes, sections } = data;
  const regions = sections
    .map(([r]) => r)
    .filter((r) => r !== OTHER)
    .slice(0, 4)
    .join("·");
  const title = `${condition.title} 테마 ${themes.length}개`;
  // "(무서운 순)" 같은 정렬 설명은 빼고 기준만 넣는다
  const criteria = condition.criteria.replace(/\s*\(.*\)$/, "");
  const description = `${criteria}만 골라 테마 ${themes.length}개를 정리했어요. ${regions} 지역별로 장르·난이도·인원을 한눈에 비교하고, 테마를 눌러 예약 정보를 확인하세요.`;
  const path = `/best/${condition.slug}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}${path}`,
    },
  };
}

export default async function BestConditionPage({ params }: Props) {
  const data = await load(params.slug);
  if (!data) notFound();
  const { condition, themes, sections, all } = data;
  const others = listedConditions(all).filter(
    (x) => x.condition.slug !== condition.slug
  );

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "조건별 방탈출 추천",
          item: `${SITE_URL}/best`,
        },
        { "@type": "ListItem", position: 3, name: condition.title },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: condition.title,
      numberOfItems: themes.length,
      itemListElement: themes.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.name,
        url: `${SITE_URL}/theme/${t.id}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: condition.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
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
        <Link href="/best" className="hover:text-candy">
          조건별 추천
        </Link>
        <span aria-hidden>›</span>
        <span className="text-cream/70">{condition.label}</span>
      </nav>

      <header className="space-y-2">
        <h1 className="text-xl font-extrabold sm:text-2xl">
          {condition.emoji} {condition.title} · 테마 {themes.length}개
        </h1>
        <p className="text-sm leading-relaxed text-cream/70">{condition.intro}</p>
        <p className="text-xs font-bold text-cream/50">
          고른 기준: {condition.criteria}
        </p>
      </header>

      {sections.length > 1 && (
        <nav aria-label="지역 바로가기">
          <ul className="flex flex-wrap gap-1.5">
            {sections.map(([region, list]) => (
              <li key={region}>
                <a
                  href={`#${anchorOf(region)}`}
                  className="rough-sm inline-block rounded-full border border-edge/20 bg-panel px-3 py-1.5 text-sm font-bold text-cream/70 transition hover:border-candy hover:text-candy"
                >
                  {region} <span className="text-cream/45">{list.length}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {sections.map(([region, list]) => (
        <section key={region} id={anchorOf(region)} className="scroll-mt-20 space-y-3">
          <h2 className="text-lg font-extrabold">
            {region === OTHER ? (
              OTHER
            ) : (
              <>
                {region} {condition.label} 방탈출
              </>
            )}{" "}
            <span className="text-sm font-bold text-cream/50">{list.length}개</span>
          </h2>
          <ThemeList themes={list} />
        </section>
      ))}

      <section className="rough rounded-2xl border-2 border-dashed border-edge/30 bg-panel/60 p-5 text-center">
        <p className="text-sm font-bold">이 중에서 뭘 골라야 할지 모르겠다면?</p>
        <p className="mt-1 text-sm text-cream/60">{condition.quizCta}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Link
            href="/quiz"
            className="rough inline-block rounded-xl border-2 border-edge bg-candy px-5 py-2.5 text-sm font-extrabold text-edge shadow-cute transition active:scale-[0.97]"
          >
            🔮 취향 찾기 (무료)
          </Link>
          <Link
            href="/match"
            className="rough inline-block rounded-xl border-2 border-edge bg-panel px-5 py-2.5 text-sm font-extrabold transition active:scale-[0.97] hover:border-candy"
          >
            💞 친구 궁합
          </Link>
        </div>
        <p className="mt-3 text-xs text-cream/60">
          이미 다녀왔다면?{" "}
          <Link href="/diary" className="font-bold text-candy underline">
            방탈출 기록장에 남기기
          </Link>
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-extrabold">자주 묻는 질문</h2>
        <dl className="space-y-3">
          {condition.faq.map((f) => (
            <div
              key={f.q}
              className="rounded-2xl border-2 border-edge/30 bg-panel p-4"
            >
              <dt className="text-sm font-extrabold">Q. {f.q}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-cream/70">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {others.length > 0 && (
        <nav className="space-y-3 border-t-2 border-edge/15 pt-6">
          <h2 className="text-lg font-extrabold">다른 조건으로 찾기</h2>
          <ul className="flex flex-wrap gap-1.5">
            {others.map(({ condition: c, count }) => (
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
        </nav>
      )}
    </article>
  );
}
