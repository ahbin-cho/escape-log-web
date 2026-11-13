import type { Metadata } from "next";
import Link from "next/link";
import Poster from "@/components/Poster";
import BookingOpen from "@/components/BookingOpen";
import { BTN_LINE, BTN_PRIMARY, CRUMB, posterSrc } from "@/lib/ui";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { publicClient } from "@/lib/supabase/public";
import { normalizeGenre } from "@/lib/genre";
import { regionFromText } from "@/lib/region";
import { IMMERSIVE_TAG, THEATRE_TAG, priceLabel, splitImmersive, untilLabel } from "@/lib/immersive";

// 배우가 나오는 방(이머시브) 모음.
// 배우가 처음부터 끝까지 같이 연기하는 곳만, 공식 안내로 확인된 것만 싣는다(docs/immersive.md).
// 내용은 DB(catalog.tags) 로 바뀌므로 배포 없이 1시간 안에 반영된다.
export const revalidate = 3600;

const TITLE = "배우가 나오는 방 · 이머시브 연극·방탈출 모음";
const DESC =
  "배우가 처음부터 끝까지 함께 연기하는 이머시브 연극과 방탈출을 한곳에 모았어요. 퍼즐 없는 연극형과 퍼즐이 있는 방탈출형으로 나눠, 시간·인원·가격을 공식 정보 기준으로 정리했어요.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: `${SITE_URL}/immersive` },
  openGraph: { title: TITLE, description: DESC, url: `${SITE_URL}/immersive`, type: "article", siteName: SITE_NAME },
};

type Row = {
  id: string;
  name: string;
  cafe: string;
  genre: string;
  tags: string[] | null;
  teaser: string | null;
  time_limit: number | null;
  players: string | null;
  price: number | null;
  difficulty: number;
  fear_level: number;
  poster_url: string | null;
  reservation_url: string | null;
  booking_open: string | null;
  run_until?: string | null;
};

const COLS = "id,name,cafe,genre,tags,teaser,time_limit,players,price,difficulty,fear_level,poster_url,reservation_url,booking_open";

async function getImmersive(): Promise<Row[]> {
  try {
    const q = (cols: string) =>
      publicClient().from("catalog").select(cols).overlaps("tags", [IMMERSIVE_TAG, THEATRE_TAG]).order("created_at", { ascending: false });
    // run_until 칸(기간 한정 공연)이 아직 없는 DB 에서도 목록은 나오게
    let { data, error } = await q(`${COLS},run_until`);
    if (error) ({ data, error } = await q(COLS));
    return ((data as unknown as Row[]) ?? []).map((t) => ({ ...t, genre: normalizeGenre(t.genre, t.tags) }));
  } catch {
    return [];
  }
}

