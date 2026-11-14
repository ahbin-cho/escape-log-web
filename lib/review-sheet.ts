// 리뷰 시트(1080×1350): 방탈러들이 인스타에 올리는 '방탈출 리뷰' 양식 한 장을 브라우저에서 그린다.
// 표지(내가 올린 사진 → 공식 포스터 → 장르 색 표지) · 테마/매장/날짜 · 탈출 결과 · 플레이 정보 · 체감 난이도 · 공포도 · 평점 · 한줄 후기.
// 공식 포스터는 자르지 않고 그대로 넣고 아래에 출처를 적는다.
import { wrapText } from "./review-image";
import { RATING_LABELS, RATING_EMOJI } from "./terms";

export type ReviewSheetInput = {
  themeName: string;
  cafeName?: string;
  genre: string;
  playedAt?: string;
  oneLiner?: string;
  success: boolean;
  remainingTime?: string;
  hintCount: number; // -1 = 무제한
  partySize?: number;
  difficulty: number; // 1~5
  fearLevel: number; // 0~5
  rating: number; // 1~5
  nth?: number; // N번째 방
  posterUrl?: string; // 같은 주소에서 받을 수 있는 포스터(/api/poster-img?id=…)
  posterCredit?: string; // 예: "상상의문"
  photoUrl?: string;
  tone: { bg: string; accent: string };
};

