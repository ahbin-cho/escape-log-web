"use client";

import { useState } from "react";

// 결과 링크 공유: 기기 공유 창 → 안 되면 링크 복사 → 그것도 막히면 주소를 보여 준다.
export default function MiniShareButton({
  path,
  title,
  text,
}: {
  path: string;
  title: string;
  text: string;
}) {
  const [status, setStatus] = useState("");

  async function share() {
    const url = window.location.origin + path;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        setStatus("");
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setStatus("링크를 복사했어요. 친구에게 붙여 넣어 보세요.");
    } catch {
      setStatus(url);
    }
  }

  return (
    <div className="flex-1">
      <button
        type="button"
        onClick={share}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-edge bg-candy px-5 py-4 text-[15px] font-extrabold text-edge shadow-[3px_3px_0_0_#1D1D1D] transition [@media(hover:hover){&:hover}]:-translate-y-px active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12" />
          <path d="m7 8 5-5 5 5" />
          <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
        </svg>
        결과 공유하기
      </button>
      <p role="status" className="mt-2 min-h-5 break-all text-center text-xs font-bold text-cream/60">
        {status}
      </p>
    </div>
  );
}
