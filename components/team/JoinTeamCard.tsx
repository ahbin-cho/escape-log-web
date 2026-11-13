import type { QuizValues } from "@/lib/quiz/slots";
import { parseTeam } from "@/lib/quiz/team";
import JoinTeamForm from "@/components/team/JoinTeamForm";

// 팀 링크(/quiz?team=…)로 퀴즈에 들어온 사람의 결과 화면 맨 위에 뜬다.
export default function JoinTeamCard({ values, team }: { values: QuizValues; team: string }) {
  const members = parseTeam(team);
  return (
    <section className="mb-8 rounded-2xl border-2 border-edge bg-panel p-5 shadow-cute sm:p-6">
      <p className="text-xs font-bold tracking-[0.12em] text-candy">팀 조합 진단</p>
      <h2 className="mt-1 text-lg">
        {members.length > 0
          ? `${members.map((m) => m.label).join(", ")} 팀에 합류하기`
          : "내 결과로 팀 만들기"}
      </h2>
      <p className="mb-4 mt-1 text-sm text-cream/65 [word-break:keep-all]">
        추가하면 내 결과가 붙은 새 팀 링크가 열려요. 그 링크를 단톡방에 다시 올려 주세요.
      </p>
      <JoinTeamForm values={values} team={team} />
    </section>
  );
}
