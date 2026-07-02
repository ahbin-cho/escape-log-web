"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getRecord, type EscapeRecord } from "@/lib/store";
import RecordForm from "@/components/RecordForm";

export default function EditRecordPage() {
  const params = useParams<{ id: string }>();
  const [record, setRecord] = useState<EscapeRecord | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (params?.id) setRecord(getRecord(params.id));
    setReady(true);
  }, [params?.id]);

  if (!ready) {
    return <p className="py-20 text-center text-cream/30">불러오는 중…</p>;
  }

  if (!record) {
    return (
      <div className="py-20 text-center text-cream/40">
        <p>기록을 찾을 수 없습니다</p>
        <Link href="/" className="mt-3 inline-block text-sm text-candy underline">
          목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-extrabold">기록 수정</h1>
      <RecordForm mode="edit" initial={record} />
    </div>
  );
}
