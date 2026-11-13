import type { Metadata } from "next";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { getAllThemes } from "@/lib/catalog-server";
import type { CandidateTheme } from "@/lib/store";
import { QUIZ_TYPES } from "@/lib/quiz/types";
import {
  TEAM_MAX,
  TEAM_MIN,
  TEAM_ROLES,
  analyzeTeam,
  parseTeam,
  spreadBrands,
  teamParam,
  type TeamMember,
} from "@/lib/quiz/team";
import { pickForTeam, teamProfile, teamTier } from "@/lib/team";
import TeamActions from "@/components/team/TeamActions";

// 팀 조합 진단. 팀은 주소(/team?m=코드.코드…)에만 있다(서버 저장 없음).
type Props = { searchParams: { m?: string | string[] } };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

// 추천용 카탈로그는 한 시간 묶어 둔다(팀 주소마다 DB 를 다시 읽지 않게).
// 비어 있으면 던져서 빈 결과가 캐시되지 않게 한다.
const teamCatalog = unstable_cache(
  async (): Promise<CandidateTheme[]> => {
    const rows = await getAllThemes();
    if (!rows.length) throw new Error("empty catalog");
    return rows.map((t) => ({
      id: t.id,
      name: t.name,
      cafe: t.cafe,
      genre: t.genre,
      difficulty: t.difficulty,
      fearLevel: t.fear_level,
      tags: t.tags ?? [],
      teaser: "",
      hint: "",
      spoiler: "",
      timeLimit: t.time_limit ?? 0,
      players: t.players ?? "",
    }));
  },
  ["team-catalog"],
  { revalidate: 3600 }
);

async function loadCatalog(): Promise<CandidateTheme[]> {
  try {
    return await teamCatalog();
  } catch {
    return [];
  }
}

export function generateMetadata({ searchParams }: Props): Metadata {
  const members = parseTeam(one(searchParams.m));
  if (members.length === 0) return {};
  const title =
    members.length >= TEAM_MIN
      ? `${analyzeTeam(members).name.name} · 팀 조합 진단`
      : "팀 모으는 중 · 팀 조합 진단";
  const description = `${members.map((m) => m.label).join(", ")}의 방탈출 팀 조합. 방 안 역할과 같이 갈 방까지.`;
  return {
    title,
    description,
    // 팀마다 주소가 달라 끝없이 생기는 페이지라 검색에는 올리지 않는다.
    robots: { index: false, follow: true },
    openGraph: { title, description },
  };
}

const EYEBROW = "text-[11px] font-bold tracking-[0.18em] text-cream/50";

