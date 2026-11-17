"use client";

import { useEffect, useState } from "react";
import { publishMyPrivateRecords, type EscapeRecord } from "@/lib/store";

// 예전에 비공개로 남긴 기록을 '글만' 공개할지 한 번만 묻는다(운영자 결정 2026-11-17: 글은 기본 공개, 사진은 기본 비공개).
// 동의 없이 한꺼번에 공개로 바꾸지 않는다. 어느 쪽을 누르든 다시 묻지 않는다(이 기기 기준).
const KEY = "talkkak:publish-prompt:v1";

export default function PublishPrompt({ records, onDone }: { records: EscapeRecord[]; onDone: () => void }) {
  const [asked, setAsked] = useState(true); // 처음엔 숨겨 두고, 안 물어본 기기에서만 연다
  const [busy, setBusy] = useState(false);
  const [doneCount, setDoneCount] = useState<number | null>(null);
  useEffect(() => {
    try {
      setAsked(window.localStorage.getItem(KEY) === "1");
    } catch {
      setAsked(true);
    }
  }, []);
  const remember = () => {
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      /* 저장 못 해도 그냥 닫는다 */
    }
  };

  const privates = records.filter((r) => !r.isPublic && r.oneLiner.trim());
  if (doneCount !== null) {
    return (
      <p className="mt-4 rounded-xl border-2 border-edge bg-panel px-4 py-3 text-sm font-bold shadow-cute">
        후기 {doneCount}개를 글만 공개했어요. 사진은 계속 나만 봐요. 기록마다 언제든 끌 수 있어요.
      </p>
    );
  }
  if (asked || privates.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border-2 border-edge bg-panel p-4 text-center shadow-cute">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/mascot.png" alt="" width={52} height={52} className="mx-auto h-[52px] w-[52px] object-contain" />
      <p className="mt-1 text-[15px] font-extrabold">지난 후기 {privates.length}개, 글만 공개할까요?</p>
      <p className="mt-1 text-xs leading-relaxed text-cream/60">
        후기·평점·성공 여부만 테마 페이지에 보여요. 사진과 메모는 계속 나만 봐요. 기록마다 언제든 끌 수 있어요.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            remember();
            setAsked(true);
          }}
          className="rounded-xl border-2 border-edge bg-panel py-2.5 text-sm font-extrabold active:scale-[0.98]"
        >
          그대로 둘게요
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              const n = await publishMyPrivateRecords();
              remember();
              setDoneCount(n);
              onDone();
            } catch {
              setBusy(false);
            }
          }}
          className="rounded-xl border-2 border-edge bg-candy py-2.5 text-sm font-extrabold text-edge shadow-cute active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-60"
        >
          {busy ? "바꾸는 중…" : "글만 공개"}
        </button>
      </div>
    </div>
  );
}
