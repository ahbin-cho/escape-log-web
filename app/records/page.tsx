"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getRecords,
  GENRES,
  GENRE_EMOJI,
  type EscapeRecord,
  type Genre,
} from "@/lib/store";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { RATING_LABELS } from "@/lib/terms";
import RecordCard from "@/components/RecordCard";
import Loader from "@/components/Loader";

type Result = "전체" | "성공" | "실패";
type ThemeType = "전체" | "장치" | "자물쇠" | "문제" | "혼합";
type Sort = "recent" | "old" | "rating" | "difficulty";

const SORTS: { key: Sort; label: string }[] = [
  { key: "recent", label: "최신순" },
  { key: "old", label: "오래된순" },
  { key: "rating", label: "별점순" },
  { key: "difficulty", label: "난이도순" },
];

export default function RecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<EscapeRecord[]>([]);
  const [ready, setReady] = useState(false);

  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<Genre | "전체">("전체");
  const [result, setResult] = useState<Result>("전체");
  const [themeType, setThemeType] = useState<ThemeType>("전체");
  const [rating, setRating] = useState(0); // 0=전체, 1~5=등급
  const [sort, setSort] = useState<Sort>("recent");

  useEffect(() => {
    async function load() {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.replace("/login?next=/records");
          return;
        }
      }
      setRecords(await getRecords());
      setReady(true);
    }
    load();
  }, [router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = records.filter((r) => {
      if (genre !== "전체" && r.genre !== genre) return false;
      if (result === "성공" && !r.success) return false;
      if (result === "실패" && r.success) return false;
      if (themeType !== "전체" && r.themeType !== themeType) return false;
      if (rating && Math.round(r.rating) !== rating) return false;
      if (
        q &&
        !r.themeName.toLowerCase().includes(q) &&
        !r.cafeName.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
    const key = (r: EscapeRecord) => r.playedAt || r.createdAt || "";
    list.sort((a, b) => {
      if (sort === "recent") return key(b).localeCompare(key(a));
      if (sort === "old") return key(a).localeCompare(key(b));
      if (sort === "rating") return b.rating - a.rating;
      return b.difficulty - a.difficulty; // difficulty
    });
    return list;
  }, [records, query, genre, result, themeType, rating, sort]);

  if (!ready) return <Loader />;

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-extrabold sm:text-2xl">📓 내 기록</h1>
        <span className="text-sm font-bold text-cream/60">
          {filtered.length}/{records.length}개
        </span>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="테마 · 매장 검색"
        className="w-full rounded-xl border-2 border-edge bg-panel px-4 py-2.5 text-sm font-bold outline-none placeholder:text-cream/45 focus:border-candy"
      />

      <div className="space-y-3">
        <FilterRow label="장르">
          <Chip on={genre === "전체"} onClick={() => setGenre("전체")}>
            전체
          </Chip>
          {GENRES.map((g) => (
            <Chip key={g} on={genre === g} onClick={() => setGenre(g)}>
              {GENRE_EMOJI[g]} {g}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="결과">
          {(["전체", "성공", "실패"] as Result[]).map((r) => (
            <Chip key={r} on={result === r} onClick={() => setResult(r)}>
              {r}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="유형">
          {(["전체", "장치", "자물쇠", "문제", "혼합"] as ThemeType[]).map((t) => (
            <Chip key={t} on={themeType === t} onClick={() => setThemeType(t)}>
              {t === "전체" ? "전체" : `${t}방`}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="등급">
          <Chip on={rating === 0} onClick={() => setRating(0)}>
            전체
          </Chip>
          {RATING_LABELS.map((label, i) => (
            <Chip
              key={label}
              on={rating === i + 1}
              onClick={() => setRating(i + 1)}
            >
              {label}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="정렬">
          {SORTS.map((s) => (
            <Chip key={s.key} on={sort === s.key} onClick={() => setSort(s.key)}>
              {s.label}
            </Chip>
          ))}
        </FilterRow>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-edge/40 bg-panel py-16 text-center">
          <p className="text-sm text-cream/60">
            {records.length === 0
              ? "아직 기록이 없어요"
              : "조건에 맞는 기록이 없어요"}
          </p>
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

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-8 shrink-0 text-[11px] font-extrabold text-cream/50">
        {label}
      </span>
      <div className="no-scrollbar flex flex-nowrap gap-1 overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-bold transition active:scale-[0.97] ${
        on
          ? "border-candy bg-candy/10 text-candy"
          : "border-edge/20 bg-panel text-cream/55 hover:border-edge/40"
      }`}
    >
      {children}
    </button>
  );
}
