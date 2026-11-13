-- 수원 방탈출 모음 페이지 만들기 → https://bangtallog.com/spotlight/suwon
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전(있으면 고친다).
-- 홈의 '지금 화제인 방'(메이플)을 밀어내지 않도록 until 을 어제로 둔다 → 홈에는 안 뜨고, 주소로는 열린다.
-- 테마 목록은 매장 이름에 '수원'이 들어간 테마를 자동으로 모은다(DB 에 새로 넣으면 1시간 안에 함께 보인다).
-- 예약 오픈일은 2026-11-13 공식 예약 페이지·공지로 확인해 DB 에 넣은 값과 같다.

insert into public.spotlights
  (slug, label, name, title, lead, seo_title, seo_description, cafe_includes, facts, faq, source_name, source_url, checked_at, until)
values (
  'suwon', '지역 모음', '수원 방탈출',
  '수원 방탈출, 어디 갈지 고민이라면',
  '수원역·인계동 근처 방탈출 테마를 한곳에 모았어요. 장르·난이도·공포도와 함께, 매장마다 다른 예약 오픈일도 같이 볼 수 있어요.',
  '수원 방탈출 추천 · 테마 정리(난이도·공포도·예약 오픈일)',
  '수원역·인계동 방탈출 테마를 장르, 난이도, 공포도, 인원, 예약 오픈일까지 한눈에 정리했어요. 셜록홈즈·상상의문·룸즈에이·이스케이프월드 등 공식 정보 기준.',
  '수원',
  '[
    {"label":"예약 오픈 · 상상의문 수원","value":"이용일 6일 전","note":"수원점·수원 2호점"},
    {"label":"예약 오픈 · 이스케이프월드 수원","value":"7일 전 밤 11시","note":"방자전·ESCAPE SCHOOL"},
    {"label":"예약 오픈 · 룸즈에이 수원역","value":"이용일 14일 전","note":"수원역점·수원역 2호점"},
    {"label":"예약 오픈 · 셜록홈즈 수원","value":"몇 달 앞까지 열려 있음","note":"수원역점·수원역2호점·수원인계점"},
    {"label":"확인","value":"방문 전 매장 공지를 한 번 더","note":"매장 사정에 따라 바뀔 수 있어요"}
  ]'::jsonb,
  '[
    {"q":"수원에서 처음 가기 좋은 방은?","a":"난이도 3 이하, 공포도 1~2인 테마부터 고르면 무난해요. 아래 목록에서 장르와 난이도를 함께 보세요."},
    {"q":"예약은 언제 열려요?","a":"매장마다 달라요. 상상의문 수원은 6일 전, 이스케이프월드는 7일 전 밤 11시, 룸즈에이 수원역은 14일 전이고, 셜록홈즈 수원 3곳은 몇 달 앞까지 열려 있어요."},
    {"q":"정보는 어디서 가져왔나요?","a":"각 매장의 공식 홈페이지·예약 페이지 기준이에요. 가기 전에 예약 페이지에서 한 번 더 확인해 주세요."}
  ]'::jsonb,
  '각 매장 공식 홈페이지·예약 페이지', '', '2026-11-13', '2026-11-12'
)
on conflict (slug) do update set
  label=excluded.label, name=excluded.name, title=excluded.title, lead=excluded.lead,
  seo_title=excluded.seo_title, seo_description=excluded.seo_description, cafe_includes=excluded.cafe_includes,
  facts=excluded.facts, faq=excluded.faq, source_name=excluded.source_name, source_url=excluded.source_url,
  checked_at=excluded.checked_at, until=excluded.until;

select slug, name, until from public.spotlights order by slug;
