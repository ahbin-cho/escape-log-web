-- ─────────────────────────────────────────────────────────────
-- 예시 후기 넣기 / 지우기
--
-- 후기가 아직 적을 때 화면이 비어 보이지 않도록, 카탈로그의 각 테마에
-- "예시" 후기를 하나씩 넣는다. 이 후기들은
--   · 닉네임이 '방탈로그 예시'로 보이고, 화면에 '예시' 표시가 붙는다
--   · 테마 상세의 성공률·평균 별점 통계와 🥇 첫 후기 배지에서 빠진다
-- 실제 사용자 후기인 것처럼 보이게 쓰지 말 것(닉네임·표시를 바꾸지 말 것).
--
-- 준비: schema.sql 을 먼저 다시 실행(profiles.is_sample 열과 public_reviews 뷰 갱신).
--
-- 1) 앱에서 예시용 계정을 하나 가입한다 (아무 이메일, 예: 내 메일+sample@…).
-- 2) 아래 'sample@example.com' 을 그 이메일로 바꾸고 SQL Editor 에서 실행.
--    여러 번 실행해도 같은 테마에 중복으로 들어가지 않는다.
-- ─────────────────────────────────────────────────────────────

do $$
declare
  uid uuid;
begin
  select id into uid from auth.users where email = 'sample@example.com';
  if uid is null then
    raise exception '먼저 앱에서 이 이메일로 가입한 뒤 다시 실행하세요';
  end if;

  update public.profiles
     set is_sample = true, nickname = '방탈로그 예시'
   where id = uid;

  insert into public.records (
    user_id, theme_name, cafe_name, played_at, genre, difficulty, fear_level,
    rating, success, remaining_time, hint_count, party_size, one_liner, is_public
  )
  select
    uid,
    c.name,
    c.cafe,
    current_date - (c.h % 90),
    c.genre,
    c.difficulty,
    c.fear_level,
    3 + (c.h % 3),                                   -- 별점 3~5
    (c.h % 4) <> 0,                                  -- 넷 중 하나는 실패
    case when (c.h % 4) <> 0 then ((c.h % 15) + 1)::text || '분' else '' end,
    c.h % 4,                                         -- 힌트 0~3
    2 + (c.h % 3),                                   -- 2~4명
    case c.genre
      when '공포' then (array[
        '불 꺼지는 순간부터 심장이 쫄깃. 겁 많은 친구는 앞장 금지',
        '연출 타이밍이 좋아서 알고 있어도 놀람',
        '무섭지만 문제는 공정한 편이라 끝까지 집중됨'])[1 + c.h % 3]
      when '추리' then (array[
        '단서가 흩어져 있어서 다 같이 맞춰 보는 재미가 큼',
        '마지막에 범인 고를 때 팀 의견이 갈려서 더 재밌었음',
        '메모 잘하는 사람 한 명 꼭 데려가세요'])[1 + c.h % 3]
      when '감성' then (array[
        '엔딩에서 다들 조용해짐. 이야기 좋아하면 추천',
        '문제보다 분위기가 기억에 남는 방',
        '처음 하는 친구랑 가기 딱 좋았음'])[1 + c.h % 3]
      when 'SF' then (array[
        '장치가 많아서 손이 바쁜 방. 움직이는 거 좋아하면 추천',
        '세트가 예뻐서 들어가자마자 감탄',
        '설정이 신선해서 문제 푸는 맛이 있음'])[1 + c.h % 3]
      when '코믹' then (array[
        '내내 웃다가 시간 가는 줄 몰랐음',
        '가볍게 즐기기 좋은 방, 친구들이랑 추천',
        '문제가 엉뚱해서 오히려 기억에 남음'])[1 + c.h % 3]
      else (array[
        '흐름이 자연스러워서 막힘 없이 즐김',
        '난이도가 적당해서 다 같이 재밌게 함',
        '방 구성이 알차서 시간이 금방 감'])[1 + c.h % 3]
    end,
    true
  from (
    select cat.*, (abs(hashtext(cat.id::text)::bigint) % 1000000)::int as h
    from public.catalog cat
  ) c
  where not exists (
    select 1 from public.records r
    where r.user_id = uid and r.theme_name = c.name and r.cafe_name = c.cafe
  );
end $$;


-- ─────────────────────────────────────────────────────────────
-- 지우기: 실제 후기가 충분히 쌓이면 아래만 실행 (예시 후기 전부 삭제)
-- ─────────────────────────────────────────────────────────────
-- delete from public.records
--  where user_id in (select id from public.profiles where is_sample);
