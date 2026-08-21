import { createClient } from "@supabase/supabase-js";

// 쿠키/세션 없는 익명 읽기 전용 Supabase 클라이언트.
// catalog 은 RLS 가 `select using(true)` 라 익명으로 읽을 수 있어,
// 요청 컨텍스트 밖(빌드타임 generateStaticParams·sitemap·ISR)에서도 안전하게 쓸 수 있다.
// (cookies() 기반 서버 클라이언트는 정적 생성 시 쓰면 페이지가 강제로 dynamic 이 됨)
export function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
