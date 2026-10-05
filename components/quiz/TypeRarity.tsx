"use client";

import { useEffect, useState } from "react";
import { getTypeCounts } from "@/lib/store";
import { typeShare, type TypeShare } from "@/lib/quiz/stats";

// "전체의 6%" 표시. 집계를 못 읽거나 표본이 적으면 아무것도 그리지 않는다.
export default function TypeRarity({ typeId }: { typeId: string }) {
  const [share, setShare] = useState<TypeShare | null>(null);

  useEffect(() => {
    let alive = true;
    getTypeCounts().then((counts) => {
      if (alive && counts) setShare(typeShare(counts, typeId));
    });
    return () => {
      alive = false;
    };
  }, [typeId]);

  if (!share) return null;
  return (
    <p className="mt-5 flex items-center justify-center gap-2 text-sm font-bold text-cream/70">
      {share.rare && (
        <span className="rounded-md border-2 border-edge bg-grape/20 px-2 py-0.5 text-xs font-extrabold text-cream">
          희귀 유형
        </span>
      )}
      <span className="tabular-nums">{share.label}</span>
    </p>
  );
}
