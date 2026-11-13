import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MiniQuizClient from "@/components/mini/MiniQuizClient";
import { MINI_QUIZZES, miniBySlug, miniResult } from "@/lib/mini/quizzes";
import { DEFAULT_OG_IMAGE } from "@/lib/site";

// 미니 진단 한 개. 결과 공유 링크는 /mini/<slug>?r=<결과키> 이고,
// 그 주소로 들어오면 결과 카드부터 보여 주고 미리보기 문구도 결과에 맞춘다.
export const dynamicParams = false;

export function generateStaticParams() {
  return MINI_QUIZZES.map((q) => ({ slug: q.slug }));
}

type Props = { params: { slug: string }; searchParams: { r?: string | string[] } };

function resultParam(sp: Props["searchParams"]): string | null {
  const r = Array.isArray(sp.r) ? sp.r[0] : sp.r;
  return r ? r.slice(0, 40) : null;
}

export function generateMetadata({ params, searchParams }: Props): Metadata {
  const quiz = miniBySlug(params.slug);
  if (!quiz) return {};
  const result = miniResult(quiz, resultParam(searchParams));
  const title = result ? `${quiz.title} · 결과는 ‘${result.title}’` : `${quiz.title} (1분 테스트)`;
  const description = result
    ? `${result.oneLiner} 1분이면 나도 해 볼 수 있어요.`
    : quiz.intro;
  return {
    title,
    description,
    // 결과 주소는 시작 주소 하나로 모아 검색에 올린다.
    alternates: { canonical: `/mini/${quiz.slug}` },
    openGraph: {
      title: `${title} | 방탈로그`,
      description,
      url: `/mini/${quiz.slug}`,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function MiniQuizPage({ params, searchParams }: Props) {
  const quiz = miniBySlug(params.slug);
  if (!quiz) notFound();
  const key = miniResult(quiz, resultParam(searchParams))?.key ?? null;
  // key 가 바뀌면(다른 결과 링크로 이동) 진행 상태를 새로 시작한다.
  return <MiniQuizClient key={key ?? "start"} slug={quiz.slug} initialKey={key} />;
}
