"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { QuizValues, TypeId } from "@/lib/quiz/slots";
import {
  MASCOT,
  PLAYERS_LABEL,
  QUIZ_TYPES,
  TIME_LABEL,
  typeImage,
} from "@/lib/quiz/types";
import { fearTrait } from "@/lib/terms";
import type { Recommendation } from "@/lib/store";
import RecommendCard from "@/components/RecommendCard";

function Bar({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="flex items-center gap-3">
      <dt className="w-20 shrink-0 text-sm font-bold text-cream/70">{label}</dt>
      <dd className="flex flex-1 items-center gap-3">
        <span className="flex gap-1" aria-hidden>
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`h-2.5 w-6 rounded-full border border-edge ${
                i <= value ? "bg-candy" : "bg-ink"
              }`}
            />
          ))}
        </span>
        <span className="text-xs font-bold text-cream/60">
          <span className="sr-only">5단계 중 {value}단계. </span>
          {note}
        </span>
      </dd>
    </div>
  );
}

function Text({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <dt className="w-20 shrink-0 text-sm font-bold text-cream/70">{label}</dt>
      <dd className="text-sm font-extrabold">{value}</dd>
    </div>
  );
}

const HINT_NOTE = ["", "끝까지 버틴다", "웬만하면 버틴다", "적당히 쓴다", "막히면 쓴다", "바로 쓴다"];

export default function QuizResult({
  typeId,
  values,
  brand,
  recs,
  onRestart,
}: {
  typeId: TypeId;
  values: QuizValues;
  brand: { name: string; reason: string };
  recs: Recommendation[];
  onRestart: () => void;
}) {
  const type = QUIZ_TYPES[typeId];
  const [noImage, setNoImage] = useState(false);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border-2 border-edge bg-panel p-6 text-center sm:p-8">
        <p className="text-xs font-bold text-cream/60">너의 방탈출 유형</p>
        {/* 그림은 배경까지 그려진 정사각형 장면이라 둥근 틀에 꽉 채워 넣는다 */}
        <div className="mx-auto mt-4 aspect-square w-56 overflow-hidden rounded-2xl border-2 border-edge bg-candy/15 sm:w-64">
          {noImage ? (
            <span
              aria-hidden
              className="flex h-full w-full items-center justify-center text-7xl"
            >
              {MASCOT.emoji}
            </span>
          ) : (
            <Image
              src={typeImage(typeId)}
              alt=""
              width={512}
              height={512}
              priority
              onError={() => setNoImage(true)}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <h1 className="mt-4 text-2xl sm:text-3xl">{type.title}</h1>
        <p className="mx-auto mt-2 max-w-md leading-relaxed text-cream/70 [word-break:keep-all]">
          {type.tagline}
        </p>

        <dl className="mx-auto mt-6 max-w-sm space-y-2.5 text-left">
          <Bar label="공포 내성" value={values.fear} note={fearTrait(values.fear)} />
          <Bar label="난이도" value={values.difficulty} />
          <Bar label="힌트" value={values.hint} note={HINT_NOTE[values.hint]} />
          <Text label="인원" value={PLAYERS_LABEL[values.players] ?? "상관없음"} />
          <Text label="시간" value={TIME_LABEL[values.time]} />
        </dl>

        <p className="mt-6 text-sm font-bold text-cream/70">
          <span className="font-extrabold text-candy">{brand.name}</span>
          {" "}쪽이 잘 맞아. {brand.reason}.
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl">추천 테마</h2>
          {recs.length > 0 && (
            <span className="text-xs text-cream/55">스포 수위는 카드마다 조절 가능</span>
          )}
        </div>
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
          className="rough rounded-xl border-2 border-edge bg-candy px-4 py-2 text-sm font-bold text-white shadow-cute transition active:scale-[0.97]"
        >
          취향 페이지로
        </Link>
      </div>
    </div>
  );
}
