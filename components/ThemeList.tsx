import Link from "next/link";
import Poster from "@/components/Poster";
import { BookingOpenChip } from "@/components/BookingOpen";
import { posterSrc } from "@/lib/ui";
import type { ThemeRow } from "@/lib/catalog-server";

type Item = Pick<ThemeRow, "id" | "name" | "cafe" | "difficulty" | "time_limit"> & {
  genre: string;
  poster_url?: string | null;
  booking_open?: string | null;
};

// "장르 · 난이도 n · N분"
export function themeMeta(t: { genre: string; difficulty: number; time_limit: number | null }): string {
  return [t.genre, t.difficulty ? `난이도 ${t.difficulty}` : "", t.time_limit ? `${t.time_limit}분` : ""]
    .filter(Boolean)
    .join(" · ");
}

// 목록 페이지용 테마 목록 (서버 컴포넌트 — HTML 에 그대로 실려 색인됨).
// 기본은 포스터 격자(휴대폰 2칸 · 넓은 화면 4~5칸), mode="list" 는 얇은 선으로 나눈 줄.
export default function ThemeList({
  themes,
  mode = "grid",
  from,
  limit,
}: {
  themes: Item[];
  mode?: "grid" | "list";
  from?: string; // 예약 집계용 출처(?from=)
  /** 포스터 카드로 보여 줄 개수. 넘는 테마는 접힌 글 목록으로(링크는 HTML 에 그대로 남는다). 페이지 무게를 줄이려고 넣었다(2026-11-19) */
  limit?: number;
}) {
  const href = (id: string) => `/theme/${id}${from ? `?from=${from}` : ""}`;

  if (mode === "list") {
    return (
      <ul className="divide-y divide-line border-y border-line">
        {themes.map((t) => (
          <li key={t.id}>
            <Link prefetch={false} href={href(t.id)} className="flex items-center gap-3 py-3">
              <span className="block w-12 shrink-0 overflow-hidden rounded-md text-[0px]">
                <Poster src={posterSrc(t.poster_url)} name={t.name} genre={t.genre} rounded="rounded-md" compact />
              </span>
              <span className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-extrabold">{t.name}</h3>
                <span className="mt-0.5 block truncate text-xs text-cream/60">{t.cafe}</span>
                <span className="mt-0.5 block truncate text-xs text-cream/60">{themeMeta(t)}</span>
                <BookingOpenChip rule={t.booking_open} className="mt-1" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  // 한두 개만 넘칠 때는 접지 않는다(접는 줄이 더 번거롭다)
  const cut = limit && themes.length > limit + 2 ? limit : themes.length;
  const cards = themes.slice(0, cut);
  const rest = themes.slice(cut);

  return (
    <>
    <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {cards.map((t) => (
        <li key={t.id} className="min-w-0">
          <Link prefetch={false} href={href(t.id)} className="group block">
            <Poster src={posterSrc(t.poster_url)} name={t.name} genre={t.genre} />
            <h3 className="mt-2 truncate text-sm font-extrabold group-hover:underline">{t.name}</h3>
            <span className="mt-0.5 block truncate text-xs text-cream/60">{t.cafe}</span>
            <span className="mt-0.5 block truncate text-xs text-cream/60">{themeMeta(t)}</span>
                <BookingOpenChip rule={t.booking_open} className="mt-1" />
          </Link>
        </li>
      ))}
    </ul>
    {rest.length > 0 && (
      <details className="group/more mt-3 rounded-xl border-2 border-edge/15 bg-panel">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-extrabold [&::-webkit-details-marker]:hidden">
          <span>
            나머지 {rest.length}개 더 보기
          </span>
          <span aria-hidden className="text-cream/50 transition-transform group-open/more:rotate-180">▾</span>
        </summary>
        {/* 포스터 없이 글로만: 카드보다 훨씬 가볍다. 일반 <a> 라 미리 불러오기도 하지 않는다.
            줄마다 긴 class 를 되풀이하지 않게 모양은 globals.css 의 .tl-more 한 곳에 둔다(수백 줄이라 그만큼 HTML 이 준다) */}
        <ul className="tl-more">
          {rest.map((t) => (
            <li key={t.id}>
              <a href={href(t.id)}>
                <h3>{t.name}</h3>
                <span>
                  {t.cafe} · {themeMeta(t)}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </details>
    )}
    </>
  );
}
