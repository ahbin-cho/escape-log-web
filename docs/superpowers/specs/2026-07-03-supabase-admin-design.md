# 방탈로그 — Supabase 백엔드 전환 + 어드민 설계

작성일: 2026-07-03 · 상태: 구현 진행 중

이 문서는 살아있는 문서(living doc)입니다. 구현이 진행되며 계속 갱신됩니다.
맨 아래 **진행 현황**에서 무엇이 끝났고 무엇이 남았는지 볼 수 있습니다.

---

## 1. 목표

방탈출 기록·추천·공유 서비스 "방탈로그"에 **관리자(어드민)** 를 추가한다.
어드민이 관리할 대상:

1. **추천 테마 카탈로그** — 지금 `lib/catalog.ts`에 하드코딩된 목록을 화면에서 추가/수정/삭제
2. **사용자 공개 후기** — 사람들이 올린 공개 후기를 보고 숨기거나 삭제

전제: 위 2번은 "공유되는 서버"가 있어야 성립한다. 따라서 데이터를 **Supabase(무료)** 로
옮기는 작업이 선행된다.

## 2. 결정 사항 (브레인스토밍 결과)

| 질문 | 결정 |
|---|---|
| 무엇을 관리? | 카탈로그 + 공개 후기 |
| 백엔드 | **Supabase** (Postgres + Auth + RLS, 무료 티어) |
| 일반 사용자 로그인 | **필요** — 기록이 계정별로 서버에 저장 |
| 로그인 방식 | **이메일 매직링크** (외부 앱 등록 불필요, 세팅 최소) |
| 관리자 식별 | **이메일 허용목록**(`ADMIN_EMAILS` 환경변수) — 가장 간단·안전 |
| 비용 | **전부 무료 티어**로 시작 |

## 3. 비기능 요구 / 제약

- **UI 톤 유지**: 크림색 종이 배경(`ink #F5F0E6`), 굵은 검정 2px 테두리(`edge #1D1D1D`),
  하드 그림자(`shadow-cute = 3px 3px 0 #1D1D1D`), 손그림 필터(`.rough`), 캔디 오렌지
  포인트(`candy #E49A4A`), 둥근 모서리, 볼드 한글 폰트(제목 SBAggroB / 본문 Pretendard).
  어드민·신규 화면 모두 이 톤을 따른다.
- **가시성(대비) 개선**: 현재 보조 텍스트가 `text-cream/25~40`(밝은 배경 위 흐린 검정)로
  대비가 낮다는 피드백. 보조 텍스트를 최소 `/55~/70`로 상향해 가독성을 확보한다.
- **비용 0** 유지.
- **YAGNI**: 팔로우/댓글/좋아요/프로필 페이지/카카오 로그인은 이번 범위에서 제외.

## 4. 데이터 모델 (Supabase Postgres)

### 4.1 `profiles`
로그인 사용자별 공개 정보(닉네임). `auth.users` 가입 시 트리거로 자동 생성.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid (PK, = auth.users.id) | 사용자 ID |
| nickname | text | 공개 후기에 표시될 이름 |
| created_at | timestamptz | 생성 시각 |

### 4.2 `records`
기존 `EscapeRecord` 를 그대로 옮기고 `user_id`, `is_public`, `hidden` 추가.

| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK→auth.users) | 작성자 |
| theme_name | text | |
| cafe_name | text | |
| played_at | date | |
| genre | text | |
| difficulty | int2 | 1~5 |
| fear_level | int2 | 1~5 |
| rating | int2 | 1~5 |
| success | bool | |
| remaining_time | text | |
| hint_count | int2 | |
| one_liner | text | 공개용 한 줄(무스포) |
| memo | text | 비공개 메모(스포 OK) — 공개돼도 노출 안 함 |
| is_public | bool | 공개 후기로 올릴지 |
| hidden | bool | 관리자가 숨김 처리 |
| created_at | timestamptz | |

> DB는 snake_case, 앱 타입(`EscapeRecord`)은 camelCase. `lib/store.ts`에서 매핑한다.

### 4.3 `catalog`
기존 `CandidateTheme` 를 그대로 옮김. 어드민이 CRUD.

| 컬럼 | 타입 |
|---|---|
| id | uuid (PK) |
| name / cafe / genre | text |
| difficulty / fear_level | int2 |
| tags | text[] |
| teaser / hint / spoiler | text |
| created_at | timestamptz |

## 5. 권한 (RLS 정책)

관리자 판별은 SQL 헬퍼 `is_admin()` — `auth.jwt()->>'email'` 이 `ADMIN_EMAILS`(DB에
저장된 허용목록 테이블 또는 함수 상수)에 있으면 true.

- **records**
  - SELECT: 본인 것 전부 / `is_public=true AND hidden=false` 는 누구나 / 관리자는 전부
  - INSERT·UPDATE·DELETE: 본인 것만 / 관리자는 전부(숨김·삭제용)
- **catalog**
  - SELECT: 누구나(비로그인 포함)
  - INSERT·UPDATE·DELETE: 관리자만
- **profiles**
  - SELECT: 누구나(닉네임 표시용)
  - UPDATE: 본인만

## 6. 앱 구조 변경

