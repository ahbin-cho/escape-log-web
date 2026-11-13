"use client";

import { useState } from "react";
import { makeStoryCard, type StoryCardInput } from "@/lib/quiz/story-card";

// 결과 스토리 카드(9:16) 저장: 휴대폰은 공유 창(인스타 스토리로 바로), 아니면 파일로 내려받는다.
export default function StoryCardButton(props: StoryCardInput) {
  const [busy, setBusy] = useState(false);

  async function save() {
    if (busy) return;
    setBusy(true);
    try {
      const blob = await makeStoryCard(props);
      const file = new File([blob], "bangtallog-type.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "내 방탈 유형" });
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
      className="rough mx-auto mt-3 block rounded-xl border-2 border-edge bg-panel px-6 py-3 text-sm font-extrabold transition active:scale-[0.97] disabled:opacity-60"
    >
      {busy ? "카드 만드는 중…" : "스토리 카드 저장"}
    </button>
  );
}
