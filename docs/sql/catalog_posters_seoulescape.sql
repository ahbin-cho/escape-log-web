-- 서울이스케이프룸 공식 포스터 채우기 (출처: https://www.seoul-escape.com/reservation, 2026-11-13 확인)
-- Supabase → SQL Editor 에 붙여 넣고 Run. 비어 있는 것만 채운다.
update public.catalog c set poster_url = v.poster from (values
  ('34972415-0441-4d17-8b0e-a593648790ea'::uuid, 'https://www.seoul-escape.com/storage/theme/2025_04/25/iKxAcMEdHPgENq8io77LjiOsUpUnc30waUiy6WWC.jpg'),  -- 서울이스케이프룸 대구 동성로점 / 만찬 (700x934 portrait)
  ('df943947-8306-4312-8a85-2da84e5264c6'::uuid, 'https://www.seoul-escape.com/storage/theme/2022_11/10/1v69Bji3C4BfXvWjvQyAZLfREBqhh2qiG0qnuFyE.png'),  -- 서울이스케이프룸 대구 동성로점 / 엘리베이터 (700x928 portrait)
  ('9495f81d-9af0-4fdc-adea-418a67166162'::uuid, 'https://www.seoul-escape.com/storage/theme/2024_11/07/Wk3WSJZaoEPAFsFkXkG453S2tdPyTtA390in0b9U.png'),  -- 서울이스케이프룸 대구 동성로점 / 오모테나시 (700x933 portrait)
  ('e5a26bf8-1536-437a-8eab-c6547337c9e2'::uuid, 'https://www.seoul-escape.com/storage/theme/2026_04/13/n3gYzpTqFeq7zq2cPB5MTXpKeluaLXz6l9ZrxUNJ.png'),  -- 서울이스케이프룸 대구 동성로점 / 접견 (700x933 portrait)
  ('69aa93f5-c016-45d1-8af6-1101f87a8688'::uuid, 'https://www.seoul-escape.com/storage/theme/2024_04/29/jVyPUo2zAGqjjjH2fcdOrUmvQW6g5iwF8bGnqZc6.png'),  -- 서울이스케이프룸 대구 동성로점 / 춘단화 : 봄을 잘라낸 꽃 [공식 표기: 춘단화] (700x933 portrait)
  ('34b5545a-bff0-41dd-a65f-8ba4c338be81'::uuid, 'https://www.seoul-escape.com/storage/theme/2022_11/30/iF12wBWOnAAZB1FXUL2ROhTIzZDFoGr1R4cBU2uI.jpg'),  -- 서울이스케이프룸 대구 동성로점 / 카지노 (700x928 portrait)
  ('a329a05d-9619-44e1-aa44-01b39d846c86'::uuid, 'https://www.seoul-escape.com/storage/theme/2022_11/10/BTBq44Wo9GD3bc1SxQMQYIvdCtqDCU1I5q5J4cQ9.png'),  -- 서울이스케이프룸 대구 동성로점 / 파킹랏 (700x928 portrait)
  ('58241951-937b-434a-aa1a-c37deab019e3'::uuid, 'https://www.seoul-escape.com/storage/theme/2022_11/10/uEOUNAJAgxoGc14frys8gm3voQOCNCsLyk7cEl1V.png'),  -- 서울이스케이프룸 대구 동성로점 / 팩토리 (700x928 portrait)
  ('23e2ff4d-931d-4687-9b9f-7642b00ab5f9'::uuid, 'https://www.seoul-escape.com/storage/theme/2026_02/24/cOC4Q16XkGyxJTpxRTfrA5C7C2MMUMpgHTMKUHnA.png')  -- 서울이스케이프룸 홍대점 / 오시리스 (604x828 portrait)
) as v(id, poster) where c.id = v.id and coalesce(c.poster_url,'') = '';
select count(*) filter (where coalesce(poster_url,'')<>'') as 포스터있음, count(*) as 전체 from public.catalog where cafe like '서울이스케이프룸%';
