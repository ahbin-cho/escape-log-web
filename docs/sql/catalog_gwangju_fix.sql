-- 광주 SQL 보충(11/16): 먼저 실행된 예전 판 때문에 생긴 것 정리. 통째로 Run, 여러 번 실행해도 안전.
-- 1) 브레인 6개가 예전 매장 이름('브레인 방탈출 광주 충장로점')으로 한 벌 더 들어가 있음 → 예전 이름 쪽만 지움(새 이름 6개는 그대로)
delete from public.catalog where cafe = '브레인 방탈출 광주 충장로점'
  and exists (select 1 from public.catalog c2 where c2.cafe = '브레인 방탈출카페 광주 충장로점' and c2.name = catalog.name);
-- 2) 룸즈에이 14개 인원·가격(공식 상세, 2인 정가 ÷ 2 = 1인)
update public.catalog set players='2~5', price=22000 where name='띵가띵가' and cafe='룸즈에이 광주상무점';
update public.catalog set players='2~5', price=22000 where name='이상한 돈가스' and cafe='룸즈에이 광주상무점';
update public.catalog set players='2~5', price=22000 where name='뜻밖의 여행' and cafe='룸즈에이 광주상무점';
update public.catalog set players='2~5', price=22000 where name='아이돌 남친' and cafe='룸즈에이 광주상무점';
update public.catalog set players='2~5', price=23000 where name='그레이스 호텔' and cafe='룸즈에이 광주상무점';
update public.catalog set players='2~5', price=22000 where name='커밍순' and cafe='룸즈에이 광주상무점';
update public.catalog set players='2~5', price=22000 where name='이 소리 저만 들리나요?' and cafe='룸즈에이 광주상무점';
update public.catalog set players='2~5', price=22000 where name='전지적 작가 시점' and cafe='룸즈에이 광주상무점';
update public.catalog set players='2~5', price=22000 where name='멍사탕' and cafe='룸즈에이 광주상무점';
update public.catalog set players='2~5', price=22000 where name='요정들의 술집' and cafe='룸즈에이 광주수완점';
update public.catalog set players='2~5', price=22000 where name='낭랑카페' and cafe='룸즈에이 광주수완점';
update public.catalog set players='2~5', price=22000 where name='히어로 아카데미' and cafe='룸즈에이 광주수완점';
update public.catalog set players='2~5', price=22000 where name='뽀득뽀득' and cafe='룸즈에이 광주수완점';
update public.catalog set players='2~5', price=22000 where name='너와 나의 이야기' and cafe='룸즈에이 광주수완점';
update public.catalog set players='2~5', price=22000 where name='시크릿 에이전트' and cafe='룸즈에이 광주수완점';
update public.catalog set players='2~5', price=23000 where name='방과 후' and cafe='룸즈에이 광주수완점';
update public.catalog set players='2~4', price=26000 where name='놈즈 : 더 비기닝' and cafe='룸즈에이 광주수완 2호점';
update public.catalog set players='2~4', price=26000 where name='The Last Dance' and cafe='룸즈에이 광주수완 2호점';
update public.catalog set players='2~4', price=26000 where name='아이언 게이트 프리즌' and cafe='룸즈에이 광주수완 2호점';
update public.catalog set players='2~4', price=26000 where name='미스틱 클럽' and cafe='룸즈에이 광주수완 2호점';
-- 확인: 브레인 6 · 러시아워 3 · 숨바꼭질 4 · 룸즈에이 9/7/4 · 상상의문 6 = 39
select cafe, count(*) as themes, count(*) filter (where price > 0) as with_price from public.catalog where cafe like '%광주%' group by cafe order by cafe;
