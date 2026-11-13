-- 파노라마 부산점(부산 남구 용소로14번길 9 지하1층, 경성대·부경대역 5번 출구 200m) 테마 추가
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 중복으로 들어가지 않음.
-- 출처: 네이버 예약 https://m.booking.naver.com/booking/12/bizes/1481465 (2026-11-13 확인)
--   확인된 것: 테마 이름, 줄거리(공식 소개 문구), 60분, 예약 링크. 매장 공지 "일반 테마 1개 운영 중, 프리미엄 테마 2개 오픈 예정"
--   확인 안 된 것: 장르·난이도·공포도·인원·가격 → 임시값(장르 SF, 난이도 2, 공포도 1). 공식 수치를 알게 되면 고칠 것.
--   (난이도 2 는 "입문자도 무리 없는 쉬운 난이도"라는 방문 후기 기준)

insert into public.catalog
  (name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url)
select v.* from (values
  ('미래재난리포트', '파노라마 부산점', 'SF', 2::int2, 1::int2, array['입문','부산'],
   'SYSTEM : [파랑]의 메세지가 도착하였습니다. [나비]의 [날갯짓]이 관측되었습니다. 감지된 파동의 위험도 측정중... CODE : [ RED ] / 재난 발생 확률 [ 98.72% ]. 전 요원은 신속히 대응 프로토콜을 실행하십시오.',
   60::int2, '', 0, 'https://m.booking.naver.com/booking/12/bizes/1481465/items/7022523')
) as v(name, cafe, genre, difficulty, fear_level, tags, teaser, time_limit, players, price, reservation_url)
where not exists (select 1 from public.catalog c where c.name = v.name and c.cafe = v.cafe);

select id, name, cafe, genre, difficulty, time_limit from public.catalog where cafe like '파노라마%';
