"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getRecords, seedIfEmpty, type EscapeRecord } from "@/lib/store";
import {
  regionDistribution,
  recordsInRegion,
  type Region,
} from "@/lib/region";
import RecordCard from "@/components/RecordCard";

type Selected = Region | "미분류" | null;

export default function RegionPage() {
  const [records, setRecords] = useState<EscapeRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<Selected>(null);

  useEffect(() => {
    seedIfEmpty();
    setRecords(getRecords());
    setReady(true);
  }, []);

  const dist = useMemo(() => regionDistribution(records), [records]);
  const maxCount = dist.length ? dist[0].count : 0;
  const topRegion = dist.find((d) => d.region !== "미분류");

  const listed = useMemo(
    () => (selected ? recordsInRegion(records, selected) : []),
    [records, selected]
  );

  if (!ready) {
    return <p className="py-20 text-center text-cream/30">불러오는 중…</p>;
  }

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-extrabold">🗺️ 지역별 방탈출 분포</h1>
        <p className="text-sm text-cream/50">
          내 기록을 지역(시·도)별로 모아봤어. 매장명에서 지역을 자동으로 찾아 분류해.
        </p>
      </header>

      {records.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-edge/40 bg-panel py-16 text-center">
          <p className="text-sm text-cream/40">기록이 쌓이면 지역 분포가 그려져!</p>
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
            <div className="rough rounded-2xl border-2 border-edge bg-panel p-5 shadow-cute">
              <p className="text-xs text-cream/40">가장 많이 간 지역</p>
              <p className="mt-1 text-xl font-extrabold">
                📍 {topRegion.region}{" "}
                <span className="text-sm font-normal text-cream/50">
                  {topRegion.count}개 방
                </span>
              </p>
            </div>
          )}

          {/* 분포 막대 */}
          <section className="space-y-2">
            <h2 className="text-lg font-extrabold">분포</h2>
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
                          width: `${Math.max(
                            8,
                            Math.round((d.count / maxCount) * 100)
                          )}%`,
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
            <p className="text-xs text-cream/30">
              막대를 누르면 그 지역 기록만 볼 수 있어.
            </p>
          </section>

          {/* 선택 지역 기록 */}
          {selected && (
            <section className="space-y-3">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-extrabold">
                  {selected} 기록 ({listed.length})
                </h2>
                <button
                  onClick={() => setSelected(null)}
                  className="text-sm font-bold text-cream/40 hover:text-cream/60"
                >
                  전체 보기
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {listed.map((r) => (
                  <RecordCard key={r.id} record={r} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <p className="text-xs text-cream/30">
        ※ 지역은 매장명 키워드로 자동 추정해요. 못 찾으면 “미분류”로 모여요.
      </p>
    </div>
  );
}
