import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { getAllThemes } from "@/lib/catalog-server";
import { dailyMystery, kstDate, teaserPreview } from "@/lib/home-picks";
import { regionFromText } from "@/lib/region";
import { SITE_URL } from "@/lib/site";
import { ED, jpegResponse } from "@/lib/og-card";

// 인스타용 "오늘의 미스터리 방" 카드 (1080×1350, JPEG — 인스타 게시 API 는 JPEG 만 받음).
// ?date=YYYY-MM-DD 로 다른 날 미리보기. 정답(테마 이름·매장)은 그리지 않는다.
// ?style=b 는 장식을 뺀 에디토리얼(잡지 표지) 시안.
// 콘셉트 "사건 파일": 사이트의 크림 종이·먹선·딱딱한 그림자 그대로, 방 이름은 검은 줄로 가린 기밀 서류.
// 글꼴: Pretendard (OFL, assets/fonts/Pretendard-LICENSE.txt)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const W = 1080;
const H = 1350;

// 사이트와 같은 색(tailwind.config.ts): 크림 종이·진한 먹선·주황 도장
const C = {
  bg: "#F5F0E6",
  paper: "#FFFCF6",
  ink: "#1D1D1D",
  dim: "#6B6560",
  candy: "#E49A4A",
  stamp: "#D9682B",
  grape: "#8B7EC8",
  line: "#E8E0D2",
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
  const [, m, d] = kstDate(now).split("-");
  const origin = url.origin;

  if (url.searchParams.get("style") === "b") {
    return editorialCard({
      teaser: teaserPreview(t.teaser ?? "", 96),
      genre: t.genre,
      difficulty: t.difficulty,
      fear: t.fear_level,
      region,
      date: `${m}.${d}`,
      origin,
    });
  }

  // 가림 줄 길이로 이름 길이를 살짝 힌트. 도장과 겹치지 않게 최대 7칸(420px)
  const nameLen = Math.min(7, Math.max(3, [...t.name.trim()].length));
  const dots = (n: number) => `${"●".repeat(n)}${"○".repeat(Math.max(0, 5 - n))}`;
  const fileNo = `NO. ${m}${d}`;

  const png = await new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: C.bg,
          color: C.ink,
          fontFamily: "Pretendard",
        }}
      >
        {/* 서류 한 장: 사이트 버튼처럼 굵은 먹선 + 딱딱하게 밀린 그림자, 살짝 기울임 */}
        <div
          style={{
            position: "absolute",
            left: 70,
            top: 90,
            width: 940,
            height: 1010,
            display: "flex",
            flexDirection: "column",
            padding: "70px 64px 56px",
            backgroundColor: C.paper,
            border: `6px solid ${C.ink}`,
            boxShadow: `16px 16px 0 0 ${C.ink}`,
            transform: "rotate(-1.5deg)",
          }}
        >
          {/* 머리: 서류 번호 + 분류 */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "0.12em" }}>
              방탈출 사건 파일
            </div>
            <div style={{ fontSize: 30, fontWeight: 500, color: C.dim, letterSpacing: "0.08em" }}>
              {fileNo}
            </div>
          </div>
          <div style={{ marginTop: 22, height: 4, backgroundColor: C.ink, display: "flex" }} />

          {/* 방 이름: 기밀 문서처럼 검은 줄로 가림 */}
          <div style={{ marginTop: 46, display: "flex", alignItems: "center", gap: 22 }}>
            <div style={{ fontSize: 40, fontWeight: 800 }}>방 이름</div>
            <div
              style={{
                display: "flex",
                width: nameLen * 60,
                height: 62,
                backgroundColor: C.ink,
                transform: "rotate(-0.6deg)",
              }}
            />
          </div>
          <div style={{ marginTop: 14, fontSize: 28, fontWeight: 500, color: C.dim }}>
            {`${region ?? "어딘가"}의 한 방탈출 · 정체 미확인`}
          </div>

          {/* 제보 내용 = 줄거리 */}
          <div style={{ marginTop: 46, fontSize: 30, fontWeight: 800, color: C.stamp }}>제보 내용</div>
          <div
            style={{
              marginTop: 16,
              display: "flex",
              flexDirection: "column",
              borderTop: `3px dashed ${C.line}`,
              borderBottom: `3px dashed ${C.line}`,
              padding: "28px 0",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 42,
                fontWeight: 500,
                lineHeight: 1.6,
                wordBreak: "keep-all",
              }}
            >
              {teaserPreview(t.teaser ?? "", 78)}
            </div>
          </div>

          {/* 단서 */}
          <div style={{ marginTop: 34, display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              ["장르", t.genre],
              ["난이도", dots(t.difficulty)],
              ["공포도", dots(t.fear_level)],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", fontSize: 34 }}>
                <div style={{ width: 150, fontWeight: 800 }}>{k}</div>
                <div style={{ fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", justifyContent: "flex-end", fontSize: 28, fontWeight: 500, color: C.dim }}>
            {new URL(SITE_URL).host}
          </div>
        </div>

        {/* 주황 잉크 도장 */}
        <div
          style={{
            position: "absolute",
            right: 120,
            top: 240,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "14px 26px",
            border: `7px solid ${C.stamp}`,
            borderRadius: 14,
            color: C.stamp,
            transform: "rotate(9deg)",
            opacity: 0.9,
          }}
        >
          <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: "0.06em" }}>미스터리</div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "0.2em" }}>{`${Number(m)}.${Number(d)} 오늘의 방`}</div>
        </div>

        {/* 탈출귀 + 말풍선 (반말) */}
        <div
          style={{
            position: "absolute",
            right: 230,
            bottom: 70,
            display: "flex",
            flexDirection: "column",
            padding: "18px 30px",
            backgroundColor: C.paper,
            border: `5px solid ${C.ink}`,
            borderRadius: 28,
            boxShadow: `8px 8px 0 0 ${C.ink}`,
          }}
        >
          <div style={{ fontSize: 34, fontWeight: 800 }}>흐흐, 어딘지 알겠어? 댓글 ㄱㄱ</div>
          <div style={{ marginTop: 6, fontSize: 30, fontWeight: 800, color: C.stamp }}>
            정답은 프로필 링크에 있어
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${origin}/mascot.png`}
          alt=""
          width={230}
          height={230}
          style={{ position: "absolute", right: 30, bottom: 30, transform: "rotate(8deg)" }}
        />
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


// 시안 B: 잡지 표지처럼 글자로만. 큰 따옴표 + 줄거리가 주인공, 단서는 얇은 선 아래 표로, 탈출귀는 서명처럼 작게.
function editorialCard(p: {
  teaser: string;
  genre: string;
  difficulty: number;
  fear: number;
  region: string | null;
  date: string;
  origin: string;
}) {
  const scale = (n: number) => `${"●".repeat(n)}${"○".repeat(Math.max(0, 5 - n))}`;
  return jpegResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "96px 92px 84px",
        backgroundColor: ED.bg,
        color: ED.ink,
        fontFamily: "Pretendard",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, fontWeight: 800, letterSpacing: "0.22em" }}>
        <div>TODAY&apos;S MYSTERY ROOM</div>
        <div style={{ color: ED.dim }}>{p.date}</div>
      </div>
      <div style={{ marginTop: 26, height: 3, backgroundColor: ED.ink, display: "flex" }} />

      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", width: 96, height: 14, backgroundColor: ED.accent, marginBottom: 40 }} />
      <div
        style={{
          display: "flex",
          fontSize: 58,
          fontWeight: 800,
          lineHeight: 1.42,
          letterSpacing: "-0.035em",
          wordBreak: "keep-all",
        }}
      >
        {p.teaser}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: "flex", fontSize: 34, fontWeight: 500, color: ED.dim }}>
        {`이 줄거리, ${p.region ? `${p.region}의 ` : ""}어느 방일까요?`}
      </div>
      <div style={{ marginTop: 28, height: 2, backgroundColor: ED.faint, display: "flex" }} />
      <div style={{ marginTop: 30, display: "flex" }}>
        {[
          ["장르", p.genre],
          ["난이도", scale(p.difficulty)],
          ["공포도", scale(p.fear)],
        ].map(([k, v], i) => (
          <div
            key={k}
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              paddingLeft: i ? 32 : 0,
              borderLeft: i ? `2px solid ${ED.faint}` : "none",
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 800, color: ED.dim, letterSpacing: "0.1em" }}>{k}</div>
            <div style={{ marginTop: 10, fontSize: 36, fontWeight: 800 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 40, fontWeight: 800 }}>정답은 프로필 링크에서</div>
          <div style={{ marginTop: 8, fontSize: 28, fontWeight: 500, color: ED.dim }}>방탈로그 · bangtallog.com</div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${p.origin}/mascot.png`} alt="" width={130} height={130} />
      </div>
    </div>
  );
}
