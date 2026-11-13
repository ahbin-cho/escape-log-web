"use client";

import { useMemo, useState } from "react";
import type { EscapeRecord } from "@/lib/store";
import { kstDate } from "@/lib/home-picks";
import { initialMonth, monthCells, recordsByDay, shiftMonth } from "@/lib/calendar";
import { findPoster } from "@/lib/poster";
import { usePosterIndex } from "@/lib/use-poster-index";
import DiaryView from "./DiaryView";
import PosterTile from "./PosterTile";
import MonthCardButton from "./MonthCardButton";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

// 기록 달력: 다녀온 날 칸에 그 방의 공식 포스터를 채운다(없으면 인증샷, 그것도 없으면 장르 색 표지).
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
  const posters = usePosterIndex();

  const byDay = useMemo(() => recordsByDay(records), [records]);
  const cells = monthCells(month);
  const monthRecords = cells.flatMap((d) => (d ? byDay.get(d) ?? [] : []));
  const shown = picked ? byDay.get(picked) ?? [] : monthRecords;
  const [y, m] = month.split("-").map(Number);

  function go(n: number) {
    setMonth((cur) => shiftMonth(cur, n));
    setPicked(null);
  }

  // 하루 칸의 대표 기록: 포스터(또는 인증샷)가 있는 기록을 먼저, 없으면 그날 첫 기록
  function cover(list: EscapeRecord[]): { record: EscapeRecord; image: string } {
    for (const record of list) {
      const image = findPoster(posters, record.themeName, record.cafeName)?.poster || record.photoUrl;
      if (image) return { record, image };
    }
    return { record: list[0], image: "" };
  }

  return (
    <div className="space-y-6">
      <section className="mx-auto max-w-xl" aria-label={`${y}년 ${m}월 달력`}>
        <div className="flex items-center justify-between">
          <div className="-ml-2 flex items-center">
            <button
              onClick={() => go(-1)}
              aria-label="이전 달"
              className="flex h-9 w-8 items-center justify-center rounded-lg text-lg text-cream/70 transition-colors hover:text-cream"
            >
              ‹
            </button>
            <h2 className="px-1 text-[17px] tabular-nums">
              {y}년 {m}월
            </h2>
            <button
              onClick={() => go(1)}
              aria-label="다음 달"
              className="flex h-9 w-8 items-center justify-center rounded-lg text-lg text-cream/70 transition-colors hover:text-cream"
            >
              ›
            </button>
          </div>
          {monthRecords.length > 0 && <MonthCardButton month={month} records={monthRecords} />}
        </div>

        <div className="mt-1.5 grid grid-cols-7 gap-1 text-center text-[11px] text-cream/70">
          {WEEK.map((w) => (
            <div key={w} className="pb-1">
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={`blank-${i}`} />;
            const list = byDay.get(day) ?? [];
            const isToday = day === today;
            const dayNum = Number(day.slice(8));

            if (!list.length) {
              return (
                <div
                  key={day}
                  className={`aspect-[2/3] rounded-md bg-ink px-1 py-[3px] text-[10px] tabular-nums ${
                    isToday ? "font-extrabold text-candy" : "text-cream/45"
                  }`}
                >
                  {dayNum}
                </div>
              );
            }

            const { record, image } = cover(list);
            const isPicked = picked === day;
            return (
              <button
                key={day}
                onClick={() => setPicked(isPicked ? null : day)}
                aria-pressed={isPicked}
                aria-label={`${m}월 ${dayNum}일 ${list.length}방: ${list.map((r) => r.themeName).join(", ")}`}
                className={`relative block aspect-[2/3] overflow-hidden rounded-md transition-opacity duration-200 active:opacity-80 ${
                  isPicked ? "ring-2 ring-edge ring-offset-2 ring-offset-white" : ""
                }`}
              >
                {/* 장르 색 표지를 깔고 그 위에 그림: 그림이 없거나 깨지면 표지가 보인다 */}
                <PosterTile genre={record.genre} name={record.themeName} />
                {image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt=""
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                {/* 날짜가 어떤 그림 위에서도 읽히게 위쪽만 살짝 어둡게 */}
                <span className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-black/55 to-transparent" aria-hidden />
                <span className="absolute left-1 top-[3px] text-[10px] font-extrabold tabular-nums text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
                  {dayNum}
                </span>
                {list.length > 1 && (
                  <span className="absolute bottom-1 right-1 rounded-full bg-black/70 px-1.5 text-[10px] font-extrabold leading-4 text-white">
                    +{list.length - 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 아래 목록은 다이어리가 달 제목을 붙이므로, 날을 골랐을 때만 따로 안내 */}
      {picked && (
        <div className="flex items-baseline justify-between">
          <h2 className="text-[17px]">
            {m}월 {Number(picked.slice(8))}일 기록
          </h2>
          <button onClick={() => setPicked(null)} className="text-[13px] text-cream/70 underline underline-offset-2">
            {m}월 전체 보기
          </button>
        </div>
      )}

      {shown.length ? (
        <DiaryView records={shown} numbers={numbers} />
      ) : (
        <p className="py-8 text-center text-sm text-cream/70">이 달엔 기록이 없어요</p>
      )}
    </div>
  );
}
