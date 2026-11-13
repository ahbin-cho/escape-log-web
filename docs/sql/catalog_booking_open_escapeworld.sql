-- 이스케이프월드 수원 예약 오픈일 채우기
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전.
-- 출처: 네이버 예약 '예약안내' 항목(https://m.booking.naver.com/booking/12/bizes/1413691, 2026-11-13 확인)
--   "예약 오픈시간 : 밤 11시  ex) 토요일 예약 -> 전주 토요일 밤 11시" → 이용일 7일 전 밤 11시
--   (네이버 설정값 bookingAvailableEndValue=30 은 실제 달력과 달라서 쓰지 않는다)

update public.catalog set booking_open = '7일 전 밤 11시'
where cafe = '이스케이프월드 수원' and name in ('방자전', 'ESCAPE SCHOOL');

select name, cafe, booking_open from public.catalog where cafe = '이스케이프월드 수원';
