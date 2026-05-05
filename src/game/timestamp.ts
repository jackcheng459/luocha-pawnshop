const HEAVENLY_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const EARTHLY_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const HOUR_NAMES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const QUARTER_NAMES = ["初", "二", "三", "四", "五", "六", "七"];

export function getClassicalTimestamp(date: Date = new Date()): string {
  const year = date.getFullYear();
  const stemIdx = positiveMod(year - 4, 10);
  const branchIdx = positiveMod(year - 4, 12);
  const hour = date.getHours();
  const shichenIdx = Math.floor((hour + 1) / 2) % 12;
  const quarterIdx = Math.floor(date.getMinutes() / 9) % QUARTER_NAMES.length;

  return `${HEAVENLY_STEMS[stemIdx]}${EARTHLY_BRANCHES[branchIdx]}年某月某夜${HOUR_NAMES[shichenIdx]}时${QUARTER_NAMES[quarterIdx]}刻`;
}

function positiveMod(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}
