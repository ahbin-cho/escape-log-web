import { CONTACT_EMAIL } from "@/lib/site";

// 매장 운영자용 안내: 정보 수정·제휴 문의 창구.
export default function OwnerCTA({ cafe }: { cafe: string }) {
  const subject = encodeURIComponent(`[방탈로그] ${cafe} 매장 문의`);
  const body = encodeURIComponent(
    `매장명: ${cafe}\n문의 내용(정보 수정 / 제휴 / 삭제 요청 등):\n`
  );

  return (
    <aside className="rounded-2xl border-2 border-edge/20 bg-panel/60 p-4 text-sm">
      <p className="font-extrabold">🏪 {cafe} 사장님이신가요?</p>
      <p className="mt-1 text-cream/60">
        테마 정보가 다르거나 포스터·소개글을 직접 등록하고 싶다면 알려주세요.
        제휴·홍보 문의도 받아요.
      </p>
      <a
        href={`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`}
        className="mt-2 inline-block font-extrabold text-candy hover:underline"
      >
        매장 정보 수정·제휴 문의 →
      </a>
    </aside>
  );
}
