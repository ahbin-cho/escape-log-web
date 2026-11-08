"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getMyThemeRecords,
  getThemePublicReviews,
  type EscapeRecord,
  type PublicReview,
} from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { isSameTheme, summarizeReviews } from "@/lib/reviews";
import { ratingLabel } from "@/lib/terms";

function hintText(n: number): string {
  if (n < 0) return "힌트 무제한";
  if (n === 0) return "노힌트";
  return `힌트 ${n}`;
}

// 테마 상세 하단: 내 기록 + 모두의 후기(공개 후기만, 스포 메모는 애초에 안 읽음).
export default function ThemeReviews({
  themeId,
  themeName,
  cafe,
}: {
  themeId: string;
  themeName: string;
  cafe: string;
}) {
  const [mine, setMine] = useState<EscapeRecord[]>([]);
  const [all, setAll] = useState<PublicReview[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setReady(true);
      return;
    }
    Promise.all([getMyThemeRecords(themeName), getThemePublicReviews(themeName)]).then(
      ([m, a]) => {
        const theme = { name: themeName, cafe };
        setMine(m.filter((r) => isSameTheme(r, theme)));
        setAll(a.filter((r) => isSameTheme(r, theme)));
        setReady(true);
      },
      () => setReady(true)
    );
  }, [themeName, cafe]);

  const summary = useMemo(() => summarizeReviews(all), [all]);
  const recordHref = `/new?theme=${themeId}`;

  return (
    <section className="space-y-5" aria-labelledby="theme-reviews">
      {/* 내 기록 */}
      {mine.length > 0 && (
        <div className="rough space-y-2 rounded-2xl border-2 border-candy/60 bg-candy/10 p-4">
          <h2 className="text-lg font-extrabold">📓 내 기록</h2>
          <ul className="space-y-1.5">
            {mine.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/edit/${r.id}`}
                  className="flex flex-wrap items-center gap-1.5 text-sm font-bold hover:text-candy"
                >
                  <span className="text-cream/60">{r.playedAt || "날짜 없음"}</span>
                  <span className={r.success ? "text-mint" : "text-cream/60"}>
                    {r.success ? `탈출${r.remainingTime ? ` · ${r.remainingTime} 남김` : ""}` : "실패"}
                  </span>
                  <span className="text-cream/60">{hintText(r.hintCount)}</span>
                  {ratingLabel(r.rating) && (
                    <span className="text-candy">{ratingLabel(r.rating)}</span>
                  )}
                  <span className="text-xs text-cream/50">수정 →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 모두의 후기 */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 id="theme-reviews" className="text-lg font-extrabold">
            💬 모두의 후기 {summary ? <span className="text-cream/50">{summary.count}</span> : null}
          </h2>
          <Link href="/feed" className="text-xs font-bold text-candy">
            전체 후기 →
          </Link>
        </div>

        {summary && (
          <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm font-bold text-cream/70">
            <span>탈출 성공률 {summary.successRate}%</span>
            <span>평균 별점 {summary.avgRating}</span>
            {summary.noHint > 0 && <span>노힌트 {summary.noHint}명</span>}
          </p>
        )}

        {!ready ? (
          <p className="text-sm text-cream/55">후기 불러오는 중…</p>
        ) : all.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-edge/40 bg-panel p-5 text-center">
            <p className="text-sm font-bold">아직 공개 후기가 없어요</p>
            <p className="mt-1 text-sm text-cream/60">
              다녀왔다면 첫 후기를 남겨 주세요. 스포 없이 한 줄이면 충분해요.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {all.map((r) => (
              <li key={r.id} className="flex gap-3 rounded-2xl border-2 border-edge bg-panel p-3.5">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                    <span className="font-extrabold">{r.nickname}</span>
                    <span className={r.success ? "text-mint" : "text-cream/55"}>
                      {r.success ? "탈출" : "실패"}
                    </span>
                    <span className="text-cream/55">{hintText(r.hintCount)}</span>
                    {ratingLabel(r.rating) && (
                      <span className="rounded-md bg-candy/10 px-1.5 py-0.5 text-candy">
                        {ratingLabel(r.rating)}
                      </span>
                    )}
                    {r.playedAt && <span className="text-cream/45">{r.playedAt}</span>}
                  </p>
                  {r.oneLiner && <p className="mt-1 text-sm text-cream/85">“{r.oneLiner}”</p>}
                </div>
                {r.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={r.photoUrl}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-xl border-2 border-edge object-cover"
                  />
                )}
              </li>
            ))}
          </ul>
        )}

        <Link
          href={recordHref}
          className="rough block rounded-xl border-2 border-edge bg-panel px-4 py-3 text-center text-sm font-extrabold transition hover:border-candy active:scale-[0.99]"
        >
          {mine.length > 0 ? "✍️ 이 방 또 기록하기" : "✍️ 다녀왔다면 이 방 기록하기 (로그인 없이 가능)"}
        </Link>
      </div>
    </section>
  );
}
