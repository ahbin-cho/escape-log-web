-- MHZ ESCAPE 테마 이름을 공식 표기 '우야'로(한자 표기는 공식 사이트에 없음)
update public.catalog set name = '우야' where cafe = 'MHZ ESCAPE 수원 행궁동' and name = '우야 (雨夜)';
select id, name, cafe from public.catalog where cafe like 'MHZ%';
