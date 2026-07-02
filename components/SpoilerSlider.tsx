"use client";

export const SPOILER_LABELS = [
  "스포 없음",
  "난이도만",
  "힌트까지",
  "풀스포",
] as const;

export default function SpoilerSlider({
  level,
  onChange,
}: {
  level: number;
  onChange: (level: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-cream/40">스포일러 수위</span>
        <span className="text-grape">{SPOILER_LABELS[level]}</span>
      </div>
      <input
        type="range"
        min={0}
        max={3}
        step={1}
        value={level}
        onChange={(e) => onChange(Number(e.target.value))}
        className="candy-range w-full"
        aria-label="스포일러 수위 조절"
      />
    </div>
  );
}
