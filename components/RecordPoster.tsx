"use client";

import { useState } from "react";
import Poster from "@/components/Poster";
import PosterTile from "@/components/PosterTile";
import { findPoster, type PosterIndex } from "@/lib/poster";

// 기록 한 건의 표지(2:3). 내가 올린 사진 → 공식 포스터 → 장르 색 표지 순서(운영자 결정 2026-11-14).
// 사진이 깨지면 포스터로, 포스터도 깨지면 장르 색 표지로 내려간다.
// small: 달력 칸·목록 썸네일처럼 작은 자리(글씨가 작은 미니 표지를 쓴다).
export default function RecordPoster({
  record,
  index,
  small = false,
  rounded,
  className = "",
}: {
  record: { themeName: string; cafeName: string; genre: string; photoUrl?: string };
  index: PosterIndex;
  small?: boolean;
  rounded?: string;
  className?: string;
}) {
  const poster = findPoster(index, record.themeName, record.cafeName)?.poster || "";
  const [broken, setBroken] = useState<string[]>([]);
  const src = [record.photoUrl || "", poster].find((u) => u && !broken.includes(u)) || "";
  const ok = !!src;

  const img = ok && (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={small ? "" : src === poster ? `${record.themeName} 포스터` : `${record.themeName} 사진`}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setBroken((b) => [...b, src])}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );

  // 표지를 먼저 깔고 그 위에 그림: 그림이 늦거나 깨져도 빈칸이 되지 않는다
  if (!small) {
    return (
      <span className={`relative block overflow-hidden ${rounded ?? "rounded-[10px]"} ${className}`}>
        <Poster name={record.themeName || "(제목 없음)"} genre={record.genre} rounded="" />
        {img}
      </span>
    );
  }
  return (
    <span className={`relative block aspect-[2/3] w-full overflow-hidden ${rounded ?? "rounded-md"} ${className}`}>
      <PosterTile genre={record.genre} name={record.themeName} />
      {img}
    </span>
  );
}
