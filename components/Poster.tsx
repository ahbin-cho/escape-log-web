"use client";

import { useState } from "react";
import { TONE } from "@/components/PosterTile";

// 포스터 한 장(2:3). 공식 포스터가 있으면 그 그림, 없거나 불러오지 못하면 장르 색 표지에 제목.
// 사이트 안에서만 쓴다(인스타 카드에는 매장 포스터를 쓰지 않는다).
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
  const t = TONE[genre ?? "기타"] ?? TONE["기타"];
  return (
    <span
      className={`relative block aspect-[2/3] w-full overflow-hidden ${rounded} ${className}`}
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
        <span className="absolute inset-0 flex flex-col justify-between p-[10%]">
          <span className="text-[10px] font-extrabold" style={{ color: t.accent }}>
            {genre ?? ""}
          </span>
          <span className="line-clamp-4 text-[13px] font-extrabold leading-tight text-white [word-break:keep-all]">{name}</span>
        </span>
      )}
    </span>
  );
}
