import { ImageResponse } from "next/og";
import sharp from "sharp";
import { getAllThemes } from "@/lib/catalog-server";
import { dailyMystery, kstDate, teaserPreview } from "@/lib/home-picks";
import { regionFromText } from "@/lib/region";
import { SITE_URL } from "@/lib/site";

// 인스타용 "오늘의 미스터리 방" 카드 이미지 (1080×1350, JPEG — 인스타 게시 API 는 JPEG 만 받음).
// ?date=YYYY-MM-DD 로 다른 날 미리보기. 정답(테마 이름)은 그리지 않는다.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const W = 1080;
const H = 1350;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const dateParam = url.searchParams.get("date");
  const now = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
    ? new Date(`${dateParam}T03:00:00Z`) // 한국 낮 12시
    : new Date();

  const t = dailyMystery(await getAllThemes(), now);
  if (!t) return new Response("오늘 고를 테마가 없어요", { status: 404 });

  const region = regionFromText(t.cafe);
  const chips = [
    t.genre,
    `난이도 ${t.difficulty}/5`,
    `공포도 ${t.fear_level}/5`,
    region ?? "",
  ].filter(Boolean);
  const origin = new URL(req.url).origin;

  const png = await new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 80,
          backgroundColor: "#1D1D1D",
          color: "#F5F0E6",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 44, fontWeight: 800, color: "#E49A4A" }}>오늘의 미스터리 방</div>
          <div style={{ fontSize: 32, opacity: 0.6 }}>{kstDate(now).replace(/-/g, ".")}</div>
        </div>

        <div style={{ marginTop: 70, fontSize: 40, fontWeight: 700, opacity: 0.7 }}>
          이 줄거리, 어느 방일까?
        </div>

        <div
          style={{
            marginTop: 36,
            display: "flex",
            borderLeft: "12px solid #E49A4A",
            paddingLeft: 40,
            fontSize: 54,
            lineHeight: 1.5,
            fontWeight: 600,
          }}
        >
          “{teaserPreview(t.teaser ?? "", 150)}”
        </div>

        <div style={{ marginTop: 56, display: "flex", flexWrap: "wrap", gap: 20 }}>
          {chips.map((c) => (
            <div
              key={c}
              style={{
                display: "flex",
                padding: "14px 30px",
                borderRadius: 999,
                border: "4px solid #F5F0E6",
                fontSize: 36,
                fontWeight: 700,
              }}
            >
              {c}
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 40, fontWeight: 800 }}>정답은 프로필 링크에서</div>
            <div style={{ marginTop: 12, fontSize: 34, opacity: 0.6 }}>
              {new URL(SITE_URL).host}
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${origin}/mascot.png`} alt="" width={260} height={260} />
        </div>
      </div>
    ),
    { width: W, height: H }
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
