-- 비공식클래스: 기억표백의 진실편 — NOL 티켓 상품 상세(운영자 캡처 2026-11-15)로 확인한 값 넣기.
--   공연 2026.11.26~12.27 · 목·금 22:30 / 토·일 18:30, 21:30 · 85분 · 만 16세 이상 · 55,000원 · NOL 단독
--   프리쇼 본공연 8분 전(평일 22:10 / 주말 18:10, 21:10) · 드레스 코드 교복(권장)
--   NOL 달력: 12/13까지 회차 전석 매진, 12/14 이후 회차는 아직 안 열림 → 2차 11/30(월) 12:00(보도자료 기준)
-- Supabase → SQL Editor 에 붙여 넣고 Run(여러 번 실행해도 안전).
update public.catalog
set time_limit   = 85,
    price        = 55000,
    tags         = case when '16세 미만 불가' = any(tags) then tags else array_append(tags, '16세 미만 불가') end,
    teaser       = '고교탐정단 ''비공식 KLASS'' 신입 탐정이 되어, 배우들과 함께 공간을 이동하며 숨겨진 단서로 사건을 추리한다(SPORTS CENTER편). 목·금 22:30 / 토·일 18:30·21:30, 프리쇼 8분 전 시작, 드레스 코드 교복.',
    booking_open = '1차 매진 · 2차 티켓 11/30(월) 낮 12시 NOL 오픈'
where id = '4eba7208-dd09-4dd6-ba91-316972c36059';

select name, time_limit, price, tags, booking_open, teaser
from public.catalog where id = '4eba7208-dd09-4dd6-ba91-316972c36059';
