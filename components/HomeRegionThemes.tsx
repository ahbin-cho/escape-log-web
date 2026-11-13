"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Poster from "@/components/Poster";
import { getCatalog, type CandidateTheme } from "@/lib/store";
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

// 홈 "동네별 테마": 위(지역 칩) / 아래(그 지역 테마 포스터 줄 8장).
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
  // 공식 포스터가 있는 테마를 먼저 보여 준다(없으면 장르 색 표지)
  const themes = mixByBrand(
    [...regionThemes].sort((a, b) => Number(!!b.posterUrl) - Number(!!a.posterUrl)),
    8,
  );

  return (
    <section aria-labelledby="home-region">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="home-region" className="text-[18px]">
          동네별 테마
        </h2>
        <Link href="/region" className="text-[13px] text-cream/70">
          지역 전체 ›
        </Link>
      </div>

      {/* 지역 칩: 모바일 가로 스크롤 / 넓은 화면은 한두 줄로 감김 */}
      <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {regionsPresent.map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            aria-pressed={region === r}
            className={`shrink-0 rounded-lg px-3 py-2 text-[13px] font-bold transition active:scale-[0.97] ${
              region === r ? "bg-edge text-white" : "bg-ink text-cream"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* 예약 사이트로 바로 보내지 않고 우리 테마 상세를 거친다(줄거리·후기 보고 예약) */}
      <ul className="no-scrollbar -mx-4 mt-3 flex gap-2.5 overflow-x-auto px-4 sm:-mx-6 sm:gap-3 sm:px-6">
        {themes.map((t) => (
          <li key={`${t.cafe}-${t.name}`} className="w-[116px] shrink-0 sm:w-[140px]">
            <Link href={`/theme/${t.id}?from=home`} className="block transition active:scale-[0.98]">
              <Poster src={t.posterUrl} name={t.name} genre={t.genre} />
              <b className="mt-2 block truncate text-sm font-extrabold">{t.name}</b>
              <span className="mt-0.5 block truncate text-xs text-cream/70">{t.cafe}</span>
            </Link>
          </li>
        ))}
      </ul>

      {regionThemes.length > themes.length && region && (
        <Link
          href={`/region/${region}`}
          className="mt-4 block rounded-xl border border-line py-3 text-center text-sm font-extrabold transition active:scale-[0.99]"
        >
          {region} 테마 {regionThemes.length}개 모두 보기
        </Link>
      )}
    </section>
  );
}
