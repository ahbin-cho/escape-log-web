"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getCatalog, genreEmoji, type CandidateTheme } from "@/lib/store";
import { regionFromText, REGIONS, type Region } from "@/lib/region";

// 홈 위젯: 좌(지역 칩) / 우(그 지역 테마 미리보기) 반반 분할.
export default function HomeRegionThemes() {
  const [catalog, setCatalog] = useState<CandidateTheme[]>([]);
  const [ready, setReady] = useState(false);
  const [region, setRegion] = useState<Region | null>(null);

  useEffect(() => {
    getCatalog().then((c) => {
      setCatalog(c);
      setReady(true);
    });
  }, []);

  const byRegion = useMemo(
    () => catalog.map((t) => ({ t, r: regionFromText(t.cafe) })),
    [catalog]
  );
  const regionsPresent = useMemo(
    () => REGIONS.filter((r) => byRegion.some((x) => x.r === r)),
    [byRegion]
  );

  useEffect(() => {
    if (!region && regionsPresent.length) setRegion(regionsPresent[0]);
  }, [regionsPresent, region]);

  // 카탈로그에 지역 잡히는 테마가 없으면 숨김
  if (!ready || regionsPresent.length === 0) return null;

  const themes = byRegion
    .filter((x) => x.r === region)
    .map((x) => x.t)
    .slice(0, 4);

  return (
    <section className="rounded-2xl border-2 border-edge bg-panel p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-extrabold">🗺️ 지역별 테마</h2>
        <Link href="/region" className="text-xs font-bold text-candy">
          지역 지도 →
        </Link>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[112px_1fr]">
        {/* 좌: 지역 칩 (모바일 가로 스크롤 / 데스크톱 세로) */}
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1 sm:flex-col sm:overflow-visible sm:pb-0">
          {regionsPresent.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`shrink-0 rounded-lg border-2 px-3 py-1.5 text-sm font-bold transition active:scale-[0.97] ${
                region === r
                  ? "border-edge bg-candy text-white"
                  : "border-edge/20 bg-ink text-cream/70 hover:border-edge/40"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* 우: 테마 미리보기 */}
        <div className="grid gap-2 sm:grid-cols-2">
          {themes.map((t) => {
            const [brand, ...rest] = (t.cafe || "").split(" ");
            const branch = rest.join(" ");
            const inner = (
              <div className="flex h-full flex-col gap-1 rounded-xl border-2 border-edge bg-ink p-2.5">
                {brand && (
                  <span className="inline-block w-fit rounded border border-edge bg-candy px-1.5 text-[10px] font-extrabold text-white">
                    {brand}
                  </span>
                )}
                <p className="truncate text-sm font-extrabold">
                  {genreEmoji(t.genre)} {t.name}
                </p>
                <p className="truncate text-[11px] font-bold text-cream/60">
                  {branch}
                  {branch ? " · " : ""}
                  {t.genre}
                  {t.timeLimit ? ` · ${t.timeLimit}분` : ""}
                </p>
              </div>
            );
            return t.reservationUrl ? (
              <a
                key={`${t.cafe}-${t.name}`}
                href={t.reservationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition active:scale-[0.98]"
              >
                {inner}
              </a>
            ) : (
              <div key={`${t.cafe}-${t.name}`}>{inner}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
