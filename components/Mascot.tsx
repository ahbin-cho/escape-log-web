import Image from "next/image";
import { MASCOT } from "@/lib/quiz";

// 마스코트 탈출귀 그림(배경 투명). 크기는 className 으로 준다.
export default function Mascot({ className = "" }: { className?: string }) {
  return (
    <Image
      src={MASCOT.image}
      alt=""
      width={256}
      height={256}
      className={`object-contain ${className}`}
    />
  );
}
