-- 플레이33(PLAY33, 미스터리 주식회사) 테마 10개 — 공식 사이트 테마 페이지에서 2026-11-14 확인
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전.
-- 출처: https://play33.kr/theme (지점·장르·인원·시간·공포·난이도 칸 수), 지점 주소는 https://play33.kr/map?branch=N 에서 지점별로 확인
--   1 건대점: 서울 광진구 자양동 13-3 B1 / 4 홍대점: 서울 마포구 와우산로21길 36-8 3층 / 5 대전점: 대전 중구 중앙로164번길 17 B1
--   7 수원점: 경기 수원시 팔달구 인계로138번길 36 2층 / 8 '티켓투'(마포구 와우산로29가길): 테마 목록이 비어 있어 넣지 않음, 6 '테스트'는 시험용이라 제외
-- 공포·난이도: 공식 값이 0.5 단위라 반올림(공포 0 은 1로). 장르는 공식 장르의 첫 번째를 우리 분류로, 원래 장르는 태그에.
-- 가격·예약 오픈일: 공식 화면에 안 보임 → 비워 둠(price 0). 포스터: 공식 사이트 이미지(사이트 안에서만 사용).
with v(name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url) as (values
  ('다이얼', '플레이33 건대점', '공포', 3::int2, 2::int2, array['공포','스릴러','건대'],
   '스마일~ 행복을 드리는 스마일 콜센터! 김미영입니다. 무엇을 도와드릴까요?', 60::int2, '2~5', 0, 'https://play33.kr/reservation?branch=1&theme=45#list',
   'https://play33.kr/storage/theme/2026_10/05/1Sgkkz5R3QN76qTkw2obU60FapDrje245xwI6Xf2.png'),
  ('그날', '플레이33 건대점', '공포', 2::int2, 1::int2, array['공포','드라마','건대'],
   '나는... 그 날 이후. 뜬 눈으로 며칠을 지새웠다.', 60::int2, '2~4', 0, 'https://play33.kr/reservation?branch=1&theme=46#list',
   'https://play33.kr/storage/theme/2026_10/05/w7dxL33WlckFbZPAiIoDpchM5bSx1g3ZRoyIdygH.png'),
  ('목격자', '플레이33 건대점', '스릴러', 2::int2, 1::int2, array['드라마','스릴러','건대'],
   '"모든 사건은 그것을 목격한 자에 의해 기록된다."', 65::int2, '2~4', 0, 'https://play33.kr/reservation?branch=1&theme=47#list',
   'https://play33.kr/storage/theme/2026_10/05/6z9IxVqd7zGyg9AeAzOWJz9ANGFswxb7OsjZnknY.jpg'),
  ('우울해서 빵 샀어', '플레이33 대전점', '감성', 3::int2, 1::int2, array['감성','드라마','대전'],
   '퇴근길, 엄마에게서 한 통의 문자가 도착했다. "아들~ 엄마... 우울해서 빵 샀어."', 60::int2, '2~4', 0, 'https://play33.kr/reservation?branch=5&theme=44#list',
   'https://play33.kr/storage/theme/2026_10/02/qt7A0NgCz9iyyh5cZWcPXjdmmEotbP7Hjtmt59oV.jpg'),
  ('자각몽(自覺夢)', '플레이33 대전점', '스릴러', 4::int2, 2::int2, array['스릴러','대전'],
   '"You dreamed me. I own you."', 60::int2, '2~3', 0, 'https://play33.kr/reservation?branch=5&theme=43#list',
   'https://play33.kr/storage/theme/2026_10/02/G1E3nZZcA0o4b5MeWWarhvZ6UFjqJC61lZ683E7m.jpg'),
  ('I am Still Here, ELLEN', '플레이33 대전점', '공포', 4::int2, 3::int2, array['공포','드라마','대전'],
   '오랜만이야, 엘렌.', 70::int2, '2~4', 0, 'https://play33.kr/reservation?branch=5&theme=39#list',
   'https://play33.kr/storage/theme/2026_09/02/mD01cANOMsmTB1GNfDGOTI3zsoIb2S4jh8UkC2DN.jpg'),
  ('기억 : 끝나지 않을 꿈', '플레이33 수원점', '공포', 2::int2, 2::int2, array['공포','드라마','수원'],
   '"잊고 있던 기억의 끝에서 네가 기다리고 있었다."', 60::int2, '2~6', 0, 'https://play33.kr/reservation?branch=7&theme=40#list',
   'https://play33.kr/storage/theme/2026_08/31/Ed9RifmKCINrkCWSDuPt1V5d6D6J9rhnl6lkReA9.png'),
  ('강천여자고등학교', '플레이33 대전점', '공포', 3::int2, 4::int2, array['공포','대전'],
   '"있잖아 쿄코, 이번 시험 같이 보지 않을래?"', 60::int2, '2~4', 0, 'https://play33.kr/reservation?branch=5&theme=31#list',
   'https://play33.kr/storage/theme/2026_07/02/3ltkfWs9YAye96IkbJkOlYPPr8FtfZgz3NIWcjgq.png'),
  ('좌충우돌 꼬마마법사', '플레이33 대전점', '판타지', 2::int2, 1::int2, array['판타지','대전'],
   '마법을 쓸 수 없는 단 한 명의 아이, 그리고 그 아이를 위해 움직인 작은 용기들이 어떤 기적을 만들어낼지....', 60::int2, '2~6', 0, 'https://play33.kr/reservation?branch=5&theme=33#list',
   'https://play33.kr/storage/theme/2026_07/02/cjgbsZ0DKYFSK01Ai2bBt57KE0sixJ8DvI5vrGOk.jpg'),
  ('피안화', '플레이33 홍대점', '공포', 2::int2, 4::int2, array['공포','홍대'],
   '10월 5일, 타다시노미야 마을에 짙은 어둠이 내려오는 날. 나는 스스로, 그 악몽을 향해 걸어 들어간다.', 70::int2, '2~4', 0, 'https://play33.kr/reservation?branch=4&theme=26#list',
   'https://play33.kr/storage/theme/2026_04/08/zLbaL5XoQXS0iPpYNjAdvI1UDIjCAICv9Vkx1VmE.jpg')
),
upd as (
  update public.catalog c set genre=v.genre, difficulty=v.difficulty, fear_level=v.fear_level, tags=v.tags, teaser=v.teaser,
         time_limit=v.time_limit, players=v.players, reservation_url=v.reservation_url, poster_url=v.poster_url
  from v where c.name=v.name and c.cafe=v.cafe returning c.name
)
insert into public.catalog (name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url)
select v.* from v where not exists (select 1 from public.catalog c where c.name=v.name and c.cafe=v.cafe);

select id, name, cafe, genre, difficulty, fear_level, time_limit, players from public.catalog where cafe like '플레이33%' order by cafe, name;
