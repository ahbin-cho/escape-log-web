"use server";

import { revalidatePath } from "next/cache";
import { isCurrentUserAdmin } from "@/lib/supabase/server";

// SQL 로 DB 를 고친 뒤, 미리 만들어 둔 페이지(캐시)를 지금 바로 새로 만들게 한다.
// 평소엔 10분~1시간마다 저절로 새로 만들어지지만, 바로 보고 싶을 때 관리자가 누른다.
export async function refreshSite(): Promise<{ ok: boolean; at?: string; error?: string }> {
  if (!(await isCurrentUserAdmin())) return { ok: false, error: "관리자만 누를 수 있어요" };
  // 루트 레이아웃 아래 모든 페이지(홈·테마·브랜드·지역·모음·스포트라이트…)와 그 페이지가 읽은 DB 캐시
  revalidatePath("/", "layout");
  revalidatePath("/api/search-index");
  revalidatePath("/api/poster-index");
  revalidatePath("/sitemap.xml");
  const at = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(11, 16);
  return { ok: true, at };
}
