"use client";

import { useEffect, useState } from "react";
import type { PosterIndex } from "./poster";

let cache: PosterIndex | null = null;
let pending: Promise<PosterIndex> | null = null;

// 포스터 목록을 한 번만 받아 여러 화면이 같이 쓴다. 실패하면 빈 목록(장르 색 표지로 보임).
export function usePosterIndex(): PosterIndex {
  const [index, setIndex] = useState<PosterIndex>(cache ?? {});
  useEffect(() => {
    if (cache) return;
    pending ??= fetch("/api/poster-index")
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({}));
    let alive = true;
    pending.then((d) => {
      cache = d;
      if (alive) setIndex(d);
    });
    return () => {
      alive = false;
    };
  }, []);
  return index;
}
