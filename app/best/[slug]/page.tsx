import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ThemeList from "@/components/ThemeList";
import QuizRow from "@/components/QuizRow";
import { CHIP, CRUMB } from "@/lib/ui";
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

// 조건 목록은 코드에 있고, 걸리는 테마는 DB 에서 10분마다 다시 읽는다(재배포 불필요).
export const revalidate = 600;
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

      <nav aria-label="경로" className={CRUMB}>
        <Link href="/" className="hover:text-cream">
          방탈로그
        </Link>
        <span aria-hidden>·</span>
        <Link href="/best" className="hover:text-cream">
          조건별 추천
        </Link>
        <span aria-hidden>·</span>
        <span className="text-cream/80">{condition.label}</span>
      </nav>

      <header className="space-y-2">
        <h1 className="text-[22px] font-extrabold leading-tight">
          {condition.title} · 테마 {themes.length}개
        </h1>
        <p className="text-[15px] leading-[1.65] text-cream/80">{condition.intro}</p>
        <p className="text-[13px] text-cream/60">
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
                  className={CHIP}
                >
                  {region} <span className="text-cream/60">{list.length}</span>
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
            <span className="text-sm font-normal text-cream/60">{list.length}개</span>
          </h2>
          <ThemeList themes={list} />
        </section>
      ))}

      <section className="space-y-3">
        <QuizRow title="이 중에서 뭘 골라야 할지 모르겠다면?" sub={condition.quizCta} />
        <p className="text-[13px] text-cream/60">
          친구와 같이 간다면{" "}
          <Link href="/match" className="font-bold text-cream underline underline-offset-2">
            친구 궁합
          </Link>
          , 이미 다녀왔다면{" "}
          <Link href="/diary" className="font-bold text-cream underline underline-offset-2">
            방탈출 기록장에 남기기
          </Link>
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-extrabold">자주 묻는 질문</h2>
        <dl className="divide-y divide-line border-y border-line">
          {condition.faq.map((f) => (
            <div key={f.q} className="py-3.5">
              <dt className="text-[15px] font-extrabold">{f.q}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-cream/70">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {others.length > 0 && (
        <nav className="space-y-3 border-t border-line pt-6">
          <h2 className="text-lg font-extrabold">다른 조건으로 찾기</h2>
          <ul className="flex flex-wrap gap-1.5">
            {others.map(({ condition: c, count }) => (
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
        </nav>
      )}
    </article>
  );
}
