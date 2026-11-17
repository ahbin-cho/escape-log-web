-- 후기 공개 범위 나누기 (2026-11-17)
--   글(한 줄·평점·성공 여부)은 is_public, 사진은 photo_public 으로 따로. 스포일러 표시 spoiler 추가.
--   ※ 이 SQL 을 main 배포 "전에" 실행할 것(먼저 배포하면 새 기록의 사진이 예전 뷰로 그대로 보인다).
alter table public.records add column if not exists photo_public bool not null default false;
alter table public.records add column if not exists spoiler      bool not null default false;

-- 지금까지 '공개 후기로 올리기'를 켠 기록은 사진까지 공개하기로 한 것이므로 그대로 둔다.
update public.records set photo_public = true where is_public = true and photo_url <> '';

-- 공개 뷰: 사진은 photo_public 인 것만 내보낸다(아니면 빈 값). memo 는 원래부터 없음.
drop view if exists public.public_reviews;
create view public.public_reviews as
  select r.id, r.user_id, r.theme_name, r.cafe_name, r.played_at, r.genre,
         r.difficulty, r.fear_level, r.rating, r.success, r.remaining_time,
         r.hint_count, r.one_liner, r.region,
         case when r.photo_public then r.photo_url else '' end as photo_url,
         r.party_size, r.created_at,
         coalesce(p.is_sample, false) as is_sample,
         case when r.photo_public then r.photo_urls else '{}'::text[] end as photo_urls,
         r.spoiler
  from public.records r
  left join public.profiles p on p.id = r.user_id
  where r.is_public = true and r.hidden = false;
grant select on public.public_reviews to anon, authenticated;

-- 확인: 공개 후기 수 / 그중 사진 공개 수
select count(*) as public_reviews, count(*) filter (where photo_url <> '') as with_photo from public.public_reviews;
