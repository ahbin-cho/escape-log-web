-- 파노라마 방탈출 테마 추가/갱신 (부산점 1개 + 홍대삼거리점 1개)
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전(있으면 고치고, 없으면 넣는다).
-- 출처: 각 지점 네이버 예약 테마 안내·유의사항 (2026-11-13 확인)
--   부산점(부산 남구 용소로14번길 9 지하1층) https://m.booking.naver.com/booking/12/bizes/1481465
--     미래재난리포트: 난이도 ★★☆☆☆, 장르 아케이드, 60분, 권장 2인 이상, 2인 44,000원(1인 22,000원, 플레이스 가격과 같음), 추가 인원 현장 결제
--   홍대삼거리점(서울 마포구 와우산로 77, 2층) https://m.booking.naver.com/booking/12/bizes/1515624
--     Puppet Play: 난이도 3, 장르 다크/판타지, 70분, 적정 2~4인
--     요금: 네이버 플레이스 가격 1인 30,000원(평일 첫·두 번째 타임 27,000원) https://m.place.naver.com/place/2035168181/home
--     예약은 6일 뒤 날짜가 매일 00시에 열림(공지: 9월 30일 예약은 9월 24일 00시 오픈)
--   공포도는 두 곳 다 공식 표기가 없어 임시값(미래재난리포트 1, 퍼펫 플레이 2). 알게 되면 고칠 것.
--   포스터는 메이플과 같은 방식으로 네이버 예약의 공식 테마 이미지 주소를 연결(사이트 테마 페이지용, 인스타 카드에는 안 씀)
-- 홍대입구점(룰더데이, Combo)은 장르·난이도·공포도가 공식으로 없어 맨 아래에 실행 안 되는 형태로만 준비해 둠.

with v(name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url, booking_open) as (values
  ('미래재난리포트', '파노라마 부산점', '아케이드', 2::int2, 1::int2, array['아케이드','입문','부산'],
   'SYSTEM : [파랑]의 메세지가 도착하였습니다. [나비]의 [날갯짓]이 관측되었습니다. 감지된 파동의 위험도 측정중... CODE : [ RED ] / 재난 발생 확률 [ 98.72% ]. 전 요원은 신속히 대응 프로토콜을 실행하십시오.',
   60::int2, '2~6', 22000, 'https://m.booking.naver.com/booking/12/bizes/1481465/items/7022523', 'https://naverbooking-phinf.pstatic.net/20250827_15/17562607254271YxW2_PNG/%C8%AD%B8%E9_%C4%B8%C3%B3_2025-08-25_174831.png', ''),
  ('Puppet Play (퍼펫 플레이)', '파노라마 홍대삼거리점', '판타지', 3::int2, 2::int2, array['다크','판타지','홍대'],
   '퍼펫 플레이에서 마지막 공연이 시작됩니다..',
   70::int2, '2~4', 30000, 'https://m.booking.naver.com/booking/12/bizes/1515624/items/7127177', 'https://naverbooking-phinf.pstatic.net/20251014_140/1760419414858SL0rO_PNG/%C4%B8%C3%B3.PNG', '6일 전 00시')
),
upd as (
  update public.catalog c set genre=v.genre, difficulty=v.difficulty, fear_level=v.fear_level, tags=v.tags, teaser=v.teaser,
         time_limit=v.time_limit, players=v.players, price=v.price, reservation_url=v.reservation_url, poster_url=v.poster_url,
         booking_open=v.booking_open
  from v where c.name=v.name and c.cafe=v.cafe returning c.name
)
insert into public.catalog (name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url, booking_open)
select v.* from v where not exists (select 1 from public.catalog c where c.name=v.name and c.cafe=v.cafe);

select name, cafe, genre, difficulty, fear_level, time_limit, players, price from public.catalog where cafe like '파노라마%';

-- ─────────────────────────────────────────────────────────────
-- 홍대입구점(서울 마포구 양화로18길 12, 3층) — 아직 실행하지 말 것
-- 네이버 예약에서 확인된 것(2026-11-13): 이름·소개 문구·이용 시간·요금(2인 예약금 기준)·포스터, Combo 추천 2~3인
--   룰더데이 https://m.booking.naver.com/booking/12/bizes/1628384/items/7566410  1시간 5분, 2인 56,000원(1인 28,000원)
--   Combo     https://m.booking.naver.com/booking/12/bizes/1628384/items/8070680  1시간, 2인 48,000원(1인 24,000원)
-- 확인 안 된 것: 장르·난이도·공포도 → 매장 인스타(@panorama_escape) 공지 등에서 확인되면
--   아래 ?? 를 채우고 맨 앞의 -- 를 지운 뒤 실행.
-- insert into public.catalog (name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url)
-- select v.* from (values
--   ('룰더데이', '파노라마 홍대입구점', '??', ??::int2, ??::int2, array['홍대'],
--    '세상은 규칙으로 이루어져 있다. 규칙은 절대적이며, 반드시 지켜져야 한다. (Combo와 세계관을 공유하는 테마)',
--    65::int2, '', 28000, 'https://m.booking.naver.com/booking/12/bizes/1628384/items/7566410',
--    'https://naverbooking-phinf.pstatic.net/20260403_244/1775153770106yWKrP_PNG/image.png'),
--   ('Combo', '파노라마 홍대입구점', '??', ??::int2, ??::int2, array['홍대'],
--    '신작 게임 팩 Combo 절찬리 판매 중! 최고 점수를 노려보세요. (룰더데이와 세계관을 공유하는 테마)',
--    60::int2, '2~3', 24000, 'https://m.booking.naver.com/booking/12/bizes/1628384/items/8070680',
--    'https://naverbooking-phinf.pstatic.net/20260917_185/1789619015799KaiPO_PNG/image.png')
-- ) as v(name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url)
-- where not exists (select 1 from public.catalog c where c.name = v.name and c.cafe = v.cafe);
