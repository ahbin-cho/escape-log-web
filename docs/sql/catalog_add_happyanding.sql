-- 해피앤딩 방탈출카페(서울 마포구 와우산로21길 31-11 지하1층, 홍대) 테마 4개 추가/갱신
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전(있으면 고치고, 없으면 넣는다).
-- 출처: 공식 사이트 https://happyanding.co.kr/layout/res/home.php?go=theme.list (2026-11-13 확인)
--   테마명·장르·시간·인원·난이도(사이트의 난이도 아이콘 개수)·소개 문구·예약 링크·테마 이미지는 공식 테마 페이지 값.
--   장르: '판타지/추리' → 추리(+판타지 태그), '개그/(야외활동있음)' → 코믹(+야외활동 태그), '판타지/동화' → 판타지(+동화 태그)
--   공포도: H.B.D 만 공식 표기(★★★☆☆ = 3). 나머지 셋은 공식 표기가 없어 임시 1(장르 기준). 확인되면 고친다.
--   가격은 공식 사이트에 없어 0(화면에 안 나옴).
--   참고(소개 문구 앞 안내): 탐정브레드맨 초보자 기준 난이도 4, H.B.D 초보자 4, 어?계인씨! 초보자 3·추천 2~3인·가벼운 야외활동 포함, 앨리스전 초보자 3·추천 2~3인

with v(name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url) as (values
  ('탐정브레드맨:도넛살인사건', '해피앤딩 홍대점', '추리', 4::int2, 1::int2, array['판타지','추리','홍대'],
   '사건현장에 떨어진 딸기크림과 빵가루의 양을 보니 범인은 면식범이 틀림없어. 탐정브레드맨의 이름을 걸고, 범인은 바로..!',
   60::int2, '2~6', 0, 'https://happyanding.co.kr/layout/res/home.php?go=rev.make&s_theme_num=1', 'https://happyanding.co.kr/file/theme/1_a.jpg'),
  ('H.B.D : 해피버스데이', '해피앤딩 홍대점', '스릴러', 3::int2, 3::int2, array['스릴러','홍대'],
   '누가 생일이시죠? 생일 파티는 하셔도 되는데 초는 위험하니까 절대 붙이시면 안 돼요~ 그럼 즐거운 시간 보내세요!',
   60::int2, '2~6', 0, 'https://happyanding.co.kr/layout/res/home.php?go=rev.make&s_theme_num=2', 'https://happyanding.co.kr/file/theme/2_a.jpg'),
  ('어?계인씨!(야외활동O)', '해피앤딩 홍대점', '코믹', 2::int2, 1::int2, array['개그','야외활동','홍대'],
   '오늘만 일하면 이 지긋지긋한 단칸방 일상에서 해방될 수 있다..!! n년 동안 해피앤딩 방탈출 경비알바로써 수고했다 나자신.. 후후후....오늘도 힘내자, 아자아자 어계인!',
   45::int2, '2~6', 0, 'https://happyanding.co.kr/layout/res/home.php?go=rev.make&s_theme_num=3', 'https://happyanding.co.kr/file/theme/3_a.jpg'),
  ('앨리스전', '해피앤딩 홍대점', '판타지', 3::int2, 1::int2, array['판타지','동화','홍대'],
   '오늘은 친구와 함께 ‘거울나라 앨리스 특별전’을 보기로 한 날. 하지만 약속 시간에 늦어버렸고 서둘러 전시장에 도착했을 때 이미 도슨트 해설은 시작된 뒤였다. 결국 친구는 전시장 바깥에서 만나기로 했고 나는 혼자 녹음 가이드를 들으며 전시를 따라 걷기 시작했다.',
   60::int2, '2~6', 0, 'https://happyanding.co.kr/layout/res/home.php?go=rev.make&s_theme_num=4', 'https://happyanding.co.kr/file/theme/4_a.jpg')
),
upd as (
  update public.catalog c set genre=v.genre, difficulty=v.difficulty, fear_level=v.fear_level, tags=v.tags, teaser=v.teaser,
         time_limit=v.time_limit, players=v.players, price=v.price, reservation_url=v.reservation_url, poster_url=v.poster_url
  from v where c.name=v.name and c.cafe=v.cafe returning c.name
)
insert into public.catalog (name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url, poster_url)
select v.* from v where not exists (select 1 from public.catalog c where c.name=v.name and c.cafe=v.cafe);

select name, cafe, genre, difficulty, fear_level, time_limit, players from public.catalog where cafe like '해피앤딩%';
