"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getRecords,
  getCatalog,
  computeTaste,
  recommend,
  GENRE_EMOJI,
  GENRES,
  type EscapeRecord,
  type CandidateTheme,
} from "@/lib/store";
import { inferRegion } from "@/lib/region";
import RecommendCard from "@/components/RecommendCard";

export default function TastePage() {
  const [records, setRecords] = useState<EscapeRecord[]>([]);
  const [catalog, setCatalog] = useState<CandidateTheme[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([getRecords(), getCatalog()]).then(([r, c]) => {
      setRecords(r);
      setCatalog(c);
      setReady(true);
    });
  }, []);

  const taste = useMemo(() => computeTaste(records), [records]);
  const recs = useMemo(
    () => recommend(catalog, taste, records.map((r) => r.themeName)),
    [catalog, records, taste]
  );

  // 방탈 뱃지: 졸업(매장 전 테마 클리어) · 원정(주지역 밖) · 노힌트 · 인생테마
  const badges = useMemo(() => {
    const regionCount = new Map<string, number>();
    records.forEach((r) => {
      const rr = inferRegion(r);
      if (rr) regionCount.set(rr, (regionCount.get(rr) ?? 0) + 1);
    });
    let home = "";
    let max = 0;
    regionCount.forEach((c, reg) => {
      if (c > max) {
        max = c;
        home = reg;
      }
    });
    const away = new Set<string>();
    records.forEach((r) => {
      const rr = inferRegion(r);
      if (rr && rr !== home) away.add(rr);
    });

    // 졸업: 카탈로그 매장별 테마셋이 내 클리어 테마셋에 모두 포함
    const catByCafe = new Map<string, Set<string>>();
    catalog.forEach((t) => {
      const c = (t.cafe || "").trim();
      if (!catByCafe.has(c)) catByCafe.set(c, new Set());
      catByCafe.get(c)!.add((t.name || "").trim());
    });
    const clearedByCafe = new Map<string, Set<string>>();
    records
      .filter((r) => r.success)
      .forEach((r) => {
        const c = (r.cafeName || "").trim();
        if (!clearedByCafe.has(c)) clearedByCafe.set(c, new Set());
        clearedByCafe.get(c)!.add((r.themeName || "").trim());
      });
    const graduated: string[] = [];
    catByCafe.forEach((themes, cafe) => {
      if (themes.size === 0) return;
      const cleared = clearedByCafe.get(cafe);
      if (cleared && [...themes].every((t) => cleared.has(t))) graduated.push(cafe);
    });

    return {
      home,
      away: away.size,
      graduated,
      noHint: records.filter((r) => r.success && r.hintCount === 0).length,
      lifeThemes: records.filter((r) => Math.round(r.rating) === 5).length,
    };
  }, [records, catalog]);

  if (!ready) {
    return <p className="py-20 text-center text-cream/55">불러오는 중…</p>;
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-xl font-extrabold">취향 프로필</h1>
        {records.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-edge/40 bg-panel py-12 text-center">
            <p className="text-sm text-cream/60">기록이 쌓이면 취향을 분석해드립니다</p>
            <Link
              href="/new"
              className="rough mt-3 inline-block rounded-xl border-2 border-edge bg-candy px-4 py-2 text-sm font-bold text-white shadow-cute transition active:scale-[0.97]"
            >
              첫 기록 남기기
            </Link>
          </div>
        ) : (
          <div className="rough rounded-2xl border-2 border-edge bg-panel p-6 shadow-cute">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Cell
                value={taste.topGenre ? `${GENRE_EMOJI[taste.topGenre]} ${taste.topGenre}` : "-"}
                label="최애 장르"
              />
              <Cell value={`${taste.fearComfort}`} label="선호 공포도" />
              <Cell value={`${taste.difficultyFit}`} label="선호 난이도" />
              <Cell value={`${taste.count}`} label="인생방 (4+)" />
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {GENRES.filter((g) => taste.genreCounts[g] > 0).map((g) => (
                <span
                  key={g}
                  className="rounded-lg border border-edge/30 bg-ink px-2.5 py-1 text-xs font-bold text-cream/70"
                >
                  {GENRE_EMOJI[g]} {g} {taste.genreCounts[g]}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {records.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-extrabold">🎖️ 방탈 뱃지</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Badge emoji="🎓" value={badges.graduated.length} label="졸업 지점" />
            <Badge emoji="✈️" value={badges.away} label="원정 지역" />
            <Badge emoji="🚫" value={badges.noHint} label="노힌트 클리어" />
            <Badge emoji="🏆" value={badges.lifeThemes} label="인생테마" />
          </div>
          {badges.graduated.length > 0 && (
            <p className="text-xs font-bold text-cream/60">
              🎓 졸업: {badges.graduated.join(" · ")}
            </p>
          )}
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-extrabold">추천</h2>
          <span className="text-xs text-cream/55">스포 수위는 카드마다 조절 가능</span>
        </div>
        {recs.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-edge/40 bg-panel py-10 text-center text-sm text-cream/60">
            추천할 새 방이 없습니다
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {recs.map((r) => (
              <RecommendCard key={r.id} rec={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Cell({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="text-center">
      <div className="text-lg font-extrabold">{value}</div>
      <div className="mt-0.5 text-xs text-cream/60">{label}</div>
    </div>
  );
}

function Badge({
  emoji,
  value,
  label,
}: {
  emoji: string;
  value: number;
  label: string;
}) {
  const on = value > 0;
  return (
    <div
      className={`rounded-2xl border-2 p-3 text-center ${
        on ? "border-edge bg-panel" : "border-edge/20 bg-panel opacity-50"
      }`}
    >
      <div className="text-2xl">{emoji}</div>
      <div className="mt-1 text-lg font-extrabold text-candy">{value}</div>
      <div className="text-[11px] font-bold text-cream/60">{label}</div>
    </div>
  );
}
