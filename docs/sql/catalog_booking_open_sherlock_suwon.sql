-- 셜록홈즈 수원 3곳 예약 오픈: "몇 달 앞까지 열려 있음"
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전.
-- 출처: 셜록홈즈 공식 예약 페이지(sherlock-holmes.co.kr/reservation, 2026-11-13 확인)
--   수원역점(bno=100)·수원역2호점(113)·수원인계점(108) 모두 2027년 4~6월 날짜까지 '예약가능' 시간이 열려 있음
--   → "N일 전" 규칙이 없는 곳. 사이트에는 "원하는 날짜를 지금 바로 예약할 수 있어요"로 보인다.

update public.catalog set booking_open = '몇 달 앞까지 열려 있음'
where cafe in ('셜록홈즈 수원역점', '셜록홈즈 수원역2호점', '셜록홈즈 수원인계점')
  and coalesce(booking_open, '') = '';

select cafe, count(*) as 테마수, max(booking_open) as 예약오픈 from public.catalog
where cafe like '셜록홈즈 수원%' group by cafe order by cafe;
