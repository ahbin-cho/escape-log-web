import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isCurrentUserAdmin } from "@/lib/supabase/server";
import { NOINDEX } from "@/lib/site";

// 관리자 전용 → 색인 제외
export const metadata: Metadata = {
  title: "관리자",
  ...NOINDEX,
};

const tab =
  "rough rounded-xl border-2 border-edge bg-panel px-3 py-1.5 text-sm font-bold transition active:scale-[0.97]";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ok = await isCurrentUserAdmin();
  if (!ok) redirect("/");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1
          className="mr-2 text-xl"
          style={{ fontFamily: "'SBAggroB', sans-serif" }}
        >
          🛠️ 관리자
        </h1>
        <Link href="/admin" className={tab}>
          대시보드
        </Link>
        <Link href="/admin/catalog" className={tab}>
          추천 카탈로그
        </Link>
        <Link href="/admin/reviews" className={tab}>
          공개 후기
        </Link>
      </div>
      {children}
    </div>
  );
}
