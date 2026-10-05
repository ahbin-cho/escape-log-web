"use client";

import { useEffect, useState } from "react";
import {
  adminBrandClickStats,
  adminClickStats,
  type BrandClickStat,
  type ClickStat,
} from "@/lib/admin";

// 예약 버튼 클릭 집계. 제휴 제안 때 "예약 페이지로 N명 보냄" 근거로 쓴다.
export default function AdminClicksPage() {
  const [stats, setStats] = useState<ClickStat[] | null | undefined>(undefined);

  const [brands, setBrands] = useState<BrandClickStat[]>([]);

  useEffect(() => {
    adminClickStats().then(setStats);
    adminBrandClickStats().then((b) => setBrands(b ?? []));
  }, []);

  if (stats === undefined) {
    return <p className="py-10 text-center text-cream/55">불러오는 중…</p>;
  }
  if (stats === null) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-edge/40 bg-panel p-6 text-sm text-cream/70">
        집계를 읽지 못했어요. 관리자 계정으로 로그인했는지, Supabase SQL Editor
        에서 <code>supabase/schema.sql</code> 의 “예약 클릭 집계” 부분을
        실행했는지 확인해 주세요.
      </p>
    );
  }
  if (stats.length === 0) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-edge/40 bg-panel py-10 text-center text-sm text-cream/60">
        아직 집계된 예약 클릭이 없어요
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-lg font-extrabold">브랜드별 예약 클릭</h2>
        <Table
          head={["브랜드", "최근 30일", "누적"]}
          rows={brands.map((b) => [b.brand, b.last30, b.total])}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-extrabold">테마별 예약 클릭 (상위 200)</h2>
        <Table
          head={["테마", "매장", "최근 30일", "누적"]}
          rows={stats.map((s) => [s.themeName, s.cafe, s.last30, s.total])}
        />
      </section>
    </div>
  );
}

function Table({
  head,
  rows,
}: {
  head: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border-2 border-edge bg-panel">
      <table className="w-full text-left text-sm">
        <thead className="border-b-2 border-edge/15 text-xs text-cream/60">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-2 font-bold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-edge/10 last:border-0">
              {r.map((cell, j) => (
                <td
                  key={j}
                  className={`px-4 py-2 ${
                    typeof cell === "number" ? "font-extrabold tabular-nums" : "font-bold"
                  }`}
                >
                  {typeof cell === "number" ? cell.toLocaleString() : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
