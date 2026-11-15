// 기록 인증샷 여러 장(최대 MAX_PHOTOS). 저장 공간(Supabase 무료 1GB)을 아끼려고
//  ① 올리기 전에 브라우저에서 줄이고(긴 변 1600px, WebP/JPEG) ② 뺀 사진·지운 기록의 사진 파일은 지운다.
// 대표 사진 = 첫 장 = records.photo_url (피드·달력·서재·공유 카드는 이것만 본다).

export const MAX_PHOTOS = 4;
export const MAX_SIDE = 1600;
const QUALITY = 0.8;

/** 긴 변을 max 이하로 줄인 크기(키우지는 않는다) */
export function fitSize(w: number, h: number, max = MAX_SIDE): { w: number; h: number } {
  const k = Math.min(1, max / Math.max(w, h, 1));
  return { w: Math.max(1, Math.round(w * k)), h: Math.max(1, Math.round(h * k)) };
}

/** DB 두 칸(photo_url, photo_urls) → 사진 목록. 대표가 맨 앞, 중복·빈칸 제거, 최대 장수까지 */
export function normalizePhotos(cover: string | null | undefined, list: string[] | null | undefined): string[] {
  const out: string[] = [];
  for (const u of [cover ?? "", ...(list ?? [])]) {
    const s = (u ?? "").trim();
    if (s && !out.includes(s)) out.push(s);
  }
  return out.slice(0, MAX_PHOTOS);
}

/** 공개 주소 → Storage 안 경로(photos 버킷만). 우리 버킷 주소가 아니면 null */
export function storagePath(url: string): string | null {
  const m = url.match(/\/storage\/v1\/object\/public\/photos\/(.+)$/);
  return m ? decodeURIComponent(m[1].split("?")[0]) : null;
}

/** 브라우저에서 사진 줄이기. 못 읽는 형식이면 원본 그대로(올릴 때 버킷이 형식을 막는다) */
export async function compressImage(file: File): Promise<{ blob: Blob; ext: string }> {
  const origExt = (file.name.split(".").pop() || "jpg").toLowerCase();
  if (!file.type.startsWith("image/") || file.type === "image/gif") return { blob: file, ext: origExt };
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const { w, h } = fitSize(bmp.width, bmp.height);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { blob: file, ext: origExt };
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close?.();
    const toBlob = (type: string) => new Promise<Blob | null>((res) => canvas.toBlob(res, type, QUALITY));
    // WebP 가 더 작다. 못 만드는 브라우저(옛 사파리)는 PNG 로 돌려주니 그땐 JPEG
    let blob = await toBlob("image/webp");
    let ext = "webp";
    if (!blob || blob.type !== "image/webp") {
      blob = await toBlob("image/jpeg");
      ext = "jpg";
    }
    if (!blob) return { blob: file, ext: origExt };
    return blob.size < file.size ? { blob, ext } : { blob: file, ext: origExt };
  } catch {
    return { blob: file, ext: origExt };
  }
}
