-- UMEPLAY 홍대(인세인 홍대 이머시브 시네마, 서울 마포구 독막로7길 23 지하1층) 작품 추가/갱신
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전.
-- 출처: 공식 사이트 https://www.umeplay.kr (사이트가 불러오는 공식 데이터 /api/data?type=theme, 2026-11-13 확인)
--   장르 표기 "연극 · 이머시브시네마", 1인~6인(혼자 가능), 75분, 난이도 5, 출연 배우 명단 공개(/api/cast) → '이머시브'+'이머시브연극'
--   소개 문구는 공식 문구 그대로. 장르는 '수사관이 되어 사건의 진실을 밝힌다' → 추리.
--   공포도: 공식 표기 없음 → 임시 1. 가격: 공식 데이터에 115,000→69,000 이 있으나 1인/팀 단위가 안 적혀 있어 0(화면에 안 나옴).
--   포스터: 공식 이미지가 비공개 저장소 주소라 넣지 않음(우리 표지로 나옴).
--   다음 작품 REVIVER 는 예약이 열리면 넣는다.

with v(name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url) as (values
  ('인세인 INSANE', 'UMEPLAY 홍대', '추리', 5::int2, 1::int2, array['추리','이머시브','이머시브연극','홍대'],
   '살인사건이 일어난 모닝가 46번지 아파트. 공판을 앞둔 사건의 진실을 밝히기 위해 당신은 수사관이 된다.',
   75::int2, '1~6', 0, 'https://booking.naver.com/booking/12/bizes/1661745/items/7713929', '')
),
upd as (
  update public.catalog c set genre=v.genre, difficulty=v.difficulty, fear_level=v.fear_level, tags=v.tags, teaser=v.teaser,
         time_limit=v.time_limit, players=v.players, price=v.price, reservation_url=v.reservation_url, poster_url=v.poster_url
  from v where c.name=v.name and c.cafe=v.cafe returning c.name
)
insert into public.catalog (name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url)
select v.* from v where not exists (select 1 from public.catalog c where c.name=v.name and c.cafe=v.cafe);

select id, name, cafe, tags from public.catalog where cafe like 'UMEPLAY%';
