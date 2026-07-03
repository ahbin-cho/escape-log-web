"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const configured = isSupabaseConfigured();

  // Supabase 원문 에러 → 사용자 친화 한글 안내로 변환
  function friendlyError(err: unknown): string {
    const raw = (err instanceof Error ? err.message : String(err)).toLowerCase();
    if (raw.includes("invalid login") || raw.includes("invalid credentials")) {
      return "이메일 또는 비밀번호가 올바르지 않아요.";
    }
    if (raw.includes("already registered") || raw.includes("already exists")) {
      return "이미 가입된 이메일이에요. ‘로그인’으로 들어와 주세요.";
    }
    if (raw.includes("password") && (raw.includes("6") || raw.includes("short") || raw.includes("weak"))) {
      return "비밀번호는 6자 이상으로 정해 주세요.";
    }
    if (raw.includes("rate limit") || raw.includes("too many")) {
      return "잠시 후 다시 시도해 주세요.";
    }
    return mode === "signup"
      ? "회원가입에 실패했어요. 잠시 후 다시 시도해 주세요."
      : "로그인에 실패했어요. 잠시 후 다시 시도해 주세요.";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setBusy(true);
    setMessage("");
    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { nickname: nickname.trim() } },
        });
        if (error) throw error;
        // 이메일 확인이 켜져 있으면 세션이 없음 → 안내
        if (!data.session) {
          setBusy(false);
          setMessage(
            "가입은 됐어요. 바로 로그인하려면 Supabase에서 ‘이메일 확인(Confirm email)’을 꺼주세요."
          );
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setBusy(false);
      setMessage(friendlyError(err));
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold">
          {mode === "signin" ? "로그인" : "회원가입"}
        </h1>
        <p className="mt-2 text-sm text-cream/70">
          이메일과 비밀번호로 간단하게 시작해요.
        </p>
      </div>

      {/* 로그인 / 회원가입 전환 탭 */}
      <div className="flex gap-2">
        {(["signin", "signup"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setMessage("");
            }}
            className={`rough flex-1 rounded-xl border-2 border-edge px-3 py-2 text-sm font-extrabold transition active:scale-[0.98] ${
              mode === m ? "bg-candy text-white shadow-cute" : "bg-panel"
            }`}
          >
            {m === "signin" ? "로그인" : "회원가입"}
          </button>
        ))}
      </div>

      {!configured && (
        <div className="rounded-xl border-2 border-edge bg-amber-50 p-4 text-sm font-bold text-amber-700">
          아직 Supabase 환경변수가 설정되지 않았어요. <code>.env.local</code> 을
          채우면 로그인이 활성화됩니다. (DEPLOY.md 참고)
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border-2 border-edge bg-panel p-6 shadow-cute"
      >
        {mode === "signup" && (
          <div>
            <label className="mb-1.5 block text-sm font-bold text-cream/70">
              닉네임 <span className="font-normal text-cream/55">(후기에 표시돼요)</span>
            </label>
            <input
              type="text"
              required
              maxLength={20}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예: 탈출귀신"
              className="w-full rounded-xl border-2 border-edge bg-ink px-4 py-2.5 text-sm font-bold outline-none placeholder:text-cream/45 focus:border-candy"
            />
          </div>
        )}
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
        <div>
          <label className="mb-1.5 block text-sm font-bold text-cream/70">
            비밀번호 <span className="font-normal text-cream/55">(6자 이상)</span>
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className="w-full rounded-xl border-2 border-edge bg-ink px-4 py-2.5 text-sm font-bold outline-none placeholder:text-cream/45 focus:border-candy"
          />
        </div>
        {message && (
          <p className="text-sm font-bold text-red-500">{message}</p>
        )}
        <button
          type="submit"
          disabled={busy || !configured}
          className="rough w-full rounded-xl border-2 border-edge bg-candy px-4 py-2.5 text-sm font-extrabold text-white shadow-cute transition active:scale-[0.98] disabled:opacity-50"
        >
          {busy
            ? "처리 중…"
            : mode === "signin"
              ? "로그인"
              : "가입하고 시작하기"}
        </button>
      </form>

      <p className="text-center text-sm">
        <Link href="/" className="font-bold text-cream/60 underline">
          ← 홈으로
        </Link>
      </p>
    </div>
  );
}
