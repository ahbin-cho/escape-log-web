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
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <p className="text-[11px] font-extrabold tracking-[0.25em] text-candy">NEW RECORD</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">오늘 다녀온 방, 남겨 둘까요?</h1>
        <p className="mt-1 text-sm text-cream/50">1분이면 돼요. 몇 번째 방인지, 연말 결산까지 알아서 정리돼요.</p>
      </div>
      <RecordForm mode="new" />
    </div>
  );
}
