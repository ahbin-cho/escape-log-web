import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 서버 컴포넌트 / 라우트 핸들러용 Supabase 클라이언트(쿠키 기반 세션).
export function createClient() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // 서버 컴포넌트에서 set 호출 시 무시(미들웨어가 세션 갱신을 담당).
        }
      },
    },
  });
}

// 현재 로그인 사용자가 관리자인지 서버에서 확인.
export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data, error } = await supabase.rpc("is_admin");
  if (error) return false;
  return data === true;
}
