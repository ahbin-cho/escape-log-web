"use client";

import { useState } from "react";
import { TONE } from "@/components/PosterTile";

// 포스터 한 장(2:3). 공식 포스터가 있으면 그 그림, 없거나 불러오지 못하면 '직접 만든 표지'.
// 사이트 안에서만 쓴다(인스타 카드에는 매장 포스터를 쓰지 않는다).
//
// 직접 만든 표지: 장르 색 바탕 + 은은한 빛 + 큰 열쇠구멍 무늬 + 위쪽 장르 · 아래쪽 제목.
// 비어 보이지 않게 하되, 공식 포스터처럼 보이게 꾸미지는 않는다(가짜 포스터 금지).

// 장르별 무늬 하나(선 그림). 열쇠구멍이 기본.
const MOTIF: Record<string, string> = {
  공포: "M12 3c-4 0-7 3-7 7v11l2.3-1.6L9.7 21 12 19.4 14.3 21l2.4-1.6L19 21V10c0-4-3-7-7-7Z", // 유령
  스릴러: "M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z M12 9.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z", // 눈
  추리: "M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Z M15.3 15.3 21 21", // 돋보기
  감성: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z", // 하트
  판타지: "M12 3l1.9 5.6H20l-4.9 3.6 1.9 5.8L12 14.4 7 18l1.9-5.8L4 8.6h6.1Z", // 별
  SF: "M12 3c3 2.5 4 6 4 9.5V17H8v-4.5C8 9 9 5.5 12 3Z M8 14l-3 3v2h3 M16 14l3 3v2h-3", // 로켓
  모험: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M15.5 8.5 13.4 13.4 8.5 15.5 10.6 10.6Z", // 나침반
  코믹: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M8 14.5c1 1.6 2.4 2.4 4 2.4s3-.8 4-2.4 M9 9.5h.01 M15 9.5h.01", // 웃는 얼굴
  아케이드: "M7 8h10a4 4 0 0 1 4 4v1a4 4 0 0 1-7 2.6h-4A4 4 0 0 1 3 13v-1a4 4 0 0 1 4-4Z M8 11v3 M6.5 12.5h3 M15.5 12h.01 M17.5 13.5h.01", // 게임기
};
const KEYHOLE = "M12 3.5a4.5 4.5 0 0 0-2.4 8.3L8.5 20h7l-1.1-8.2A4.5 4.5 0 0 0 12 3.5Z";

export default function Poster({
  src,
  name,
  genre,
  className = "",
  rounded = "rounded-[10px]",
}: {
  src?: string | null;
  name: string;
  genre?: string;
  className?: string;
  rounded?: string;
}) {
  const [broken, setBroken] = useState(false);
  const url = (src ?? "").trim(); // 빈칸·줄바꿈만 든 주소는 없는 것으로 본다
  const g = genre ?? "기타";
  const t = TONE[g] ?? TONE["기타"];
  const motif = MOTIF[g] ?? KEYHOLE;
  return (
    <span
      className={`relative block aspect-[2/3] w-full overflow-hidden border-[2px] border-[#1D1D1D] ${rounded} ${className}`}
      style={{ backgroundColor: t.bg }}
    >
      {url && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={`${name} 포스터`}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span className="absolute inset-0" aria-label={`${name} (포스터 준비 중)`}>
          {/* 은은한 빛 + 아래쪽 그늘 */}
          <span
            className="absolute inset-0"
            style={{
              background: `radial-gradient(120% 70% at 50% 28%, ${t.accent}38 0%, transparent 62%), linear-gradient(180deg, transparent 55%, rgba(0,0,0,.45) 100%)`,
            }}
          />
          {/* 가는 테두리(책 표지 느낌) */}
          <span className="absolute inset-[6%] rounded-[6px] border" style={{ borderColor: `${t.accent}40` }} />
          {/* 장르 무늬 */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke={t.accent}
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-1/2 top-[22%] w-[46%] -translate-x-1/2 opacity-70"
            aria-hidden
          >
            <path d={motif} />
          </svg>
          <span className="absolute left-[11%] right-[11%] top-[10%] text-center text-[10px] font-extrabold tracking-[0.08em]" style={{ color: t.accent }}>
            {g}
          </span>
          <span className="absolute bottom-[10%] left-[11%] right-[11%] line-clamp-3 text-center text-[13px] font-extrabold leading-tight text-white [word-break:keep-all]">
            {name}
          </span>
        </span>
      )}
    </span>
  );
}
