"use client";

import { useEffect, useState, type ReactNode } from "react";
import { getRecords, type EscapeRecord } from "@/lib/store";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import ImportBanner from "@/components/ImportBanner";
import HomeBanner from "@/components/HomeBanner";
import FeedPreview from "@/components/FeedPreview";
import LoggedOutCTA from "@/components/LoggedOutCTA";
import LoggedInHero from "@/components/LoggedInHero";
import HomeRegionThemes from "@/components/HomeRegionThemes";
import HomeDiary from "@/components/HomeDiary";

// 홈의 브라우저 쪽 화면. discover(조건별·팀 궁합 진입)는 서버에서 그려 넘겨받아
// 검색엔진이 받는 HTML 에도 들어가게 한다.
export default function HomeClient({ discover }: { discover: ReactNode }) {
  const [records, setRecords] = useState<EscapeRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    getRecords().then((r) => {
      setRecords(r);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoggedIn(false);
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setLoggedIn(!!s?.user);
      // 로그인/로그아웃 시 내 기록 갱신(로그아웃하면 [] → 잔상 제거)
      getRecords().then(setRecords);
    });
    return () => sub.subscription.unsubscribe();
  }, []);


  return (
    <div className="space-y-8 sm:space-y-10">
      <LoggedOutCTA />
      {loggedIn === true && <LoggedInHero records={records} />}
      {discover}
      <HomeRegionThemes />
      <HomeBanner />
      <ImportBanner />

      <FeedPreview />

      <HomeDiary records={records} ready={ready} />
    </div>
  );
}
