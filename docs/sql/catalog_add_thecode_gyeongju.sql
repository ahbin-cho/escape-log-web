-- 더코드 경주점(경상북도 경주시 원효로 122, 2층 · 황오동 340) 테마 4개 추가/갱신
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전(있으면 고치고, 없으면 넣는다).
-- 출처: 공식 사이트 http://thecode02.kr/ 테마 목록·하단 매장 정보 (2026-11-20 운영자 캡처.
--   이 사이트는 http 로만 열려서 이 환경에서는 직접 열어 보지 못했다 → 화면에 보이는 값만 옮겼다)
--   테마명·난이도(level 별 개수)·인원(2~6 person)·줄거리: 테마 목록 화면 글 그대로.
--   화면에 없어서 비워 둔 것: 장르(기타), 공포도(0 = 정보 없음), 제한 시간, 가격, 예약 오픈 규칙, 포스터 주소.
--     → 테마 상세 화면(room_view.php?idx=1~4)을 확인하면 채운다.
--   링크: 예약 주소를 몰라 각 테마의 공식 상세 페이지를 넣었다.
--   매장 안내(사이트 하단): 전화 054-771-9502 · 영업 평일 13:00~22:00 / 주말 12:00~22:00

with v(name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url, booking_open) as (values
  ('몽타주 : 강력1반 #2', '더코드 경주점', '기타', 5::int2, 0::int2, array['THE MONTAGE','경주'],
   '어느 한적한 상가 안 우연히 지나가던 이웃이 발견한 여자는 두 손이 뒤로 묶인 채 눈이 가려져 있었다. 마지막 피해자이자, 유일한 목격자인 그녀. 최면을 통해 그날의 범인을 기억해내라',
   0::int2, '2~6', 0, 'http://thecode02.kr/room/room_view.php?idx=1', '', ''::text),
  ('최부장의 비밀', '더코드 경주점', '기타', 4::int2, 0::int2, array['Director Choi''s secret','경주'],
   '조세 5국 열혈 공무원 황 팀장. 불의를 보면 참지 못하는 그는 뛰어난 직감과 끈질긴 성격을 바탕으로 조세국의 최연소 팀장. 어느 날 익명의 제보자에게 걸어온 전화. 제보자는 믿고 따르는 최 부장의 비리를 고발하는데...',
   0::int2, '2~6', 0, 'http://thecode02.kr/room/room_view.php?idx=2', '', ''::text),
  ('박물관 : 도둑들 #3', '더코드 경주점', '기타', 3::int2, 0::int2, array['The museum - The thieves : chapter 3','경주'],
   '세계 최고의 도둑 "X" 에게 다음 의뢰가 들어왔다. 경주의 한 유적에서 발굴된 아시아 최대의 보물이 경주의 박물관으로 옮겨졌다는 소식. 인터폴에 쫓기는 X와 그를 잡기 위한 인터폴의 수사망... 하지만 X는 보물을 훔치기 위해 박물관에 잠입하게 되는데..',
   0::int2, '2~6', 0, 'http://thecode02.kr/room/room_view.php?idx=3', '', ''::text),
  ('도박꾼 : 마지막 베팅', '더코드 경주점', '기타', 4::int2, 0::int2, array['GAMBLER''S LAST BET','경주'],
   '지극히 평범한 회사원, 그리고 졸업은 앞둔 대학생으로 살고 있는 그들은 수년 전 전국 도박판을 휩쓴 전문도박팀. 2년 전 인천에서의 화투판을 마지막으로 그들은 도박판을 영원히 떠나기로 다 같이 약속한다. 어느 날 걸려온 전화... 연락이 되지 않던 친구가 도박판에 감금됐다는 소식을 전해 듣게 되고 그들은 친구를 구하기 위해 다시 뭉치게 된다.',
   0::int2, '2~6', 0, 'http://thecode02.kr/room/room_view.php?idx=4', '', ''::text)
),
upd as (
  update public.catalog c set genre=v.genre, difficulty=v.difficulty, fear_level=v.fear_level, tags=v.tags, teaser=v.teaser,
         time_limit=v.time_limit, players=v.players, price=v.price, reservation_url=v.reservation_url, poster_url=v.poster_url,
         booking_open=v.booking_open
  from v where c.name=v.name and c.cafe=v.cafe returning c.name
)
insert into public.catalog (name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url, booking_open)
select v.* from v where not exists (select 1 from public.catalog c where c.name=v.name and c.cafe=v.cafe);

select name, cafe, genre, difficulty, fear_level, players from public.catalog where cafe like '더코드%';
