"use client";

import { useEffect, useState } from "react";
import { publicClient } from "@/lib/supabase/public";
import { SITE_COLS, type SiteItemRow } from "@/lib/site-items";

// site_items 를 한 번만 받아 여러 컴포넌트가 같이 쓴다(홈 칩·배너·검색창).
// 못 읽으면 null → 각 컴포넌트가 기본값을 쓴다.
let cache: Promise<SiteItemRow[] | null> | null = null;
function load() {
  cache ??= Promise.resolve(
    publicClient()
      .from("site_items")
      .select(SITE_COLS)
      .eq("active", true)
      .then(({ data, error }) => (error || !data ? null : (data as unknown as SiteItemRow[])))
  ).catch(() => null);
  return cache;
}

export function useSiteItems(): SiteItemRow[] | null {
  const [rows, setRows] = useState<SiteItemRow[] | null>(null);
  useEffect(() => {
    let alive = true;
    load().then((r) => alive && setRows(r));
    return () => {
      alive = false;
    };
  }, []);
  return rows;
}
