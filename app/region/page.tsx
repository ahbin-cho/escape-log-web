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
import RecordCard from "@/components/RecordCard";
import ThemeCard from "@/components/ThemeCard";

type Selected = Region | "미분류" | null;

export default function RegionPage() {
  const [records, setRecords] = useState<EscapeRecord[]>([]);
  const [catalog, setCatalog] = useState<CandidateTheme[]>([]);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<Selected>(null);

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

  // 카탈로그 테마를 지역별로
  const themeRegions = useMemo(
    () =>
      catalog.map((t) => ({ t, region: regionFromText(t.cafe) ?? "미분류" })),
    [catalog],
  );
  const regionsPresent = useMemo(
    () => REGIONS.filter((r) => themeRegions.some((x) => x.region === r)),
    [themeRegions],
  );
  const filteredThemes = useMemo(
    () =>
      themeRegions.filter(({ region }) =>
        selected ? region === selected : true,
      ),
    [themeRegions, selected],
  );

  // "더보기" 방식 (지역별 테마)
  const PAGE_SIZE = 12;
  const [visible, setVisible] = useState(PAGE_SIZE);
  useEffect(() => {
    setVisible(PAGE_SIZE); // 지역 필터가 바뀌면 처음부터
  }, [selected]);
  const pagedThemes = filteredThemes.slice(0, visible);
  const hasMore = visible < filteredThemes.length;

  if (!ready) {
    return <p className="py-20 text-center text-cream/55">불러오는 중…</p>;
  }

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-xl font-extrabold sm:text-2xl">🗺️ 지역별 방탈출</h1>
        <p className="text-sm text-cream/70">
          내 기록과 추천 테마를 지역(시·도)별로 모아봤어.
        </p>
      </header>

      {/* 내 기록 분포 */}
      {records.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-edge/40 bg-panel py-10 text-center">
          <p className="text-sm text-cream/60">
            기록이 쌓이면 내 지역 분포가 그려져!
          </p>
          <Link
            href="/new"
            className="rough mt-3 inline-block rounded-xl border-2 border-edge bg-candy px-4 py-2 text-sm font-bold text-white shadow-cute"
          >
            첫 기록 추가하기
          </Link>
        </div>
      ) : (
        <>
          {topRegion && (
            <div className="rounded-2xl border-2 border-edge bg-panel p-5">
              <p className="text-xs text-cream/60">내가 가장 많이 간 지역</p>
              <p className="mt-1 text-xl font-extrabold">
                📍 {topRegion.region}{" "}
                <span className="text-sm font-normal text-cream/70">
                  {topRegion.count}개 방
                </span>
              </p>
            </div>
          )}

          <section className="space-y-2">
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
                    <span className="relative h-6 flex-1 overflow-hidden rounded-lg border-2 border-edge bg-ink">
                      <span
                        className={`block h-full ${
                          d.region === "미분류" ? "bg-cream/20" : "bg-candy"
                        } ${active ? "opacity-100" : "opacity-80"}`}
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
      <section className="space-y-3 border-t-2 border-edge/15 pt-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-extrabold">🎯 지역별 방탈출 테마</h2>
          <span className="text-xs font-bold text-cream/60">
            {filteredThemes.length}개
          </span>
        </div>

        {/* 지역 필터 칩 (막대와 연동) */}
        <div className="flex flex-wrap gap-1.5">
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

        {filteredThemes.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-edge/40 bg-panel py-10 text-center text-sm text-cream/60">
            이 지역엔 등록된 테마가 아직 없어요
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                  className="rough rounded-xl border-2 border-edge bg-panel px-5 py-2.5 text-sm font-extrabold shadow-cute transition active:scale-[0.97]"
                >
                  더보기 ({filteredThemes.length - visible} 남음)
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <p className="text-xs text-cream/55">
        ※ 지역은 매장명 키워드로 자동 추정해요. 못 찾으면 “미분류”로 모여요.
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
      className={`rough-sm rounded-full border px-3 py-1.5 text-sm font-bold transition active:scale-[0.97] ${
        active
          ? "border-candy bg-candy/10 text-candy"
          : "border-edge/20 bg-panel text-cream/60 hover:border-edge/40"
      }`}
    >
      {label}
    </button>
  );
}
