"use client";

import Link from "next/link";
import type { EscapeRecord } from "@/lib/store";
import { ratingLabel } from "@/lib/terms";
import { groupByMonth, reachedMilestone, recordDate } from "@/lib/diary";
import { usePosterIndex } from "@/lib/use-poster-index";
import RecordPoster from "@/components/RecordPoster";
import ShareRecordButton from "@/components/ShareRecordButton";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

function dayLabel(r: EscapeRecord): string {
  const d = recordDate(r);
  if (!d) return "";
  const dt = new Date(`${d}T00:00:00`);
  return `${dt.getDate()}일 ${WEEK[dt.getDay()] ?? ""}요일`;
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
  const posters = usePosterIndex();

  return (
    <div className="space-y-7">
      {months.map((m) => (
        <section key={m.key || "none"}>
          <h2 className="flex items-baseline justify-between border-b border-line pb-2">
            <span className="text-[17px]">{m.label}</span>
            <span className="text-[13px] font-medium text-cream/70">
              {m.records.length}방 · 탈출 {m.success}
            </span>
          </h2>

          <ol className="divide-y divide-line">
            {m.records.map((r) => {
              const n = numbers.get(r.id);
              const milestone = n ? reachedMilestone(n) : null;
              const label = ratingLabel(r.rating);
              const legend = Math.round(r.rating) >= 5;
              const facts = [
                r.success ? `탈출${r.remainingTime ? ` · ${r.remainingTime} 남김` : ""}` : "실패",
                hintText(r.hintCount),
                legend ? "" : label,
              ].filter(Boolean);
              return (
                <li key={r.id}>
                  {/* 줄을 눌러도 바로 수정으로 가지 않게: 아래 '공유'·'수정' 버튼으로 나눈다(운영자 요청 11/14) */}
                  <div className="flex gap-3 pt-3.5">
                    <span className="w-12 shrink-0">
                      <RecordPoster record={r} index={posters} small />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[15px] font-extrabold">{r.themeName || "(제목 없음)"}</span>
                        {legend && (
                          <span className="shrink-0 rounded-md bg-[#FFF3E6] px-1.5 py-[3px] text-[10px] font-extrabold leading-none text-[#B5601B]">
                            인생테마
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[13px] text-cream/70">
                        {[dayLabel(r), r.cafeName || "매장 미입력", r.partySize ? `${r.partySize}명` : ""].filter(Boolean).join(" · ")}
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-cream/70">
                        {n && (
                          <span
                            className={`rounded-md px-1.5 py-[3px] font-extrabold leading-none tabular-nums ${
                              milestone ? "bg-candy text-edge" : "bg-ink"
                            }`}
                          >
                            {n}번째 방
                          </span>
                        )}
                        <span>{facts.join(" · ")}</span>
                      </p>
                      {r.oneLiner && <p className="mt-1.5 line-clamp-2 text-sm text-cream/85">“{r.oneLiner}”</p>}
                    </div>

                    {r.photoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.photoUrl} alt="" loading="lazy" className="h-[72px] w-[72px] shrink-0 rounded-md object-cover" />
                    )}
                  </div>
                  <div className="flex justify-end gap-2 pb-3 pt-1.5">
                    <ShareRecordButton
                      record={r}
                      number={n}
                      label="공유"
                      className="rounded-lg border border-line px-3 py-1.5 text-xs font-extrabold disabled:opacity-60"
                    />
                    <Link
                      href={r.id.startsWith("guest-") ? "/login?mode=signup&guest=1&next=/records" : `/edit/${r.id}`}
                      className="rounded-lg border border-line px-3 py-1.5 text-xs font-extrabold text-cream/70"
                    >
                      {r.id.startsWith("guest-") ? "가입하고 수정" : "수정"}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
