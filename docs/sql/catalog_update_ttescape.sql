-- 티켓투이스케이프 홍대점(서울 마포구 와우산로29가길 83) 테마 15개 — 공식 값으로 난이도·예약 링크 고치기
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전(고치기만 하고 새로 넣지 않는다).
-- 출처(2026-11-13 확인):
--   공식 사이트 테마 페이지 https://www.ttescape.co.kr/themes (운영자가 보내 준 원문)
--   네이버 예약 https://booking.naver.com/booking/12/bizes/1465742 (테마 15개, 가격·시간·난이도 동일)
-- 확인 결과: 15개 모두 이미 들어 있고 이름·가격·시간·인원·소개·포스터는 공식과 같다. 다른 것은 두 가지뿐.
--   1) 난이도가 전부 3으로 들어가 있었다 → 공식 난이도(별)로 고친다.
--      우리 칸은 1~5 정수라 4.5 → 5, 3.5 → 4 로 올림했다.
--   2) 웨스턴 뱅 예약 링크: 네이버 예약에 지금 열려 있는 상품 번호는 7616548 (예전 6974702 는 목록에 없음).

with v(name, difficulty) as (values
  ('삼일보육원',            4::int2),
  ('게임의 법칙',           5::int2),
  ('해줘! 놈즈',            3::int2),
  ('갤럭시 익스프레스',     5::int2),  -- 공식 4.5
  ('낮과 밤',               4::int2),
  ('라빈의 보물상점',       2::int2),
  ('로랑 옥스퍼드',         2::int2),
  ('오 자네 왔는가!',       4::int2),  -- 공식 3.5
  ('HELLO, PRAY',           5::int2),  -- 공식 4.5
  ('364일',                 4::int2),  -- 공식 3.5
  ('하씨 심부름센터',       4::int2),
  ('The Way Out',           3::int2),
  ('웨스턴 뱅',             5::int2),  -- 공식 4.5
  ('SCENE BEHIND THE SIN',  4::int2),
  ('히든 시나리오',         4::int2)
)
update public.catalog c set difficulty = v.difficulty
from v where c.name = v.name and c.cafe = '티켓투이스케이프 홍대점';

update public.catalog
set reservation_url = 'https://booking.naver.com/booking/12/bizes/1465742/items/7616548'
where name = '웨스턴 뱅' and cafe = '티켓투이스케이프 홍대점';

-- 결과 확인(15줄이 나와야 한다)
select name, genre, difficulty, fear_level, time_limit, players, price, reservation_url
from public.catalog where cafe = '티켓투이스케이프 홍대점' order by name;
