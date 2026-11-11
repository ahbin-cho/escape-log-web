import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { CANONICAL_URL, LEGACY_HOSTS } from "@/lib/site";

// 미들웨어: 매 요청마다 세션 쿠키를 새로고침해 로그인 상태를 유지한다.
// (@supabase/ssr 표준 패턴)
export async function middleware(request: NextRequest) {
  // 예전 주소(vercel.app, www)로 온 요청은 같은 경로의 대표 주소로 영구 이동(308).
  // 검색엔진이 주소 이전으로 인식해 검색 점수를 새 주소로 옮긴다.
  // 미리보기 배포 주소(다른 *.vercel.app)는 건드리지 않는다.
  const host = (request.headers.get("host") ?? "").toLowerCase();
  if (LEGACY_HOSTS.includes(host)) {
    const target = new URL(
      request.nextUrl.pathname + request.nextUrl.search,
      CANONICAL_URL
    );
    return NextResponse.redirect(target, 308);
  }

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
