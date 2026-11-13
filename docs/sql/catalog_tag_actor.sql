-- '배우가 나오는 방'(이머시브) 모음: 공식 안내에 배우·연기자·직원 NPC 가 함께한다고 적힌 테마에만 '배우연출' 꼬리표.
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전(이미 있으면 그대로).
-- 넣은 뒤: https://bangtallog.com/search?q=배우연출 에서 바로 모아 보인다(배포 필요 없음, 최대 1시간).
--   포인트나인 홍대 LISTEN  : "LISTEN 배우들의 연출이 들어간 테마입니다"
--   포인트나인 홍대 SILENT  : "SILENT 배우들의 연출이 들어간 테마입니다"
--   키이스케이프 에버랜드 Memory of Poppy : "연기자와 직접 상호작용하며 몰입할 수 있는 이머시브 방탈출"
--   상상의문 수원 2호점 춘화각 : "해당 테마는 직원 NPC와 함께하는 테마입니다"
update public.catalog
set tags = array_append(coalesce(tags, '{}'), '배우연출')
where id in (
  'f8e10d97-b5ef-42e0-a644-75b014fffb3b',
  '10ee9f77-f6a9-4600-9c91-5eb293f7d2e0',
  '5504a901-c2fe-4e4f-9262-aa0a84066288',
  '5bcecef5-c59b-41a4-bb31-dda03276f724'
)
and not ('배우연출' = any(coalesce(tags, '{}')));
