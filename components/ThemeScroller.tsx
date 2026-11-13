import Link from "next/link";
import Poster from "@/components/Poster";
import { posterSrc } from "@/lib/ui";
import type { ThemeRow } from "@/lib/catalog-server";

// 가로로 넘기는 포스터 줄(포스터 + 이름 + 한 줄 정보). 서버 컴포넌트.
export default function ThemeScroller({
  themes,
  sub,
}: {
  themes: ThemeRow[];
  sub: "cafe" | "meta";
}) {
  return (
    <ul className="no-scrollbar -mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {themes.map((t) => (
        <li key={t.id} className="w-[116px] shrink-0 snap-start">
          <Link href={`/theme/${t.id}`} className="group block">
            <Poster src={posterSrc(t.poster_url)} name={t.name} genre={t.genre} />
            <span className="mt-2 block truncate text-sm font-extrabold group-hover:underline">{t.name}</span>
            <span className="mt-0.5 block truncate text-xs text-cream/60">
              {sub === "cafe"
                ? t.cafe
                : [t.genre, t.time_limit ? `${t.time_limit}분` : ""].filter(Boolean).join(" · ")}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
