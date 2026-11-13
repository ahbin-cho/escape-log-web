"use client";

import { useState } from "react";
import { TONE } from "@/components/PosterTile";
import { makeReviewImage } from "@/lib/review-image";
import { ratingLabel, achievements } from "@/lib/terms";

// 후기 카드: 사진이 있으면 살짝 어둡게 깔고 그 위에 한줄 후기를 얹는다. 없으면 장르 색 바탕.
// 오른쪽 위 버튼으로 같은 모양의 이미지(4:5)를 만들어 공유하거나 저장한다.
export type ReviewCardData = {
  themeName: string;
  cafeName: string;
  genre: string;
  rating: number;
  success: boolean;
  remainingTime: string;
  hintCount: number;
  partySize: number;
  oneLiner: string;
  photoUrl: string;
  playedAt: string;
};

export function reviewChips(r: ReviewCardData): string[] {
  return [
    r.success ? "탈출 성공" : "탈출 실패",
    r.success && r.remainingTime ? `${r.remainingTime} 남김` : "",
    ...achievements(r),
    ratingLabel(r.rating),
    r.partySize > 0 ? `${r.partySize}명` : "",
  ].filter(Boolean);
}

export default function ReviewCard({
  review: r,
  byline,
  children,
}: {
  review: ReviewCardData;
  byline?: string; // "— 닉네임", "47번째 방" 등
  children?: React.ReactNode; // 카드 아래에 붙일 것(수정 링크 등)
}) {
  const tone = TONE[r.genre] ?? TONE["기타"];
  const chips = reviewChips(r);
  const [busy, setBusy] = useState(false);
  const [photoOk, setPhotoOk] = useState(true);

  async function share(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      const blob = await makeReviewImage({ ...r, chips, byline, tone });
      const file = new File([blob], "bangtallog-review.jpg", { type: "image/jpeg" });
      const text = `${r.themeName}${r.oneLiner ? ` — “${r.oneLiner}”` : ""} · 방탈로그`;
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text });
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
    <article className="overflow-hidden rounded-2xl bg-panel ring-1 ring-edge/15">
      <div className="relative aspect-[4/5] text-white" style={{ backgroundColor: tone.bg }}>
        {r.photoUrl && photoOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={r.photoUrl}
            alt={`${r.themeName} 인증샷`}
            loading="lazy"
            onError={() => setPhotoOk(false)}
            className="absolute inset-0 h-full w-full object-cover opacity-[0.65]"
          />
        ) : (
          <span className="absolute inset-0" style={{ backgroundImage: `linear-gradient(150deg, ${tone.accent}55 0%, transparent 60%)` }} />
        )}
        <span className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/80" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 text-[11px] font-extrabold tracking-wide text-white/85">
          <span>
            {r.genre}
            {r.playedAt ? ` · ${r.playedAt.replaceAll("-", ".")}` : ""}
          </span>
          <button
            onClick={share}
            aria-label="후기 카드 이미지로 공유"
            className="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-extrabold backdrop-blur transition hover:bg-white/25 active:scale-95"
          >
            {busy ? "만드는 중…" : "공유 ↗"}
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 space-y-2.5 p-4">
          {r.oneLiner && (
            <p className="line-clamp-4 text-lg font-extrabold leading-snug [word-break:keep-all]">“{r.oneLiner}”</p>
          )}
          <span className="block h-[3px] w-8 rounded-full" style={{ backgroundColor: tone.accent }} />
          <div>
            <h3 className="text-base leading-tight">{r.themeName || "(제목 없음)"}</h3>
            {r.cafeName && <p className="mt-0.5 text-xs text-white/70">{r.cafeName}</p>}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {chips.map((c, i) => (
              <span
                key={c}
                className="rounded-full px-2 py-0.5 text-[11px] font-extrabold"
                style={i === 0 ? { backgroundColor: tone.accent, color: "#1D1D1D" } : { backgroundColor: "rgba(255,255,255,.18)" }}
              >
                {c}
              </span>
            ))}
          </div>
          {byline && <p className="text-[11px] font-bold text-white/60">{byline}</p>}
        </div>
      </div>
      {children}
    </article>
  );
}
