import { getAllThemes } from "@/lib/catalog-server";
import { newestThemes } from "@/lib/home-picks";
import { regionFromText } from "@/lib/region";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

// RSS 2.0: 새로 들어온 방탈출 테마(등록 최신순). 네이버 서치어드바이저 RSS 제출용.
// 홈과 같이 1시간마다 다시 만든다.
export const revalidate = 3600;

const MAX_ITEMS = 50;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    // XML 1.0 에서 허용되지 않는 제어 문자 제거
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

export async function GET() {
  const themes = newestThemes(await getAllThemes(), MAX_ITEMS);
  const lastBuild = themes[0]?.created_at
    ? new Date(themes[0].created_at).toUTCString()
    : new Date().toUTCString();

  const items = themes
    .map((t) => {
      const url = `${SITE_URL}/theme/${t.id}`;
      const region = regionFromText(t.cafe);
      const meta = [
        `장르 ${t.genre}`,
        `난이도 ${t.difficulty}/5`,
        `공포도 ${t.fear_level}/5`,
        t.time_limit ? `${t.time_limit}분` : "",
        t.players ? `${t.players}인` : "",
      ]
        .filter(Boolean)
        .join(" · ");
      const desc = [(t.teaser ?? "").trim(), meta].filter(Boolean).join(" — ");
      return `    <item>
      <title>${esc(`${t.name} — ${t.cafe} 방탈출${region ? ` (${region})` : ""}`)}</title>
      <link>${esc(url)}</link>
      <guid isPermaLink="true">${esc(url)}</guid>
      <description>${esc(desc)}</description>
      <category>${esc(t.genre)}</category>${
        t.created_at ? `\n      <pubDate>${new Date(t.created_at).toUTCString()}</pubDate>` : ""
      }
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(`${SITE_NAME} — 새로 들어온 방탈출 테마`)}</title>
    <link>${esc(SITE_URL)}</link>
    <description>${esc(SITE_DESCRIPTION)}</description>
    <language>ko</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${esc(`${SITE_URL}/rss.xml`)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
