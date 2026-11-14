import Link from "next/link";
import { getAllThemes } from "@/lib/catalog-server";
import { activeSpotlights } from "@/lib/spotlight";
import { getSpotlights } from "@/lib/spotlight-server";
import { freshPicks, kstDate, agoLabel } from "@/lib/home-picks";
import { brandOf, branchOf } from "@/lib/cafe";
import Poster from "@/components/Poster";
import { posterSrc } from "@/lib/ui";

// 홈 맨 위 "새로 들어온 방": 방탈로그에 최근 등록된 테마를 화제의 방(스포트라이트)과 같은 잡지 지면 모양으로.
// 포스터가 있는 테마를 앞에, 한 브랜드가 몰리지 않게 섞는다(freshPicks). 아래에 지금 화제인 정리 페이지 바로가기.
// 서버 컴포넌트라 테마 링크가 HTML 에 실려 검색엔진이 따라간다. (운영자 요청 2026-11-14)
const LIMIT = 12;

export default async function HomeNewStrip() {
  const now = new Date();
  const [themes, spots] = await Promise.all([getAllThemes(), getSpotlights()]);
  const picks = freshPicks(themes, LIMIT * 2);
  const list = [...picks.filter((t) => t.poster_url), ...picks.filter((t) => !t.poster_url)].slice(0, LIMIT);
  if (list.length < 4) return null;
  const hot = activeSpotlights(spots, kstDate(now));

  return (
    <section aria-labelledby="home-newstrip" className="overflow-hidden rounded-2xl bg-edge text-ink">
      <div className="px-5 pb-4 pt-5 sm:px-7 sm:pt-7">
        <p className="flex items-center gap-2 text-[11px] font-extrabold tracking-[0.22em] text-candy">
          <span className="h-px w-6 bg-candy" />
          NEW · 방탈로그에 새로 들어온 테마
        </p>
        <h2 id="home-newstrip" className="mt-3 text-2xl leading-snug sm:text-3xl [word-break:keep-all]">
          이번 주 새로 담은 방, 먼저 구경해요
        </h2>
      </div>

      <ul className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-1 sm:px-7">
        {list.map((t) => (
          <li key={t.id} className="w-[132px] shrink-0 sm:w-[150px]">
            <Link href={`/theme/${t.id}?from=home-new`} className="group block">
              <span className="relative block transition duration-300 group-hover:-translate-y-0.5">
                <Poster src={posterSrc(t.poster_url)} name={t.name} genre={t.genre} rounded="rounded-lg" />
                {t.created_at && (
                  <span className="absolute left-2 top-2 rounded bg-candy px-1.5 py-0.5 text-[10px] font-extrabold text-edge">
                    {agoLabel(t.created_at, now)} 등록
                  </span>
                )}
              </span>
              <span className="mt-2 block truncate text-[13px] font-extrabold">{t.name}</span>
              <span className="block truncate text-[11px] font-bold text-ink/50">
                {brandOf(t.cafe)}
                {branchOf(t.cafe) ? ` ${branchOf(t.cafe)}` : ""}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {hot.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink/15 px-5 py-3.5 sm:px-7">
          <span className="text-[11px] font-extrabold tracking-wider text-ink/45">지금 화제</span>
          {hot.map((s) => (
            <Link
              key={s.slug}
              href={`/spotlight/${s.slug}`}
              className="rounded-full border border-ink/25 px-3 py-1 text-[13px] font-extrabold transition hover:border-candy hover:text-candy"
            >
              {s.name} →
            </Link>
          ))}
          <Link
            href="/immersive"
            className="rounded-full border border-ink/25 px-3 py-1 text-[13px] font-extrabold transition hover:border-candy hover:text-candy"
          >
            🎭 배우가 있는 방 →
          </Link>
        </div>
      )}
    </section>
  );
}