export default async function ImmersivePage() {
  const rows = await getImmersive();
  const { limited, theatre, escape } = splitImmersive(rows);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "배우가 나오는 방" },
      ],
    },
    ...(rows.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "배우가 나오는 방",
            itemListElement: rows.map((t, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: `${t.name} (${t.cafe})`,
              url: `${SITE_URL}/theme/${t.id}`,
            })),
          },
        ]
      : []),
  ];

  return (
    <article className="mx-auto max-w-3xl space-y-10">
      {jsonLd.map((j, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j) }} />
      ))}

      <nav aria-label="현재 위치" className={CRUMB}>
        <Link href="/" className="hover:underline">
          홈
        </Link>
        <span aria-hidden>›</span>
        <span>배우가 나오는 방</span>
      </nav>

      {/* 무대: 막 · 조명 · 탈출귀 */}
      <header className="relative -mt-6 overflow-hidden rounded-[28px] border-2 border-edge bg-[#1B1420] px-5 pb-6 pt-12 text-[#F5F0E6] shadow-cute sm:px-10 sm:pt-14">
        <span aria-hidden className="stage-curtain absolute inset-y-0 left-0 w-[15%] rounded-br-[40px] border-r-2 border-edge" />
        <span aria-hidden className="stage-curtain absolute inset-y-0 right-0 w-[15%] rounded-bl-[40px] border-l-2 border-edge" />
        <span aria-hidden className="stage-valance absolute inset-x-0 top-0 h-7 border-b-2 border-edge" />
        <span aria-hidden className="stage-spot pointer-events-none absolute left-1/2 top-0 h-full w-[70%] -translate-x-1/2" />
        <div className="relative mx-auto max-w-md text-center">
          <p className="text-[11px] font-extrabold tracking-[0.25em] text-[#F2C879]">NOW PLAYING · IMMERSIVE</p>
          <h1 className="mt-3 text-[30px] leading-[1.2] sm:text-[40px] [word-break:keep-all]">
            자물쇠 대신
            <br />
            <span className="text-candy">배우가 있는 방</span>
          </h1>
          <p className="mx-auto mt-3 max-w-[22rem] text-[14px] leading-[1.65] text-[#F5F0E6]/80 [word-break:keep-all]">
            관객석은 없어요. 배우가 처음부터 끝까지 같이 연기하고, 나는 그 이야기 속 등장인물이 돼요.
          </p>
          <div className="relative mx-auto mt-5 h-32 w-32">
            <span aria-hidden className="absolute inset-x-0 bottom-0 mx-auto h-5 w-28 rounded-[50%] bg-[#F2C879]/40 blur-[2px]" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mascot.png" alt="" className="stage-bob relative mx-auto w-24" />
          </div>
          <p className="mt-1 text-[12px] text-[#F5F0E6]/60">공식 안내로 확인된 곳만 · 배우가 잠깐 나오는 곳은 뺐어요</p>
        </div>

        {/* 표 두 장: 연극형 / 방탈출형 */}
        <div className="relative mt-6 grid grid-cols-2 gap-2.5">
          <a href="#theatre" className="ticket-mini rough rounded-xl border-2 border-edge bg-[#F5F0E6] px-3 py-3 text-[#1D1D1D] transition active:scale-[0.97]">
            <span className="block text-[11px] font-extrabold tracking-[0.15em] text-[#A85A14]">ADMIT ONE</span>
            <span className="mt-0.5 block text-[17px] font-extrabold">🎬 연극형</span>
            <span className="mt-0.5 block text-[12px] leading-snug text-[#1D1D1D]/70 [word-break:keep-all]">퍼즐 없이 이야기 속으로</span>
            <span className="mt-1.5 block text-xs font-extrabold text-[#A85A14]">{theatre.length}곳 →</span>
          </a>
          <a href="#escape" className="ticket-mini rough rounded-xl border-2 border-edge bg-[#F5F0E6] px-3 py-3 text-[#1D1D1D] transition active:scale-[0.97]">
            <span className="block text-[11px] font-extrabold tracking-[0.15em] text-[#A85A14]">ADMIT ONE</span>
            <span className="mt-0.5 block text-[17px] font-extrabold">🗝️ 방탈출형</span>
            <span className="mt-0.5 block text-[12px] leading-snug text-[#1D1D1D]/70 [word-break:keep-all]">배우와 함께 퍼즐까지</span>
            <span className="mt-1.5 block text-xs font-extrabold text-[#A85A14]">{escape.length}곳 →</span>
          </a>
        </div>
      </header>

      {limited.length > 0 && <Group id="limited" act="SPECIAL · 기간 한정" title="끝나기 전에 가야 하는 공연" rows={limited} />}
      <Group id="theatre" act="ACT 1" title="연극형 · 퍼즐 없이 이야기 속으로" rows={theatre} />
      <Group id="escape" act="ACT 2" title="방탈출형 · 배우와 함께 푸는 방" rows={escape} />

      <Tips />

      <section className="space-y-2 border-t border-line pt-6 text-[13px] leading-relaxed text-cream/60 [word-break:keep-all]">
        <p>각 곳의 공식 홈페이지·예약 페이지에 적힌 내용만 옮겼어요. 회차·가격은 자주 바뀌니 예약 전에 한 번 더 확인해 주세요.</p>
        <p>배우가 끝까지 함께하는 곳인데 여기 없다면, 인스타 @bangtal_log 로 알려 주세요. 공식 안내를 확인하고 넣을게요.</p>
      </section>

      <section className="border-t border-line pt-7">
        <h2 className="text-xl">다녀온 공연도 기록할 수 있어요</h2>
        <p className="mt-2 text-sm leading-relaxed text-cream/75 [word-break:keep-all]">
          어떤 역할을 맡았는지, 누구와 갔는지, 끝까지 진실을 알아냈는지. 잊기 전에 한 줄 남겨 두세요.
        </p>
        <div className="mt-4 flex gap-2">
          <Link href="/new" className={`flex-1 sm:flex-none ${BTN_PRIMARY}`}>
            기록 남기기
          </Link>
          <Link href="/quiz" className={`flex-1 sm:flex-none ${BTN_LINE}`}>
            내 취향 방 찾기
          </Link>
        </div>
      </section>
    </article>
  );
}

