-- 제로월드 공식 포스터 채우기 (출처: https://zeroworldkorea.com/layout/res/home.php?go=rev.make, 2026-11-13 확인)
-- Supabase → SQL Editor 에 붙여 넣고 Run. 비어 있는 것만 채운다.
update public.catalog c set poster_url = v.poster from (values
  ('5c89755c-1e99-4a42-ab4c-68fe4590566b'::uuid, 'https://zeroworldkorea.com/file/theme/26_6862357033.png'),  -- 제로월드 강남점 / DONE (480x680 portrait)
  ('becba5b1-61d8-4758-8a5f-a30c8baa9c34'::uuid, 'https://zeroworldkorea.com/file/theme/31_1413439783.png'),  -- 제로월드 강남점 / 나비효과 (480x680 portrait)
  ('f38fe9f0-83a5-4de2-9384-9adcd02967a9'::uuid, 'https://zeroworldkorea.com/file/theme/32_8119401658.png'),  -- 제로월드 강남점 / 링 (480x680 portrait)
  ('a10887a2-3ec6-47fd-af60-cb5fc11f9993'::uuid, 'https://zeroworldkorea.com/file/theme/28_6019351846.png'),  -- 제로월드 강남점 / 아이엠 (480x680 portrait)
  ('5e7e50fd-2f67-4bd1-8ead-951c17aca62e'::uuid, 'https://zeroworldkorea.com/file/theme/29_9011501549.png'),  -- 제로월드 강남점 / 어느겨울밤2 (480x680 portrait)
  ('06b0f253-7c57-4e1f-9760-cc33aaab4b12'::uuid, 'https://zeroworldkorea.com/file/theme/27_5174624165.png'),  -- 제로월드 강남점 / 제로호텔L (480x680 portrait)
  ('820f31b5-1dd5-40e4-8a77-575cdc1d89d3'::uuid, 'https://zeroworldkorea.com/file/theme/30_4361012266.png'),  -- 제로월드 강남점 / 콜러 (480x680 portrait)
  ('22cb0039-d6d7-4191-aae2-18574715cfb8'::uuid, 'https://zeroworldkorea.com/file/theme/25_5764603364.png'),  -- 제로월드 강남점 / 포레스트 (FORREST) (480x680 portrait)
  ('f1f114cc-8cbb-4f37-8906-07858206b5b6'::uuid, 'https://zeroworldkorea.com/file/theme/24_6795775423.png'),  -- 제로월드 강남점 / 헐! (480x680 portrait)
  ('95ddae21-c990-4724-b254-8c29bea920ad'::uuid, 'https://zeroworldkorea.com/file/theme/14_7610250240.png'),  -- 제로월드 김포본점 / FEAR (480x680 portrait)
  ('ba22a99b-c0c5-4d72-b9c5-95c3f387970c'::uuid, 'https://zeroworldkorea.com/file/theme/16_1333210546.png'),  -- 제로월드 김포본점 / 검은사원 SE (480x680 portrait)
  ('b705b15f-e78c-485d-83ed-839c5a4019b0'::uuid, 'https://zeroworldkorea.com/file/theme/18_5469103021.png'),  -- 제로월드 김포본점 / 복희네 사진관 SE (480x680 portrait)
  ('19861764-20f9-4f1d-a53e-7dee6cbe172e'::uuid, 'https://zeroworldkorea.com/file/theme/19_4497358408.png'),  -- 제로월드 김포본점 / 성역전설 (480x680 portrait)
  ('3bd79820-3fbd-494a-b393-6760c92651de'::uuid, 'https://zeroworldkorea.com/file/theme/21_1699400147.png'),  -- 제로월드 김포본점 / 어느 겨울밤 (480x680 portrait)
  ('df43ba60-b836-458a-bef0-84274e79ed98'::uuid, 'https://zeroworldkorea.com/file/theme/20_2877913590.png'),  -- 제로월드 김포본점 / 인형괴담 (480x680 portrait)
  ('7b779dc5-ca3d-4407-8ac4-fcf5d14f3730'::uuid, 'https://zeroworldkorea.com/file/theme/23_2569171480.png'),  -- 제로월드 김포본점 / 제로호텔 (480x680 portrait)
  ('ae1d6b18-011a-45c1-8ce3-88456fee858e'::uuid, 'https://zeroworldkorea.com/file/theme/7_2665347392.png'),  -- 제로월드 김포본점 / 최면 (480x680 portrait)
  ('273eb2cf-86d3-4c69-b70f-4042a34dae4e'::uuid, 'https://zeroworldkorea.com/file/theme/22_1353635518.png'),  -- 제로월드 김포본점 / 탈옥 : 특별수용소 (480x680 portrait)
  ('235054c5-ca5d-4965-b555-99b8661a0d09'::uuid, 'https://zeroworldkorea.com/file/theme/17_2977611217.png'),  -- 제로월드 김포본점 / 피노키오 대탈출 (480x680 portrait)
  ('1bd0f32b-9369-46fe-8b4f-4c91ef35da8c'::uuid, 'https://zeroworldkorea.com/file/theme/15_1026594960.png'),  -- 제로월드 김포본점 / 해리포터의 모험 SE : 마법모자의 위기 (480x680 portrait)
  ('182e86bd-9cd6-40ab-a97d-7ac3cdb6a78e'::uuid, 'https://zeroworldkorea.com/file/theme/38_9168570557.png'),  -- 제로월드 다이브 건대점 / 오르골 (ORGEL) (480x680 portrait)
  ('35181e1e-d468-4d5c-a4a6-0b1cb25c23ae'::uuid, 'https://zeroworldkorea.com/file/theme/39_3983305796.png'),  -- 제로월드 다이브 건대점 / 인터뷰 (INTERVIEW) (480x680 portrait)
  ('ff9cb5ee-66d1-43d5-b7fe-c0ac8d978d5f'::uuid, 'https://zeroworldkorea.com/file/theme/34_3417622171.png'),  -- 제로월드 홍대점 / ALIVE (480x680 portrait)
  ('9470beae-1f5b-4e55-b542-510fe3a905b0'::uuid, 'https://zeroworldkorea.com/file/theme/33_5401205142.png'),  -- 제로월드 홍대점 / NOX (480x680 portrait)
  ('58bed3c0-5781-4a35-98ed-a5361cd717d1'::uuid, 'https://zeroworldkorea.com/file/theme/35_6138739909.png'),  -- 제로월드 홍대점 / 깜방탈출 (480x680 portrait)
  ('44d05114-54de-4772-9b3b-26d5f8c88faf'::uuid, 'https://zeroworldkorea.com/file/theme/36_9683914137.png'),  -- 제로월드 홍대점 / 사랑...하는...감? (480x680 portrait)
  ('680dde0a-4b20-4af9-87af-7727e4f3bdc1'::uuid, 'https://zeroworldkorea.com/file/theme/9_8294038556.png')  -- 제로월드 홍대점 / 층간소음 (480x680 portrait)
) as v(id, poster) where c.id = v.id and coalesce(c.poster_url,'') = '';
select count(*) filter (where coalesce(poster_url,'')<>'') as 포스터있음, count(*) as 전체 from public.catalog where cafe like '제로월드%';

-- 못 맞춘 것 (1개) — 공식 페이지에서 확인 안 됨, 비워 둠
--   1906771f-082a-45b1-94ff-aac2ca13aaf7  제로월드 강남점 / 제로  : 공식 예약 목록에서 이 테마는 네이버 예약으로만 연결돼 포스터 없음
