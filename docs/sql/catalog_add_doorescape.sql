-- 도어이스케이프 4개 지점(수능 수험생 이벤트 지점) 테마 19개 추가/갱신
--   이수역점(서울 동작구 동작대로27가길 14, 3층) 4 · 안산점(안산시 단원구 고잔2길 65, 2층) 6
--   부평점(인천 부평구 부평문화로66번길 17, 3층) 3 · 대전유성NC백화점(대전 유성구 계룡로 119, 10층) 6
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전.
-- 출처: 공식 사이트 https://doorescape.co.kr (2026-11-13)
--   ⚠️ 테마명·주소는 각 지점 페이지에서 확인했지만, 난이도·장르·시간·인원·소개는 사이트가 내려주는 데이터 파일에서 읽은 값이다.
--      사이트가 자동 접속 화면을 막아 실제 화면과 대조하지 못했다 → 실행 전에 운영자가 지점 한 곳을 눈으로 대조할 것.
--   난이도는 정수로 올림(4.5 → 5, 3.5 → 4). 가격은 인원별 금액이 1인 값인지 팀 값인지 표기가 없어 넣지 않았다(0).
--   공식 표기가 없는 것: 공포도(장르가 공포면 4, 스릴러 3, 그 외 1, 장르 표기 없는 테마는 임시 3), 이수역점 제한시간(0).

