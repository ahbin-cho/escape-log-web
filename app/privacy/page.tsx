import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

// 개인정보처리방침(개인정보 보호법 제30조). 실제 코드가 수집·저장하는 것만 적는다.
// Supabase 프로젝트 리전: ap-northeast-2(서울), 운영자 확인 2026-11-22.
// 바뀌면 여기와 시행일을 같이 고친다: 가입(이메일·비밀번호·닉네임), 기록(records), 방문 통계(attribution_events·
// reservation_clicks·quiz_completions — 이름·이메일 없음), 브라우저 저장소(lib/track.ts·lib/store.ts), 로그인 쿠키(sb-*).
export const metadata: Metadata = {
  title: "개인정보처리방침 — 모으는 정보·보관 기간·지우는 방법",
  description: `${SITE_NAME}가 어떤 개인정보를 왜 모으고, 얼마나 보관하고, 어떻게 지우는지 안내합니다. 회원가입·기록·이용 통계와 맡겨서 처리하는 곳, 이용자의 권리를 적었어요.`,
  alternates: { canonical: "/privacy" },
};

const EFFECTIVE = "2026년 11월 22일";

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 text-lg font-extrabold">{children}</h2>;
}

export default function PrivacyPage() {
  const mail = (
    <a href={`mailto:${CONTACT_EMAIL}`} className="font-bold underline underline-offset-2">
      {CONTACT_EMAIL}
    </a>
  );
  return (
    <article className="mx-auto max-w-3xl rounded-2xl border-2 border-edge bg-panel p-6 text-[15px] leading-7 sm:p-8">
      <h1 className="text-2xl font-extrabold">개인정보처리방침</h1>
      <p className="mt-2 text-sm text-cream/60">시행일: {EFFECTIVE}</p>
      <p className="mt-4">
        {SITE_NAME}(이하 &lsquo;서비스&rsquo;)는 방탈출 기록·취향 진단·추천을 위해 꼭 필요한 정보만 모으고,
        「개인정보 보호법」에 따라 아래와 같이 처리합니다.
      </p>

      <H>1. 모으는 정보와 쓰는 곳</H>
      <ul className="mt-2 list-disc space-y-2 pl-5">
        <li>
          <b>회원가입·로그인</b>: 이메일, 비밀번호, 닉네임. 로그인과 계정 확인, 비밀번호 재설정 메일 발송에 씁니다.
          비밀번호는 암호화되어 저장되며 운영자도 볼 수 없습니다.
        </li>
        <li>
          <b>방탈출 기록</b>(직접 입력한 것): 테마·매장 이름, 다녀온 날짜, 탈출 여부, 남은 시간, 힌트 수, 별점, 한 줄
          후기, 메모, 인원, 인증샷 사진. 내 달력·다이어리·결산을 보여 주는 데 씁니다. &lsquo;공개&rsquo;를 켠 후기만
          닉네임과 함께 다른 사람에게 보이고, 사진은 따로 켰을 때만 보입니다.
        </li>
        <li>
          <b>이용 통계</b>(자동): 어디서 들어왔는지(예: 인스타그램 링크), 예약 버튼을 누른 테마, 취향 진단 결과 유형.
          서비스를 고치는 데만 쓰며 이름·이메일과 연결하지 않습니다. 같은 방문을 두 번 세지 않으려고 브라우저에
          무작위 번호를 하나 만들어 둡니다.
        </li>
        <li>
          <b>이 기기 브라우저에만 남는 것</b>: 가입 전에 쓴 기록, 취향 진단 결과, 고른 지역, 친구 궁합에 넣은 이름.
          서버로 보내지 않으며, 가입하면 가입 전 기록만 내 계정으로 옮깁니다.
        </li>
      </ul>
      <p className="mt-2 text-sm text-cream/60">
        주민등록번호, 전화번호, 주소, 결제 정보는 받지 않습니다. 매장 예약은 각 매장 사이트에서 이루어지며 그 정보는
        서비스가 받지 않습니다.
      </p>

      <H>2. 보관 기간과 지우는 방법</H>
      <ul className="mt-2 list-disc space-y-2 pl-5">
        <li>회원 정보와 기록은 회원 탈퇴(계정 삭제)를 요청할 때까지 보관하고, 요청을 받으면 지체 없이 지웁니다.</li>
        <li>기록과 사진은 언제든 직접 고치거나 지울 수 있습니다. 지운 사진 파일도 함께 삭제됩니다.</li>
        <li>이용 통계는 개인을 알아볼 수 없는 형태로 서비스 개선에 필요한 동안 보관합니다.</li>
        <li>전자 파일은 복구할 수 없는 방법으로 지웁니다.</li>
      </ul>

      <H>3. 다른 곳에 주는지</H>
      <p className="mt-2">
        이용자의 개인정보를 다른 회사나 사람에게 주거나 팔지 않습니다. 법령에 따라 수사기관 등이 정당하게 요구하는
        경우만 예외입니다.
      </p>

      <H>4. 맡겨서 처리하는 곳(위탁·국외 이전)</H>
      <p className="mt-2">
        서비스를 운영하려고 아래 클라우드 회사에 저장·처리를 맡깁니다. 회원 정보와 기록은 <b>서울에 있는 서버</b>에
        저장됩니다.
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-edge text-left">
              <th className="py-2 pr-3">받는 곳(나라)</th>
              <th className="py-2 pr-3">맡기는 일</th>
              <th className="py-2">옮겨지는 정보</th>
            </tr>
          </thead>
          <tbody className="align-top">
            <tr className="border-b border-edge/20">
              <td className="py-2 pr-3">Supabase Inc.(미국 회사 · 저장 서버는 서울 리전)</td>
              <td className="py-2 pr-3">회원 인증, 기록·사진 저장, 로그인 메일 발송</td>
              <td className="py-2">1번의 회원·기록 정보, 이용 통계</td>
            </tr>
            <tr>
              <td className="py-2 pr-3">Vercel Inc.(미국)</td>
              <td className="py-2 pr-3">웹사이트 운영(서버·전송)</td>
              <td className="py-2">사이트 이용 중 오가는 정보, 접속 기록</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm text-cream/60">
        사이트를 이용할 때 웹사이트 운영 서버(Vercel)를 거치며, 저장된 정보의 보관 기간은 2번과 같습니다. 국외 이전을
        원하지 않으면 가입하지 않거나 탈퇴할 수 있고, 이 경우 기록 동기화 등 회원 기능을 쓸 수 없습니다.
      </p>

      <H>5. 이용자의 권리</H>
      <p className="mt-2">
        언제든 내 개인정보를 보거나 고치거나 지우거나, 처리를 멈춰 달라고 요청할 수 있습니다. 기록은 사이트에서 직접
        고치고 지울 수 있고, 계정 삭제와 그 밖의 요청은 {mail}로 보내 주시면 지체 없이 처리하고 결과를 알려 드립니다.
      </p>

      <H>6. 쿠키와 브라우저 저장소</H>
      <p className="mt-2">
        로그인을 유지하려고 쿠키를 쓰고, 1번의 &lsquo;브라우저에만 남는 것&rsquo;을 저장하려고 브라우저 저장소를
        씁니다. 광고용 추적 쿠키는 쓰지 않습니다. 브라우저 설정에서 쿠키를 막을 수 있지만, 그러면 로그인이 유지되지
        않습니다.
      </p>

      <H>7. 안전하게 지키는 방법</H>
      <ul className="mt-2 list-disc space-y-2 pl-5">
        <li>모든 연결을 암호화(HTTPS)하고, 비밀번호는 암호화해 저장합니다.</li>
        <li>내 기록은 나만 고칠 수 있도록 데이터베이스에 접근 권한을 걸어 둡니다.</li>
        <li>관리 화면은 운영자 계정만 들어갈 수 있습니다.</li>
      </ul>

      <H>8. 만 14세 미만 아동</H>
      <p className="mt-2">
        서비스는 만 14세 미만 아동을 대상으로 하지 않으며, 법정대리인 동의 없이 아동의 개인정보를 알면서 모으지
        않습니다. 그런 사실을 알게 되면 바로 지웁니다.
      </p>

      <H>9. 개인정보 보호책임자</H>
      <p className="mt-2">
        {SITE_NAME} 운영자 · {mail}
        <br />
        개인정보와 관련한 문의·불만·피해 구제는 위 메일로 보내 주세요.
      </p>

      <H>10. 권익 침해 구제</H>
      <p className="mt-2">아래 기관에도 상담하거나 신고할 수 있습니다.</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        <li>개인정보침해신고센터: privacy.kisa.or.kr / 국번 없이 118</li>
        <li>개인정보분쟁조정위원회: www.kopico.go.kr / 1833-6972</li>
        <li>대검찰청: www.spo.go.kr / 국번 없이 1301</li>
        <li>경찰청: ecrm.police.go.kr / 국번 없이 182</li>
      </ul>

      <H>11. 바뀌는 경우</H>
      <p className="mt-2">
        이 방침이 바뀌면 시행 7일 전부터 이 페이지에 알립니다. 이용자 권리에 중요한 변경은 30일 전부터 알립니다.
      </p>

      <p className="mt-10 text-sm text-cream/60">
        <Link href="/" className="underline underline-offset-2">
          처음으로
        </Link>
      </p>
    </article>
  );
}
