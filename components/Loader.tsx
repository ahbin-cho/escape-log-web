// 공용 로딩 인디케이터 (통통 튀는 캔디 점 + 문구).
export default function Loader({ label = "불러오는 중…" }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-3 w-3 animate-bounce rounded-full bg-candy"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <p className="text-sm font-bold text-cream/60">{label}</p>
    </div>
  );
}