with v(name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url) as (values
  ('파라오의 석실', '도어이스케이프 이수역점', '기타', 3::int2, 3::int2, array[]::text[],
   '광활한 이집트로 유적탐사를 떠난 당신.
난데없이 만나게 된 모래폭풍으로
미지의 피라미드에 몸을 피하게 되는데...
어떤 기록에도 없는 의문의 피라미드!
그 속으로 들어온 것이 분명하다.
사막 깊은 곳, 숨겨져 왔던 기이한 기록들을
관찰하는 것도 잠시...
피라미드가 다시 모래에 묻히고 있다!
파라오와 함께 그곳에 묻힐 것인가?
산소가 희박해지고 있다...
눈앞에 있는 모든 것에 집중하라!', 0::int2, '2~6', 0, 'https://doorescape.co.kr/reservation/isu?theme=140', 'https://doorescape.co.kr/assets/themes/140.jpeg'),
  ('빠삐용', '도어이스케이프 이수역점', '기타', 4::int2, 3::int2, array[]::text[],
   '거대한 불법수입원의 조직원인 당신.
갑작스런 동료의 구속으로
치명적인 위기에 빠지게 된다!
''나를 여기서 빼내...'' 그가 모든 걸 발설하기 전..
조직과 당신 스스로를 위해,
무조건 그를 탈옥시켜야 한다!
섣부른 행동은 금물!! 교도관의 눈을 피하기
위해선, 그림자보다 고요하게 움직여야 한다!', 0::int2, '2~6', 0, 'https://doorescape.co.kr/reservation/isu?theme=141', 'https://doorescape.co.kr/assets/themes/141.jpeg'),
  ('검은조직', '도어이스케이프 이수역점', '기타', 5::int2, 3::int2, array[]::text[],
   '호화스럽고 멋진 크루즈선. 이 안에서
검은 조직의 밀수가 이루어지고있다..
손님으로 위장 잠입한 당신에게 주어진 미션!
억 소리가 나는 각종 고가의 미술품은 물론,
그걸 훔치려다 다친 사기꾼
친구의 복수를 해야한다!
일타 이피를 노리는가?
출항까지 얼마 남지 않았다.
그동안 꿈꿔온 환상적인
삶을 위해 재빠르게 움직여라!', 0::int2, '2~6', 0, 'https://doorescape.co.kr/reservation/isu?theme=142', 'https://doorescape.co.kr/assets/themes/142.jpeg'),
  ('S.O.S 정글', '도어이스케이프 이수역점', '기타', 5::int2, 3::int2, array[]::text[],
   '사흘 전, 아마존으로 밀렵을 떠나온 당신.
악어 떼의 습격으로 배가 전복되며
정글 속에 고립 되었다!
짐승의 울음 소리, 마구잡이로 자란 식물들,
이름을 알 수 없는 높디 높은 나무까지.
더 이상의 음식도, 더 이상의 희망도 남지 않은
위기의 상황이 닥쳐오고야 말았다!
가끔 먼 곳에서 헬기 소리가 들리지만,
당신의 존재를 알릴 수 있는 방법이 없다.
그렇게 모든 것을 포기한 순간,
강 건너에서 발견한 오두막!
횃불을 피워 SOS를 요청한다면,
헬기가 당신을 발견할 수 있을 것이다.
살고 싶다면, 이 오두막을 샅샅이
뒤져 쓸만한 모든 것을 이용하라!
마지막 희망을 모두 건 당신의 탈출기!
과연 이 정글에서 무사히 나갈 수 있을까!', 0::int2, '2~6', 0, 'https://doorescape.co.kr/reservation/isu?theme=143', 'https://doorescape.co.kr/assets/themes/143.jpeg'),
  ('측신', '도어이스케이프 안산점', '공포', 3::int2, 4::int2, array['공포']::text[],
   '...잠이 안오는 모양이구나.
할미가 무서운 얘기 하나 해줄까?', 60::int2, '2~6', 0, 'https://doorescape.co.kr/reservation/ansan?theme=162', 'https://doorescape.co.kr/assets/themes/162.png'),
  ('엘로디', '도어이스케이프 안산점', '스릴러', 3::int2, 3::int2, array['스릴러', '드라마']::text[],
   '''아빠, 나 여기 있어요.''', 60::int2, '2~6', 0, 'https://doorescape.co.kr/reservation/ansan?theme=425', 'https://doorescape.co.kr/assets/themes/425.jpg'),
  ('파라오의 석실', '도어이스케이프 안산점', '기타', 3::int2, 3::int2, array[]::text[],
   '광활한 이집트로 유적탐사를 떠난 당신.
난데없이 만나게 된 모래폭풍으로
미지의 피라미드에 몸을 피하게 되는데...
어떤 기록에도 없는 의문의 피라미드!
그 속으로 들어온 것이 분명하다.
사막 깊은 곳, 숨겨져 왔던 기이한 기록들을
관찰하는 것도 잠시...
피라미드가 다시 모래에 묻히고 있다!
파라오와 함께 그곳에 묻힐 것인가?
산소가 희박해지고 있다...
눈앞에 있는 모든 것에 집중하라!', 60::int2, '2~6', 0, 'https://doorescape.co.kr/reservation/ansan?theme=160', 'https://doorescape.co.kr/assets/themes/160.jpeg'),
  ('마녀의 저주', '도어이스케이프 안산점', '기타', 4::int2, 3::int2, array[]::text[],
   '여행 중 잠시 머물게 된 작은 마을에서
떠도는 소문, ''마녀''...수상한 마을 사람들을 피해
숲 속에서 낯선 지하실을 발견한 당신.
발을 딛자마자, 들리지도, 보이지도 않지만
분명하게 느껴지는 그녀의 존재.. 따갑게 피부를
스치는 이 곳의 공기가 말해주고 있다...
그녀의 저주는 시작되었다...
당신의 살갗을 녹이는 이 저주에 뒤덮이기 전,
이곳을 탈출해야만 한다!!!', 60::int2, '2~6', 0, 'https://doorescape.co.kr/reservation/ansan?theme=161', 'https://doorescape.co.kr/assets/themes/161.jpeg'),
  ('미친 의사', '도어이스케이프 안산점', '기타', 5::int2, 3::int2, array[]::text[],
   '늦은 밤. 집으로 돌아가던 당신은
뒷통수를 가격하는 둔탁한 소리와 함께
쓰러지고 마는데...정신을 차린 곳은...
옅은 피비린내가 나는 허름한 수술실.
인신매매를 사주하는 조직의
실험체가 되어버렸다.
미쳐버린 의사에게, 당신은
생체실험을 위한 재료일 뿐!
더 이상 지체할 시간이 없다...
메스를 든 의사가 돌아오기 전,
60분안에 여기서 탈출해야만 한다!!!', 60::int2, '2~6', 0, 'https://doorescape.co.kr/reservation/ansan?theme=165', 'https://doorescape.co.kr/assets/themes/165.jpeg'),
  ('빅뱅', '도어이스케이프 안산점', '기타', 5::int2, 3::int2, array[]::text[],
   '지구를 대신할 새로운 행성 탐사로
분주한 우주 연구소.
경호 임무를 수행하던 당신은
굉음과 함께 정신을 잃고 마는데...
무전 소리에 깨어난 당신.
''확인 불가한.. 행성의 존재..태양계를 향해..''
''치직... 연구소 내 생존자 ...하라''
알 수 없는 다급한 부탁을 마지막으로
끝나버린 목소리!
지구가 큰 위험에 빠진것이 분명하다.
아무것도 모를 인류와 가족을 지키기 위해선
당신이 필요하다!', 60::int2, '2~6', 0, 'https://doorescape.co.kr/reservation/ansan?theme=166', 'https://doorescape.co.kr/assets/themes/166.jpeg'),
  ('요원들은 들어라', '도어이스케이프 부평점', '모험', 3::int2, 1::int2, array['잠입', '미션']::text[],
   '" 요원들은 들어라!
우리는 수만년 전부터 인간과 오랜 시간 함께 해왔다!
[중략]
그럼 요원들. 꼭 정예요원으로 선발되기를 빈다! "', 60::int2, '2~4', 0, 'https://doorescape.co.kr/reservation/bupyeong?theme=354', 'https://doorescape.co.kr/assets/themes/354.jpg'),
  ('호롱', '도어이스케이프 부평점', '판타지', 4::int2, 1::int2, array['판타지']::text[],
   ''' 매일 밤 자정...
우리 집에서 이상한 일들이 일어난다... ''', 65::int2, '2~4', 0, 'https://doorescape.co.kr/reservation/bupyeong?theme=357', 'https://doorescape.co.kr/assets/themes/357.jpg'),
  ('몽타주', '도어이스케이프 부평점', '추리', 4::int2, 1::int2, array['추리', '서스펜스']::text[],
   '" 사...사람이 죽었어요! "
" 혹시 범인의 생김새가 기억나시나요? "', 70::int2, '2~4', 0, 'https://doorescape.co.kr/reservation/bupyeong?theme=356', 'https://doorescape.co.kr/assets/themes/356.jpg'),
  ('나는 아직도 배고프G', '도어이스케이프 대전유성NC백화점', '코믹', 3::int2, 1::int2, array['코믹']::text[],
   '" 에라 모르겠다! 일단 저지르고 보자! "', 20::int2, '2~4', 0, 'https://doorescape.co.kr/reservation/daejeon-yuseong-nc?theme=134', 'https://doorescape.co.kr/assets/themes/134.jpeg'),
  ('도어항공 41C', '도어이스케이프 대전유성NC백화점', '기타', 3::int2, 1::int2, array['탈출']::text[],
   '" 탑승 좌석은 비상구 좌석 41C입니다. "', 40::int2, '2~4', 0, 'https://doorescape.co.kr/reservation/daejeon-yuseong-nc?theme=135', 'https://doorescape.co.kr/assets/themes/135.jpeg'),
  ('서커스 : THE CLEANING MAN', '도어이스케이프 대전유성NC백화점', '공포', 3::int2, 4::int2, array['공포']::text[],
   ''' [청소부 모집]
자격 요건 : 행복한 인간 ''', 60::int2, '2~4', 0, 'https://doorescape.co.kr/reservation/daejeon-yuseong-nc?theme=136', 'https://doorescape.co.kr/assets/themes/136.jpeg'),
  ('산타의 민족', '도어이스케이프 대전유성NC백화점', '감성', 4::int2, 1::int2, array['감성']::text[],
   '" 허허허. 올해도 어김없이 크리스마스가 찾아왔구나! "', 60::int2, '2~4', 0, 'https://doorescape.co.kr/reservation/daejeon-yuseong-nc?theme=137', 'https://doorescape.co.kr/assets/themes/137.jpeg'),
  ('GOOD NIGHT', '도어이스케이프 대전유성NC백화점', '감성', 4::int2, 1::int2, array['감성', '추리']::text[],
   '" 오늘 밤도 원하시는 행복을 선물할게요. "', 60::int2, '2~4', 0, 'https://doorescape.co.kr/reservation/daejeon-yuseong-nc?theme=138', 'https://doorescape.co.kr/assets/themes/138.jpeg'),
  ('WOULD YOU FIND ME?', '도어이스케이프 대전유성NC백화점', '코믹', 5::int2, 1::int2, array['코믹']::text[],
   '" 잠깐, 그럼 우리가 여기로 오게 된 이유는...? "', 60::int2, '2~4', 0, 'https://doorescape.co.kr/reservation/daejeon-yuseong-nc?theme=139', 'https://doorescape.co.kr/assets/themes/139.jpeg')
),
upd as (
  update public.catalog c set genre=v.genre, difficulty=v.difficulty, fear_level=v.fear_level, tags=v.tags, teaser=v.teaser,
         time_limit=v.time_limit, players=v.players, reservation_url=v.reservation_url, poster_url=v.poster_url
  from v where c.name=v.name and c.cafe=v.cafe returning c.name
)
insert into public.catalog (name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url)
select v.* from v where not exists (select 1 from public.catalog c where c.name=v.name and c.cafe=v.cafe);

-- 결과 확인(19줄이 나와야 한다)
select cafe, name, genre, difficulty, fear_level, time_limit, players from public.catalog where cafe like '도어이스케이프%' order by cafe, name;
