"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

// 로그인 안 한 사용자에게만 보이는 가입 유도 배너.
export default function LoggedOutCTA() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoggedIn(false);
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setLoggedIn(!!session?.user)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loggedIn !== false) return null; // 로딩 중이거나 로그인 상태면 숨김

  return (
    <div className="rough flex flex-col gap-3 rounded-2xl border-2 border-edge bg-candy/10 p-4 shadow-cute sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-base font-extrabold">🗝️ 내 탈출 업적, 남겨볼까?</p>
        <p className="mt-0.5 text-sm text-cream/70">
          방탈출 기록을 모아 취향 분석·추천까지. 30초면 시작해요.
        </p>
      </div>
      <Link
        href="/login"
        className="rough shrink-0 rounded-xl border-2 border-edge bg-candy px-5 py-2.5 text-center text-sm font-extrabold text-white shadow-cute transition active:scale-[0.97]"
      >
        기록 시작하기
      </Link>
    </div>
  );
}
