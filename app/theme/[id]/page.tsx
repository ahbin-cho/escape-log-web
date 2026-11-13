import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cleanTeaser, teaserPreview } from "@/lib/home-picks";
import { publicClient } from "@/lib/supabase/public";
import { GENRE_EMOJI } from "@/lib/store";
import { regionFromText } from "@/lib/region";
import { brandOf } from "@/lib/cafe";
import ReserveLink from "@/components/ReserveLink";
import OwnerCTA from "@/components/OwnerCTA";
import ThemeReviews from "@/components/ThemeReviews";
import {
  getAllThemes,
  listedBrands,
  listedRegions,
  type ThemeRow,
} from "@/lib/catalog-server";
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from "@/lib/site";
import { listedConditions } from "@/lib/best";

// 배포 시 전 테마를 미리 굽고, DB 를 고치면 10분 안에 다시 굽는다(재배포 불필요).
// dynamicParams(기본 true): 배포 후 새로 추가된 테마도 첫 요청 때 생성되어 캐시됨.
export const revalidate = 600;
export const dynamicParams = true;

type ThemeDetail = ThemeRow & {
  poster_url?: string | null;
  booking_open?: string | null;
  price?: number | null;
};

// DB 에 확인된 값만으로 만드는 "자주 묻는 것". 화면과 구조화 데이터(FAQPage)가 같은 내용을 쓴다.
// 값이 없는 항목은 질문 자체를 만들지 않는다(추측 금지).
function themeFaq(t: ThemeDetail): { q: string; a: string }[] {
  const faq: { q: string; a: string }[] = [];
  if (t.booking_open) {
    faq.push({
      q: `${t.name} 예약은 언제 열리나요?`,
      a: t.booking_open.startsWith("매주")
        ? `${t.booking_open}에 열려요. 바뀔 수 있으니 예약 페이지에서 한 번 더 확인하세요.`
        : `방문일 ${t.booking_open}부터 예약할 수 있어요. 바뀔 수 있으니 예약 페이지에서 한 번 더 확인하세요.`,
    });
  }
  if (t.players) {
    faq.push({ q: `${t.name}, 몇 명이서 할 수 있나요?`, a: `${t.players}인이 할 수 있어요.` });
  }
  if (t.time_limit) {
    faq.push({ q: `${t.name} 플레이 시간은 얼마나 되나요?`, a: `제한 시간은 ${t.time_limit}분이에요.` });
  }
  if (t.price) {
    faq.push({
      q: `${t.name} 가격은 얼마인가요?`,
      a: `1인 ${t.price.toLocaleString("ko-KR")}원이에요. 인원·요일에 따라 달라질 수 있어요.`,
    });
  }
  return faq.length >= 2 ? faq : [];
}

const THEME_COLUMNS =
  "id,name,cafe,genre,difficulty,fear_level,tags,teaser,time_limit,players,reservation_url,poster_url,price";

async function getTheme(id: string): Promise<ThemeDetail | null> {
  try {
    const first = await publicClient()
      .from("catalog")
      .select(`${THEME_COLUMNS},booking_open`)
      .eq("id", id)
      .maybeSingle();
    if (!first.error) return (first.data as ThemeDetail | null) ?? null;
    // booking_open 칸이 아직 DB 에 없을 때(SQL 실행 전)도 테마 페이지는 떠야 한다.
    const { data } = await publicClient()
      .from("catalog")
      .select(THEME_COLUMNS)
      .eq("id", id)
      .maybeSingle();
    return (data as ThemeDetail | null) ?? null;
  } catch {
    return null;
  }
}

