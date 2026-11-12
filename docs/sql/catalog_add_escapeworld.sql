-- 이스케이프월드(경기 수원시 팔달구 인계로 140, 3층) 테마 추가
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 중복으로 들어가지 않음.
-- 출처: 네이버 예약(방자전 상세) · 매장 인스타 공지(2026-11-05, ESCAPE SCHOOL 오픈 예고)
-- 매장명: 지점이 하나뿐이라 '이스케이프월드 수원'(수원 → 경기·수원 페이지에 묶임)

insert into public.catalog
  (name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url)
select v.* from (values
  (
    '방자전', '이스케이프월드 수원', '추리', 4::int2, 1::int2,
    array['문제방','단체'],
    '누가 그대의 방자인가...? 플레이 시간에 비해 문제 수가 많은 문제방이에요. 3인 이상을 권장하고, 8인 이상도 들어갈 수 있는 넓은 공간이에요.',
    100::int2, '3~5', 27000,   -- 1인 · 평일 4인 이상 기준
    'https://m.booking.naver.com/booking/12/bizes/1413691/items/7378056'
  ),
  (
    'ESCAPE SCHOOL', '이스케이프월드 수원', '추리', 5::int2, 1::int2,
    array['문제방','장시간','고난도','단체'],
    '우리 오빠 좀 찾아주세요. 이스케이프 컴퍼니에 이어 준비한 미스터리 문제방이에요. 놀라는 구간은 시작 전에 직원에게 요청하면 빼고 할 수 있어요.',
    200::int2, '4~6', 60000,   -- 1인 · 평일 4인 기준(오픈 전 공지, 바뀔 수 있음)
    'https://m.booking.naver.com/booking/12/bizes/1413691'
  )
) as v(name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url)
where not exists (
  select 1 from public.catalog c where c.name = v.name and c.cafe = v.cafe
);

-- 넣은 뒤 확인
select id, name, cafe, genre, difficulty, time_limit, players from public.catalog where cafe like '이스케이프월드%';
