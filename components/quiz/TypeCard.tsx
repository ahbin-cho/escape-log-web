"use client";

import { useState } from "react";
import Image from "next/image";
import type { TimePref, TypeId } from "@/lib/quiz/slots";
import { PLAYERS_LABEL, QUIZ_TYPES, TIME_LABEL, typeImage } from "@/lib/quiz/types";
import { fearTrait } from "@/lib/terms";
import Mascot from "@/components/Mascot";

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

// 유형 그림·이름·한 줄 설명·세부 성향. 내 결과 화면과 공유 화면이 같이 쓴다.
export default function TypeCard({
  eyebrow,
  typeId,
  fear,
  difficulty,
  hint,
  players,
  time,
  children,
}: {
  eyebrow: string;
  typeId: TypeId;
  fear: number;
  difficulty: number;
  hint: number;
  players: number;
  time: TimePref;
  children?: React.ReactNode; // 카드 아래쪽에 붙는 내용(비율, 브랜드 문구, 공유 버튼 등)
}) {
  const type = QUIZ_TYPES[typeId];
  const [noImage, setNoImage] = useState(false);

  return (
    <section className="rounded-2xl border-2 border-edge bg-panel p-6 text-center sm:p-8">
      <p className="text-xs font-bold text-cream/60">{eyebrow}</p>
      {/* 그림은 배경까지 그려진 정사각형 장면이라 둥근 틀에 꽉 채워 넣는다 */}
      <div className="mx-auto mt-4 aspect-square w-56 overflow-hidden rounded-2xl border-2 border-edge bg-candy/15 sm:w-64">
        {noImage ? (
          <Mascot className="h-full w-full p-6" />
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
        <Bar label="공포 내성" value={fear} note={fearTrait(fear)} />
        <Bar label="난이도" value={difficulty} />
        <Bar label="힌트" value={hint} note={HINT_NOTE[hint]} />
        <Text label="인원" value={PLAYERS_LABEL[players] ?? "상관없음"} />
        <Text label="시간" value={TIME_LABEL[time]} />
      </dl>
      {children}
    </section>
  );
}
