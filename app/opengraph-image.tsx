import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

// 카카오톡/트위터/페북 공유 시 뜨는 미리보기 카드 이미지 (동적 생성)
export const runtime = "edge";
export const alt = "방탈로그 — 방탈출 기록·취향 진단·추천";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F5F0E6",
          color: "#1D1D1D",
          fontFamily: "sans-serif",
          padding: "64px",
        }}
      >
        <div style={{ fontSize: 140, lineHeight: 1 }}>👻</div>
        <div
          style={{
            marginTop: 32,
            fontSize: 88,
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 40,
            fontWeight: 600,
            color: "#E49A4A",
          }}
        >
          방탈출 기록 · 취향 진단 · 추천
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 30,
            color: "#1D1D1D",
            opacity: 0.7,
          }}
        >
          방 좀 깨봤어? 취향 딱 짚어줄게 — 무료
        </div>
      </div>
    ),
    { ...size }
  );
}
