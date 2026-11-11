import QuizClient from "@/components/quiz/QuizClient";

// 질문은 브라우저에서 뽑아 그리므로, 제목·소개는 여기(서버)에서 그려
// 검색엔진이 받는 HTML 에도 내용이 실리게 한다.
export default function QuizPage() {
  return (
    <>
      <header className="mx-auto mb-6 max-w-xl space-y-1 text-center">
        <h1 className="text-xl font-extrabold sm:text-2xl">🔮 방탈출 취향 찾기</h1>
        <p className="text-sm text-cream/70 [word-break:keep-all]">
          질문 몇 개에 답하면 16가지 방탈 유형 중 내 유형을 진단하고, 공포도·난이도·인원까지
          맞춘 테마를 추천해 줘요.
        </p>
      </header>
      <QuizClient />
    </>
  );
}
