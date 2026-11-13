import type { ReactElement } from "react";
import { Cover, ED, Em, FootNote, FootPill, Ghost, Hand, Headline, Line, Paper, Sheet, Sticker, Sub, Wig, jpegResponse } from "@/lib/og-card";

// 서비스 소개 캐러셀(인스타 여러 장 게시용) ?n=1..6
// 한 장짜리 광고 카드: ?ad=diary (다이어리 작성 유도), ?ad=recap (12월 연말 결산), ?ad=ticket (방켓팅)
// ?page=1/4 를 붙이면 오른쪽 위가 "1 / 4" 로 바뀐다(여러 카드를 한 캐러셀로 묶을 때)
// 디자인 D: 종이 바탕 · 먹색 글자 · 주황 포인트 하나 + 스티커·붓글씨·탈출귀(유쾌한 느낌).
// 카드 속 기록·숫자·이름은 꾸며 낸 보기라서 반드시 '예시' 표시를 붙인다.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOTAL = 6;
const EXAMPLE_NOTE = "카드 속 기록은 예시예요";
const CTA = "먼저 써 보고 10초 가입";

// 예시 묶음 오른쪽 위에 붙는 '예시' 스티커
const ExampleTag = ({ right = -8, top = -26 }: { right?: number; top?: number }) => (
  <Sticker tone="w" rotate={7} size={24} style={{ position: "absolute", right, top }}>
    예시
  </Sticker>
);

// 아래쪽 한마디(붓글씨) + 탈출귀
function Bottom({ origin, hand, say }: { origin: string; hand: string; say?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "flex-end" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22 }}>
        <Hand size={62} rotate={-5} style={{ marginBottom: say ? 50 : 36, marginLeft: 6 }}>
          {hand}
        </Hand>
        <Ghost origin={origin} say={say} size={say ? 170 : 140} />
      </div>
    </div>
  );
}

type Row = { no: string; day: string; name: string; genre: string; meta: string; result: string; hl?: boolean };

// 다이어리 한 줄(예시): 장르 색 표지 + 이름 + 장르·지역·인원 + 결과
function DiaryRow({ no, day, name, genre, meta, result, hl }: Row) {
  return (
    <Sheet
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: "20px 30px 20px 22px",
        border: `${hl ? 3 : 2}px solid ${hl ? ED.accent : ED.faint}`,
        transform: `rotate(${hl ? -1.2 : 0}deg)`,
      }}
    >
      <Cover genre={genre} title="" width={76} style={{ boxShadow: "0 6px 12px rgba(60,45,20,0.18)" }} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, marginLeft: 26 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 24, fontWeight: 800, color: hl ? ED.accent : ED.mute, marginRight: 14 }}>{no}</div>
          <div style={{ display: "flex", fontSize: 24, fontWeight: 500, color: ED.mute }}>{day}</div>
        </div>
        <div style={{ display: "flex", marginTop: 4, fontSize: 38, fontWeight: 800 }}>{name}</div>
        <div style={{ display: "flex", marginTop: 4, fontSize: 26, fontWeight: 500, color: ED.dim }}>{`${genre} · ${meta}`}</div>
      </div>
      <div style={{ display: "flex", padding: "8px 18px", borderRadius: 999, border: `2px solid ${ED.ink}`, fontSize: 24, fontWeight: 800 }}>{result}</div>
    </Sheet>
  );
}

function DiaryRows({ rows }: { rows: Row[] }) {
  return (
    <div style={{ display: "flex", position: "relative", flexDirection: "column", marginTop: 54 }}>
      {rows.map((r, i) => (
        <div key={r.name} style={{ display: "flex", flexDirection: "column", marginTop: i ? 20 : 0 }}>
          <DiaryRow {...r} />
        </div>
      ))}
      <ExampleTag />
    </div>
  );
}

// 결산 숫자 4칸(예시)
function RecapGrid() {
  const cells: [string, string, string][] = [
    ["올해 플레이", "47", "방"],
    ["탈출 성공률", "74", "%"],
    ["노힌트 탈출", "16", "번"],
    ["원정 지역", "3", "곳"],
  ];
  return (
    <div style={{ display: "flex", position: "relative", flexWrap: "wrap", justifyContent: "space-between", marginTop: 54 }}>
      {cells.map(([k, v, unit], i) => (
        <Sheet key={k} style={{ width: 456, marginBottom: 24, padding: "24px 34px", transform: `rotate(${[-1.5, 1, 0.8, -1][i]}deg)` }}>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 800, color: ED.mute }}>{k}</div>
          <div style={{ display: "flex", alignItems: "baseline", marginTop: 2 }}>
            <div style={{ display: "flex", fontSize: 88, fontWeight: 800, letterSpacing: "-0.03em", color: i === 0 ? ED.accent : ED.ink }}>{v}</div>
            <div style={{ display: "flex", marginLeft: 6, fontSize: 44, fontWeight: 800 }}>{unit}</div>
          </div>
        </Sheet>
      ))}
      <ExampleTag />
    </div>
  );
}

