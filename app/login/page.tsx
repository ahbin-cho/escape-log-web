"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { hasGuestPending, importGuestRecords } from "@/lib/store";
import { trackAttributionEvent } from "@/lib/track";

type Mode = "signin" | "signup" | "reset";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const configured = isSupabaseConfigured();

  // 비회원으로 쓴 기록이 이 기기에 있으면 안내하고 가입 탭을 먼저 연다
  const [guestCount, setGuestCount] = useState(0);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("mode") === "signup") setMode("signup");
    if (q.get("mode") === "reset") setMode("reset");
    if (q.get("error") === "link") setMessage("링크가 만료됐거나 이미 쓰였어요. 아래에서 메일을 다시 받아 주세요.");
    if (hasGuestPending()) {
      try {
        const raw = window.localStorage.getItem("escapelog:records:v1");
        setGuestCount(raw ? (JSON.parse(raw) as unknown[]).length : 0);
      } catch {
        setGuestCount(1);
      }
    }
  }, []);

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

  // 비밀번호 찾기: 메일로 재설정 링크를 보낸다. 가입 여부는 알려 주지 않는다(남의 이메일 가입 여부 확인 방지).
  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/login/new-password`,
      });
      if (error && /rate limit|too many|seconds/i.test(error.message)) throw error;
      setSent(true);
    } catch (err) {
      setMessage(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "reset") return handleReset(e);
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
        trackAttributionEvent("signup");
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
      // 비회원으로 쓴 기록을 계정으로 옮긴 뒤 이동(실패해도 홈 배너에서 다시 시도)
      await importGuestRecords();
      const next =
        new URLSearchParams(window.location.search).get("next") || "/";
      // refresh 없이 부드럽게 이동(홈·헤더는 onAuthStateChange 로 상태 반영).
      router.replace(next);
    } catch (err) {
      setBusy(false);
      setMessage(friendlyError(err));
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 py-8">
      <div className="text-center">
        <h1 className="text-xl font-extrabold sm:text-2xl">
          {mode === "signin" ? "로그인" : mode === "signup" ? "회원가입" : "비밀번호 찾기"}
        </h1>
        <p className="mt-2 text-sm text-cream/70">
          {mode === "reset"
            ? "가입한 이메일로 새 비밀번호를 정하는 링크를 보내 드려요."
            : "이메일과 비밀번호로 간단하게 시작해요."}
        </p>
      </div>

      {guestCount > 0 && (
        <div className="rounded-2xl border-2 border-candy/60 bg-candy/10 p-4 text-sm">
          <p className="font-extrabold">
            📓 방금 쓴 기록 {guestCount}개가 이 기기에 임시 저장됐어요
          </p>
          <p className="mt-1 text-cream/70">
            브라우저를 지우거나 다른 폰으로 바꾸면 사라져요. 가입하면 바로 내
            계정으로 옮겨지고, 취향 분석·다이어리·연말 결산까지 열려요.
          </p>
        </div>
      )}

      {/* 로그인 / 회원가입 전환 탭 */}
      <div className="flex gap-2">
        {(["signin", "signup"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setMessage("");
              setSent(false);
            }}
            className={`rough flex-1 rounded-xl border-2 border-edge px-3 py-2 text-sm font-extrabold transition active:scale-[0.98] ${
              mode === m ? "bg-candy text-edge shadow-cute" : "bg-panel"
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

      {mode === "reset" && sent ? (
        <div className="space-y-3 rounded-2xl border-2 border-edge bg-panel p-6 text-sm shadow-cute">
          <p className="font-extrabold">📮 메일을 보냈어요</p>
          <p className="text-cream/70">
            <b className="text-cream">{email.trim()}</b> 로 가입돼 있다면 몇 분 안에 메일이 와요.
            메일 속 <b className="text-cream">‘비밀번호 다시 정하기’</b> 링크를 누르면 새 비밀번호를 정할 수 있어요.
          </p>
          <p className="text-cream/70">메일이 안 보이면 스팸함도 확인해 주세요. 링크는 한 번만 쓸 수 있어요.</p>
        </div>
      ) : (
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
        {mode !== "reset" && (
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
        )}
        {message && (
          <p className="text-sm font-bold text-red-500">{message}</p>
        )}
        <button
          type="submit"
          disabled={busy || !configured}
          className="rough w-full rounded-xl border-2 border-edge bg-candy px-4 py-2.5 text-sm font-extrabold text-edge shadow-cute transition active:scale-[0.98] disabled:opacity-50"
        >
          {busy
            ? "처리 중…"
            : mode === "signin"
              ? "로그인"
              : mode === "signup"
                ? "가입하고 시작하기"
                : "재설정 메일 받기"}
        </button>
        {mode === "signin" && (
          <button
            type="button"
            onClick={() => {
              setMode("reset");
              setMessage("");
              setSent(false);
            }}
            className="block w-full text-center text-[13px] font-bold text-cream/60 underline underline-offset-2"
          >
            비밀번호를 잊었어요
          </button>
        )}
        {mode === "reset" && (
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setMessage("");
            }}
            className="block w-full text-center text-[13px] font-bold text-cream/60 underline underline-offset-2"
          >
            ← 로그인으로
          </button>
        )}
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
