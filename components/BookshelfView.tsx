"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { EscapeRecord } from "@/lib/store";
import { RATING_LABELS } from "@/lib/terms";
import { packRows, shelfStats, shelvesByYear, spineTitle, SHELF_INNER, type Book } from "@/lib/bookshelf";

// 내 서재: 기록 하나가 책 한 권. 사이트 기본 모양(크림 바탕·먹색 굵은 테두리·오프셋 그림자·주황)에 맞춘다.
// 책 색은 달력 미니 포스터와 같은 장르 색, 인생테마는 주황 장정.

const PAD = 14;

export default function BookshelfView({ records }: { records: EscapeRecord[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [open, setOpen] = useState<Book | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const shelves = useMemo(() => shelvesByYear(records), [records]);
  const stats = useMemo(() => shelfStats(records), [records]);

  return (
    <section ref={wrap} aria-label="내 서재" className="rounded-2xl border-2 border-edge bg-panel p-4 sm:p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl">📚 나의 서재</h2>
        <div className="flex gap-1.5 text-xs font-extrabold">
          <span className="rounded-full border-2 border-edge bg-ink px-2.5 py-1">{stats.total}권</span>
          <span className="rounded-full border-2 border-edge bg-candy px-2.5 py-1 text-edge">🏆 인생테마 {stats.legends}</span>
          <span className="rounded-full border-2 border-edge bg-ink px-2.5 py-1">탈출 {stats.escaped}</span>
        </div>
      </header>
      <p className="mt-1 text-xs text-cream/70">책 키가 클수록 좋았던 방이에요. 책을 누르면 그날 기록이 열려요.</p>

      <div className="mt-4 space-y-5">
        {shelves.map(({ year, books }) => {
          const rows = packRows(books, Math.max(160, width - (width < 640 ? 36 : 44) - PAD * 2 - 4), 4);
          return (
            <div key={year}>
              <div className="mb-2 flex items-baseline gap-2">
                <span className="text-base font-extrabold" style={{ fontFamily: '"SBAggroB", sans-serif' }}>
                  {year}
                </span>
                <span className="text-xs font-bold text-cream/70">{books.length}권</span>
              </div>
              <div className="overflow-hidden rounded-xl border-2 border-edge bg-[#EFE5D3]">
                {rows.map((row, i) => (
                  <Shelf key={i} row={row} onOpen={setOpen} last={i === rows.length - 1} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {open && <BookCard book={open} onClose={() => setOpen(null)} />}
    </section>
  );
}

function Shelf({ row, onOpen, last }: { row: Book[]; onOpen: (b: Book) => void; last: boolean }) {
  return (
    <div>
      <div className="flex items-end gap-1 pt-4" style={{ height: SHELF_INNER - 10, paddingLeft: PAD, paddingRight: PAD }}>
        {row.map((b) => (
          <Spine key={b.id} book={b} onOpen={onOpen} />
        ))}
      </div>
      {/* 선반 판: 먹색 테두리 + 나무색 */}
      <div className={`h-3 border-y-2 border-edge bg-[#C8955C] ${last ? "border-b-0" : ""}`} />
    </div>
  );
}

function Spine({ book: b, onOpen }: { book: Book; onOpen: (b: Book) => void }) {
  const { base, foil } = b.cloth;
  const h = b.height - 14;
  return (
    <button
      type="button"
      onClick={() => onOpen(b)}
      title={`${b.title} · ${b.cafe}`}
      aria-label={`${b.title}, ${b.playedAt}, ${RATING_LABELS[b.rating - 1]}`}
      className="relative shrink-0 rounded-t-md border-2 border-b-0 border-edge transition-transform duration-150 ease-out hover:-translate-y-1.5 focus-visible:-translate-y-1.5 focus-visible:outline-none"
      style={{ width: b.width, height: h, background: base, opacity: b.success ? 1 : 0.75 }}
    >
      {/* 위·아래 띠 */}
      <span className="absolute inset-x-[5px] top-[9px] h-[3px] rounded-full" style={{ background: foil }} />
      <span className="absolute inset-x-[5px] bottom-[9px] h-[3px] rounded-full" style={{ background: foil, opacity: 0.6 }} />
      {/* 제목(세로) */}
      <span
        className="absolute left-1/2 top-[20px] -translate-x-1/2 whitespace-nowrap text-[12px] font-extrabold leading-none"
        style={{ writingMode: "vertical-rl", color: b.legend ? "#1D1D1D" : "#F5F0E6", letterSpacing: "0.02em" }}
      >
        {spineTitle(b.title, h + 6)}
      </span>
      {b.legend && (
        <span className="absolute bottom-[16px] left-1/2 -translate-x-1/2 text-[11px] leading-none">🏆</span>
      )}
    </button>
  );
}

// 책을 꺼냈을 때: 사이트 카드 모양
function BookCard({ book: b, onClose }: { book: Book; onClose: () => void }) {
  const r = b.record;
  const guest = r.id.startsWith("guest-");
  return (
    <div className="shelf-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center" onClick={onClose}>
      <article
        role="dialog"
        aria-modal="true"
        aria-label={b.title}
        onClick={(e) => e.stopPropagation()}
        className="shelf-card w-full max-w-sm overflow-hidden rounded-2xl border-2 border-edge bg-panel shadow-cute"
      >
        <div className="flex items-center gap-2 border-b-2 border-edge px-5 py-3" style={{ background: b.cloth.base }}>
          <span className="text-xs font-extrabold" style={{ color: b.cloth.foil }}>
            {r.genre}
          </span>
          <span className="text-xs font-bold" style={{ color: b.legend ? "#1D1D1D" : "#F5F0E6", opacity: 0.8 }}>
            {b.playedAt.replace(/-/g, ". ")}
          </span>
        </div>
        <div className="px-5 pb-5 pt-4">
          <h3 className="text-xl leading-snug">{b.title}</h3>
          <p className="mt-0.5 text-sm text-cream/70">{b.cafe}</p>

          <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
            <Cell label="평가" value={RATING_LABELS[b.rating - 1]} strong={b.legend} />
            <Cell label="결과" value={r.success ? "탈출" : "실패"} />
            <Cell label="힌트" value={`${r.hintCount ?? 0}개`} />
          </dl>

          {r.oneLiner && <p className="mt-4 rounded-xl bg-ink px-3 py-2.5 text-sm leading-relaxed">“{r.oneLiner}”</p>}

          <div className="mt-4 flex gap-2">
            <Link
              href={guest ? "/login?mode=signup&guest=1&next=/records" : `/edit/${r.id}`}
              className="rough flex-1 rounded-xl border-2 border-edge bg-candy py-2.5 text-center text-sm font-extrabold text-edge shadow-cute transition active:scale-[0.98]"
            >
              {guest ? "가입하고 수정하기" : "기록 펼쳐 보기"}
            </Link>
            <button
              type="button"
              autoFocus
              onClick={onClose}
              className="rough rounded-xl border-2 border-edge bg-panel px-4 py-2.5 text-sm font-extrabold transition active:scale-[0.98]"
            >
              닫기
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

function Cell({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-xl border-2 border-edge/15 bg-ink py-2">
      <dt className="text-[11px] font-bold text-cream/70">{label}</dt>
      <dd className={`mt-0.5 text-sm font-extrabold ${strong ? "text-candy" : ""}`}>{value}</dd>
    </div>
  );
}
