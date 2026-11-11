"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ThemeRow } from "@/lib/catalog-server";
import { searchThemes } from "@/lib/search";
import { genreEmoji } from "@/lib/store";
import { brandOf } from "@/lib/cafe";
import { norm } from "@/lib/search";

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
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="테마 검색"
        className="rounded-xl px-2.5 py-2 text-base transition hover:bg-panel active:scale-[0.97]"
      >
        🔍
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-16 sm:pt-24"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-label="테마 검색"
            className="w-full max-w-xl overflow-hidden rounded-2xl border-2 border-edge bg-ink shadow-cute"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={submit} className="flex items-center gap-2 border-b-2 border-edge/20 px-4">
              <span aria-hidden>🔍</span>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="테마·매장·지역 검색 (초성도 돼요)"
                className="w-full bg-transparent py-3.5 text-base outline-none placeholder:text-cream/45"
                enterKeyHint="search"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 text-xs font-bold text-cream/55"
              >
                닫기
              </button>
            </form>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {!q.trim() ? (
                <div className="space-y-4 p-2">
                  <div className="space-y-2">
                  <p className="text-xs font-bold text-cream/55">이렇게 찾아보세요</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGEST.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setQ(s)}
                        className="rounded-full border border-edge/30 bg-panel px-3 py-1.5 text-sm font-bold"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  </div>
                  {brands.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-cream/55">브랜드로 찾기</p>
                      <div className="flex flex-wrap gap-1.5">
                        {brands.slice(0, 16).map(([b, n]) => (
                          <Link
                            key={b}
                            href={`/cafe/${b}`}
                            onClick={() => setOpen(false)}
                            className="rounded-full border border-edge/30 bg-panel px-3 py-1.5 text-sm font-bold hover:border-candy"
                          >
                            {b} <span className="text-cream/45">{n}</span>
                          </Link>
                        ))}
                        <Link
                          href="/cafe"
                          onClick={() => setOpen(false)}
                          className="rounded-full px-3 py-1.5 text-sm font-bold text-candy"
                        >
                          전체 →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ) : index === null ? (
                <p className="p-4 text-center text-sm text-cream/55">불러오는 중…</p>
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
                        className="mb-1 flex items-center gap-3 rounded-xl bg-candy/10 px-3 py-2.5 font-extrabold text-candy hover:bg-candy/20"
                      >
                        🏠 {brandMatch[0]} 전 지점 테마 {brandMatch[1]}개 보기 →
                      </Link>
                    </li>
                  )}
                  {hits.map(({ theme: t }) => (
                    <li key={t.id}>
                      <Link
                        href={`/theme/${t.id}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-panel"
                      >
                        <span className="text-lg" aria-hidden>
                          {genreEmoji(t.genre)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-extrabold">{t.name}</span>
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
                      className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold text-candy hover:bg-panel"
                    >
                      “{q}” 전체 결과 보기 →
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
