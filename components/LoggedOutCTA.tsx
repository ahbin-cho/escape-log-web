"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MASCOT } from "@/lib/quiz";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

// 로그인 안 한 신규 방문자에게만 보이는 홈 상단 히어로.
// 두 핵심 행동(취향 찾기 · 기록하기)을 함께 유도한다.
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
    <section className="rough rounded-2xl border-2 border-edge bg-candy/10 p-6 text-center shadow-cute sm:p-8">
      <div className="text-4xl sm:text-5xl" aria-hidden="true">
        {MASCOT.emoji}
      </div>
      <h2 className="mt-2 text-xl font-extrabold leading-snug sm:text-2xl">
        방 좀 깨봤어? <br className="sm:hidden" />
        취향 딱 짚어줄게
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-cream/70">
        {MASCOT.name}가 6문항으로 방탈출 취향을 진단하고 딱 맞는 방까지 추천해줘.
        다녀온 방은 기록해서 나만의 업적으로.{" "}
        <b className="font-extrabold text-candy">전부 무료!</b>
      </p>
      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
        <Link
          href="/quiz"
          className="rough rounded-xl border-2 border-edge bg-candy px-6 py-3 text-sm font-extrabold text-white shadow-cute transition active:scale-[0.97]"
        >
          🔮 취향 찾기 시작
        </Link>
        <Link
          href="/new"
          className="rough rounded-xl border-2 border-edge bg-panel px-6 py-3 text-sm font-extrabold shadow-cute transition active:scale-[0.97] hover:border-candy"
        >
          🗝️ 방탈출 기록하기
        </Link>
      </div>
    </section>
  );
}
