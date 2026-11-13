"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  getLegacyLocalRecords,
  clearLegacyLocalRecords,
  importLegacyRecords,
} from "@/lib/store";

// 이 브라우저(localStorage)에 기록이 있을 때:
// - 로그인 상태면 "내 계정으로 가져오기"를 제안
// - 비회원이면(로그인 없이 먼저 쓴 기록) "가입해서 지키기"로 가입을 유도
//   이때는 지우는 버튼을 두지 않는다(실수로 기록을 잃지 않게).
export default function ImportBanner() {
  const [count, setCount] = useState(0);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [status, setStatus] = useState<
    "idle" | "importing" | "imported" | "dismissed"
  >("idle");
  const [imported, setImported] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const legacy = getLegacyLocalRecords();
    if (legacy.length === 0) return;
    setCount(legacy.length);
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
  }, []);

  if (loggedIn === null || count === 0 || status === "dismissed") return null;

  if (!loggedIn) {
    return (
      <div className="rough flex flex-col gap-3 rounded-2xl border-2 border-candy/60 bg-candy/10 p-4 shadow-cute sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-extrabold">
            📓 이 기기에만 저장된 기록 {count}개가 있어요
          </p>
          <p className="mt-0.5 text-sm text-cream/70">
            브라우저를 지우면 사라져요. 10초 가입하면 계정으로 옮기고 달력·결산까지 열려요.{" "}
            <Link href="/taste" className="font-bold underline underline-offset-2">
              기록으로 본 내 유형 보기 →
            </Link>
          </p>
        </div>
        <Link
          href="/login?mode=signup&guest=1&next=/records"
          className="rough shrink-0 rounded-xl border-2 border-edge bg-candy px-4 py-2 text-center text-sm font-extrabold text-edge shadow-cute transition active:scale-[0.97]"
        >
          가입하고 기록 지키기
        </Link>
      </div>
    );
  }

  async function doImport() {
    setStatus("importing");
    setError("");
    try {
      const n = await importLegacyRecords(getLegacyLocalRecords());
      clearLegacyLocalRecords();
      setImported(n);
      setStatus("imported");
    } catch (e) {
      setStatus("idle");
      setError(e instanceof Error ? e.message : "가져오기에 실패했어요.");
    }
  }

  function dismiss() {
    clearLegacyLocalRecords();
    setStatus("dismissed");
  }

  if (status === "imported") {
    return (
      <div
        role="status"
        className="flex flex-col gap-3 rounded-2xl border-2 border-edge bg-panel p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-sm font-bold text-cream/80">
          예전 기록 <b>{imported}개</b>를 계정으로 가져왔어요.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rough rounded-xl border-2 border-edge bg-candy px-3 py-1.5 text-sm font-bold text-edge shadow-cute transition active:scale-[0.97]"
        >
          새로고침해서 보기
        </button>
      </div>
    );
  }

  return (
    <div className="rough flex flex-col gap-3 rounded-2xl border-2 border-edge bg-panel p-4 shadow-cute sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-bold text-cream/80">
          📦 이 브라우저에 저장된 예전 기록 <b>{count}개</b>를 계정으로 가져올까요?
        </p>
        {error && (
          <p role="alert" className="mt-1 text-sm font-bold text-red-700">
            {error} 다시 시도해 주세요.
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={dismiss}
          className="rounded-xl border-2 border-edge/40 px-3 py-1.5 text-sm font-bold text-cream/60 transition active:scale-[0.97] hover:border-edge"
        >
          아니요
        </button>
        <button
          onClick={doImport}
          disabled={status === "importing"}
          className="rough rounded-xl border-2 border-edge bg-candy px-3 py-1.5 text-sm font-bold text-edge shadow-cute transition active:scale-[0.97] disabled:opacity-50"
        >
          {status === "importing" ? "가져오는 중…" : "가져오기"}
        </button>
      </div>
    </div>
  );
}
