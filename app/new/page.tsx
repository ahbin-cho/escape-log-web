import RecordForm from "@/components/RecordForm";

export default function NewRecordPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-bold">새 방탈출 기록</h1>
      <RecordForm mode="new" />
    </div>
  );
}
