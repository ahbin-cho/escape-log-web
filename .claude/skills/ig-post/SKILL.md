---
name: ig-post
description: 방탈로그 인스타(@bangtal_log)에 게시물을 올리거나 게시 일정을 바꿀 때 사용. "오늘 이거 올려줘", "일정 당겨줘", "내일 12시에 올라가게", "안 올라왔어" 같은 요청.
---
# 인스타 게시·일정

## 일정 바꾸기
`lib/instagram.ts` 의 `POST_SCHEDULE` 을 고치고 `lib/instagram.test.ts` 의 날짜 기대값도 맞춘다.
`npx tsc --noEmit -p . && npx vitest run` 통과 후 main 에 올린다(배포 2~3분).
날짜는 한국 날짜. 지금 한국 시간은 `TZ=Asia/Seoul date` 로 확인(운영자의 "내일"이 자정 지난 오늘일 수 있다 → 날짜로 되묻지 말고 확인해서 말한다).

## 지금 바로 올리기
GitHub Actions `ig-post.yml` 을 실행한다(inputs: `set`, `dry`).
1. 먼저 `dry: "true"` 로 돌려 로그에서 이미지 주소·캡션을 확인한다.
2. `dry: "false"` 로 실행. 끝나면 **잡 로그 마지막에 `"published": true` 가 있는지** 확인한다.
   성공 표시만 믿지 말 것. `pending` 으로 끝났으면 한 번 더 실행한다.
3. "권한 없음"이면 GitHub Secrets 의 CRON_SECRET 이 없거나 Vercel 과 다르다 → 운영자에게 부탁(값을 묻지 않는다).

## 직접 만든 카드 묶음을 자동 게시에 태우기
`public/ig-static/<이름>/1.jpg…` 로 넣고 `STATIC_POSTS` 에 장수와 캡션을 추가, 일정에 `static:<이름>`.

## 규칙
- 하루 1개가 기본. 운영자가 직접 올린 날에도 올려야 하면 일정에 `extra: true`.
- 12시 전에 운영자가 직접 올리면 자동 게시가 쉰다는 점을 미리 알려 준다.
- 캡션: 첫 줄은 질문·공감, 매장 정보엔 "(정보는 매장 공식 소개 기준)", 해시태그는 동네 태그 먼저.
- 결과를 보고할 때 실제로 확인한 것과 아닌 것을 구분해서 말한다.
