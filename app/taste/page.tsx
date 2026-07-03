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
