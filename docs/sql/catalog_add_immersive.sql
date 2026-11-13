-- '배우가 계속 연기하는' 이머시브 6개 추가/갱신 (조사: docs/immersive-research.md, 2026-11-13 확인)
-- 들어가는 기준: 공식 예약 페이지, 공식 홈페이지, 네이버 플레이스 업체 소개 가운데 하나에 배우가 나오거나 '이머시브 연극'이라고 적힌 것만.
-- 꼬리표: 전부 '이머시브'. 퍼즐 없는 연극형은 '이머시브연극'도 붙인다.
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전하다(이미 있으면 고치고, 없으면 넣는다).
-- 넣은 뒤 https://bangtallog.com/search?q=이머시브 에서 모아 볼 수 있다(배포 필요 없음, 최대 1시간).
--
-- 값 원칙: 공식 페이지에서 읽은 값만 넣는다.
--   catalog 컬럼은 null 을 받지 않는다(not null). 그래서 모르는 값은 테이블 기본값으로 둔다.
--     시간·가격 = 0, 인원·포스터 = '' → 이 경우 화면에 안 나온다.
--   difficulty / fear_level 은 공식 수치가 없으면 테이블 기본값 3 이다(임시).
--     공식 수치가 있는 것은 아바타의 난이도뿐이다(레다스퀘어 별 3개).
--   포스터는 넣지 않는다(운영 원칙: 매장 포스터 사용 안 함).
--
-- 작품별 공식 근거:
--   위드아웃유  : 네이버 예약 "이머시브 연극 공연을 하는 상설 공연장입니다." / "섬광,고음,진동 등 공포 연출 포함"
--                 ※ 공식 글에 '배우'라는 단어는 없다. '이머시브 연극'이라는 표기로 넣었다.
--   BLACK MUSE  : 네이버 플레이스 "이머시브연극 BLACK MUSE를 공연하는 이머시브 극장입니다" / "섬광,고음,진동 등 공포 연출 포함"
--                 ※ 공식 글에 '배우'라는 단어는 없다. '이머시브연극'이라는 표기로 넣었다.
--   제일기숙학원 · 한강대 담력훈련 : 네이버 예약 "…배우들과 함께 이동하고 호흡하며 스토리를 경험하는 이머시브 공포 체험극입니다."
--                 + xphobia.net "관객이 배우와 함께 이동하며 스토리를 경험하는 이머시브 공포체험극"
--   아바타      : wecent.kr 예약 공지 "※ 전문 배우가 등장하는 이머시브 테마입니다." / "전문 배우들이 함께 진행하는 테마"
--                 75분 · 2~4명 · 장르 드라마(wecent.kr), 난이도 ★3(ledasquare.com)
--   (뺌) 우야 : 배우가 얼마나 나오는지 공식 글에 없어 '배우가 끝까지 함께' 표시가 과장될 수 있음 → docs 에만 둠
--   우야(참고)  : 네이버 플레이스 "…스토리 중심의 이머시브 방탈출 브랜드입니다. … 배우와의 상호작용"
--                 공포 · 70분 · 2~6인(mhzescape.com). 방탈출형이라 '이머시브연극' 꼬리표는 없음
--   카지노:게임의 법칙(대전) : asinart.co.kr "이머시브 연극 … 배우들과 직접 소통하고, 게임에 참여하며 이야기의 일부가 되는"
--                 90분, 정가 50,000원(네이버 플레이스 메뉴 '정가'). ※ 2026.10.22~12.31 기간 한정이다. 끝나면 지울 것

with v(name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url) as (values
  ('위드아웃유 (Without You: 당신 없이는)', '이머시브스튜디오 홍대점', '공포', 3::int2, 3::int2, array['이머시브','이머시브연극','공포','홍대'],
   '그날, 집에 초대받은 순간부터 모든 것이 달라졌다. 1980년대 태국 치앙마이의 한인 타운. 한인 교민 ''쿤타이''와 그의 아내 ''베라'', 딸 ''포포''가 살고 있는 집에 각자 다른 이유로 방문하게 된 사람들. 이 집에 초대받은 사람들과 초대받지 않은 사람들과의 돌아갈 수 없는 저녁 식사가 시작됩니다.',
   0::int2, '', 0, 'https://booking.naver.com/booking/12/bizes/1499564', ''),
  ('BLACK MUSE', '이머시브스튜디오 홍대2극장', '공포', 3::int2, 3::int2, array['이머시브','이머시브연극','공포','홍대'],
   '1983년 미국의 어느 시골마을에 위치한 레드벨벳호텔에 천재 공포소설작가 윌이 방문하게 된다. 하지만 몇 달 후 그의 실종 소식이 들리고 그를 찾으려는 팬들이 레드벨벳호텔에 방문하게 되는데...',
   0::int2, '', 0, 'https://booking.naver.com/booking/12/bizes/1677218', ''),
  ('제일기숙학원', '괴담저장소 강남', '공포', 3::int2, 3::int2, array['이머시브','이머시브연극','공포','강남'],
   '괴담을 믿으세요? 무대와 객석의 경계 없이 전체 공간을 무대로 활용하여 배우들과 함께 이동하고 호흡하며 스토리를 경험하는 이머시브 공포 체험극.',
   0::int2, '', 0, 'https://booking.naver.com/booking/12/bizes/1335513', ''),
  ('한강대 담력훈련', '괴담저장소 홍대', '공포', 3::int2, 3::int2, array['이머시브','이머시브연극','공포','홍대'],
   '괴담을 믿으세요? 무대와 객석의 경계 없이 전체 공간을 무대로 활용하여 배우들과 함께 이동하고 호흡하며 스토리를 경험하는 이머시브 공포 체험극.',
   0::int2, '', 0, 'https://booking.naver.com/booking/12/bizes/1204854', ''),
  ('아바타 [아득히 바라던 타오름에 대하여]', '위센트 이머시브 홍대점', '드라마', 3::int2, 3::int2, array['이머시브','드라마','홍대'],
   '누군가로부터 편지가 한 통 도착했다. "제발 저를 좀 도와주세요" (전문 배우가 등장하는 이머시브 테마, 옛 레다스퀘어)',
   75::int2, '2~4', 0, 'https://wecent.kr/reservation', ''),
  ('카지노:게임의 법칙 (대전)', '대흥씨어터 (대전)', '기타', 3::int2, 3::int2, array['이머시브','이머시브연극','대전'],
   '당신은 관객인가, 플레이어인가? 배우들과 직접 소통하고, 게임에 참여하며 이야기의 일부가 되는 이머시브 연극. (2026.10.22~12.31)',
   90::int2, '', 50000, 'https://asinart.co.kr/book/0fd826fdacfd', '')
),
upd as (
  update public.catalog c set genre=v.genre, difficulty=v.difficulty, fear_level=v.fear_level, tags=v.tags, teaser=v.teaser,
         time_limit=v.time_limit, players=v.players, price=v.price, reservation_url=v.reservation_url, poster_url=v.poster_url
  from v where c.name=v.name and c.cafe=v.cafe returning c.name
)
insert into public.catalog (name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url)
select v.* from v where not exists (select 1 from public.catalog c where c.name=v.name and c.cafe=v.cafe);

select name, cafe, genre, time_limit, players, price, tags from public.catalog where '이머시브' = any(tags);
