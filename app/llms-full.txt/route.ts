import { getAllThemes } from "@/lib/catalog-server";
import { llmsFullTxt } from "@/lib/llms";

// 모든 테마를 한 줄씩 적은 목록(AI 가 테마 사실을 한 번에 읽도록). 빌드 때 만들고 하루에 한 번만 다시 만든다.
export const revalidate = 86400;

export async function GET() {
  const body = llmsFullTxt(await getAllThemes(), new Date().toISOString().slice(0, 10));
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
