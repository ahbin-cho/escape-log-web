-- 꿈소풍 방탈출(부천점·안산1호점·안산2호점) 테마 16개 추가/갱신
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전(있으면 고치고, 없으면 넣는다).
-- 출처: 공식 사이트 https://dreampicnicescape.com/themes (사이트가 쓰는 공개 목록 /api/public/themes, 2026-11-13 확인)
--   테마명·장르·난이도·인원·시간·소개 문구·테마 이미지·요금은 공식 값. [시즌종료] 3개는 넣지 않음.
--   매장 주소: 부천점 부천시 원미구 부일로459번길 33 4층 / 안산1호점 안산시 단원구 고잔2길 41 6층 / 안산2호점 고잔1길 52 시민빌딩 3층
--   난이도: 공식 값이 0.5 단위(예: 3.5)라 반올림(3.5→4, 4.5→5).
--   장르: 공식 장르를 우리 장르로 묶음(일상/드라마→감성, 느와르→스릴러, 동화→판타지, 미션·잠입→모험, 오컬트→공포 등). 원래 말은 태그로 남김.
--   공포도: 공식 표기가 없어 임시값(공포 장르 3, 나머지 1). 확인되면 고친다.
--   요금: 공식 2인 요금 ÷ 2 = 1인 요금(예: 2인 52,000원 → 26,000원). 인원이 늘면 1인 요금이 달라질 수 있음.
--   예약 오픈일: 공식 사이트에 안내가 없어 비움(예약금 입금 확인 후 확정, 24시간 전부터 환불 불가 — 공식 공지).

