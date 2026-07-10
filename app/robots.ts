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
        disallow: ["/admin", "/api/", "/auth/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