const W = 1080, H = 1350;
const INK = "#1D1D1D", CREAM = "#F5F0E6", PAPER = "#FFFBF2", ORANGE = "#E49A4A", MUTE = "#8A8478";

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function makeReviewSheet(r: ReviewSheetInput): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext("2d")!;
  try {
    await Promise.all([document.fonts.load('64px "SBAggroB"'), document.fonts.load('800 32px "Pretendard"'), document.fonts.load('500 32px "Pretendard"')]);
  } catch {
    // 글꼴을 못 불러와도 기본 글꼴로 그린다
  }
  const TITLE = '"SBAggroB", "Pretendard", sans-serif';
  const BODY = '"Pretendard", system-ui, sans-serif';
  c.textBaseline = "alphabetic";

  const box = (x: number, y: number, w: number, h: number, fill = PAPER, shadow = INK, rad = 22) => {
    c.fillStyle = shadow;
    c.beginPath(); c.roundRect(x + 7, y + 8, w, h, rad); c.fill();
    c.fillStyle = fill;
    c.beginPath(); c.roundRect(x, y, w, h, rad); c.fill();
    c.lineWidth = 4; c.strokeStyle = INK; c.stroke();
  };
  const label = (text: string, cx: number, y: number) => {
    c.font = `28px ${TITLE}`;
    const w = c.measureText(text).width + 44;
    c.fillStyle = INK;
    c.beginPath(); c.roundRect(cx - w / 2, y - 24, w, 48, 24); c.fill();
    c.fillStyle = PAPER;
    c.fillText(text, cx - w / 2 + 22, y + 10);
  };
  const fit = (text: string, maxW: number, font: (px: number) => string, from: number, min: number) => {
    let px = from;
    for (; px > min; px -= 2) { c.font = font(px); if (c.measureText(text).width <= maxW) break; }
    c.font = font(px);
  };

  // 바탕(크림 + 점무늬)
  c.fillStyle = CREAM; c.fillRect(0, 0, W, H);
  c.fillStyle = "rgba(29,29,29,0.05)";
  for (let y = 14; y < H; y += 28) for (let x = 14; x < W; x += 28) { c.beginPath(); c.arc(x, y, 2, 0, 7); c.fill(); }

  // 머리: 로고 · N번째 방
  c.fillStyle = INK; c.font = `36px ${TITLE}`; c.fillText("방탈로그", 56, 88);
  if (r.nth) {
    const t = `${r.nth}번째 방`;
    c.font = `800 28px ${BODY}`;
    const w = c.measureText(t).width + 40;
    c.fillStyle = ORANGE; c.beginPath(); c.roundRect(W - 56 - w, 50, w, 52, 26); c.fill();
    c.lineWidth = 4; c.strokeStyle = INK; c.stroke();
    c.fillStyle = INK; c.fillText(t, W - 56 - w + 20, 86);
  }

  // 포스터(왼쪽): 자르지 않고 칸 안에 맞춘다
  const PX = 56, PY = 130, PW = 400, PH = 540;
  box(PX, PY, PW, PH, r.tone.bg);
  // 내가 올린 사진 → 공식 포스터 → 장르 색 표지
  const photo = r.photoUrl ? await loadImage(r.photoUrl) : null;
  const poster = !photo && r.posterUrl ? await loadImage(r.posterUrl) : null;
  const img = poster ?? photo;
  c.save();
  c.beginPath(); c.roundRect(PX + 2, PY + 2, PW - 4, PH - 4, 20); c.clip();
  if (img) {
    const s = poster ? Math.min(PW / img.width, PH / img.height) : Math.max(PW / img.width, PH / img.height);
    const w = img.width * s, h = img.height * s;
    c.fillStyle = "#141414"; c.fillRect(PX, PY, PW, PH);
    c.drawImage(img, PX + (PW - w) / 2, PY + (PH - h) / 2, w, h);
  } else {
    const g = c.createLinearGradient(PX, PY, PX + PW, PY + PH);
    g.addColorStop(0, `${r.tone.accent}66`); g.addColorStop(1, "transparent");
    c.fillStyle = g; c.fillRect(PX, PY, PW, PH);
    c.strokeStyle = "rgba(245,240,230,.3)"; c.lineWidth = 3;
    c.beginPath(); c.roundRect(PX + 22, PY + 22, PW - 44, PH - 44, 12); c.stroke();
    c.fillStyle = r.tone.accent; c.font = `800 30px ${BODY}`;
    c.fillText(r.genre, PX + (PW - c.measureText(r.genre).width) / 2, PY + 90);
    c.fillStyle = "#F5F0E6"; c.font = `44px ${TITLE}`;
    const lines = wrapText((s) => c.measureText(s).width, r.themeName, PW - 90, 4);
    lines.forEach((l, i) => c.fillText(l, PX + (PW - c.measureText(l).width) / 2, PY + PH / 2 + 20 + (i - (lines.length - 1) / 2) * 58));
  }
  c.restore();

  // 제목 + 기본 정보(오른쪽)
  const RX = 492, RW = W - 56 - RX;
  c.fillStyle = INK; c.font = `76px ${TITLE}`; c.fillText("방탈출", RX, 212);
  c.fillStyle = ORANGE; c.fillText("리뷰", RX + c.measureText("방탈출 ").width, 212);
  c.fillStyle = MUTE; c.font = `800 24px ${BODY}`; c.fillText("ESCAPE REVIEW · 스포 없이", RX + 4, 252);
  box(RX, 284, RW, 386);
  const rows: [string, string][] = [
    ["테마", r.themeName || "(제목 없음)"],
    ["매장", r.cafeName || "-"],
    ["날짜", r.playedAt ? r.playedAt.replaceAll("-", ".") : "-"],
    ["장르", r.genre],
  ];
  rows.forEach(([k, v], i) => {
    const y = 284 + 40 + i * 88;
    c.fillStyle = ORANGE; c.beginPath(); c.roundRect(RX + 22, y, 92, 50, 12); c.fill();
    c.lineWidth = 3; c.strokeStyle = INK; c.stroke();
    c.fillStyle = INK; c.font = `800 26px ${BODY}`; c.fillText(k, RX + 22 + (92 - c.measureText(k).width) / 2, y + 35);
    if (i === 0) {
      c.font = `34px ${TITLE}`;
      const ls = wrapText((s) => c.measureText(s).width, v, RW - 150, 2);
      if (ls.length === 1) c.fillText(ls[0], RX + 130, y + 37);
      else { c.font = `27px ${TITLE}`; const l2 = wrapText((s) => c.measureText(s).width, v, RW - 150, 2); l2.forEach((l, j) => c.fillText(l, RX + 130, y + 22 + j * 32)); }
    } else {
      fit(v, RW - 150, (px) => `800 ${px}px ${BODY}`, 32, 20);
      c.fillText(v, RX + 130, y + 36);
    }
    if (i < rows.length - 1) { c.strokeStyle = "#E2D8C6"; c.lineWidth = 2; c.beginPath(); c.moveTo(RX + 22, y + 69); c.lineTo(RX + RW - 22, y + 69); c.stroke(); }
  });

  // 가운데 줄: 탈출 결과 · 플레이 정보 · 난이도/공포도
  const MY = 730, MH = 236, GW = (W - 112 - 40) / 3;
  const mx = (i: number) => 56 + i * (GW + 20);
  for (let i = 0; i < 3; i++) box(mx(i), MY, GW, MH);
  label("탈출 결과", mx(0) + GW / 2, MY);
  ([["성공", true], ["실패", false]] as const).forEach(([t, v], i) => {
    const y = MY + 58 + i * 82, on = r.success === v;
    if (on) { c.fillStyle = v ? "#FFE3C2" : "#E6E0D6"; c.beginPath(); c.roundRect(mx(0) + 20, y, GW - 40, 64, 16); c.fill(); c.lineWidth = 3; c.strokeStyle = INK; c.stroke(); }
    c.lineWidth = 4; c.strokeStyle = INK; c.fillStyle = on ? (v ? ORANGE : INK) : PAPER;
    c.beginPath(); c.arc(mx(0) + 58, y + 32, 15, 0, 7); c.fill(); c.stroke();
    c.fillStyle = on ? INK : MUTE; c.font = `${on ? 38 : 32}px ${TITLE}`; c.fillText(t, mx(0) + 92, y + 45);
  });
  label("플레이 정보", mx(1) + GW / 2, MY);
  const info: [string, string][] = [
    ["인원", r.partySize && r.partySize > 0 ? `${r.partySize}명` : "-"],
    ["남은 시간", r.success ? r.remainingTime || "-" : "-"],
    ["힌트", r.hintCount < 0 ? "무제한" : r.hintCount === 0 ? "노힌트" : `${r.hintCount}개`],
  ];
  info.forEach(([k, v], i) => {
    const y = MY + 82 + i * 56;
    c.fillStyle = MUTE; c.font = `800 24px ${BODY}`; c.fillText(k, mx(1) + 24, y);
    c.fillStyle = INK; fit(v, GW - 160, (px) => `800 ${px}px ${BODY}`, 30, 20);
    c.fillText(v, mx(1) + GW - 24 - c.measureText(v).width, y);
    if (i < 2) { c.strokeStyle = "#E2D8C6"; c.lineWidth = 2; c.beginPath(); c.moveTo(mx(1) + 24, y + 18); c.lineTo(mx(1) + GW - 24, y + 18); c.stroke(); }
  });
  label("체감 난이도", mx(2) + GW / 2, MY);
  const marks = (ch: string, n: number, y: number, on: string) => {
    c.font = `46px ${BODY}`;
    const step = (GW - 48) / 5;
    for (let i = 0; i < 5; i++) { c.fillStyle = i < n ? on : "#DDD3C2"; c.fillText(ch, mx(2) + 24 + i * step + (step - c.measureText(ch).width) / 2, y); }
  };
  marks("★", Math.round(r.difficulty), MY + 92, ORANGE);
  c.fillStyle = MUTE; c.font = `800 22px ${BODY}`;
  const fl = "공포도"; c.fillText(fl, mx(2) + (GW - c.measureText(fl).width) / 2, MY + 138);
  marks("♥", Math.round(r.fearLevel), MY + 196, "#D9534F");

  // 아래 줄: 평점 · 한줄 후기
  const BY = 1012, BH = 252, LW = 372;
  box(56, BY, LW, BH); label("평점", 56 + LW / 2, BY);
  const rating = Math.min(5, Math.max(1, Math.round(r.rating)));
  [5, 4, 3, 2, 1].forEach((v, i) => {
    const y = BY + 40 + i * 41, on = v === rating;
    if (on) { c.fillStyle = "#FFE3C2"; c.beginPath(); c.roundRect(56 + 16, y - 4, LW - 32, 42, 12); c.fill(); c.lineWidth = 3; c.strokeStyle = INK; c.stroke(); }
    c.lineWidth = 3; c.strokeStyle = INK; c.fillStyle = on ? ORANGE : PAPER;
    c.beginPath(); c.arc(56 + 46, y + 17, 11, 0, 7); c.fill(); c.stroke();
    c.font = `26px ${BODY}`; c.fillStyle = INK; c.fillText(RATING_EMOJI[v - 1], 56 + 72, y + 27);
    c.fillStyle = on ? INK : MUTE; c.font = on ? `30px ${TITLE}` : `800 25px ${BODY}`;
    c.fillText(RATING_LABELS[v - 1], 56 + 116, y + 28);
  });
  const OX = 56 + LW + 20, OW = W - 56 - OX;
  box(OX, BY, OW, BH); label("한줄 후기", OX + OW / 2, BY);
  const text = r.oneLiner?.trim() || "기억에 남는 방!";
  let px = 54, lines: string[] = [];
  for (; px >= 30; px -= 4) {
    c.font = `${px}px ${TITLE}`;
    lines = wrapText((s) => c.measureText(s).width, text, OW - 64, 4);
    if (lines.length * (px + 14) <= BH - 70 && !lines[lines.length - 1].endsWith("…")) break;
  }
  c.fillStyle = INK;
  lines.forEach((l, i) => c.fillText(l, OX + (OW - c.measureText(l).width) / 2, BY + BH / 2 + 26 + (i - (lines.length - 1) / 2) * (px + 14)));

  // 바닥
  c.fillStyle = INK; c.font = `800 26px ${BODY}`; c.fillText("bangtallog.com", 56, H - 34);
  if (poster && r.posterCredit) {
    const t = `포스터: ${r.posterCredit} 공식`;
    c.fillStyle = MUTE; c.font = `500 22px ${BODY}`; c.fillText(t, W - 56 - c.measureText(t).width, H - 34);
  }

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("이미지를 만들지 못했어요"))), "image/jpeg", 0.92)
  );
}
