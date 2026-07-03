"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminCounts } from "@/lib/admin";

export default function AdminDashboard() {
  const [counts, setCounts] = useState<{
    records: number;
    publicReviews: number;
    catalog: number;
  } | null>(null);

  useEffect(() => {
    adminCounts().then(setCounts);
  }, []);

  const cards = [
    {
      label: "전체 기록",
      value: counts?.records,
      emoji: "📓",
      href: null as string | null,
    },
    {
      label: "공개 후기",
      value: counts?.publicReviews,
      emoji: "🌏",
      href: "/admin/reviews",
    },
    {
      label: "추천 테마",
      value: counts?.catalog,
      emoji: "🎯",
      href: "/admin/catalog",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((c) => {
        const inner = (
          <div className="rough rounded-2xl border-2 border-edge bg-panel p-6 shadow-cute">
            <p className="text-3xl">{c.emoji}</p>
            <p className="mt-2 text-3xl font-extrabold">
              {c.value ?? "…"}
            </p>
            <p className="mt-1 text-sm font-bold text-cream/60">{c.label}</p>
          </div>
        );
        return c.href ? (
          <Link key={c.label} href={c.href} className="block transition active:scale-[0.98]">
            {inner}
          </Link>
        ) : (
          <div key={c.label}>{inner}</div>
        );
      })}
    </div>
  );
}
