-- 기간 한정 공연용 칸: 끝나는 날(run_until). 이 날이 지나면 /immersive 목록에서 자동으로 사라진다.
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전.
alter table public.catalog add column if not exists run_until date;

-- 대흥씨어터 카지노(대전): 공식 예매 페이지 공연 기간 2026-10-22 ~ 2026-12-31
update public.catalog set run_until = '2026-12-31'
where cafe = '대흥씨어터 (대전)' and name like '카지노%';

select name, cafe, run_until from public.catalog where run_until is not null;
