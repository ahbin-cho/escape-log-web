-- UMEPLAY 두 번째 작품 REVIVER(리바이벌) 추가
-- 출처: 공식 umeplay.kr 사이트 데이터(공포 · 이머시브시네마 · 75분 · 배역 데이비드·맥스·미아·YAL, 2026-11-14 확인)
--       + 네이버 플레이스 업체 소개 "UMEPLAY KOREA 이머시브시네마 <REVIVER> 그 두 번째 기록." · 네이버 예약(2관)
--   인원·가격은 공식 표기 '미정'/없음 → 비워 둠. 공포도 공식 수치 없음 → 임시 3.
with v(name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url) as (values
  ('리바이벌 REVIVER', 'UMEPLAY 홍대 2관', '공포', 3::int2, 3::int2, array['공포','이머시브','이머시브연극','홍대'],
   'UMEPLAY KOREA 이머시브시네마 <REVIVER> 그 두 번째 기록. 배우와 함께 영화 속 인물이 되는 공포 이머시브 시네마.',
   75::int2, '', 0, 'https://booking.naver.com/booking/12/bizes/1752702', '')
),
upd as (
  update public.catalog c set genre=v.genre, difficulty=v.difficulty, fear_level=v.fear_level, tags=v.tags, teaser=v.teaser,
         time_limit=v.time_limit, players=v.players, price=v.price, reservation_url=v.reservation_url, poster_url=v.poster_url
  from v where c.name=v.name and c.cafe=v.cafe returning c.name
)
insert into public.catalog (name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url)
select v.* from v where not exists (select 1 from public.catalog c where c.name=v.name and c.cafe=v.cafe);
select id, name, cafe from public.catalog where cafe like 'UMEPLAY%';
