import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Poster from "@/components/Poster";
import { BTN_LINE, BTN_PRIMARY, posterSrc } from "@/lib/ui";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { getSpotlight, getSpotlights, spotlightThemes } from "@/lib/spotlight-server";

// 화제의 방 정리 페이지. 검색에서 "○○ 방탈출 예약·가격·인원"으로 찾는 사람에게
// 공식 정보 기준 한 장 정리를 주고, 테마 상세·기록으로 이어 준다.
export const revalidate = 3600;

type Props = { params: { slug: string } };

// 관리자 화면에서 새로 넣은 항목도 배포 없이 열리도록(없는 주소는 요청 때 만들어 본다)
export async function generateStaticParams() {
  return (await getSpotlights()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await getSpotlight(params.slug);
  if (!s) return {};
  const url = `${SITE_URL}/spotlight/${s.slug}`;
  return {
    title: s.seoTitle,
    description: s.seoDescription,
    alternates: { canonical: url },
    openGraph: { title: s.seoTitle, description: s.seoDescription, url, type: "article", siteName: SITE_NAME },
  };
}

export default async function SpotlightPage({ params }: Props) {
  const s = await getSpotlight(params.slug);
  if (!s) notFound();
  const themes = await spotlightThemes(s.cafeIncludes);
  const url = `${SITE_URL}/spotlight/${s.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: s.seoTitle,
      description: s.seoDescription,
      dateModified: s.checkedAt,
      datePublished: s.checkedAt,
      mainEntityOfPage: url,
      author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
        { "@type": "ListItem", position: 2, name: s.name },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: s.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    ...(themes.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${s.name} 테마`,
            itemListElement: themes.map((t, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: t.name,
              url: `${SITE_URL}/theme/${t.id}`,
            })),
          },
        ]
      : []),
  ];

  return (
    <article className="mx-auto max-w-3xl space-y-10">
      {jsonLd.map((j, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j) }} />
      ))}

      <header className="space-y-3 border-b border-line pb-6">
        <p className="text-[13px] font-extrabold text-[#A85A14]">화제의 방 · {s.label}</p>
        <h1 className="text-[26px] leading-tight sm:text-4xl sm:leading-[1.2] [word-break:keep-all]">{s.title}</h1>
        <p className="text-base font-extrabold">{s.name}</p>
        <p className="max-w-2xl text-[15px] leading-[1.65] text-cream/80 [word-break:keep-all]">{s.lead}</p>
        <p className="text-[13px] text-cream/60">
          {s.checkedAt.replaceAll("-", ".")} 확인 · 출처{" "}
          <a href={s.source.url} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2">
            {s.source.name}
          </a>
        </p>
      </header>

      {themes.length > 0 && (
        <section aria-labelledby="sp-themes" className="space-y-4">
          <h2 id="sp-themes" className="text-lg sm:text-xl">
            테마 {themes.length}개 한눈에
          </h2>
          <ol className="divide-y divide-line border-y border-line">
            {themes.map((t) => (
              <li key={t.id}>
                <Link href={`/theme/${t.id}?from=spotlight`} className="group flex gap-4 py-4">
                  <span className="block w-24 shrink-0 sm:w-28">
                    <Poster src={posterSrc(t.poster_url)} name={t.name} genre={t.genre} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-xs font-extrabold text-cream/60">
                      {(t.tags ?? []).find((x) => x !== "메이플스토리") ?? t.genre}
                    </span>
                    <span className="mt-0.5 block text-base font-extrabold group-hover:underline">{t.name}</span>
                    {t.teaser && (
                      <span className="mt-1 line-clamp-3 text-sm leading-relaxed text-cream/75 [word-break:keep-all]">{t.teaser}</span>
                    )}
                    <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-cream/60">
                      <span>난이도 {t.difficulty}/5</span>
                      <span>공포 {t.fear_level}/5</span>
                      {t.time_limit ? <span>{t.time_limit}분</span> : null}
                      {t.players ? <span>{t.players}명</span> : null}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section aria-labelledby="sp-facts" className="space-y-4">
        <h2 id="sp-facts" className="text-lg sm:text-xl">
          가기 전에 알아 둘 것
        </h2>
        <dl className="divide-y divide-line border-y border-line">
          {s.facts.map((f) => (
            <div key={f.label} className="flex gap-4 py-3.5">
              <dt className="w-24 shrink-0 text-sm text-cream/60">{f.label}</dt>
              <dd className="min-w-0">
                <span className="font-extrabold">{f.value}</span>
                {f.note && <span className="mt-0.5 block text-sm text-cream/60">{f.note}</span>}
              </dd>
            </div>
          ))}
        </dl>
        <p className="text-[13px] text-cream/60">
          방문 전에 공식 사이트와 예매 페이지에서 한 번 더 확인해 주세요. 운영 사정에 따라 바뀔 수 있어요.
        </p>
      </section>

      <section aria-labelledby="sp-faq" className="space-y-4">
        <h2 id="sp-faq" className="text-lg sm:text-xl">
          자주 묻는 질문
        </h2>
        <div className="divide-y divide-line border-y border-line">
          {s.faq.map((f) => (
            <details key={f.q} className="group py-3.5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-extrabold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden className="text-cream/60 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-cream/75 [word-break:keep-all]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="border-t border-line pt-7">
        <h2 className="text-lg sm:text-xl">다녀왔다면, 잊기 전에 남겨 두세요</h2>
        <p className="mt-2 text-sm leading-relaxed text-cream/75 [word-break:keep-all]">
          몇 번째 방이었는지, 탈출했는지, 누구와 갔는지. 기록 3개면 내 방탈출 유형과 다음에 갈 방까지 나와요.
        </p>
        <div className="mt-4 flex gap-2">
          <Link href="/new" className={`flex-1 sm:flex-none ${BTN_PRIMARY}`}>
            기록 남기기
          </Link>
          <Link href="/quiz" className={`flex-1 sm:flex-none ${BTN_LINE}`}>
            내 취향 방 찾기
          </Link>
        </div>
      </section>
    </article>
  );
}
