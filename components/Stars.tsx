export default function Stars({ value = 0 }: { value?: number }) {
  const v = Math.round(value);
  return (
    <span aria-label={`별점 ${v}점`} className="text-sm tracking-wider">
      <span className="text-candy">{"★".repeat(v)}</span>
      <span className="text-cream/45">{"★".repeat(5 - v)}</span>
    </span>
  );
}
