import { Lunar, Solar } from 'lunar-javascript';
import { BRANCHES, STEMS, getDayPillar, getHourPillar, getYearPillar } from './baziCalc.js';
import { formatDateTimeCN } from './dateTime.js';

const PALACES = [
  { name: '坎', pos: 1, direction: '正北' },
  { name: '坤', pos: 2, direction: '西南' },
  { name: '震', pos: 3, direction: '正东' },
  { name: '巽', pos: 4, direction: '东南' },
  { name: '中', pos: 5, direction: '中宫' },
  { name: '乾', pos: 6, direction: '西北' },
  { name: '兑', pos: 7, direction: '正西' },
  { name: '艮', pos: 8, direction: '东北' },
  { name: '离', pos: 9, direction: '正南' },
];

const GRID_POSITIONS = [4, 9, 2, 3, 5, 7, 8, 1, 6];
const DOOR_HOME = {
  休门: 1,
  生门: 8,
  伤门: 3,
  杜门: 4,
  景门: 9,
  死门: 2,
  惊门: 7,
  开门: 6,
};
const STAR_HOME = {
  天蓬: 1,
  天任: 8,
  天冲: 3,
  天辅: 4,
  天英: 9,
  天芮: 2,
  天柱: 7,
  天心: 6,
  天禽: 5,
};
const GODS = ['值符', '腾蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天'];
const QIYI = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'];
const XUN_HEAD_STEM = {
  子: '戊',
  戌: '己',
  申: '庚',
  午: '辛',
  辰: '壬',
  寅: '癸',
};
const TERM_YUAN_JU = {
  冬至: [1, 7, 4],
  小寒: [2, 8, 5],
  大寒: [3, 9, 6],
  立春: [8, 5, 2],
  雨水: [9, 6, 3],
  惊蛰: [1, 7, 4],
  春分: [3, 9, 6],
  清明: [4, 1, 7],
  谷雨: [5, 2, 8],
  立夏: [4, 1, 7],
  小满: [5, 1, 8],
  芒种: [6, 3, 9],
  夏至: [9, 3, 6],
  小暑: [8, 2, 5],
  大暑: [7, 1, 4],
  立秋: [2, 5, 8],
  处暑: [1, 4, 7],
  白露: [9, 3, 6],
  秋分: [7, 1, 4],
  寒露: [6, 9, 3],
  霜降: [5, 8, 2],
  立冬: [6, 9, 3],
  小雪: [5, 8, 2],
  大雪: [4, 7, 1],
};
const YANG_TERMS = new Set([
  '冬至', '小寒', '大寒', '立春', '雨水', '惊蛰',
  '春分', '清明', '谷雨', '立夏', '小满', '芒种',
]);
const YUAN_NAMES = ['上元', '中元', '下元'];

function mod(value, size) {
  return ((value % size) + size) % size;
}

function palaceByPos(pos) {
  return PALACES.find((palace) => palace.pos === pos);
}

function movePalace(pos, steps, direction) {
  const index = pos - 1;
  const next = direction === '阳遁' ? index + steps : index - steps;
  return mod(next, 9) + 1;
}

function toDateFromSolar(solar) {
  return new Date(
    solar.getYear(),
    solar.getMonth() - 1,
    solar.getDay(),
    solar.getHour(),
    solar.getMinute(),
    solar.getSecond(),
  );
}

function normalizeTerm(term) {
  if (!term) return null;
  return { name: term.getName(), date: toDateFromSolar(term.getSolar()) };
}

function getTerms(date) {
  const lunar = Solar.fromDate(date).getLunar();
  return {
    previous: normalizeTerm(lunar.getPrevJieQi(true)),
    next: normalizeTerm(lunar.getNextJieQi(true)),
    previousJie: normalizeTerm(lunar.getPrevJie(true)),
    nextJie: normalizeTerm(lunar.getNextJie(true)),
  };
}

function stemBranchIndex(pillar) {
  const stemIndex = STEMS.indexOf(pillar.stem);
  const branchIndex = BRANCHES.indexOf(pillar.branch);
  for (let index = 0; index < 60; index += 1) {
    if (index % 10 === stemIndex && index % 12 === branchIndex) return index;
  }
  return 0;
}

function getYuanByDay(dayPillar) {
  const cycleIndex = stemBranchIndex(dayPillar);
  return Math.floor(mod(cycleIndex, 15) / 5);
}

