import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactElement } from "react";
import { ImageResponse } from "next/og";
import sharp from "sharp";

// ─────────────────────────────────────────────────────────────
// 인스타 카드 공통(서버 전용): 1080×1350 JPEG 로 그리기, Pretendard 글꼴, 에디토리얼 색.
// 인스타 게시 API 는 JPEG 만 받으므로 PNG → JPEG 로 바꿔 돌려준다.
// 글꼴: Pretendard (OFL, assets/fonts/Pretendard-LICENSE.txt)
// ─────────────────────────────────────────────────────────────

export const CARD_W = 1080;
export const CARD_H = 1350;

// 잡지 표지 톤: 장식 없이 크림 바탕·먹색 글자·주황 포인트 하나
export const ED = {
  bg: "#F5F0E6",
  ink: "#1D1D1D",
  dim: "#7A736B",
  faint: "#D9D0C2",
  accent: "#E2853A",
  panel: "#EDE5D6",
};

type Font = { name: string; data: Buffer; weight: 400 | 500 | 800 };
let fontsCache: Promise<Font[]> | null = null;

export function cardFonts(): Promise<Font[]> {
  fontsCache ??= Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Pretendard-ExtraBold.woff")),
    readFile(join(process.cwd(), "assets/fonts/Pretendard-Medium.woff")),
    readFile(join(process.cwd(), "assets/fonts/SBAggroB.woff")),
  ]).then(([bold, medium, aggro]) => [
    { name: "Pretendard", data: bold, weight: 800 as const },
    { name: "Pretendard", data: medium, weight: 500 as const },
    // 사이트 제목 글꼴(SB 어그로, 상업적 이용 가능 무료 글꼴) — 카드 제목용 fontFamily: "Aggro"
    { name: "Aggro", data: aggro, weight: 400 as const },
  ]);
  return fontsCache;
}

export async function jpegResponse(element: ReactElement, cacheSeconds = 3600): Promise<Response> {
  const png = await new ImageResponse(element, {
    width: CARD_W,
    height: CARD_H,
    fonts: await cardFonts(),
  }).arrayBuffer();
  const jpeg = await sharp(Buffer.from(png)).jpeg({ quality: 92 }).toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}`,
    },
  });
}
