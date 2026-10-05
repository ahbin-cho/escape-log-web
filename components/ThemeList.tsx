import Link from "next/link";
import { branchOf } from "@/lib/cafe";
import { genreEmoji } from "@/lib/store";
import type { ThemeRow } from "@/lib/catalog-server";

// 목록 페이지용 테마 목록 (서버 컴포넌트 — HTML 에 그대로 실려 색인됨).
export default function ThemeList({ themes }: { themes: ThemeRow[] }) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {themes.map((t) => (
        <li
          key={t.id}
          className="rounded-2xl border-2 border-edge bg-panel p-4"
        >
          <h3 className="font-extrabold leading-tight">
            <Link
              href={`/theme/${t.id}`}
              className="transition hover:text-candy hover:underline"
            >
              {t.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-xs font-bold text-cream/60">
            📍 {branchOf(t.cafe) || t.cafe}
          </p>
          <p className="mt-1 text-xs font-bold text-cream/70">
            {genreEmoji(t.genre)} {t.genre} · 난이도 {t.difficulty}/5
            {t.time_limit ? ` · ${t.time_limit}분` : ""}
            {t.players ? ` · ${t.players}인` : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}
