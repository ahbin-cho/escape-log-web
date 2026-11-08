import type { Metadata } from "next";
import RecordForm from "@/components/RecordForm";
import { NOINDEX } from "@/lib/site";

// 개인 작성 페이지 → 색인 제외.
// 로그인 없이도 먼저 쓸 수 있다(저장할 때 가입 유도). RecordForm 이 비회원을 처리한다.
export const metadata: Metadata = {
  title: "새 방탈출 기록",
  ...NOINDEX,
};

export default function NewRecordPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-bold">새 방탈출 기록</h1>
      <RecordForm mode="new" />
    </div>
  );
}
