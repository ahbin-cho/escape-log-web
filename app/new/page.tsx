import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RecordForm from "@/components/RecordForm";
import { NOINDEX } from "@/lib/site";

// 로그인 필요한 개인 작성 페이지 → 색인 제외
export const metadata: Metadata = {
  title: "새 방탈출 기록",
  ...NOINDEX,
};

export default async function NewRecordPage() {
  // 로그인 안 했으면 폼을 보여주기 전에 로그인 페이지로 (저장 단계에서 막히는 헛수고 방지)
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login?next=/new");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-bold">새 방탈출 기록</h1>
      <RecordForm mode="new" />
    </div>
  );
}
