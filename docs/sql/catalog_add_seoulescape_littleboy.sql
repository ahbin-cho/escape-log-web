-- 서울이스케이프룸 '리틀보이' 지점 새 테마 2개 (공식 사이트 테마 페이지, 2026-11-14 확인)
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전.
-- 출처: https://www.seoul-escape.com/room (테마 팝업: 지점·장르·소요시간·참여인원·난이도 칸 수)
--   박스오피스: 리틀보이 · 코믹/추리 · 60분 · 2~5 · 난이도 4칸 · "누가 박스를 옮겼을까?"
--   신스틸러  : 리틀보이 · 잠입 · 60분 · 2~5 · 난이도 2칸 · "이봐 신입, 이번 작전은 말이지..."
--   두 테마 모두 '공포' 칸이 없음 → 공포도 1. 테마 이미지는 공식 사이트(11/13 올라옴, 사이트 안에서만 사용).
--   가격·예약 오픈일은 공식 화면에서 아직 확인 못 함 → 비워 둠.
with v(name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url) as (values
  ('박스오피스', '서울이스케이프룸 대구 리틀보이', '코믹', 4::int2, 1::int2, array['코믹','추리','대구'],
   '누가 박스를 옮겼을까?', 60::int2, '2~5', 0, 'https://www.seoul-escape.com/reservation',
   'https://www.seoul-escape.com/storage/episode/2026_11/13/FsY2HcK8fNmbeTjdiYZcov5tDSfrgmBWyi3hs8Et.jpg'),
  ('신스틸러', '서울이스케이프룸 대구 리틀보이', '기타', 2::int2, 1::int2, array['잠입','대구'],
   '이봐 신입, 이번 작전은 말이지...', 60::int2, '2~5', 0, 'https://www.seoul-escape.com/reservation',
   'https://www.seoul-escape.com/storage/episode/2026_11/13/cUih8Hmacm4rcrdvQIrMJ867GJwtcoluAA6Gp1d8.jpg')
),
upd as (
  update public.catalog c set genre=v.genre, difficulty=v.difficulty, fear_level=v.fear_level, tags=v.tags, teaser=v.teaser,
         time_limit=v.time_limit, players=v.players, price=v.price, reservation_url=v.reservation_url, poster_url=v.poster_url
  from v where c.name=v.name and c.cafe=v.cafe returning c.name
)
insert into public.catalog (name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url)
select v.* from v where not exists (select 1 from public.catalog c where c.name=v.name and c.cafe=v.cafe);

select id, name, cafe, genre, difficulty, time_limit, players from public.catalog where cafe like '서울이스케이프룸%' order by cafe, name;
