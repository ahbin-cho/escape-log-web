"use client";

import { useMemo, useState } from "react";
import { GENRE_EMOJI, type EscapeRecord } from "@/lib/store";
import { recapShareText, recapYear, yearRecap } from "@/lib/diary";
import { SITE_URL } from "@/lib/site";

// 올해의 방탈출 결산 카드 + 공유. 연말에 단톡방·SNS로 퍼지게 하는 장치.
export default function YearRecapCard({ records }: { records: EscapeRecord[] }) {
  const [copied, setCopied] = useState(false);
  const year = useMemo(() => recapYear(records, new Date()), [records]);
  const recap = useMemo(
    () => (year ? yearRecap(records, year) : null),
    [records, year]
  );
  if (!recap || recap.count === 0) return null;

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

  return (
    <section className="rough space-y-4 rounded-2xl border-2 border-edge bg-grape/10 p-5 shadow-cute">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-cream/60">나의 방탈출 결산</p>
          <h2 className="text-xl font-extrabold">📓 {recap.year}년, {recap.count}방</h2>
        </div>
        <button
          type="button"
          onClick={share}
          className="shrink-0 rounded-xl border-2 border-edge bg-grape px-3 py-2 text-sm font-bold text-white shadow-cute transition active:scale-[0.97]"
        >
          {copied ? "복사됨! 📋" : "📣 결산 공유"}
        </button>
      </div>

      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Cell label="탈출 성공률" value={`${recap.successRate}%`} />
        <Cell label="노힌트 탈출" value={`${recap.noHint}번`} />
        <Cell
          label="최애 장르"
          value={
            recap.topGenre
              ? `${GENRE_EMOJI[recap.topGenre.genre]} ${recap.topGenre.genre}`
              : "–"
          }
        />
        <Cell
          label="원정 지역"
          value={recap.regions.length ? `${recap.regions.length}곳` : "–"}
        />
      </dl>

      <ul className="space-y-1 text-sm text-cream/80">
        {life && (
          <li>
            🏆 올해의 인생테마 <b>{life.themeName}</b>
            {recap.lifeThemes.length > 1 ? ` 외 ${recap.lifeThemes.length - 1}개` : ""}
          </li>
        )}
        {recap.busiestMonth && recap.busiestMonth.count > 1 && (
          <li>
            🔥 제일 바빴던 달 <b>{recap.busiestMonth.month}월</b> ({recap.busiestMonth.count}방)
          </li>
        )}
        {recap.firstOfYear && (
          <li>
            🚪 올해 첫 방 <b>{recap.firstOfYear.themeName}</b>
          </li>
        )}
        {recap.regions.length > 0 && (
          <li>📍 {recap.regions.join(" · ")}</li>
        )}
      </ul>
    </section>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border-2 border-edge/30 bg-panel px-3 py-2">
      <dt className="text-[11px] font-bold text-cream/55">{label}</dt>
      <dd className="text-lg font-extrabold tabular-nums">{value}</dd>
    </div>
  );
}
