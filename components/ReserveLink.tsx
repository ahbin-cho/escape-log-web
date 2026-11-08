"use client";

import { trackReserveClick, type ReserveSource } from "@/lib/track";

const SOURCES: ReserveSource[] = ["theme", "card", "recommend", "home"];

// 카드 → 테마 상세(?from=home 등) → 예약 으로 이어질 때, 집계에는 처음 눌렀던 곳을 남긴다.
// 매장 리포트의 "취향 맞춤 추천을 보고 이동" 같은 숫자가 상세 페이지로 뭉개지지 않게.
function sourceFromUrl(fallback: ReserveSource): ReserveSource {
  try {
    const from = new URLSearchParams(window.location.search).get("from");
    return SOURCES.includes(from as ReserveSource) ? (from as ReserveSource) : fallback;
  } catch {
    return fallback;
  }
}

// 외부 예약 페이지로 나가는 링크. 클릭을 집계한 뒤 새 탭으로 연다.
export default function ReserveLink({
  href,
  themeId,
  themeName,
  cafe,
  source,
  rel = "noopener noreferrer",
  className,
  children,
}: {
  href: string;
  themeId?: string;
  themeName: string;
  cafe: string;
  source: ReserveSource;
  rel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const track = () =>
    trackReserveClick({ themeId, themeName, cafe, source: sourceFromUrl(source) });

  return (
    <a
      href={href}
      target="_blank"
      rel={rel}
      className={className}
      onClick={track}
      onAuxClick={(e) => e.button === 1 && track()} // 휠 클릭(새 탭)도 집계
    >
      {children}
    </a>
  );
}
