"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getRecords,
  GENRES,
  GENRE_EMOJI,
  type EscapeRecord,
  type Genre,
} from "@/lib/store";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import RecordCard from "@/components/RecordCard";
import ImportBanner from "@/components/ImportBanner";
import FeedPreview from "@/components/FeedPreview";
import LoggedOutCTA from "@/components/LoggedOutCTA";
import LoggedInHero from "@/components/LoggedInHero";
import HomeRegionThemes from "@/components/HomeRegionThemes";
import Loader from "@/components/Loader";

export default function HomePage() {
  const [records, setRecords] = useState<EscapeRecord[]>([]);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<Genre | "전체">("전체");
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    getRecords().then((r) => {
      setRecords(r);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoggedIn(false);
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setLoggedIn(!!s?.user);
      // 로그인/로그아웃 시 내 기록 갱신(로그아웃하면 [] → 잔상 제거)
      getRecords().then(setRecords);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchGenre = genre === "전체" || r.genre === genre;
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        r.themeName.toLowerCase().includes(q) ||
        r.cafeName.toLowerCase().includes(q);
      return matchGenre && matchQuery;
    });
  }, [records, query, genre]);

  if (!ready) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <LoggedOutCTA />
      {loggedIn === true && <LoggedInHero records={records} />}
      <ImportBanner />
      <HomeRegionThemes />
      {/* {loggedIn === false && <HomeRegionThemes />} */}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link
          href="/quiz"
          className="rough rounded-2xl border-2 border-edge bg-candy px-3 py-3 text-center text-sm font-extrabold text-white shadow-cute transition active:scale-[0.97]"
        >
          🔮 취향 찾기
        </Link>
        <Link
          href="/region"
          className="rough rounded-2xl border-2 border-edge bg-panel px-3 py-3 text-center text-sm font-extrabold shadow-cute transition active:scale-[0.97]"
        >
          🗺️ 지역 분포
        </Link>
        <Link
          href="/taste"
          className="rough rounded-2xl border-2 border-edge bg-panel px-3 py-3 text-center text-sm font-extrabold shadow-cute transition active:scale-[0.97]"
        >
          🎀 취향 분석
        </Link>
        <Link
          href="/match"
          className="rough rounded-2xl border-2 border-edge bg-panel px-3 py-3 text-center text-sm font-extrabold shadow-cute transition active:scale-[0.97]"
        >
          💞 친구 궁합
        </Link>
      </div>

      <FeedPreview />

      <div className="space-y-3 border-t-2 border-edge/15 pt-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-extrabold">📓 내 기록</h2>
          <span className="text-xs font-bold text-cream/60">
            {records.length}개
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="테마 · 매장 검색"
            className="w-full rounded-xl border-2 border-edge bg-panel px-4 py-2.5 text-sm font-bold outline-none placeholder:text-cream/45 focus:border-candy"
          />
          <div className="flex flex-wrap gap-1.5">
            {(["전체", ...GENRES] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`rough-sm rounded-full border px-3 py-1.5 text-sm font-bold transition active:scale-[0.97] ${
                  genre === g
                    ? "border-candy bg-candy/10 text-candy"
                    : "border-edge/20 bg-panel text-cream/60 hover:border-edge/40"
                }`}
              >
                {g === "전체" ? "전체" : `${GENRE_EMOJI[g as Genre]} ${g}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-edge/40 bg-panel py-16 text-center">
          <p className="text-sm text-cream/60">아직 기록이 없습니다</p>
          <Link
            href="/new"
            className="rough mt-3 inline-block rounded-xl border-2 border-edge bg-candy px-4 py-2 text-sm font-bold text-white shadow-cute transition active:scale-[0.97]"
          >
            첫 기록 추가하기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <RecordCard key={r.id} record={r} />
          ))}
        </div>
      )}
    </div>
  );
}
