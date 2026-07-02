import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "방탈로그",
  description: "방탈출 경험을 기록하고 아카이빙"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        {/* 손그림 SVG 필터 */}
        <svg className="absolute h-0 w-0">
          <defs>
            <filter id="rough">
              <feTurbulence
                type="turbulence"
                baseFrequency="0.025"
                numOctaves="4"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="1.5"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
            <filter id="rough-sm">
              <feTurbulence
                type="turbulence"
                baseFrequency="0.03"
                numOctaves="2"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="1"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>

        <header className="sticky top-0 z-10 border-b-2 border-edge bg-ink/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
            <Link
              href="/"
              className="text-lg tracking-tight"
              style={{ fontFamily: "'SBAggroB', sans-serif" }}
            >
              방탈로그
            </Link>
            <nav className="flex items-center gap-2">
              <Link
                href="/quiz"
                className="rough rounded-xl border-2 border-edge bg-panel px-3 py-1.5 text-sm font-bold transition active:scale-[0.97]"
              >
                취향 찾기
              </Link>
              <Link
                href="/taste"
                className="rough rounded-xl border-2 border-edge bg-panel px-3 py-1.5 text-sm font-bold transition active:scale-[0.97]"
              >
                취향 분석
              </Link>
              <Link
                href="/new"
                className="rough rounded-xl border-2 border-edge bg-candy px-3 py-1.5 text-sm font-bold text-white shadow-cute transition active:scale-[0.97]"
              >
                기록 추가
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
