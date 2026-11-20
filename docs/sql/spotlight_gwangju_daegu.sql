-- 광주·대구 방탈출 모음 페이지 + 홈 '많이 찾는' 칩 (수원과 같은 방식)
--   → https://talkkaknote.com/spotlight/gwangju · https://talkkaknote.com/spotlight/daegu
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전(모음 페이지는 있으면 고치고, 칩은 없을 때만 넣는다).
-- 테마 목록은 매장 이름에 '광주' / '대구' 가 들어간 테마를 자동으로 모은다(지금 광주 39개 · 대구 45개).
-- 예약 오픈일은 우리 DB(catalog.booking_open)에 이미 들어 있는 값만 적었다(각 매장 공식 예약 페이지·공지에서 확인해 넣은 값).
--   값이 없는 매장(룸즈에이·브레인·숨바꼭질·러시아워 등)은 적지 않았다.
-- created_at 을 옛 날짜로 넣는다: 홈의 큰 '지금 화제인 방' 판은 가장 최근에 넣은 것을 쓰므로, 지금 떠 있는 판을 밀어내지 않게.
--   (홈 '지금 화제' 줄의 링크와 '많이 찾는' 칩에는 수원처럼 나온다. until 까지)

insert into public.spotlights
  (slug, label, name, title, lead, seo_title, seo_description, cafe_includes, facts, faq, source_name, source_url, checked_at, until, created_at)
values
(
  'gwangju', '지역 모음', '광주 방탈출',
  '광주 방탈출, 어디 갈지 고민이라면',
  '충장로·상무지구·수완지구·전대 근처 방탈출 테마를 한곳에 모았어요. 장르·난이도·공포도를 함께 볼 수 있어요.',
  '광주 방탈출 추천 · 테마 정리(난이도·공포도·예약 오픈일)',
  '광주 충장로·상무·수완·전대 방탈출 테마를 장르, 난이도, 공포도, 인원까지 한눈에 정리했어요. 상상의문·룸즈에이·브레인·숨바꼭질·러시아워 등 공식 정보 기준.',
  '광주',
  '[
    {"label":"예약 오픈 · 상상의문 광주점","value":"이용일 6일 전","note":"공식 예약 페이지 기준"},
    {"label":"동네","value":"충장로 · 상무지구 · 수완지구 · 전대","note":"매장 이름에 적힌 지점 기준"},
    {"label":"확인","value":"방문 전 매장 공지를 한 번 더","note":"예약 오픈일은 매장 사정에 따라 바뀔 수 있어요"}
  ]'::jsonb,
  '[
    {"q":"광주에서 처음 가기 좋은 방은?","a":"난이도 3 이하, 공포도 1~2인 테마부터 고르면 무난해요. 아래 목록에서 장르와 난이도를 함께 보세요."},
    {"q":"예약은 언제 열려요?","a":"매장마다 달라요. 상상의문 광주점은 이용일 6일 전에 열려요. 다른 매장은 각 매장 예약 페이지에서 확인해 주세요."},
    {"q":"정보는 어디서 가져왔나요?","a":"각 매장의 공식 홈페이지·예약 페이지 기준이에요. 가기 전에 예약 페이지에서 한 번 더 확인해 주세요."}
  ]'::jsonb,
  '각 매장 공식 홈페이지·예약 페이지', '', '2026-11-20', '2026-12-31', '2026-11-01'
),
(
  'daegu', '지역 모음', '대구 방탈출',
  '대구 방탈출, 어디 갈지 고민이라면',
  '동성로 근처 방탈출 테마를 한곳에 모았어요. 장르·난이도·공포도와 함께, 매장마다 다른 예약 오픈일도 같이 볼 수 있어요.',
  '대구 방탈출 추천 · 동성로 테마 정리(난이도·공포도·예약 오픈일)',
  '대구 동성로 방탈출 테마를 장르, 난이도, 공포도, 인원, 예약 오픈일까지 한눈에 정리했어요. 서울이스케이프룸·지구별방탈출·황금열쇠·셜록홈즈·룸즈에이 등 공식 정보 기준.',
  '대구',
  '[
    {"label":"예약 오픈 · 서울이스케이프룸 대구 동성로점","value":"이용일 14일 전","note":"공식 예약 페이지 기준"},
    {"label":"예약 오픈 · 지구별방탈출 대구점","value":"14일 전 자정","note":"공식 예약 페이지 기준"},
    {"label":"예약 오픈 · 황금열쇠 대구동성로","value":"이용일 6일 전","note":"본점 · 2호점(더킹)"},
    {"label":"예약 오픈 · 셜록홈즈 대구동성로점","value":"몇 달 앞까지 열려 있음","note":"공식 예약 페이지 기준"},
    {"label":"확인","value":"방문 전 매장 공지를 한 번 더","note":"매장 사정에 따라 바뀔 수 있어요"}
  ]'::jsonb,
  '[
    {"q":"대구에서 처음 가기 좋은 방은?","a":"난이도 3 이하, 공포도 1~2인 테마부터 고르면 무난해요. 아래 목록에서 장르와 난이도를 함께 보세요."},
    {"q":"예약은 언제 열려요?","a":"매장마다 달라요. 서울이스케이프룸 대구 동성로점은 14일 전, 지구별방탈출 대구점은 14일 전 자정, 황금열쇠 대구동성로는 6일 전이고, 셜록홈즈 대구동성로점은 몇 달 앞까지 열려 있어요."},
    {"q":"정보는 어디서 가져왔나요?","a":"각 매장의 공식 홈페이지·예약 페이지 기준이에요. 가기 전에 예약 페이지에서 한 번 더 확인해 주세요."}
  ]'::jsonb,
  '각 매장 공식 홈페이지·예약 페이지', '', '2026-11-20', '2026-12-31', '2026-11-01'
)
on conflict (slug) do update set
  label=excluded.label, name=excluded.name, title=excluded.title, lead=excluded.lead,
  seo_title=excluded.seo_title, seo_description=excluded.seo_description, cafe_includes=excluded.cafe_includes,
  facts=excluded.facts, faq=excluded.faq, source_name=excluded.source_name, source_url=excluded.source_url,
  checked_at=excluded.checked_at, until=excluded.until, created_at=excluded.created_at;

-- 홈 '많이 찾는' 칩: 수원 칩 바로 뒤에(같은 sort 1). 이미 있으면 넣지 않는다.
insert into public.site_items (kind, label, body, cta, href, art, tone, ad, sort, active)
select 'chip', v.label, '', '', v.href, '', 'candy', false, 1, true
from (values ('대구 방탈출', '/spotlight/daegu'), ('광주 방탈출', '/spotlight/gwangju')) as v(label, href)
where not exists (select 1 from public.site_items s where s.kind = 'chip' and s.href = v.href);

select slug, name, until, created_at::date from public.spotlights order by created_at desc;
select id, label, href, sort from public.site_items where kind = 'chip' order by sort, id;
