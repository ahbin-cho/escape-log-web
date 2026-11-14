-- UMEPLAY 2관 작품 이름 바로잡기 — 공식 네이버 예약 표기는 "리바이벌 / REVIVER"(리바이벌 이머시브 시네마). 2026-11-14 확인
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전.
update public.catalog set name = '리바이벌 REVIVER' where cafe = 'UMEPLAY 홍대 2관' and name = '리바이버 REVIVER';
select id, name, cafe from public.catalog where cafe like 'UMEPLAY%';
