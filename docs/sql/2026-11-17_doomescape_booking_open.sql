-- 둠이스케이프 예약 오픈 시각 (매장 공식 '예약제도 안내' 기준, 운영자 제공 캡처 2026-11-17)
-- 1호점 24:00 오픈·14일 뒤까지 / 2호점 23:00·14일 / DTH점 23:30·7일 / FEAR점 23:45·7일
update public.catalog set booking_open = '14일 전 자정'          where cafe = '둠이스케이프 1호점';
update public.catalog set booking_open = '14일 전 밤 11시'       where cafe = '둠이스케이프 2호점';
update public.catalog set booking_open = '7일 전 밤 11시 30분'   where cafe = '둠이스케이프 DTH점(부평)';
update public.catalog set booking_open = '7일 전 밤 11시 45분'   where cafe = '둠이스케이프 FEAR점(수원)';
-- 확인
select cafe, name, booking_open from public.catalog where cafe like '둠이스케이프%' order by cafe, name;
