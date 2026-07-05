"use client";

import { useState } from "react";
import Link from "next/link";
import { GENRE_COLOR, GENRE_EMOJI, type EscapeRecord } from "@/lib/store";
import { ratingLabel, fearLabel, achievements } from "@/lib/terms";

export default function RecordCard({ record }: { record: EscapeRecord }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => setExpanded((v) => !v)}
      className="rough group flex cursor-pointer flex-col gap-3 rounded-2xl border-2 border-edge bg-panel p-5 shadow-cute transition active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-extrabold leading-tight">
          {record.themeName || "(제목 없음)"}
        </h3>
        <span
          className={`shrink-0 rounded-lg border-2 border-edge px-2 py-0.5 text-xs font-bold ${
            GENRE_COLOR[record.genre] || GENRE_COLOR["기타"]
          }`}
        >
          {GENRE_EMOJI[record.genre]} {record.genre}
        </span>
      </div>

      <div className="text-sm text-cream/60">
        {record.cafeName || "매장 미입력"}
        {record.playedAt ? ` · ${record.playedAt}` : ""}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        {ratingLabel(record.rating) && (
          <span className="rounded-md border-2 border-candy/50 bg-candy/10 px-2 py-0.5 text-xs font-extrabold text-candy">
            {ratingLabel(record.rating)}
          </span>
        )}
        <span
          className={
            record.success
              ? "rounded-lg border border-mint bg-mint/10 px-2 py-0.5 text-xs font-bold text-mint"
              : "rounded-lg border border-edge/30 bg-ink px-2 py-0.5 text-xs text-cream/60"
          }
        >
          {record.success ? "탈출 성공" : "실패"}
        </span>
        {achievements(record).map((a) => (
          <span
            key={a}
            className="rounded-lg border-2 border-edge bg-candy px-2 py-0.5 text-xs font-extrabold text-white"
          >
            {a}
          </span>
        ))}
        <span className="text-xs text-cream/60">
          난이도 {record.difficulty} · 공포 {record.fearLevel}
          {fearLabel(record.fearLevel) ? ` (${fearLabel(record.fearLevel)})` : ""}
        </span>
      </div>

      {record.oneLiner ? (
        <p className="line-clamp-2 text-sm text-cream/70">{record.oneLiner}</p>
      ) : null}

      {/* 확장 영역 */}
      <div
        className="grid transition-[grid-template-rows] duration-200"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 border-t-2 border-edge/20 pt-3">
            {record.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={record.photoUrl}
                alt={record.themeName}
                className="max-h-64 w-full rounded-xl border-2 border-edge object-cover"
              />
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-cream/70">
              {record.remainingTime && (
                <span>남은 시간 {record.remainingTime}</span>
              )}
              <span>
                힌트 {record.hintCount < 0 ? "무한" : `${record.hintCount}회`}
              </span>
              {record.partySize > 0 && <span>인원 {record.partySize}명</span>}
              {record.themeType && <span>{record.themeType}방</span>}
            </div>

            {record.memo && (
              <p className="rounded-xl border border-edge/20 bg-ink p-3 text-sm text-cream/60">
                {record.memo}
              </p>
            )}

            <Link
              href={`/edit/${record.id}`}
              onClick={(e) => e.stopPropagation()}
              className="rough inline-block rounded-xl border-2 border-edge bg-panel px-3 py-1.5 text-sm font-bold transition active:scale-[0.97]"
            >
              수정
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
