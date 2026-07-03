"use client";

import { useState } from "react";
import { GENRE_COLOR, GENRE_EMOJI, type Recommendation } from "@/lib/store";
import SpoilerSlider from "./SpoilerSlider";

export default function RecommendCard({ rec }: { rec: Recommendation }) {
  const [level, setLevel] = useState(0);

  const meta = [
    rec.timeLimit ? `⏱️ ${rec.timeLimit}분` : "",
    rec.players ? `👥 ${rec.players}인` : "",
    rec.price ? `💸 ${rec.price.toLocaleString()}원` : "",
  ]
    .filter(Boolean)
    .join("  ");

  return (
    <div className="rough flex flex-col gap-3 rounded-2xl border-2 border-edge bg-panel p-5 shadow-cute">
      {rec.posterUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={rec.posterUrl}
          alt={rec.name}
          className="h-44 w-full rounded-xl border-2 border-edge object-cover"
        />
      )}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold leading-tight">{rec.name}</h3>
            {typeof rec.score === "number" && (
              <span className="rounded-lg border border-mint bg-mint/10 px-2 py-0.5 text-xs font-bold text-mint">
                {rec.score}%
              </span>
            )}
          </div>
          <p className="text-xs text-cream/60">{rec.cafe}</p>
          {meta && (
            <p className="mt-0.5 text-xs font-bold text-cream/70">{meta}</p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-lg border-2 border-edge px-2 py-0.5 text-xs font-bold ${
            GENRE_COLOR[rec.genre]
          }`}
        >
          {GENRE_EMOJI[rec.genre]} {rec.genre}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {rec.tags.map((t) => (
          <span
            key={t}
            className="rounded-lg border border-grape/30 bg-grape/5 px-2 py-0.5 text-xs font-bold text-grape"
          >
            #{t}
          </span>
        ))}
      </div>

      <div className="rounded-xl border border-mint/30 bg-mint/5 px-3 py-2 text-xs font-bold text-mint">
        {rec.reason}
      </div>

      <SpoilerSlider level={level} onChange={setLevel} />

      <div className="min-h-[3.5rem] rounded-xl border border-edge/20 bg-ink p-3 text-sm text-cream/70">
        {level === 0 && <p>{rec.teaser}</p>}
        {level === 1 && (
          <p>
            난이도 {rec.difficulty}/5 · 공포 {rec.fearLevel}/5
          </p>
        )}
        {level === 2 && (
          <p>
            <span className="text-cream/60">힌트:</span> {rec.hint}
          </p>
        )}
        {level === 3 && (
          <p className="text-candy font-bold">
            {rec.spoiler}
          </p>
        )}
      </div>

      {rec.reservationUrl && (
        <a
          href={rec.reservationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rough rounded-xl border-2 border-edge bg-candy px-4 py-2 text-center text-sm font-extrabold text-white shadow-cute transition active:scale-[0.97]"
        >
          예약하러 가기 ↗
        </a>
      )}
    </div>
  );
}
