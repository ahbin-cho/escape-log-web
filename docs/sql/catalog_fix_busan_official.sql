-- 부산 테마 값 바로잡기 — 각 매장 공식 페이지에서 2026-11-14 확인(지점별 주소까지 대조)
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전.
-- 키이스케이프 부산점(공식 테마 상세): 5개 모두 60분, 장르
update public.catalog set time_limit = 60 where cafe = '키이스케이프 부산점' and time_limit = 0;
update public.catalog set genre = '아케이드' where cafe = '키이스케이프 부산점' and name like '난쟁이의 장난%';
update public.catalog set genre = '공포' where cafe = '키이스케이프 부산점' and name like '정신병동%';
-- 셜록홈즈(공식 상세 팝업): 인원
update public.catalog set players = '2~4' where cafe = '셜록홈즈 부산기장정관점' and name like '%트라이앵글%' and players = '';
update public.catalog set players = '2~6' where cafe = '셜록홈즈 부산기장정관점' and name like '%유품정리사%' and players = '';
update public.catalog set players = '2~6' where cafe = '셜록홈즈 부산 아트몰링' and players = '';
-- 플레이포인트랩 해운대 몽글숲: 공식 장르는 문제방·코믹(추리 아님)
update public.catalog set genre = '코믹', tags = array['문제방','코믹','해운대'] where cafe = '플레이포인트랩 해운대 블루오션스테이션' and name = '몽글숲';
select name, cafe, genre, time_limit, players from public.catalog
 where cafe in ('키이스케이프 부산점','셜록홈즈 부산기장정관점','셜록홈즈 부산 아트몰링') or name = '몽글숲' order by cafe, name;
