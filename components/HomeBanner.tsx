"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BANNERS, type Banner } from "@/lib/banners";

const TONE: Record<Banner["tone"], string> = {
  candy: "bg-candy/25",
  grape: "bg-grape/25",
  mint: "bg-mint/25",
};

const AUTOPLAY_MS = 5000;

const CONTROL =
  "flex h-11 w-11 items-center justify-center rounded-full text-cream/70 transition hover:bg-edge/10 hover:text-cream active:scale-[0.94] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edge";

function Icon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

// 홈 상단 배너. 가로 스크롤 스냅 기반이라 손가락으로 넘길 수 있고,
// 다음 카드가 살짝 보여서 더 있다는 걸 알 수 있다. 건드리지 않으면 자동으로 넘어간다.
// 카드가 한 화면에 다 들어오면(데스크톱 2장) 넘김 컨트롤은 숨긴다.
export default function HomeBanner() {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [scrollable, setScrollable] = useState(false);
  const [paused, setPaused] = useState(false); // 마우스·포커스·터치 중 일시 멈춤
  const [stopped, setStopped] = useState(false); // 사용자가 버튼으로 끈 상태

  function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function goTo(i: number) {
    const el = track.current;
    if (!el) return;
    const n = BANNERS.length;
    const card = el.children[((i % n) + n) % n] as HTMLElement | undefined;
    if (!card) return;
    el.scrollTo({
      left: card.offsetLeft,
      behavior: reducedMotion() ? "auto" : "smooth",
    });
  }

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => setScrollable(el.scrollWidth > el.clientWidth + 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (paused || stopped || !scrollable) return;
    if (reducedMotion()) return;
    const timer = setInterval(() => goTo(index + 1), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [index, paused, stopped, scrollable]);

  if (BANNERS.length === 0) return null;

  return (
    <section
      aria-label="추천 배너"
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
          const cards = Array.from(el.children) as HTMLElement[];
          // 끝까지 밀면 마지막 카드는 왼쪽에 못 붙으므로 따로 처리
          if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 2) {
            setIndex(cards.length - 1);
            return;
          }
          let nearest = 0;
          cards.forEach((c, i) => {
            if (
              Math.abs(c.offsetLeft - el.scrollLeft) <
              Math.abs(cards[nearest].offsetLeft - el.scrollLeft)
            )
              nearest = i;
          });
          setIndex(nearest);
        }}
        className="no-scrollbar relative flex snap-x snap-mandatory gap-3 overflow-x-auto"
      >
        {BANNERS.map((b) => (
          <Link
            key={b.id}
            href={b.href}
            className={`group relative flex min-h-[168px] w-[88%] shrink-0 snap-start flex-col gap-4 overflow-hidden rounded-2xl border-2 border-edge bg-panel p-5 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-[6px] focus-visible:outline-edge sm:min-h-[184px] sm:w-[calc(50%-0.375rem)] sm:p-6`}
          >
            {/* 색은 카드 전체가 아니라 일러스트 뒤 원에만 쓴다 */}
            <span
              aria-hidden
              className={`absolute -bottom-20 -right-14 h-60 w-60 rounded-full sm:h-72 sm:w-72 ${TONE[b.tone]}`}
            />
            <Image
              src={b.art}
              alt=""
              width={176}
              height={176}
              className="pointer-events-none absolute -bottom-6 -right-4 h-36 w-36 rotate-6 object-contain transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-3 motion-reduce:transition-none sm:h-44 sm:w-44"
            />
            {b.ad && (
              <span className="absolute right-3 top-3 rounded-md border border-edge bg-ink px-1.5 py-0.5 text-[11px] font-bold">
                광고
              </span>
            )}
            <div className="relative max-w-[68%]">
              <h3 className="text-xl leading-tight [text-wrap:balance] sm:text-2xl">
                {b.title}
              </h3>
              <p className="mt-1.5 text-sm font-medium leading-snug text-cream/70 [word-break:keep-all]">
                {b.body}
              </p>
            </div>
            <span className="relative mt-auto inline-flex w-fit items-center gap-1 rounded-full bg-edge px-4 py-2 text-sm font-extrabold text-panel transition-transform group-active:scale-[0.97]">
              {b.cta}
              <Icon d="M5 12h14M13 6l6 6-6 6" />
            </span>
          </Link>
        ))}
      </div>

      {scrollable && (
        <div className="mt-1 flex items-center justify-between">
          <p
            className="pl-1 text-sm font-extrabold tabular-nums text-cream/70"
            aria-live="off"
          >
            <span className="sr-only">배너 </span>
            {index + 1}
            <span className="text-cream/40"> / {BANNERS.length}</span>
          </p>
          <div className="flex items-center">
            <button
              type="button"
              aria-label={stopped ? "배너 자동 넘김 켜기" : "배너 자동 넘김 끄기"}
              onClick={() => setStopped((s) => !s)}
              className={CONTROL}
            >
              <Icon d={stopped ? "M8 5v14l11-7z" : "M9 5v14M15 5v14"} />
            </button>
            <button
              type="button"
              aria-label="이전 배너"
              onClick={() => goTo(index - 1)}
              className={CONTROL}
            >
              <Icon d="M15 6l-6 6 6 6" />
            </button>
            <button
              type="button"
              aria-label="다음 배너"
              onClick={() => goTo(index + 1)}
              className={CONTROL}
            >
              <Icon d="M9 6l6 6-6 6" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
