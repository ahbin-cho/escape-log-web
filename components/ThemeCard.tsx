"use client";

import Link from "next/link";
import Poster from "@/components/Poster";
import { posterSrc } from "@/lib/ui";
import type { CandidateTheme } from "@/lib/store";

// 카탈로그(크롤/등록) 테마를 둘러보기용으로 보여주는 포스터 카드.
// 격자(휴대폰 2칸) 안에 넣어 쓴다. ThemeList 격자와 같은 모양.
export default function ThemeCard({
  theme,
  region,
}: {
  theme: CandidateTheme;
  region?: string;
}) {
  const meta = [
    theme.genre,
    theme.difficulty ? `난이도 ${theme.difficulty}` : "",
    theme.timeLimit ? `${theme.timeLimit}분` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link href={`/theme/${theme.id}?from=card`} className="group block min-w-0">
      <Poster src={posterSrc(theme.posterUrl)} name={theme.name} genre={theme.genre} />
      <h3 className="mt-2 truncate text-sm font-extrabold group-hover:underline">{theme.name}</h3>
      <span className="mt-0.5 block truncate text-xs text-cream/60">
        {theme.cafe}
        {region && region !== "미분류" && !theme.cafe.includes(region) ? ` · ${region}` : ""}
      </span>
      <span className="mt-0.5 block truncate text-xs text-cream/60">{meta}</span>
    </Link>
  );
}
