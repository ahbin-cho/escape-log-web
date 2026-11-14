"use client";

import { useState, useTransition } from "react";
import { refreshSite } from "./actions";
import { BTN_PRIMARY } from "@/lib/ui";

export default function RefreshButton() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await refreshSite();
            setMsg(r.ok ? `${r.at} 새로고침 완료! 이제 사이트를 열면 바뀐 내용이 보여요.` : r.error ?? "실패했어요");
          })
        }
        className={`${BTN_PRIMARY} disabled:opacity-60`}
      >
        {pending ? "새로 만드는 중…" : "🔄 지금 새로고침"}
      </button>
      {msg && <p className="text-sm font-bold">{msg}</p>}
    </div>
  );
}
