import type { Metadata } from "next";
import Link from "next/link";
import Poster from "@/components/Poster";
import { BTN_LINE, BTN_PRIMARY, CRUMB, posterSrc } from "@/lib/ui";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { publicClient } from "@/lib/supabase/public";
import { normalizeGenre } from "@/lib/genre";
import { regionFromText } from "@/lib/region";
import { IMMERSIVE_TAG, THEATRE_TAG, priceLabel, splitImmersive } from "@/lib/immersive";

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
};

async function getImmersive(): Promise<Row[]> {
  try {
    const { data } = await publicClient()
      .from("catalog")
      .select("id,name,cafe,genre,tags,teaser,time_limit,players,price,difficulty,fear_level,poster_url,reservation_url")
      .overlaps("tags", [IMMERSIVE_TAG, THEATRE_TAG])
      .order("created_at", { ascending: false });
    return ((data as Row[]) ?? []).map((t) => ({ ...t, genre: normalizeGenre(t.genre, t.tags) }));
  } catch {
    return [];
  }
}

export default async function ImmersivePage() {
  const rows = await getImmersive();
  const { theatre, escape } = splitImmersive(rows);

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

      <header className="space-y-3">
        <nav aria-label="현재 위치" className={CRUMB}>
          <Link href="/" className="hover:underline">
            홈
          </Link>
          <span aria-hidden>›</span>
          <span>배우가 나오는 방</span>
        </nav>
        <h1 className="text-[28px] leading-tight sm:text-4xl [word-break:keep-all]">
          🎭 자물쇠 대신
          <br />
          <span className="text-candy">배우가 있는 방</span>
        </h1>
        <p className="max-w-2xl text-[15px] leading-[1.65] text-cream/80 [word-break:keep-all]">
          여기서는 관객석이 없어요. 배우가 처음부터 끝까지 같이 연기하고, 나는 그 이야기 속 등장인물이 돼요.
          배우가 잠깐 나오는 곳은 빼고, 공식 안내로 확인된 곳만 모았어요.
        </p>
      </header>

      {/* 두 갈래 설명 */}
      <section aria-label="두 가지 종류" className="grid grid-cols-2 gap-2.5">
        <a
          href="#theatre"
          className="rough rounded-2xl border-2 border-edge bg-panel p-4 shadow-cute transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          <span className="text-2xl" aria-hidden>
            🎬
          </span>
          <span className="mt-1 block font-extrabold">연극형</span>
          <span className="mt-1 block text-[13px] leading-snug text-cream/70 [word-break:keep-all]">
            퍼즐 없이 이야기를 따라가요. 처음이어도 OK
          </span>
          <span className="mt-2 block text-xs font-extrabold text-candy">{theatre.length}곳 →</span>
        </a>
        <a
          href="#escape"
          className="rough rounded-2xl border-2 border-edge bg-panel p-4 shadow-cute transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          <span className="text-2xl" aria-hidden>
            🗝️
          </span>
          <span className="mt-1 block font-extrabold">방탈출형</span>
          <span className="mt-1 block text-[13px] leading-snug text-cream/70 [word-break:keep-all]">
            배우와 함께 퍼즐도 풀어요. 몰입 + 머리 쓰기
          </span>
          <span className="mt-2 block text-xs font-extrabold text-candy">{escape.length}곳 →</span>
        </a>
      </section>

      <Group id="theatre" title="🎬 연극형 · 퍼즐 없이 이야기 속으로" rows={theatre} />
      <Group id="escape" title="🗝️ 방탈출형 · 배우와 함께 푸는 방" rows={escape} />

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

function Group({ id, title, rows }: { id: string; title: string; rows: Row[] }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-20 space-y-3">
      <h2 id={`${id}-h`} className="text-xl">
        {title}
      </h2>
      {rows.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-edge/30 px-4 py-6 text-center text-sm text-cream/60">
          공식 안내를 확인하는 중이에요. 곧 채워져요.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((t) => {
            const region = regionFromText(t.cafe);
            const price = priceLabel(t.price);
            return (
              <li key={t.id} className="rough rounded-2xl border-2 border-edge bg-panel p-3 shadow-cute">
                <div className="flex gap-3.5">
                  <Link href={`/theme/${t.id}?from=immersive`} className="block w-[88px] shrink-0 sm:w-28">
                    <Poster src={posterSrc(t.poster_url)} name={t.name} genre={t.genre} />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-cream/60">
                      {region ? `${region} · ` : ""}
                      {t.cafe}
                    </p>
                    <Link href={`/theme/${t.id}?from=immersive`} className="mt-0.5 block text-[17px] font-extrabold hover:underline">
                      {t.name}
                    </Link>
                    <p className="mt-1.5 flex flex-wrap gap-1.5 text-xs font-bold">
                      <span className="rounded-full bg-candy/25 px-2 py-0.5">배우가 끝까지 함께</span>
                      {t.time_limit ? <span className="rounded-full bg-ink px-2 py-0.5">{t.time_limit}분</span> : null}
                      {t.players ? <span className="rounded-full bg-ink px-2 py-0.5">{t.players}명</span> : null}
                      {price ? <span className="rounded-full bg-ink px-2 py-0.5">{price}</span> : null}
                    </p>
                    {t.teaser && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-cream/75 [word-break:keep-all]">{t.teaser}</p>
                    )}
                  </div>
                </div>
                {t.reservation_url && (
                  <a
                    href={t.reservation_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="mt-3 block rounded-xl border-2 border-edge/40 py-2 text-center text-sm font-extrabold transition hover:border-edge hover:bg-candy"
                  >
                    공식 예약 페이지 →
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
