"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getRecords,
  getGuestRecords,
  GENRES,
  type EscapeRecord,
  type Genre,
} from "@/lib/store";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { RATING_LABELS } from "@/lib/terms";
import RecordCard from "@/components/RecordCard";
import Loader from "@/components/Loader";
import DiaryView from "@/components/DiaryView";
import CalendarView from "@/components/CalendarView";
import BookshelfView from "@/components/BookshelfView";
import InstallHint from "@/components/InstallHint";
import YearRecapCard from "@/components/YearRecapCard";
import { nextMilestone, playNumbers } from "@/lib/diary";
import { shelfStats } from "@/lib/bookshelf";

type View = "calendar" | "shelf" | "diary" | "list";
const VIEWS: View[] = ["calendar", "shelf", "diary", "list"];
const VIEW_KEY = "escapelog:records:view";

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
  // 가입 전: 이 기기에 써 둔 기록을 그대로 보여 준다(달력·다이어리·결산까지)
  const [guest, setGuest] = useState(false);

  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<Genre | "전체">("전체");
  const [result, setResult] = useState<Result>("전체");
  const [themeType, setThemeType] = useState<ThemeType>("전체");
  const [rating, setRating] = useState(0); // 0=전체, 1~5=등급
  const [sort, setSort] = useState<Sort>("recent");
  const [view, setView] = useState<View>("calendar");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(VIEW_KEY) as View | null;
      if (saved && VIEWS.includes(saved)) setView(saved);
    } catch {
      // 기본값(달력) 유지
    }
  }, []);

  function changeView(v: View) {
    setView(v);
    try {
      window.localStorage.setItem(VIEW_KEY, v);
    } catch {
      // 무시
    }
  }

  useEffect(() => {
    async function load() {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          const local = getGuestRecords();
          if (local.length === 0) {
            router.replace("/login?next=/records");
            return;
          }
          setGuest(true);
          setRecords(local);
          setReady(true);
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

  // 전체 기록 기준 번호(필터와 무관하게 "N번째 방"이 고정)
  const numbers = useMemo(() => playNumbers(records), [records]);
  const milestone = nextMilestone(records.length);
  const stats = useMemo(() => shelfStats(records), [records]);
  // 켜 둔 필터 개수(정렬은 세지 않는다)
  const activeFilters =
    (genre !== "전체" ? 1 : 0) + (result !== "전체" ? 1 : 0) + (themeType !== "전체" ? 1 : 0) + (rating ? 1 : 0) + (query.trim() ? 1 : 0);

  function clearFilters() {
    setQuery("");
    setGenre("전체");
    setResult("전체");
    setThemeType("전체");
    setRating(0);
  }

  if (!ready) return <Loader />;

  if (records.length === 0) {
    return (
      <div>
        <h1 className="text-[22px] leading-tight">내 기록</h1>
        <div className="flex flex-col items-center py-16 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mascot.png" alt="" className="h-24 w-24 object-contain" />
          <p className="mt-4 text-[15px] text-cream/70">다녀온 방을 하나 적으면 여기에 포스터가 쌓여요.</p>
          <Link href="/new" className="mt-5 rounded-xl bg-candy px-6 py-3.5 text-[15px] font-extrabold text-[#1D1D1D] border-[2px] border-[#1D1D1D] shadow-[3px_3px_0_0_#1D1D1D]">
            첫 기록 남기기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] leading-tight">내 기록</h1>
        {activeFilters > 0 && (
          <span className="text-[13px] tabular-nums text-cream/70">
            {records.length}개 중 {filtered.length}개
          </span>
        )}
      </div>

      <dl className="mt-3 flex border-y border-line">
        {(
          [
            ["다녀온 방", stats.total],
            ["인생테마", stats.legends],
            ["탈출 성공", stats.escaped],
          ] as [string, number][]
        ).map(([label, value], i) => (
          <div key={label} className={`flex-1 py-3.5 ${i ? "border-l border-line pl-4" : ""}`}>
            <dt className="text-[13px] text-cream/70">{label}</dt>
            <dd className="mt-0.5 text-[22px] font-extrabold leading-tight tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <YearRecapCard
        records={records}
        note={
          milestone ? (
            <>
              다음 기념까지 <b className="font-extrabold text-cream">{milestone.left}방</b> ({milestone.next}번째 방)
            </>
          ) : undefined
        }
      />

      {guest && (
        <div className="mt-2 flex items-center gap-3 rounded-xl bg-[#FFF3E6] px-3.5 py-3">
          <p className="min-w-0 flex-1 text-[13px] leading-snug [word-break:keep-all]">
            <b className="font-extrabold">이 기록은 지금 이 기기에만 있어요.</b> 10초 가입하면 폰을 바꿔도 남고, 수정도 할 수 있어요.
          </p>
          <Link
            href="/login?mode=signup&guest=1&next=/records"
            className="shrink-0 rounded-lg bg-candy px-3 py-2 text-[13px] font-extrabold text-[#1D1D1D] transition-opacity duration-200 active:opacity-80 border-[2px] border-[#1D1D1D] shadow-[3px_3px_0_0_#1D1D1D]"
          >
            가입하기
          </Link>
        </div>
      )}
      <div className="mt-2 empty:hidden">
        <InstallHint />
      </div>

      <div className="mt-2 flex items-end justify-between border-b border-line">
        <div className="flex gap-[18px]" role="tablist" aria-label="보기 방식">
          {(
            [
              ["calendar", "달력"],
              ["shelf", "서재"],
              ["diary", "다이어리"],
              ["list", "목록"],
            ] as [View, string][]
          ).map(([v, label]) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => changeView(v)}
              className={`min-h-[44px] pb-2.5 pt-3 text-[15px] font-extrabold transition-colors duration-200 ${
                view === v ? "text-cream shadow-[0_2px_0_#17171A]" : "text-cream/70 hover:text-cream"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setFilterOpen((v) => !v)}
          aria-expanded={filterOpen}
          aria-controls="record-filters"
          className={`flex min-h-[44px] items-center gap-1.5 pb-2.5 pt-3 text-[13px] ${
            filterOpen || activeFilters ? "font-extrabold text-cream" : "text-cream/70"
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden>
            <path d="M4 7h16M7 12h10M10 17h4" />
          </svg>
          필터
          {activeFilters > 0 && (
            <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-candy px-1 text-[11px] font-extrabold leading-none text-[#1D1D1D]">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {filterOpen && (
        <div id="record-filters" className="space-y-3 border-b border-line py-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="테마, 매장 이름으로 찾기"
            aria-label="테마, 매장 이름으로 찾기"
            className="w-full rounded-xl bg-ink px-3.5 py-2.5 text-sm outline-none placeholder:text-cream/70 focus:ring-2 focus:ring-edge"
          />

          <FilterRow label="장르">
            <Chip on={genre === "전체"} onClick={() => setGenre("전체")}>
              전체
            </Chip>
            {GENRES.map((g) => (
              <Chip key={g} on={genre === g} onClick={() => setGenre(g)}>
                {g}
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
              <Chip key={label} on={rating === i + 1} onClick={() => setRating(i + 1)}>
                {label}
              </Chip>
            ))}
          </FilterRow>

          {view === "list" && (
            <FilterRow label="정렬">
              {SORTS.map((s) => (
                <Chip key={s.key} on={sort === s.key} onClick={() => setSort(s.key)}>
                  {s.label}
                </Chip>
              ))}
            </FilterRow>
          )}

          {activeFilters > 0 && (
            <button onClick={clearFilters} className="text-[13px] text-cream/70 underline underline-offset-2">
              필터 모두 지우기
            </button>
          )}
        </div>
      )}

      <div className="mt-4">
        {filtered.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-sm text-cream/70">조건에 맞는 기록이 없어요</p>
            <button onClick={clearFilters} className="mt-3 rounded-xl border border-line px-4 py-2.5 text-sm font-extrabold">
              필터 모두 지우기
            </button>
          </div>
        ) : view === "calendar" ? (
          <CalendarView records={filtered} numbers={numbers} />
        ) : view === "shelf" ? (
          <BookshelfView records={filtered} />
        ) : view === "diary" ? (
          <DiaryView records={filtered} numbers={numbers} />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => (
              <RecordCard key={r.id} record={r} number={numbers.get(r.id)} />
            ))}
          </div>
        )}
      </div>

      {/* 떠 있는 '기록하기': 휴대폰에서는 아래 탭 메뉴 위 */}
      <Link
        href="/new"
        className="fixed bottom-[88px] right-4 z-20 rounded-full bg-candy px-[18px] py-3 text-[15px] font-extrabold text-edge shadow-float transition-opacity duration-200 active:opacity-80 sm:bottom-8 sm:right-8"
      >
        + 기록하기
      </Link>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 shrink-0 text-xs text-cream/70">{label}</span>
      <div className="no-scrollbar -mr-4 flex flex-nowrap gap-1.5 overflow-x-auto pr-4 sm:mr-0 sm:flex-wrap sm:pr-0">{children}</div>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] transition-colors duration-200 ${
        on ? "bg-candy font-extrabold text-[#1D1D1D]" : "bg-ink text-cream/70 hover:text-cream"
      } border-[2px] border-[#1D1D1D] shadow-[3px_3px_0_0_#1D1D1D]`}
    >
      {children}
    </button>
  );
}
