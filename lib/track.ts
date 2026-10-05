import { createClient, isSupabaseConfigured } from "./supabase/client";

// 예약 버튼 클릭 집계. 제휴 제안 때 "예약 페이지로 N명 보냄" 근거로 쓴다.
// 실패해도 사용자 동작(예약 페이지 이동)을 막지 않도록 조용히 무시.
export type ReserveSource = "theme" | "card" | "recommend" | "home";

export function trackReserveClick(click: {
  themeId?: string;
  themeName: string;
  cafe: string;
  source: ReserveSource;
}): void {
  if (!isSupabaseConfigured()) return;
  try {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        click.themeId ?? ""
      );
    void createClient()
      .from("reservation_clicks")
      .insert({
        theme_id: isUuid ? click.themeId : null,
        theme_name: click.themeName.slice(0, 200),
        cafe: click.cafe.slice(0, 200),
        source: click.source,
      })
      .then(
        () => {},
        () => {}
      );
  } catch {
    // 집계 실패는 무시
  }
}
