import "./globals.css";
import type { Metadata, Viewport } from "next";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "방탈로그",
  description: "방탈출 경험을 기록하고 아카이빙"
};

// 모바일(특히 iOS 사파리) 포커스 자동 확대 방지
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
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

        <SiteHeader />
        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
