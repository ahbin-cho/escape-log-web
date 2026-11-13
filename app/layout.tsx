import "./globals.css";
import type { Metadata, Viewport } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import TabBar from "@/components/TabBar";
import AttributionCapture from "@/components/AttributionCapture";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "방탈로그 — 방탈출 기록장·달력 다이어리, 취향 진단·추천",
    template: "%s · 방탈로그"
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
    // 새로 들어온 테마 RSS (브라우저·수집기가 찾을 수 있게 모든 페이지에 표시)
    types: { "application/rss+xml": [{ url: "/rss.xml", title: "방탈로그 새로 들어온 테마" }] }
  },
  keywords: [
    "방탈출",
    "방탈출 기록",
    "방탈출 기록장",
    "방탈출 다이어리",
    "방탈출 달력",
    "방탈출 캘린더",
    "방탈출 기록 달력",
    "방탈출 기록 앱",
    "방탈출 결산",
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
  // Google Search Console 소유권 인증(HTML 태그 방식).
  // 콘솔에서 받은 코드를 Vercel 환경변수 NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION 에 넣으면
  // <meta name="google-site-verification"> 이 자동으로 렌더됨.
  // 네이버 서치어드바이저 인증 값은 공개 값이라 기본값으로 둔다(환경변수가 있으면 그게 우선).
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      // bangtallog.com 소유 확인 값은 항상 넣고, 환경변수 값이 따로 있으면 함께 넣는다
      // (환경변수에 예전 값이 남아 있어도 새 주소 확인이 막히지 않게)
      "naver-site-verification": [
        ...new Set(
          [
            "4a2028464314f5e26f1daa34e45536bd33078b34",
            process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION
          ].filter((v): v is string => !!v)
        )
      ]
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

// 핀치 줌은 막지 않는다(접근성). iOS 포커스 자동 확대는 globals.css 의
// 모바일 입력칸 16px 규칙으로 방지.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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

        <a
          href="#main"
          className="rough sr-only rounded-lg bg-candy px-3 py-2 text-sm font-bold text-[#1D1D1D] focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 border-[2px] border-[#1D1D1D] shadow-[3px_3px_0_0_#1D1D1D]"
        >
          본문으로 건너뛰기
        </a>
        <SiteHeader />
        <main
          id="main"
          className="relative mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8"
        >
          {children}
        </main>
        <TabBar />
        <AttributionCapture />
        <SiteFooter />
      </body>
    </html>
  );
}
