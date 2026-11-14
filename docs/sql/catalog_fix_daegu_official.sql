-- 대구 테마 값 바로잡기 — 공식 예약 페이지에서 2026-11-14 확인
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전.
-- 셜록홈즈 대구동성로점(bno=84) 공지: "단잠 테마 스토리 변경, 플레이 타임 변경(60분→65분)", 상세 팝업 공포도 0%
-- 서울이스케이프룸 /room: 접견 장르 '스릴러'
update public.catalog set time_limit = 65, fear_level = 0 where name = '단잠' and cafe = '셜록홈즈 대구동성로점';
update public.catalog set genre = '스릴러' where name = '접견' and cafe = '서울이스케이프룸 대구 동성로점';
select name, cafe, genre, fear_level, time_limit from public.catalog where (name, cafe) in (('단잠','셜록홈즈 대구동성로점'),('접견','서울이스케이프룸 대구 동성로점'));
