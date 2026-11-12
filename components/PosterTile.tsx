// 달력 칸의 '미니 포스터': 포스터 그림이 없을 때(또는 그림 밑에) 깔리는 타일.
// 파스텔 칸 + 이모지 대신, 영화 포스터처럼 어두운 장르 색 바탕에 테마 이름을 넣는다.
const TONE: Record<string, { bg: string; accent: string }> = {
  공포: { bg: "#2A1215", accent: "#E5604C" },
  스릴러: { bg: "#1A1E2C", accent: "#8FA3D9" },
  추리: { bg: "#17282A", accent: "#6FC2A6" },
  감성: { bg: "#3A2033", accent: "#F0A7C0" },
  판타지: { bg: "#2A2142", accent: "#B9A6F2" },
  SF: { bg: "#11253B", accent: "#6DB8F2" },
  모험: { bg: "#3A2912", accent: "#F0B45C" },
  코믹: { bg: "#3B3210", accent: "#F2D75C" },
  아케이드: { bg: "#10302F", accent: "#5FD0C5" },
  기타: { bg: "#2B2926", accent: "#D9CFC0" },
};

export default function PosterTile({
  genre,
  name,
  success,
}: {
  genre: string;
  name: string;
  success?: boolean;
}) {
  const t = TONE[genre] ?? TONE["기타"];
  return (
    <span
      className="absolute inset-0 flex flex-col justify-between p-[9%] text-left"
      style={{ backgroundColor: t.bg, backgroundImage: `linear-gradient(160deg, ${t.accent}22 0%, transparent 55%)` }}
    >
      <span className="block truncate text-[7px] font-extrabold leading-none tracking-[0.12em] sm:text-[8px]" style={{ color: t.accent }}>
        {genre}
      </span>
      <span className="line-clamp-3 text-[9px] font-extrabold leading-[1.2] text-[#F5F0E6] [word-break:keep-all] sm:text-[11px]">
        {name}
      </span>
      <span className="flex items-center gap-1">
        <span className="h-[2px] flex-1 rounded-full" style={{ backgroundColor: `${t.accent}66` }} />
        {success !== undefined && (
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={success ? { backgroundColor: t.accent } : { border: `1px solid ${t.accent}` }}
            title={success ? "탈출" : "실패"}
          />
        )}
      </span>
    </span>
  );
}