const Bullets = ({ items }: { items: string[] }) => (
  <div style={{ display: "flex", flexDirection: "column", marginTop: 50 }}>
    {items.map((x, i) => (
      <div key={x} style={{ display: "flex", alignItems: "center", padding: "24px 0", borderTop: i ? `2px solid ${ED.faint}` : "none", fontSize: 40, fontWeight: 800 }}>
        <div style={{ display: "flex", width: 16, height: 16, borderRadius: 8, backgroundColor: ED.accent, marginRight: 22 }} />
        {x}
      </div>
    ))}
  </div>
);

function slide(n: number, origin: string, page?: string): ReactElement {
  const label = page ?? `${n} / ${TOTAL}`;
  switch (n) {
    case 1:
      return (
        <Paper label={label} footLeft={<FootPill>넘겨 봐요</FootPill>}>
          <Headline size={132} top={110}>
            <Line>방탈출,</Line>
            <Line>기록하고</Line>
            <Line>
              <Em>있어요?</Em>
            </Line>
          </Headline>
          <Wig width={400} top={12} />
          <Sub top={44} size={36}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex" }}>다녀온 방은 다이어리로,</div>
              <div style={{ display: "flex", color: ED.ink, fontWeight: 800 }}>다음 방은 내 취향으로 고르는 곳.</div>
            </div>
          </Sub>
          <Bottom origin={origin} hand="그 방 이름이 뭐였더라?" say="내가 기억해 줄게!" />
        </Paper>
      );
    case 2:
      return (
        <Paper label={label} footLeft={<FootNote>{EXAMPLE_NOTE}</FootNote>}>
          <Headline size={90}>
            <Line>몇 번째 방이었는지</Line>
            <Line>
              <Em>기억나요?</Em>
            </Line>
          </Headline>
          <Wig width={360} />
          <Sub>남기면 순서대로 번호가 붙어요. 50번째, 100번째 방은 따로 축하해요.</Sub>
          <DiaryRows
            rows={[
              { no: "50번째 방", day: "22일", name: "어느 폐가의 기록", genre: "공포", meta: "강남 · 3명", result: "탈출 8분 남김", hl: true },
              { no: "49번째", day: "15일", name: "은하수 배달부", genre: "SF", meta: "홍대 · 2명", result: "노힌트" },
              { no: "48번째", day: "8일", name: "고양이 탐정 사무소", genre: "추리", meta: "서면 · 4명", result: "실패" },
            ]}
          />
          <Bottom origin={origin} hand="50번째 방, 축하 쾅!" />
        </Paper>
      );
    case 3:
      return (
        <Paper label={label} footLeft={<FootNote>{EXAMPLE_NOTE}</FootNote>}>
          <Headline size={96}>
            <Line>연말엔,</Line>
            <Line>
              <Em>나만의 결산</Em>
            </Line>
          </Headline>
          <Wig width={440} />
          <Sub>그 해 기록으로 자동으로 정리돼요. 친구들한테 자랑은 버튼 하나.</Sub>
          <RecapGrid />
          <Bottom origin={origin} hand="올해 나, 꽤 열심히 했네?" />
        </Paper>
      );
    case 4:
      return (
        <Paper label={label} footLeft={<FootNote>유형 이름은 예시예요</FootNote>}>
          <Headline size={96}>
            <Line>인기순 말고,</Line>
            <Line>
              <Em>내 취향순</Em>
            </Line>
          </Headline>
          <Wig width={380} />
          <Sub>질문 몇 개면 16가지 유형 중 내 유형이 나오고, 딱 맞는 방을 골라 줘요.</Sub>
          <div style={{ display: "flex", position: "relative", flexDirection: "column", marginTop: 64 }}>
            <Sheet style={{ padding: "44px 46px", transform: "rotate(-1.5deg)" }}>
              <div style={{ display: "flex", fontSize: 28, fontWeight: 800, color: ED.accent }}>나의 방탈출 유형</div>
              <div style={{ display: "flex", marginTop: 10, fontSize: 80, fontWeight: 800, letterSpacing: "-0.04em" }}>과몰입 주인공</div>
              <div style={{ display: "flex", marginTop: 14, fontSize: 32, fontWeight: 500, lineHeight: 1.5, color: ED.dim, wordBreak: "keep-all" }}>
                방에 들어가면 그 사람이 돼요. 엔딩에서 제일 오래 서 있는 타입.
              </div>
            </Sheet>
            <ExampleTag right={10} top={-30} />
          </div>
          <Bottom origin={origin} hand="나는 무슨 유형일까?" say="질문 몇 개면 끝!" />
        </Paper>
      );
    case 5:
      return (
        <Paper label={label} footLeft={<FootNote>이름·숫자는 예시예요</FootNote>}>
          <Headline size={96}>
            <Line>겁 많은 친구도</Line>
            <Line>
              <Em>다 같이</Em>
            </Line>
          </Headline>
          <Wig width={290} />
          <Sub>우리 팀 궁합을 보고, 제일 겁 많은 친구도 들어갈 수 있는 방만 골라요.</Sub>
          <div style={{ display: "flex", position: "relative", flexDirection: "column", marginTop: 56 }}>
            <Sheet style={{ padding: "8px 34px" }}>
              {[
                ["민지", "공포 4 · 난이도 4"],
                ["준호", "공포 5 · 난이도 3"],
                ["서연", "공포 2 · 난이도 2"],
              ].map(([who, t], i) => (
                <div key={who} style={{ display: "flex", justifyContent: "space-between", padding: "24px 0", borderTop: i ? `2px solid ${ED.faint}` : "none", fontSize: 34, fontWeight: 800 }}>
                  <div style={{ display: "flex" }}>{who}</div>
                  <div style={{ display: "flex", color: ED.dim, fontWeight: 500 }}>{t}</div>
                </div>
              ))}
            </Sheet>
            <div style={{ display: "flex", marginTop: 28 }}>
              <Sticker tone="o" rotate={-2} size={32}>
                공포 2까지 · 난이도 3 근처 · 3명 가능한 방
              </Sticker>
            </div>
            <ExampleTag />
          </div>
          <Bottom origin={origin} hand="서연이도 들어갈 수 있어!" />
        </Paper>
      );
    default:
      return (
        <Paper label={label} footLeft={<FootPill>{CTA}</FootPill>}>
          <Headline size={104} top={90}>
            <Line>지난 주말 간 방,</Line>
            <Line>
              <Em>기억날 때</Em>
              <div style={{ display: "flex", marginLeft: 26 }}>남겨요</div>
            </Line>
          </Headline>
          <Wig width={420} />
          <Bullets items={["먼저 써 보고, 10초면 가입", "스포는 나만 보는 메모로 따로", "매일 오늘의 미스터리 방"]} />
          <Bottom origin={origin} hand="프로필 링크에서 만나요!" say="기다릴게!" />
        </Paper>
      );
  }
}

