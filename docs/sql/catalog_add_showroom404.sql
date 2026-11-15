-- 쇼룸404(SHOWROOM404, 홍대) 테마 4개 — 공식 사이트에서 2026-11-15 확인
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전.
-- 출처: https://showroom404.com/themes/ (난이도·추천인원·공포·장르·시간·소개 문구), https://showroom404.com/faqs/ (가격·나이 제한)
--   주소: 서울 마포구 잔다리로 5-1 5층 / 전화 02-323-1314 / 인스타 @showroom.404
-- 공포: 공식 표에 공포 칸이 비어 있는 테마(블랙홀·꼬치 진다)는 우리 최솟값 1로.
-- 가격: FAQ 에 적힌 것만(블랙홀·꼬치 진다 24,000 / PIG 29,000). 한라아파트 4동 404호는 가격이 안 적혀 있어 0.
-- 나이 제한(태그에 표시): PIG = 고등학생 미만 이용 불가, 꼬치 진다 = 19세 미만 이용 불가.
-- 포스터: 공식 사이트 이미지(사이트 안에서만 사용).
with v(name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url) as (values
  ('한라아파트 4동 404호', '쇼룸404 홍대점', '공포', 2::int2, 2::int2, array['공포','홍대'],
   '과연 귀신이 나온다는 소문이 진짜 일까?', 60::int2, '2~6', 0, 'https://showroom404.com/booking/',
   'https://showroom404.com/wp-content/uploads/2025/06/showroom404-hongdae-escape-room-halla-apt-block-4-unit-404-한라아파트-4동-404호.png.webp'),
  ('PIG', '쇼룸404 홍대점', '스릴러', 2::int2, 4::int2, array['스릴러','추격','고등학생 미만 불가','홍대'],
   '심야괴담 오늘의 이야기는 ‘비 내리는 밤, 미이산 연쇄실종사건’입니다.', 60::int2, '3~6', 29000, 'https://showroom404.com/booking/',
   'https://showroom404.com/wp-content/uploads/2025/06/showroom404-hongdae-escape-room-game-pig.png.webp'),
  ('블랙홀', '쇼룸404 홍대점', '코믹', 3::int2, 1::int2, array['B급 코믹','홍대'],
   '이수 : 피방 고? 현석 : ㅇㅇ', 60::int2, '2~6', 24000, 'https://showroom404.com/booking/',
   'https://showroom404.com/wp-content/uploads/2025/06/showroom404-hongdae-escape-room-game-black-holes-블랙홀.jpg.webp'),
  ('꼬치 진다', '쇼룸404 홍대점', '기타', 4::int2, 1::int2, array['19금','19세 미만 불가','홍대'],
   '19세 미만의 참가자는 이용할 수 없습니다. 극적인 몰입과 강렬한 감정을 위해 기획된 성인 관객용 테마.', 60::int2, '2~6', 24000, 'https://showroom404.com/booking/',
   'https://showroom404.com/wp-content/uploads/2025/06/showroom404-hongdae-escape-room-dick-loses-꼬치진다.png.webp')
),
upd as (
  update public.catalog c set genre=v.genre, difficulty=v.difficulty, fear_level=v.fear_level, tags=v.tags, teaser=v.teaser,
         time_limit=v.time_limit, players=v.players, price=v.price, reservation_url=v.reservation_url, poster_url=v.poster_url
  from v where c.name=v.name and c.cafe=v.cafe returning c.name
)
insert into public.catalog (name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url)
select v.* from v where not exists (select 1 from public.catalog c where c.name=v.name and c.cafe=v.cafe);

select id, name, cafe, genre, difficulty, fear_level, time_limit, players, price from public.catalog where cafe like '쇼룸404%' order by name;
