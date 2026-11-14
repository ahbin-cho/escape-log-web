-- 서울이스케이프룸 리틀보이는 '대구' 지점(공식 사이트 찾아오는길 branch=9: 대구 중구 동성로3길 68 4층, 2026-11-14 확인)
-- 처음 SQL 에서 홍대로 잘못 넣었던 것을 고친다. 테마 id 는 그대로라 링크는 계속 쓸 수 있다.
update public.catalog
set cafe = '서울이스케이프룸 대구 리틀보이',
    tags = array_replace(tags, '홍대', '대구')
where cafe = '서울이스케이프룸 리틀보이';
select id, name, cafe, tags from public.catalog where cafe like '서울이스케이프룸%리틀보이%';
