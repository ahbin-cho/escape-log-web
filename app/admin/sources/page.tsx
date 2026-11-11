"use client";

import { useEffect, useMemo, useState } from "react";
import { adminAttributionStats, type AttributionStat } from "@/lib/admin";
import { buildTrackedUrl, rateLabel, SOURCE_PRESETS } from "@/lib/attribution";
import { SITE_URL } from "@/lib/site";

// 유입 출처: 커뮤니티·광고·검색에서 온 사람이 무엇을 했는지 + 추적 링크 만들기.
const PAGES: [string, string][] = [
  ["/", "홈"],
  ["/quiz", "취향 찾기"],
  ["/match", "친구·팀 궁합"],
  ["/diary", "방탈출 기록장 소개"],
  ["/best", "조건별 추천 목록"],
  ["/best/안-무서운-방탈출", "안 무서운 방탈출"],
  ["/best/2인-방탈출", "2인·데이트"],
  ["/best/입문-방탈출", "입문·초보"],
  ["/region/서울", "서울 방탈출"],
];

const LABEL = new Map(SOURCE_PRESETS.map(([k, label]) => [k, label]));
const EXTRA_LABEL: Record<string, string> = {
  naver_search: "네이버 검색",
  google: "구글 검색",
  bing: "Bing 검색",
  daum_search: "다음 검색",
  naver_blog: "네이버 블로그",
  facebook: "페이스북",
};
const sourceLabel = (s: string) => LABEL.get(s) ?? EXTRA_LABEL[s] ?? s;

export default function AdminSourcesPage() {
  const [stats, setStats] = useState<AttributionStat[] | null | undefined>(undefined);

  useEffect(() => {
    adminAttributionStats().then(setStats);
  }, []);

  return (
    <div className="space-y-10">
      <LinkBuilder />

      <section className="space-y-3">
        <h2 className="text-lg font-extrabold">출처별 결과 (최근 30일)</h2>
        <p className="text-xs text-cream/60">
          출처(링크 꼬리표나 넘어온 사이트)가 있는 방문만 셉니다. 숫자는 고유 방문자 수이고,
          괄호는 방문자 대비 비율이에요. 한 사람이 30일 안에 다른 출처로 다시 오면 새 출처로 셉니다.
        </p>
        {stats === undefined ? (
          <p className="py-6 text-center text-sm text-cream/55">불러오는 중…</p>
        ) : stats === null ? (
          <p className="rounded-2xl border-2 border-dashed border-edge/40 bg-panel p-6 text-sm text-cream/70">
            집계를 읽지 못했어요. 관리자 계정인지, Supabase SQL Editor 에서{" "}
            <code>supabase/schema.sql</code> 을 다시 실행했는지 확인해 주세요.
          </p>
        ) : stats.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-edge/40 bg-panel py-10 text-center text-sm text-cream/60">
            아직 출처가 잡힌 방문이 없어요. 위에서 만든 링크로 글을 올려 보세요.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border-2 border-edge bg-panel">
            <table className="w-full text-left text-sm">
              <thead className="border-b-2 border-edge/15 text-xs text-cream/60">
                <tr>
                  {["출처", "캠페인", "방문자", "취향 찾기", "기록", "가입", "예약 이동"].map((h) => (
                    <th key={h} className="whitespace-nowrap px-4 py-2 font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.map((r) => (
                  <tr key={`${r.source}|${r.medium}|${r.campaign}`} className="border-b border-edge/10 last:border-0">
                    <td className="whitespace-nowrap px-4 py-2 font-bold">
                      {sourceLabel(r.source)}
                      <span className="ml-1 text-xs font-normal text-cream/45">{r.medium}</span>
                    </td>
                    <td className="px-4 py-2 text-cream/70">{r.campaign || "–"}</td>
                    <td className="px-4 py-2 font-extrabold tabular-nums">{r.visitors}</td>
                    {[r.quizDone, r.recordSaved, r.signup, r.reserveClick].map((n, i) => (
                      <td key={i} className="whitespace-nowrap px-4 py-2 tabular-nums">
                        <b>{n}</b>{" "}
                        <span className="text-xs text-cream/50">({rateLabel(n, r.visitors)})</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function LinkBuilder() {
  const [source, setSource] = useState(SOURCE_PRESETS[0][0]);
  const [custom, setCustom] = useState("");
  const [campaign, setCampaign] = useState("");
  const [path, setPath] = useState("/quiz");
  const [copied, setCopied] = useState(false);

  const preset = SOURCE_PRESETS.find(([k]) => k === source);
  const realSource = source === "_custom" ? custom : source;
  const medium = preset ? preset[2] : "link";
  const url = useMemo(
    () => (realSource ? buildTrackedUrl(SITE_URL, path, realSource, medium, campaign) : ""),
    [realSource, path, medium, campaign]
  );

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 직접 선택해서 복사
    }
  }

  const input =
    "w-full rounded-xl border-2 border-edge/40 bg-panel px-3 py-2 text-sm outline-none focus:border-candy";

  return (
    <section className="space-y-3 rounded-2xl border-2 border-edge bg-panel p-5">
      <h2 className="text-lg font-extrabold">🔗 추적 링크 만들기</h2>
      <p className="text-xs text-cream/60">
        커뮤니티 글이나 광고에 이 링크를 넣으면, 아래 표에서 그 글로 온 사람이 무엇을 했는지 볼 수 있어요.
        캠페인은 같은 곳에 여러 번 올릴 때 글을 구분하는 이름이에요(예: 첫글, 결산이벤트).
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block font-bold text-cream/70">어디에 올리나요</span>
          <select className={input} value={source} onChange={(e) => setSource(e.target.value)}>
            {SOURCE_PRESETS.map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
            <option value="_custom">직접 입력…</option>
          </select>
          {source === "_custom" && (
            <input
              className={`${input} mt-2`}
              placeholder="영문 이름 (예: club_enigma)"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
            />
          )}
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-bold text-cream/70">캠페인 (선택)</span>
          <input
            className={input}
            placeholder="예: 첫글"
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-bold text-cream/70">도착 페이지</span>
          <select className={input} value={path} onChange={(e) => setPath(e.target.value)}>
            {PAGES.map(([p, label]) => (
              <option key={p} value={p}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {url && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <code className="min-w-0 flex-1 break-all rounded-lg border border-edge/20 bg-ink p-2 text-xs">
            {url}
          </code>
          <button
            type="button"
            onClick={copy}
            className="rough shrink-0 rounded-xl border-2 border-edge bg-candy px-4 py-2 text-sm font-extrabold text-white shadow-cute active:scale-[0.97]"
          >
            {copied ? "복사했어요" : "복사"}
          </button>
        </div>
      )}
    </section>
  );
}
