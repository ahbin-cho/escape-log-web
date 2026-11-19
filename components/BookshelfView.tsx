"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { EscapeRecord } from "@/lib/store";
import { RATING_LABELS } from "@/lib/terms";
import { coverDate, shelvesByYear, type Book } from "@/lib/bookshelf";
import type { PosterIndex } from "@/lib/poster";
import { usePosterIndex } from "@/lib/use-poster-index";
import RecordPoster from "@/components/RecordPoster";
import ShareRecordButton from "@/components/ShareRecordButton";

// 내 서재: 기록 하나가 포스터 표지 한 장. 최근에 다녀온 방이 먼저, 해가 바뀌면 얇은 연도 줄.
// 표지를 누르면 그날 기록이 아래에서 올라온다.
export default function BookshelfView({ records }: { records: EscapeRecord[] }) {
  const [open, setOpen] = useState<Book | null>(null);
  const posters = usePosterIndex();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const shelves = useMemo(() => shelvesByYear(records), [records]);

  return (
    <section aria-label="내 서재">
      {shelves.map(({ year, books }, i) => (
        <div key={year}>
          {/* 연도 표시는 해가 바뀌는 곳에만(첫 줄은 표지 날짜로 충분) */}
          {i > 0 && (
            <div className="mb-3 mt-6 flex items-center gap-3 text-xs font-extrabold text-cream/70">
              <span>{year === "—" ? "날짜 없음" : `${year}년`}</span>
              <span className="h-px flex-1 bg-line" aria-hidden />
              <span className="font-medium">{books.length}개</span>
            </div>
          )}
          <ul className="grid grid-cols-3 gap-x-2.5 gap-y-3.5 sm:grid-cols-4 sm:gap-x-4 sm:gap-y-5 md:grid-cols-5 lg:grid-cols-6">
            {books.map((b) => (
              <li key={b.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => setOpen(b)}
                  aria-label={`${b.title || "(제목 없음)"}, ${coverDate(b.playedAt)}, ${RATING_LABELS[b.rating - 1]}, ${b.success ? "탈출" : "실패"}`}
                  className="block w-full text-left transition-opacity duration-200 active:opacity-80"
                >
                  <span className="relative block">
                    <RecordPoster record={b.record} index={posters} />
                    {b.legend && (
                      <span className="absolute left-1.5 top-1.5 rounded-md bg-candy px-1.5 py-[3px] text-[10px] font-extrabold leading-none text-edge">
                        인생테마
                      </span>
                    )}
                    {!b.success && (
                      <span className="absolute bottom-1.5 right-1.5 rounded-md bg-white/90 px-1.5 py-[3px] text-[10px] font-extrabold leading-none text-cream/70">
                        실패
                      </span>
                    )}
                  </span>
                  <span className="mt-2 block truncate text-sm font-extrabold">{b.title || "(제목 없음)"}</span>
                  <span className="mt-0.5 block truncate text-xs tabular-nums text-cream/70">{coverDate(b.playedAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {open && <RecordSheet book={open} posters={posters} onClose={() => setOpen(null)} />}
    </section>
  );
}

// 표지를 눌렀을 때: 그날 기록 한 장(휴대폰은 아래에서, 넓은 화면은 가운데)
function RecordSheet({ book: b, posters, onClose }: { book: Book; posters: PosterIndex; onClose: () => void }) {
  const r = b.record;
  const guest = r.id.startsWith("guest-");
  const hint = r.hintCount < 0 ? "무제한" : `${r.hintCount ?? 0}개`;
  return (
    <div className="shelf-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/45 sm:items-center sm:p-4" onClick={onClose}>
      <article
        role="dialog"
        aria-modal="true"
        aria-label={b.title}
        onClick={(e) => e.stopPropagation()}
        className="shelf-card w-full max-w-md rounded-t-2xl bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 shadow-float sm:rounded-2xl"
      >
        <div className="flex gap-4">
          <span className="w-[88px] shrink-0">
            <RecordPoster record={r} index={posters} />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            {b.legend && (
              <span className="mb-1.5 inline-block rounded-md bg-[#FFF3E6] px-1.5 py-[3px] text-[11px] font-extrabold leading-none text-[#B5601B]">
                인생테마
              </span>
            )}
            <h3 className="text-lg leading-snug [word-break:keep-all]">{b.title || "(제목 없음)"}</h3>
            <p className="mt-1 truncate text-[13px] text-cream/70">{b.cafe || "매장 미입력"}</p>
            <p className="mt-0.5 text-[13px] tabular-nums text-cream/70">
              {coverDate(b.playedAt)} · {r.genre}
            </p>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-3 divide-x divide-line border-y border-line text-center">
          <Cell label="평가" value={RATING_LABELS[b.rating - 1]} />
          <Cell label="결과" value={r.success ? "탈출" : "실패"} />
          <Cell label="힌트" value={hint} />
        </dl>

        {r.oneLiner && <p className="mt-4 text-[15px] leading-relaxed text-cream/85 [word-break:keep-all]">“{r.oneLiner}”</p>}

        <div className="mt-5 flex gap-2">
          <ShareRecordButton
            record={r}
            className="rough flex-1 rounded-xl bg-candy py-3.5 text-center text-[15px] font-extrabold text-[#1D1D1D] transition-opacity duration-200 active:opacity-80 border-[2px] border-[#1D1D1D] shadow-[3px_3px_0_0_#1D1D1D] disabled:opacity-60"
          />
          <Link
            href={guest ? "/login?mode=signup&guest=1&next=/records" : `/edit/${r.id}`}
            className="rounded-xl border border-line px-4 py-3.5 text-center text-[15px] font-extrabold transition-opacity duration-200 active:opacity-70"
          >
            {guest ? "가입하고 수정" : "수정"}
          </Link>
          <button
            type="button"
            autoFocus
            onClick={onClose}
            className="rounded-xl border border-line px-5 py-3.5 text-[15px] font-extrabold transition-opacity duration-200 active:opacity-70"
          >
            닫기
          </button>
        </div>
      </article>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3">
      <dt className="text-xs text-cream/70">{label}</dt>
      <dd className="mt-0.5 text-[15px] font-extrabold">{value}</dd>
    </div>
  );
}
