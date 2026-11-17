-- 경기남부 밝은 테마 후보: 우리 사이트에서 얼마나 찾았는지 (읽기만, 바꾸는 것 없음)
-- Supabase SQL Editor 에서 실행. 예약 버튼 클릭(30일·전체) + 다이어리 기록 수
with c(theme, cafe) as (values
  ('띵가띵가', '룸즈에이 수원역점'), ('냥냥펀치', '꿈소풍 안산2호점'), ('지옥의 배달부', '셜록홈즈 평택점'),
  ('지옥의 배달부', '셜록홈즈 동탄점'), ('우주대미남', '마스터키 안양점'), ('햄즈 살찌우기', '셜록홈즈 안양범계점'),
  ('종이왕국', '마스터키 동탄프라임'), ('1980 레트로게임룸', '셜록홈즈 수원역점'), ('셔플월드', '상상의문 분당서현점'),
  ('직박구리:남친탐구생활', '상상의문 수원점'), ('꿈꾸는 앨리스', '꿈소풍 안산1호점'), ('뽀득뽀득', '룸즈에이 안양범계점'))
select c.theme, c.cafe,
       coalesce(sum(s.clicks_30d), 0) as "예약클릭_30일",
       coalesce(sum(s.clicks_total), 0) as "예약클릭_전체",
       (select count(*) from public.records r where r.theme_name = c.theme) as "기록수"
from c left join public.reservation_click_stats s on s.theme_name = c.theme and s.cafe = c.cafe
group by c.theme, c.cafe
order by 3 desc, 4 desc, 5 desc;
