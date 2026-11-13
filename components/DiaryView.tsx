"use client";

import Link from "next/link";
import { GENRE_EMOJI, type EscapeRecord } from "@/lib/store";
import { ratingLabel } from "@/lib/terms";
import { groupByMonth, reachedMilestone, recordDate } from "@/lib/diary";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

function dayLabel(r: EscapeRecord): { day: string; week: string } {
  const d = recordDate(r);
  if (!d) return { day: "–", week: "" };
  const dt = new Date(`${d}T00:00:00`);
  return { day: String(dt.getDate()), week: WEEK[dt.getDay()] ?? "" };
}

function hintText(n: number): string {
  if (n < 0) return "힌트 무제한";
  if (n === 0) return "노힌트";
  return `힌트 ${n}`;
}

// 방탈 다이어리: 달별로 묶고, 기록마다 "N번째 방" 번호를 붙인 타임라인.
// numbers 는 전체 기록 기준 번호(필터를 걸어도 번호가 바뀌지 않게).
export default function DiaryView({
  records,
  numbers,
}: {
  records: EscapeRecord[];
  numbers: Map<string, number>;
}) {
  const months = groupByMonth(records);

  return (
    <div className="space-y-8">
      {months.map((m) => (
        <section key={m.key || "none"} className="space-y-3">
          <h2 className="flex items-baseline gap-2 border-b-2 border-edge/15 pb-1.5">
            <span className="text-lg font-extrabold">{m.label}</span>
            <span className="text-xs font-bold text-cream/55">
              {m.records.length}방 · 탈출 {m.success}
            </span>
          </h2>

          <ol className="space-y-2.5">
            {m.records.map((r) => {
              const n = numbers.get(r.id);
              const milestone = n ? reachedMilestone(n) : null;
              const { day, week } = dayLabel(r);
              const label = ratingLabel(r.rating);
              return (
                <li key={r.id}>
                  <Link
                    href={r.id.startsWith("guest-") ? "/login?mode=signup&guest=1&next=/records" : `/edit/${r.id}`}
                    className={`rough flex gap-3 rounded-2xl border-2 bg-panel p-3.5 transition hover:border-candy active:scale-[0.99] ${
                      milestone ? "border-candy shadow-cute" : "border-edge"
                    }`}
                  >
                    <div className="w-10 shrink-0 text-center">
                      <div className="text-xl font-extrabold leading-none tabular-nums">
                        {day}
                      </div>
                      <div className="mt-0.5 text-xs font-bold text-cream/50">{week}</div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {n && (
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[11px] font-extrabold tabular-nums ${
                              milestone ? "bg-candy text-white" : "bg-ink text-cream/60"
                            }`}
                          >
                            {milestone ? `🎉 ${n}번째 방` : `#${n}`}
                          </span>
                        )}
                        <span className="truncate font-extrabold">
                          {r.themeName || "(제목 없음)"}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-cream/60">
                        {GENRE_EMOJI[r.genre]} {r.cafeName || "매장 미입력"}
                        {r.partySize ? ` · ${r.partySize}명` : ""}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs font-bold">
                        <span
                          className={
                            r.success
                              ? "rounded-md border border-mint bg-mint/10 px-1.5 py-0.5 text-mint"
                              : "rounded-md border border-edge/30 bg-ink px-1.5 py-0.5 text-cream/60"
                          }
                        >
                          {r.success
                            ? `탈출${r.remainingTime ? ` · ${r.remainingTime} 남김` : ""}`
                            : "실패"}
                        </span>
                        <span className="text-cream/60">{hintText(r.hintCount)}</span>
                        {label && (
                          <span className="rounded-md bg-candy/10 px-1.5 py-0.5 text-candy">
                            {label}
                          </span>
                        )}
                      </div>
                      {r.oneLiner && (
                        <p className="mt-1.5 line-clamp-2 text-sm text-cream/80">
                          “{r.oneLiner}”
                        </p>
                      )}
                    </div>

                    {r.photoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.photoUrl}
                        alt=""
                        className="h-16 w-16 shrink-0 rounded-xl border-2 border-edge object-cover"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
