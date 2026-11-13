"use client";

import { useState } from "react";
import Link from "next/link";
import type { EscapeRecord } from "@/lib/store";
import { fearLabel } from "@/lib/terms";
import { usePosterIndex } from "@/lib/use-poster-index";
import RecordPoster from "@/components/RecordPoster";
import { reviewChips, shareReviewImage } from "@/components/ReviewCard";

// 내 기록 한 줄(목록 보기): 왼쪽 포스터, 오른쪽에 제목·매장·결과. '자세히'를 누르면 메모·수정·후기 카드 공유가 펼쳐진다.
export default function RecordCard({ record, number }: { record: EscapeRecord; number?: number }) {
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const posters = usePosterIndex();
  const guest = record.id.startsWith("guest-");
  const chips = reviewChips(record);
  const fear = fearLabel(record.fearLevel);

  async function share() {
    if (busy) return;
    setBusy(true);
    await shareReviewImage(record, number ? `${number}번째 방` : undefined);
    setBusy(false);
  }

  return (
    <article className="rounded-xl border border-line p-3">
      <div className="flex gap-3">
        <span className="w-12 shrink-0">
          <RecordPoster record={record} index={posters} small />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px]">{record.themeName || "(제목 없음)"}</h3>
          <p className="mt-0.5 truncate text-[13px] text-cream/70">
            {[record.cafeName, record.playedAt ? record.playedAt.replaceAll("-", ".") : "", number ? `${number}번째 방` : ""]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-1">
            {chips.map((c) => (
              <li
                key={c}
                className={`rounded-md px-1.5 py-[3px] text-[11px] font-extrabold leading-none ${
                  c === "인생테마" ? "bg-[#FFF3E6] text-[#B5601B]" : "bg-ink text-cream/70"
                }`}
              >
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {record.oneLiner && <p className="mt-2.5 text-sm leading-relaxed text-cream/85 [word-break:keep-all]">“{record.oneLiner}”</p>}

      <button
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="mt-2.5 flex min-h-[32px] w-full items-center justify-between gap-2 border-t border-line pt-2.5 text-left text-xs text-cream/70"
      >
        <span className="truncate">
          난이도 {record.difficulty} · 공포 {record.fearLevel}
          {fear ? ` (${fear})` : ""} · 힌트 {record.hintCount < 0 ? "무제한" : `${record.hintCount}회`}
        </span>
        <span className="shrink-0 font-extrabold text-cream">{expanded ? "접기" : "자세히"}</span>
      </button>

      {expanded && (
        <div className="mt-2 space-y-3 text-sm">
          {(record.remainingTime || record.partySize > 0 || record.themeType) && (
            <p className="flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-cream/70">
              {record.remainingTime && <span>남은 시간 {record.remainingTime}</span>}
              {record.partySize > 0 && <span>인원 {record.partySize}명</span>}
              {record.themeType && <span>{record.themeType}방</span>}
            </p>
          )}
          {record.memo && (
            <p className="rounded-lg bg-ink p-3 text-cream/85">
              <span className="mb-1 block text-[11px] font-extrabold text-cream/70">나만 보는 메모</span>
              {record.memo}
            </p>
          )}
          <div className="flex gap-2">
            <Link
              href={guest ? "/login?mode=signup&guest=1&next=/records" : `/edit/${record.id}`}
              className="rounded-lg bg-candy px-3.5 py-2 text-[13px] font-extrabold text-[#1D1D1D] border-[2px] border-[#1D1D1D] shadow-[3px_3px_0_0_#1D1D1D]"
            >
              {guest ? "가입하고 수정하기" : "수정"}
            </Link>
            <button onClick={share} disabled={busy} className="rounded-lg border border-line px-3.5 py-2 text-[13px] font-extrabold disabled:opacity-60">
              {busy ? "이미지 만드는 중…" : "후기 카드로 공유"}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
