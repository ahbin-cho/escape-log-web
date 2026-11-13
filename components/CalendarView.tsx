"use client";

import { useEffect, useMemo, useState } from "react";
import { getPosters, type EscapeRecord } from "@/lib/store";
import { kstDate } from "@/lib/home-picks";
import {
  buildPosterIndex,
  dayCover,
  initialMonth,
  monthCells,
  recordsByDay,
  shiftMonth,
  type PosterIndex,
} from "@/lib/calendar";
import DiaryView from "./DiaryView";
import PosterTile from "./PosterTile";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
const EMPTY_INDEX: PosterIndex = { byTheme: new Map(), byName: new Map() };

// 기록 달력: 날짜 칸마다 그날 한 방의 인증샷/포스터를 채운다.
// 아래에는 고른 날(없으면 그 달 전체)의 기록을 다이어리 모양으로 보여 준다.
export default function CalendarView({
  records,
  numbers,
}: {
  records: EscapeRecord[];
  numbers: Map<string, number>;
}) {
  const today = kstDate(new Date());
  const [month, setMonth] = useState(() => initialMonth(records, today));
  const [picked, setPicked] = useState<string | null>(null);
  const [posters, setPosters] = useState<PosterIndex>(EMPTY_INDEX);

  useEffect(() => {
    getPosters().then((rows) => setPosters(buildPosterIndex(rows)));
  }, []);

  const byDay = useMemo(() => recordsByDay(records), [records]);
  const cells = monthCells(month);
  const monthRecords = cells.flatMap((d) => (d ? byDay.get(d) ?? [] : []));
  // 기록이 하나도 없는 주는 날짜 줄만 남겨 달력을 짧게
  const weekHasRecord = (i: number) =>
    cells.slice(i - (i % 7), i - (i % 7) + 7).some((d) => d && byDay.has(d));
  const shown = picked ? byDay.get(picked) ?? [] : monthRecords;
  const [y, m] = month.split("-").map(Number);

  function go(n: number) {
    setMonth((cur) => shiftMonth(cur, n));
    setPicked(null);
  }

  return (
    <div className="space-y-5">
      <section className="rough mx-auto max-w-lg rounded-2xl border-2 border-edge bg-panel p-3 shadow-cute sm:p-4">
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => go(-1)}
            aria-label="이전 달"
            className="rounded-lg px-3 py-1 text-lg font-extrabold transition hover:bg-edge/10 active:scale-95"
          >
            ‹
          </button>
          <div className="text-center">
            <div className="text-lg font-extrabold">
              {y}년 {m}월
            </div>
            <div className="text-xs font-bold text-cream/55">
              {monthRecords.length
                ? `${monthRecords.length}방 · 탈출 ${monthRecords.filter((r) => r.success).length}`
                : "기록 없음"}
            </div>
          </div>
          <button
            onClick={() => go(1)}
            aria-label="다음 달"
            className="rounded-lg px-3 py-1 text-lg font-extrabold transition hover:bg-edge/10 active:scale-95"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-extrabold text-cream/50">
          {WEEK.map((w, i) => (
            <div key={w} className={i === 0 ? "text-red-500/70" : i === 6 ? "text-sky-600/70" : ""}>
              {w}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-x-1.5 gap-y-2">
          {cells.map((day, i) => {
            if (!day) return <div key={`blank-${i}`} />;
            const list = byDay.get(day) ?? [];
            const cover = dayCover(list, posters);
            const img = cover?.image ?? "";
            const isPicked = picked === day;
            const isToday = day === today;
            const dayNum = Number(day.slice(8));
            const week = i % 7;

            // 날짜는 포스터 위에 겹치지 않고 따로 한 줄 (오늘은 주황 동그라미)
            const dateRow = (
              <span
                className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-extrabold tabular-nums ${
                  isToday
                    ? "bg-candy text-edge"
                    : cover
                      ? "text-cream"
                      : week === 0
                        ? "text-red-500/60"
                        : week === 6
                          ? "text-sky-600/60"
                          : "text-cream/40"
                }`}
              >
                {dayNum}
              </span>
            );

            if (!cover) {
              return (
                <div key={day} className="flex flex-col gap-1">
                  {dateRow}
                  {weekHasRecord(i) && <div className="aspect-[3/4]" />}
                </div>
              );
            }

            return (
              <button
                key={day}
                onClick={() => setPicked(isPicked ? null : day)}
                aria-pressed={isPicked}
                aria-label={`${m}월 ${dayNum}일 ${list.length}방: ${list
                  .map((r) => r.themeName)
                  .join(", ")}`}
                className="group flex flex-col gap-1 transition active:scale-95"
              >
                {dateRow}
                <span
                  className={`relative block aspect-[3/4] w-full overflow-hidden rounded-md shadow-sm transition ${
                    isPicked
                      ? "ring-2 ring-candy ring-offset-2 ring-offset-panel"
                      : "ring-1 ring-edge/15 group-hover:ring-edge/40"
                  }`}
                >
                  {/* 미니 포스터를 깔고 그 위에 그림: 그림이 없거나 깨지면 미니 포스터가 보인다 */}
                  <PosterTile genre={cover.record.genre} name={cover.record.themeName} success={cover.record.success} />
                  {img && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt=""
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  {list.length > 1 && (
                    <span className="absolute bottom-1 right-1 rounded-full bg-edge/80 px-1.5 text-[10px] font-extrabold leading-4 text-panel backdrop-blur-sm">
                      +{list.length - 1}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 아래 목록은 다이어리가 달 제목을 붙이므로, 날을 골랐을 때만 따로 안내 */}
      {picked && (
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-extrabold">
            {m}월 {Number(picked.slice(8))}일 기록
          </h2>
          <button onClick={() => setPicked(null)} className="text-xs font-bold text-candy">
            {m}월 전체 보기
          </button>
        </div>
      )}

      {shown.length ? (
        <DiaryView records={shown} numbers={numbers} />
      ) : (
        <p className="rounded-2xl border-2 border-dashed border-edge/30 py-10 text-center text-sm text-cream/55">
          이 달엔 기록이 없어요
        </p>
      )}
    </div>
  );
}
