-- 화제의 방 표 만들기 + 첫 항목. Supabase → SQL Editor 에 붙여 넣고 Run (여러 번 실행해도 안전).

-- ─────────────────────────────────────────────────────────────
-- 화제의 방(스포트라이트): 홈 "지금 화제인 방"과 /spotlight/<slug> 정리 페이지의 내용.
-- 관리자 화면(/admin/spotlights)에서 넣고 고친다. 누구나 읽기, 쓰기는 관리자만. 재실행 안전.
-- facts: [{"label","value","note"}], faq: [{"q","a"}]
-- ─────────────────────────────────────────────────────────────
create table if not exists public.spotlights (
  slug            text primary key check (slug ~ '^[a-z0-9-]{2,60}$'),
  label           text not null default '',
  name            text not null default '',
  title           text not null default '',
  lead            text not null default '',
  seo_title       text not null default '',
  seo_description text not null default '',
  cafe_includes   text not null default '',
  facts           jsonb not null default '[]',
  faq             jsonb not null default '[]',
  source_name     text not null default '',
  source_url      text not null default '',
  checked_at      date not null default current_date,
  until           date not null default (current_date + 30),
  created_at      timestamptz not null default now()
);

alter table public.spotlights enable row level security;

drop policy if exists spotlights_select on public.spotlights;
create policy spotlights_select on public.spotlights
  for select using (true);

drop policy if exists spotlights_write on public.spotlights;
create policy spotlights_write on public.spotlights
  for all using (public.is_admin()) with check (public.is_admin());

-- 첫 항목: 메이플스토리 이스케이프 (이미 있으면 건드리지 않는다)
insert into public.spotlights
  (slug, label, name, title, lead, seo_title, seo_description, cafe_includes, facts, faq, source_name, source_url, checked_at, until)
values (
  'maplestory-escape', '신규 오픈', '메이플스토리 이스케이프',
  '결말이 비어 있는 책 다섯 권이 발견됐다',
  '홍대에 메이플스토리 방탈출 카페가 생겼어요. 차원의 도서관에서 책 속 용사가 되어 ''차원의 조각''을 찾아 빈 결말을 채우는 이야기로, 테마는 다섯 개예요.',
  '메이플스토리 방탈출 ''메이플스토리 이스케이프'' 테마 5개·예약·가격·인원 정리',
  '홍대 메이플스토리 이스케이프 방탈출 테마 5개(커닝시티·무릉도장·헌티드 맨션·에델슈타인·루디브리엄)의 장르, 난이도, 공포도, 최소 인원, 요금, YES24 예약 방법을 공식 정보 기준으로 정리했어요.',
  '메이플스토리 이스케이프',
  '[{"label":"위치","value":"서울 마포구 와우산로 90","note":"홍익대 정문 앞"},{"label":"플레이 시간","value":"테마마다 60분"},{"label":"인원","value":"커닝시티 2~6명 · 나머지 3~6명","note":"2026년 10월 19일부터 최소 인원이 바뀌었어요"},{"label":"요금","value":"1인 29,000원"},{"label":"예약","value":"YES24 티켓","note":"매주 월요일 오전 10시에 열려요"},{"label":"운영 기간","value":"2028년 9월 20일까지","note":"약 2년 상설"},{"label":"주의","value":"폐쇄공포증·노약자 입장 제한"}]'::jsonb,
  '[{"q":"메이플스토리 이스케이프는 몇 명부터 할 수 있나요?","a":"''커닝시티, 사라진 사람들''은 2명부터, 나머지 네 테마는 3명부터 할 수 있어요(최대 6명). 2026년 10월 19일부터 바뀐 기준이에요."},{"q":"예약은 어디서 하나요?","a":"YES24 티켓에서 예매해요. 정기 예약은 매주 월요일 오전 10시에 열려요."},{"q":"무서운가요?","a":"공식 공포도는 커닝시티와 헌티드 맨션이 5단계 중 2, 무릉도장·에델슈타인·루디브리엄은 공포 요소가 없어요."},{"q":"메이플스토리를 몰라도 할 수 있나요?","a":"책 속 세계에 들어가 사건을 해결하는 방탈출이라 게임을 몰라도 진행할 수 있어요. 게임을 아는 분은 익숙한 마을과 인물을 만나는 재미가 더해져요."}]'::jsonb,
  '메이플스토리 이스케이프 공식 사이트', 'https://maplestoryescape.com', '2026-11-13', '2026-12-31'
) on conflict (slug) do nothing;

select slug, name, until from public.spotlights;
