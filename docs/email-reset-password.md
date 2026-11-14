# 비밀번호 재설정 메일 (Supabase → Authentication → Emails → Templates → Reset Password)

메일 발송: Resend 무료 요금제(SMTP). 비밀번호(API 키)는 Supabase SMTP 칸에만 넣고 여기에 적지 않는다.
- Host `smtp.resend.com` · Port `465` · Username `resend` · Sender `no-reply@bangtallog.com` · Sender name `방탈로그`
- 도메인 DNS 는 Vercel(ns1/ns2.vercel-dns.com) → Resend 가 알려 주는 레코드를 Vercel 도메인 DNS 에 추가.

## 제목
[방탈로그] 비밀번호 다시 정하기

## 본문(HTML)
```html
<div style="max-width:480px;margin:0 auto;padding:32px 24px;background:#F5F0E6;font-family:-apple-system,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;color:#1D1D1D">
  <p style="font-size:20px;font-weight:800;margin:0 0 16px">방탈로그</p>
  <p style="font-size:16px;line-height:1.6;margin:0 0 8px">비밀번호를 다시 정하려고 하셨나요?</p>
  <p style="font-size:15px;line-height:1.6;color:#55514A;margin:0 0 24px">아래 버튼을 누르면 새 비밀번호를 정하는 화면이 열려요. 링크는 한 번만 쓸 수 있어요.</p>
  <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#E49A4A;color:#1D1D1D;font-weight:800;font-size:16px;padding:14px 24px;border:2px solid #1D1D1D;border-radius:12px;box-shadow:3px 3px 0 #1D1D1D;text-decoration:none">비밀번호 다시 정하기</a>
  <p style="font-size:13px;line-height:1.6;color:#8A8478;margin:28px 0 0">직접 요청하지 않았다면 이 메일은 그냥 지워 주세요. 비밀번호는 바뀌지 않아요.<br>bangtallog.com</p>
</div>
```
