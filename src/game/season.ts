export type SeasonContext = {
  term: string;
  hint: string;
  nightLabel: string;
  isOpenHours: boolean;
};

const TERMS = [
  ["小寒", 1, 5],
  ["大寒", 1, 20],
  ["立春", 2, 4],
  ["雨水", 2, 19],
  ["惊蛰", 3, 6],
  ["春分", 3, 21],
  ["清明", 4, 5],
  ["谷雨", 4, 20],
  ["立夏", 5, 6],
  ["小满", 5, 21],
  ["芒种", 6, 6],
  ["夏至", 6, 21],
  ["小暑", 7, 7],
  ["大暑", 7, 23],
  ["立秋", 8, 8],
  ["处暑", 8, 23],
  ["白露", 9, 8],
  ["秋分", 9, 23],
  ["寒露", 10, 8],
  ["霜降", 10, 23],
  ["立冬", 11, 7],
  ["小雪", 11, 22],
  ["大雪", 12, 7],
  ["冬至", 12, 22]
] as const;

export function getSeasonContext(date: Date = new Date()): SeasonContext {
  const term = getCurrentTerm(date);
  const hour = date.getHours();
  const isOpenHours = hour >= 18 || hour < 6;
  return {
    term,
    hint: `今夜${term}，铺子里有件物事，像是等过你。`,
    nightLabel: isOpenHours ? "夜铺已开" : "未入夜，雾门借开",
    isOpenHours
  };
}

function getCurrentTerm(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  let current = TERMS[TERMS.length - 1][0];
  for (const [term, termMonth, termDay] of TERMS) {
    if (month > termMonth || (month === termMonth && day >= termDay)) {
      current = term;
    }
  }
  return current;
}
