import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { publicClient } from "@/lib/supabase/public";
import { listedBrands, listedRegions } from "@/lib/catalog-server";

// 하루마다 사이트맵 재생성 (새 테마가 색인 대상에 자동 편입되도록)
export const revalidate = 86400;

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
    { path: "/quiz", priority: 0.9, changeFrequency: "monthly" },
    { path: "/feed", priority: 0.8, changeFrequency: "daily" },
    { path: "/region", priority: 0.7, changeFrequency: "weekly" },
    { path: "/cafe", priority: 0.6, changeFrequency: "weekly" },
    { path: "/match", priority: 0.6, changeFrequency: "monthly" },
  ];

  const staticEntries: MetadataRoute.Sitemap = routes.map(
    ({ path, priority, changeFrequency }) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency,
      priority,
    })
  );

  // 테마 상세 페이지(/theme/[id]) 전부 편입 — DB 못 읽으면 정적 목록만.
  let themeEntries: MetadataRoute.Sitemap = [];
  try {
    const { data } = await publicClient().from("catalog").select("id");
    themeEntries = (data ?? []).map((r: { id: string }) => ({
      url: `${SITE_URL}/theme/${r.id}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    themeEntries = [];
  }

  // 지역·브랜드 목록 페이지 (실제로 생성되는 것만). 한글 경로는 인코딩해서 싣는다.
  const [regions, brands] = await Promise.all([listedRegions(), listedBrands()]);
  const listingEntries: MetadataRoute.Sitemap = [
    ...regions.map((r) => `/region/${encodeURIComponent(r.key)}`),
    ...brands.map((b) => `/cafe/${encodeURIComponent(b.key)}`),
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...listingEntries, ...themeEntries];
}
