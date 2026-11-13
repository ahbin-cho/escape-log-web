import HomeClient from "@/components/HomeClient";
import HomeDiscover from "@/components/HomeDiscover";
import { HomeMystery, HomeNewAndHot } from "@/components/HomeFresh";
import HomeSpotlight from "@/components/HomeSpotlight";

// 홈: 서버에서 그리는 영역(미스터리 방 · 조건별 · 인기/신규) + 브라우저 쪽 홈 화면.
// "오늘의" 방과 새 테마·인기 순위가 배포 없이도 바뀌도록 1시간마다 다시 만든다.
export const revalidate = 3600;

export default function HomePage() {
  return (
    <HomeClient
      discover={
        <>
          <HomeSpotlight />
          <HomeDiscover />
          <HomeNewAndHot />
          <HomeMystery />
        </>
      }
    />
  );
}
