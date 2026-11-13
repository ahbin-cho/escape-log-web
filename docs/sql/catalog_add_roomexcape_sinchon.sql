-- 룸익스케이프 신촌 블랙점(서대문구 연세로4길 6, 3층) 4개 · 신촌 화이트점(서대문구 명물길 66, 2층) 5개 추가/갱신
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전.
-- 출처: 공식 사이트 https://www.ex-cape.com (2026-11-13, 지점 테마 페이지)
--   ⚠️ 이 사이트는 하단에 "허가된 요청 외에 크롤링 등 무단 수집을 금지합니다"라고 적어 두었다.
--      그래서 테마명·난이도·60분·예약 링크(사실 정보)만 넣고, 소개 문구와 포스터는 넣지 않았다. 더 긁어 오지 않는다.
--   난이도는 정수로 올림(4.5 → 5, 3.5 → 4). 장르·공포도·인원은 표기가 없어 '기타'·임시 3·빈칸. 가격은 넣지 않았다(0).

with v(name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url) as (values
  ('냥이점집', '룸익스케이프 신촌 블랙점', '기타', 4::int2, 3::int2, array[]::text[],
   '', 60::int2, '', 0, 'https://www.ex-cape.com/reservation/', ''),
  ('어느 구두쇠의 전시회장', '룸익스케이프 신촌 블랙점', '기타', 3::int2, 3::int2, array[]::text[],
   '', 60::int2, '', 0, 'https://www.ex-cape.com/reservation/', ''),
  ('트레져쉽 : 신화 속의 존재', '룸익스케이프 신촌 블랙점', '기타', 4::int2, 3::int2, array[]::text[],
   '', 60::int2, '', 0, 'https://www.ex-cape.com/reservation/', ''),
  ('에이전트 : 노출된 미션', '룸익스케이프 신촌 블랙점', '기타', 5::int2, 3::int2, array[]::text[],
   '', 60::int2, '', 0, 'https://www.ex-cape.com/reservation/', ''),
  ('대저택 레테 : 잠겨버린 출구', '룸익스케이프 신촌 화이트점', '기타', 4::int2, 3::int2, array[]::text[],
   '', 60::int2, '', 0, 'https://www.ex-cape.com/reservation/', ''),
  ('신비로운 호빗의 집', '룸익스케이프 신촌 화이트점', '기타', 3::int2, 3::int2, array[]::text[],
   '', 60::int2, '', 0, 'https://www.ex-cape.com/reservation/', ''),
  ('23번째 실험연구 : 알비노', '룸익스케이프 신촌 화이트점', '기타', 5::int2, 3::int2, array[]::text[],
   '', 60::int2, '', 0, 'https://www.ex-cape.com/reservation/', ''),
  ('비폴로 17호 : 우주로의 확장', '룸익스케이프 신촌 화이트점', '기타', 3::int2, 3::int2, array[]::text[],
   '', 60::int2, '', 0, 'https://www.ex-cape.com/reservation/', ''),
  ('마카오 : 꼭두각시 광시곡', '룸익스케이프 신촌 화이트점', '기타', 5::int2, 3::int2, array[]::text[],
   '', 60::int2, '', 0, 'https://www.ex-cape.com/reservation/', '')
),
upd as (
  update public.catalog c set genre=v.genre, difficulty=v.difficulty, fear_level=v.fear_level, tags=v.tags, teaser=v.teaser,
         time_limit=v.time_limit, players=v.players, reservation_url=v.reservation_url, poster_url=v.poster_url
  from v where c.name=v.name and c.cafe=v.cafe returning c.name
)
insert into public.catalog (name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url)
select v.* from v where not exists (select 1 from public.catalog c where c.name=v.name and c.cafe=v.cafe);

-- 결과 확인(9줄이 나와야 한다)
select cafe, name, genre, difficulty, fear_level, time_limit, players from public.catalog where cafe like '룸익스케이프 신촌%' order by cafe, name;
