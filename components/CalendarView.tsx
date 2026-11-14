"use client";

import { useMemo, useState } from "react";
import type { EscapeRecord } from "@/lib/store";
import { kstDate } from "@/lib/home-picks";
import { initialMonth, monthCells, recordsByDay, shiftMonth } from "@/lib/calendar";
import { findPoster } from "@/lib/poster";
import { usePosterIndex } from "@/lib/use-poster-index";
import DiaryView from "./DiaryView";
import PosterTile, { TONE } from "./PosterTile";
import MonthCardButton from "./MonthCardButton";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

// 기록 달력: 다녀온 날 칸은 날짜 숫자 대신 그림으로 채운다(내 사진 → 공식 포스터 → 장르 색 표지).
// 하루에 여러 방을 갔으면 칸을 나눠 담고, 4방부터는 3장 + "+N".
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

  // 기록 한 건의 그림: 내가 올린 사진 → 공식 포스터 → (없으면 빈 값, 장르 색 표지가 보인다)
  function imageOf(record: EscapeRecord): string {
    return record.photoUrl || findPoster(posters, record.themeName, record.cafeName)?.poster || "";
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

            // 하루에 여러 방(연방)이면 칸을 나눠 담는다: 1=통째, 2=위아래, 3=위 1+아래 2, 4방부터는 3장 + "+N"
            const tiles = list.length > 3 ? list.slice(0, 3) : list;
            const more = list.length - tiles.length;
            const split = list.length > 1;
            const isPicked = picked === day;
            return (
              <button
                key={day}
                onClick={() => setPicked(isPicked ? null : day)}
                aria-pressed={isPicked}
                aria-label={`${m}월 ${dayNum}일 ${list.length}방: ${list.map((r) => r.themeName).join(", ")}`}
                className={`relative grid aspect-[2/3] overflow-hidden rounded-md bg-white transition-opacity duration-200 active:opacity-80 ${
                  split ? "grid-cols-2 grid-rows-2 gap-px" : ""
                } ${isPicked ? "ring-2 ring-edge ring-offset-2 ring-offset-white" : ""}`}
              >
                {tiles.map((record, k) => {
                  const image = imageOf(record);
                  // 2방: 두 칸 다 가로로 길게 / 3방: 첫 칸만 가로로 길게
                  const wide = list.length === 2 || (list.length === 3 && k === 0);
                  return (
                    <span key={record.id} className={`relative overflow-hidden ${wide ? "col-span-2" : ""}`}>
                      {/* 장르 색 표지를 깔고 그 위에 그림: 그림이 없거나 깨지면 표지가 보인다 */}
                      {split ? (
                        <MiniTile genre={record.genre} name={record.themeName} />
                      ) : (
                        <PosterTile genre={record.genre} name={record.themeName} />
                      )}
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
                    </span>
                  );
                })}
                {more > 0 && (
                  <span className="flex items-center justify-center bg-ink text-[11px] font-extrabold tabular-nums text-cream sm:text-[13px]">
                    +{more}
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

// 나뉜 칸용 작은 표지: 자리가 좁아 장르 색 바탕에 테마 이름만 넣는다
function MiniTile({ genre, name }: { genre: string; name: string }) {
  const t = TONE[genre] ?? TONE["기타"];
  return (
    <span
      className="absolute inset-0 flex items-end p-[8%] text-left"
      style={{ backgroundColor: t.bg, backgroundImage: `linear-gradient(160deg, ${t.accent}33 0%, transparent 60%)` }}
    >
      <span className="line-clamp-2 text-[7px] font-extrabold leading-[1.15] text-[#F5F0E6] [word-break:keep-all] sm:text-[9px]">
        {name}
      </span>
    </span>
  );
}
