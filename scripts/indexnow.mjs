// IndexNow 알림 보내기 (필요할 때 직접 실행)
//
//   npm run indexnow                    최근 3일 안에 들어온 테마 + 홈
//   npm run indexnow -- 7               최근 7일
//   npm run indexnow -- /best/테이블-방탈출 /privacy   새로 생기거나 바뀐 페이지만 콕 집어서
//
// 사이트맵 전체를 한 번에 보내는 'all' 은 없앴다(2026-11-27). Bing 웹마스터가 "IndexNow is in batch mode"
// (몰아서 보내면 색인이 늦어진다)로 경고했다. 바뀐 주소만, 바뀐 직후에, 한 번에 MAX_SEND 개까지만 보낸다.
//
// 새 테마 SQL 을 넣고 배포가 끝난 뒤 돌리면 된다. 비밀값은 필요 없다
// (검색엔진은 사이트 루트의 {키}.txt 로 주인이 맞는지 확인한다).
// Node 22 의 TypeScript 바로 읽기로 lib/indexnow.ts 를 그대로 쓴다.

import { readFileSync } from "node:fs";
import {
  INDEXNOW_ENDPOINTS,
  indexNowPayload,
  recentThemeUrls,
} from "../lib/indexnow.ts";

// .env (공개 NEXT_PUBLIC_* 값만 있음)
const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split("\n")
    .map((l) => l.match(/^([A-Z_]+)=(.*)$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2].trim().replace(/^["']|["']$/g, "")])
);
const SITE =
  env.NEXT_PUBLIC_SITE_URL && !env.NEXT_PUBLIC_SITE_URL.includes("vercel.app")
    ? env.NEXT_PUBLIC_SITE_URL
    : "https://talkkaknote.com";

async function recentUrls(days) {
  const res = await fetch(
    `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/catalog?select=id,created_at&order=created_at.desc&limit=1000`,
    { headers: { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY } }
  );
  const themes = await res.json();
  const fresh = recentThemeUrls(themes, new Date(), days * 24, SITE);
  return fresh.length ? [`${SITE}/`, ...fresh] : [];
}

const MAX_SEND = 100; // 한 번에 보내는 최대 개수(몰아서 보내지 않기)
const args = process.argv.slice(2);
if (args[0] === "all") {
  console.log("'all'(사이트맵 전체 한꺼번에)은 Bing 이 batch mode 로 경고해서 없앴어요. 바뀐 페이지 주소를 직접 적어 주세요.");
  process.exit(1);
}
const paths = args.filter((a) => a.startsWith("/") || a.startsWith("http"));
const urls = paths.length
  ? paths.map((a) => (a.startsWith("http") ? a : `${SITE}${encodeURI(a)}`))
  : await recentUrls(Number(args[0]) || 3);
const payload = indexNowPayload(urls, SITE);
if (payload.urlList.length > MAX_SEND) {
  console.log(`${payload.urlList.length}개는 너무 많아요. 최근 것 ${MAX_SEND}개만 보내요(나머지는 사이트맵으로 검색엔진이 읽어 가요).`);
  payload.urlList = payload.urlList.slice(0, MAX_SEND);
}

if (!payload.urlList.length) {
  console.log("보낼 주소가 없어요 (그 기간에 새로 들어온 테마 없음)");
  process.exit(0);
}

const hint = {
  200: "접수됨",
  202: "접수됨 (키 확인 대기 중)",
  400: "요청 형식 오류",
  403: "키 파일을 못 읽음 — 배포됐는지, 사이트가 막혀 있지 않은지 확인",
  422: "주소와 사이트 호스트가 안 맞음",
  429: "너무 자주 보냄 — 나중에 다시",
};
// Bing(+공유) 과 네이버에 각각 보낸다. 하나가 실패해도 나머지는 보낸다.
let ok = false;
for (const endpoint of INDEXNOW_ENDPOINTS) {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });
    console.log(`${new URL(endpoint).host}: ${payload.urlList.length}개 전송 → ${res.status} ${hint[res.status] ?? ""}`);
    ok ||= res.ok;
  } catch (e) {
    console.log(`${new URL(endpoint).host}: 전송 실패 (${e.message})`);
  }
}
process.exit(ok ? 0 : 1);
