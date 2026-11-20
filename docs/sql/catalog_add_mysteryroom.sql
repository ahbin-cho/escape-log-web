-- 미스터리룸이스케이프 강남점(테마 5개) · 홍대2호점(테마 3개) 추가/갱신
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전(있으면 고치고, 없으면 넣는다).
--
-- [강남점] 출처: 공식 사이트 http://www.mysteryroomescape-gn.com/theme/theme.html (2026-11-19 운영자가 글을 복사해 주고 포스터를 캡처해 줌.
--   이 환경에서는 사이트가 열리지 않아 직접 열어 보지는 못했다)
--   테마명·줄거리: 테마 페이지 글 그대로(줄바꿈만 띄어쓰기로). 장르·공포지수·장치 구성: 포스터 표기.
--   난이도·추천인원: 페이지 글과 포스터가 다른 테마가 있다 → 페이지 글을 따랐다.
--     인형괴담 인원(글 2~4 / 포스터 2-6) · 개인병원의 비밀 난이도(글 4 / 포스터 5) · 소서러 난이도(글 3 / 포스터 4)·인원(글 2~4 / 포스터 2-6) · 사라진 왕관 인원(글 2~4 / 포스터 2-6)
--   장르(lib/genre.ts 규칙): 공포/미스터리 → 공포 · 미스터리/스릴러 → 스릴러 · 추리/스릴러 → 추리 · 판타지 → 판타지
--   예약: 테마마다 같은 주소(reservation.html?a=27). 공식 표기가 없어 비워 둔 것: 제한 시간, 가격, 예약 오픈 규칙, 포스터 주소, 지점 주소.
--   인형괴담·소서러는 "테마 진행시 나레이션이 나오는 테마"(공식 안내) → 태그 '나레이션'.
--
-- [홍대2호점] (서울 마포구 독막로7길 41, 2층)
-- 출처: 네이버 예약(매장 공식 예약 페이지) https://booking.naver.com/booking/12/bizes/1006824 (2026-11-19 운영자 캡처 + 페이지 소개글 확인)
--   매장 이름·주소: 예약 페이지의 업체 정보. 테마명·난이도·인원·장르·공포도·시놉시스: 테마별 상세 화면 값 그대로.
--   난이도: '중간' → 3, '약간쉬움' → 2.  공포도: '공포도 없음' → 1(가장 낮음. 0 은 '정보 없음'이라 쓰지 않는다).
--   장르(lib/genre.ts 규칙에 맞춤): 감옥탈출 → 스릴러(+탈옥 태그) · 전쟁,미션 → 모험(전쟁 잠입물이라 '아케이드'보다 모험이 맞다) · 드라마,판타지 → 판타지
--   공식 표기가 없어 비워 둔 것: 제한 시간(0 → 화면에 안 나옴), 1인 가격(예약 페이지엔 10,000~20,000원 범위만 있어 0), 예약 오픈 규칙, 포스터 주소.
--   아직 못 넣은 테마: '쏘우'(매장 소개글에 이름만 있고 상세를 못 봄) → 상세 화면을 확인하면 추가한다.
--   매장 안내: "힌트는 지체없이 무제한 사용 가능"(소개글)

with v(name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url, booking_open) as (values
  ('인형괴담', '미스터리룸이스케이프 강남점', '공포', 3::int2, 5::int2, array['공포','미스터리','나레이션','기계장치 90%','강남'],
   '늦은 밤 술에 취해 집에 가던 길, 우연히 멀리 아파트 창문에서 누군가 투신자살하는 장면을 목격하게 된다. 호기심에 끌려 가보니 시체는 안 보이고, 귀여운 여자아이 한 명이 울고 있었다. 아끼는 인형을 잃어버렸다며 인형을 찾아달라 떼를 쓰는 아이 아이가 너무 예쁘기도, 안쓰럽기도 해 인형을 찾는 것을 도와주기로 하는데, 그렇게 여자아이를 따라가다 보니 어느새 좁고 어두운 아파트 복도 음침한 기운에 술에깨어 정신을 차려보니 아이는 사라져 버리고.....',
   0::int2, '2~4', 0, 'http://www.mysteryroomescape-gn.com/reservation/reservation.html?a=27', '', ''::text),
  ('개인병원의 비밀', '미스터리룸이스케이프 강남점', '스릴러', 4::int2, 2::int2, array['미스터리','스릴러','기계장치 85%','강남'],
   '음침한 소나기가 내리는 어느 날, 비를 피해서 들어간 곳은 문을 닫은지 오래돼 보이는 작은 개인병원이였다. 이리저리 병원 내부를 둘러보다 원장실을 발견하고 들어서는 순간, 쾅!!!!! 하는 소리를 내며 문이 굳게 닫혀 버렸다. 당황하며 살펴보던 순간 가만.. 이것은..?',
   0::int2, '2~6', 0, 'http://www.mysteryroomescape-gn.com/reservation/reservation.html?a=27', '', ''::text),
  ('영혼의 편지', '미스터리룸이스케이프 강남점', '추리', 4::int2, 2::int2, array['추리','스릴러','기계장치 80%','강남'],
   '책상에 놓여진 의문의 편지 한통 그 편지는 친구 스티븐이 보낸 편지였다. 자신이 살해를 당했으니 범인을 찾아서, 억울함을 풀어달라는 내용의 영혼의 편지였다. 그의 개인 사무실로 찾아가 무슨 일이 일어난건지 알아봐야겠다.',
   0::int2, '2~6', 0, 'http://www.mysteryroomescape-gn.com/reservation/reservation.html?a=27', '', ''::text),
  ('소서러', '미스터리룸이스케이프 강남점', '판타지', 3::int2, 1::int2, array['판타지','나레이션','기계장치 80%','강남'],
   '4천년전 인간과 정령이 공존하던 마법시대의 이야기… 어느날 당신이 마법사의 집으로 초대된다면? 4천년전 60년간 계속 이어온 선과 악의 마법전쟁… 그 결과가 당신의 손에 달렸다면 당신은 무엇을 선택하시겠습니까? 4천년전의 대 마법사 레베카의 집으로 당신을 초대합니다.',
   0::int2, '2~4', 0, 'http://www.mysteryroomescape-gn.com/reservation/reservation.html?a=27', '', ''::text),
  ('사라진 왕관', '미스터리룸이스케이프 강남점', '판타지', 3::int2, 1::int2, array['판타지','기계장치 80%','강남'],
   '어느 날, 세계에서 가장 값비싼 왕관이 박물관에서 사라졌다. 수많은 사람들이 왕관을 찾아나섰고, 드디어 낡은 성 안에서 발견되었다는 정보를 얻었다. 그러나 그 성으로 들어간 사람 중 누구도 다시 돌아오지 못했다 이번엔 내가 성안으로 들어가 왕관을 찾아서 탈출해야 한다.',
   0::int2, '2~4', 0, 'http://www.mysteryroomescape-gn.com/reservation/reservation.html?a=27', '', ''::text),
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
