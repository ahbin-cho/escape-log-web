"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ReserveLink from "@/components/ReserveLink";
import { getCatalog, genreEmoji, type CandidateTheme } from "@/lib/store";
import { regionFromText, REGIONS, type Region } from "@/lib/region";

// 브랜드별로 번갈아 뽑아 다양하게 섞기 (한 브랜드 쏠림 방지)
function mixByBrand(themes: CandidateTheme[], limit: number): CandidateTheme[] {
  const groups = new Map<string, CandidateTheme[]>();
  for (const t of themes) {
    const brand = (t.cafe || "").split(" ")[0] || "기타";
    if (!groups.has(brand)) groups.set(brand, []);
    groups.get(brand)!.push(t);
  }
  const lists = [...groups.values()];
  const out: CandidateTheme[] = [];
  let i = 0;
  while (out.length < limit && lists.some((l) => l.length)) {
    const l = lists[i % lists.length];
    if (l.length) out.push(l.shift()!);
    i++;
  }
  return out;
}

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
    [catalog],
  );
  const regionsPresent = useMemo(
    () => REGIONS.filter((r) => byRegion.some((x) => x.r === r)),
    [byRegion],
  );

  useEffect(() => {
    if (!region && regionsPresent.length) setRegion(regionsPresent[0]);
  }, [regionsPresent, region]);

  // 카탈로그에 지역 잡히는 테마가 없으면 숨김
  if (!ready || regionsPresent.length === 0) return null;

  const regionThemes = byRegion.filter((x) => x.r === region).map((x) => x.t);
  const themes = mixByBrand(regionThemes, 4);

  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl">지역별 테마</h2>
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
              aria-pressed={region === r}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-bold transition active:scale-[0.97] sm:text-left ${
                region === r
                  ? "bg-edge text-panel"
                  : "text-cream/70 hover:bg-edge/10 hover:text-cream"
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
              <div className="flex h-full flex-col gap-1 rounded-xl border border-edge/15 bg-panel p-3.5 transition hover:border-edge">
                {brand && (
                  <span className="text-xs font-extrabold text-candy">
                    {brand}
                  </span>
                )}
                <p className="truncate text-sm font-extrabold">
                  {genreEmoji(t.genre)} {t.name}
                </p>
                <p className="truncate text-xs font-medium text-cream/60">
                  {branch}
                  {branch ? " · " : ""}
                  {t.genre}
                  {t.timeLimit ? ` · ${t.timeLimit}분` : ""}
                </p>
                {t.teaser && (
                  <p className="mt-1 line-clamp-2 text-sm leading-snug text-cream/70 max-sm:hidden">
                    {t.teaser}
                  </p>
                )}
              </div>
            );
            return t.reservationUrl ? (
              <ReserveLink
                key={`${t.cafe}-${t.name}`}
                href={t.reservationUrl}
                themeId={t.id}
                themeName={t.name}
                cafe={t.cafe}
                source="home"
                className="transition active:scale-[0.98]"
              >
                {inner}
              </ReserveLink>
            ) : (
              <div key={`${t.cafe}-${t.name}`}>{inner}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
