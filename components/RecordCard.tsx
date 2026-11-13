"use client";

import { useState } from "react";
import Link from "next/link";
import type { EscapeRecord } from "@/lib/store";
import { fearLabel } from "@/lib/terms";
import ReviewCard from "@/components/ReviewCard";

// 내 기록 카드: 위는 후기 카드(사진 위에 한줄 후기, 공유 가능), 아래는 눌러서 펼치는 자세한 기록.
export default function RecordCard({ record, number }: { record: EscapeRecord; number?: number }) {
  const [expanded, setExpanded] = useState(false);
  const guest = record.id.startsWith("guest-");

  return (
    <ReviewCard review={record} byline={number ? `${number}번째 방` : undefined}>
      <div className="px-4 py-3">
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex w-full items-center justify-between text-xs font-bold text-cream/60"
        >
          <span>
            난이도 {record.difficulty} · 공포 {record.fearLevel}
            {fearLabel(record.fearLevel) ? ` (${fearLabel(record.fearLevel)})` : ""} · 힌트{" "}
            {record.hintCount < 0 ? "무한" : `${record.hintCount}회`}
          </span>
          <span className={`transition ${expanded ? "rotate-180" : ""}`}>⌄</span>
        </button>
        {expanded && (
          <div className="mt-3 space-y-3 border-t border-edge/10 pt-3 text-sm">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-cream/70">
              {record.remainingTime && <span>남은 시간 {record.remainingTime}</span>}
              {record.partySize > 0 && <span>인원 {record.partySize}명</span>}
              {record.themeType && <span>{record.themeType}방</span>}
            </div>
            {record.memo && (
              <p className="rounded-xl bg-ink p-3 text-cream/65">
                <span className="mb-1 block text-[11px] font-extrabold text-cream/40">나만 보는 메모</span>
                {record.memo}
              </p>
            )}
            {!guest && (
              <Link href={`/edit/${record.id}`} className="inline-block rounded-lg border border-edge/25 px-3 py-1.5 text-sm font-bold">
                수정
              </Link>
            )}
          </div>
        )}
      </div>
    </ReviewCard>
  );
}