with v(name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url) as (values
  ('몽환', '꿈소풍 부천점', '감성', 4::int2, 1::int2, array['드라마','부천'],
   '아르바이트 끝! 이제 내 진짜 하루가 시작된다. 내일까지 해야할 일이 산더미인데... 어떻게든 되겠지? 꿈에서 만나요 bye.',
   70::int2, '1~6', 26000, 'https://dreampicnicescape.com/reservation', 'https://dreampicnicescape.com/images/theme_bucheon_monghwan.jpg'),
  ('심곡 : 자매 자살 사건', '꿈소풍 부천점', '공포', 4::int2, 3::int2, array['스릴러','부천'],
   '자매 자살 사건이 발생한 심곡동의 어느 폐가. 귀신이 나타나자 아무도 들어가지 않게 되었다. 이에 당신은 퇴마 의뢰를 받고 폐가로 향하게 되는데...',
   70::int2, '2~6', 26000, 'https://dreampicnicescape.com/reservation', 'https://dreampicnicescape.com/images/theme_bucheon_simgok.jpg'),
  ('라미 : 두개의 보물', '꿈소풍 부천점', '모험', 4::int2, 1::int2, array['부천'],
   '오랜만에 가족과 함께 놀러온 캠핑장! 하암~ 뭔가 지루한 느낌이 들려는 찰나, 귀여운 외모에 그렇지 않은 성격을 가진 의문의 생명체와 마주하게 된다.',
   70::int2, '2~6', 26000, 'https://dreampicnicescape.com/reservation', 'https://dreampicnicescape.com/images/theme_bucheon_rami.jpg'),
  ('마이 올 킬', '꿈소풍 부천점', '스릴러', 4::int2, 1::int2, array['느와르','부천'],
   '군 복무 중 사랑하는 아버지의 죽음을 알게 된 당신. 아버지의 죽음 뒤에 숨겨진 비밀을 알게 되고, 전역하자마자 아버지가 일하던 곳에 가게 된다. 네 명의 이름이 담긴 리스트를 들고…. ★ 도박에 관한 소재로 폭력적인 내용이 다수 포함되어 있습니다.',
   60::int2, '1~6', 24000, 'https://dreampicnicescape.com/reservation', 'https://dreampicnicescape.com/images/theme_bucheon_myallkill.jpg'),
  ('홍주 : 옥비녀의 비밀', '꿈소풍 부천점', '추리', 5::int2, 1::int2, array['부천'],
   '어느 날 고을 원님의 딸 홍주는 마을 큰 어르신, 대감마님의 부름을 받고 대감집으로 향하게 된다. 홍주가 들어가고 얼마 안 있어 대감집에서 큰 사건이 벌어지는데...! 당신은 홍주가 되어 대감마님의 부탁은 무엇이고 대감집의 비밀은 무엇인지 진실을 밝혀내야 한다! * 테마 구성은 단서 얻는 시간 (55분) + 최종추리시간 (1분)으로 진행됩니다.',
   55::int2, '1~6', 24000, 'https://dreampicnicescape.com/reservation', 'https://dreampicnicescape.com/images/theme_bucheon_hongju.jpg'),
  ('㉢ト□rヱㅊi..★', '꿈소풍 부천점', '기타', 3::int2, 1::int2, array['미스터리','부천'],
   '어릴적 가지고 놀던 다마고치를 찾았다..! 한번 켜볼까 ??',
   60::int2, '1~6', 24000, 'https://dreampicnicescape.com/reservation', 'https://dreampicnicescape.com/images/theme_bucheon_tamagotchi.jpg'),
  ('꿈꾸는 앨리스', '꿈소풍 안산1호점', '판타지', 3::int2, 1::int2, array['동화','안산'],
   '토끼를 쫓아 이상한 나라로, 앨리스의 기상천외한 모험이 시작된다! 토끼를 따라 굴 속으로 뛰어든 앨리스가 이상한 나라에 도착해 겪는 신기한 모험들에 관한 이야기. 루이스 캐럴(Lewis Carrol)의  『이상한 나라의 앨리스』를 꿈소풍의 감성으로 만든 방탈출을 만나볼 수 있습니다.',
   70::int2, '2~6', 24000, 'https://dreampicnicescape.com/reservation', 'https://dreampicnicescape.com/images/theme_ansan_alice.jpg'),
  ('The Prison Season 2 : 브레이크', '꿈소풍 안산1호점', '모험', 4::int2, 1::int2, array['미션','잠입','안산'],
   '평범한 죄수였던 우리가 내일 사형 집행 1순위?? 살기 위해서 어떻게든 이 감옥에서 나가야한다!(분리테마) ★ 본 테마는 두 팀으로 나누어 진행하는 분리구간이 있는 테마입니다. 꼭 참고하여 예약부탁드리며, 예약 후 테마특성 미숙지로 인한 테마 변경 및 환불은 불가합니다.',
   70::int2, '2~6', 24000, 'https://dreampicnicescape.com/reservation', 'https://dreampicnicescape.com/images/theme_ansan_break.jpg'),
  ('신아리오', '꿈소풍 안산1호점', '공포', 3::int2, 3::int2, array['스릴러','안산'],
   '1998년, 영화 〈시나리오〉는 기록을 세웠다. 그리고 작가는… 존재를 지웠다.',
   60::int2, '2~6', 22000, 'https://dreampicnicescape.com/reservation', 'https://dreampicnicescape.com/images/sina.jpeg'),
  ('안산 코노', '꿈소풍 안산1호점', '공포', 3::int2, 3::int2, array['안산'],
   '고등학교 동창의 부탁으로 급하게 코인노래방 알바 대타로 근무하게 된 당신. 매뉴얼만 따라서 하면 쉬울거라는 친구의 말에 별 생각없이 들어선 코인노래방은 스산하고 이상한 분위기가 감돈다.',
   60::int2, '2~6', 22000, 'https://dreampicnicescape.com/reservation', 'https://dreampicnicescape.com/images/theme_ansan_coin.jpg'),
  ('타로78', '꿈소풍 안산1호점', '감성', 5::int2, 1::int2, array['힐링','모노룸','문제방','안산'],
   '지친 하루를 끝내고 집에 돌아가던 당신은 익숙한 골목에 낮선 타로카페가 있는 것을 발견하고 그 곳에 들어가게 됩니다. ★ 모노룸 : 단 하나의 방으로 이루어져 있습니다. - 단일타임 예약시 일반모드(50분)으로 진행됩니다. - 2타임 이상 ''연속'' 예약 시에만 마스터모드(50분단위로 플레이타임 증가)로 진행되며, 중간에 끊어서 예약하실 경우 처음부터 진행하셔야 합니다.',
   50::int2, '1~3', 10000, 'https://dreampicnicescape.com/reservation', 'https://dreampicnicescape.com/images/theme_ansan_tarot.jpg'),
  ('B612', '꿈소풍 안산2호점', '판타지', 4::int2, 1::int2, array['동화','안산'],
   '비행 도중 엔진 고장으로 낯선 곳에 불시착한 당신. 구사일생으로 목숨을 부지한 그 순간, 도움을 요청하는 소리를 듣게 되는데.. 앙투안 드 생텍쥐페리(Antoine de Saint-Exupéry)의 『어린왕자』를 꿈소풍의 감성으로 만든 방탈출을 만나볼 수 있습니다.',
   80::int2, '1~6', 26000, 'https://dreampicnicescape.com/reservation', 'https://dreampicnicescape.com/images/b612.jpg'),
  ('시민상가 철거반', '꿈소풍 안산2호점', '공포', 5::int2, 3::int2, array['안산'],
   '시민상가에서 철거 반대 농성을 하고 있는 상점 주인들. 우리는 시민상가 철거반의 신입 직원으로 그들이 농성을 지속할 수 없게 하기 위해 몰래 건물 지하로 들어간다. ★ 이 테마는 공포테마이며, 조도가 매우 어둡고, 랜턴이 주어지지 않습니다. 꼭 숙지하시고 예약 부탁드리며, 예약 후 테마 특성 미숙지로 인한 테마 변경 및 환불은 불가합니다.',
   80::int2, '2~6', 26000, 'https://dreampicnicescape.com/reservation', 'https://dreampicnicescape.com/images/chul.jpg'),
  ('키멘주에이', '꿈소풍 안산2호점', '공포', 3::int2, 3::int2, array['오컬트','스릴러','안산'],
   '일본 에도시대, 한 아기가 저주에 걸린 채 태어났다.',
   60::int2, '2~6', 22000, 'https://dreampicnicescape.com/reservation', 'https://dreampicnicescape.com/images/ki.jpg'),
  ('냥냥펀치', '꿈소풍 안산2호점', '감성', 4::int2, 1::int2, array['일상','안산'],
   '야옹~! 냥 미야옹 냐아오! 냥... 냐아-냐앙 냐오옹?',
   60::int2, '1~6', 22000, 'https://dreampicnicescape.com/reservation', 'https://dreampicnicescape.com/images/cat.jpg'),
  ('금GO', '꿈소풍 안산2호점', '모험', 3::int2, 1::int2, array['잠입','모노룸','안산'],
   '엄청난 가치의 ''타겟''을 훔쳐야한다. 정회장의 금고로 gogogo! ★ 모노룸 : 단 하나의 방으로 이루어져 있습니다',
   50::int2, '1~3', 12000, 'https://dreampicnicescape.com/reservation', 'https://dreampicnicescape.com/images/go.jpg')
),
upd as (
  update public.catalog c set genre=v.genre, difficulty=v.difficulty, fear_level=v.fear_level, tags=v.tags, teaser=v.teaser,
         time_limit=v.time_limit, players=v.players, price=v.price, reservation_url=v.reservation_url, poster_url=v.poster_url
  from v where c.name=v.name and c.cafe=v.cafe returning c.name
)
insert into public.catalog (name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url)
select v.* from v where not exists (select 1 from public.catalog c where c.name=v.name and c.cafe=v.cafe);

select cafe, name, genre, difficulty, time_limit, players, price from public.catalog where cafe like '꿈소풍%' order by cafe, name;
