import { ImageResponse } from "next/og";
import { headers } from "next/headers";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { decodeShare } from "@/lib/quiz/share";
import { QUIZ_TYPES, typeImage } from "@/lib/quiz/types";

// 공유 링크 미리보기 카드: 유형 그림 + "○○의 방탈출 유형" + 유형 이름
export const runtime = "edge";
export const alt = "방탈출 유형 결과";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 유형 그림은 같은 배포의 정적 파일에서 읽는다(로컬 개발 포함).
function origin(): string {
  const host = headers().get("host");
  if (!host) return SITE_URL;
  return `${host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https"}://${host}`;
}

export default function ShareImage({ params }: { params: { code: string } }) {
  const shared = decodeShare(params.code);
  const type = shared ? QUIZ_TYPES[shared.typeId] : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 56,
          padding: 64,
          backgroundColor: "#F5F0E6",
          color: "#1D1D1D",
          fontFamily: "sans-serif",
        }}
      >
        {shared && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={origin() + typeImage(shared.typeId)}
            alt=""
            width={470}
            height={470}
            style={{ borderRadius: 40, border: "6px solid #1D1D1D", objectFit: "cover" }}
          />
        )}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 38, fontWeight: 600, opacity: 0.7 }}>
            {shared ? `${shared.name}의 방탈출 유형` : "방탈출 유형 진단"}
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 80,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            {type ? type.title : SITE_NAME}
          </div>
          <div
            style={{
              marginTop: 32,
              display: "flex",
              alignSelf: "flex-start",
              padding: "12px 28px",
              borderRadius: 999,
              border: "5px solid #1D1D1D",
              backgroundColor: "#E49A4A",
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            너는 어떤 유형이야?
          </div>
          <div style={{ marginTop: 40, fontSize: 30, fontWeight: 700, opacity: 0.6 }}>
            {SITE_NAME}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
