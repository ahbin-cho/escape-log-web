// ─────────────────────────────────────────────────────────────
// IndexNow: 새로 생긴 페이지를 검색엔진(Bing·네이버 등)에 바로 알린다.
// Bing 엔드포인트에 보내면 IndexNow 참여 검색엔진(네이버 등)에도 공유된다.
// 키는 공개값이다(사이트 루트의 {키}.txt 로 누구나 볼 수 있어야 검증됨).
// scripts/indexnow.mjs 가 이 파일을 node 로 바로 읽으므로 다른 파일을 import 하지 않는다.
// ─────────────────────────────────────────────────────────────

export const INDEXNOW_KEY = "44e90a7aaf8414fc17c616c79e44887d";
// Bing 에 바로 보낸다(Bing 웹마스터 IndexNow 화면에 기록이 남고, 다른 검색엔진에도 공유됨)
export const INDEXNOW_ENDPOINT = "https://www.bing.com/indexnow";
const MAX_URLS = 10000; // IndexNow 한 번에 보낼 수 있는 최대 개수

export type IndexNowPayload = {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
};

export function indexNowPayload(urls: string[], siteUrl: string): IndexNowPayload {
  const base = siteUrl.replace(/\/$/, "");
  const host = new URL(base).host;
  // 우리 사이트 주소만, 중복 없이 (다른 호스트가 섞이면 요청 전체가 거절됨)
  const urlList = [...new Set(urls)].filter((u) => new URL(u).host === host).slice(0, MAX_URLS);
  return { host, key: INDEXNOW_KEY, keyLocation: `${base}/${INDEXNOW_KEY}.txt`, urlList };
}

// 최근 hours 시간 안에 등록된 테마 상세 주소
export function recentThemeUrls(
  themes: { id: string; created_at?: string | null }[],
  now: Date,
  hours: number,
  siteUrl: string
): string[] {
  const since = now.getTime() - hours * 3600 * 1000;
  return themes
    .filter((t) => t.created_at && Date.parse(t.created_at) >= since)
    .map((t) => `${siteUrl.replace(/\/$/, "")}/theme/${t.id}`);
}
