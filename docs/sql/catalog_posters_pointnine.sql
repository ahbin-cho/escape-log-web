-- 포인트나인 공식 포스터 채우기 (출처: https://point-nine.com/layout/res/home.php?go=theme.list, 2026-11-13 확인)
-- Supabase → SQL Editor 에 붙여 넣고 Run. 비어 있는 것만 채운다.
update public.catalog c set poster_url = v.poster from (values
  ('a9ee7292-73e1-4ebe-947c-f1308f05d3e1'::uuid, 'https://point-nine.com/file/theme/8_a.jpg'),  -- 포인트나인 강남점 / EP1 : 시간이 멈춘 마을 [공식 표기: EP1 : 시간이 멈춘 마을 ()] (285x285 square)
  ('95242f3a-9ab5-450c-89b4-41464f8e4141'::uuid, 'https://point-nine.com/file/theme/6_a.jpg'),  -- 포인트나인 강남점 / EP2 : 열쇠공의 이중생활 [공식 표기: EP2 : 열쇠공의 이중생활 ()] (285x281 square)
  ('b565ddd9-b514-4a81-8b30-2462f28f95fb'::uuid, 'https://point-nine.com/file/theme/28_a.jpg'),  -- 포인트나인 강남점 / EP3 : 눈 먼 귀금속상인의 후회 [공식 표기: EP3 : 눈 먼 귀금속상인의 후회 ()] (285x285 square)
  ('1a4514ba-fd3f-41b8-b0bd-d796d7071397'::uuid, 'https://point-nine.com/file/theme/14_a.jpg'),  -- 포인트나인 강남점 / EP4 : 주인 없는 낡은 서점 [공식 표기: EP4 : 주인 없는 낡은 서점 ()] (285x280 square)
  ('1a17e8a0-3ed3-4b95-9e36-104e0c6b8396'::uuid, 'https://point-nine.com/file/theme/34_a.jpg'),  -- 포인트나인 건대점 / ALBA [공식 표기: ALBA (잠입)] (1042x697 landscape)
  ('30746847-e17a-4569-a585-d6c9bf9bf6c7'::uuid, 'https://point-nine.com/file/theme/32_a.jpg'),  -- 포인트나인 건대점 / Jack in the Show [공식 표기: Jack in the Show (다크판타지)] (285x403 portrait)
  ('63bc091b-7bc0-4322-9e30-48cb43d1ce6b'::uuid, 'https://point-nine.com/file/theme/33_a.jpg'),  -- 포인트나인 건대점 / RETURN [공식 표기: RETURN (드라마)] (834x555 landscape)
  ('f8e10d97-b5ef-42e0-a644-75b014fffb3b'::uuid, 'https://point-nine.com/file/theme/38_a.jpg'),  -- 포인트나인 홍대점 / LISTEN [공식 표기: LISTEN (스릴)] (3240x4582 portrait)
  ('10ee9f77-f6a9-4600-9c91-5eb293f7d2e0'::uuid, 'https://point-nine.com/file/theme/37_a.jpg')  -- 포인트나인 홍대점 / SILENT [공식 표기: SILENT (스릴, 수사)] (285x285 square)
) as v(id, poster) where c.id = v.id and coalesce(c.poster_url,'') = '';
select count(*) filter (where coalesce(poster_url,'')<>'') as 포스터있음, count(*) as 전체 from public.catalog where cafe like '포인트나인%';
