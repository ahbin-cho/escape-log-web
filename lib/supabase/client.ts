import { createBrowserClient } from "@supabase/ssr";

// 브라우저(클라이언트 컴포넌트)용 Supabase 클라이언트.
// 환경변수는 NEXT_PUBLIC_ 접두사라 클라이언트 번들에 포함됩니다(공개 anon 키라 안전).
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error(
      "Supabase 환경변수가 없습니다. .env.local 에 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 를 넣어주세요."
    );
  }
  return createBrowserClient(url, anon);
}

// 환경변수가 설정돼 있는지(=Supabase 연결됨) 확인용.
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
