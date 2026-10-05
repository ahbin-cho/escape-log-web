import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { decodeShare } from "@/lib/quiz/share";
import { QUIZ_TYPES } from "@/lib/quiz/types";
import TypeCard from "@/components/quiz/TypeCard";
import TypeRarity from "@/components/quiz/TypeRarity";
import FriendCompat from "@/components/quiz/FriendCompat";

// 친구가 공유한 결과. 내용은 전부 주소의 코드에 들어 있다(서버 저장 없음).
type Props = { params: { code: string } };

export function generateMetadata({ params }: Props): Metadata {
  const shared = decodeShare(params.code);
  if (!shared) return { title: "결과를 찾을 수 없어요", robots: { index: false } };
  const type = QUIZ_TYPES[shared.typeId];
  const title = `${shared.name}의 방탈출 유형: ${type.title}`;
  return {
    title,
    description: `${type.tagline} 너는 어떤 유형이야?`,
    // 사람마다 주소가 달라 무한히 생기는 페이지라 검색에는 올리지 않는다.
    robots: { index: false, follow: true },
    openGraph: { title, description: `${type.tagline} 너는 어떤 유형이야?` },
    twitter: { card: "summary_large_image", title },
  };
}

export default function SharedResultPage({ params }: Props) {
  const shared = decodeShare(params.code);
  if (!shared) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <TypeCard
        eyebrow={`${shared.name}의 방탈출 유형`}
        typeId={shared.typeId}
        fear={shared.fear}
        difficulty={shared.difficulty}
        hint={shared.hint}
        players={shared.players}
        time={shared.time}
      >
        <TypeRarity typeId={shared.typeId} />
      </TypeCard>

      <FriendCompat friend={shared} />

      <p className="text-center">
        <Link
          href="/quiz"
          className="text-sm font-extrabold underline decoration-2 underline-offset-4 hover:text-candy"
        >
          내 유형 다시 진단하기
        </Link>
      </p>
    </div>
  );
}
