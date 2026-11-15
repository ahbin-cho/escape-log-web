-- 2026-11-15 묶음. Supabase → SQL Editor 에 통째로 붙여 넣고 Run 한 번(여러 번 실행해도 안전).
--  ① 사이트 문구 표(site_items) 만들기 + 처음 칩 넣기 → 관리자 화면 "사이트 문구" 탭에서 고칠 수 있게 됨
--  ② 비공식클래스 예약 주소(NOL 티켓) 넣기

-- ① 사이트 문구 표 ------------------------------------------------------------
-- 한 줄 = 칩 하나 또는 배너 하나. 평소엔 SQL 대신 사이트 관리자 → "사이트 문구" 에서 고치면 된다.
create table if not exists public.site_items (
  id         bigserial primary key,
  kind       text not null check (kind in ('chip', 'banner')),
  label      text not null,                 -- 칩 글자 / 배너 제목
  body       text not null default '',      -- 배너 설명
  cta        text not null default '',      -- 배너 버튼 글자
  href       text not null default '',      -- 누르면 갈 사이트 안 주소(/로 시작)
  art        text not null default '',      -- 배너 그림(/로 시작)
  tone       text not null default 'candy', -- 배너 색: candy | grape | mint
  ad         boolean not null default false,
  sort       int  not null default 100,
  active     boolean not null default true,
  until      date,
  created_at timestamptz not null default now()
);
alter table public.site_items enable row level security;
drop policy if exists site_items_select on public.site_items;
create policy site_items_select on public.site_items for select using (true);
drop policy if exists site_items_write on public.site_items;
create policy site_items_write on public.site_items for all using (public.is_admin()) with check (public.is_admin());

-- 처음 칩(이미 같은 글자가 있으면 건너뜀)
insert into public.site_items (kind, label, href, sort)
select 'chip', v.label, v.href, v.sort from (values
  ('수원 방탈출',      '/region/수원', 1),
  ('🎭 배우가 있는 방', '/immersive',   2),
  ('강남',            '',            10),
  ('홍대',            '',            11),
  ('안 무서운',        '',            12),
  ('공포',            '',            13),
  ('감성',            '',            14),
  ('키이스케이프',      '',            15)
) as v(label, href, sort)
where not exists (select 1 from public.site_items s where s.kind = 'chip' and s.label = v.label);

-- ② 비공식클래스 예약 주소 ------------------------------------------------------
update public.catalog
set reservation_url = 'https://nol.yanolja.com/ticket/products/26016276',
    booking_open    = 'NOL 티켓에서 예매 중'
where id = '4eba7208-dd09-4dd6-ba91-316972c36059';

-- 확인
select kind, label, href, sort, active from public.site_items order by kind, sort, id;
select name, reservation_url, booking_open from public.catalog where id = '4eba7208-dd09-4dd6-ba91-316972c36059';
