"use client";

import { useState } from "react";
import type { EscapeRecord } from "@/lib/store";
import { makeMonthCard } from "@/lib/month-card";

// 지금 보고 있는 달을 9:16 이미지 한 장으로 저장: 휴대폰은 공유 창(인스타 스토리로 바로), 아니면 파일로 내려받는다.
// 달 제목 줄 오른쪽에 놓이는 조용한 글자 버튼.
export default function MonthCardButton({ month, records }: { month: string; records: EscapeRecord[] }) {
  const [busy, setBusy] = useState(false);

  async function save() {
    if (busy) return;
    setBusy(true);
    try {
      const blob = await makeMonthCard(month, records);
      const file = new File([blob], `bangtallog-${month}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `${Number(month.slice(5))}월의 방탈출` });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
    } catch (err) {
      // 공유 창을 닫은 경우는 조용히 넘어간다
      if (!(err instanceof Error && err.name === "AbortError")) alert("이미지를 만들지 못했어요. 잠시 뒤 다시 해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={save}
      disabled={busy}
      className="-mr-1 min-h-[36px] rounded-lg px-1 text-[13px] text-cream/70 transition-colors hover:text-cream disabled:opacity-60"
    >
      {busy ? "이미지 만드는 중…" : "이번 달 이미지로 저장"}
    </button>
  );
}
