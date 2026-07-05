export default function Stars({ value = 0 }: { value?: number }) {
  const v = Math.round(value);
  // 별점을 꽃(🌸)으로 표시 — 채운 꽃 + 흐린 꽃(남은 칸)
  return (
    <span aria-label={`별점 ${v}점`} className="text-sm tracking-wide">
      {"🌸".repeat(v)}
      <span className="opacity-25">{"🌸".repeat(5 - v)}</span>
    </span>
  );
}
