"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { EscapeRecord } from "@/lib/store";
import { RATING_LABELS } from "@/lib/terms";
import { packRows, shelfStats, shelvesByYear, spineTitle, SHELF_INNER, type Book } from "@/lib/bookshelf";

// 내 서재: 기록 하나가 책 한 권. 해마다 한 칸, 책을 누르면 그날의 기록이 열린다.
// 톤: 밤의 서재(짙은 호두나무 + 금박 + 따뜻한 조명). 장난감 같지 않게 절제.

const SERIF = '"Nanum Myeongjo", "Noto Serif KR", "AppleMyungjo", serif';
const PAD = 22; // 선반 안쪽 좌우 여백

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
    <section
      ref={wrap}
      aria-label="내 서재"
      className="relative overflow-hidden rounded-[22px] text-[#EFE6D2]"
      style={{
        background:
          "radial-gradient(120% 70% at 50% -10%, rgba(255,214,150,.18), transparent 60%), linear-gradient(180deg,#22170F 0%,#1A110B 100%)",
        boxShadow: "0 24px 60px -24px rgba(29,20,12,.55), inset 0 0 0 1px rgba(232,198,110,.18)",
      }}
    >
      {/* 머리말 */}
      <header className="flex flex-wrap items-end justify-between gap-3 px-6 pb-4 pt-6 sm:px-8">
        <div>
          <p className="text-[11px] font-bold tracking-[0.32em] text-[#C9A96A]/80">MY ESCAPE LIBRARY</p>
          <h2 className="mt-1 text-[26px] leading-tight text-[#F3E9D2]" style={{ fontFamily: SERIF, fontWeight: 800 }}>
            나의 서재
          </h2>
        </div>
        <dl className="flex gap-5 text-right">
          <Stat label="소장" value={`${stats.total}권`} />
          <Stat label="인생테마" value={`${stats.legends}권`} gold />
          <Stat label="탈출 성공" value={`${stats.escaped}번`} />
        </dl>
      </header>
      <div className="mx-6 h-px bg-gradient-to-r from-transparent via-[#C9A96A]/40 to-transparent sm:mx-8" />

      {/* 선반 */}
      <div className="space-y-2 px-3 pb-6 pt-4 sm:px-5">
        {shelves.map(({ year, books }) => {
          const rows = packRows(books, Math.max(160, width - (width < 640 ? 24 : 40) - PAD * 2), 3);
          return (
            <div key={year}>
              <div className="flex items-center gap-3 px-3 pb-1 pt-3">
                <span
                  className="rounded-[3px] px-2.5 py-0.5 text-[12px] font-bold tracking-[0.2em] text-[#2A1C10]"
                  style={{ background: "linear-gradient(180deg,#E9CF8E,#B98E45)", boxShadow: "0 1px 0 rgba(255,255,255,.35) inset, 0 2px 6px rgba(0,0,0,.35)" }}
                >
                  {year}
                </span>
                <span className="text-[12px] text-[#EFE6D2]/45">{books.length}권</span>
              </div>
              {rows.map((row, i) => (
                <Shelf key={i} row={row} onOpen={setOpen} />
              ))}
            </div>
          );
        })}
      </div>

      {open && <BookCard book={open} onClose={() => setOpen(null)} />}
    </section>
  );
}

function Stat({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div>
      <dt className="text-[10px] font-bold tracking-[0.2em] text-[#EFE6D2]/45">{label}</dt>
      <dd className={`text-lg font-extrabold tabular-nums ${gold ? "text-[#E8C66E]" : "text-[#F3E9D2]"}`}>{value}</dd>
    </div>
  );
}

function Shelf({ row, onOpen }: { row: Book[]; onOpen: (b: Book) => void }) {
  return (
    <div className="relative" style={{ paddingLeft: PAD, paddingRight: PAD }}>
      {/* 선반 안쪽 벽(그늘) */}
      <div
        className="pointer-events-none absolute inset-x-1 top-0 rounded-t-md"
        style={{ height: SHELF_INNER + 10, background: "linear-gradient(180deg, rgba(0,0,0,.45), rgba(0,0,0,.15) 40%, rgba(0,0,0,.35))" }}
      />
      <div className="relative flex items-end gap-[3px]" style={{ height: SHELF_INNER }}>
        {row.map((b) => (
          <Spine key={b.id} book={b} onOpen={onOpen} />
        ))}
      </div>
      {/* 선반 판 */}
      <div
        className="relative -mx-[18px] h-[14px] rounded-[3px]"
        style={{
          background: "linear-gradient(180deg,#7A5434 0%,#5C3D24 45%,#3E2817 100%)",
          boxShadow: "0 1px 0 rgba(255,220,170,.25) inset, 0 10px 16px -6px rgba(0,0,0,.7)",
        }}
      />
    </div>
  );
}

