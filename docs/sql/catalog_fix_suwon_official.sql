-- 수원 셜록홈즈 테마 값 바로잡기 — 공식 상세 팝업(sherlock-holmes.co.kr, bno=100·113·108)에서 2026-11-14 확인
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전.
-- 장르는 우리 분류(공포·스릴러·추리·아케이드·감성·코믹·판타지·모험·SF·기타)에 맞추고, 공식 표기는 tags 에 넣는다.
update public.catalog set difficulty = 2 where cafe = '셜록홈즈 수원인계점' and name in ('무제', 'WHO ARE U?');
update public.catalog set difficulty = 4 where cafe = '셜록홈즈 수원인계점' and name = '라이트랠리';
update public.catalog set difficulty = 2 where cafe = '셜록홈즈 수원역2호점' and name = 'ASDF';
-- 수원인계점 공지: 아트마(70분) 외 모든 테마 60분
update public.catalog set time_limit = 60 where cafe = '셜록홈즈 수원인계점' and time_limit = 0 and name not like '%대기실%';
-- 공식 장르 표기를 tags 에 추가(중복 없이)
update public.catalog set tags = (select array_agg(distinct x) from unnest(tags || array['잠입']) x) where cafe = '셜록홈즈 수원역2호점' and (name like '%비밀번호 찾기%' or name = '제4창고에서의 탈출');
update public.catalog set tags = (select array_agg(distinct x) from unnest(tags || array['드라마']) x) where cafe = '셜록홈즈 수원역점' and name = '유작';
update public.catalog set tags = (select array_agg(distinct x) from unnest(tags || array['미스터리']) x) where cafe = '셜록홈즈 수원역2호점' and name in ('고서연전', '그레이백작가의 밀실');
update public.catalog set tags = (select array_agg(distinct x) from unnest(tags || array['첩보']) x) where cafe = '셜록홈즈 수원인계점' and name = '그는 남쪽을 꿈꾸지 않았다.';
update public.catalog set tags = (select array_agg(distinct x) from unnest(tags || array['문제방','챌린지']) x) where cafe = '셜록홈즈 수원인계점' and name like 'A TOY%';
-- 발사까지 59분 59초: 59분은 제목에서 온 값이고 공식 플레이 시간은 공개돼 있지 않다 → 0(미확인)
update public.catalog set time_limit = 0 where cafe = '셜록홈즈 수원역점' and name = '발사까지 59분 59초';
select name, cafe, genre, difficulty, time_limit, tags from public.catalog where cafe like '셜록홈즈 수원%' order by cafe, name;
