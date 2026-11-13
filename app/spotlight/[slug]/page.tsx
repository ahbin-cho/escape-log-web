import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { SPOTLIGHTS, spotlightBySlug } from "@/lib/spotlight";
import { spotlightThemes } from "@/lib/spotlight-server";

// 화제의 방 정리 페이지. 검색에서 "○○ 방탈출 예약·가격·인원"으로 찾는 사람에게
// 공식 정보 기준 한 장 정리를 주고, 테마 상세·기록으로 이어 준다.
export const revalidate = 3600;

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return SPOTLIGHTS.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const s = spotlightBySlug(params.slug);
  if (!s) return {};
  const url = `${SITE_URL}/spotlight/${s.slug}`;
  return {
    title: s.seoTitle,
    description: s.seoDescription,
    alternates: { canonical: url },
    openGraph: { title: s.seoTitle, description: s.seoDescription, url, type: "article", siteName: SITE_NAME },
  };
}

const dots = (n: number) => "●".repeat(Math.max(0, n)) + "○".repeat(Math.max(0, 5 - n));

export default async function SpotlightPage({ params }: Props) {
  const s = spotlightBySlug(params.slug);
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

      <header className="space-y-4 border-b-2 border-edge pb-7">
        <p className="flex items-center gap-2 text-[11px] font-extrabold tracking-[0.22em] text-candy">
          <span className="h-px w-6 bg-candy" />
          화제의 방 · {s.label}
        </p>
        <h1 className="text-3xl leading-tight sm:text-5xl sm:leading-[1.15] [word-break:keep-all]">{s.title}</h1>
        <p className="text-lg font-extrabold">{s.name}</p>
        <p className="max-w-2xl leading-relaxed text-cream/70 [word-break:keep-all]">{s.lead}</p>
        <p className="text-xs font-bold text-cream/45">
          {s.checkedAt.replaceAll("-", ".")} 확인 · 출처{" "}
          <a href={s.source.url} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2">
            {s.source.name}
          </a>
        </p>
      </header>

      {themes.length > 0 && (
        <section aria-labelledby="sp-themes" className="space-y-4">
          <h2 id="sp-themes" className="text-xl">
            테마 {themes.length}개 한눈에
          </h2>
          <ol className="divide-y divide-edge/15 border-y border-edge/15">
            {themes.map((t, i) => (
              <li key={t.id}>
                <Link href={`/theme/${t.id}?from=spotlight`} className="group flex gap-4 py-4">
                  <span className="relative block aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-md bg-edge/10 sm:w-28">
                    {t.poster_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.poster_url}
                        alt={`${t.name} 포스터`}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-[11px] font-extrabold tabular-nums tracking-widest text-cream/40">
                      {String(i + 1).padStart(2, "0")} · {(t.tags ?? []).find((x) => x !== "메이플스토리") ?? t.genre}
                    </span>
                    <span className="mt-0.5 block text-lg font-extrabold group-hover:text-candy">{t.name}</span>
                    {t.teaser && (
                      <span className="mt-1 block text-sm leading-relaxed text-cream/65 [word-break:keep-all]">“{t.teaser}”</span>
                    )}
                    <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-cream/55">
                      <span>난이도 {dots(t.difficulty)}</span>
                      <span>공포 {dots(t.fear_level)}</span>
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
        <h2 id="sp-facts" className="text-xl">
          가기 전에 알아 둘 것
        </h2>
        <dl className="divide-y divide-edge/15 border-y border-edge/15">
          {s.facts.map((f) => (
            <div key={f.label} className="flex gap-4 py-3.5">
              <dt className="w-24 shrink-0 text-sm font-bold text-cream/50">{f.label}</dt>
              <dd className="min-w-0">
                <span className="font-extrabold">{f.value}</span>
                {f.note && <span className="mt-0.5 block text-sm text-cream/55">{f.note}</span>}
              </dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-cream/50">
          방문 전에 공식 사이트와 예매 페이지에서 한 번 더 확인해 주세요. 운영 사정에 따라 바뀔 수 있어요.
        </p>
      </section>

      <section aria-labelledby="sp-faq" className="space-y-4">
        <h2 id="sp-faq" className="text-xl">
          자주 묻는 질문
        </h2>
        <div className="divide-y divide-edge/15 border-y border-edge/15">
          {s.faq.map((f) => (
            <details key={f.q} className="group py-3.5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-extrabold [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="text-cream/40 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-cream/70 [word-break:keep-all]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-edge px-6 py-7 text-ink">
        <h2 className="text-xl">다녀왔다면, 잊기 전에 남겨 두세요</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/65 [word-break:keep-all]">
          몇 번째 방이었는지, 탈출했는지, 누구와 갔는지. 기록 3개면 내 방탈출 유형과 다음에 갈 방까지 나와요.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/new" className="rounded-xl bg-candy px-5 py-2.5 text-sm font-extrabold text-white">
            기록 남기기
          </Link>
          <Link href="/quiz" className="rounded-xl border border-ink/30 px-5 py-2.5 text-sm font-extrabold">
            내 취향 방 찾기
          </Link>
        </div>
      </section>
    </article>
  );
}
