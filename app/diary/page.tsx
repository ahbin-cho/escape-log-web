import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 공개 소개 페이지: "방탈출 기록장·다이어리·달력" 검색어를 받는 곳.
// 개인 기록 화면(/records, /new)은 색인 제외라 검색에 안 잡히므로,
// 이 페이지가 "여기서 내 방탈출을 기록하는구나"를 알려 준다. 순수 정적 페이지.

const TITLE = "방탈출 기록장 · 달력 다이어리 — 포스터로 채우는 내 방탈출 캘린더";
const DESCRIPTION =
  "다녀온 방탈출을 기록하는 무료 기록장. 탈출 성공·남은 시간·힌트·별점·한줄 후기를 남기면 테마 포스터로 채워지는 달력, 'N번째 방' 다이어리, 연말 결산이 자동으로 만들어져요. 로그인 없이 바로 써 볼 수 있어요.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/diary" },
  keywords: [
    "방탈출 기록",
    "방탈출 기록장",
    "방탈출 다이어리",
    "방탈출 달력",
    "방탈출 캘린더",
    "방탈출 기록 달력",
    "방탈출 기록 앱",
    "방탈출 결산",
    "방탈출 일지",
    "방탈출 후기 기록",
  ],
  openGraph: {
    title: `방탈출 기록장 · 달력 다이어리 | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: `${SITE_URL}/diary`,
  },
};

// 달력 예시 한 주 (실제 사용자 데이터 아님)
const CAL_SAMPLE: { day: number; emoji?: string; tile?: string; more?: number }[] = [
  { day: 16 },
  { day: 17 },
  { day: 18, emoji: "👻", tile: "bg-red-50" },
  { day: 19 },
  { day: 20 },
  { day: 21, emoji: "🔍", tile: "bg-emerald-50", more: 1 },
  { day: 22, emoji: "🥹", tile: "bg-pink-50" },
];

// 화면에 보여 줄 예시 기록 (실제 사용자 데이터 아님)
const SAMPLE = [
  {
    n: 50,
    day: "22",
    week: "토",
    name: "어느 폐가의 기록",
    cafe: "👻 공포 · 강남 · 3명",
    result: "탈출 · 8분 남김",
    hint: "노힌트",
    rating: "꽃밭길",
    line: "마지막 연출에서 소름. 장치가 정말 정교했다",
    milestone: true,
  },
  {
    n: 49,
    day: "15",
    week: "토",
    name: "은하수 배달부",
    cafe: "🚀 SF · 홍대 · 2명",
    result: "탈출 · 3분 남김",
    hint: "힌트 2",
    rating: "꽃길",
    line: "",
    milestone: false,
  },
  {
    n: 48,
    day: "8",
    week: "토",
    name: "고양이 탐정 사무소",
    cafe: "🔍 추리 · 부산 서면 · 4명",
    result: "실패",
    hint: "힌트 3",
    rating: "풀길",
    line: "범인은 맞혔는데 시간이 모자랐다",
    milestone: false,
  },
];

const FIELDS: [string, string][] = [
  ["🗓️", "다녀온 날짜·매장·함께한 인원"],
  ["🚪", "탈출 성공/실패, 남은 시간"],
  ["💡", "힌트 몇 번 썼는지 (노힌트 자동 표시)"],
  ["⭐", "별점 5단계 (흙길 → 인생테마)"],
  ["💬", "한줄 후기 (공개용, 스포 없이)"],
  ["🔒", "비공개 메모 (스포 OK, 나만 봄)"],
  ["📷", "인증샷 한 장"],
  ["🧩", "장치·자물쇠·문제 중 어떤 방이었는지"],
];

const FAQ = [
  {
    q: "방탈출 기록장은 무료인가요?",
    a: "네, 전부 무료예요. 기록 개수 제한도 없어요.",
  },
  {
    q: "로그인 없이도 기록할 수 있나요?",
    a: "네. 먼저 써 보고 저장하면 지금 쓰는 기기에 보관돼요. 이메일로 10초 가입하면 계정으로 옮겨져서 폰을 바꿔도 남아요.",
  },
  {
    q: "스포일러가 걱정돼요.",
    a: "한줄 후기와 비공개 메모를 따로 받아요. 스포가 담긴 메모는 나만 볼 수 있고, 공개 후기로 올릴 때도 절대 노출되지 않아요.",
  },
  {
    q: "달력으로도 볼 수 있나요?",
    a: "네. 기록하면 다녀온 날짜 칸이 테마 포스터로 채워지는 달력이 기본 화면이에요. 인증샷을 올리면 그 사진으로 채워지고, 하루에 여러 방을 했으면 +2처럼 표시돼요. 날짜를 누르면 그날 기록이 바로 펼쳐져요.",
  },
  {
    q: "몇 번째 방인지 자동으로 세 주나요?",
    a: "네. 다녀온 날짜 순으로 '#47'처럼 번호가 붙고, 10·30·50·100번째 방 같은 기념 숫자는 따로 표시돼요. 다음 기념까지 몇 방 남았는지도 알려 줘요.",
  },
  {
    q: "연말 결산은 어떻게 나오나요?",
    a: "그 해 기록으로 플레이 수, 탈출 성공률, 노힌트 탈출, 최애 장르, 원정 지역, 올해의 인생테마를 자동으로 정리해요. 버튼 하나로 친구들에게 공유할 수 있어요.",
  },
  {
    q: "기록하면 뭐가 좋아요?",
    a: "기록이 쌓일수록 취향 분석과 맞춤 추천이 정확해져요. 이미 다녀온 방은 추천에서 빠지고, 내 취향에 맞는 다음 방을 골라 줘요.",
  },
];

export default function DiaryLandingPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: `${SITE_NAME} 방탈출 기록장`,
      url: `${SITE_URL}/diary`,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      inLanguage: "ko",
      description: DESCRIPTION,
      offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "방탈출 기록장" },
      ],
    },
  ];

  return (
    <article className="space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 히어로 */}
      <header className="space-y-4 pt-2">
        <p className="text-sm font-extrabold text-candy">무료 방탈출 기록장</p>
        <h1 className="text-3xl leading-[1.15] sm:text-5xl sm:leading-[1.1]">
          다녀온 방탈출,
          <br />
          다이어리로 남겨요
        </h1>
        <p className="max-w-xl leading-relaxed text-cream/70 [word-break:keep-all]">
          탈출 성공, 남은 시간, 힌트, 별점, 한줄 후기만 적으면 끝. 다녀온 날은
          달력에 테마 포스터로 채워지고, 몇 번째 방인지 자동으로 세고, 연말엔
          나만의 방탈출 결산까지 만들어 줘요.{" "}
          <b className="font-extrabold text-cream">로그인 없이 바로 시작.</b>
        </p>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
          <Link
            href="/new"
            className="rough rounded-xl border-2 border-edge bg-candy px-6 py-3 text-center text-sm font-extrabold text-white shadow-cute transition hover:-translate-y-0.5 active:scale-[0.97]"
          >
            ✍️ 첫 방 기록하기
          </Link>
          <Link
            href="/quiz"
            className="rounded-xl px-2 py-3 text-center text-sm font-extrabold underline decoration-2 underline-offset-4 transition hover:text-candy"
          >
            아직 안 가 봤다면 취향 찾기부터
          </Link>
        </div>
      </header>

      {/* 달력 미리보기 */}
      <section className="space-y-3">
        <h2 className="text-xl font-extrabold">📅 달력으로 한눈에</h2>
        <p className="text-sm text-cream/60">
          예시 화면이에요. 다녀온 날짜 칸이 테마 포스터(또는 내 인증샷)로
          채워져서, 이번 달 얼마나 달렸는지 한눈에 보여요.
        </p>
        <div className="rough mx-auto max-w-sm rounded-2xl border-2 border-edge bg-panel p-3">
          <p className="mb-2 text-center text-sm font-extrabold">
            11월 <span className="text-xs font-bold text-cream/55">· 4방 · 탈출 3</span>
          </p>
          <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-extrabold">
            {["일", "월", "화", "수", "목", "금", "토"].map((w) => (
              <span key={w} className="text-cream/45">
                {w}
              </span>
            ))}
            {CAL_SAMPLE.map((c, i) => (
              <div key={i} className="flex flex-col gap-1">
                <span className={c.tile ? "text-cream" : "text-cream/35"}>{c.day}</span>
                <span
                  className={`relative flex aspect-[3/4] items-center justify-center rounded-md text-base ${
                    c.tile ? `${c.tile} ring-1 ring-edge/15` : ""
                  }`}
                >
                  {c.emoji}
                  {c.more && (
                    <span className="absolute bottom-0.5 right-0.5 rounded-full bg-edge/80 px-1 text-[9px] leading-3 text-panel">
                      +{c.more}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 다이어리 미리보기 */}
      <section className="space-y-3">
        <h2 className="text-xl font-extrabold">📓 이렇게 쌓여요</h2>
        <p className="text-sm text-cream/60">
          예시 화면이에요. 기록마다 몇 번째 방인지 번호가 붙고, 기념 숫자는
          따로 축하해 줘요.
        </p>
        <div className="rough space-y-3 rounded-2xl border-2 border-edge bg-ink/40 p-4">
          <p className="flex items-baseline gap-2 border-b-2 border-edge/15 pb-1.5">
            <span className="text-lg font-extrabold">11월</span>
            <span className="text-xs font-bold text-cream/55">3방 · 탈출 2</span>
          </p>
          <ol className="space-y-2.5">
            {SAMPLE.map((s) => (
              <li
                key={s.n}
                className={`flex gap-3 rounded-2xl border-2 bg-panel p-3.5 ${
                  s.milestone ? "border-candy shadow-cute" : "border-edge"
                }`}
              >
                <div className="w-10 shrink-0 text-center">
                  <div className="text-xl font-extrabold leading-none">{s.day}</div>
                  <div className="mt-0.5 text-xs font-bold text-cream/50">{s.week}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[11px] font-extrabold ${
                        s.milestone ? "bg-candy text-white" : "bg-ink text-cream/60"
                      }`}
                    >
                      {s.milestone ? `🎉 ${s.n}번째 방` : `#${s.n}`}
                    </span>
                    <span className="font-extrabold">{s.name}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-cream/60">{s.cafe}</p>
                  <p className="mt-1.5 flex flex-wrap gap-1.5 text-xs font-bold">
                    <span
                      className={
                        s.result === "실패"
                          ? "rounded-md border border-edge/30 bg-ink px-1.5 py-0.5 text-cream/60"
                          : "rounded-md border border-mint bg-mint/10 px-1.5 py-0.5 text-mint"
                      }
                    >
                      {s.result}
                    </span>
                    <span className="text-cream/60">{s.hint}</span>
                    <span className="rounded-md bg-candy/10 px-1.5 py-0.5 text-candy">
                      {s.rating}
                    </span>
                  </p>
                  {s.line && (
                    <p className="mt-1.5 text-sm text-cream/80">“{s.line}”</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 연말 결산 */}
      <section className="space-y-3">
        <h2 className="text-xl font-extrabold">🏆 연말엔 나만의 방탈출 결산</h2>
        <div className="rough grid grid-cols-2 gap-2 rounded-2xl border-2 border-edge bg-grape/10 p-4 sm:grid-cols-4">
          {[
            ["올해 플레이", "47방"],
            ["탈출 성공률", "74%"],
            ["노힌트 탈출", "16번"],
            ["원정 지역", "3곳"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border-2 border-edge/30 bg-panel px-3 py-2">
              <p className="text-[11px] font-bold text-cream/55">{k}</p>
              <p className="text-lg font-extrabold">{v}</p>
            </div>
          ))}
          <p className="col-span-2 text-sm text-cream/70 sm:col-span-4">
            최애 장르, 올해의 인생테마, 제일 바빴던 달까지 자동으로 정리되고,
            버튼 하나로 단톡방에 공유돼요.
          </p>
        </div>
      </section>

      {/* 남길 수 있는 것 */}
      <section className="space-y-3">
        <h2 className="text-xl font-extrabold">✍️ 무엇을 기록하나요?</h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {FIELDS.map(([icon, text]) => (
            <li
              key={text}
              className="flex items-center gap-3 rounded-xl border-2 border-edge/30 bg-panel px-4 py-3 text-sm font-bold"
            >
              <span className="text-xl" aria-hidden>
                {icon}
              </span>
              {text}
            </li>
          ))}
        </ul>
        <p className="text-sm text-cream/60">
          테마 이름을 검색해 고르면 매장·장르·난이도가 자동으로 채워져요.
        </p>
      </section>

      {/* 시작 방법 */}
      <section className="space-y-3">
        <h2 className="text-xl font-extrabold">🚀 30초면 시작</h2>
        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            ["1", "로그인 없이 바로 쓰기", "테마를 고르고 결과만 적으면 끝"],
            ["2", "10초 가입으로 지키기", "이메일만 있으면 기록이 계정으로"],
            ["3", "달력·결산·추천", "쌓일수록 내 취향 추천이 정확해져요"],
          ].map(([n, t, d]) => (
            <li key={n} className="rounded-2xl border-2 border-edge bg-panel p-4">
              <p className="text-2xl font-extrabold text-candy">{n}</p>
              <p className="mt-1 font-extrabold">{t}</p>
              <p className="mt-0.5 text-sm text-cream/60">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="space-y-3">
        <h2 className="text-xl font-extrabold">자주 묻는 질문</h2>
        <dl className="space-y-3">
          {FAQ.map((f) => (
            <div key={f.q} className="rounded-2xl border-2 border-edge/30 bg-panel p-4">
              <dt className="text-sm font-extrabold">Q. {f.q}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-cream/70">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 마지막 CTA */}
      <section className="rough rounded-2xl border-2 border-dashed border-edge/30 bg-panel/60 p-6 text-center">
        <p className="text-lg font-extrabold">지난 주말에 간 방, 아직 기억날 때 남겨요</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link
            href="/new"
            className="rough inline-block rounded-xl border-2 border-edge bg-candy px-5 py-2.5 text-sm font-extrabold text-white shadow-cute transition active:scale-[0.97]"
          >
            ✍️ 기록 시작하기 (무료)
          </Link>
          <Link
            href="/best"
            className="rough inline-block rounded-xl border-2 border-edge bg-panel px-5 py-2.5 text-sm font-extrabold transition active:scale-[0.97] hover:border-candy"
          >
            🎯 다음 방 찾기
          </Link>
        </div>
      </section>
    </article>
  );
}
