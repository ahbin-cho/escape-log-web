-- 인사이드 더 플레이: 카지노X — 예매가 열린 NOL 티켓 공식 상품 페이지(운영자 확인 2026-11-15)를 '예약하기' 링크로.
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전.
update public.catalog
set reservation_url = 'https://nol.yanolja.com/ticket/products/26014816',
    booking_open = 'NOL 티켓에서 예매 중'
where id = '73830bc1-d8e1-4f22-ac70-fad65db9d5ee';
select name, reservation_url, booking_open from public.catalog where id = '73830bc1-d8e1-4f22-ac70-fad65db9d5ee';
