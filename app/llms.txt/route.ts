import { getAllThemes, listedBrands, listedRegions } from "@/lib/catalog-server";
import { listedConditions } from "@/lib/best";
import { llmsTxt } from "@/lib/llms";

// AI 검색·답변 엔진용 안내문. 빌드 때 만들어 두고 하루에 한 번만 다시 만든다(요청마다 서버가 돌지 않는다).
export const revalidate = 86400;

export async function GET() {
  const [themes, regions, brands] = await Promise.all([getAllThemes(), listedRegions(), listedBrands()]);
  const body = llmsTxt({ themes, regions, brands, conditions: listedConditions(themes), updated: new Date().toISOString().slice(0, 10) });
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
