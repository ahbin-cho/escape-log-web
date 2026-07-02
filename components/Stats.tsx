import type { EscapeRecord } from "@/lib/store";

export default function Stats({ records }: { records: EscapeRecord[] }) {
  const total = records.length;
  const successes = records.filter((r) => r.success).length;
  const successRate = total ? Math.round((successes / total) * 100) : 0;
  const avgRating = total
    ? (records.reduce((s, r) => s + (Number(r.rating) || 0), 0) / total).toFixed(1)
    : "0.0";

  const items = [
    { label: "플레이한 방", value: total },
    { label: "성공률", value: `${successRate}%` },
    { label: "평균 별점", value: avgRating },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((it) => (
        <div
          key={it.label}
          className="rough rounded-2xl border-2 border-edge bg-panel px-3 py-4 text-center shadow-cute"
        >
          <div className="text-2xl font-extrabold">{it.value}</div>
          <div className="mt-1 text-xs text-cream/40">{it.label}</div>
        </div>
      ))}
    </div>
  );
}
