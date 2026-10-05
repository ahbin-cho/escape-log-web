"use client";

import Link from "next/link";
import type { QuizValues, TypeId } from "@/lib/quiz/slots";
import type { SharedResult } from "@/lib/quiz/share";
import type { Recommendation } from "@/lib/store";
import RecommendCard from "@/components/RecommendCard";
import TypeCard from "@/components/quiz/TypeCard";
import TypeRarity from "@/components/quiz/TypeRarity";
import ShareButton from "@/components/quiz/ShareButton";
import FriendCompat from "@/components/quiz/FriendCompat";

export default function QuizResult({
  typeId,
  values,
  brand,
  recs,
  friend,
  onRestart,
}: {
  typeId: TypeId;
  values: QuizValues;
  brand: { name: string; reason: string } | null;
  recs: Recommendation[];
  friend: SharedResult | null; // 공유 링크로 들어와 퀴즈를 한 경우 그 친구
  onRestart: () => void;
}) {
  return (
    <div className="space-y-8">
      <TypeCard
        eyebrow="너의 방탈출 유형"
        typeId={typeId}
        fear={values.fear}
        difficulty={values.difficulty}
        hint={values.hint}
        players={values.players}
        time={values.time}
      >
        <TypeRarity typeId={typeId} />
        <ShareButton values={values} />
      </TypeCard>

      {friend && (
        <FriendCompat
          friend={friend}
          me={{
            name: "나",
            genre: values.genre,
            fear: values.fear,
            diff: values.difficulty,
          }}
        />
      )}

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl">추천 테마</h2>
          {recs.length > 0 && (
            <span className="text-xs text-cream/55">스포 수위는 카드마다 조절 가능</span>
          )}
        </div>
        {brand && (
          <p className="text-sm font-bold text-cream/70">
            아래 추천 중엔{" "}
            <span className="font-extrabold text-candy">{brand.name}</span> 방이
            제일 많아.{brand.reason && ` ${brand.reason}.`}
          </p>
        )}
        {recs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {recs.map((r) => (
              <RecommendCard key={r.id} rec={r} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border-2 border-dashed border-edge/40 bg-panel px-4 py-10 text-center text-sm text-cream/60">
            추천 테마를 불러오지 못했어. 잠시 뒤에 다시 진단해 줘.
          </p>
        )}
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onRestart}
          className="rough rounded-xl border-2 border-edge bg-panel px-4 py-2 text-sm font-bold transition active:scale-[0.97]"
        >
          다시 진단
        </button>
        <Link
          href="/region"
          className="rough rounded-xl border-2 border-edge bg-panel px-4 py-2 text-sm font-bold transition active:scale-[0.97]"
        >
          지역별 테마
        </Link>
        <Link
          href="/taste"
          className="rough rounded-xl border-2 border-edge bg-panel px-4 py-2 text-sm font-bold transition active:scale-[0.97]"
        >
          취향 페이지로
        </Link>
      </div>
    </div>
  );
}
