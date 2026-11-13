// 후기 카드 이미지(1080×1350)를 브라우저에서 그린다: 사진을 살짝 어둡게 깔고 그 위에 한줄 후기와 기록을 얹는다.
// 사진이 없거나 못 불러오면 장르 색 바탕으로 그린다. 인스타 피드·스토리에 올리기 좋은 4:5.

export type ReviewImageInput = {
  themeName: string;
  cafeName?: string;
  genre: string;
  playedAt?: string;
  oneLiner?: string;
  photoUrl?: string;
  chips: string[]; // 예: ["탈출 성공", "8분 남김", "노힌트", "꽃밭길"]
  byline?: string; // 예: "— 닉네임" 또는 "47번째 방"
  tone: { bg: string; accent: string };
};

const W = 1080;
const H = 1350;
const PAD = 84;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// 글자 단위로 줄바꿈(한글은 띄어쓰기 없이도 끊긴다). 띄어쓰기 자리에서 끊을 수 있으면 거기서 끊는다.
export function wrapText(measure: (s: string) => number, text: string, maxWidth: number, maxLines: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const ch of text.replace(/\s+/g, " ").trim()) {
    if (measure(line + ch) <= maxWidth) {
      line += ch;
      continue;
    }
    const sp = line.lastIndexOf(" ");
    if (ch !== " " && sp > line.length * 0.5) {
      lines.push(line.slice(0, sp));
      line = line.slice(sp + 1) + ch;
    } else {
      lines.push(line.trimEnd());
      line = ch === " " ? "" : ch;
    }
    if (lines.length === maxLines) break;
  }
  if (lines.length < maxLines && line) lines.push(line);
  else if (lines.length === maxLines && line) lines[maxLines - 1] = `${lines[maxLines - 1].slice(0, -1)}…`;
  return lines;
}

export async function makeReviewImage(r: ReviewImageInput): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext("2d")!;
  try {
    await Promise.all([document.fonts.load('64px "SBAggroB"'), document.fonts.load('800 32px "Pretendard"')]);
  } catch {
    // 글꼴을 못 불러와도 기본 글꼴로 그린다
  }
  const TITLE = '"SBAggroB", "Pretendard", sans-serif';
  const BODY = '"Pretendard", system-ui, sans-serif';

  // 바탕: 장르 색
  c.fillStyle = r.tone.bg;
  c.fillRect(0, 0, W, H);

  const img = r.photoUrl ? await loadImage(r.photoUrl) : null;
  if (img) {
    const s = Math.max(W / img.width, H / img.height);
    const w = img.width * s;
    const h = img.height * s;
    c.globalAlpha = 0.72; // 사진을 살짝 눌러 글자가 읽히게
    c.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
    c.globalAlpha = 1;
  } else {
    const g = c.createLinearGradient(0, 0, W, H * 0.7);
    g.addColorStop(0, `${r.tone.accent}55`);
    g.addColorStop(1, "transparent");
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
  }
  const shade = c.createLinearGradient(0, 0, 0, H);
  shade.addColorStop(0, "rgba(0,0,0,0.38)");
  shade.addColorStop(0.35, "rgba(0,0,0,0.12)");
  shade.addColorStop(1, "rgba(0,0,0,0.82)");
  c.fillStyle = shade;
  c.fillRect(0, 0, W, H);

  c.textBaseline = "alphabetic";
  // 위: 브랜드 · 날짜
  c.fillStyle = "#FFFFFF";
  c.font = `34px ${TITLE}`;
  c.fillText("방탈로그", PAD, 118);
  c.font = `800 28px ${BODY}`;
  c.fillStyle = "rgba(255,255,255,0.8)";
  const top = [r.genre, r.playedAt?.replaceAll("-", ".")].filter(Boolean).join(" · ");
  c.fillText(top, W - PAD - c.measureText(top).width, 116);

  // 아래에서부터 쌓는다
  let y = H - 92;
  c.font = `800 26px ${BODY}`;
  c.fillStyle = "rgba(255,255,255,0.6)";
  c.fillText("bangtallog.com", PAD, y);
  if (r.byline) c.fillText(r.byline, W - PAD - c.measureText(r.byline).width, y);
  y -= 64;

  // 칩
  c.font = `800 28px ${BODY}`;
  let x = PAD;
  const chipH = 52;
  for (const [i, chip] of r.chips.entries()) {
    const w = c.measureText(chip).width + 40;
    if (x + w > W - PAD) break;
    c.fillStyle = i === 0 ? r.tone.accent : "rgba(255,255,255,0.18)";
    c.beginPath();
    c.roundRect(x, y - chipH + 12, w, chipH, 26);
    c.fill();
    c.fillStyle = i === 0 ? "#1D1D1D" : "#FFFFFF";
    c.fillText(chip, x + 20, y);
    x += w + 12;
  }
  y -= chipH + 34;

  // 매장 · 테마
  if (r.cafeName) {
    c.font = `500 30px ${BODY}`;
    c.fillStyle = "rgba(255,255,255,0.75)";
    c.fillText(r.cafeName, PAD, y);
    y -= 50;
  }
  c.font = `54px ${TITLE}`;
  c.fillStyle = "#FFFFFF";
  const nameLines = wrapText((s) => c.measureText(s).width, r.themeName, W - PAD * 2, 2);
  for (const l of [...nameLines].reverse()) {
    c.fillText(l, PAD, y);
    y -= 68;
  }
  y -= 6;
  c.fillStyle = r.tone.accent;
  c.fillRect(PAD, y - 6, 72, 6);
  y -= 50;

  // 한줄 후기(가장 크게)
  if (r.oneLiner?.trim()) {
    c.font = `800 62px ${BODY}`;
    c.fillStyle = "#FFFFFF";
    const lines = wrapText((s) => c.measureText(s).width, `“${r.oneLiner.trim()}”`, W - PAD * 2, 5);
    for (const l of [...lines].reverse()) {
      c.fillText(l, PAD, y);
      y -= 84;
    }
  }

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("이미지를 만들지 못했어요"))), "image/jpeg", 0.92)
  );
}
