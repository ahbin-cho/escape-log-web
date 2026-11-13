-- 메이플스토리 이스케이프(서울 마포구 와우산로 90, 홍익대 정문 앞) 테마 5개 추가/갱신
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전(있으면 공식 정보로 고치고, 없으면 넣는다).
-- 출처: 공식 사이트 https://maplestoryescape.com (2026-11-13 확인)
--   테마 소개 문구·장르·난이도·공포도·60분·예약 링크, 최소 인원 변경 공지(2026-10-19 부터 커닝시티 2인, 나머지 3인)
--   요금 1인 29,000원은 넥슨 발표 기사 기준
--   포스터는 다른 테마와 같은 방식으로 공식 사이트 이미지 주소를 연결(사이트 테마 페이지·달력용)

with v(name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url) as (values
  ('커닝시티, 사라진 사람들', '메이플스토리 이스케이프 홍대점', '스릴러', 2::int2, 2::int2, array['스릴러','메이플스토리'],
   '사라진 주민들, 그리고 커닝시티 곳곳에서 발생하는 이상현상.', 60::int2, '2~6', 29000, 'https://ticket.yes24.com/Perf/60007', 'https://maplestoryescape.com/images/theme/a7f3c9d8.jpg'),
  ('도전! 무릉도장!', '메이플스토리 이스케이프 홍대점', '아케이드', 4::int2, 1::int2, array['아케이드','메이플스토리'],
   '무릉도장에 도전할 용기가 있는 자는 나를 찾아오시오.', 60::int2, '3~6', 29000, 'https://ticket.yes24.com/Perf/60078', 'https://maplestoryescape.com/images/theme/d28b4f96.jpg'),
  ('헌티드 맨션으로 초대합니다', '메이플스토리 이스케이프 홍대점', '추리', 2::int2, 2::int2, array['미스터리','메이플스토리'],
   '요즘... 이곳을 찾는 용사분들이 헌티드 맨션 안에서 자꾸 사라지고 있어요. 혹시 이 편지를 보신다면 맨션을 조사하러 와주실 수 있나요?', 60::int2, '3~6', 29000, 'https://ticket.yes24.com/Perf/60080', 'https://maplestoryescape.com/images/theme/7e91c4a6.jpg'),
  ('에델슈타인 더 비기닝', '메이플스토리 이스케이프 홍대점', '모험', 3::int2, 1::int2, array['잠입','메이플스토리'],
   '에델슈타인의 사람들이 하나씩 실종되고 있다는 소문이 들려온다. 이 마을엔 대체 어떤 사건이 일어나고 있는걸까...', 60::int2, '3~6', 29000, 'https://ticket.yes24.com/Perf/60081', 'https://maplestoryescape.com/images/theme/c5a84e19.jpg'),
  ('뒤죽박죽 루디브리엄', '메이플스토리 이스케이프 홍대점', '아케이드', 3::int2, 1::int2, array['협동','메이플스토리'],
   '루디브리엄에 비상 상황이 발생했습니다. 믿을 수 있는 동료들과 힘을 합하여 루디브리엄을 구해주세요!', 60::int2, '3~6', 29000, 'https://ticket.yes24.com/Perf/60082', 'https://maplestoryescape.com/images/theme/91f6d3b8.jpg')
),
upd as (
  update public.catalog c set genre=v.genre, difficulty=v.difficulty, fear_level=v.fear_level, tags=v.tags, teaser=v.teaser,
         time_limit=v.time_limit, players=v.players, price=v.price, reservation_url=v.reservation_url, poster_url=v.poster_url
  from v where c.name=v.name and c.cafe=v.cafe returning c.name
)
insert into public.catalog (name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url)
select v.* from v where not exists (select 1 from public.catalog c where c.name=v.name and c.cafe=v.cafe);

-- 공식 공포도가 '없음(0)'인 테마는 우리 칸이 1~5라 1로 넣었다.
select name, genre, difficulty, fear_level, time_limit, players, poster_url from public.catalog where cafe like '메이플스토리 이스케이프%';
