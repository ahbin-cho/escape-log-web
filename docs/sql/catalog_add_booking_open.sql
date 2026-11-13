-- 테마 페이지 "예약 오픈: ○일 전부터" 한 줄을 위한 칸 추가 + 확인된 매장 8곳 채우기
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전.
-- 값은 2026-11-13 에 각 매장의 네이버 예약 달력을 직접 읽어 "오늘부터 며칠 뒤 날짜까지 예약이 열려 있는지"를 본 것이다.
--   (네이버 예약 설정값 bookingAvailableEndValue=30 은 실제 달력과 달랐다 → 쓰지 않는다. 달력에서 열려 있는 마지막 날짜로 판단)
--   하루만 본 값이라 "매일 하루씩 열리는 방식"으로 가정했다. 몇 시에 열리는지는 확인하지 못했다.
-- 아직 못 채운 곳: 네이버가 조회 횟수를 제한해 나머지 네이버 예약 매장 17곳은 다음에 이어서 확인.
--   자체 예약 사이트를 쓰는 매장은 체인별 공지를 확인한 뒤 채운다(추측으로 넣지 않는다).

alter table public.catalog add column if not exists booking_open text not null default '';

with v(cafe, booking_open) as (values
  ('티켓투이스케이프 홍대점',   '7일 전부터'),
  ('룸즈에이 강남점',           '7일 전부터'),
  ('룸즈에이 수원역점',         '14일 전부터'),
  ('룸즈에이 수원역 2호점',     '14일 전부터'),
  ('룸즈에이 대학로점',         '30일 전부터'),
  ('룸즈에이 안양범계점',       '30일 전부터'),
  ('룸즈에이 일산 웨스턴돔점',  '30일 전부터'),
  ('룸즈에이 의정부점',         '30일 전부터')
)
update public.catalog c set booking_open = v.booking_open
from v where c.cafe = v.cafe and c.reservation_url like '%booking.naver.com%';

-- 결과 확인(8줄이 나와야 한다)
select cafe, booking_open, count(*) as themes
from public.catalog where booking_open <> '' group by cafe, booking_open order by cafe;
