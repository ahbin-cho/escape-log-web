"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

// 홈 위젯: 위(지역 칩) / 아래(그 지역 테마 미리보기 8장).
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
  const themes = mixByBrand(regionThemes, 8);

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl">지역별 테마</h2>
        <div className="flex items-baseline gap-3 text-xs font-bold text-candy">
          <Link href="/cafe">브랜드별 →</Link>
          <Link href="/region">지역 지도 →</Link>
        </div>
      </div>

      {/* 지역 칩: 모바일 가로 스크롤 / 데스크톱 한두 줄로 감김 */}
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
        {regionsPresent.map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            aria-pressed={region === r}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-bold transition active:scale-[0.97] ${
              region === r
                ? "bg-edge text-panel"
                : "text-cream/70 hover:bg-edge/10 hover:text-cream"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* 테마 미리보기: 소개글 없이 이름·지점·장르만 (줄거리는 테마 상세에서) */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {themes.map((t, i) => {
          const [brand, ...rest] = (t.cafe || "").split(" ");
          const branch = rest.join(" ");
          // 예약 사이트로 바로 보내지 않고 우리 테마 상세를 거친다(줄거리·후기 보고 예약)
          return (
            <Link
              key={`${t.cafe}-${t.name}`}
              href={`/theme/${t.id}?from=home`}
              // 모바일은 4장까지만
              className={`flex min-w-0 flex-col gap-0.5 rounded-xl border border-edge/15 bg-panel px-3.5 py-3 transition hover:border-edge active:scale-[0.98] ${
                i >= 4 ? "max-sm:hidden" : ""
              }`}
            >
              {brand && (
                <span className="truncate text-xs font-extrabold text-candy">{brand}</span>
              )}
              <span className="truncate text-sm font-extrabold">
                {genreEmoji(t.genre)} {t.name}
              </span>
              <span className="truncate text-xs font-medium text-cream/60">
                {branch}
                {branch ? " · " : ""}
                {t.genre}
                {t.timeLimit ? ` · ${t.timeLimit}분` : ""}
              </span>
            </Link>
          );
        })}
      </div>

      {regionThemes.length > themes.length && region && (
        <Link
          href={`/region/${region}`}
          className="block text-right text-xs font-bold text-candy"
        >
          {region} 테마 {regionThemes.length}개 전체 보기 →
        </Link>
      )}
    </section>
  );
}
