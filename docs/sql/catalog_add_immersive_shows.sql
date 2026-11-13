-- 기간 한정 이머시브 공연 + 끝나는 날 칸(run_until). 조사: docs/immersive-shows.md (2026-11-14)
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전(있으면 고치고, 없으면 넣는다).
-- run_until 이 지나면 /immersive 목록에서 자동으로 빠진다(테마 페이지는 남는다).
-- 출처 수준: 대부분 제작사 보도자료 기사(예매처 상품 페이지는 이 작업 환경에서 열리지 않음).
--   시간·가격·나이는 보도자료에 있을 때만 넣고, 없으면 0/''(화면에 안 나옴).
--   난이도·공포도는 공식 수치가 없어 임시 3.
alter table public.catalog add column if not exists run_until date;

with v(name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url) as (values
  -- 전자신문 2026-11-13: 11/26~12/27, KBS스포츠월드 생활체육관, NOL. 1차 3초 매진, 2차 11/30 12시 오픈.
  -- "배우들과 함께 공간을 이동하고 곳곳에 숨겨진 단서를 따라가며 사건에 직접 참여한다"
  ('비공식클래스: 기억표백의 진실편', '블랙헤이븐 (KBS스포츠월드 생활체육관)', '추리', 3::int2, 3::int2, array['이머시브','추리','서울'],
   '고교탐정단 ''비공식 KLASS'' 시리즈 두 번째 이야기(SPORTS CENTER편). 배우들과 함께 공간을 이동하며 숨겨진 단서를 따라 사건에 직접 참여한다. NOL 예매, 2차 티켓 11/30 낮 12시 오픈.',
   0::int2, '', 0, '', ''),
  -- 스포츠동아·베타뉴스 2026-09-09: 10/1~11/29, 매일 19:30(19:10 프리쇼 20분), 본공연 90분, 만 16세 이상, 정가 50,000원, 롯데월드 홈페이지
  ('STAY ALIVE IN MUSEUM 앵콜', '롯데월드 민속박물관', '공포', 3::int2, 3::int2, array['이머시브','이머시브연극','공포','잠실'],
   '체험형 이머시브 연극. 숨겨진 단서를 찾아 저주의 비밀을 풀고 살아남아야 한다. 매일 19:30(19:10 프리쇼), 만 16세 이상, 롯데월드 홈페이지 예매.',
   90::int2, '', 50000, 'https://adventure.lotteworld.com', ''),
  -- 헤럴드경제·한국일보 2026-11-10: 11/21(토) 22:00·11/22(일) 21:00 딱 2회, 프리쇼 포함 100분, 만 16세 이상, 72,000원, 회당 99명(코스 3개 33명씩)
  ('다크 어드벤처', '롯데월드 어드벤처 × 블랙헤이븐', '공포', 3::int2, 3::int2, array['이머시브','이머시브연극','공포','잠실'],
   '폐장 후 롯데월드 어드벤처 전체가 무대인 호러 이머시브. 배우와 직접 대화하며 괴담의 실체를 조사한다. 11/21(토) 22시 · 11/22(일) 21시 딱 2회, 만 16세 이상.',
   100::int2, '', 72000, 'https://adventure.lotteworld.com', ''),
  -- 데일리안·뉴스1 2026-10-16: 11/20 개막, 롯데시네마 에비뉴엘 명동, 티켓링크·NOL. 끝나는 날 4/25는 출연자 기사 기준
  ('인사이드 더 플레이: 카지노X', '롯데시네마 에비뉴엘 명동', '기타', 3::int2, 3::int2, array['이머시브','이머시브연극','명동'],
   '관객이 의결권을 가진 ''주주''이자 카지노 플레이어가 되는 이머시브 공연. 배우와 장면에 참여하는 정도에 따라 전개가 바뀌는 멀티엔딩. 티켓링크·NOL 예매.',
   0::int2, '', 0, '', ''),
  -- 공식 sleepnomoreseoul.com: 만 19세 이상(신분증), 제공 마스크 필수, 가방·외투 반입 불가, 배우가 내내 연기·관객은 호텔을 자유롭게 이동. 오픈런
  ('슬립노모어 서울', '매키탄 호텔 (충무로)', '스릴러', 3::int2, 3::int2, array['이머시브','이머시브연극','충무로'],
   '호텔 전체가 무대. 가면을 쓰고 자유롭게 돌아다니며 배우들의 연기를 따라가는 이머시브 공연. 만 19세 이상(신분증 확인), 가방·외투 반입 불가.',
   0::int2, '', 0, 'https://sleepnomoreseoul.com/kor/sleepnomore/index.php', '')
),
upd as (
  update public.catalog c set genre=v.genre, difficulty=v.difficulty, fear_level=v.fear_level, tags=v.tags, teaser=v.teaser,
         time_limit=v.time_limit, players=v.players, price=v.price, reservation_url=v.reservation_url, poster_url=v.poster_url
  from v where c.name=v.name and c.cafe=v.cafe returning c.name
)
insert into public.catalog (name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url)
select v.* from v where not exists (select 1 from public.catalog c where c.name=v.name and c.cafe=v.cafe);

-- 끝나는 날
update public.catalog set run_until = '2026-12-27' where name = '비공식클래스: 기억표백의 진실편';
update public.catalog set run_until = '2026-11-29' where name = 'STAY ALIVE IN MUSEUM 앵콜';
update public.catalog set run_until = '2026-11-22' where name = '다크 어드벤처';
update public.catalog set run_until = '2027-04-25' where name = '인사이드 더 플레이: 카지노X';
update public.catalog set run_until = '2026-12-31' where cafe = '대흥씨어터 (대전)' and name like '카지노%';

select name, cafe, run_until, tags from public.catalog where '이머시브' = any(tags) order by run_until nulls last;