function Spine({ book: b, onOpen }: { book: Book; onOpen: (b: Book) => void }) {
  const { base, shade, foil } = b.cloth;
  return (
    <button
      type="button"
      onClick={() => onOpen(b)}
      title={`${b.title} · ${b.cafe}`}
      aria-label={`${b.title}, ${b.playedAt}, ${RATING_LABELS[b.rating - 1]}`}
      className="group relative shrink-0 origin-bottom rounded-t-[3px] transition-transform duration-200 ease-out hover:-translate-y-2 focus-visible:-translate-y-2 focus-visible:outline-none"
      style={{
        width: b.width,
        height: b.height,
        background: `linear-gradient(90deg, ${shade} 0%, ${base} 18%, ${base} 70%, ${shade} 100%)`,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,.06), 2px 0 3px rgba(0,0,0,.35)",
        opacity: b.success ? 1 : 0.82,
      }}
    >
      {/* 천 결 */}
      <span
        className="pointer-events-none absolute inset-0 rounded-t-[3px] opacity-25 mix-blend-overlay"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,.18) 0 1px, transparent 1px 3px)" }}
      />
      {/* 위·아래 금박 띠 */}
      <Band top={10} color={foil} />
      <Band top={16} color={foil} thin />
      <Band bottom={18} color={foil} thin />
      <Band bottom={24} color={foil} />
      {/* 제목(세로) */}
      <span
        className="absolute left-1/2 top-[26px] -translate-x-1/2 whitespace-nowrap text-[13px] leading-none tracking-[0.06em]"
        style={{
          writingMode: "vertical-rl",
          fontFamily: SERIF,
          fontWeight: 800,
          color: foil,
          textShadow: b.legend ? "0 0 6px rgba(232,198,110,.45)" : "0 1px 0 rgba(0,0,0,.35)",
        }}
      >
        {spineTitle(b.title, b.height)}
      </span>
      {/* 인생테마: 금박 별 + 리본 책갈피 */}
      {b.legend && (
        <>
          <span className="absolute bottom-[30px] left-1/2 -translate-x-1/2 text-[10px]" style={{ color: foil }}>
            ✦
          </span>
          <span
            className="absolute -top-1 right-[7px] w-[6px] rounded-b-[1px]"
            style={{ height: 24, background: "linear-gradient(180deg,#9E2B2B,#7A1E1E)", clipPath: "polygon(0 0,100% 0,100% 100%,50% 82%,0 100%)" }}
          />
        </>
      )}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-2 rounded-t-[3px] bg-white/10 opacity-0 transition group-hover:opacity-100" />
    </button>
  );
}

function Band({ top, bottom, color, thin }: { top?: number; bottom?: number; color: string; thin?: boolean }) {
  return (
    <span
      className="pointer-events-none absolute inset-x-[5px]"
      style={{ top, bottom, height: thin ? 1 : 2, background: color, opacity: thin ? 0.55 : 0.85 }}
    />
  );
}

// 책을 꺼냈을 때: 표지 안쪽 같은 카드
function BookCard({ book: b, onClose }: { book: Book; onClose: () => void }) {
  const r = b.record;
  const guest = r.id.startsWith("guest-");
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 backdrop-blur-[2px] sm:items-center" onClick={onClose}>
      <article
        role="dialog"
        aria-label={b.title}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm overflow-hidden rounded-[18px] text-[#2A2118]"
        style={{ background: "linear-gradient(180deg,#FBF6EA,#F3EADA)", boxShadow: "0 30px 80px -20px rgba(0,0,0,.6)" }}
      >
        <div className="h-2" style={{ background: `linear-gradient(90deg, ${b.cloth.shade}, ${b.cloth.base}, ${b.cloth.shade})` }} />
        <div className="px-6 pb-6 pt-5">
          <p className="text-[11px] font-bold tracking-[0.24em] text-[#8A7458]">
            {b.playedAt.replace(/-/g, ". ")} · {r.genre}
          </p>
          <h3 className="mt-2 text-[24px] leading-snug" style={{ fontFamily: SERIF, fontWeight: 800 }}>
            {b.title}
          </h3>
          <p className="mt-1 text-sm text-[#6B5B48]">{b.cafe}</p>

          <div className="my-4 h-px bg-[#2A2118]/12" />

          <dl className="grid grid-cols-3 gap-2 text-center">
            <Cell label="평가" value={RATING_LABELS[b.rating - 1]} strong={b.legend} />
            <Cell label="결과" value={r.success ? "탈출" : "실패"} />
            <Cell label="힌트" value={`${r.hintCount ?? 0}개`} />
          </dl>

          {r.oneLiner && (
            <p className="mt-4 border-l-2 border-[#C9A96A] pl-3 text-[15px] leading-relaxed" style={{ fontFamily: SERIF }}>
              {r.oneLiner}
            </p>
          )}

          <div className="mt-5 flex gap-2">
            <Link
              href={guest ? "/login?mode=signup&guest=1&next=/records" : `/edit/${r.id}`}
              className="flex-1 rounded-xl bg-[#2A2118] py-2.5 text-center text-sm font-bold text-[#F3E9D2] transition active:scale-[0.98]"
            >
              {guest ? "가입하고 수정하기" : "기록 펼쳐 보기"}
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#2A2118]/20 px-4 py-2.5 text-sm font-bold transition active:scale-[0.98]"
            >
              꽂아 두기
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

function Cell({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-lg bg-white/60 py-2">
      <dt className="text-[10px] font-bold tracking-[0.18em] text-[#8A7458]">{label}</dt>
      <dd className={`mt-0.5 text-sm font-extrabold ${strong ? "text-[#9A6B12]" : ""}`}>{value}</dd>
    </div>
  );
}
