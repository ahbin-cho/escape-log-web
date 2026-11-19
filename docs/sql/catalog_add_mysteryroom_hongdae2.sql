-- 미스터리룸이스케이프 홍대2호점(서울 마포구 독막로7길 41, 2층) 테마 3개 추가/갱신
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전(있으면 고치고, 없으면 넣는다).
-- 출처: 네이버 예약(매장 공식 예약 페이지) https://booking.naver.com/booking/12/bizes/1006824 (2026-11-19 운영자 캡처 + 페이지 소개글 확인)
--   매장 이름·주소: 예약 페이지의 업체 정보. 테마명·난이도·인원·장르·공포도·시놉시스: 테마별 상세 화면 값 그대로.
--   난이도: '중간' → 3, '약간쉬움' → 2.  공포도: '공포도 없음' → 1(가장 낮음. 0 은 '정보 없음'이라 쓰지 않는다).
--   장르(lib/genre.ts 규칙에 맞춤): 감옥탈출 → 스릴러(+탈옥 태그) · 전쟁,미션 → 모험(전쟁 잠입물이라 '아케이드'보다 모험이 맞다) · 드라마,판타지 → 판타지
--   공식 표기가 없어 비워 둔 것: 제한 시간(0 → 화면에 안 나옴), 1인 가격(예약 페이지엔 10,000~20,000원 범위만 있어 0), 예약 오픈 규칙, 포스터 주소.
--   아직 못 넣은 테마: '쏘우'(매장 소개글에 이름만 있고 상세를 못 봄) → 상세 화면을 확인하면 추가한다.
--   매장 안내: "힌트는 지체없이 무제한 사용 가능"(소개글)

with v(name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url, booking_open) as (values
  ('쇼생크탈출', '미스터리룸이스케이프 홍대2호점', '스릴러', 3::int2, 1::int2, array['감옥탈출','탈옥','활동성 높음','홍대'],
   '앤디는 자신의 억울한 누명과 교도소장의 만연한 비리를 폭로해 달라며 교도소로 잠입해 이 모든 진실을 밝혀 달라고 부탁하게 되는데...',
   0::int2, '2~6', 0, 'https://booking.naver.com/booking/12/bizes/1006824', '', ''::text),
  ('스파이게임1945', '미스터리룸이스케이프 홍대2호점', '모험', 3::int2, 1::int2, array['전쟁','미션','장치방','홍대'],
   '1945년 2차 세계대전, 연합군은 전쟁에서 유리한 고지를 차지하기 위해 독일군으로 위장한 스파이를 보낸다. 과연 그들은 무사히 독일군의 작전 지시서를 탈취해서 돌아올 수 있을까? 꼭.. 살아서 만나자!',
   0::int2, '2~6', 0, 'https://booking.naver.com/booking/12/bizes/1006824', '', ''::text),
  ('THE BOOK - 소설책 속 남자', '미스터리룸이스케이프 홍대2호점', '판타지', 2::int2, 1::int2, array['드라마','판타지','입문','홍대'],
   '20년째 무명작가 생활을 이어온 데오마르스... 자신을 비관하며 마지막으로 자신의 이야기를 소설로 남기고 자살하려 한다. 잘 있거라 세상아... 마지막 마침표를 찍으려는 순간 세상이 멈추고 원고에서 알 수 없는 빛이 흘러 나온다. 책 속으로 빨려 들어가는 데오마르스 소설 속의 이야기는 과연...',
   0::int2, '2~6', 0, 'https://booking.naver.com/booking/12/bizes/1006824', '', ''::text)
),
upd as (
  update public.catalog c set genre=v.genre, difficulty=v.difficulty, fear_level=v.fear_level, tags=v.tags, teaser=v.teaser,
         time_limit=v.time_limit, players=v.players, price=v.price, reservation_url=v.reservation_url, poster_url=v.poster_url,
         booking_open=v.booking_open
  from v where c.name=v.name and c.cafe=v.cafe returning c.name
)
insert into public.catalog (name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url, booking_open)
select v.* from v where not exists (select 1 from public.catalog c where c.name=v.name and c.cafe=v.cafe);

select name, cafe, genre, difficulty, fear_level, time_limit, players from public.catalog where cafe like '미스터리룸이스케이프%';
