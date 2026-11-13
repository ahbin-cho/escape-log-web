-- 이머시브 예약 오픈일 (공식 예약 페이지에서 2026-11-13 확인)
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전.
--   위센트 이머시브 아바타 : wecent.kr/reservation 예약 달력 = 오늘~7일 뒤까지 열림, 다음 날짜는 매일 19:00 오픈
--       (11/13 기준 11/20 까지 예약 가능, 11/21 은 11/14 19:00 오픈) → '7일 전 오후 7시'
--       참고(공식): 2인 129,000원 · 3인 129,000원 · 4인 156,000원(팀 가격), 무통장 입금만, 같은 테마 1인 1건,
--       이용 5일 전~1일 전 취소 50% 차감, 24시간 이내 100% 차감
--   대흥씨어터 카지노 : asinart.co.kr 예매 달력에 공연 기간(2026.10.22~12.31) 회차가 모두 열려 있음 → '공연 기간 전체 상시 오픈'
--       회차(공식): 평일 19:30 / 주말 14:00·17:00, 월요일 휴무
update public.catalog set booking_open = '7일 전 오후 7시'
where cafe = '위센트 이머시브 홍대점' and name like '아바타%';
update public.catalog set booking_open = '공연 기간 전체 상시 오픈'
where cafe = '대흥씨어터 (대전)' and name like '카지노%';
select name, cafe, booking_open from public.catalog where '이머시브' = any(tags);
