import Image from "next/image";

// 문항 수를 숫자로 보여 주지 않고, 닫힌 문 위에 열린 문을 겹쳐
// 진행할수록 열리는 것처럼 보이게 한다. progress 는 0~1.
export default function DoorProgress({ progress }: { progress: number }) {
  const p = Math.min(1, Math.max(0, progress));
  return (
    <div
      role="progressbar"
      aria-label="진행 상황"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(p * 100)}
      className="relative mx-auto h-24 w-24"
    >
      <Image
        src="/door.png"
        alt=""
        width={96}
        height={96}
        priority
        className="absolute inset-0 h-full w-full object-contain"
      />
      <Image
        src="/door-open.png"
        alt=""
        width={96}
        height={96}
        priority
        style={{ opacity: p }}
        className="absolute inset-0 h-full w-full object-contain transition-opacity duration-500 motion-reduce:transition-none"
      />
    </div>
  );
}
