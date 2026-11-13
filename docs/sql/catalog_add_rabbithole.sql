-- 방탈출 토끼굴 홍대점(서울 마포구 와우산로 122 B1층) 테마 2개 추가/갱신
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전(있으면 고치고, 없으면 넣는다).
-- 출처: 공식 사이트 https://www.rabbitholeescape.co.kr/theme · /notice/1 (2026-11-13 확인)
--   테마명·장르·인원·시간·난이도(5칸 중 칠해진 칸 수)·소개 문구·포스터는 공식 테마 페이지 값.
--   장르: '드라마 미스터리' → 감성(+미스터리 태그), '동화 / 모노룸' → 판타지(+모노룸 태그)  (lib/genre.ts 규칙과 같게)
--   예약: 매일 오후 11시에 일주일 뒤 날짜가 열림(공지 2025-03-07)
--   공식 표기가 없는 것: 가격(0 → 화면에 안 나옴), 공포도(임시 1, 드라마·동화 장르 기준). 확인되면 고친다.
--   매장 내 화장실 없음(공식 안내)

with v(name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url, booking_open) as (values
  ('두껍아 두껍아 헌집줄게 새집다오', '토끼굴 홍대점', '감성', 2::int2, 1::int2, array['드라마','미스터리','홍대'],
   '복덕방 수습직원 하나. 그리고 3명의 손님.',
   75::int2, '2~6', 0, 'https://www.rabbitholeescape.co.kr/reservation?branch=1&theme=4#list',
   'https://www.rabbitholeescape.co.kr/storage/theme/2026_06/19/A672ShZdrFSut0b8O8vpiaXtcPqfoAWHeaxzBXjS.png', '7일 전 오후 11시'),
  ('행운만물상', '토끼굴 홍대점', '판타지', 4::int2, 1::int2, array['동화','모노룸','홍대'],
   '어서오세요. 행운만물상입니다. 7명의 이야기 속에서 다양한 행운을 만나보세요. 올해의 행운님, 잘부탁드립니다.',
   70::int2, '2~4', 0, 'https://www.rabbitholeescape.co.kr/reservation?branch=1&theme=5#list',
   'https://www.rabbitholeescape.co.kr/storage/theme/2026_06/19/1aRKtqXrj8100GDFJUTLQ8coWn5baDZ3NtRwCTKw.png', '7일 전 오후 11시')
),
upd as (
  update public.catalog c set genre=v.genre, difficulty=v.difficulty, fear_level=v.fear_level, tags=v.tags, teaser=v.teaser,
         time_limit=v.time_limit, players=v.players, price=v.price, reservation_url=v.reservation_url, poster_url=v.poster_url,
         booking_open=v.booking_open
  from v where c.name=v.name and c.cafe=v.cafe returning c.name
)
insert into public.catalog (name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url, booking_open)
select v.* from v where not exists (select 1 from public.catalog c where c.name=v.name and c.cafe=v.cafe);

select name, cafe, genre, difficulty, fear_level, time_limit, players, booking_open from public.catalog where cafe like '토끼굴%';
