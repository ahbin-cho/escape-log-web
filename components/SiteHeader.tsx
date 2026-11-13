"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SearchButton from "@/components/SearchButton";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

// 배경색은 각 링크에서 지정(공용 base 에 bg 를 넣으면 bg-candy 등과 충돌해 색이 덮임)
const navBase =
  "rounded-xl px-3.5 py-2 text-sm font-extrabold transition active:scale-[0.97]";
// 보조 메뉴는 테두리 없는 글자 링크로 두고, 버튼 모양은 "기록 추가" 하나만 쓴다.
const navLink =
  "rounded-lg px-2.5 py-1.5 text-sm font-bold text-cream/80 transition hover:bg-edge/10 hover:text-cream";

export default function SiteHeader() {
  const router = useRouter();
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
    // 소프트 전환(흰 화면 번쩍 방지). 각 화면이 onAuthStateChange 로 상태를 비움.
    router.replace("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="shrink-0 whitespace-nowrap font-display text-lg tracking-tight"
        >
          방탈로그
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-0.5 sm:gap-1.5">
          <SearchButton />
          <Link href="/feed" className={`${navLink} hidden sm:inline-block`}>
            모두의 후기
          </Link>
          <Link href="/quiz" className={`${navLink} hidden sm:inline-block`}>
            취향 찾기
          </Link>
          <Link href="/best" className={`${navLink} hidden sm:inline-block`}>
            방 찾기
          </Link>
          <Link href="/new" className={`${navBase} mx-1 bg-edge text-white`}>
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
