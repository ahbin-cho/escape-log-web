"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ThemeRow } from "@/lib/catalog-server";
import { searchThemes } from "@/lib/search";
import { brandOf } from "@/lib/cafe";
import { norm } from "@/lib/search";
import Poster from "@/components/Poster";
import { CHIP, posterSrc } from "@/lib/ui";

function SearchIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-4 w-4 shrink-0 text-cream/60"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

const MIN_BRAND_THEMES = 3; // 브랜드 페이지가 만들어지는 기준(lib/catalog-server 의 MIN_THEMES 와 같게)

const SUGGEST = ["안 무서운", "강남", "홍대", "공포", "감성", "키이스케이프"];

// 헤더의 테마 검색. 처음 열 때 테마 목록을 한 번 받아 와서, 치는 동안 바로 보여 준다.
export default function SearchButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [index, setIndex] = useState<ThemeRow[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    if (index === null) {
      fetch("/api/search-index")
        .then((r) => (r.ok ? r.json() : []))
        .then((rows: ThemeRow[]) => setIndex(rows))
        .catch(() => setIndex([]));
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index]);

  // 홈 검색창 등 다른 곳에서 열기: window.dispatchEvent(new CustomEvent("open-search", { detail: "검색어" }))
  useEffect(() => {
    const onOpen = (e: Event) => {
      const preset = (e as CustomEvent<string | undefined>).detail;
      if (typeof preset === "string") setQ(preset);
      setOpen(true);
    };
    window.addEventListener("open-search", onOpen);
    return () => window.removeEventListener("open-search", onOpen);
  }, []);

  // "/" 키로 어디서든 검색 열기 (입력 중일 때는 제외)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.key === "/" && !/input|textarea|select/i.test(el.tagName) && !el.isContentEditable) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 브랜드 목록(테마 많은 순) — 브랜드 페이지가 있는 것만
  const brands = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of index ?? []) {
      const b = brandOf(t.cafe);
      if (b) m.set(b, (m.get(b) ?? 0) + 1);
    }
    return [...m.entries()]
      .filter(([, n]) => n >= MIN_BRAND_THEMES)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ko"));
  }, [index]);
  const brandMatch = useMemo(() => {
    const k = norm(q);
    return k ? brands.find(([b]) => norm(b) === k || (k.length >= 2 && norm(b).startsWith(k))) : undefined;
  }, [brands, q]);

  const hits = useMemo(
    () => (index && q.trim() ? searchThemes(index, q, 8) : []),
    [index, q]
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <>
      {/* 아이콘만 있으면 눈에 안 띄어서, 검색창처럼 생긴 버튼으로 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="테마 검색"
        className="flex items-center gap-1.5 rounded-full border-2 border-edge/30 bg-panel px-3 py-1.5 text-sm font-bold text-cream/70 transition hover:border-edge hover:text-cream active:scale-[0.97] md:w-60"
      >
        <SearchIcon />
        <span className="md:hidden">검색</span>
        <span className="hidden md:inline">테마·매장·동네 검색</span>
        <kbd className="ml-auto hidden rounded-md border-2 border-edge/30 bg-ink px-1.5 text-[11px] font-bold text-cream/70 md:inline">/</kbd>
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 px-4 pt-16 sm:pt-24"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-label="테마 검색"
            className="w-full max-w-xl overflow-hidden rounded-2xl border-2 border-edge bg-panel shadow-cute"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={submit} className="flex items-center gap-2 border-b-2 border-edge px-4">
              <SearchIcon />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="테마, 매장, 동네로 찾기 (초성도 돼요)"
                className="w-full bg-transparent py-3.5 text-base outline-none placeholder:text-cream/50"
                enterKeyHint="search"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 text-[13px] text-cream/60"
              >
                닫기
              </button>
            </form>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {!q.trim() ? (
                <div className="space-y-4 p-2">
                  <div className="space-y-2">
                  <p className="text-[13px] text-cream/60">이렇게 찾아보세요</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGEST.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setQ(s)}
                        className={CHIP}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  </div>
                  {brands.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[13px] text-cream/60">브랜드로 찾기</p>
                      <div className="flex flex-wrap gap-1.5">
                        {brands.slice(0, 16).map(([b, n]) => (
                          <Link
                            key={b}
                            href={`/cafe/${b}`}
                            onClick={() => setOpen(false)}
                            className={CHIP}
                          >
                            {b} <span className="text-cream/60">{n}</span>
                          </Link>
                        ))}
                        <Link
                          href="/cafe"
                          onClick={() => setOpen(false)}
                          className="rounded-full px-3 py-1.5 text-[13px] font-bold underline underline-offset-2"
                        >
                          전체
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ) : index === null ? (
                <p className="p-4 text-center text-sm text-cream/60">불러오는 중…</p>
              ) : hits.length === 0 ? (
                <p className="p-4 text-center text-sm text-cream/60">
                  “{q}”에 맞는 테마가 없어요
                </p>
              ) : (
                <ul>
                  {brandMatch && (
                    <li>
                      <Link
                        href={`/cafe/${brandMatch[0]}`}
                        onClick={() => setOpen(false)}
                        className="mb-1 flex items-center justify-between gap-3 rounded-xl bg-[#FFF3E6] px-3 py-2.5 text-sm font-extrabold"
                      >
                        {brandMatch[0]} 전 지점 테마 {brandMatch[1]}개 보기
                        <span aria-hidden className="text-[#A85A14]">
                          ›
                        </span>
                      </Link>
                    </li>
                  )}
                  {hits.map(({ theme: t }) => (
                    <li key={t.id}>
                      <Link
                        href={`/theme/${t.id}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-xl border-2 border-transparent px-3 py-2 hover:border-edge/30 hover:bg-ink"
                      >
                        <span className="block w-9 shrink-0 overflow-hidden rounded-md text-[0px]">
                          <Poster src={posterSrc(t.poster_url)} name={t.name} genre={t.genre} rounded="rounded-md" compact />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-extrabold">{t.name}</span>
                          <span className="block truncate text-xs text-cream/60">
                            {t.cafe} · 난이도 {t.difficulty}/5 · 공포도 {t.fear_level}/5
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button
                      type="submit"
                      onClick={submit}
                      className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold underline underline-offset-2 hover:bg-ink"
                    >
                      “{q}” 전체 결과 보기
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