// 빌드타임에 현재 카탈로그 전 테마를 정적 생성 (새 테마는 요청 시 ISR 로 생성)
export async function generateStaticParams() {
  try {
    const { data } = await publicClient().from("catalog").select("id");
    return (data ?? []).map((r: { id: string }) => ({ id: r.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const t = await getTheme(params.id);
  if (!t) {
    return { title: "테마를 찾을 수 없어요", robots: { index: false } };
  }
  const region = regionFromText(t.cafe);
  const bits = [
    `장르 ${t.genre}`,
    `난이도 ${t.difficulty}/5`,
    t.time_limit ? `${t.time_limit}분` : null,
    t.players ? `${t.players}` : null,
  ].filter(Boolean);
  // 검색 결과 요약: 사람들이 찾는 값(시간·인원·가격·예약 오픈)을 앞에, 줄거리를 뒤에 둔다.
  const facts = [
    `난이도 ${t.difficulty}/5`,
    t.time_limit ? `${t.time_limit}분` : null,
    t.players ? `${t.players}인` : null,
    t.price ? `1인 ${t.price.toLocaleString("ko-KR")}원` : null,
    t.booking_open ? `예약 오픈 ${t.booking_open}` : null,
  ].filter(Boolean);
  // 크롤링 원문의 예약·이용 안내를 걷어낸 줄거리
  const story = teaserPreview(cleanTeaser(t.teaser || ""), 90);
  const description = story
    ? `${t.cafe} · ${facts.join(" · ")}. ${story}`
    : `${t.cafe}의 방탈출 테마 '${t.name}'. ${bits.join(
        " · "
      )}. 방탈로그에서 취향 진단과 맞춤 추천을 받아보세요.`;

  return {
    title: `${t.name} — ${t.cafe} 방탈출${region ? ` (${region})` : ""}`,
    description,
    alternates: { canonical: `/theme/${t.id}` },
    openGraph: {
      title: `${t.name} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/theme/${t.id}`,
      images: [t.poster_url ? { url: t.poster_url } : DEFAULT_OG_IMAGE],
    },
  };
}

function Stars({ n, max = 5 }: { n: number; max?: number }) {
  const v = Math.min(max, Math.max(0, n));
  return (
    <span aria-label={`${v} / ${max}`}>
      {"★".repeat(v)}
      <span className="text-cream/25">{"★".repeat(max - v)}</span>
    </span>
  );
}

export default async function ThemePage({
  params,
}: {
  params: { id: string };
}) {
  const t = await getTheme(params.id);
  if (!t) notFound();

  const region = regionFromText(t.cafe);
  const tags = t.tags ?? [];

  // 목록 페이지(지역·브랜드)가 실제로 있을 때만 그쪽으로 링크
  const [regions, brands, all] = await Promise.all([
    listedRegions(),
    listedBrands(),
    getAllThemes(),
  ]);
  const regionHref =
    region && regions.some((r) => r.key === region)
      ? `/region/${region}`
      : "/region";
  const brand = brandOf(t.cafe);
  const brandHref = brands.some((b) => b.key === brand)
    ? `/cafe/${brand}`
    : null;
  const siblings = all
    .filter((x) => x.cafe === t.cafe && x.id !== t.id)
    .slice(0, 6);
  // 이 테마가 들어가는 조건별 목록 (페이지가 실제로 있는 것만)
  const conditions = listedConditions(all)
    .map((x) => x.condition)
    .filter((c) => c.match(t));

  // 빵부스러기(BreadcrumbList) 구조화 데이터 — 검색결과 경로 표시
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: `${region ?? "지역별"} 방탈출`,
        item: `${SITE_URL}${regionHref}`,
      },
      { "@type": "ListItem", position: 3, name: t.name },
    ],
  };

  const faq = themeFaq(t);
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((x) => ({
      "@type": "Question",
      name: x.q,
      acceptedAnswer: { "@type": "Answer", text: x.a },
    })),
  };

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      {/* 빵부스러기 내비 (내부 링크 + 사용자 경로) */}
      <nav className="flex flex-wrap items-center gap-1 text-xs font-bold text-cream/50">
        <Link href="/" className="hover:text-candy">
          방탈로그
        </Link>
        <span aria-hidden>›</span>
        <Link href={regionHref} className="hover:text-candy">
          {region ? `${region} 방탈출` : "지역별 방탈출"}
        </Link>
        <span aria-hidden>›</span>
        <span className="text-cream/70">{t.name}</span>
      </nav>

      <header className="rough rounded-2xl border-2 border-edge bg-panel p-6 shadow-cute">
        <p className="text-sm font-bold text-cream/60">
          {GENRE_EMOJI[t.genre] ?? "🎲"}{" "}
          {brandHref ? (
            <Link href={brandHref} className="hover:text-candy hover:underline">
              {t.cafe}
            </Link>
          ) : (
            t.cafe
          )}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">
          {t.name}
        </h1>

        <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold">
          <div>
            <dt className="inline text-cream/50">장르 </dt>
            <dd className="inline">{t.genre}</dd>
          </div>
          <div>
            <dt className="inline text-cream/50">난이도 </dt>
            <dd className="inline text-candy">
              <Stars n={t.difficulty} />
            </dd>
          </div>
          <div>
            <dt className="inline text-cream/50">공포도 </dt>
            <dd className="inline text-candy">
              <Stars n={t.fear_level} />
            </dd>
          </div>
          {t.time_limit ? (
            <div>
              <dt className="inline text-cream/50">시간 </dt>
              <dd className="inline">{t.time_limit}분</dd>
            </div>
          ) : null}
          {t.players ? (
            <div>
              <dt className="inline text-cream/50">인원 </dt>
              <dd className="inline">{t.players}</dd>
            </div>
          ) : null}
          {t.price ? (
            <div>
              <dt className="inline text-cream/50">가격 </dt>
              <dd className="inline">1인 {t.price.toLocaleString("ko-KR")}원</dd>
            </div>
          ) : null}
          {t.booking_open ? (
            <div>
              <dt className="inline text-cream/50">예약 오픈 </dt>
              <dd className="inline">{t.booking_open}</dd>
            </div>
          ) : null}
        </dl>

        {tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li
                key={tag}
                className="rough-sm rounded-full border border-edge/20 bg-ink px-2.5 py-1 text-xs font-bold text-cream/70"
              >
                #{tag}
              </li>
            ))}
          </ul>
        )}
      </header>

      {t.teaser && (
        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">📖 줄거리</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-cream/80">
            {t.teaser}
          </p>
        </section>
      )}

      {/* 행동 유도 */}
      <div className="flex flex-col gap-2.5 sm:flex-row">
        {t.reservation_url && (
          <ReserveLink
            href={t.reservation_url}
            themeId={t.id}
            themeName={t.name}
            cafe={t.cafe}
            source="theme"
            rel="noopener nofollow"
            className="rough flex-1 rounded-xl border-2 border-edge bg-candy px-5 py-3 text-center text-sm font-extrabold text-white shadow-cute transition active:scale-[0.97]"
          >
            🎟️ 예약 페이지로
          </ReserveLink>
        )}
        <Link
          href={`/new?theme=${t.id}`}
          className="rough flex-1 rounded-xl border-2 border-edge bg-panel px-5 py-3 text-center text-sm font-extrabold shadow-cute transition active:scale-[0.97] hover:border-candy"
        >
          🗝️ 이 방 기록하기
        </Link>
      </div>

      {faq.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">❓ 자주 묻는 것</h2>
          <dl className="space-y-3 text-sm">
            {faq.map((x) => (
              <div key={x.q}>
                <dt className="font-extrabold">{x.q}</dt>
                <dd className="mt-0.5 leading-relaxed text-cream/80">{x.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <ThemeReviews themeId={t.id} themeName={t.name} cafe={t.cafe} />

      {siblings.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">🚪 같은 매장의 다른 테마</h2>
          <ul className="flex flex-wrap gap-1.5">
            {siblings.map((x) => (
              <li key={x.id}>
                <Link
                  href={`/theme/${x.id}`}
                  className="rough-sm inline-block rounded-full border border-edge/20 bg-panel px-3 py-1.5 text-sm font-bold text-cream/70 transition hover:border-candy hover:text-candy"
                >
                  {x.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {conditions.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-extrabold">🎯 이런 조건이라면 비슷한 방도</h2>
          <ul className="flex flex-wrap gap-1.5">
            {conditions.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/best/${c.slug}`}
                  className="rough-sm inline-block rounded-full border border-edge/20 bg-panel px-3 py-1.5 text-sm font-bold text-cream/70 transition hover:border-candy hover:text-candy"
                >
                  {c.emoji} {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rough rounded-2xl border-2 border-dashed border-edge/30 bg-panel/60 p-5 text-center">
        <p className="text-sm font-bold">이 테마, 내 취향에 맞을까?</p>
        <p className="mt-1 text-sm text-cream/60">
          질문 몇 개로 방탈출 유형을 진단하고 딱 맞는 방을 추천받아요.
        </p>
        <Link
          href="/quiz"
          className="rough mt-3 inline-block rounded-xl border-2 border-edge bg-candy px-5 py-2.5 text-sm font-extrabold text-white shadow-cute transition active:scale-[0.97]"
        >
          🔮 취향 찾기
        </Link>
      </section>

      <OwnerCTA cafe={t.cafe} />
    </article>
  );
}
