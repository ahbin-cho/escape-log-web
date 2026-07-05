import "./globals.css";
import type { Metadata, Viewport } from "next";
import SiteHeader from "@/components/SiteHeader";

// 사이트 URL: 커스텀 도메인이 생기면 NEXT_PUBLIC_SITE_URL 에 넣으면 됨.
// 없으면 Vercel이 배포 때 자동으로 주는 프로덕션 주소를 사용.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://escape-log-web-eight.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "방탈로그 — 방탈출 기록·취향 진단·추천",
    template: "%s · 방탈로그",
  },
  description:
    "방탈출 경험을 기록하고, 취향을 진단받고, 딱 맞는 테마를 추천받는 방탈러 아카이브. 친구와 취향 궁합도 무료로.",
  applicationName: "방탈로그",
  keywords: [
    "방탈출",
    "방탈출 기록",
    "방탈출 추천",
    "방탈출 취향 진단",
    "방탈출 후기",
    "이스케이프룸",
    "방탈로그",
    "방탈출 궁합",
    "방탈출 지도",
  ],
  openGraph: {
    type: "website",
    siteName: "방탈로그",
    locale: "ko_KR",
    url: SITE_URL,
    title: "방탈로그 — 나만의 방탈출 아카이브",
    description:
      "기록·취향 진단·추천·친구 궁합까지. 방탈러를 위한 올인원 서비스.",
  },
  twitter: {
    card: "summary_large_image",
    title: "방탈로그 — 나만의 방탈출 아카이브",
    description: "기록·취향 진단·추천·친구 궁합까지. 방탈러를 위한 올인원.",
  },
};

// 모바일(특히 iOS 사파리) 포커스 자동 확대 방지
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {[
          "/key.png",
          "/door-open.png",
          "/bread.png",
          "/footprint.png",
          "/house.png",
        ].map((src) => (
          <link key={src} rel="preload" as="image" href={src} />
        ))}
      </head>
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
