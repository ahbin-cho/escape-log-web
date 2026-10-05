"use client";

import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  getLegacyLocalRecords,
  clearLegacyLocalRecords,
  importLegacyRecords,
} from "@/lib/store";

// 예전 브라우저(localStorage) 기록이 있고 로그인돼 있으면
// "내 계정으로 가져오기"를 1회 제안하는 배너.
export default function ImportBanner() {
  const [count, setCount] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
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

  if (!loggedIn || count === 0 || status === "dismissed") return null;

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
          className="rough rounded-xl border-2 border-edge bg-candy px-3 py-1.5 text-sm font-bold text-white shadow-cute transition active:scale-[0.97]"
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
          className="rough rounded-xl border-2 border-edge bg-candy px-3 py-1.5 text-sm font-bold text-white shadow-cute transition active:scale-[0.97] disabled:opacity-50"
        >
          {status === "importing" ? "가져오는 중…" : "가져오기"}
        </button>
      </div>
    </div>
  );
}
