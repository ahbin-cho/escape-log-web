-- 셜록홈즈 미사점 플레이 시간 채우기
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전(비어 있는 것만 채운다).
-- 출처: 셜록홈즈 공식 예약 페이지 미사점 공지(sherlock-holmes.co.kr/reservation, 2026-11-13 확인)
--   "전 테마는 플레이타임 60분 입니다." → 미사점 4개 테마 모두 60분

update public.catalog set time_limit = 60
where cafe = '셜록홈즈 미사점' and coalesce(time_limit, 0) = 0;

select name, cafe, time_limit from public.catalog where cafe = '셜록홈즈 미사점';
