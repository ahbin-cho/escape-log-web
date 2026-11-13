"use client";

import { useEffect, useState } from "react";
import { md, openStatus, shortRule, type OpenStatus } from "@/lib/booking-open";

// 테마 상세: "지금은 11/20(금)까지 예약할 수 있어요 · 11/21(토)은 오늘 밤 12시에 열려요"
// 날짜는 보는 순간의 한국 시간으로 계산한다(페이지는 미리 만들어 두므로 화면에서 계산).
export default function BookingOpen({ rule }: { rule: string | null | undefined }) {
  const [s, setS] = useState<OpenStatus | null | undefined>(undefined);
  useEffect(() => {
    setS(openStatus(rule, new Date()));
    const id = setInterval(() => setS(openStatus(rule, new Date())), 60_000);
    return () => clearInterval(id);
  }, [rule]);

  if (!rule?.trim()) {
    return (
      <div className="rounded-2xl border border-line bg-panel px-4 py-3.5">
        <p className="text-[15px] font-extrabold">예약 오픈일은 아직 확인 중이에요</p>
        <p className="mt-0.5 text-[13px] text-cream/70">매장마다 며칠 전에 열리는지가 달라요. 예약 페이지에서 날짜를 확인해 주세요.</p>
      </div>
    );
  }
  if (s === undefined) {
    return <div className="h-[86px] rounded-2xl bg-ink" aria-hidden />;
  }
  if (s === null) {
    return (
      <div className="rounded-2xl border border-line bg-panel px-4 py-3.5">
        <p className="text-[15px] font-extrabold">예약 오픈 · {rule}</p>
      </div>
    );
  }
  if (s.wide) {
    return (
      <div className="rounded-2xl bg-[#EAF4EC] px-4 py-3.5">
        <p className="text-[13px] font-extrabold text-[#2F6B45]">예약 오픈 · {s.rule}</p>
        <p className="mt-1 text-[17px] font-extrabold leading-snug">원하는 날짜를 지금 바로 예약할 수 있어요</p>
        <p className="mt-0.5 text-[13px] text-cream/70">인기 시간대는 빨리 차니 예약 페이지에서 남은 자리를 확인해 주세요.</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl bg-[#FFF3E6] px-4 py-3.5" aria-live="polite">
      <p className="text-[13px] font-extrabold text-[#A85A14]">예약 오픈 · {s.rule}</p>
      {s.lastBookable && (
        <p className="mt-1 text-[17px] font-extrabold leading-snug">
          지금은 <span className="text-[#C2551A]">{md(s.lastBookable)}</span>
          {s.approx && !s.next ? " 무렵" : ""}까지 예약할 수 있어요
        </p>
      )}
      {s.next && (
        <p className="mt-0.5 text-[14px] text-cream/80">
          {md(s.next.date)} 예약은 <b className="font-extrabold">{s.next.when}</b>에 열려요
        </p>
      )}
      {s.approx && (
        <p className="mt-1 text-[12px] text-cream/60">정확한 시각은 매장 공지·예약 페이지에서 확인해 주세요.</p>
      )}
    </div>
  );
}

// 목록 카드용 작은 꼬리표: "7일 전 오픈"
export function BookingOpenChip({ rule, className = "" }: { rule: string | null | undefined; className?: string }) {
  const t = shortRule(rule);
  if (!t) return null;
  const wide = t === "예약 넉넉";
  return (
    <span
      className={`inline-block rounded-md px-1.5 py-0.5 text-[11px] font-extrabold ${wide ? "bg-[#EAF4EC] text-[#2F6B45]" : "bg-[#FFF3E6] text-[#A85A14]"} ${className}`}
    >
      {t}
    </span>
  );
}
