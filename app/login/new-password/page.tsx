"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// 비밀번호 재설정 메일의 링크 → /auth/callback 에서 잠깐 로그인된 상태로 여기 도착.
// 새 비밀번호를 두 번 받아 바꾼다. 로그인 상태가 아니면(링크 만료 등) 메일을 다시 받게 안내.
export default function NewPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState<"checking" | "ok" | "no">("checking");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setReady(data.user ? "ok" : "no"))
      .catch(() => setReady("no"));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    if (pw.length < 6) return setMessage("비밀번호는 6자 이상으로 정해 주세요.");
    if (pw !== pw2) return setMessage("두 칸에 적은 비밀번호가 달라요.");
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password: pw });
    setBusy(false);
    if (error) {
      const raw = error.message.toLowerCase();
      setMessage(
        raw.includes("different") || raw.includes("same")
          ? "예전과 다른 비밀번호로 정해 주세요."
          : raw.includes("weak") || raw.includes("short")
            ? "비밀번호는 6자 이상으로 정해 주세요."
            : "바꾸지 못했어요. 잠시 뒤 다시 해 주세요."
      );
      return;
    }
    setDone(true);
    setTimeout(() => router.replace("/records"), 1500);
  }

  const input =
    "w-full rounded-xl border-2 border-edge bg-ink px-4 py-2.5 text-sm font-bold outline-none placeholder:text-cream/45 focus:border-candy";

  return (
    <div className="mx-auto max-w-md space-y-6 py-8">
      <div className="text-center">
        <h1 className="text-xl font-extrabold sm:text-2xl">새 비밀번호 정하기</h1>
        <p className="mt-2 text-sm text-cream/70">앞으로 이 비밀번호로 로그인해요.</p>
      </div>

      {ready === "checking" && <p className="text-center text-sm text-cream/70">확인 중…</p>}

      {ready === "no" && (
        <div className="space-y-3 rounded-2xl border-2 border-edge bg-panel p-6 text-sm shadow-cute">
          <p className="font-extrabold">링크가 만료됐거나 이미 쓰였어요</p>
          <p className="text-cream/70">메일을 한 번 더 받아서 가장 최근 메일의 링크를 눌러 주세요.</p>
          <Link
            href="/login?mode=reset"
            className="rough block rounded-xl border-2 border-edge bg-candy px-4 py-2.5 text-center font-extrabold text-edge shadow-cute"
          >
            재설정 메일 다시 받기
          </Link>
        </div>
      )}

      {ready === "ok" &&
        (done ? (
          <div className="rounded-2xl border-2 border-edge bg-panel p-6 text-center text-sm font-extrabold shadow-cute">
            바꿨어요! 내 기록으로 이동할게요 👻
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 rounded-2xl border-2 border-edge bg-panel p-6 shadow-cute">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-cream/70">
                새 비밀번호 <span className="font-normal text-cream/55">(6자 이상)</span>
              </label>
              <input type="password" required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" placeholder="••••••" className={input} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-cream/70">한 번 더</label>
              <input type="password" required minLength={6} value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" placeholder="••••••" className={input} />
            </div>
            {message && <p className="text-sm font-bold text-red-500">{message}</p>}
            <button
              type="submit"
              disabled={busy}
              className="rough w-full rounded-xl border-2 border-edge bg-candy px-4 py-2.5 text-sm font-extrabold text-edge shadow-cute transition active:scale-[0.98] disabled:opacity-50"
            >
              {busy ? "바꾸는 중…" : "이 비밀번호로 바꾸기"}
            </button>
          </form>
        ))}
    </div>
  );
}
