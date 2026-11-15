-- 이머시브 테마 포스터 연결(2026-11-15). 포스터는 운영자가 공식 예약 페이지에서 캡처해 준 것 → public/posters/immersive/<id>.jpg
-- (2:3 틀에 포스터를 자르지 않고 통째로 넣고, 남는 자리는 같은 그림을 흐리게 깔았다)
-- Supabase → SQL Editor 에 붙여 넣고 Run. 여러 번 실행해도 안전.
update public.catalog c set poster_url = 'https://bangtallog.com/posters/immersive/' || c.id || '.jpg'
where c.id in (
  'a7cb5e28-a27a-4dac-93ea-fa5aa4e2630a', -- 한강대 담력훈련
  'b5e27ab4-507b-494d-b5bf-dea5cae2b699', -- 제일기숙학원
  '287a6a6a-472f-4930-8a42-3c99d044d882', -- BLACK MUSE
  '51f926fa-4853-4c98-89d5-2dd8b4041409', -- 위드아웃유
  '9974ff3f-2cb6-4a7d-a068-9733bbd77b93', -- 인세인 INSANE
  '16d0f9bf-78d6-45ae-ac1b-97ca1e3b8f08', -- 슬립노모어 서울
  'ee05926c-93d1-4dd6-8290-784e1bdc7c92', -- 아바타
  'a8427c14-e634-4b4c-b7ae-93d94c8cb794', -- 리바이벌 REVIVER
  'ab5d5167-2b31-4a13-8132-bd973484b10c', -- 카지노: 게임의 법칙
  '4eba7208-dd09-4dd6-ba91-316972c36059', -- 비공식클래스: 기억표백의 진실편
  '73830bc1-d8e1-4f22-ac70-fad65db9d5ee'  -- 인사이드 더 플레이: 카지노X
);
select name, cafe, poster_url from public.catalog where poster_url like '%/posters/immersive/%' order by name;
