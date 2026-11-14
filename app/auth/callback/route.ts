import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 매직링크 클릭 시 도착하는 콜백. code 를 세션으로 교환하고 next 로 이동.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // next 는 우리 사이트 안 경로만 허용(//evil.com, @evil.com 같은 바깥 주소로 튕기지 않게)
  const rawNext = searchParams.get("next") ?? "/";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") && !rawNext.startsWith("/\\") ? rawNext : "/";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  // 실패 시 로그인 페이지로. 비밀번호 재설정 링크였다면 다시 받는 화면으로.
  if (next.startsWith("/login/new-password")) return NextResponse.redirect(`${origin}/login?mode=reset&error=link`);
  return NextResponse.redirect(`${origin}/login?error=1`);
}
