# 방탈로그 — GitHub Pages 배포 가이드

이 앱은 서버가 필요 없는 **정적 사이트**라 GitHub Pages에 무료로 올릴 수 있어요.
아래를 **내 맥 터미널**에서 순서대로 실행하면 됩니다. (Claude 작업 환경에서는 git이
막혀 있어 직접 못 올려요. 내 컴퓨터에서는 정상 동작합니다.)

## 1. 프로젝트 폴더로 이동 + 깃 초기화

방금 자동 세팅 중 만들어진 불완전한 `.git`이 있을 수 있으니 지우고 새로 시작합니다.

```bash
cd ~/Documents/projects/escape-log-web
rm -rf .git
git init
git add -A
git commit -m "방탈로그 MVP: 기록·취향 진단·추천·지역 분포"
git branch -M main
```

## 2. GitHub 레포 만들고 푸시

**방법 A — gh CLI가 있으면 (한 줄):**

```bash
gh repo create escape-log-web --public --source=. --remote=origin --push
```

**방법 B — 웹으로:**
1. https://github.com/new 에서 레포 생성 (이름: `escape-log-web`, **Public**, README 체크 해제)
2. 아래 실행:

```bash
git remote add origin https://github.com/ahbin-cho/escape-log-web.git
git push -u origin main
```

> ⚠️ 무료 GitHub Pages는 **Public 레포**에서만 됩니다. (Private은 Pro 필요)

## 3. Pages 활성화 (딱 한 번)

레포 → **Settings → Pages → Build and deployment → Source** 를 **"GitHub Actions"** 로 선택.

끝! 이미 들어있는 워크플로(`.github/workflows/deploy.yml`)가 push마다 자동으로
빌드·배포합니다. Actions 탭에서 초록불 뜨면 완료.

## 4. 접속 주소

```
https://ahbin-cho.github.io/escape-log-web/
```

레포 이름을 다르게 지어도 괜찮아요 — 워크플로가 레포 이름을 자동으로 basePath에
넣어주므로 주소만 `.../<레포이름>/` 로 바뀝니다.

## 참고

- 데이터는 각 방문자의 브라우저(localStorage)에만 저장돼요. 사람마다 자기 기록을 봅니다.
- AI 페르소나는 정적 배포에선 꺼지고(서버 없음) 규칙 기반으로 자동 폴백합니다.
  나중에 진짜 LLM을 쓰려면 Vercel 등 서버 환경으로 옮기고 `next.config`의
  `output: "export"`를 제거한 뒤 `app/api/persona/route.ts`를 POST 핸들러로 되돌리면 됩니다.
- 업데이트는 그냥 `git add -A && git commit -m "..." && git push` 하면 자동 재배포됩니다.
```
