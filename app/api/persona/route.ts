// GitHub Pages(정적 export)에서는 서버 라우트를 쓸 수 없어, 이 파일은
// 정적 GET 스텁으로 둔다. 퀴즈의 POST 호출은 정적 호스트에서 404가 나고
// 클라이언트가 규칙 기반 페르소나로 자동 폴백한다.
//
// ▶ 나중에 Vercel 등 서버 환경으로 옮겨 진짜 LLM을 쓰려면:
//   next.config 의 output:"export" 를 지우고, 아래를 원래의 POST 핸들러
//   (lib/ai.ts 의 generatePersona 사용)로 되돌리면 된다.

export const dynamic = "force-static";

export function GET() {
  return Response.json({ enabled: false });
}
