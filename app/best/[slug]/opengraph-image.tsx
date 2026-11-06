import { ImageResponse } from "next/og";
import { headers } from "next/headers";
import { conditionBySlug } from "@/lib/best";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 조건별 목록 공유 카드: 탈출귀 + 조건 제목 + 고른 기준.
// 카톡·인스타 스토리에 "안 무서운 방탈출 추천" 링크를 올렸을 때 보이는 그림.
export const runtime = "edge";
export const alt = "조건별 방탈출 추천";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function origin(): string {
  const host = headers().get("host");
  if (!host) return SITE_URL;
  return `${host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https"}://${host}`;
}

function decode(v: string): string {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

export default function BestImage({ params }: { params: { slug: string } }) {
  const c = conditionBySlug(decode(params.slug));
  // "(무서운 순)" 같은 정렬 설명은 카드에서 뺀다
  const criteria = c?.criteria.replace(/\s*\(.*\)$/, "") ?? "";

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
          <div style={{ fontSize: 96, lineHeight: 1 }}>{c?.emoji ?? "🎯"}</div>
          <div
            style={{
              marginTop: 28,
              fontSize: 76,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            {c?.title ?? "조건별 방탈출 추천"}
          </div>
          {criteria && (
            <div style={{ marginTop: 20, fontSize: 34, fontWeight: 600, opacity: 0.7 }}>
              {criteria}만 골랐어요
            </div>
          )}
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
            지역별로 한눈에 비교
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
