-- 기록 종류 추가 (2026-11-19): 방탈출(escape, 기본) / 머더미스터리·크라임씬(murder)
--   kind: 종류. role: 머더미스터리에서 맡은 역할(나만 보기 → 공개 뷰에는 넣지 않는다).
--   ※ main 배포 "전에" 실행할 것. 실행 전에는 머더미스터리 기록 저장이 막혀 있다(방탈출 기록은 그대로 저장됨).
alter table public.records add column if not exists kind text not null default 'escape';
alter table public.records add column if not exists role text not null default '';

-- 공개 뷰에 kind 추가(맨 뒤에 붙인다). role·memo 는 공개하지 않는다.
drop view if exists public.public_reviews;
create view public.public_reviews as
  select r.id, r.user_id, r.theme_name, r.cafe_name, r.played_at, r.genre,
         r.difficulty, r.fear_level, r.rating, r.success, r.remaining_time,
         r.hint_count, r.one_liner, r.region,
         case when r.photo_public then r.photo_url else '' end as photo_url,
         r.party_size, r.created_at,
         coalesce(p.is_sample, false) as is_sample,
         case when r.photo_public then r.photo_urls else '{}'::text[] end as photo_urls,
         r.spoiler,
         r.kind
  from public.records r
  left join public.profiles p on p.id = r.user_id
  where r.is_public = true and r.hidden = false;
grant select on public.public_reviews to anon, authenticated;

-- 확인: 종류별 기록 수
select kind, count(*) from public.records group by kind;
