import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 관리자·API·인증 콜백은 크롤 자체를 차단.
        // 기록 쓰기·로그인·내 기록 화면도 크롤을 막는다(2026-11-19 서치 콘솔: 테마 상세마다 있는 "/new?theme=…" 링크 800여 개를
        // 구글이 하나씩 따라가 'NOINDEX 로 제외' 87건 + '발견됨 - 색인 안 됨' 수백 건이 쌓였다 → 테마 페이지에 쓸 크롤 예산을 뺏긴다).
        // 이 화면들은 noindex 메타도 그대로 달려 있다.
        // /search 는 요청마다 서버가 도는 화면이고 검색 결과 페이지라 색인 가치가 없다 → 크롤 차단(Vercel CPU 절약)
        disallow: ["/admin", "/api/", "/auth/", "/search", "/new", "/edit", "/login", "/records", "/taste"],
      },
      // AI 검색·답변 봇은 이름을 적어 분명히 허용한다(GEO). 페이지는 미리 만들어 둔 캐시라 봇이 와도 서버 CPU 를 거의 안 쓴다.
      {
        userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended"],
        allow: "/",
        disallow: ["/admin", "/api/", "/auth/", "/search", "/new", "/edit", "/login", "/records", "/taste"],
      },
      // 대량 수집 봇은 계속 막는다. CCBot·meta-externalagent·Amazonbot 도 막아 둔다(운영자 결정 2026-11-19: 다시 열지 않는다).
      { userAgent: ["Bytespider", "CCBot", "meta-externalagent", "Amazonbot", "PetalBot", "SemrushBot", "AhrefsBot", "MJ12bot", "DotBot"], disallow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
