"use client";

import { useState } from "react";
import Link from "next/link";
import Poster from "@/components/Poster";
import { posterSrc } from "@/lib/ui";
import type { Recommendation } from "@/lib/store";
import { regionFromText } from "@/lib/region";
import SpoilerSlider from "./SpoilerSlider";

export default function RecommendCard({
  rec,
  reasons,
}: {
  rec: Recommendation;
  reasons?: string[]; // 여러 줄 이유(퀴즈 추천). 없으면 rec.reason 한 줄.
}) {
  const [level, setLevel] = useState(0);

  const region = regionFromText(rec.cafe || "");

  const meta = [
    rec.genre,
    rec.timeLimit ? `${rec.timeLimit}분` : "",
    rec.players ? `${rec.players}인` : "",
    rec.price ? `${rec.price.toLocaleString()}원` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-3 rounded-[14px] border border-line bg-white p-4">
      <div className="flex gap-3.5">
        <Link
          href={`/theme/${rec.id}?from=recommend`}
          className="block w-[88px] shrink-0"
          tabIndex={-1}
          aria-hidden
        >
          <Poster src={posterSrc(rec.posterUrl)} name={rec.name} genre={rec.genre} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h3 className="min-w-0 text-base font-extrabold leading-tight [word-break:keep-all]">
              {rec.name}
            </h3>
            {typeof rec.score === "number" && (
              <span className="shrink-0 rounded-md bg-[#FFF3E6] px-1.5 py-0.5 text-xs font-extrabold text-[#A85A14]">
                {rec.score}%
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-cream/60">
            {rec.cafe}
            {region && !(rec.cafe || "").includes(region) ? ` · ${region}` : ""}
          </p>
          {meta && <p className="mt-0.5 text-xs text-cream/60">{meta}</p>}
          {rec.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {rec.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-ink px-1.5 py-0.5 text-[11px] font-bold text-cream/70"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {reasons && reasons.length > 0 ? (
        <ul className="space-y-1 text-[13px] font-bold text-cream/85">
          {reasons.map((r) => (
            <li key={r} className="flex gap-1.5">
              <span aria-hidden className="text-candy">
                ✓
              </span>
              {r}
            </li>
          ))}
        </ul>
      ) : (
        rec.reason && <p className="text-[13px] font-bold text-cream/85">{rec.reason}</p>
      )}

      <SpoilerSlider level={level} onChange={setLevel} />

      <div className="min-h-[3.5rem] rounded-xl bg-ink p-3 text-sm text-cream/75">
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
        {level === 3 && <p className="font-bold text-cream">{rec.spoiler}</p>}
      </div>

      <Link
        href={`/theme/${rec.id}?from=recommend`}
        className="rough mt-auto rounded-xl bg-candy px-4 py-3 text-center text-sm font-extrabold text-[#1D1D1D] transition active:scale-[0.98] border-[2px] border-[#1D1D1D] shadow-[3px_3px_0_0_#1D1D1D]"
      >
        자세히 보고 예약하기
      </Link>
    </div>
  );
}
