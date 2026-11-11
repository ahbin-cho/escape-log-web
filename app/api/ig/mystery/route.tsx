import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { getAllThemes } from "@/lib/catalog-server";
import { dailyMystery, kstDate, teaserPreview } from "@/lib/home-picks";
import { regionFromText } from "@/lib/region";
import { SITE_URL } from "@/lib/site";

// 인스타용 "오늘의 미스터리 방" 카드 (1080×1350, JPEG — 인스타 게시 API 는 JPEG 만 받음).
// ?date=YYYY-MM-DD 로 다른 날 미리보기. 정답(테마 이름·매장)은 그리지 않는다.
// 피드에서 0.5초 안에 멈추게: 큰 질문 → 짧게 끊은 줄거리 → 힌트 칩 → "정답은 프로필 링크".
// 글꼴: Pretendard (OFL, assets/fonts/Pretendard-LICENSE.txt)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const W = 1080;
const H = 1350;

const C = {
  bg: "#17151C",
  panel: "#24212B",
  cream: "#F5F0E6",
  dim: "#A9A3B3",
  candy: "#F0A04B",
  grape: "#9B8CE0",
};

let fontsCache: Promise<{ name: string; data: Buffer; weight: 500 | 800 }[]> | null = null;
function fonts() {
  fontsCache ??= Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Pretendard-ExtraBold.woff")),
    readFile(join(process.cwd(), "assets/fonts/Pretendard-Medium.woff")),
  ]).then(([bold, medium]) => [
    { name: "Pretendard", data: bold, weight: 800 as const },
    { name: "Pretendard", data: medium, weight: 500 as const },
  ]);
  return fontsCache;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const dateParam = url.searchParams.get("date");
  const now =
    dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
      ? new Date(`${dateParam}T03:00:00Z`) // 한국 낮 12시
      : new Date();

  const t = dailyMystery(await getAllThemes(), now);
  if (!t) return new Response("오늘 고를 테마가 없어요", { status: 404 });

  const region = regionFromText(t.cafe);
  const chips = [
    t.genre,
    `난이도 ${"●".repeat(t.difficulty)}${"○".repeat(Math.max(0, 5 - t.difficulty))}`,
    `공포도 ${"●".repeat(t.fear_level)}${"○".repeat(Math.max(0, 5 - t.fear_level))}`,
    region ?? "",
  ].filter(Boolean);
  const [, m, d] = kstDate(now).split("-");
  const origin = url.origin;

  const png = await new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "84px 84px 72px",
          backgroundColor: C.bg,
          color: C.cream,
          fontFamily: "Pretendard",
          position: "relative",
        }}
      >
        {/* 배경의 큰 물음표 */}
        <div
          style={{
            position: "absolute",
            right: -40,
            top: 120,
            fontSize: 900,
            fontWeight: 800,
            color: C.panel,
            lineHeight: 1,
          }}
        >
          ?
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              padding: "12px 26px",
              borderRadius: 999,
              backgroundColor: C.candy,
              color: C.bg,
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            오늘의 미스터리 방
          </div>
          <div style={{ fontSize: 32, fontWeight: 500, color: C.dim }}>
            {`${Number(m)}월 ${Number(d)}일`}
          </div>
        </div>

        <div
          style={{
            marginTop: 56,
            fontSize: 118,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.04em",
          }}
        >
          이 방, 어디게?
        </div>

        {/* 줄거리: 바깥 상자는 세로로 쌓고, 글은 안쪽 상자에 넣어야 줄바꿈 높이가 제대로 잡힌다 */}
        <div
          style={{
            marginTop: 56,
            display: "flex",
            flexDirection: "column",
            padding: "48px 52px",
            borderRadius: 36,
            backgroundColor: C.panel,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 46,
              fontWeight: 500,
              lineHeight: 1.55,
              letterSpacing: "-0.02em",
            }}
          >
            {`“${teaserPreview(t.teaser ?? "", 82)}”`}
          </div>
        </div>

        <div style={{ marginTop: 40, display: "flex", flexWrap: "wrap", gap: 16 }}>
          {chips.map((c) => (
            <div
              key={c}
              style={{
                display: "flex",
                padding: "14px 26px",
                borderRadius: 999,
                border: `3px solid ${C.grape}`,
                color: C.cream,
                fontSize: 32,
                fontWeight: 800,
              }}
            >
              {c}
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 50, fontWeight: 800, color: C.candy }}>
              정답은 프로필 링크에서
            </div>
            <div style={{ marginTop: 10, fontSize: 32, fontWeight: 500, color: C.dim }}>
              {`알 것 같으면 댓글로 · ${new URL(SITE_URL).host}`}
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${origin}/mascot.png`} alt="" width={250} height={250} />
        </div>
      </div>
    ),
    { width: W, height: H, fonts: await fonts() }
  ).arrayBuffer();

  const jpeg = await sharp(Buffer.from(png)).jpeg({ quality: 90 }).toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": "image/jpeg",
      // 같은 날에는 같은 그림이라 1시간 캐시
      "Cache-Control": "public, max-age=3600",
    },
  });
}
