import "./globals.css";
import type { Metadata, Viewport } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MiniGameFab from "@/components/MiniGameFab";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "방탈로그 — 방탈출 기록·취향 진단·추천",
    template: "%s · 방탈로그"
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/"
  },
  keywords: [
    "방탈출",
    "방탈출 기록",
    "방탈출 추천",
    "방탈출 취향 진단",
    "방탈출 후기",
    "이스케이프룸",
    "방탈로그",
    "방탈출 궁합",
    "방탈출 지도"
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ko_KR",
    url: SITE_URL,
    title: "방탈로그 — 나만의 방탈출 아카이브",
    description:
      "기록·취향 진단·추천·친구 궁합까지. 방탈러를 위한 올인원 서비스."
  },
  twitter: {
    card: "summary_large_image",
    title: "방탈로그 — 나만의 방탈출 아카이브",
    description: "기록·취향 진단·추천·친구 궁합까지. 방탈러를 위한 올인원."
  }
};

// 모바일(특히 iOS 사파리) 포커스 자동 확대 방지
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F5F0E6"
};

// 검색엔진 리치 결과용 구조화 데이터 (JSON-LD)
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: "Escape Log",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: "ko-KR",
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {[
          "/key.png",
          "/door-open.png",
          "/bread.png",
          "/footprint.png",
          "/house.png"
        ].map((src) => (
          <link key={src} rel="preload" as="image" href={src} />
        ))}
      </head>
      <body className="flex min-h-screen flex-col">
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
        <main className="relative mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
        <MiniGameFab />
        <SiteFooter />
      </body>
    </html>
  );
}
