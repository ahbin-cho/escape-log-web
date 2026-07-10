import type { Metadata } from "next";
import Link from "next/link";
import { MASCOT } from "@/lib/quiz";

export const metadata: Metadata = {
  title: "방탈로그 소개 — 방탈러를 위한 올인원",
  description:
    "인기순 말고 내 취향 저격. 방탈출 기록·취향 진단·맞춤 추천·친구 궁합까지 무료로. 방탈러를 위한 올인원 서비스 방탈로그를 소개합니다.",
  alternates: { canonical: "/intro" },
  openGraph: {
    title: "방탈로그 — 방 좀 깨봤어? 취향 딱 짚어줄게",
    description:
      "기록·취향 진단·맞춤 추천·친구 궁합까지. 방탈러를 위한 올인원, 무료.",
  },
};

const COMPARE: { label: string; other: string; ours: string }[] = [
  { label: "추천 방식", other: "인기순 그대로", ours: "내 취향 저격" },
  { label: "스포", other: "후기 열면 다 노출", ours: "수위 슬라이더로 조절" },
  { label: "진단 톤", other: "밋밋한 목록", ours: "탈출귀가 콕 짚어줌" },
  { label: "친구랑", other: "따로따로", ours: "취향 궁합 랭킹" },
  { label: "값", other: "이것저것 결제", ours: "무료" },
];

export default function IntroPage() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-2xl border-2 border-edge bg-panel p-8 text-center shadow-cute">
        <div className="text-5xl">{MASCOT.emoji}</div>
        <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">
          방 좀 깨봤어? <br className="sm:hidden" />
          취향 딱 짚어줄게
        </h1>
        <p className="mt-3 text-sm text-cream/70">
          {MASCOT.name}가 오지선다 6개로 네 방탈출 취향을 진단하고,
          <br className="hidden sm:block" /> 딱 맞는 방까지 추천해줄게. (무료!)
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/quiz"
            className="rounded-xl border-2 border-edge bg-candy px-5 py-2.5 text-sm font-bold text-white shadow-cute transition active:scale-[0.97]"
          >
            취향 찾기 시작 →
          </Link>
          <Link
            href="/match"
            className="rounded-xl border-2 border-edge bg-panel px-5 py-2.5 text-sm font-bold transition active:scale-[0.97] hover:border-candy"
          >
            친구랑 궁합 보기
          </Link>
        </div>
      </section>

      {/* 비교표 */}
      <section className="space-y-3">
        <h2 className="text-xl font-extrabold">그냥 방탈출 앱이랑 뭐가 달라?</h2>
        <div className="overflow-hidden rounded-2xl border-2 border-edge shadow-cute">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-edge bg-ink">
                <th className="px-3 py-2 text-left font-bold text-cream/60"> </th>
                <th className="px-3 py-2 text-left font-bold text-cream/60">그냥 앱</th>
                <th className="px-3 py-2 text-left font-extrabold text-candy">
                  {MASCOT.emoji} 우리
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row, i) => (
                <tr
                  key={row.label}
                  className={i % 2 ? "bg-ink/40" : "bg-panel"}
                >
                  <td className="px-3 py-2 font-bold">{row.label}</td>
                  <td className="px-3 py-2 text-cream/60">{row.other}</td>
                  <td className="px-3 py-2 font-bold text-candy">{row.ours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 결과 맛보기 */}
      <section className="space-y-3">
        <h2 className="text-xl font-extrabold">이렇게 진단해줘</h2>
        <div className="rounded-2xl border-2 border-edge bg-panel p-6 shadow-cute">
          <p className="text-xs text-cream/60">취향 진단 미리보기</p>
          <p className="mt-2 flex items-center gap-2 text-lg font-extrabold">
            <span className="text-2xl">🗺️</span>
            스토리에 푹 빠지는 감성 탐험가
          </p>
          <p className="mt-3 leading-relaxed text-cream/60">
            “흐흐, 딱 보니 감 오는구먼. 넌 무서운 건 살짝 사양하지만 이야기에
            깊게 빠지는 타입이야. 잔잔한 감성방에서 제일 빛나겠는걸…”
          </p>
          <p className="mt-3 text-sm font-bold text-cream/60">
            …나머지는 직접 해봐야 나와. 👻
          </p>
          <Link
            href="/quiz"
            className="mt-4 inline-block rounded-xl border-2 border-edge bg-candy px-4 py-2 text-sm font-bold text-white shadow-cute transition active:scale-[0.97]"
          >
            내 취향 진단받기 →
          </Link>
        </div>
      </section>
    </div>
  );
}
