-- 둠이스케이프 테마 15개에 공식 포스터 주소를 연결한다(선택 사항).
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전(고치기만 한다).
-- 출처: 공식 사이트 https://doomescape.com 테마설명의 포스터 그림 주소 그대로(2026-11-16, 15개 모두 열리는 것 확인).
--   사이트에 ALL RIGHT RESERVED 표기가 있다 → 매장이 내려 달라고 하면 아래 되돌리기 한 줄로 바로 내린다.
--   그림을 우리 쪽에 복사하지 않고 매장 서버에서 불러오는 방식. 용량이 큰 것이 있다(트리거·스네어 약 9MB, 데이투어·허수아비 약 6MB).
-- 되돌리기: update public.catalog set poster_url = '' where cafe like '둠이스케이프%';

with v(name, cafe, poster_url) as (values
  ('나폴리탄', '둠이스케이프 1호점', 'https://doomescape.com/file/theme/29_3290704845.png'),
  ('Rendering', '둠이스케이프 1호점', 'https://doomescape.com/file/theme/8_9783995423.gif'),
  ('기담정', '둠이스케이프 1호점', 'https://doomescape.com/file/theme/27_1252036177.gif'),
  ('인앤아웃', '둠이스케이프 1호점', 'https://doomescape.com/file/theme/28_6918521244.gif'),
  ('운명', '둠이스케이프 2호점', 'https://doomescape.com/file/theme/30_1050141195.gif'),
  ('디스토피아', '둠이스케이프 2호점', 'https://doomescape.com/file/theme/31_1878173996.gif'),
  ('죄', '둠이스케이프 2호점', 'https://doomescape.com/file/theme/32_1490545499.gif'),
  ('인바이트', '둠이스케이프 2호점', 'https://doomescape.com/file/theme/33_8813716089.gif'),
  ('슬래셔', '둠이스케이프 DTH점(부평)', 'https://doomescape.com/file/theme/19_5166969671.com-resize'),
  ('트리거', '둠이스케이프 DTH점(부평)', 'https://doomescape.com/file/theme/22_3601104894.gif'),
  ('언리얼', '둠이스케이프 DTH점(부평)', 'https://doomescape.com/file/theme/24_1971649662.jpg'),
  ('스네어', '둠이스케이프 DTH점(부평)', 'https://doomescape.com/file/theme/25_5304512153.gif'),
  ('데이투어', '둠이스케이프 FEAR점(수원)', 'https://doomescape.com/file/theme/36_5389952639.png'),
  ('옵스큐라', '둠이스케이프 FEAR점(수원)', 'https://doomescape.com/file/theme/35_1355284173.png'),
  ('허수아비', '둠이스케이프 FEAR점(수원)', 'https://doomescape.com/file/theme/34_4437239922.png')
)
update public.catalog c set poster_url = v.poster_url
from v where c.name = v.name and c.cafe = v.cafe;

-- 결과 확인(15줄, has_poster 가 모두 true)
select cafe, name, poster_url <> '' as has_poster from public.catalog where cafe like '둠이스케이프%' order by cafe, name;
