-- 이름 변경 남은 것: 이머시브 포스터 주소가 예전 도메인(bangtallog.com)으로 들어가 있음 → 새 도메인으로.
-- (예전 주소도 301 로 열리긴 하지만, 화면 소스에 예전 이름이 남지 않게.) 여러 번 실행해도 안전.
update public.catalog set poster_url = replace(poster_url, 'https://bangtallog.com/', 'https://talkkaknote.com/')
where poster_url like 'https://bangtallog.com/%';
select count(*) as left_over from public.catalog where poster_url like '%bangtallog%';