function getXunInfo(hourPillar) {
  const index = stemBranchIndex(hourPillar);
  const start = Math.floor(index / 10) * 10;
  const headBranch = BRANCHES[start % 12];
  return {
    head: `甲${headBranch}`,
    headBranch,
    chiefStem: XUN_HEAD_STEM[headBranch] || '戊',
    voidBranches: `${BRANCHES[(start + 10) % 12]}、${BRANCHES[(start + 11) % 12]}`,
  };
}

function palaceOfStem(stem, earthPlate) {
  return earthPlate[stem] || 5;
}

function buildEarthPlate(ju, direction) {
  return QIYI.reduce((acc, stem, index) => {
    acc[stem] = movePalace(ju, index, direction);
    return acc;
  }, {});
}

function placeByHome(map, dutyHome, dutyTarget, direction) {
  const steps = direction === '阳遁'
    ? mod(dutyTarget - dutyHome, 9)
    : mod(dutyHome - dutyTarget, 9);

  return Object.entries(map).reduce((acc, [name, home]) => {
    acc[name] = movePalace(home, steps, direction);
    return acc;
  }, {});
}

function buildGodPlate(dutyTarget, direction) {
  return GODS.reduce((acc, god, index) => {
    acc[god] = movePalace(dutyTarget, index, direction);
    return acc;
  }, {});
}

function invert(map) {
  return Object.entries(map).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
  }, {});
}

function formatTerm(term) {
  if (!term) return '未取到节气';
  return `${term.name}：${formatDateTimeCN(term.date)}`;
}

function formatLunar(date) {
  const lunar = Solar.fromDate(date).getLunar();
  return lunar.toString();
}

export function calculateQiMen(date = new Date(), options = {}) {
  const terms = getTerms(date);
  const termName = terms.previous?.name || '小满';
  const yuanIndex = getYuanByDay(getDayPillar(date));
  const direction = YANG_TERMS.has(termName) ? '阳遁' : '阴遁';
  const ju = TERM_YUAN_JU[termName]?.[yuanIndex] || 1;
  const dayPillar = getDayPillar(date);
  const hourPillar = getHourPillar(dayPillar.stem, date.getHours());
  const yearPillar = getYearPillar(date);
  const lunar = Lunar.fromDate(date);
  const monthPillar = {
    stem: lunar.getMonthInGanZhi()[0],
    branch: lunar.getMonthInGanZhi()[1],
    full: lunar.getMonthInGanZhi(),
  };
  const xun = getXunInfo(hourPillar);
  const earthPlate = buildEarthPlate(ju, direction);
  const dutyTarget = palaceOfStem(xun.chiefStem, earthPlate);
  const dutyStar = Object.entries(STAR_HOME).find(([, pos]) => pos === dutyTarget)?.[0] || '天禽';
  const dutyDoor = Object.entries(DOOR_HOME).find(([, pos]) => pos === dutyTarget)?.[0] || '休门';
  const starPlate = placeByHome(STAR_HOME, STAR_HOME[dutyStar], dutyTarget, direction);
  const doorPlate = placeByHome(DOOR_HOME, DOOR_HOME[dutyDoor], dutyTarget, direction);
  const godPlate = buildGodPlate(dutyTarget, direction);
  const starsByPos = invert(starPlate);
  const doorsByPos = invert(doorPlate);
  const godsByPos = invert(godPlate);
  const stemsByPos = invert(earthPlate);
  const palaces = GRID_POSITIONS.map((pos) => {
    const palace = palaceByPos(pos);
    return {
      ...palace,
      star: starsByPos[pos] || '',
      door: doorsByPos[pos] || '',
      god: godsByPos[pos] || '',
      stem: stemsByPos[pos] || '',
    };
  });

  return {
    date,
    method: options.method || '转盘奇门',
    juMethod: options.juMethod || '拆补无闰法',
    direction,
    ju,
    yuan: YUAN_NAMES[yuanIndex],
    termName,
    terms,
    lunarText: formatLunar(date),
    pillars: {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: hourPillar,
    },
    xun,
    dutyStar,
    dutyDoor,
    dutyStem: xun.chiefStem,
    dutyTarget,
    palaces,
    termText: {
      previous: formatTerm(terms.previous),
      next: formatTerm(terms.next),
    },
  };
}
