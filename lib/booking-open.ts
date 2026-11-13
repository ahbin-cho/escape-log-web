// 예약 오픈 규칙 읽기와 "지금 며칠까지 예약할 수 있나" 계산. 순수 함수(테스트 대상).
//
// DB(catalog.booking_open)에는 사람이 읽는 글로 들어 있다. 예:
//   "7일 전 자정", "6일 전", "14일 전 오전 11시 30분", "13일 전 오후 6시", "약 4주 전",
//   "매주 월요일 오전 10시 (다음 주 7일치)"
// "N일 전 H시" = 이용일 N일 전 H시에 그 날짜 예약이 열린다는 뜻.
// 시각이 없으면(예: "6일 전") 시각을 모른다 → 날짜만 대략 알려 준다.

export type OpenRule =
  | { kind: "daily"; days: number; minutes: number | null; approx: boolean } // minutes: 하루 중 열리는 시각(0=자정), null=모름
  | { kind: "weekly"; weekday: number; minutes: number; span: number } // 매주 weekday(0=일) 그 시각에 다음 주 span 일치
  | { kind: "unknown" };

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function parseTime(text: string): number | null {
  if (/자정/.test(text)) return 0;
  const m = text.match(/(오전|오후|밤|낮|새벽|저녁|아침)?\s*(\d{1,2})시(?:\s*(\d{1,2})분)?/);
  if (!m) return null;
  let h = Number(m[2]);
  const min = m[3] ? Number(m[3]) : 0;
  const ap = m[1] ?? "";
  if ((ap === "오후" || ap === "밤" || ap === "저녁") && h < 12) h += 12;
  if (ap === "낮" && h < 12 && h !== 12) h = h < 7 ? h + 12 : h; // "낮 12시"=12, "낮 1시"=13
  if ((ap === "오전" || ap === "새벽" || ap === "아침") && h === 12) h = 0;
  if (h >= 24) return null;
  return h * 60 + min;
}

export function parseOpenRule(raw: string | null | undefined): OpenRule {
  const text = (raw ?? "").trim();
  if (!text) return { kind: "unknown" };

  const weekly = text.match(/매주\s*([일월화수목금토])요일/);
  if (weekly) {
    const span = Number(text.match(/(\d+)\s*일치/)?.[1] ?? 7);
    return { kind: "weekly", weekday: WEEKDAYS.indexOf(weekly[1]), minutes: parseTime(text) ?? 0, span };
  }

  const weeks = text.match(/(\d+)\s*주\s*전/);
  const days = text.match(/(\d+)\s*일\s*전/);
  const approx = /약/.test(text);
  if (days) return { kind: "daily", days: Number(days[1]), minutes: parseTime(text), approx };
  if (weeks) return { kind: "daily", days: Number(weeks[1]) * 7, minutes: parseTime(text), approx: true };
  return { kind: "unknown" };
}

// ── 날짜 계산(한국 시간) ──
type Ymd = { y: number; m: number; d: number };
const KST = 9 * 60;

function kstParts(now: Date): Ymd & { minutes: number; weekday: number } {
  const t = new Date(now.getTime() + KST * 60000);
  return {
    y: t.getUTCFullYear(),
    m: t.getUTCMonth() + 1,
    d: t.getUTCDate(),
    minutes: t.getUTCHours() * 60 + t.getUTCMinutes(),
    weekday: t.getUTCDay(),
  };
}

function addDays(a: Ymd, n: number): Ymd {
  const t = new Date(Date.UTC(a.y, a.m - 1, a.d + n));
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

function weekdayOf(a: Ymd): number {
  return new Date(Date.UTC(a.y, a.m - 1, a.d)).getUTCDay();
}

export function md(a: Ymd): string {
  return `${a.m}/${a.d}(${WEEKDAYS[weekdayOf(a)]})`;
}

function clock(minutes: number): string {
  if (minutes === 0) return "밤 12시";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const label = h < 12 ? "오전" : "오후";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${label} ${hh}시${m ? ` ${m}분` : ""}`;
}

export type OpenStatus = {
  rule: string; // 사람이 읽는 규칙 한 줄
  lastBookable: Ymd | null; // 지금 예약할 수 있는 가장 먼 날짜
  next: { date: Ymd; when: string } | null; // 다음에 열리는 날짜와 그 시각("오늘 밤 12시")
  approx: boolean; // 시각을 몰라 대략인지
};

export function openStatus(raw: string | null | undefined, now: Date): OpenStatus | null {
  const rule = parseOpenRule(raw);
  if (rule.kind === "unknown") return null;
  const k = kstParts(now);
  const today: Ymd = { y: k.y, m: k.m, d: k.d };

  if (rule.kind === "daily") {
    const ruleText = `이용일 ${rule.days}일 전${rule.minutes === null ? "" : ` ${rule.minutes === 0 ? "자정(밤 12시)" : clock(rule.minutes)}`}에 열려요`;
    if (rule.minutes === null) {
      return { rule: `이용일 ${rule.days}일 전에 열려요`, lastBookable: addDays(today, rule.days), next: null, approx: true };
    }
    // 자정 오픈 = 그날 0시(이미 지났음) → 오늘 기준 days 일 뒤까지 열려 있고, 다음은 오늘 밤 12시
    const openedToday = rule.minutes === 0 ? true : k.minutes >= rule.minutes;
    const last = addDays(today, openedToday ? rule.days : rule.days - 1);
    const nextDate = addDays(last, 1);
    const when =
      rule.minutes === 0
        ? "오늘 밤 12시"
        : openedToday
          ? `내일 ${clock(rule.minutes)}`
          : `오늘 ${clock(rule.minutes)}`;
    return { rule: ruleText, lastBookable: last, next: { date: nextDate, when }, approx: rule.approx };
  }

  // weekly: 매주 그 요일·시각에 "다음 주"(월~일 같은 7일) 예약이 열린다.
  // 가장 최근에 열린 날 = O → 지금은 O+6+span 까지 예약 가능, 다음 오픈은 O+7 같은 시각.
  const back = (k.weekday - rule.weekday + 7) % 7;
  const openedToday = back === 0 && k.minutes >= rule.minutes;
  const lastOpen = addDays(today, -(back === 0 ? (openedToday ? 0 : 7) : back));
  const last = addDays(lastOpen, 6 + rule.span);
  const nextOpen = addDays(lastOpen, 7);
  const isToday = nextOpen.y === today.y && nextOpen.m === today.m && nextOpen.d === today.d;
  return {
    rule: `매주 ${WEEKDAYS[rule.weekday]}요일 ${clock(rule.minutes)}에 다음 주 예약이 열려요`,
    lastBookable: last,
    next: { date: addDays(last, 1), when: `${isToday ? "오늘" : md(nextOpen)} ${clock(rule.minutes)}` },
    approx: false,
  };
}

// 목록 카드용 짧은 글: "7일 전 오픈"
export function shortRule(raw: string | null | undefined): string {
  const r = parseOpenRule(raw);
  if (r.kind === "daily") return r.approx && r.days % 7 === 0 ? `약 ${r.days / 7}주 전 오픈` : `${r.approx ? "약 " : ""}${r.days}일 전 오픈`;
  if (r.kind === "weekly") return `매주 ${WEEKDAYS[r.weekday]} 오픈`;
  return "";
}
