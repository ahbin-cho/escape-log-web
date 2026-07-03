# 방탈로그 — Supabase 연결 & 배포 가이드

이제 앱 데이터가 **Supabase(무료 DB)** 에 저장됩니다. 아래를 순서대로 하면
로그인·공개 후기·어드민이 모두 켜집니다. **전부 무료 티어**입니다.

---

## 0. 한눈에 (내가 쓸 링크들)

| 무엇 | 링크 |
|---|---|
| Supabase 대시보드 (프로젝트 관리) | https://supabase.com/dashboard |
| 새 프로젝트 만들기 | https://supabase.com/dashboard/new |
| 내 서비스(배포됨) | https://escape-log-web-eight.vercel.app |
| Vercel 대시보드 (환경변수 설정) | https://vercel.com/dashboard |

---

## 1. Supabase 프로젝트 만들기 (5분)

1. https://supabase.com 접속 → GitHub/구글로 무료 가입
2. **New project** 클릭
   - Name: `escape-log` (아무거나)
   - Database Password: 아무거나 정하고 **어딘가 적어두기**
   - Region: `Northeast Asia (Seoul)` 추천
3. 프로젝트 생성까지 1~2분 기다림

## 2. 테이블 만들기 (SQL 한 번 붙여넣기)

1. 왼쪽 메뉴 → **SQL Editor** → **New query**
2. 이 저장소의 **`supabase/schema.sql`** 파일 내용을 **통째로 복사**해서 붙여넣기
3. 오른쪽 아래 **Run** 클릭 → "Success" 뜨면 끝
   - 테이블(records/catalog/profiles/admins) + 권한(RLS) + 추천 테마 8개 시드가 한 번에 생성됩니다.

## 3. 나를 관리자로 등록

여전히 **SQL Editor** 에서 아래 한 줄 실행 (이메일은 **로그인에 쓸 이메일**):

```sql
insert into public.admins (email) values ('ahbin.cho@athometrip.com');
```

→ 이 이메일로 로그인하면 헤더에 **관리자** 버튼이 생기고 `/admin` 에 들어갈 수 있어요.

## 4. 키 복사

왼쪽 메뉴 → **Project Settings**(톱니) → **API** 에서 두 값을 복사:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 5. 이메일 확인 끄기 (중요 · 로그인 방식이 비밀번호라 필수)

로그인은 **이메일 + 비밀번호** 방식이라 인증 메일을 안 보냅니다. 가입하자마자
바로 로그인되게 하려면 이메일 확인을 꺼야 해요.

왼쪽 메뉴 → **Authentication → Sign In / Providers → Email** →
**"Confirm email"** 옵션을 **OFF** → 저장.

> 이걸 안 끄면 회원가입 후 "이메일 확인이 필요하다"는 안내가 뜨고 로그인이 막힙니다.
> (매직링크·구글 로그인 등으로 나중에 바꾸면 이 설정은 다시 조정하면 됩니다.)

## 6. 키를 앱에 넣기

**로컬(내 맥):** 프로젝트 루트에 `.env.local` 파일 만들고:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

**Vercel(배포):** https://vercel.com/dashboard → 프로젝트 → **Settings → Environment
Variables** 에 같은 두 값을 추가 → **Redeploy**.

---

## 7. 데이터는 어디서 보나? (제일 궁금해하신 부분)

Supabase 대시보드 왼쪽 메뉴 **Table Editor** 에서 실제 데이터를 표로 봅니다:

- **`records`** — 사람들이 남긴 모든 기록. `is_public=true` 가 공개 후기, `hidden=true` 는
  관리자가 숨긴 것. `memo`(비공개 메모)도 여기 저장되지만 앱/피드/어드민 화면엔 노출 안 됩니다.
- **`catalog`** — 추천 테마 목록. 앱의 **/admin/catalog** 화면에서 편집한 게 여기 반영돼요.
- **`profiles`** — 로그인 사용자별 닉네임.
- **`admins`** — 관리자 이메일 목록.

> 앱 안에서 보고 싶으면: 로그인 후 헤더의 **관리자 → 대시보드/공개 후기/추천 카탈로그**.
> Supabase 대시보드는 "DB 원본"을 직접 보는 곳, 어드민 화면은 "관리용 UI" 입니다.

그 밖에 유용한 메뉴:
- **Authentication → Users**: 가입한 사용자(이메일) 목록
- **SQL Editor**: 직접 쿼리로 통계 뽑기 (예: `select count(*) from records;`)

---

## 참고 / 다음 단계

- 매직링크 이메일은 Supabase 내장 발송을 쓰며 **시간당 몇 통** 제한이 있어요. 사용자가
  늘면 **Authentication → Emails → SMTP** 에 Resend(무료 월 3,000통) 등을 연결하면 됩니다.
- AI 페르소나를 진짜 LLM으로 켜려면 `.env.local`/Vercel 에 `OPENAI_API_KEY` 또는
  `ANTHROPIC_API_KEY` 를 넣고 `app/api/persona/route.ts` 를 POST 핸들러로 되돌리면 됩니다.
- 업데이트 배포는 `git push` → Vercel 자동 재배포.
