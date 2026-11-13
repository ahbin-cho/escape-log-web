// 포스터가 없는 테마 카드에 대신 놓는 자리. 매장 포스터는 허락받은 것만 싣는다.
export default function PosterPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex h-24 w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-edge/40 bg-ink/40 px-4 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/mascot.png" alt="" className="h-12 w-12 shrink-0 object-contain" />
      <p className="text-xs font-bold leading-snug text-cream/60">
        포스터는 매장이 허락해 주면
        <br />
        얼른 가져올게요
      </p>
    </div>
  );
}
