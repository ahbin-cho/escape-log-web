"use client";

import { useState } from "react";
import type { EscapeRecord } from "@/lib/store";
import { shareReviewImage } from "@/components/ReviewCard";

// 내 기록 하나를 후기 카드 이미지로 공유(휴대폰은 공유 창, 컴퓨터는 이미지 저장).
// 서재 팝업·다이어리 줄·목록 '자세히'에서 같이 쓴다. 가입 전 기록도 공유는 된다(그 기기 안 데이터로 그림).
export default function ShareRecordButton({
  record,
  number,
  className,
  label = "후기 카드로 공유",
}: {
  record: EscapeRecord;
  number?: number;
  className?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  async function share(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    await shareReviewImage(record, number ? `${number}번째 방` : undefined);
    setBusy(false);
  }
  return (
    <button type="button" onClick={share} disabled={busy} aria-label={`${record.themeName || "기록"} 후기 카드로 공유`} className={className}>
      {busy ? "만드는 중…" : label}
    </button>
  );
}
