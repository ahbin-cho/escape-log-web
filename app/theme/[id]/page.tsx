import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cleanTeaser, teaserPreview } from "@/lib/home-picks";
import { publicClient } from "@/lib/supabase/public";
import { regionFromText } from "@/lib/region";
import { brandOf } from "@/lib/cafe";
import ReserveLink from "@/components/ReserveLink";
import OwnerCTA from "@/components/OwnerCTA";
import ThemeReviews from "@/components/ThemeReviews";
import Poster from "@/components/Poster";
import QuizRow from "@/components/QuizRow";
import ThemeScroller from "@/components/ThemeScroller";
import { BTN_LINE, BTN_PRIMARY, CHIP, CRUMB, H2, posterSrc } from "@/lib/ui";
import {
  getAllThemes,
  listedBrands,
  listedRegions,
  type ThemeRow,
} from "@/lib/catalog-server";
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from "@/lib/site";
import { listedConditions } from "@/lib/best";

// 순수 SSG: 배포 시 generateStaticParams 의 전 테마를 미리 구움.
// 크롤링 데이터라 거의 안 바뀌므로 자동 재생성(ISR)은 안 씀 → 갱신은 재배포로.
// dynamicParams(기본 true): 배포 후 새로 추가된 테마도 첫 요청 때 생성되어 캐시됨.
export const dynamicParams = true;

type ThemeDetail = ThemeRow & {
  poster_url?: string | null;
  booking_open?: string | null;
  price?: number | null;
};

const THEME_COLUMNS =
  "id,name,cafe,genre,difficulty,fear_level,tags,teaser,time_limit,players,reservation_url,poster_url";

