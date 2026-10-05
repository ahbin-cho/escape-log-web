"use client";

import { trackReserveClick, type ReserveSource } from "@/lib/track";

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
  const track = () => trackReserveClick({ themeId, themeName, cafe, source });

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
