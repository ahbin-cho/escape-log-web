import Link from "next/link";
import type { ReactNode } from "react";
import Poster from "@/components/Poster";
import { activeSpotlights } from "@/lib/spotlight";
import { getSpotlights, spotlightThemes } from "@/lib/spotlight-server";
import { kstDate } from "@/lib/home-picks";

// 홈 "지금 화제인 방": 새로 생겼거나 이슈가 된 매장의 테마를 포스터 줄로 보여 준다.
// 서버 컴포넌트라 제목·테마 링크가 HTML 에 실려 검색엔진이 따라간다.
// 진행 중인 스포트라이트가 없거나 DB 에 테마가 아직 없으면 그리지 않는다.
export default async function HomeSpotlight() {
  const list = activeSpotlights(await getSpotlights(), kstDate(new Date()));
  for (const s of list) {
    const themes = await spotlightThemes(s.cafeIncludes);
    if (themes.length === 0) continue;
    return (
      <section aria-labelledby="home-spotlight">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 id="home-spotlight" className="shrink-0 text-[18px]">
            ✨ 지금 화제인 방
          </h2>
          <Link href={`/spotlight/${s.slug}`} className="truncate text-[13px] text-cream/70">
            {s.name} ›
          </Link>
        </div>
        <PosterRow>
          {themes.map((t) => (
            <PosterCard
              key={t.id}
              href={`/theme/${t.id}?from=spotlight`}
              src={t.poster_url}
              name={t.name}
              genre={t.genre}
              sub={[t.genre, t.time_limit ? `${t.time_limit}분` : ""].filter(Boolean).join(" · ")}
            />
          ))}
        </PosterRow>
      </section>
    );
  }
  return null;
}

// 포스터 가로 줄(화면 끝까지 밀리도록 바깥 여백만큼 당긴다)
export function PosterRow({ children }: { children: ReactNode }) {
  return (
    <ul className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 sm:-mx-6 sm:gap-3 sm:px-6">
      {children}
    </ul>
  );
}

export function PosterCard({
  href,
  src,
  name,
  genre,
  sub,
}: {
  href: string;
  src?: string | null;
  name: string;
  genre?: string;
  sub?: string;
}) {
  return (
    <li className="w-[116px] shrink-0 sm:w-[140px]">
      <Link href={href} className="block transition active:scale-[0.98]">
        <Poster src={src} name={name} genre={genre} />
        <b className="mt-2 block truncate text-sm font-extrabold">{name}</b>
        {sub && <span className="mt-0.5 block truncate text-xs text-cream/70">{sub}</span>}
      </Link>
    </li>
  );
}
