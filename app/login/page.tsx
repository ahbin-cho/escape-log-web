"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const configured = isSupabaseConfigured();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    setMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "로그인 링크 발송에 실패했어요.");
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold">로그인 / 회원가입</h1>
        <p className="mt-2 text-sm text-cream/70">
          이메일로 로그인 링크를 보내드려요. 비밀번호가 필요 없어요.
        </p>
      </div>

      {!configured && (
        <div className="rounded-xl border-2 border-edge bg-amber-50 p-4 text-sm font-bold text-amber-700">
          아직 Supabase 환경변수가 설정되지 않았어요. <code>.env.local</code> 을
          채우면 로그인이 활성화됩니다. (DEPLOY.md 참고)
        </div>
      )}

      {status === "sent" ? (
        <div className="rough rounded-2xl border-2 border-edge bg-panel p-6 text-center shadow-cute">
          <p className="text-4xl">📬</p>
          <p className="mt-3 font-extrabold">메일함을 확인하세요!</p>
          <p className="mt-1 text-sm text-cream/70">
            <b>{email}</b> 로 로그인 링크를 보냈어요. 링크를 누르면 로그인됩니다.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rough space-y-4 rounded-2xl border-2 border-edge bg-panel p-6 shadow-cute"
        >
          <div>
            <label className="mb-1.5 block text-sm font-bold text-cream/70">
              이메일
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border-2 border-edge bg-ink px-4 py-2.5 text-sm font-bold outline-none placeholder:text-cream/45 focus:border-candy"
            />
          </div>
          {status === "error" && (
            <p className="text-sm font-bold text-red-500">{message}</p>
          )}
          <button
            type="submit"
            disabled={status === "sending" || !configured}
            className="rough w-full rounded-xl border-2 border-edge bg-candy px-4 py-2.5 text-sm font-extrabold text-white shadow-cute transition active:scale-[0.98] disabled:opacity-50"
          >
            {status === "sending" ? "보내는 중…" : "로그인 링크 받기"}
          </button>
        </form>
      )}

      <p className="text-center text-sm">
        <Link href="/" className="font-bold text-cream/60 underline">
          ← 홈으로
        </Link>
      </p>
    </div>
  );
}
