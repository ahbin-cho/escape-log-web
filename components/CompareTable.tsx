import Link from "next/link";
import type { ThemeRow } from "@/lib/catalog-server";

// 지역·브랜드 페이지의 '표로 한눈에 비교'. 처음엔 접힌 작은 밑줄 링크로만 보이고, 누르면 표가 펼쳐진다.
// <details> 는 서버에서 HTML 로 그대로 나가므로 접혀 있어도 검색 엔진이 표 내용을 읽는다(JS 필요 없음).
// 무겁지 않게: 값이 하나도 없는 칸은 빼고, 큰 브랜드는 한 줄 요약(brands)으로 줄여 브랜드 페이지로 보낸다.
type Row = Pick<ThemeRow, "id" | "name" | "cafe" | "difficulty" | "time_limit" | "players" | "price" | "booking_open"> & {
  genre: string;
};
export type BrandLine = { brand: string; count: number; price: string; href: string | null };

const won = (n?: number | null) => (n && n > 0 ? `${n.toLocaleString("ko-KR")}원` : "—");

// 가격대 한 줄: "22,000~26,000원" / 값이 없으면 ""
export function priceRange(rows: { price?: number | null }[]): string {
  const p = rows.map((r) => r.price ?? 0).filter((n) => n > 0);
  if (p.length === 0) return "";
  const lo = Math.min(...p);
  const hi = Math.max(...p);
  return lo === hi ? `${lo.toLocaleString("ko-KR")}원` : `${lo.toLocaleString("ko-KR")}~${hi.toLocaleString("ko-KR")}원`;
}

const TD = "whitespace-nowrap px-3 py-2";

export default function CompareTable({
  themes,
  title,
  label,
  brands = [],
}: {
  themes: Row[];
  title: string;
  label?: string;
  brands?: BrandLine[];
}) {
  if (themes.length === 0) return null;
  const cols = [
    { h: "매장", on: true, v: (t: Row) => t.cafe },
    { h: "장르", on: true, v: (t: Row) => t.genre },
    { h: "난이도", on: themes.some((t) => t.difficulty), v: (t: Row) => (t.difficulty ? `${t.difficulty}/5` : "—") },
    { h: "시간", on: themes.some((t) => t.time_limit), v: (t: Row) => (t.time_limit ? `${t.time_limit}분` : "—") },
    { h: "인원", on: themes.some((t) => t.players), v: (t: Row) => (t.players ? `${t.players}인` : "—") },
    { h: "1인 가격", on: themes.some((t) => (t.price ?? 0) > 0), v: (t: Row) => won(t.price) },
    { h: "예약 오픈", on: themes.some((t) => t.booking_open?.trim()), v: (t: Row) => t.booking_open?.trim() || "—" },
  ].filter((c) => c.on);

  return (
    <details className="group text-[13px]">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-cream/60 underline decoration-dotted underline-offset-4 hover:text-cream [&::-webkit-details-marker]:hidden">
        {label ?? `표로 한눈에 비교하기 (${themes.length}개)`}
        <span aria-hidden className="transition group-open:rotate-180">▾</span>
      </summary>
      <div className="relative mt-3">
        <div className="overflow-x-auto rounded-xl border-2 border-edge bg-panel shadow-cute">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">{title}</caption>
            <thead>
              <tr className="bg-candy text-edge">
                <th scope="col" className="sticky left-0 z-[1] whitespace-nowrap border-b-2 border-edge bg-candy px-3 py-2 font-extrabold">
                  테마
                </th>
                {cols.map((c) => (
                  <th key={c.h} scope="col" className="whitespace-nowrap border-b-2 border-edge px-3 py-2 font-extrabold">
                    {c.h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {themes.map((t) => (
                <tr key={t.id}>
                  <th scope="row" className="sticky left-0 z-[1] min-w-[8.5rem] max-w-[11rem] border-r border-line bg-panel px-3 py-2 font-extrabold">
                    <Link href={`/theme/${t.id}`} className="hover:underline">
                      {t.name}
                    </Link>
                  </th>
                  {cols.map((c) => (
                    <td key={c.h} className={TD}>
                      {c.v(t)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* 옆으로 더 있다는 표시(폰에서만) */}
        <span aria-hidden className="pointer-events-none absolute inset-y-[2px] right-[2px] w-8 rounded-r-[10px] bg-gradient-to-l from-panel to-transparent sm:hidden" />
      </div>
      <p className="mt-2 text-[12px] text-cream/50 sm:hidden">← 옆으로 밀면 더 보여요</p>
      {brands.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <p className="font-extrabold">큰 브랜드는 브랜드 페이지에서</p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-cream/70">
            {brands.map((b) => (
              <li key={b.brand}>
                {b.href ? (
                  <Link href={b.href} className="font-bold underline underline-offset-2">
                    {b.brand}
                  </Link>
                ) : (
                  <b>{b.brand}</b>
                )}{" "}
                {b.count}개{b.price && ` · ${b.price}`}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-2 text-[12px] text-cream/50">매장 공식 페이지에서 확인한 값만 적었어요. 빈칸(—)은 아직 확인 못 한 값이에요.</p>
    </details>
  );
}
