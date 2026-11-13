"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getRecords,
  getCatalog,
  type EscapeRecord,
  type CandidateTheme,
} from "@/lib/store";
import {
  regionDistribution,
  recordsInRegion,
  regionFromText,
  REGIONS,
  type Region,
} from "@/lib/region";
import { brandOf } from "@/lib/cafe";
import RecordCard from "@/components/RecordCard";
import ThemeCard from "@/components/ThemeCard";
import { CHIP, CHIP_ON } from "@/lib/ui";

// 결정론적 셔플 (같은 날이면 같은 순서 — 새로고침해도 안정적)
function seededShuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  let seed = new Date().toISOString().slice(0, 10).replace(/-/g, "") as unknown as number;
  seed = Number(seed);
  for (let i = copy.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = Math.floor((seed / 233280) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type Selected = Region | "미분류" | null;

export default function RegionExplorer() {
  const [records, setRecords] = useState<EscapeRecord[]>([]);
  const [catalog, setCatalog] = useState<CandidateTheme[]>([]);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<Selected>(null);
  const [brandFilter, setBrandFilter] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getRecords(), getCatalog()]).then(([r, c]) => {
      setRecords(r);
      setCatalog(c);
      setReady(true);
    });
  }, []);

  const dist = useMemo(() => regionDistribution(records), [records]);
  const maxCount = dist.length ? dist[0].count : 0;
  const topRegion = dist.find((d) => d.region !== "미분류");

  const listed = useMemo(
    () => (selected ? recordsInRegion(records, selected) : []),
    [records, selected],
  );

  // 카탈로그 테마를 지역별로 + 셔플
  const themeRegions = useMemo(
    () =>
      seededShuffle(
        catalog.map((t) => ({ t, region: regionFromText(t.cafe) ?? "미분류" })),
      ),
    [catalog],
  );
  const regionsPresent = useMemo(
    () => REGIONS.filter((r) => themeRegions.some((x) => x.region === r)),
    [themeRegions],
  );
  // 브랜드 목록 (cafe 첫 단어)
  const brandsPresent = useMemo(() => {
    const set = new Set(themeRegions.map(({ t }) => brandOf(t.cafe)));
    return [...set].sort();
  }, [themeRegions]);

  const filteredThemes = useMemo(
    () =>
      themeRegions.filter(
        ({ t, region }) =>
          (selected ? region === selected : true) &&
          (brandFilter ? brandOf(t.cafe) === brandFilter : true),
      ),
    [themeRegions, selected, brandFilter],
  );

  // "더보기" 방식 (지역별 테마)
  const PAGE_SIZE = 12;
  const [visible, setVisible] = useState(PAGE_SIZE);
  useEffect(() => {
    setVisible(PAGE_SIZE); // 필터가 바뀌면 처음부터
  }, [selected, brandFilter]);
  const pagedThemes = filteredThemes.slice(0, visible);
  const hasMore = visible < filteredThemes.length;

  if (!ready) {
    return <p className="py-20 text-center text-cream/60">불러오는 중…</p>;
  }

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-[22px] font-extrabold leading-tight">지역별 방탈출</h1>
        <p className="text-sm text-cream/60">
          내 기록과 테마를 지역(시·도)별로 모아 봤어요.
        </p>
      </header>

      {/* 내 기록 분포 */}
      {records.length === 0 ? (
        <div className="flex items-center justify-between gap-3 rounded-[14px] bg-ink px-4 py-3.5">
          <p className="text-sm text-cream/70">
            기록이 쌓이면 내 지역 분포가 그려져요.
          </p>
          <Link
            href="/new"
            className="shrink-0 text-sm font-extrabold underline underline-offset-2"
          >
            첫 기록 남기기
          </Link>
        </div>
      ) : (
        <>
          {topRegion && (
            <div className="border-y border-line py-3.5">
              <p className="text-[13px] text-cream/60">내가 가장 많이 간 지역</p>
              <p className="mt-0.5 text-[22px] font-extrabold">
                {topRegion.region}{" "}
                <span className="text-sm font-normal text-cream/60">
                  {topRegion.count}개 방
                </span>
              </p>
            </div>
          )}

          <section className="space-y-3">
            <h2 className="text-lg font-extrabold">내 기록 분포</h2>
            <div className="space-y-1.5">
              {dist.map((d) => {
                const active = selected === d.region;
                return (
                  <button
                    key={d.region}
                    onClick={() =>
                      setSelected((s) => (s === d.region ? null : d.region))
                    }
                    className="flex w-full items-center gap-2 text-left"
                  >
                    <span className="w-14 shrink-0 text-sm font-bold">
                      {d.region}
                    </span>
                    <span className="relative h-5 flex-1 overflow-hidden rounded-md bg-ink">
                      <span
                        className={`block h-full ${
                          d.region === "미분류" ? "bg-cream/20" : active ? "bg-edge" : "bg-cream/45"
                        }`}
                        style={{
                          width: `${Math.max(8, Math.round((d.count / maxCount) * 100))}%`,
                        }}
                      />
                    </span>
                    <span className="w-8 shrink-0 text-right text-sm font-bold">
                      {d.count}
                    </span>
                  </button>
                );
              })}
            </div>
            {selected && (
              <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                {listed.map((r) => (
                  <RecordCard key={r.id} record={r} />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* 지역별 추천 테마 (크롤/등록 카탈로그) */}
      <section className="space-y-3 border-t border-line pt-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-extrabold">지역별 방탈출 테마</h2>
          <span className="text-[13px] text-cream/60">
            {filteredThemes.length}개
          </span>
        </div>

        {/* 지역 필터 칩 (막대와 연동) */}
        <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <Chip
            label="전체"
            active={selected === null}
            onClick={() => setSelected(null)}
          />
          {regionsPresent.map((r) => (
            <Chip
              key={r}
              label={r}
              active={selected === r}
              onClick={() => setSelected(r)}
            />
          ))}
        </div>

        {/* 브랜드 필터 칩 */}
        {brandsPresent.length > 1 && (
          <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            <Chip
              label="브랜드 전체"
              active={brandFilter === null}
              onClick={() => setBrandFilter(null)}
            />
            {brandsPresent.map((b) => (
              <Chip
                key={b}
                label={b}
                active={brandFilter === b}
                onClick={() => setBrandFilter(b)}
              />
            ))}
          </div>
        )}

        {filteredThemes.length === 0 ? (
          <p className="rounded-[14px] bg-ink py-10 text-center text-sm text-cream/60">
            이 지역엔 등록된 테마가 아직 없어요
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-x-3 gap-y-5 pt-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {pagedThemes.map(({ t, region }) => (
                <ThemeCard
                  key={`${t.cafe}-${t.name}`}
                  theme={t}
                  region={region}
                />
              ))}
            </div>
            {hasMore && (
              <div className="pt-2 text-center">
                <button
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="w-full rounded-xl border border-line bg-white px-5 py-3 text-sm font-extrabold transition hover:bg-ink active:scale-[0.98] sm:w-auto"
                >
                  더보기 ({filteredThemes.length - visible} 남음)
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <p className="text-xs text-cream/60">
        지역은 매장명 키워드로 자동 추정해요. 못 찾으면 “미분류”로 모여요.
      </p>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 whitespace-nowrap ${active ? CHIP_ON : CHIP}`}
    >
      {label}
    </button>
  );
}
