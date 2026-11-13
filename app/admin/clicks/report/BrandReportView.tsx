"use client";

import { useEffect, useMemo, useState } from "react";
import { adminBrandClickRows } from "@/lib/admin";
import {
  buildBrandReport,
  MIN_TYPED_FOR_SHARE,
  reportMessage,
  type ClickRow,
  type Share,
} from "@/lib/report";
import { SITE_NAME } from "@/lib/site";

export default function BrandReportView({ brand }: { brand: string }) {
  const [rows, setRows] = useState<ClickRow[] | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    adminBrandClickRows(brand).then(setRows);
  }, [brand]);

  const report = useMemo(() => (rows ? buildBrandReport(rows) : null), [rows]);
  const message = useMemo(
    () => (report ? reportMessage(brand, report, SITE_NAME) : ""),
    [brand, report]
  );

  if (rows === undefined) {
    return <p className="py-10 text-center text-cream/55">불러오는 중…</p>;
  }
  if (rows === null || !report) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-edge/40 bg-panel p-6 text-sm text-cream/70">
        클릭 기록을 읽지 못했어요. 관리자 계정인지 확인해 주세요.
      </p>
    );
  }

  const today = new Date();
  const from = new Date(today.getTime() - 30 * 24 * 3600 * 1000);
  const fmt = (d: Date) =>
    `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 복사 실패 시 사용자가 직접 선택해서 복사
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="rough rounded-xl border-2 border-edge bg-candy px-4 py-2 text-sm font-extrabold text-edge shadow-cute active:scale-[0.97]"
        >
          🖨️ 인쇄 / PDF 저장
        </button>
        <button
          type="button"
          onClick={copy}
          className="rough rounded-xl border-2 border-edge bg-panel px-4 py-2 text-sm font-extrabold active:scale-[0.97]"
        >
          {copied ? "복사했어요" : "✉️ 메일 초안 복사"}
        </button>
      </div>

      <header className="space-y-1">
        <p className="text-xs font-bold text-cream/50">
          {SITE_NAME} 매장 리포트 · {fmt(from)} ~ {fmt(today)} (최근 30일)
        </p>
        <h2 className="text-2xl font-extrabold">{brand}</h2>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="예약 페이지로 이동" value={`${report.total}회`} />
        <Stat
          label="취향 맞춤 추천을 보고 이동"
          value={`${report.sources.find((s) => s.key === "recommend")?.count ?? 0}회`}
        />
        <Stat label="그중 취향 유형을 아는 이동" value={`${report.typed}회`} />
      </section>

      {report.total === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-edge/40 bg-panel py-10 text-center text-sm text-cream/60">
          최근 30일 동안 이 브랜드로 넘어간 클릭이 없어요
        </p>
      ) : (
        <>
          <Bars title="많이 찾은 테마" items={report.themes.slice(0, 10)} />
          {report.branches.length > 1 && (
            <Bars title="지점별" items={report.branches} />
          )}
          {report.types.length > 0 ? (
            <Bars
              title="어떤 취향의 손님이 봤나"
              note={`취향 유형을 아는 이동 ${report.typed}회 기준`}
              items={report.types.slice(0, 6)}
            />
          ) : (
            <p className="text-xs text-cream/50">
              취향 유형 분포는 유형을 아는 이동이 {MIN_TYPED_FOR_SHARE}회 이상일
              때 보여 줘요 (지금 {report.typed}회).
            </p>
          )}
          <Bars title="어디서 눌렀나" items={report.sources} />
          <Bars title="요일별" items={report.weekdays} keepOrder />
        </>
      )}

      <section className="space-y-2 print:hidden">
        <h3 className="text-lg font-extrabold">메일 초안</h3>
        <textarea
          readOnly
          value={message}
          rows={12}
          className="w-full rounded-2xl border-2 border-edge bg-panel p-4 text-sm leading-relaxed"
        />
      </section>

      <p className="text-xs text-cream/45">
        개인을 식별할 수 있는 정보는 수집하지 않으며, 클릭 수와 취향 유형
        집계만 제공합니다.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border-2 border-edge bg-panel p-4">
      <p className="text-xs font-bold text-cream/60">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums">{value}</p>
    </div>
  );
}

function Bars({
  title,
  note,
  items,
  keepOrder,
}: {
  title: string;
  note?: string;
  items: Share[];
  keepOrder?: boolean;
}) {
  const max = Math.max(1, ...items.map((i) => i.count));
  const list = keepOrder ? items : items.filter((i) => i.count > 0);
  return (
    <section className="space-y-2 break-inside-avoid">
      <h3 className="text-lg font-extrabold">
        {title}
        {note && <span className="ml-2 text-xs font-bold text-cream/50">{note}</span>}
      </h3>
      <ul className="space-y-1.5">
        {list.map((i) => (
          <li key={i.key} className="grid grid-cols-[8rem_1fr_4.5rem] items-center gap-2 text-sm sm:grid-cols-[12rem_1fr_5rem]">
            <span className="truncate font-bold" title={i.label}>
              {i.label}
            </span>
            <span className="h-3 rounded-full bg-ink">
              <span
                className="block h-3 rounded-full bg-candy"
                style={{ width: `${(i.count / max) * 100}%` }}
              />
            </span>
            <span className="text-right font-extrabold tabular-nums">
              {i.count} <span className="text-xs text-cream/50">{i.percent}%</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
