"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const navLink =
  "rough rounded-xl border-2 border-edge bg-panel px-3 py-1.5 text-sm font-bold transition active:scale-[0.97]";

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
    router.push("/");
    router.refresh();
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
            피드
          </Link>
          <Link href="/quiz" className={`${navLink} hidden sm:inline-block`}>
            취향 찾기
          </Link>
          <Link href="/new" className={`${navLink} bg-candy text-white shadow-cute`}>
            기록 추가
          </Link>
          {isAdmin && (
            <Link href="/admin" className={`${navLink} bg-grape text-white`}>
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
