"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BANNERS, type Banner } from "@/lib/banners";

const TONE: Record<Banner["tone"], string> = {
  candy: "bg-candy/15",
  grape: "bg-grape/15",
  mint: "bg-mint/15",
};

const AUTOPLAY_MS = 5000;

// 홈 상단 배너 슬라이드. 가로 스크롤 스냅 기반이라 손가락으로 넘길 수 있고,
// 건드리지 않으면 자동으로 넘어간다.
export default function HomeBanner() {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false); // 마우스·포커스·터치 중 일시 멈춤
  const [stopped, setStopped] = useState(false); // 사용자가 버튼으로 끈 상태

  function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function goTo(i: number) {
    const el = track.current;
    if (!el) return;
    el.scrollTo({
      left: el.clientWidth * i,
      behavior: reducedMotion() ? "auto" : "smooth",
    });
  }

  useEffect(() => {
    if (paused || stopped || BANNERS.length < 2) return;
    if (reducedMotion()) return;
    const timer = setInterval(
      () => goTo((index + 1) % BANNERS.length),
      AUTOPLAY_MS
    );
    return () => clearInterval(timer);
  }, [index, paused, stopped]);

  if (BANNERS.length === 0) return null;

  return (
    <section
      aria-label="추천 배너"
      className="space-y-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      onTouchCancel={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        ref={track}
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl border-2 border-edge shadow-cute [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {BANNERS.map((b) => (
          <Link
            key={b.id}
            href={b.href}
            className={`relative flex w-full shrink-0 snap-start items-center gap-4 p-5 sm:p-6 ${TONE[b.tone]}`}
          >
            {b.ad && (
              <span className="absolute right-3 top-3 rounded-md border border-edge/30 bg-panel px-1.5 py-0.5 text-[10px] font-bold text-cream/60">
                광고
              </span>
            )}
            <span className="text-4xl sm:text-5xl" aria-hidden>
              {b.emoji}
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-extrabold leading-snug sm:text-xl">
                {b.title}
              </span>
              <span className="mt-0.5 block text-sm text-cream/70">{b.body}</span>
              <span className="mt-2 inline-block text-sm font-extrabold text-candy">
                {b.cta} →
              </span>
            </span>
          </Link>
        ))}
      </div>

      {BANNERS.length > 1 && (
        <div className="flex items-center justify-center">
          {BANNERS.map((b, i) => (
            <button
              key={b.id}
              type="button"
              aria-label={`${i + 1}번 배너 보기`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => goTo(i)}
              className="p-2"
            >
              <span
                className={`block h-2 rounded-full transition-all ${
                  i === index ? "w-5 bg-candy" : "w-2 bg-edge/20"
                }`}
              />
            </button>
          ))}
          <button
            type="button"
            aria-pressed={stopped}
            aria-label="배너 자동 넘김 멈춤"
            onClick={() => setStopped((s) => !s)}
            className="ml-1 p-2 text-xs font-bold text-cream/50 hover:text-candy"
          >
            {stopped ? "▶" : "⏸"}
          </button>
        </div>
      )}
    </section>
  );
}
