-- MHZ ESCAPE (수원 행궁동, 수원시 팔달구 북수동 210-1 B1) 테마 추가/갱신
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전.
-- 출처: 공식 사이트 https://www.mhzescape.com (화면 + js/data.js·js/app.js, 2026-11-14 확인)
--   우야 · 공포 · 70분 · 2~6인 · 1인 33,000원(결제 금액 = 1인 가격 × 인원) · 소개 "비가 내리는 그날, 쫓기기 시작했다."
--   매장 오픈일 2026-11-20. 예약: "매일 자정 기준 미오픈 일정 하루씩 순차 오픈", 오늘부터 13일 뒤까지 2주 열림 → '13일 전 자정'
--     (11/20 오픈 전에는 11/20~12/3 이 먼저 열려 있음)
--   테마 이미지: 공식 사이트 images/theme-poster.jpg (사이트 안에서만 쓴다)
--   난이도·공포도는 공식 표기가 없어 임시 3. '배우와의 상호작용'(네이버 플레이스)은 얼마나 나오는지 공식 글에 없어 이머시브 꼬리표는 달지 않음.
with v(name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url) as (values
  ('우야 (雨夜)', 'MHZ ESCAPE 수원 행궁동', '공포', 3::int2, 3::int2, array['공포','수원','행궁동'],
   '비가 내리는 그날, 쫓기기 시작했다. (2026년 11월 20일 오픈)',
   70::int2, '2~6', 33000, 'https://www.mhzescape.com/', 'https://www.mhzescape.com/images/theme-poster.jpg')
),
upd as (
  update public.catalog c set genre=v.genre, difficulty=v.difficulty, fear_level=v.fear_level, tags=v.tags, teaser=v.teaser,
         time_limit=v.time_limit, players=v.players, price=v.price, reservation_url=v.reservation_url, poster_url=v.poster_url
  from v where c.name=v.name and c.cafe=v.cafe returning c.name
)
insert into public.catalog (name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url)
select v.* from v where not exists (select 1 from public.catalog c where c.name=v.name and c.cafe=v.cafe);

update public.catalog set booking_open = '13일 전 자정' where cafe = 'MHZ ESCAPE 수원 행궁동';

select id, name, cafe, time_limit, players, price, booking_open from public.catalog where cafe like 'MHZ%';