export default async function TeamPage({ searchParams }: Props) {
  const members = parseTeam(one(searchParams.m));
  const param = teamParam(members);

  if (members.length < TEAM_MIN) {
    return (
      <div className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-3 pt-2">
          <p className={EYEBROW}>팀 조합 진단 · {TEAM_MIN}~{TEAM_MAX}명</p>
          <h1 className="text-3xl leading-tight sm:text-4xl">
            {members.length === 0 ? "우리 팀은 어떤 원정대일까" : "팀원을 모으는 중"}
          </h1>
          <p className="max-w-xl text-[15px] leading-relaxed text-cream/70 [word-break:keep-all]">
            각자 취향 진단을 하고 링크 하나에 결과를 모으면, 팀 이름과 방 안에서 맡을 역할,
            다 같이 갈 방까지 골라 드려요.
          </p>
        </header>

        {members.length === 0 ? (
          <ol className="grid gap-px overflow-hidden rounded-2xl border border-edge/15 bg-edge/10 sm:grid-cols-3">
            {[
              ["팀 만들기", "내 진단 결과로 팀 링크를 만들어요."],
              ["단톡방에 공유", "팀원이 링크를 열고 각자 진단해서 자기 결과를 붙여요."],
              [`${TEAM_MIN}명부터 결과`, "역할 배정과 같이 갈 방이 바로 열려요."],
            ].map(([t, d], i) => (
              <li key={t} className="bg-panel p-5">
                <p className="font-display text-sm text-candy">0{i + 1}</p>
                <p className="mt-2 font-extrabold">{t}</p>
                <p className="mt-1 text-sm leading-relaxed text-cream/65 [word-break:keep-all]">{d}</p>
              </li>
            ))}
          </ol>
        ) : (
          <section className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg">지금 모인 팀원</h2>
              <p className="text-sm font-bold tabular-nums text-cream/60">
                {members.length} / {TEAM_MIN}명
              </p>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-edge/10">
              <div
                className="h-full rounded-full bg-candy"
                style={{ width: `${(members.length / TEAM_MIN) * 100}%` }}
              />
            </div>
            <ul className="grid gap-3 sm:grid-cols-3">
              {members.map((m) => (
                <li key={m.code} className="rounded-xl border border-edge/15 bg-panel p-5">
                  <p className="text-lg font-extrabold">{m.label}</p>
                  <p className="mt-0.5 text-sm text-cream/60">{QUIZ_TYPES[m.typeId].title}</p>
                </li>
              ))}
              {Array.from({ length: TEAM_MIN - members.length }, (_, i) => (
                <li
                  key={`empty-${i}`}
                  className="flex items-center justify-center rounded-xl border border-dashed border-edge/25 p-5 text-sm text-cream/45"
                >
                  빈 자리
                </li>
              ))}
            </ul>
            <p className="text-sm text-cream/65">
              {TEAM_MIN - members.length}명 더 모이면 팀 결과가 열려요.
            </p>
          </section>
        )}

        <TeamActions team={param} size={members.length} title="" />
      </div>
    );
  }

  const report = analyzeTeam(members);
  const profile = teamProfile(report.mates);
  const tier = teamTier(profile.harmony);
  const catalog = await loadCatalog();
  const picks = spreadBrands(pickForTeam(catalog, report.mates, catalog.length), 6);

  return (
    <article className="mx-auto max-w-3xl space-y-12">
      {/* 표지 */}
      <header className="rounded-2xl border-2 border-edge bg-panel px-6 pb-6 pt-8 shadow-cute sm:px-10 sm:pb-8 sm:pt-10">
        <p className={EYEBROW}>팀 조합 진단 · {members.length}명</p>
        <h1 className="mt-3 text-[2.5rem] leading-[1.1] sm:text-6xl">{report.name.name}</h1>
        <p className="mt-3 text-[15px] text-cream/70 sm:text-base">{report.name.line}</p>
        <p className="mt-4 text-sm font-bold text-cream/80">
          {report.members.map((m) => m.label).join(" · ")}
        </p>
        <dl className="mt-7 grid grid-cols-3 border-t border-edge/10 pt-5">
          <Stat label="팀 궁합" value={`${profile.harmony}`} unit="점" note={tier.label} />
          <Stat
            label="공포 기준"
            value={`${profile.fearCap}`}
            unit="/5"
            note="제일 겁 많은 사람 기준"
          />
          <Stat label="난이도" value={`${profile.diffTarget}`} unit="/5" note="팀 평균" />
        </dl>
      </header>

      {/* 역할 */}
      <section className="space-y-4">
        <SectionHead title="방 안에서 맡을 역할" note="끌리는 것과 플레이 방식으로 겹치지 않게 나눴어요." />
        <ul className="grid gap-3 sm:grid-cols-2">
          {report.members.map((m, i) => (
            <MemberCard key={m.code} member={m} role={m.role} index={i} />
          ))}
        </ul>
      </section>

      {/* 강점·조심할 점 */}
      <section className="grid gap-3 sm:grid-cols-[1.35fr_1fr]">
        <div className="rounded-2xl border border-edge/15 bg-panel p-6">
          <p className={EYEBROW}>강점</p>
          <ul className="mt-4 space-y-3">
            {report.strengths.map((s, i) => (
              <li key={s} className="flex gap-3 text-[15px] leading-relaxed [word-break:keep-all]">
                <span className="font-display text-sm leading-6 text-candy">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-edge p-6 text-panel">
          <p className="text-[11px] font-bold tracking-[0.18em] text-candy">조심할 점</p>
          <p className="mt-4 text-[15px] leading-relaxed [word-break:keep-all]">{report.watchOut}</p>
        </div>
      </section>

      {/* 같이 갈 방 */}
      <section className="space-y-4">
        <SectionHead
          title="다 같이 갈 방"
          note={`공포는 ${profile.fearCap}단계까지, ${members.length}명이 들어갈 수 있는 방 중에서 골랐어요.`}
        />
        {picks.length > 0 ? (
          <ol className="divide-y divide-edge/10 overflow-hidden rounded-2xl border border-edge/15 bg-panel">
            {picks.map((t, i) => (
              <li key={t.id}>
                <Link
                  href={`/theme/${t.id}?from=recommend`}
                  className="group flex gap-4 p-5 transition hover:bg-ink/60 sm:gap-6 sm:px-6"
                >
                  <span className="w-6 shrink-0 pt-0.5 font-display text-lg text-candy tabular-nums">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-extrabold group-hover:underline group-hover:underline-offset-4">
                      {t.name}
                    </p>
                    <p className="mt-0.5 text-sm text-cream/60">
                      {t.cafe} · {t.genre} · 난이도 {t.difficulty} · 공포 {t.fearLevel}
                      {t.players ? ` · ${t.players}인` : ""}
                    </p>
                    {t.reasons.length > 0 && (
                      <p className="mt-2 text-xs leading-relaxed text-cream/55 [word-break:keep-all]">
                        {t.reasons.join(" · ")}
                      </p>
                    )}
                  </div>
                  <span aria-hidden className="shrink-0 self-center text-cream/35 transition group-hover:translate-x-0.5 group-hover:text-cream">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="rounded-2xl border border-dashed border-edge/25 bg-panel px-5 py-10 text-center text-sm text-cream/60 [word-break:keep-all]">
            {catalog.length === 0
              ? "지금은 테마 목록을 불러오지 못했어요. 잠시 뒤에 다시 열어 주세요."
              : "모두가 들어갈 수 있는 방을 아직 못 찾았어요. 공포 기준이 낮거나 인원이 많으면 그래요."}{" "}
            <Link href="/best/단체-방탈출" className="font-bold underline underline-offset-4">
              단체 방탈출 모음
            </Link>
            도 봐 주세요.
          </p>
        )}
      </section>

      <TeamActions team={param} size={members.length} title={report.name.name} />

      <p className="text-center text-sm">
        <Link href="/match" className="font-bold text-cream/60 underline-offset-4 hover:underline">
          둘이서 궁합 보기
        </Link>
      </p>
    </article>
  );
}

function Stat({ label, value, unit, note }: { label: string; value: string; unit: string; note: string }) {
  return (
    <div className="border-l border-edge/10 px-3 first:border-l-0 first:pl-0 sm:px-5">
      <dt className="text-xs font-bold text-cream/55">{label}</dt>
      <dd className="mt-1">
        <span className="font-display text-2xl tabular-nums sm:text-3xl">{value}</span>
        <span className="ml-0.5 text-sm font-bold text-cream/50">{unit}</span>
      </dd>
      <dd className="mt-0.5 text-[11px] leading-snug text-cream/50 [word-break:keep-all] sm:text-xs">{note}</dd>
    </div>
  );
}

function SectionHead({ title, note }: { title: string; note: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-xl sm:text-2xl">{title}</h2>
      <p className="text-sm text-cream/60 [word-break:keep-all]">{note}</p>
    </div>
  );
}

function MemberCard({
  member,
  role,
  index,
}: {
  member: TeamMember;
  role: keyof typeof TEAM_ROLES;
  index: number;
}) {
  const r = TEAM_ROLES[role];
  return (
    <li className="flex flex-col rounded-2xl border border-edge/15 bg-panel p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-extrabold tracking-[0.08em] text-candy">{r.name}</p>
        <p className="font-display text-xs text-cream/30 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </p>
      </div>
      <p className="mt-3 text-xl font-extrabold">{member.label}</p>
      <p className="mt-0.5 text-sm text-cream/55">{QUIZ_TYPES[member.typeId].title}</p>
      <p className="mt-4 border-t border-edge/10 pt-4 text-sm leading-relaxed text-cream/75 [word-break:keep-all]">
        {r.job}
      </p>
    </li>
  );
}