// 한 장짜리 광고 카드
function ad(kind: string, origin: string, page?: string): ReactElement {
  if (kind === "ticket") {
    // 예매 티켓(예시): 왼쪽 본권 + 점선 + 오른쪽 떼는 부분. 점선 위아래에 반원 홈.
    const notch = (top: boolean) => (
      <div
        style={{
          position: "absolute",
          left: 640 - 22,
          [top ? "top" : "bottom"]: -24,
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: ED.bg,
          border: `2px solid ${ED.faint}`,
          display: "flex",
        }}
      />
    );
    return (
      <Paper label={page} footLeft={<FootPill>{page ? "넘겨 봐요" : CTA}</FootPill>}>
        <Headline size={86}>
          <Line>방켓팅까지 해서 간 방,</Line>
          <Line>
            <Em>1년 뒤에도</Em>
            <div style={{ display: "flex", marginLeft: 22 }}>기억나요?</div>
          </Line>
        </Headline>
        <Wig width={400} />
        <Sub>예약 전쟁 뚫고 간 방, 30초만 남겨 두면 언제든 꺼내 볼 수 있어요.</Sub>

        <div style={{ display: "flex", position: "relative", marginTop: 70 }}>
          <div
            style={{
              position: "relative",
              display: "flex",
              width: 936,
              height: 300,
              borderRadius: 28,
              border: `2px solid ${ED.faint}`,
              backgroundColor: ED.white,
              boxShadow: "0 14px 28px rgba(60,45,20,0.12)",
              transform: "rotate(-2.5deg)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", width: 640, padding: "34px 40px" }}>
              <div style={{ display: "flex", fontSize: 26, fontWeight: 800, color: ED.accent }}>방탈출 입장권</div>
              <div style={{ display: "flex", alignItems: "center", marginTop: 18 }}>
                <div style={{ display: "flex", width: 300, height: 52, borderRadius: 8, backgroundColor: ED.ink }} />
                <div style={{ display: "flex", marginLeft: 18, fontSize: 36, fontWeight: 800 }}>방</div>
              </div>
              <div style={{ display: "flex", marginTop: 34 }}>
                {[
                  ["날짜", "11.14 (토)"],
                  ["시간", "19:30"],
                  ["인원", "4명"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", flexDirection: "column", marginRight: 44 }}>
                    <div style={{ display: "flex", fontSize: 22, fontWeight: 800, color: ED.mute }}>{k}</div>
                    <div style={{ display: "flex", marginTop: 6, fontSize: 34, fontWeight: 800 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, borderLeft: `4px dashed ${ED.faint}` }}>
              <div style={{ display: "flex", fontSize: 24, fontWeight: 800, color: ED.mute }}>내 기록</div>
              <div style={{ display: "flex", alignItems: "baseline" }}>
                <div style={{ display: "flex", fontSize: 96, fontWeight: 800, letterSpacing: "-0.04em", color: ED.accent }}>50</div>
                <div style={{ display: "flex", marginLeft: 4, fontSize: 34, fontWeight: 800 }}>번째</div>
              </div>
            </div>
            {notch(true)}
            {notch(false)}
          </div>
          <ExampleTag right={-6} top={-34} />
        </div>

        <div style={{ display: "flex", marginTop: 64, fontSize: 42, fontWeight: 800 }}>티켓은 사라져도, 기록은 남아요.</div>
        <Bottom origin={origin} hand="그 방 이름이 뭐였더라?" say="내가 기억해 줄게!" />
      </Paper>
    );
  }
  if (kind === "recap") {
    return (
      <Paper label={page} footLeft={<FootNote>{`${EXAMPLE_NOTE} · 시작은 프로필 링크에서`}</FootNote>}>
        <Headline size={112} top={44}>
          <Line>올해,</Line>
          <Line>
            <Em>몇 방</Em>
            <div style={{ display: "flex", marginLeft: 28 }}>했어요?</div>
          </Line>
        </Headline>
        <Wig width={260} />
        <Sub>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex" }}>기록만 해 두면 연말 결산이 자동으로 나와요.</div>
            <div style={{ display: "flex" }}>친구들한테 자랑은 버튼 하나.</div>
          </div>
        </Sub>
        <RecapGrid />
        <Bottom origin={origin} hand="지금부터 써도 안 늦었어요!" />
      </Paper>
    );
  }
  // diary: 다이어리 작성 유도
  return (
    <Paper label={page} footLeft={<FootNote>{`${EXAMPLE_NOTE} · 시작은 프로필 링크에서`}</FootNote>}>
      <Headline size={96}>
        <Line>지난주에 간 방,</Line>
        <Line>
          <Em>벌써 헷갈려요?</Em>
        </Line>
      </Headline>
      <Wig width={560} />
      <Sub>다녀온 방을 남기면 몇 번째 방인지, 올해 결산까지 알아서 정리돼요.</Sub>
      <DiaryRows
        rows={[
          { no: "50번째 방", day: "11.16", name: "어느 폐가의 기록", genre: "공포", meta: "강남 · 3명", result: "탈출 8분 남김", hl: true },
          { no: "49번째", day: "11.09", name: "은하수 배달부", genre: "SF", meta: "홍대 · 2명", result: "노힌트" },
          { no: "48번째", day: "11.02", name: "고양이 탐정 사무소", genre: "추리", meta: "서면 · 4명", result: "탈출" },
        ]}
      />
      <Bottom origin={origin} hand="먼저 써 보고 10초 가입!" />
    </Paper>
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const adKind = url.searchParams.get("ad");
  // ?page=1/4 → 오른쪽 위를 "1 / 4" 로(여러 카드를 한 캐러셀로 묶을 때 쪽수 통일)
  const pm = (url.searchParams.get("page") ?? "").match(/^(\d+)\/(\d+)$/);
  const page = pm ? `${Number(pm[1])} / ${Number(pm[2])}` : undefined;
  if (adKind) return jpegResponse(ad(adKind, url.origin, page), 86400);
  const n = Math.min(TOTAL, Math.max(1, Number(url.searchParams.get("n")) || 1));
  return jpegResponse(slide(n, url.origin, page), 86400);
}
