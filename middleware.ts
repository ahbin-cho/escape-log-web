import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// 미들웨어: 매 요청마다 세션 쿠키를 새로고침해 로그인 상태를 유지한다.
// (@supabase/ssr 표준 패턴)
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // 환경변수가 아직 없으면(로컬 미설정) 그냥 통과 — 앱이 죽지 않게.
  if (!url || !anon) return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // getUser() 호출로 만료 토큰을 자동 갱신.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // 정적 자원 제외 전 경로에서 세션 갱신.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp)$).*)",
  ],
};
