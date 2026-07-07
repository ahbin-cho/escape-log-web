"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getPublicFeed, GENRE_EMOJI, type PublicReview } from "@/lib/store";

// 홈에 얹는 "모두의 후기" 미리보기. 최신 몇 개만 가로 스크롤로 컴팩트하게.
export default function FeedPreview() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [ready, setReady] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setReady(true);
      return;
    }
    getPublicFeed(10).then((r) => {
      setReviews(r);
      setReady(true);
    });
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = true;
    startX.current = e.pageX - el.offsetLeft;
    scrollLeft.current = el.scrollLeft;
    el.style.scrollSnapType = "none";
    el.style.cursor = "grabbing";
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const el = scrollRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    el.scrollLeft = scrollLeft.current - (x - startX.current);
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    const el = scrollRef.current;
    if (!el) return;
    el.style.scrollSnapType = "";
    el.style.cursor = "";
  }, []);

  // 후기가 없으면 자리 차지 안 하게 아예 숨김
  if (!ready || reviews.length === 0) return null;

  return (
    <section className="space-y-2">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-extrabold">🌏 모두의 후기</h2>
        <Link href="/feed" className="text-xs font-bold text-candy">
          더보기 →
        </Link>
      </div>
      <div
        ref={scrollRef}
        className="no-scrollbar -mx-1 flex cursor-grab snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-smooth px-1 pb-1"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {reviews.map((r) => (
          <Link
            key={r.id}
            href="/feed"
            draggable={false}
            className="flex w-44 shrink-0 snap-start flex-col gap-1 rounded-xl border-2 border-edge bg-panel p-3 shadow-cute transition active:scale-[0.98]"
          >
            <p className="truncate text-sm font-extrabold">
              {GENRE_EMOJI[r.genre]} {r.themeName}
            </p>
            <p className="text-xs font-bold text-candy">
              {"🌸".repeat(Math.round(r.rating))}
            </p>
            {r.oneLiner && (
              <p className="line-clamp-2 text-xs text-cream/70">"{r.oneLiner}"</p>
            )}
            <p className="mt-auto truncate text-[11px] font-bold text-cream/60">
              — {r.nickname}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
