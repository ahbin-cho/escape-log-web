import { ImageResponse } from "next/og";
import { headers } from "next/headers";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 방탈출 기록장 공유 카드.
export const runtime = "edge";
export const alt = "방탈출 기록장 · 달력 다이어리";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function origin(): string {
  const host = headers().get("host");
  if (!host) return SITE_URL;
  return `${host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https"}://${host}`;
}

export default function DiaryImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 48,
          padding: 64,
          backgroundColor: "#F5F0E6",
          color: "#1D1D1D",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 96, lineHeight: 1 }}>📓</div>
          <div
            style={{
              marginTop: 28,
              fontSize: 76,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            방탈출 기록장
          </div>
          <div style={{ marginTop: 20, fontSize: 34, fontWeight: 600, opacity: 0.7 }}>달력 다이어리 · 몇 번째 방 · 올해 결산</div>
          <div
            style={{
              marginTop: 36,
              display: "flex",
              alignSelf: "flex-start",
              padding: "12px 28px",
              borderRadius: 999,
              border: "5px solid #1D1D1D",
              backgroundColor: "#E49A4A",
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            로그인 없이 바로 기록
          </div>
          <div style={{ marginTop: 32, fontSize: 30, fontWeight: 700, opacity: 0.6 }}>
            {SITE_NAME}
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={origin() + "/mascot.png"} alt="" width={340} height={340} />
      </div>
    ),
    { ...size }
  );
}