### 6.1 Supabase 클라이언트
- `lib/supabase/client.ts` — 브라우저용 (`@supabase/ssr` createBrowserClient)
- `lib/supabase/server.ts` — 서버 컴포넌트/라우트용 (쿠키 기반 세션)
- 환경변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ADMIN_EMAILS`

### 6.2 `lib/store.ts` 교체 (README가 지정한 "백엔드 교체 지점")
- `getRecords / getRecord / saveRecord / deleteRecord` 를 **비동기 Supabase 호출**로 교체.
- 화면들은 이미 `useEffect`에서 호출하므로 `await` 추가 수준의 최소 변경.
- snake_case ↔ camelCase 매핑 함수 포함.
- 카탈로그: `getCatalog()` 신설(DB 읽기). `lib/catalog.ts`의 배열은 **DB 시드용**으로만 남김.

### 6.3 인증 UI
- `app/login/page.tsx` — 이메일 입력 → 매직링크 발송 (톤 유지)
- `app/auth/callback/route.ts` — 매직링크 콜백 처리(세션 교환)
- 헤더: 로그인/로그아웃 버튼, 로그인 시 닉네임 표시
- 미들웨어 `middleware.ts` — 세션 새로고침 + `/admin` 접근 보호

### 6.4 기존 localStorage 데이터 이관
- 첫 로그인 시 로컬에 기록이 있으면 "내 계정으로 가져오기" 1회 제안 배너 → 서버로 업로드 후 로컬 정리.

### 6.5 공개 피드
- `app/feed/page.tsx` — 모두의 공개 후기(`is_public && !hidden`)를 닉네임과 함께 카드로. "서로 보는" 화면.
- 기록 폼에 **공개하기 토글** 추가.

## 7. 어드민

경로는 모두 관리자 이메일만 접근(미들웨어 + 서버 확인 이중).

- `app/admin/layout.tsx` — 어드민 공통 레이아웃(탭 네비, 톤 유지), 비관리자는 홈으로 리다이렉트
- `app/admin/page.tsx` — 대시보드(전체 기록/공개 후기/카탈로그 수 카운트)
- `app/admin/catalog/page.tsx` — 카탈로그 목록 + 추가/수정/삭제
- `app/admin/reviews/page.tsx` — 공개 후기 목록 + 숨김 토글/삭제

## 8. 가시성(대비) 개선 규칙

| 용도 | 기존 | 변경 |
|---|---|---|
| 아주 흐린 힌트 | `/15`, `/25` | `/45` |
| 보조 라벨 | `/30`, `/40` | `/60` |
| 일반 보조 텍스트 | `/50` | `/70` |
| placeholder | `/25` | `/45` |

주요/제목 텍스트는 그대로(이미 진함). 캔디·그림자·테두리는 유지.

## 9. 범위 밖 (다음 단계)

팔로우 · 댓글 · 좋아요 · 사용자 공개 프로필 페이지 · 카카오 로그인 · 이미지 업로드 ·
진짜 LLM 페르소나(서버 라우트) 복구.

## 10. 사용자가 직접 해야 하는 세팅(코드로 대신 못 하는 부분)

1. supabase.com 무료 프로젝트 생성 → URL/anon key 복사
2. 제공되는 `supabase/schema.sql` 을 SQL Editor에 붙여넣고 실행(테이블·RLS·트리거·시드)
3. Supabase Auth 설정에서 Site URL / Redirect URL 에 Vercel 도메인 등록
4. Vercel(및 로컬 `.env.local`)에 환경변수 3개 입력: URL, anon key, `ADMIN_EMAILS`
   → 상세 절차는 `DEPLOY.md` 에 단계별로 문서화

---

## 진행 현황 (live checklist)

- [x] 0. 설계 문서 작성 (이 파일)
- [x] 1. 의존성 설치 (`@supabase/supabase-js`, `@supabase/ssr`)
- [x] 2. `supabase/schema.sql` (테이블 + RLS + 트리거 + 카탈로그 시드)
- [x] 3. Supabase 클라이언트(`lib/supabase/*`) + 환경변수 예시
- [x] 4. `lib/store.ts` → Supabase 비동기 전환 + 카탈로그 DB 읽기
- [x] 5. 화면들(`page/taste/region/quiz/edit`) 비동기 대응
- [x] 6. 인증: 로그인 페이지·콜백·미들웨어·헤더 버튼
- [x] 7. 로컬 데이터 → 계정 이관 배너
- [x] 8. 공개 토글 + 공개 피드 `/feed`
- [x] 9. 어드민(레이아웃/대시보드/카탈로그/후기)
- [x] 10. 가시성(대비) 개선 일괄 적용
- [x] 11. 문서(README/DEPLOY/.env.example) 갱신 + 빌드 확인 (`npm run build` 통과)

### 코드로는 다 됐고, 사용자가 직접 해야 하는 것 (DEPLOY.md 참고)
- [ ] Supabase 무료 프로젝트 생성 → `supabase/schema.sql` 실행
- [ ] `insert into admins ...` 로 본인 이메일을 관리자 등록
- [ ] `.env.local` + Vercel 환경변수에 URL/anon key 입력
- [ ] Supabase Auth 의 Site URL / Redirect URL 등록