function Group({ id, act, title, rows }: { id: string; act: string; title: string; rows: Row[] }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-20 space-y-3">
      <div>
        <p className="text-[11px] font-extrabold tracking-[0.25em] text-[#A85A14]">{act}</p>
        <h2 id={`${id}-h`} className="text-xl">
          {title}
        </h2>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-edge/30 px-4 py-6 text-center text-sm text-cream/60">
          공식 안내를 확인하는 중이에요. 곧 막이 올라요.
        </p>
      ) : (
        <ul className="space-y-4">
          {rows.map((t, i) => {
            const region = regionFromText(t.cafe);
            const price = priceLabel(t.price);
            return (
              <li key={t.id} className="ticket relative rounded-2xl border-2 border-edge bg-panel shadow-cute">
                <div className="flex">
                  {/* 표 꼭지: 포스터 */}
                  <Link href={`/theme/${t.id}?from=immersive`} className="block w-[96px] shrink-0 p-3 pr-2.5 sm:w-32">
                    <Poster src={posterSrc(t.poster_url)} name={t.name} genre={t.genre} />
                    <span className="mt-2 block text-center text-[10px] font-extrabold tracking-[0.15em] text-cream/50">
                      No.{String(i + 1).padStart(2, "0")}
                    </span>
                  </Link>
                  {/* 절취선 */}
                  <span aria-hidden className="relative w-0 border-l-2 border-dashed border-edge/40">
                    <span className="absolute -left-[11px] -top-[11px] h-5 w-5 rounded-full border-2 border-edge bg-paper [clip-path:inset(50%_0_0_0)]" />
                    <span className="absolute -bottom-[11px] -left-[11px] h-5 w-5 rounded-full border-2 border-edge bg-paper [clip-path:inset(0_0_50%_0)]" />
                  </span>
                  <div className="min-w-0 flex-1 p-3.5 pl-4">
                    <p className="text-xs font-extrabold text-cream/60">
                      {region ? `${region} · ` : ""}
                      {t.cafe}
                    </p>
                    <Link href={`/theme/${t.id}?from=immersive`} className="mt-0.5 block text-[18px] font-extrabold leading-snug hover:underline [word-break:keep-all]">
                      {t.name}
                    </Link>
                    <p className="mt-2 flex flex-wrap gap-1.5 text-xs font-bold">
                      <span className="rounded-full border-2 border-edge bg-candy px-2 py-0.5 text-edge">🎭 배우가 끝까지 함께</span>
                      {untilLabel(t.run_until) ? (
                        <span className="rounded-full border-2 border-edge bg-[#1B1420] px-2 py-0.5 text-[#F5F0E6]">⏳ {untilLabel(t.run_until)}</span>
                      ) : null}
                      {t.time_limit ? <span className="rounded-full bg-ink px-2 py-0.5">{t.time_limit}분</span> : null}
                      {t.players ? <span className="rounded-full bg-ink px-2 py-0.5">{t.players}명</span> : null}
                      {price ? <span className="rounded-full bg-ink px-2 py-0.5">{price}</span> : null}
                    </p>
                    {t.teaser && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-cream/75 [word-break:keep-all]">{t.teaser}</p>
                    )}
                  </div>
                </div>
                {(t.booking_open?.trim() || t.reservation_url) && (
                  <div className="space-y-2.5 border-t-2 border-dashed border-edge/30 p-3">
                    {t.booking_open?.trim() ? <BookingOpen rule={t.booking_open} /> : null}
                    {t.reservation_url && (
                      <a
                        href={t.reservation_url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="rough block rounded-xl border-2 border-edge bg-[#1B1420] py-2.5 text-center text-sm font-extrabold text-[#F5F0E6] transition hover:bg-candy hover:text-edge"
                      >
                        🎟️ 공식 예약 페이지에서 표 구하기 →
                      </a>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// 이머시브는 한 회차에 몇 명만 들어가서 표가 금방 사라진다 → 덜 놓치는 방법
const TIPS: { e: string; t: string; d: string }[] = [
  { e: "⏰", t: "열리는 시각을 먼저 알아 두기", d: "곳마다 며칠 전 몇 시에 열리는지가 달라요. 위 카드에 확인된 오픈 시각을 적어 뒀어요." },
  { e: "🔑", t: "로그인·결제는 미리", d: "네이버 예약이면 미리 로그인, 무통장 입금이면 예약자 이름과 입금자 이름을 똑같이. 열리는 순간 고민할 틈이 없어요." },
  { e: "📅", t: "날짜 후보는 2~3개", d: "한 회차에 몇 명만 들어가서 금방 차요. 주말이 막히면 평일 저녁 회차가 비교적 여유 있어요." },
  { e: "🔁", t: "취소표는 '수수료 붙기 직전'에", d: "환불 수수료가 바뀌기 바로 전날 취소가 몰리기 쉬워요. 그 무렵 예약 페이지를 몇 번 더 열어 보세요." },
  { e: "🙅", t: "중복 예약은 금물", d: "같은 작품을 여러 번 잡아 두면 전부 취소하는 곳도 있어요. 꼭 갈 회차 하나만." },
  { e: "🏃", t: "10분 일찍 도착", d: "공연이 정시에 시작해서 늦으면 들어갈 수 없는 곳이 많아요. 환불도 안 돼요." },
];

function Tips() {
  return (
    <section aria-labelledby="tips-h" className="rounded-[24px] border-[5px] border-double border-edge bg-panel p-5 sm:p-7">
      <p className="text-center text-[11px] font-extrabold tracking-[0.25em] text-[#A85A14]">PROGRAM · 관람 안내서</p>
      <h2 id="tips-h" className="mt-1 text-center text-xl">
        🎟️ 티켓팅, 이렇게 하면 덜 놓쳐요
      </h2>
      <ol className="mt-4 divide-y-2 divide-dashed divide-edge/20">
        {TIPS.map((x, i) => (
          <li key={x.t} className="flex gap-3 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-edge bg-candy text-sm font-extrabold text-edge">
              {i + 1}
            </span>
            <span className="min-w-0">
              <span className="block font-extrabold">
                {x.e} {x.t}
              </span>
              <span className="mt-0.5 block text-[13px] leading-relaxed text-cream/75 [word-break:keep-all]">{x.d}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
