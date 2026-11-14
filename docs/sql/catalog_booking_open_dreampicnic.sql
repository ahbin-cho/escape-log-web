-- 꿈소풍(부천점·안산1호점·안산2호점) 예약 오픈일
-- 출처: 공식 실시간 예약 화면 dreampicnicescape.com/reservation 의 날짜 선택(reservation-new-script.js:
--   오늘부터 10일치(오늘 + 9일)만 고를 수 있고 날이 바뀌면 하루씩 밀림), 2026-11-14 확인 → '9일 전 자정'
update public.catalog set booking_open = '9일 전 자정' where cafe like '꿈소풍%';
select cafe, name, booking_open from public.catalog where cafe like '꿈소풍%' order by cafe, name;
