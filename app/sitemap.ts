import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import {
  getAllThemes,
  listedBrands,
  listedRegions,
} from "@/lib/catalog-server";
import { listedConditions } from "@/lib/best";
import { getSpotlights } from "@/lib/spotlight-server";

// 1시간마다 사이트맵 재생성 (새 테마가 색인 대상에 자동 편입되도록)
export const revalidate = 3600;

// 공개적으로 색인되어야 하는 페이지들 (개인/인증 페이지 제외)
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const routes: {
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }[] = [
    { path: "/", priority: 1, changeFrequency: "daily" },
    { path: "/intro", priority: 0.9, changeFrequency: "monthly" },
    { path: "/diary", priority: 0.9, changeFrequency: "monthly" },
    { path: "/quiz", priority: 0.9, changeFrequency: "monthly" },
    { path: "/feed", priority: 0.8, changeFrequency: "daily" },
    { path: "/region", priority: 0.7, changeFrequency: "weekly" },
    { path: "/cafe", priority: 0.6, changeFrequency: "weekly" },
    { path: "/best", priority: 0.7, changeFrequency: "weekly" },
    { path: "/match", priority: 0.6, changeFrequency: "monthly" },
    { path: "/immersive", priority: 0.7, changeFrequency: "weekly" },
  ];

  const staticEntries: MetadataRoute.Sitemap = routes.map(
    ({ path, priority, changeFrequency }) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency,
      priority,
    })
  );

  // 지역·브랜드·조건 목록 페이지 (실제로 생성되는 것만). 한글 경로는 인코딩해서 싣는다.
  const [regions, brands, all, spotlights] = await Promise.all([
    listedRegions(),
    listedBrands(),
    getAllThemes(),
    getSpotlights(),
  ]);

  // 테마 상세 페이지(/theme/[id]) 전부 편입. 목록 페이지와 같은 조회(getAllThemes)를 쓴다.
  // (예전엔 id 만 따로 조회했는데, 그 응답이 오래된 캐시로 남아 새 테마가 절반 넘게 빠진 적이 있다)
  const themeEntries: MetadataRoute.Sitemap = all.map((t) => ({
    url: `${SITE_URL}/theme/${t.id}`,
    lastModified: t.created_at ? new Date(t.created_at) : lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
  const listingEntries: MetadataRoute.Sitemap = [
    ...regions.map((r) => `/region/${encodeURIComponent(r.key)}`),
    ...brands.map((b) => `/cafe/${encodeURIComponent(b.key)}`),
    ...listedConditions(all).map(
      (x) => `/best/${encodeURIComponent(x.condition.slug)}`
    ),
    ...spotlights.map((s) => `/spotlight/${s.slug}`),
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...listingEntries, ...themeEntries];
}