async function getTheme(id: string): Promise<ThemeDetail | null> {
  try {
    const first = await publicClient()
      .from("catalog")
      .select(`${THEME_COLUMNS},booking_open,price,created_at`)
      .eq("id", id)
      .maybeSingle();
    if (!first.error) return (first.data as ThemeDetail | null) ?? null;
    // booking_open 같은 칸이 아직 DB 에 없을 때(SQL 실행 전)도 테마 페이지는 떠야 한다.
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
  const description =
    // 크롤링 원문의 예약·이용 안내를 걷어낸 줄거리로 검색 결과 요약을 만든다
    teaserPreview(cleanTeaser(t.teaser || ""), 120) ||
    `${t.cafe}의 방탈출 테마 '${t.name}'. ${bits.join(
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
      images: [posterSrc(t.poster_url) ? { url: posterSrc(t.poster_url)! } : DEFAULT_OG_IMAGE],
    },
  };
}

const NEW_DAYS = 14;

export default async function ThemePage({
  params,
}: {
  params: { id: string };
}) {
  const t = await getTheme(params.id);
  if (!t) notFound();

  const region = regionFromText(t.cafe);
  const tags = (t.tags ?? []).filter((x) => x !== t.genre);

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
  // 목록과 같은 기준으로 묶은 장르(크롤링 원문 장르는 제각각이라)
  const genre = all.find((x) => x.id === t.id)?.genre ?? t.genre;
  const siblings = all
    .filter((x) => x.cafe === t.cafe && x.id !== t.id)
    .slice(0, 12);
  // 비슷한 방: 같은 장르의 다른 매장 테마. 같은 지역 → 난이도가 가까운 순.
  const similar = all
    .filter((x) => x.id !== t.id && x.cafe !== t.cafe && x.genre === genre)
    .map((x) => ({
      x,
      score:
        (region && regionFromText(x.cafe) === region ? 0 : 10) +
        Math.abs(x.difficulty - t.difficulty) * 2 +
        Math.abs(x.fear_level - t.fear_level) +
        (posterSrc(x.poster_url) ? 0 : 1),
    }))
    .sort((a, b) => a.score - b.score)
    .map(({ x }) => x)
    // 한 브랜드가 줄을 다 차지하지 않게 브랜드마다 2개까지
    .filter((x, i, arr) => arr.slice(0, i).filter((y) => brandOf(y.cafe) === brandOf(x.cafe)).length < 2)
    .slice(0, 10);
  // 이 테마가 들어가는 조건별 목록 (페이지가 실제로 있는 것만)
  const conditions = listedConditions(all)
    .map((x) => x.condition)
    .filter((c) => c.match(t));

  // 들어온 지 2주 안이면 '새로 들어옴' (페이지를 만든 시점 기준)
  const isNew =
    !!t.created_at &&
    Date.now() - Date.parse(t.created_at) < NEW_DAYS * 86400000;

  const facts = [
    t.difficulty ? { label: "난이도", value: `${t.difficulty}/5` } : null,
    // 공포도 0 은 '정보 없음'과 구분이 안 돼 칸을 만들지 않는다
    t.fear_level ? { label: "공포", value: `${t.fear_level}/5` } : null,
    t.time_limit ? { label: "시간", value: `${t.time_limit}분` } : null,
    t.players ? { label: "인원", value: t.players } : null,
  ].filter((f): f is { label: string; value: string } => f !== null);

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

  return (
    <article className="mx-auto max-w-2xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 빵부스러기 내비 (내부 링크 + 사용자 경로) */}
      <nav aria-label="경로" className={CRUMB}>
        <Link href="/" className="hover:text-cream">
          방탈로그
        </Link>
        <span aria-hidden>·</span>
        <Link href={regionHref} className="hover:text-cream">
          {region ? `${region} 방탈출` : "지역별 방탈출"}
        </Link>
        {brandHref && (
          <>
            <span aria-hidden>·</span>
            <Link href={brandHref} className="hover:text-cream">
              {brand}
            </Link>
          </>
        )}
      </nav>

      <header className="mt-4 flex gap-4">
        <div className="w-[132px] shrink-0">
          <Poster src={posterSrc(t.poster_url)} name={t.name} genre={genre} rounded="rounded-xl" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-[22px] font-extrabold leading-tight [word-break:keep-all]">
            {t.name}
          </h1>
          <p className="mt-1.5 text-[13px] text-cream/60">
            {brandHref ? (
              <Link href={brandHref} className="hover:text-cream hover:underline">
                {t.cafe}
              </Link>
            ) : (
              t.cafe
            )}
          </p>
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            <li className="rounded-md bg-ink px-2 py-1 text-xs font-extrabold text-cream/75">
              {genre}
            </li>
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-md bg-ink px-2 py-1 text-xs font-extrabold text-cream/75"
              >
                {tag}
              </li>
            ))}
            {isNew && (
              <li className="rounded-md bg-[#FFF3E6] px-2 py-1 text-xs font-extrabold text-[#A85A14]">
                새로 들어옴
              </li>
            )}
          </ul>
        </div>
      </header>

      {facts.length > 0 && (
        <dl className="mt-5 flex divide-x divide-line border-y border-line">
          {facts.map((f) => (
            <div key={f.label} className="flex-1 py-3 text-center">
              <dt className="text-[13px] text-cream/60">{f.label}</dt>
              <dd className="mt-0.5 font-extrabold">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* 행동 유도 */}
      <div className="mt-4 flex gap-2">
        <Link href={`/new?theme=${t.id}`} className={`flex-1 ${BTN_PRIMARY}`}>
          다녀왔어요
        </Link>
        {t.reservation_url && (
          <ReserveLink
            href={t.reservation_url}
            themeId={t.id}
            themeName={t.name}
            cafe={t.cafe}
            source="theme"
            rel="noopener nofollow"
            className={`flex-1 ${BTN_LINE}`}
          >
            예약 페이지
          </ReserveLink>
        )}
      </div>

      <QuizRow
        className="mt-4"
        title="내 취향과 얼마나 맞을까?"
        sub="질문 몇 개로 내 방탈출 유형과 맞는 방을 찾아 줘요"
      />

      {t.teaser && (
        <section className="mt-8">
          <h2 className={H2}>줄거리</h2>
          <p className="mt-2.5 whitespace-pre-line text-[15px] leading-[1.65] text-cream/85">
            {t.teaser}
          </p>
        </section>
      )}

      <section className="mt-8">
        <h2 className={H2}>이용 정보</h2>
        <dl className="mt-2.5 space-y-1 text-[15px] leading-[1.65] text-cream/85">
          <div>
            <dt className="inline text-cream/60">매장 </dt>
            <dd className="inline">{t.cafe}</dd>
          </div>
          {t.price ? (
            <div>
              <dt className="inline text-cream/60">가격 </dt>
              <dd className="inline">{t.price.toLocaleString("ko-KR")}원</dd>
            </div>
          ) : null}
          {t.booking_open ? (
            <div>
              <dt className="inline text-cream/60">예약 오픈 </dt>
              <dd className="inline">{t.booking_open}</dd>
            </div>
          ) : null}
        </dl>
        <p className="mt-2 text-[13px] text-cream/60">
          가기 전에 예약 페이지에서 한 번 더 확인해 주세요. 매장 사정에 따라 바뀔 수 있어요.
        </p>
      </section>

      <div className="mt-8">
        <ThemeReviews themeId={t.id} themeName={t.name} cafe={t.cafe} />
      </div>

      {siblings.length > 0 && (
        <section className="mt-8">
          <div className="flex items-baseline justify-between">
            <h2 className={H2}>같은 매장의 다른 테마</h2>
            {brandHref && (
              <Link href={brandHref} className="text-[13px] text-cream/60 hover:text-cream">
                {brand} 전체
              </Link>
            )}
          </div>
          <div className="mt-3">
            <ThemeScroller themes={siblings} sub="meta" />
          </div>
        </section>
      )}

      {(similar.length > 0 || conditions.length > 0) && (
        <section className="mt-8">
          <h2 className={H2}>비슷한 방</h2>
          {similar.length > 0 && (
            <div className="mt-3">
              <ThemeScroller themes={similar} sub="cafe" />
            </div>
          )}
          {conditions.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {conditions.map((c) => (
                <li key={c.slug}>
                  <Link href={`/best/${c.slug}`} className={CHIP}>
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <div className="mt-10">
        <OwnerCTA cafe={t.cafe} />
      </div>
    </article>
  );
}
