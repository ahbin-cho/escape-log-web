// IndexNow 알림 보내기 (필요할 때 직접 실행)
//
//   npm run indexnow            최근 3일 안에 들어온 테마 + 홈
//   npm run indexnow -- 7       최근 7일
//   npm run indexnow -- all     사이트맵의 모든 주소 (처음 한 번, 또는 대량 수정 뒤)
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

async function sitemapUrls() {
  const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function recentUrls(days) {
  const res = await fetch(
    `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/catalog?select=id,created_at&order=created_at.desc&limit=1000`,
    { headers: { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY } }
  );
  const themes = await res.json();
  const fresh = recentThemeUrls(themes, new Date(), days * 24, SITE);
  return fresh.length ? [`${SITE}/`, ...fresh] : [];
}

const arg = process.argv[2];
const urls = arg === "all" ? await sitemapUrls() : await recentUrls(Number(arg) || 3);
const payload = indexNowPayload(urls, SITE);

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
