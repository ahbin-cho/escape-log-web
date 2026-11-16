// 만든 이미지를 휴대폰은 공유 창으로, 안 되면 파일로 내려받는다.
// 휴대폰 브라우저는 '누른 직후'에만 공유 창을 허락해서, 이미지를 만드는 동안 그 시간이 지나면 share() 를 거절한다(NotAllowedError).
// 그때도 실패로 끝내지 않고 내려받기로 넘긴다. 사용자가 공유 창을 닫은 경우(AbortError)는 조용히 끝낸다.
export async function shareOrDownload(file: File, data: { title?: string; text?: string } = {}): Promise<void> {
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], ...data });
      return;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      // 그 밖의 거절은 아래 내려받기로
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
