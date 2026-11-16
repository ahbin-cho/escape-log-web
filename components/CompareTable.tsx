import Link from "next/link";
import type { ThemeRow } from "@/lib/catalog-server";

// 지역·브랜드 페이지의 '표로 한눈에 비교'. 처음엔 접힌 작은 밑줄 링크로만 보이고, 누르면 표가 펼쳐진다.
// <details> 는 서버에서 HTML 로 그대로 나가므로 접혀 있어도 검색 엔진이 표 내용을 읽는다(JS 필요 없음).
type Row = Pick<ThemeRow, "id" | "name" | "cafe" | "difficulty" | "time_limit" | "players" | "price" | "booking_open"> & {
  genre: string;
};

const won = (n?: number | null) => (n && n > 0 ? `${n.toLocaleString("ko-KR")}원` : "—");

export default function CompareTable({ themes, title }: { themes: Row[]; title: string }) {
  if (themes.length === 0) return null;
  return (
    <details className="group text-[13px]">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-cream/60 underline decoration-dotted underline-offset-4 hover:text-cream [&::-webkit-details-marker]:hidden">
        표로 한눈에 비교하기 ({themes.length}개)
        <span aria-hidden className="transition group-open:rotate-180">▾</span>
      </summary>
      <div className="mt-3 overflow-x-auto rounded-xl border-2 border-edge/30">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <caption className="sr-only">{title}</caption>
          <thead className="bg-ink text-cream/60">
            <tr>
              {["테마", "매장", "장르", "난이도", "시간", "인원", "1인 가격", "예약 오픈"].map((h) => (
                <th key={h} scope="col" className="whitespace-nowrap px-3 py-2 font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {themes.map((t) => (
              <tr key={t.id}>
                <th scope="row" className="px-3 py-2 font-extrabold">
                  <Link href={`/theme/${t.id}`} className="hover:underline">
                    {t.name}
                  </Link>
                </th>
                <td className="whitespace-nowrap px-3 py-2">{t.cafe}</td>
                <td className="whitespace-nowrap px-3 py-2">{t.genre}</td>
                <td className="whitespace-nowrap px-3 py-2">{t.difficulty ? `${t.difficulty}/5` : "—"}</td>
                <td className="whitespace-nowrap px-3 py-2">{t.time_limit ? `${t.time_limit}분` : "—"}</td>
                <td className="whitespace-nowrap px-3 py-2">{t.players ? `${t.players}인` : "—"}</td>
                <td className="whitespace-nowrap px-3 py-2">{won(t.price)}</td>
                <td className="whitespace-nowrap px-3 py-2">{t.booking_open?.trim() || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[12px] text-cream/50">매장 공식 페이지에서 확인한 값만 적었어요. 빈칸(—)은 아직 확인 못 한 값이에요.</p>
    </details>
  );
}
