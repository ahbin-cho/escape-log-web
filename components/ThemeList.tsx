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
}: {
  themes: Item[];
  mode?: "grid" | "list";
  from?: string; // 예약 집계용 출처(?from=)
}) {
  const href = (id: string) => `/theme/${id}${from ? `?from=${from}` : ""}`;

  if (mode === "list") {
    return (
      <ul className="divide-y divide-line border-y border-line">
        {themes.map((t) => (
          <li key={t.id}>
            <Link href={href(t.id)} className="flex items-center gap-3 py-3">
              <span className="block w-12 shrink-0 overflow-hidden rounded-md text-[0px]">
                <Poster src={posterSrc(t.poster_url)} name={t.name} genre={t.genre} rounded="rounded-md" />
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

  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {themes.map((t) => (
        <li key={t.id} className="min-w-0">
          <Link href={href(t.id)} className="group block">
            <Poster src={posterSrc(t.poster_url)} name={t.name} genre={t.genre} />
            <h3 className="mt-2 truncate text-sm font-extrabold group-hover:underline">{t.name}</h3>
            <span className="mt-0.5 block truncate text-xs text-cream/60">{t.cafe}</span>
            <span className="mt-0.5 block truncate text-xs text-cream/60">{themeMeta(t)}</span>
                <BookingOpenChip rule={t.booking_open} className="mt-1" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
