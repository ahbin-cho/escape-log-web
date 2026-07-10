import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// 공개적으로 색인되어야 하는 페이지들 (개인/인증 페이지 제외)
export default function sitemap(): MetadataRoute.Sitemap {
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
    { path: "/match", priority: 0.6, changeFrequency: "monthly" },
  ];

  const lastModified = new Date();

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
