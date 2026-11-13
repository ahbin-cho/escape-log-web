import Link from "next/link";
import type { EscapeRecord } from "@/lib/store";
import { nextMilestone } from "@/lib/diary";
import { Chevron } from "@/components/LoggedOutCTA";

// 기록이 있는 사람(가입 전 이 기기 기록 포함)에게 보이는 한 줄: 내 기록 N방 → /records.
export default function LoggedInHero({ records }: { records: EscapeRecord[] }) {
  const total = records.length;
  if (total === 0) return null;
  const rate = Math.round((records.filter((r) => r.success).length / total) * 100);
  const milestone = nextMilestone(total);

  return (
    <div className="flex items-center gap-2 rounded-[14px] border border-line px-4 py-3">
      <Link href="/records" className="flex min-w-0 flex-1 items-center gap-1">
        <span className="min-w-0">
          <b className="block text-[15px] font-extrabold">
            내 기록 <span className="tabular-nums">{total}</span>방
          </b>
          <span className="block truncate text-[13px] tabular-nums text-cream/70">
            탈출 성공 {rate}%
            {milestone ? ` · ${milestone.next}번째 방까지 ${milestone.left}방` : ""}
          </span>
        </span>
        <Chevron className="text-cream/50" />
      </Link>
      <Link
        href="/new"
        className="shrink-0 rounded-xl bg-edge px-3.5 py-2 text-sm font-extrabold text-white transition active:scale-[0.97]"
      >
        기록하기
      </Link>
    </div>
  );
}
