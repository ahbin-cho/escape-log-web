"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getPublicFeed,
  GENRE_EMOJI,
  GENRE_COLOR,
  type PublicReview,
} from "@/lib/store";
import { ratingLabel, achievements } from "@/lib/terms";

export default function FeedPage() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getPublicFeed().then((r) => {
      setReviews(r);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return <p className="py-20 text-center text-cream/60">불러오는 중…</p>;
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-extrabold sm:text-2xl">🌏 모두의 후기</h1>
        <p className="text-sm text-cream/70">
          다른 사람들이 공개한 방탈출 후기예요. 기록을 남길 때 “공개 후기로
          올리기”를 켜면 여기에 보여요.
        </p>
      </header>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-edge/40 bg-panel py-16 text-center">
          <p className="text-sm text-cream/60">아직 공개된 후기가 없어요</p>
          <Link
            href="/new"
            className="rough mt-3 inline-block rounded-xl border-2 border-edge bg-candy px-4 py-2 text-sm font-bold text-white shadow-cute transition active:scale-[0.97]"
          >
            첫 후기 남기기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <article
              key={r.id}
              className="rough flex flex-col gap-2 rounded-2xl border-2 border-edge bg-panel p-4 shadow-cute"
            >
              {r.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.photoUrl}
                  alt={r.themeName}
                  className="h-40 w-full rounded-xl border-2 border-edge object-cover"
                />
              )}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-extrabold leading-tight">{r.themeName}</h2>
                  {r.cafeName && (
                    <p className="text-xs text-cream/60">{r.cafeName}</p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-lg border-2 border-edge px-2 py-0.5 text-xs font-bold ${GENRE_COLOR[r.genre]}`}
                >
                  {GENRE_EMOJI[r.genre]} {r.genre}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                {ratingLabel(r.rating) && (
                  <span className="rounded-md border-2 border-candy/50 bg-candy/10 px-2 py-0.5 text-xs font-extrabold text-candy">
                    {ratingLabel(r.rating)}
                  </span>
                )}
                <span
                  className={`text-xs font-bold ${
                    r.success ? "text-mint" : "text-cream/70"
                  }`}
                >
                  {r.success ? "탈출 성공" : "탈출 실패"}
                </span>
                {r.partySize > 0 && (
                  <span className="text-xs font-bold text-cream/60">
                    · {r.partySize}명
                  </span>
                )}
                {achievements(r).map((a) => (
                  <span
                    key={a}
                    className="rounded-md border-2 border-edge bg-candy px-1.5 py-0.5 text-[11px] font-extrabold text-white"
                  >
                    {a}
                  </span>
                ))}
              </div>

              {r.oneLiner && (
                <p className="text-sm leading-relaxed text-cream/80">
                  “{r.oneLiner}”
                </p>
              )}

              <p className="mt-auto pt-1 text-xs font-bold text-cream/60">
                — {r.nickname}
                {r.playedAt && (
                  <span className="ml-1 font-normal text-cream/45">
                    · {r.playedAt}
                  </span>
                )}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
