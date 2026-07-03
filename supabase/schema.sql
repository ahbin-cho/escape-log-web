-- ─────────────────────────────────────────────────────────────
-- 방탈로그 Supabase 스키마
-- Supabase 대시보드 → SQL Editor 에 통째로 붙여넣고 "Run" 하세요.
-- (여러 번 실행해도 안전하도록 IF NOT EXISTS / OR REPLACE 사용)
-- ─────────────────────────────────────────────────────────────

-- 1) 프로필: 로그인 사용자별 공개 닉네임
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  nickname   text,
  created_at timestamptz not null default now()
);

-- 가입 시 프로필 자동 생성 (닉네임 기본값 = 이메일 앞부분)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) 관리자 허용목록 (단일 출처)
create table if not exists public.admins (
  email text primary key
);

-- ▼▼▼ 본인 이메일을 넣으세요 (로그인에 쓰는 이메일과 동일해야 함) ▼▼▼
-- insert into public.admins (email) values ('you@example.com') on conflict do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where email = (auth.jwt() ->> 'email')
  );
$$;

-- 3) 기록 (개인 일기 + 공개 후기)
create table if not exists public.records (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  theme_name     text not null default '',
  cafe_name      text not null default '',
  played_at      date,
  genre          text not null default '기타',
  difficulty     int2 not null default 3,
  fear_level     int2 not null default 3,
  rating         int2 not null default 3,
  success        bool not null default false,
  remaining_time text not null default '',
  hint_count     int2 not null default 0,
  one_liner      text not null default '',
  memo           text not null default '',
  is_public      bool not null default false,
  hidden         bool not null default false,
  created_at     timestamptz not null default now()
);

create index if not exists records_user_idx   on public.records (user_id);
create index if not exists records_public_idx on public.records (is_public, hidden);

-- 4) 카탈로그 (추천 후보 테마 — 어드민이 관리)
create table if not exists public.catalog (
  id         uuid primary key default gen_random_uuid(),
  name       text not null default '',
  cafe       text not null default '',
  genre      text not null default '기타',
  difficulty int2 not null default 3,
  fear_level int2 not null default 3,
  tags       text[] not null default '{}',
  teaser     text not null default '',
  hint       text not null default '',
  spoiler    text not null default '',
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- RLS (Row Level Security)
-- ─────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.records  enable row level security;
alter table public.catalog  enable row level security;
alter table public.admins   enable row level security;

-- profiles: 누구나 읽기(닉네임 표시), 본인만 수정
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (true);

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- records: 본인 것 전부 / 공개+미숨김은 누구나 / 관리자는 전부
drop policy if exists records_select on public.records;
create policy records_select on public.records
  for select using (
    auth.uid() = user_id
    or (is_public = true and hidden = false)
    or public.is_admin()
  );

drop policy if exists records_insert on public.records;
create policy records_insert on public.records
  for insert with check (auth.uid() = user_id);

drop policy if exists records_update on public.records;
create policy records_update on public.records
  for update using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists records_delete on public.records;
create policy records_delete on public.records
  for delete using (auth.uid() = user_id or public.is_admin());

-- catalog: 누구나 읽기(비로그인 포함), 쓰기는 관리자만
drop policy if exists catalog_select on public.catalog;
create policy catalog_select on public.catalog
  for select using (true);

drop policy if exists catalog_write on public.catalog;
create policy catalog_write on public.catalog
  for all using (public.is_admin()) with check (public.is_admin());

-- admins: 관리자만 조회(목록 노출 방지). is_admin() 은 security definer 라 이 정책과 무관하게 동작.
drop policy if exists admins_select on public.admins;
create policy admins_select on public.admins
  for select using (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- 카탈로그 시드 (비어 있을 때만 1회 삽입)
-- ─────────────────────────────────────────────────────────────
insert into public.catalog (name, cafe, genre, difficulty, fear_level, tags, teaser, hint, spoiler)
select * from (values
  ('속삭이는 다락방','달빛방탈출 성수점','공포',4,5,array['귀신','청각연출','몰입'],'낡은 다락방에서 들려오는 작은 목소리. 심장 단단히 챙겨오세요.','소리에 집중하면 순서가 보입니다. 서두르지 말고 귀 기울이기.','축음기 3개를 소리 순서대로 작동시키면 다락문이 열립니다.'),
  ('사라진 마카롱','몽글이스케이프 연남점','감성',2,1,array['아기자기','디저트','힐링'],'파티시에의 비밀 레시피를 찾아 떠나는 달콤한 방.','색깔 순서가 곧 레시피입니다. 진열장을 잘 보세요.','마카롱 색을 무지개 순서로 놓으면 금고가 열립니다.'),
  ('은하수 배달부','코스모방탈출 홍대점','SF',3,1,array['우주','장치','협동'],'고장난 우주선, 남은 산소는 60분. 지구로 돌아갈 수 있을까요?','별자리 패널이 콘솔 좌표와 연결돼 있습니다.','오리온자리 좌표를 콘솔에 입력하면 엔진이 재가동됩니다.'),
  ('고양이 탐정 사무소','냥트릭 강남점','추리',3,1,array['동물','추리','귀여움'],'사라진 참치캔의 행방을 쫓는 탐정이 되어보세요.','발자국 방향과 시계 시간이 알리바이를 말해줍니다.','3시 방향 발자국의 주인이 범인, 자물쇠 번호는 0300.'),
  ('폐병원 301호','다크룸 부평점','공포',5,5,array['고난도','귀신','배우연출'],'불 꺼진 병동, 사라진 환자 기록. 배우 연출 포함 하드코어.','차트 번호는 흩어진 X-ray에 숨어 있습니다.','X-ray 4장의 숫자를 더하면 병실 캐비닛 비번입니다.'),
  ('구름 위 우체국','몽글이스케이프 연남점','감성',2,1,array['편지','따뜻함','입문'],'전하지 못한 편지들을 배달하는 포근한 이야기.','우표 그림이 곧 배달 순서입니다.','계절 우표를 봄여름가을겨울로 꽂으면 마지막 편지가 나옵니다.'),
  ('웃음도둑을 잡아라','깔깔방탈출 건대점','코믹',2,1,array['코믹','가족','쉬움'],'마을의 웃음을 훔쳐간 도둑을 잡으러 출동.','썰렁한 농담 카드의 펀치라인을 이어보세요.','농담 3개의 첫 글자를 모으면 ''ㅋㅋㅋ'' 다이얼 정답.'),
  ('잊혀진 등대','파도소리 속초점','모험',4,2,array['모험','바다','장치'],'폭풍 치는 밤, 꺼진 등대에 다시 불을 밝혀야 합니다.','모스부호와 등대 점멸 패턴이 짝을 이룹니다.','모스부호 ''SOS''를 레버로 재현하면 등대에 불이 들어옵니다.')
) as seed
where not exists (select 1 from public.catalog);
