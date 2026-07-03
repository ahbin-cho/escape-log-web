"use client";

import { useEffect, useState } from "react";
import {
  adminListReviews,
  setReviewHidden,
  adminDeleteReview,
} from "@/lib/admin";
import { GENRE_EMOJI, type PublicReview } from "@/lib/store";

export default function AdminReviews() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [ready, setReady] = useState(false);

  async function reload() {
    const r = await adminListReviews();
    setReviews(r);
    setReady(true);
  }

  useEffect(() => {
    reload();
  }, []);

  async function toggleHidden(r: PublicReview) {
    await setReviewHidden(r.id, !r.hidden);
    reload();
  }

  async function remove(r: PublicReview) {
    if (!confirm(`"${r.themeName}" 후기를 완전히 삭제할까요?`)) return;
    await adminDeleteReview(r.id);
    reload();
  }

  if (!ready) {
    return <p className="py-16 text-center text-cream/60">불러오는 중…</p>;
  }

  if (reviews.length === 0) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-edge/40 bg-panel py-12 text-center text-sm text-cream/60">
        공개된 후기가 아직 없어요
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-cream/70">
        공개 후기 {reviews.length}개. <b>숨김</b>은 피드에서 감추지만 삭제하지
        않고, <b>삭제</b>는 되돌릴 수 없어요.
      </p>
      {reviews.map((r) => (
        <div
          key={r.id}
          className={`rough flex flex-col gap-2 rounded-2xl border-2 border-edge p-4 shadow-cute sm:flex-row sm:items-center sm:justify-between ${
            r.hidden ? "bg-stone-100" : "bg-panel"
          }`}
        >
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-extrabold">
              {GENRE_EMOJI[r.genre]} {r.themeName}
              {r.hidden && (
                <span className="rounded-md bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-600">
                  숨김
                </span>
              )}
            </p>
            <p className="text-xs text-cream/60">
              {r.cafeName} · {r.nickname} · ⭐{r.rating}
              {r.playedAt && ` · ${r.playedAt}`}
            </p>
            {r.oneLiner && (
              <p className="mt-1 truncate text-sm text-cream/80">“{r.oneLiner}”</p>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => toggleHidden(r)}
              className="rounded-xl border-2 border-edge px-3 py-1.5 text-sm font-bold transition active:scale-[0.97]"
            >
              {r.hidden ? "숨김 해제" : "숨기기"}
            </button>
            <button
              onClick={() => remove(r)}
              className="rounded-xl border-2 border-red-400/60 px-3 py-1.5 text-sm font-bold text-red-500 transition active:scale-[0.97] hover:bg-red-50"
            >
              삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
