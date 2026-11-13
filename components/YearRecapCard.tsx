"use client";

import { useMemo, useState } from "react";
import type { EscapeRecord } from "@/lib/store";
import { recapShareText, recapYear, yearRecap } from "@/lib/diary";
import { SITE_URL } from "@/lib/site";

// 올해의 방탈출 결산. 평소에는 한 줄("2026년 결산 보기")로 접혀 있고, 누르면 펼쳐진다. 공유는 펼친 안에.
// note: 줄 왼쪽에 같이 보여 줄 짧은 안내(다음 기념까지 몇 방 등).
export default function YearRecapCard({ records, note }: { records: EscapeRecord[]; note?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const year = useMemo(() => recapYear(records, new Date()), [records]);
  const recap = useMemo(() => (year ? yearRecap(records, year) : null), [records, year]);

  if (!recap || recap.count === 0) {
    return note ? <p className="pt-3 text-[13px] text-cream/70">{note}</p> : null;
  }

  async function share() {
    if (!recap) return;
    const text = recapShareText(recap, SITE_URL);
    try {
      if (navigator.share) {
        await navigator.share({ title: `${recap.year} 방탈출 결산`, text });
        return;
      }
    } catch {
      // 공유 창을 닫은 경우 → 복사로
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 무시
    }
  }

  const life = recap.lifeThemes[0];
  const lines: [string, string][] = [];
  if (life) lines.push(["올해의 인생테마", `${life.themeName}${recap.lifeThemes.length > 1 ? ` 외 ${recap.lifeThemes.length - 1}개` : ""}`]);
  if (recap.busiestMonth && recap.busiestMonth.count > 1)
    lines.push(["제일 바빴던 달", `${recap.busiestMonth.month}월 (${recap.busiestMonth.count}방)`]);
  if (recap.firstOfYear) lines.push(["올해 첫 방", recap.firstOfYear.themeName]);
  if (recap.regions.length > 0) lines.push(["다녀온 지역", recap.regions.join(" · ")]);

  return (
    <section aria-label={`${recap.year}년 결산`}>
      <div className="flex min-h-[44px] items-center justify-between gap-3 pt-1 text-[13px]">
        <span className="min-w-0 truncate text-cream/70">{note}</span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-h-[44px] shrink-0 items-center gap-1 font-extrabold"
        >
          {recap.year}년 결산 {open ? "접기" : "보기"}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="rounded-xl bg-ink p-4">
          <h2 className="text-[17px]">
            {recap.year}년, {recap.count}방
          </h2>
          <dl className="mt-3 grid grid-cols-4 divide-x divide-line text-center">
            <Cell label="성공률" value={`${recap.successRate}%`} />
            <Cell label="노힌트" value={`${recap.noHint}번`} />
            <Cell label="최애 장르" value={recap.topGenre ? recap.topGenre.genre : "–"} />
            <Cell label="지역" value={recap.regions.length ? `${recap.regions.length}곳` : "–"} />
          </dl>
          {lines.length > 0 && (
            <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-[13px]">
              {lines.map(([k, v]) => (
                <div key={k} className="flex gap-3">
                  <dt className="w-24 shrink-0 text-cream/70">{k}</dt>
                  <dd className="min-w-0 flex-1 font-extrabold [word-break:keep-all]">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          <button
            type="button"
            onClick={share}
            className="mt-4 w-full rounded-xl bg-edge py-3 text-sm font-extrabold text-white transition-opacity duration-200 active:opacity-80"
          >
            {copied ? "복사했어요" : "결산 공유하기"}
          </button>
        </div>
      )}
    </section>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-1">
      <dt className="text-[11px] text-cream/70">{label}</dt>
      <dd className="mt-0.5 truncate text-[15px] font-extrabold tabular-nums">{value}</dd>
    </div>
  );
}
