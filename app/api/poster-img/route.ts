import { getAllThemes } from "@/lib/catalog-server";

// 리뷰 시트 이미지(브라우저 캔버스)에 공식 포스터를 그리려면 같은 주소에서 받아야 한다(다른 주소 그림은 캔버스가 저장을 막는다).
// 아무 주소나 받아 주는 통로가 되지 않게 테마 id 로만 받고, 우리 테마 목록에 있는 포스터 주소만 가져온다.
export const revalidate = 86400;

function sniffImage(b: Uint8Array): string | null {
  if (b[0] === 0xff && b[1] === 0xd8) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return "image/gif";
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45) return "image/webp";
  return null;
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{8,40}$/i.test(id)) return new Response("bad id", { status: 400 });
  const theme = (await getAllThemes()).find((t) => t.id === id);
  const url = theme?.poster_url ?? "";
  if (!/^https:\/\//.test(url)) return new Response("no poster", { status: 404 });
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (bangtallog poster)" }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return new Response("fetch failed", { status: 502 });
    const buf = await res.arrayBuffer();
    if (buf.byteLength > 6_000_000) return new Response("too large", { status: 502 });
    // 일부 매장 서버는 그림을 application/octet-stream 으로 보낸다 → 파일 앞머리로 그림 종류를 직접 확인한다
    const type = sniffImage(new Uint8Array(buf.slice(0, 12)));
    if (!type) return new Response("not an image", { status: 502 });
    return new Response(buf, {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" },
    });
  } catch {
    return new Response("fetch failed", { status: 502 });
  }
}
