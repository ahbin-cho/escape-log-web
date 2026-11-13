"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TONE } from "@/components/PosterTile";
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
    <section aria-labelledby="home-feed">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="home-feed" className="text-[18px]">
          모두의 후기
        </h2>
        <Link href="/feed" className="text-[13px] text-cream/70">
          더보기 ›
        </Link>
      </div>
      <div
        ref={scrollRef}
        className="no-scrollbar -mx-4 flex cursor-grab snap-x snap-mandatory scroll-px-4 gap-2.5 overflow-x-auto scroll-smooth px-4 sm:-mx-6 sm:scroll-px-6 sm:px-6"
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
            className="relative flex aspect-[4/5] w-40 shrink-0 snap-start flex-col justify-end overflow-hidden rounded-xl p-3 text-white transition active:scale-[0.98]"
            style={{ backgroundColor: (TONE[r.genre] ?? TONE["기타"]).bg }}
          >
            {r.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.photoUrl} alt="" loading="lazy" draggable={false} className="absolute inset-0 h-full w-full object-cover opacity-70" />
            )}
            <span className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/80" />
            <span className="relative">
              {r.oneLiner && <span className="line-clamp-3 text-[13px] font-extrabold leading-snug">“{r.oneLiner}”</span>}
              <span className="mt-1.5 block truncate text-xs font-bold text-white/85">{r.themeName}</span>
              <span className="block truncate text-[11px] text-white/60">
                — {r.nickname}
                {r.isSample ? " · 예시" : ""}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
