import Link from "next/link";
import Image from "next/image";
import type { EscapeRecord } from "@/lib/store";

function DoorIcon() {
  return (
    <Image
      src="/door-open.png"
      alt="열린 문"
      width={28}
      height={28}
      className="inline-block h-7 w-7 shrink-0 object-contain align-[-5px]"
    />
  );
}

// 로그인한 사용자에게 보이는 상단 배너.
// 내 기록 요약 스탯을 보여주고 기록 추가를 유도한다. 기록이 없으면 첫 기록 유도로 전환.
export default function LoggedInHero({ records }: { records: EscapeRecord[] }) {
  const total = records.length;
  const successRate = total
    ? Math.round((records.filter((r) => r.success).length / total) * 100)
    : 0;
  const avgRating = total
    ? (
        records.reduce((s, r) => s + (Number(r.rating) || 0), 0) / total
      ).toFixed(1)
    : "0.0";

  const empty = total === 0;

  return (
    <div className="rough flex flex-col gap-3 rounded-2xl border-2 border-edge bg-candy/10 p-4 shadow-cute sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        {empty ? (
          <>
            <h2 className="flex items-center gap-1.5 text-base font-extrabold">
              <DoorIcon /> 첫 탈출 기록을 남겨볼까요?
            </h2>
            <p className="mt-0.5 text-sm text-cream/70">
              방 하나만 기록해도 취향 분석·추천이 시작돼요. 30초면 충분해요.
            </p>
          </>
        ) : (
          <>
            <h2 className="flex items-center gap-1.5 text-base font-extrabold">
              <DoorIcon /> 내 탈출 업적
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-bold text-cream">
              <span>
                플레이한 방{" "}
                <b className="text-lg font-extrabold text-candy">{total}</b>
              </span>
              <span className="text-cream/30">·</span>
              <span>
                성공률{" "}
                <b className="text-lg font-extrabold text-candy">
                  {successRate}%
                </b>
              </span>
              <span className="text-cream/30">·</span>
              <span>
                평균 별점{" "}
                <b className="text-lg font-extrabold text-candy">{avgRating}</b>
              </span>
            </div>
          </>
        )}
      </div>
      <div className="flex shrink-0 gap-2">
        {!empty && (
          <Link
            href="/records"
            className="rough inline-flex items-center justify-center rounded-xl border-2 border-edge bg-panel px-4 py-2.5 text-sm font-extrabold shadow-cute transition active:scale-[0.97]"
          >
            내 기록 보기
          </Link>
        )}
        <Link
          href="/new"
          className="rough inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-edge bg-candy px-5 py-2.5 text-sm font-extrabold text-white shadow-cute transition active:scale-[0.97]"
        >
          {!empty && (
            <span className="text-lg leading-none" aria-hidden="true">
              +
            </span>
          )}
          {empty ? "기록 시작하기" : "기록 추가하기"}
        </Link>
      </div>
    </div>
  );
}
