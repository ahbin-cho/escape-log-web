"use client";

import { useEffect, useState, type ReactNode } from "react";
import { getRecords, getGuestRecords, type EscapeRecord } from "@/lib/store";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import ImportBanner from "@/components/ImportBanner";
import HomeBanner from "@/components/HomeBanner";
import FeedPreview from "@/components/FeedPreview";
import LoggedOutCTA from "@/components/LoggedOutCTA";
import LoggedInHero from "@/components/LoggedInHero";
import HomeSearchBar from "@/components/HomeSearchBar";
import HomeRegionThemes from "@/components/HomeRegionThemes";
import HomeDiary from "@/components/HomeDiary";

// 홈의 브라우저 쪽 화면(디자인 D). top·discover 는 서버에서 그려 넘겨받아
// 검색엔진이 받는 HTML 에도 들어가게 한다.
export default function HomeClient({ top, discover }: { top: ReactNode; discover: ReactNode }) {
  const [records, setRecords] = useState<EscapeRecord[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 가입 전이면 이 기기에 써 둔 기록을 보여 준다
    const load = () =>
      getRecords().then((r) => {
        setRecords(r.length ? r : getGuestRecords());
        setReady(true);
      });
    load();
    if (!isSupabaseConfigured()) return;
    // 로그인/로그아웃 시 내 기록 갱신(로그아웃하면 [] → 잔상 제거)
    const { data: sub } = createClient().auth.onAuthStateChange(() => {
      load();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="space-y-7 sm:space-y-9">
      <div className="space-y-4">
        <h1 className="sr-only">방탈로그 - 방탈출 기록장 · 취향 진단 · 맞춤 추천</h1>
        {/* 검색은 첫 화면 맨 위에: 찾는 방이 있는 사람은 바로 찾게 */}
        <HomeSearchBar />
        {/* 기록이 있으면 내 기록 한 줄, 없으면 취향 진단 배너 */}
        {records.length > 0 ? <LoggedInHero records={records} /> : <LoggedOutCTA />}
        <ImportBanner />
      </div>
      {top}
      <HomeDiary records={records} ready={ready} />
      {discover}
      <HomeRegionThemes />
      <HomeBanner />
      <FeedPreview />
    </div>
  );
}
