-- 강릉방탈출카페(강원 강릉시 경강로 2106, 3층 301호) 테마 5개 추가/갱신
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전.
-- 출처: 네이버 예약 https://booking.naver.com/booking/12/bizes/608353 (2026-11-13 확인. 매장 소개글에 인스타 @escape_room_gn 표기)
--   테마명·소개·난이도("별점 5점 만점에 N점")·60분·포스터·예약 링크는 예약 페이지 값.
--   공식 표기가 없는 것: 장르(→ '기타'), 공포도(→ 임시 3), 인원(빈칸), 가격(0). 확인되면 관리자 화면에서 고친다.

with v(name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url) as (values
  ('마법사의 세계', '강릉방탈출카페', '기타', 3::int2, 3::int2, array[]::text[],
   '6대 현자들의 제자였던 당신은 마을의 여자들을 납치해 돌로 만들어 버린다는 암흑 마법사의 소식을 듣게 된다. 암흑 마법사의 처단을 위해 6명의 스승님들이 여행을 떠나지만 이내 소식이 끊어져 버리고 만다. 당신은 스승님들의 복수를 위해 암흑 마법사를 찾아 나서고, 바로 지금! 암흑 마법사의 연구실을 발견하게 되는데....', 60::int2, '', 0, 'https://booking.naver.com/booking/12/bizes/608353/items/4167205', 'https://naverbooking-phinf.pstatic.net/20211110_216/1636505796142zkvHF_JPEG/%B8%B6%B9%FD%BB%E7%C0%C7_%BC%BC%B0%E8_1.jpg'),
  ('도둑들', '강릉방탈출카페', '기타', 3::int2, 3::int2, array[]::text[],
   '유명화가의 휘귀품만 전시해서 그 가치가 높은 크라임 미술관 이곳은 보안으로도 유명해 한번도 도둑맞은 적이 없다. 당신은 이곳을 털기위해 천재해커 빌리와 손을 잡게되고 빌리가 한시간동안 경비시스템을 마비 시킬 수 있다는데.. 주어진 시간은 한시간! 미술관을 털어라!', 60::int2, '', 0, 'https://booking.naver.com/booking/12/bizes/608353/items/4167230', 'https://naverbooking-phinf.pstatic.net/20211110_55/1636507228215IrGPi_JPEG/%B5%B5%B5%CF%B5%E9_1.jpg'),
  ('암살', '강릉방탈출카페', '기타', 3::int2, 3::int2, array[]::text[],
   '2월 14일은 안중근 의사의 사형 선고일이다. 당신은 독립군대장. 안중근의사의 감옥에 잠입해서 그를 구출해 내야한다. 한 시간이 지나고 날이 밝으면 모든사람들의 염원이 물거품이 되어버릴 것이다. 자 우리민족을 위해 건투를 빈다.', 60::int2, '', 0, 'https://booking.naver.com/booking/12/bizes/608353/items/4167231', 'https://naverbooking-phinf.pstatic.net/20211110_24/1636507366095ajG6K_JPEG/%BE%CF%BB%EC_1.jpg'),
  ('무속인 살인사건', '강릉방탈출카페', '기타', 4::int2, 3::int2, array[]::text[],
   'TV에 출연할 정도로 유명한 무속인이 어느날 싸늘한 시체로 발견? 피해자는 TV에 출연하여 화려한 달변과 점술로 유명해진 박수무당으로 어느 날 자신의 점집에서 잘린 머리가 불에 탄 채 단골 고객에게 발견되었다. 과연 어떠한 연유로 박무당은 죽음을 맞이해야 했는가? 빛나는 추리로 진실을 파헤쳐 보자.', 60::int2, '', 0, 'https://booking.naver.com/booking/12/bizes/608353/items/4167232', 'https://naverbooking-phinf.pstatic.net/20211110_57/1636507712031079dq_JPEG/%B9%AB%BC%D3%C0%CE_1.jpg'),
  ('이상한 나라의 초대', '강릉방탈출카페', '기타', 4::int2, 3::int2, array[]::text[],
   '이상한 나라의 파티에 초대되다..괴이한 토끼를 통해 하얀 여왕의 전보를 받고 이제 이상한 나라로의 여행이 시작되었다. 하얀 여왕에게 가는 길에 맞이한 붉은 여왕의 카드병정 군대 당신은 방해를 물리치고 무사히 집으로 돌아갈 수 있을까?', 60::int2, '', 0, 'https://booking.naver.com/booking/12/bizes/608353/items/4167233', 'https://naverbooking-phinf.pstatic.net/20211110_4/16365082756259knDC_JPEG/%C0%CC%BB%F3%C7%D1_%B3%AA%B6%F3_1.jpg')
),
upd as (
  update public.catalog c set genre=v.genre, difficulty=v.difficulty, fear_level=v.fear_level, tags=v.tags, teaser=v.teaser,
         time_limit=v.time_limit, players=v.players, reservation_url=v.reservation_url, poster_url=v.poster_url
  from v where c.name=v.name and c.cafe=v.cafe returning c.name
)
insert into public.catalog (name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url)
select v.* from v where not exists (select 1 from public.catalog c where c.name=v.name and c.cafe=v.cafe);

-- 결과 확인(5줄이 나와야 한다)
select cafe, name, genre, difficulty, fear_level, time_limit, players from public.catalog where cafe like '강릉방탈출카페%' order by cafe, name;
