import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publicClient } from "@/lib/supabase/public";
import { GENRE_EMOJI, type Genre } from "@/lib/store";
import { regionFromText } from "@/lib/region";
import { SITE_URL, SITE_NAME } from "@/lib/site";

// 순수 SSG: 배포 시 generateStaticParams 의 전 테마를 미리 구움.
// 크롤링 데이터라 거의 안 바뀌므로 자동 재생성(ISR)은 안 씀 → 갱신은 재배포로.
// dynamicParams(기본 true): 배포 후 새로 추가된 테마도 첫 요청 때 생성되어 캐시됨.
export const dynamicParams = true;

type ThemeRow = {
  id: string;
  name: string;
  cafe: string;
  genre: Genre;
  difficulty: number;
  fear_level: number;
  tags: string[] | null;
  teaser: string | null;
  time_limit: number | null;
  players: string | null;
  reservation_url: string | null;
};

async function getTheme(id: string): Promise<ThemeRow | null> {
  try {
    const { data } = await publicClient()
      .from("catalog")
      .select(
        "id,name,cafe,genre,difficulty,fear_level,tags,teaser,time_limit,players,reservation_url"
      )
      .eq("id", id)
      .maybeSingle();
    return (data as ThemeRow) ?? null;
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
    (t.teaser || "").trim().slice(0, 120) ||
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
        item: `${SITE_URL}/region`,
      },
      { "@type": "ListItem", position: 3, name: t.name },
    ],
  };

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 빵부스러기 내비 (내부 링크 + 사용자 경로) */}
      <nav className="flex flex-wrap items-center gap-1 text-xs font-bold text-cream/50">
        <Link href="/" className="hover:text-candy">
          방탈로그
        </Link>
        <span aria-hidden>›</span>
        <Link href="/region" className="hover:text-candy">
          {region ? `${region} 방탈출` : "지역별 방탈출"}
        </Link>
        <span aria-hidden>›</span>
        <span className="text-cream/70">{t.name}</span>
      </nav>

      <header className="rough rounded-2xl border-2 border-edge bg-panel p-6 shadow-cute">
        <p className="text-sm font-bold text-cream/60">
          {GENRE_EMOJI[t.genre] ?? "🎲"} {t.cafe}
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
          <a
            href={t.reservation_url}
            target="_blank"
            rel="noopener nofollow"
            className="rough flex-1 rounded-xl border-2 border-edge bg-candy px-5 py-3 text-center text-sm font-extrabold text-white shadow-cute transition active:scale-[0.97]"
          >
            🎟️ 예약 페이지로
          </a>
        )}
        <Link
          href="/new"
          className="rough flex-1 rounded-xl border-2 border-edge bg-panel px-5 py-3 text-center text-sm font-extrabold shadow-cute transition active:scale-[0.97] hover:border-candy"
        >
          🗝️ 이 방 기록하기
        </Link>
      </div>

      <section className="rough rounded-2xl border-2 border-dashed border-edge/30 bg-panel/60 p-5 text-center">
        <p className="text-sm font-bold">이 테마, 내 취향에 맞을까?</p>
        <p className="mt-1 text-sm text-cream/60">
          6문항이면 방탈출 취향을 진단하고 딱 맞는 방을 추천받아요.
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
