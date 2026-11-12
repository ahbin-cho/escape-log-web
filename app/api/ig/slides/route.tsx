import type { ReactNode } from "react";
import { ED, jpegResponse } from "@/lib/og-card";

// 서비스 소개 캐러셀(인스타 여러 장 게시용) ?n=1..6
// 한 장짜리 광고 카드: ?ad=diary (다이어리 작성 유도), ?ad=recap (12월 연말 결산), ?ad=ticket (방켓팅)
// ?page=1/4 를 붙이면 오른쪽 위가 "01 / 04" 로 바뀐다(여러 카드를 한 캐러셀로 묶을 때)
// 한 번 올리는 용도라 자동 게시하지 않는다: 이미지를 받아 폰에서 직접 올린다.
// 미스터리 카드 시안 B 와 같은 에디토리얼 톤(크림 바탕·굵은 글자·얇은 선, 장식 없음).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOTAL = 6;

function Frame({
  n,
  label,
  children,
  origin,
}: {
  n: number;
  label?: string; // 오른쪽 위 표시(없으면 "0n / 06")
  children: ReactNode;
  origin: string;
}) {
  return (
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
        <div>BANGTALLOG</div>
        <div style={{ color: ED.dim }}>{label ?? `0${n} / 0${TOTAL}`}</div>
      </div>
      <div style={{ marginTop: 26, height: 3, backgroundColor: ED.ink, display: "flex" }} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>{children}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 28, fontWeight: 500, color: ED.dim }}>방탈로그 · bangtallog.com</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${origin}/mascot.png`} alt="" width={110} height={110} />
      </div>
    </div>
  );
}

const H1 = ({ children }: { children: ReactNode }) => (
  <div style={{ display: "flex", flexDirection: "column", marginTop: 86, fontSize: 92, fontWeight: 800, lineHeight: 1.18, letterSpacing: "-0.045em" }}>
    {children}
  </div>
);
const Sub = ({ children }: { children: string }) => (
  <div style={{ display: "flex", marginTop: 30, fontSize: 38, fontWeight: 500, lineHeight: 1.5, color: ED.dim, wordBreak: "keep-all" }}>
    {children}
  </div>
);
const Accent = ({ children }: { children: string }) => (
  <span style={{ display: "flex", color: ED.accent }}>{children}</span>
);

function DiaryRow({ no, day, name, meta, result, hl }: { no: string; day: string; name: string; meta: string; result: string; hl?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 30,
        padding: "26px 32px",
        borderRadius: 26,
        border: `3px solid ${hl ? ED.accent : ED.ink}`,
        backgroundColor: hl ? "#FBE9D7" : "#FFFCF6",
      }}
    >
      <div
        style={{
          display: "flex",
          width: day.includes(".") ? 130 : 70,
          fontSize: day.includes(".") ? 38 : 44,
          fontWeight: 800,
          justifyContent: "center",
          letterSpacing: "-0.02em",
        }}
      >
        {day}
      </div>
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", padding: "4px 14px", borderRadius: 10, backgroundColor: hl ? ED.accent : ED.panel, color: hl ? "#FFF" : ED.dim, fontSize: 24, fontWeight: 800 }}>{no}</div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>{name}</div>
        </div>
        <div style={{ marginTop: 8, fontSize: 26, fontWeight: 500, color: ED.dim }}>{meta}</div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: ED.dim }}>{result}</div>
    </div>
  );
}

function slide(n: number, origin: string, page?: string) {
  switch (n) {
    case 1:
      return (
        <Frame n={1} label={page} origin={origin}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 128, fontWeight: 800, lineHeight: 1.12, letterSpacing: "-0.05em" }}>
              <div>방탈출,</div>
              <div>기록하고</div>
              <div style={{ color: ED.accent }}>있어요?</div>
            </div>
            <Sub>다녀온 방은 다이어리로, 다음 방은 내 취향으로 고르는 곳.</Sub>
          </div>
        </Frame>
      );
    case 2:
      return (
        <Frame n={2} label={page} origin={origin}>
          <H1>
            <div>몇 번째 방이었는지</div>
            <div style={{ display: "flex" }}>
              <Accent>기억나요?</Accent>
            </div>
          </H1>
          <Sub>남기면 순서대로 번호가 붙어요. 50번째, 100번째 방은 따로 축하해요.</Sub>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 56 }}>
            <DiaryRow no="50번째 방" day="22" name="어느 폐가의 기록" meta="공포 · 강남 · 3명" result="탈출 8분 남김" hl />
            <DiaryRow no="#49" day="15" name="은하수 배달부" meta="SF · 홍대 · 2명" result="노힌트" />
            <DiaryRow no="#48" day="8" name="고양이 탐정 사무소" meta="추리 · 서면 · 4명" result="실패" />
          </div>
        </Frame>
      );
    case 3:
      return (
        <Frame n={3} label={page} origin={origin}>
          <H1>
            <div>연말엔,</div>
            <div style={{ display: "flex" }}>
              <Accent>나만의 결산</Accent>
            </div>
          </H1>
          <Sub>그 해 기록으로 자동으로 정리돼요. 친구들한테 자랑은 버튼 하나.</Sub>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 56 }}>
            {[
              ["올해 플레이", "47방"],
              ["탈출 성공률", "74%"],
              ["노힌트 탈출", "16번"],
              ["원정 지역", "3곳"],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{ display: "flex", flexDirection: "column", width: 438, padding: "30px 34px", borderRadius: 26, border: `3px solid ${ED.ink}`, backgroundColor: "#FFFCF6" }}
              >
                <div style={{ fontSize: 28, fontWeight: 800, color: ED.dim }}>{k}</div>
                <div style={{ marginTop: 6, fontSize: 76, fontWeight: 800, letterSpacing: "-0.03em" }}>{v}</div>
              </div>
            ))}
          </div>
        </Frame>
      );
    case 4:
      return (
        <Frame n={4} label={page} origin={origin}>
          <H1>
            <div>인기순 말고,</div>
            <div style={{ display: "flex" }}>
              <Accent>내 취향순</Accent>
            </div>
          </H1>
          <Sub>질문 몇 개면 16가지 유형 중 내 유형이 나오고, 딱 맞는 방을 골라 줘요.</Sub>
          <div
            style={{ display: "flex", flexDirection: "column", marginTop: 56, padding: "40px 44px", borderRadius: 30, backgroundColor: ED.ink, color: ED.bg }}
          >
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "0.18em", color: ED.accent }}>나의 방탈출 유형</div>
            <div style={{ marginTop: 14, fontSize: 70, fontWeight: 800, letterSpacing: "-0.04em" }}>과몰입 주인공</div>
            <div style={{ display: "flex", marginTop: 14, fontSize: 32, fontWeight: 500, lineHeight: 1.5, color: "#CFC7BB", wordBreak: "keep-all" }}>
              방에 들어가면 그 사람이 돼요. 엔딩에서 제일 오래 서 있는 타입.
            </div>
          </div>
        </Frame>
      );
    case 5:
      return (
        <Frame n={5} label={page} origin={origin}>
          <H1>
            <div>겁 많은 친구도</div>
            <div style={{ display: "flex" }}>
              <Accent>다 같이</Accent>
            </div>
          </H1>
          <Sub>우리 팀 궁합을 보고, 제일 겁 많은 친구도 들어갈 수 있는 방만 골라요.</Sub>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 56 }}>
            {[
              ["민지", "공포 4 · 난이도 4"],
              ["준호", "공포 5 · 난이도 3"],
              ["서연", "공포 2 · 난이도 2"],
            ].map(([who, t]) => (
              <div key={who} style={{ display: "flex", justifyContent: "space-between", padding: "22px 32px", borderRadius: 22, border: `3px solid ${ED.ink}`, backgroundColor: "#FFFCF6", fontSize: 34, fontWeight: 800 }}>
                <div>{who}</div>
                <div style={{ color: ED.dim, fontWeight: 500 }}>{t}</div>
              </div>
            ))}
            <div style={{ display: "flex", marginTop: 10, padding: "26px 32px", borderRadius: 22, backgroundColor: ED.accent, color: "#FFF", fontSize: 34, fontWeight: 800 }}>
              → 공포 2까지 · 난이도 3 근처 · 3명 가능한 방
            </div>
          </div>
        </Frame>
      );
    default:
      return (
        <Frame n={6} label={page} origin={origin}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 104, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.05em" }}>
              <div>지난 주말 간 방,</div>
              <div style={{ display: "flex" }}>
                <Accent>기억날 때</Accent>
                <span style={{ marginLeft: 28 }}>남겨요</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 60 }}>
              {["무료, 로그인 없이 바로 시작", "스포는 나만 보는 메모로 따로", "매일 오늘의 미스터리 방"].map((x) => (
                <div key={x} style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40, fontWeight: 800 }}>
                  <div style={{ display: "flex", width: 18, height: 18, borderRadius: 9, backgroundColor: ED.accent }} />
                  {x}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", marginTop: 70, fontSize: 44, fontWeight: 800 }}>프로필 링크 → bangtallog.com</div>
          </div>
        </Frame>
      );
  }
}

// 한 장짜리 광고 카드
function ad(kind: string, origin: string, page?: string) {
  const cta = (text: string) => (
    <div style={{ display: "flex", marginTop: 52, marginBottom: 36, fontSize: 40, fontWeight: 800 }}>{text}</div>
  );
  if (kind === "ticket") {
    // 예매 티켓: 왼쪽 본권 + 점선 + 오른쪽 떼는 부분(#50). 점선 위아래에 반원 홈.
    const notch = (top: boolean) => (
      <div
        style={{
          position: "absolute",
          left: 640 - 22,
          [top ? "top" : "bottom"]: -22,
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: ED.bg,
          display: "flex",
        }}
      />
    );
    return (
      <Frame n={0} label={page ?? "방켓팅"} origin={origin}>
        <H1>
          <div style={{ display: "flex" }}>방켓팅까지 해서 간 방,</div>
          <div style={{ display: "flex" }}>
            <Accent>1년 뒤에도 기억나요?</Accent>
          </div>
        </H1>
        <Sub>예약 전쟁 뚫고 간 방, 30초만 남겨 두면 언제든 꺼내 볼 수 있어요.</Sub>

        <div
          style={{
            position: "relative",
            display: "flex",
            marginTop: 60,
            height: 300,
            borderRadius: 28,
            border: `3px solid ${ED.ink}`,
            backgroundColor: "#FFFCF6",
            transform: "rotate(-2deg)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", width: 640, padding: "34px 40px" }}>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "0.22em", color: ED.accent }}>
              ESCAPE ROOM TICKET
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 18 }}>
              <div style={{ display: "flex", width: 300, height: 52, backgroundColor: ED.ink }} />
              <div style={{ fontSize: 36, fontWeight: 800 }}>방</div>
            </div>
            <div style={{ display: "flex", gap: 44, marginTop: 34 }}>
              {[
                ["DATE", "11.14 (토)"],
                ["TIME", "19:30"],
                ["PLAYERS", "4명"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "0.18em", color: ED.dim }}>{k}</div>
                  <div style={{ marginTop: 6, fontSize: 34, fontWeight: 800 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              borderLeft: `4px dashed ${ED.faint}`,
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "0.2em", color: ED.dim }}>NO.</div>
            <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: "-0.04em", color: ED.accent }}>50</div>
          </div>
          {notch(true)}
          {notch(false)}
        </div>

        <div style={{ display: "flex", marginTop: 56, fontSize: 40, fontWeight: 800 }}>
          티켓은 사라져도, 기록은 남아요.
        </div>
        <div style={{ flex: 1 }} />
        {cta("무료 · 로그인 없이 30초 → 프로필 링크")}
      </Frame>
    );
  }
  if (kind === "recap") {
    return (
      <Frame n={0} label={page ?? "12월"} origin={origin}>
        <H1>
          <div style={{ display: "flex" }}>올해,</div>
          <div style={{ display: "flex" }}>
            <Accent>몇 방</Accent>
            <span style={{ marginLeft: 28 }}>했어요?</span>
          </div>
        </H1>
        <Sub>기록만 해 두면 연말 결산이 자동으로 나와요. 친구들한테 자랑은 버튼 하나.</Sub>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 56 }}>
          {[
            ["올해 플레이", "47", "방"],
            ["탈출 성공률", "74", "%"],
            ["노힌트 탈출", "16", "번"],
            ["원정 지역", "3", "곳"],
          ].map(([k, v, unit]) => (
            <div
              key={k}
              style={{ display: "flex", flexDirection: "column", width: 438, padding: "24px 34px", borderRadius: 26, border: `3px solid ${ED.ink}`, backgroundColor: "#FFFCF6" }}
            >
              <div style={{ fontSize: 28, fontWeight: 800, color: ED.dim }}>{k}</div>
              <div style={{ display: "flex", alignItems: "baseline", marginTop: 2 }}>
                <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: "-0.03em", color: ED.accent }}>{v}</div>
                <div style={{ marginLeft: 6, fontSize: 44, fontWeight: 800 }}>{unit}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        {cta("지금부터 써도 늦지 않았어요 → 프로필 링크")}
      </Frame>
    );
  }
  // diary: 다이어리 작성 유도
  return (
    <Frame n={0} label={page ?? "다이어리"} origin={origin}>
      <H1>
        <div style={{ display: "flex" }}>지난주에 간 방,</div>
        <div style={{ display: "flex" }}>
          <Accent>벌써 헷갈려요?</Accent>
        </div>
      </H1>
      <Sub>다녀온 방을 남기면 몇 번째 방인지, 올해 결산까지 알아서 정리돼요.</Sub>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 56 }}>
        <DiaryRow no="#50" day="11.16" name="어느 폐가의 기록" meta="공포 · 강남 · 3명" result="50번째 방" hl />
        <DiaryRow no="#49" day="11.09" name="은하수 배달부" meta="SF · 홍대 · 2명" result="노힌트" />
        <DiaryRow no="#48" day="11.02" name="고양이 탐정 사무소" meta="추리 · 서면 · 4명" result="탈출 8분 남김" />
      </div>
      <div style={{ flex: 1 }} />
      {cta("무료 · 로그인 없이 30초 → 프로필 링크")}
    </Frame>
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const adKind = url.searchParams.get("ad");
  // ?page=1/4 → 오른쪽 위를 "01 / 04" 로(여러 카드를 한 캐러셀로 묶을 때 쪽수 통일)
  const pm = (url.searchParams.get("page") ?? "").match(/^(\d+)\/(\d+)$/);
  const page = pm ? `${pm[1].padStart(2, "0")} / ${pm[2].padStart(2, "0")}` : undefined;
  if (adKind) return jpegResponse(ad(adKind, url.origin, page), 86400);
  const n = Math.min(TOTAL, Math.max(1, Number(url.searchParams.get("n")) || 1));
  return jpegResponse(slide(n, url.origin, page), 86400);
}
