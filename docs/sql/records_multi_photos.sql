-- 기록 인증샷 여러 장(최대 4) + 저장 공간 아끼기. Supabase → SQL Editor 에 붙여 넣고 Run(여러 번 실행해도 안전).
-- 사이트 코드는 이 SQL 전에도 동작한다(그땐 대표 사진 한 장만 저장).

-- 1) 사진 목록 칸. 대표 사진(첫 장)은 지금처럼 photo_url 에도 들어간다
alter table public.records add column if not exists photo_urls text[] not null default '{}';
-- 기존 기록: 한 장짜리를 목록으로 옮겨 두기
update public.records set photo_urls = array[photo_url]
where photo_url <> '' and cardinality(photo_urls) = 0;
-- 한 기록에 최대 4장
alter table public.records drop constraint if exists records_photo_urls_max;
alter table public.records add constraint records_photo_urls_max check (cardinality(photo_urls) <= 4);

-- 2) 공개 후기 뷰에 사진 목록 추가(기존 칸 순서 그대로, 맨 끝에 붙임)
create or replace view public.public_reviews as
  select r.id, r.user_id, r.theme_name, r.cafe_name, r.played_at, r.genre,
         r.difficulty, r.fear_level, r.rating, r.success, r.remaining_time,
         r.hint_count, r.one_liner, r.region, r.photo_url, r.party_size, r.created_at,
         coalesce(p.is_sample, false) as is_sample,
         r.photo_urls
  from public.records r
  left join public.profiles p on p.id = r.user_id
  where r.is_public = true and r.hidden = false;
grant select on public.public_reviews to anon, authenticated;

-- 3) 저장소(photos 버킷): 한 장 최대 2MB, 사진 형식만. 사이트가 올리기 전에 긴 변 1600px 로 줄여서
--    보통 200~400KB 라 넉넉하다. 줄이지 않은 큰 원본이 그대로 올라오는 것을 막는다.
update storage.buckets
set file_size_limit = 2097152,
    allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png']
where id = 'photos';

-- 확인
select count(*) filter (where cardinality(photo_urls) > 0) as with_photos, count(*) as total from public.records;
select id, file_size_limit, allowed_mime_types from storage.buckets where id = 'photos';
