-- 둠이스케이프 4개 지점 테마 15개 추가/갱신
--   1호점(인천 남동구 성말로13번길 15, 4층 402호) 4 · 2호점(인천 남동구 인하로507번길 18, 5층) 4
--   DTH점(부평)(인천 부평구 부평문화로 75, 3·4층) 4 · FEAR점(수원)(수원 팔달구 효원로265번길 20, 2층) 3
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전.
-- 출처: 공식 사이트 https://doomescape.com 테마설명·오시는길 (2026-11-16 확인, robots.txt 전체 허용, 수집 금지 문구 없음)
--   테마명·지점·장르·난이도(별 개수)·플레이시간·소개·해시태그·지점별 예약 링크는 공식 값 그대로.
--   공식 표기가 없는 것: 인원(빈칸), 가격(0), 공포도(장르가 공포면 4, 스릴러·추격·잠입 3, 그 외 1, 장르 '?' 는 임시 3).
--   포스터는 넣지 않았다(사이트에 ALL RIGHT RESERVED 표기 → 조심).
--   장르 묶기: 추격·잠입 → 스릴러, 탈출·'?' → 기타, '추리,판타지'·'추리,멜로' → 추리(원래 표기는 태그에 남김).

with v(name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url) as (values
  ('나폴리탄', '둠이스케이프 1호점', '공포', 4::int2, 4::int2, array['공포', '공포테마', '여행테마', '수칙']::text[],
   '당신은 이탈리아로 여행을 가게 되었습니다.
여행 가기 전에 평점은 없지만, 가격이 저렴하고 유래 깊은 곳이라 하여,
나폴리 호텔로 예약하게 되는데...', 70::int2, '', 0, 'https://doomescape.com/layout/res/home.php?go=rev.make&s_zizum=1', ''),
  ('Rendering', '둠이스케이프 1호점', '추리', 5::int2, 1::int2, array['추리', '판타지']::text[],
   '먼 미래 2037년, 당신은 프로파일러 "이혁"입니다.
당신은 DTH의 신입사원!!
DTH는 게임회사에서 시작되어서 현재는 각종 범죄사건 및 미제사건을 높은 기술로 해결해주는 회사입니다.
평소 정의감의 넘치는 당신은 자신의 낮은 직급으로 인한 높은 등급의 사건을 수사를 하지 못하였는데
그러던중 우연찮게 선배인 안승재의 사원증을 손에 넣게 되고 당신은 곧바로 렌더링실로 향하게 되는데...', 65::int2, '', 0, 'https://doomescape.com/layout/res/home.php?go=rev.make&s_zizum=1', ''),
  ('기담정', '둠이스케이프 1호점', '감성', 4::int2, 1::int2, array['감성']::text[],
   '당신은 어머니 기일을 맞아 고향집으로 향했다.
하나뿐인 여동생을 오랜만에 만나 반가운 마음에 술을 마시며 이런저런 이야기를 나누는데,
한참술을 마시다 잠시 한눈 판 사이 술에 취한 동생이 말도 없이 집을 나간것을 발견했다.
밖으로 나간 당신은 멀리 비틀거리며 도로 한가운데까지 걸어간 동생의 모습과 자동차가 그녀를 향해달려오는 모습을 보고 위급한 상황에 앞뒤 가릴 새 없이 무작정 도로로 뛰어들었다.
순식간에 자동차의 불빛과 경적소리가 당신을 덮치고...', 70::int2, '', 0, 'https://doomescape.com/layout/res/home.php?go=rev.make&s_zizum=1', ''),
  ('인앤아웃', '둠이스케이프 1호점', '판타지', 3::int2, 1::int2, array['판타지']::text[],
   '언제나 게임에 몰입하는 것을 좋아하는 김경구.
그는 평소처럼 자신의 방에서 게임을 하던 중
한 통의 전화를 받게 되는데..', 65::int2, '', 0, 'https://doomescape.com/layout/res/home.php?go=rev.make&s_zizum=1', ''),
  ('운명', '둠이스케이프 2호점', '추리', 4::int2, 1::int2, array['추리', '멜로']::text[],
   '정말 운명처럼 다가온 그 사람.
두근거려 미치겠어, 바보같이 가만히 있으면 떠날지도 몰라….
김사랑과 마도석의 따뜻하고 설레는 사랑이야기,
당신에겐 아직 두근거림이 있나요?', 70::int2, '', 0, 'https://doomescape.com/layout/res/home.php?go=rev.make&s_zizum=2', ''),
  ('디스토피아', '둠이스케이프 2호점', '공포', 4::int2, 4::int2, array['공포']::text[],
   '기분 나쁜 꿈을 꾸고 잠에서 깨어난 신인가수 애슐리.
평소와 다른 대기실…
그러나 내 꿈을 위해서라면!
하지만 애슐리 앞에 엄청난 공포가 닥치는데….', 70::int2, '', 0, 'https://doomescape.com/layout/res/home.php?go=rev.make&s_zizum=2', ''),
  ('죄', '둠이스케이프 2호점', '스릴러', 4::int2, 3::int2, array['추격']::text[],
   '평범한 경찰이었던 강무열은 어떤 비극적인 사건으로 소중한 친구를 잃게 되고,
그 사건을 계기로 직업에 회의감을 느낀 강무열은 경찰 일을 그만 둔다.
사건으로부터 4년 뒤, 강무열은 경찰을 그만 둔 동시에 시작한 사업이 크게 성공해 부와 명예를 쌓게 된다.
그러던 어느날,
병원으로부터 의문의 전화 한 통이 걸려오는데….', 70::int2, '', 0, 'https://doomescape.com/layout/res/home.php?go=rev.make&s_zizum=2', ''),
  ('인바이트', '둠이스케이프 2호점', '기타', 4::int2, 3::int2, array['엔딩']::text[],
   '당신은 모든 기억을 잃은 채 눈을 떴습니다.
이곳이 어딘지, 내가 누구인지도 기억나지 않습니다.
그저 손에 익숙한 듯한 낯선 초대장만 쥐고 어느 문 앞에 서있을 뿐이죠.
눈앞의 문을 열면 모든 선택은 오롯이 당신의 몫입니다.
어떤 진실을 보게 되어도 그 선택을 후회하지 마십시오.', 70::int2, '', 0, 'https://doomescape.com/layout/res/home.php?go=rev.make&s_zizum=2', ''),
  ('슬래셔', '둠이스케이프 DTH점(부평)', '공포', 5::int2, 4::int2, array['공포', '초대형', '몰입감']::text[],
   '박철민의 뇌세포를 찾은 이혁.
의문점을 가지고 뇌세포를 조작한 곳을 찾아가게 되는데….', 100::int2, '', 0, 'https://doomescape.com/layout/res/home.php?go=rev.make&s_zizum=3', ''),
  ('트리거', '둠이스케이프 DTH점(부평)', '기타', 3::int2, 1::int2, array['탈출', '트리거', '슬래셔', '렌더링시리즈3편']::text[],
   '위험에 처한 이혁은 누군가로 인해 고통에서 깨어난다.
그들은 스스로를 ''반디''라 칭하는데…….', 65::int2, '', 0, 'https://doomescape.com/layout/res/home.php?go=rev.make&s_zizum=3', ''),
  ('언리얼', '둠이스케이프 DTH점(부평)', '스릴러', 4::int2, 3::int2, array['잠입', '마지막테마', '렌더링시리즈']::text[],
   '모든 것을 올바르게 바꾸기 위해
이혁과 안승재는 회사에 잠입하는데……', 80::int2, '', 0, 'https://doomescape.com/layout/res/home.php?go=rev.make&s_zizum=3', ''),
  ('스네어', '둠이스케이프 DTH점(부평)', '스릴러', 3::int2, 3::int2, array['스릴러', '미스터리']::text[],
   'MEMORABLE GALLERY,
당신께 잊지 못할 순간을 선물합니다.', 65::int2, '', 0, 'https://doomescape.com/layout/res/home.php?go=rev.make&s_zizum=3', ''),
  ('데이투어', '둠이스케이프 FEAR점(수원)', '공포', 4::int2, 4::int2, array['공포']::text[],
   '캄보디아 전통가옥 보파의 집으로 투어를 신청 하셨습니다.', 70::int2, '', 0, 'https://doomescape.com/layout/res/home.php?go=rev.make&s_zizum=4', ''),
  ('옵스큐라', '둠이스케이프 FEAR점(수원)', '공포', 2::int2, 4::int2, array['공포']::text[],
   '평소에 음흉한 취미를 수집하는 정현,
오늘도 그 목표를 얻으려고 거래를 하려 하는데..', 70::int2, '', 0, 'https://doomescape.com/layout/res/home.php?go=rev.make&s_zizum=4', ''),
  ('허수아비', '둠이스케이프 FEAR점(수원)', '공포', 4::int2, 4::int2, array['공포', '미국공포', '허수아비']::text[],
   '미국 서부 어느 지역
차를 타고 이동 중에.. 옥수수밭 근처에서 사고가 나고 마는데..', 70::int2, '', 0, 'https://doomescape.com/layout/res/home.php?go=rev.make&s_zizum=4', '')
),
upd as (
  update public.catalog c set genre=v.genre, difficulty=v.difficulty, fear_level=v.fear_level, tags=v.tags, teaser=v.teaser,
         time_limit=v.time_limit, reservation_url=v.reservation_url
  from v where c.name=v.name and c.cafe=v.cafe returning c.name
)
insert into public.catalog (name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url)
select v.* from v where not exists (select 1 from public.catalog c where c.name=v.name and c.cafe=v.cafe);

-- 결과 확인(15줄이 나와야 한다)
select cafe, name, genre, difficulty, fear_level, time_limit from public.catalog where cafe like '둠이스케이프%' order by cafe, name;
