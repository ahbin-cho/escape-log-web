"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MASCOT } from "@/lib/quiz";
import Mascot from "@/components/Mascot";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

// 로그인 안 한 방문자에게 보이는 홈 상단 히어로(사이트의 h1).
// 두 핵심 행동(취향 찾기 · 기록하기)을 함께 유도한다.
// 로그인 확인 전(서버 HTML 포함)에도 그려서 검색엔진이 h1·소개 문구를 읽게 하고,
// 로그인한 것이 확인되면 숨긴다.
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

  if (loggedIn === true) return null;

  return (
    <section className="flex flex-col-reverse items-start gap-4 pb-2 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:py-6">
      <div className="max-w-xl">
        <p className="mb-2 text-sm font-extrabold text-candy">
          방탈출 기록장 · 취향 진단 · 맞춤 추천
        </p>
        <h1 className="text-3xl leading-[1.15] sm:text-5xl sm:leading-[1.1]">
          방 좀 깨봤어?
          <br />
          취향 딱 짚어줄게
        </h1>
        <p className="mt-3 max-w-md leading-relaxed text-cream/70 [word-break:keep-all]">
          {MASCOT.name}가 방탈출 취향을 진단하고 딱 맞는 방까지 추천해줘.
          다녀온 방은 다이어리에 기록하면 몇 번째 방인지, 올해 결산까지
          자동으로.{" "}
          <b className="font-extrabold text-cream">전부 무료.</b>
        </p>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
          <Link
            href="/quiz"
            className="rough rounded-xl border-2 border-edge bg-candy px-6 py-3 text-center text-sm font-extrabold text-white shadow-cute transition hover:-translate-y-0.5 active:scale-[0.97]"
          >
            취향 찾기 시작
          </Link>
          <Link
            href="/new"
            className="rounded-xl px-2 py-3 text-center text-sm font-extrabold underline decoration-2 underline-offset-4 transition hover:text-candy"
          >
            로그인 없이 방탈출 기록하기
          </Link>
          <Link
            href="/diary"
            className="rounded-xl px-2 py-3 text-center text-sm font-bold text-cream/60 transition hover:text-candy"
          >
            기록장 둘러보기 →
          </Link>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="flex h-20 w-20 shrink-0 -rotate-6 items-center justify-center rounded-full bg-candy/15 sm:h-44 sm:w-44"
      >
        <Mascot className="h-full w-full scale-110" />
      </div>
    </section>
  );
}
