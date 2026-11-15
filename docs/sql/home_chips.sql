-- 홈 검색창 아래 '많이 찾는' 칩을 SQL 로 바꿀 수 있게 하는 표 + 처음 칩들. Supabase → SQL Editor 에 붙여 넣고 Run(여러 번 실행해도 안전).
--
-- 칩 하나 = 한 줄.
--   label : 칩에 보이는 글자
--   href  : 누르면 갈 주소(사이트 안 경로, 예: /region/수원, /immersive). 비워 두면 label 로 검색창이 열린다
--   sort  : 작은 수가 앞
--   active: false 면 숨김
--   until : 이 날짜까지만 보임(비우면 계속)
-- 바꾸기 예) 순서 바꾸기   update public.home_chips set sort = 5 where label = '공포';
--          숨기기        update public.home_chips set active = false where label = '키이스케이프';
--          새로 넣기     insert into public.home_chips (label, href, sort) values ('부산 방탈출', '/region/부산', 3);
-- 표가 비었거나 못 읽으면 사이트는 원래 칩(강남·홍대·안 무서운·공포·감성·키이스케이프)을 보여 준다.
create table if not exists public.home_chips (
  id         bigserial primary key,
  label      text not null,
  href       text not null default '',
  sort       int  not null default 100,
  active     boolean not null default true,
  until      date,
  created_at timestamptz not null default now()
);
alter table public.home_chips enable row level security;
drop policy if exists home_chips_select on public.home_chips;
create policy home_chips_select on public.home_chips for select using (true);
drop policy if exists home_chips_write on public.home_chips;
create policy home_chips_write on public.home_chips for all using (public.is_admin()) with check (public.is_admin());

-- 처음 칩(이미 같은 이름이 있으면 건너뜀)
insert into public.home_chips (label, href, sort)
select v.label, v.href, v.sort from (values
  ('수원 방탈출',   '/region/수원', 1),
  ('🎭 배우가 있는 방', '/immersive', 2),
  ('강남',          '',            10),
  ('홍대',          '',            11),
  ('안 무서운',      '',            12),
  ('공포',          '',            13),
  ('감성',          '',            14),
  ('키이스케이프',    '',            15)
) as v(label, href, sort)
where not exists (select 1 from public.home_chips c where c.label = v.label);

select label, href, sort, active, until from public.home_chips order by sort, id;
