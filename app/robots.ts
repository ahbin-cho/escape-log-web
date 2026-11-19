import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 관리자·API·인증 콜백은 크롤 자체를 차단.
        // (개인/회원 전용 페이지 — records, taste, new, edit, login 등 — 은
        //  noindex 메타로 처리. 크롤은 허용해야 검색엔진이 noindex 를 읽고
        //  확실히 색인에서 빼기 때문에 여기서는 Disallow 하지 않음)
        // /search 는 요청마다 서버가 도는 화면이고 검색 결과 페이지라 색인 가치가 없다 → 크롤 차단(Vercel CPU 절약)
        disallow: ["/admin", "/api/", "/auth/", "/search"],
      },
      // AI 검색·답변 봇은 이름을 적어 분명히 허용한다(GEO). 페이지는 미리 만들어 둔 캐시라 봇이 와도 서버 CPU 를 거의 안 쓴다.
      {
        userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended"],
        allow: "/",
        disallow: ["/admin", "/api/", "/auth/", "/search"],
      },
      // 대량 수집 봇은 계속 막는다. CCBot·meta-externalagent·Amazonbot 도 막아 둔다(운영자 결정 2026-11-19: 다시 열지 않는다).
      { userAgent: ["Bytespider", "CCBot", "meta-externalagent", "Amazonbot", "PetalBot", "SemrushBot", "AhrefsBot", "MJ12bot", "DotBot"], disallow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
