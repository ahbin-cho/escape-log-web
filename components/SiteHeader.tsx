"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

// 배경색은 각 링크에서 지정(공용 base 에 bg 를 넣으면 bg-candy 등과 충돌해 색이 덮임)
const navBase =
  "rough rounded-xl border-2 border-edge px-3 py-1.5 text-sm font-bold transition active:scale-[0.97]";
const navLink = `${navBase} bg-panel`;

export default function SiteHeader() {
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setReady(true);
      return;
    }
    const supabase = createClient();

    async function load(userEmail: string | null) {
      setEmail(userEmail);
      if (userEmail) {
        const { data } = await supabase.rpc("is_admin");
        setIsAdmin(data === true);
      } else {
        setIsAdmin(false);
      }
      setReady(true);
    }

    supabase.auth.getUser().then(({ data }) => load(data.user?.email ?? null));

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      load(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    // 전체 새로고침으로 화면의 기록 상태까지 완전히 초기화(로그아웃 후 이전 기록 잔상 방지)
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-10 border-b-2 border-edge bg-ink/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="text-lg tracking-tight"
          style={{ fontFamily: "'SBAggroB', sans-serif" }}
        >
          방탈로그
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          <Link href="/feed" className={navLink}>
            모두의 후기
          </Link>
          <Link href="/quiz" className={`${navLink} hidden sm:inline-block`}>
            취향 찾기
          </Link>
          <Link href="/new" className={`${navBase} bg-candy text-white shadow-cute`}>
            기록 추가
          </Link>
          {isAdmin && (
            <Link href="/admin" className={`${navBase} bg-grape text-white`}>
              관리자
            </Link>
          )}
          {ready &&
            (email ? (
              <button onClick={logout} className={navLink} title={email}>
                로그아웃
              </button>
            ) : (
              <Link href="/login" className={navLink}>
                로그인
              </Link>
            ))}
        </nav>
      </div>
    </header>
  );
}
