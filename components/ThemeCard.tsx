"use client";

import { genreColorClass, genreEmoji, type CandidateTheme } from "@/lib/store";

// 카탈로그(크롤/등록) 테마를 둘러보기용으로 보여주는 카드.
export default function ThemeCard({
  theme,
  region,
}: {
  theme: CandidateTheme;
  region?: string;
}) {
  const [brand, ...rest] = (theme.cafe || "").split(" ");
  const branch = rest.join(" ");
  const meta = [
    theme.timeLimit ? `⏱️ ${theme.timeLimit}분` : "",
    theme.players ? `👥 ${theme.players}인` : "",
    theme.price ? `💸 ${theme.price.toLocaleString()}원` : "",
  ]
    .filter(Boolean)
    .join("  ");

  return (
    <div className="flex flex-col gap-2 rounded-2xl border-2 border-edge bg-panel p-4">
      {theme.posterUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={theme.posterUrl}
          alt={theme.name}
          className="h-40 w-full rounded-xl border-2 border-edge object-cover"
        />
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {brand && (
            <span className="mb-1 inline-block rounded-md border-2 border-edge bg-candy px-2 py-0.5 text-[11px] font-extrabold text-white">
              {brand}
            </span>
          )}
          <h3 className="font-extrabold leading-tight">{theme.name}</h3>
          <p className="text-xs font-bold text-cream/60">
            📍 {branch || theme.cafe}
            {region ? ` · ${region}` : ""}
          </p>
          {meta && <p className="mt-0.5 text-xs font-bold text-cream/70">{meta}</p>}
        </div>
        <span
          className={`shrink-0 rounded-lg border-2 border-edge px-2 py-0.5 text-xs font-bold ${genreColorClass(
            theme.genre
          )}`}
        >
          {genreEmoji(theme.genre)} {theme.genre}
        </span>
      </div>

      {theme.teaser && (
        <p className="line-clamp-3 text-sm text-cream/70">{theme.teaser}</p>
      )}

      {theme.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {theme.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="rounded-md border border-grape/30 bg-grape/5 px-1.5 py-0.5 text-[11px] font-bold text-grape"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {theme.reservationUrl && (
        <a
          href={theme.reservationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rough mt-auto rounded-xl border-2 border-edge bg-candy px-4 py-2 text-center text-sm font-extrabold text-white shadow-cute transition active:scale-[0.97]"
        >
          예약하러 가기 ↗
        </a>
      )}
    </div>
  );
}
