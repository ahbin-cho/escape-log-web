import HomeClient from "@/components/HomeClient";
import HomeDiscover from "@/components/HomeDiscover";

// 홈: 서버에서 그리는 "어떤 방 찾아?" 영역 + 브라우저 쪽 홈 화면.
export default function HomePage() {
  return <HomeClient discover={<HomeDiscover />} />;
}
