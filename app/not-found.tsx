import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
      <Image
        src="/door.png"
        alt=""
        width={140}
        height={140}
        className="h-32 w-32 object-contain"
      />
      <h1 className="mt-4 text-2xl sm:text-3xl">이 방은 없는 방이에요</h1>
      <p className="mt-2 max-w-sm text-sm text-cream/70">
        주소가 바뀌었거나 잘못 들어온 것 같아요. 아래에서 다시 찾아보세요.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="rough rounded-xl border-2 border-edge bg-candy px-5 py-2.5 text-sm font-extrabold text-white shadow-cute transition active:scale-[0.97]"
        >
          홈으로
        </Link>
        <Link
          href="/region"
          className="text-sm font-extrabold underline decoration-2 underline-offset-4 hover:text-candy"
        >
          지역별 테마 보기
        </Link>
      </div>
    </div>
  );
}
