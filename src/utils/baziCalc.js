import { Lunar, LunarUtil, Solar } from 'lunar-javascript';

export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const MONTH_BRANCHES = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
const JIE_TO_BRANCH = {
  立春: '寅',
  惊蛰: '卯',
  清明: '辰',
  立夏: '巳',
  芒种: '午',
  小暑: '未',
  立秋: '申',
  白露: '酉',
  寒露: '戌',
  立冬: '亥',
  大雪: '子',
  小寒: '丑',
};

const MONTH_STEM_START = {
  甲: 2, 己: 2,
  乙: 4, 庚: 4,
  丙: 6, 辛: 6,
  丁: 8, 壬: 8,
  戊: 0, 癸: 0,
};

const HOUR_STEM_START = {
  甲: 0, 己: 0,
  乙: 2, 庚: 2,
  丙: 4, 辛: 4,
  丁: 6, 壬: 6,
  戊: 8, 癸: 8,
};

export const STEM_META = {
  甲: { element: '木', yinYang: '阳' },
  乙: { element: '木', yinYang: '阴' },
  丙: { element: '火', yinYang: '阳' },
  丁: { element: '火', yinYang: '阴' },
  戊: { element: '土', yinYang: '阳' },
  己: { element: '土', yinYang: '阴' },
  庚: { element: '金', yinYang: '阳' },
  辛: { element: '金', yinYang: '阴' },
  壬: { element: '水', yinYang: '阳' },
  癸: { element: '水', yinYang: '阴' },
};

export const BRANCH_META = {
  子: { element: '水', hidden: ['癸'] },
  丑: { element: '土', hidden: ['己', '癸', '辛'] },
  寅: { element: '木', hidden: ['甲', '丙', '戊'] },
  卯: { element: '木', hidden: ['乙'] },
  辰: { element: '土', hidden: ['戊', '乙', '癸'] },
  巳: { element: '火', hidden: ['丙', '庚', '戊'] },
  午: { element: '火', hidden: ['丁', '己'] },
  未: { element: '土', hidden: ['己', '丁', '乙'] },
  申: { element: '金', hidden: ['庚', '壬', '戊'] },
  酉: { element: '金', hidden: ['辛'] },
  戌: { element: '土', hidden: ['戊', '辛', '丁'] },
  亥: { element: '水', hidden: ['壬', '甲'] },
};

const GENERATES = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
const OVERCOMES = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
const YANG_YEAR_STEMS = new Set(['甲', '丙', '戊', '庚', '壬']);
const GROWTH_STAGES = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'];
const GROWTH_START = {
  甲: '亥', 乙: '午',
  丙: '寅', 丁: '酉',
  戊: '寅', 己: '酉',
  庚: '巳', 辛: '子',
  壬: '申', 癸: '卯',
};
const YIN_STEMS = new Set(['乙', '丁', '己', '辛', '癸']);

const NOBLEMAN = {
  甲: ['丑', '未'], 戊: ['丑', '未'], 庚: ['丑', '未'],
  乙: ['子', '申'], 己: ['子', '申'],
  丙: ['亥', '酉'], 丁: ['亥', '酉'],
  壬: ['卯', '巳'], 癸: ['卯', '巳'],
  辛: ['寅', '午'],
};

const WENCHANG = {
  甲: '巳', 乙: '午', 丙: '申', 丁: '酉', 戊: '申',
  己: '酉', 庚: '亥', 辛: '子', 壬: '寅', 癸: '卯',
};

const YANG_REN = {
  甲: '卯', 乙: '辰', 丙: '午', 丁: '未', 戊: '午',
  己: '未', 庚: '酉', 辛: '戌', 壬: '子', 癸: '丑',
};

const BRANCH_GROUPS = [
  { branches: ['申', '子', '辰'], horse: '寅', peach: '酉', canopy: '辰' },
  { branches: ['寅', '午', '戌'], horse: '申', peach: '卯', canopy: '戌' },
  { branches: ['巳', '酉', '丑'], horse: '亥', peach: '午', canopy: '丑' },
  { branches: ['亥', '卯', '未'], horse: '巳', peach: '子', canopy: '未' },
];

function pad(value) {
  return String(value).padStart(2, '0');
}

function toSolar(date) {
  return Solar.fromDate(date);
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

function stemBranch(full) {
  return { stem: full[0], branch: full[1], full };
}

function cycleIndex(full) {
  const stemIndex = STEMS.indexOf(full[0]);
  const branchIndex = BRANCHES.indexOf(full[1]);
  if (stemIndex < 0 || branchIndex < 0) return -1;

  for (let index = 0; index < 60; index += 1) {
    if (index % 10 === stemIndex && index % 12 === branchIndex) return index;
  }
  return -1;
}

function pillarFromCycle(index) {
  const normalized = ((index % 60) + 60) % 60;
  const full = STEMS[normalized % 10] + BRANCHES[normalized % 12];
  return stemBranch(full);
}

function formatSolarDateTime(date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatSolarDate(date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatLunarDateTime(lunar, hour, minute) {
  return `${lunar.toString()} ${pad(hour)}:${pad(minute)}`;
}

function formatTerm(term) {
  if (!term) return '未取到节气';
  return `${term.name} ${formatSolarDateTime(term.date)}`;
}

function normalizeTerm(term) {
  if (!term) return null;
  const solar = term.getSolar();
  return {
    name: term.getName(),
    date: toDateFromSolar(solar),
  };
}

function getSolarTerms(lunar) {
  return {
    previous: normalizeTerm(lunar.getPrevJieQi(true)),
    next: normalizeTerm(lunar.getNextJieQi(true)),
    previousJie: normalizeTerm(lunar.getPrevJie(true)),
    nextJie: normalizeTerm(lunar.getNextJie(true)),
  };
}

function getMonthBranchByJie(previousJieName) {
  return JIE_TO_BRANCH[previousJieName] || '寅';
}

function getProsperity(stem, branch) {
  const startBranch = GROWTH_START[stem];
  const startIndex = BRANCHES.indexOf(startBranch);
  const branchIndex = BRANCHES.indexOf(branch);
  if (startIndex < 0 || branchIndex < 0) return '';

  const offset = YIN_STEMS.has(stem)
    ? (startIndex - branchIndex + 12) % 12
    : (branchIndex - startIndex + 12) % 12;
  return GROWTH_STAGES[offset];
}

function getBranchGroup(branch) {
  return BRANCH_GROUPS.find((group) => group.branches.includes(branch)) || BRANCH_GROUPS[0];
}

export function getHourBranchIndex(hour) {
  return Math.floor((Number(hour) + 1) / 2) % 12;
}

export function getYearPillar(yearOrDate) {
  if (yearOrDate instanceof Date) {
    return stemBranch(toSolar(yearOrDate).getLunar().getYearInGanZhiByLiChun());
  }

  const year = Number(yearOrDate);
  const index = year - 1984;
  return pillarFromCycle(index);
}

export function getMonthPillar(yearStemOrDate, month) {
  if (yearStemOrDate instanceof Date) {
    const lunar = toSolar(yearStemOrDate).getLunar();
    const yearPillar = getYearPillar(yearStemOrDate);
    const previousJie = lunar.getPrevJie(true);
    const branch = getMonthBranchByJie(previousJie.getName());
    return getMonthPillarByBranch(yearPillar.stem, branch);
  }

  const yearStem = yearStemOrDate;
  const branch = MONTH_BRANCHES[((Number(month) - 1) % 12 + 12) % 12];
  return getMonthPillarByBranch(yearStem, branch);
}

export function getMonthPillarByBranch(yearStem, branch) {
  const startStem = MONTH_STEM_START[yearStem] ?? 2;
  const offset = MONTH_BRANCHES.indexOf(branch);
  const stem = STEMS[(startStem + offset + 10) % 10];
  return { stem, branch, full: stem + branch };
}

export function getDayPillar(date) {
  return stemBranch(toSolar(date).getLunar().getDayInGanZhi());
}

export function getHourPillar(dayStem, hour) {
  const branchIndex = getHourBranchIndex(hour);
  const startStem = HOUR_STEM_START[dayStem] ?? 0;
  const stem = STEMS[(startStem + branchIndex) % 10];
  const branch = BRANCHES[branchIndex];
  return { stem, branch, full: stem + branch };
}

export function getTenGod(dayStem, targetStem) {
  if (!dayStem || !targetStem) return '';
  const day = STEM_META[dayStem];
  const target = STEM_META[targetStem];
  if (!day || !target) return '';

  const samePolarity = day.yinYang === target.yinYang;
  if (day.element === target.element) return samePolarity ? '比肩' : '劫财';
  if (GENERATES[day.element] === target.element) return samePolarity ? '食神' : '伤官';
  if (GENERATES[target.element] === day.element) return samePolarity ? '偏印' : '正印';
  if (OVERCOMES[day.element] === target.element) return samePolarity ? '偏财' : '正财';
  if (OVERCOMES[target.element] === day.element) return samePolarity ? '七杀' : '正官';
  return '';
}

function enrichPillar(pillar, dayStem, role) {
  const stemMeta = STEM_META[pillar.stem];
  const branchMeta = BRANCH_META[pillar.branch];
  const hidden = branchMeta.hidden.map((stem) => ({
    stem,
    tenGod: getTenGod(dayStem, stem),
    element: STEM_META[stem].element,
  }));

  return {
    ...pillar,
    role,
    stemElement: stemMeta.element,
    stemYinYang: stemMeta.yinYang,
    branchElement: branchMeta.element,
    fiveElementText: `${stemMeta.yinYang}${stemMeta.element} · ${branchMeta.element}`,
    hidden,
    hiddenText: hidden.map((item) => `${item.stem}${item.tenGod}`).join('、'),
    tenGod: role === 'day' ? '日主' : getTenGod(dayStem, pillar.stem),
    prosperity: getProsperity(dayStem, pillar.branch),
    nayin: LunarUtil.NAYIN[pillar.full] || '',
  };
}

function getLuckDirection(yearStem, gender) {
  const yangYear = YANG_YEAR_STEMS.has(yearStem);
  const male = gender === 'male';
  return (yangYear && male) || (!yangYear && !male) ? 'forward' : 'backward';
}

function termCalendarDays(fromDate, toDate) {
  const from = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const to = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
  return Math.max(0, Math.abs(Math.round((to - from) / 86400000)) - 1);
}

function convertDaysToStartAge(days) {
  const totalMonths = Math.round(days * 4);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return {
    days,
    years,
    months,
    text: months ? `${years}岁${months}个月` : `${years}岁`,
  };
}

function addStartAge(date, age) {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + age.years);
  result.setMonth(result.getMonth() + age.months);
  return result;
}

function buildLuckPillars({ monthPillar, dayStem, direction, startAge }) {
  const monthIndex = cycleIndex(monthPillar.full);
  const step = direction === 'forward' ? 1 : -1;
  return Array.from({ length: 8 }, (_, index) => {
    const pillar = pillarFromCycle(monthIndex + step * (index + 1));
    return {
      ...enrichPillar(pillar, dayStem, 'luck'),
      startAge: startAge.years + index * 10,
    };
  });
}

function buildAnnualLuck({ birthDate, dayStem }) {
  const birthYear = birthDate.getFullYear();
  return Array.from({ length: 100 }, (_, index) => {
    const year = birthYear + index;
    const pillar = getYearPillar(year);
    return {
      ...enrichPillar(pillar, dayStem, 'annual'),
      year,
      virtualAge: index + 1,
    };
  });
}

export function getVoidBranches(dayPillar) {
  const stemIndex = STEMS.indexOf(dayPillar.stem);
  const branchIndex = BRANCHES.indexOf(dayPillar.branch);
  if (stemIndex < 0 || branchIndex < 0) return '';
  const cycleStartBranch = (branchIndex - stemIndex + 12) % 12;
  return `${BRANCHES[(cycleStartBranch + 10) % 12]}、${BRANCHES[(cycleStartBranch + 11) % 12]}`;
}

function formatShenShaTargets(name, branches) {
  return `${name}：${Array.isArray(branches) ? branches.join('、') : branches}`;
}

function branchShenSha(branch) {
  const group = getBranchGroup(branch);
  return [
    formatShenShaTargets('驿马', group.horse),
    formatShenShaTargets('桃花', group.peach),
    formatShenShaTargets('华盖', group.canopy),
  ];
}

function stemShenSha(stem) {
  return [
    formatShenShaTargets('天乙贵人', NOBLEMAN[stem] || []),
    formatShenShaTargets('文昌', WENCHANG[stem]),
    formatShenShaTargets('羊刃', YANG_REN[stem]),
  ].filter((item) => !item.endsWith('：'));
}

function buildShenShaRows(pillars, voidBranches) {
  return [
    { label: '年干', base: pillars.year.stem, items: stemShenSha(pillars.year.stem) },
    { label: '年支', base: pillars.year.branch, items: branchShenSha(pillars.year.branch) },
    { label: '月支', base: pillars.month.branch, items: branchShenSha(pillars.month.branch) },
    { label: '日干', base: pillars.day.stem, items: stemShenSha(pillars.day.stem) },
    { label: '日支', base: pillars.day.branch, items: [...branchShenSha(pillars.day.branch), `空亡：${voidBranches}`] },
  ];
}

function buildChart(date, { gender = 'male', calendarType = 'solar', inputText = '' } = {}) {
  const solar = toSolar(date);
  const lunar = solar.getLunar();
  const terms = getSolarTerms(lunar);
  const yearPillar = getYearPillar(date);
  const monthPillar = getMonthPillarByBranch(yearPillar.stem, getMonthBranchByJie(terms.previousJie?.name));
  const dayPillar = getDayPillar(date);
  const hourPillar = getHourPillar(dayPillar.stem, date.getHours());
  const dayStem = dayPillar.stem;

  const pillars = {
    year: enrichPillar(yearPillar, dayStem, 'year'),
    month: enrichPillar(monthPillar, dayStem, 'month'),
    day: enrichPillar(dayPillar, dayStem, 'day'),
    hour: enrichPillar(hourPillar, dayStem, 'hour'),
  };
  const normalizedGender = gender === 'female' ? 'female' : 'male';
  const direction = getLuckDirection(pillars.year.stem, normalizedGender);
  const targetJie = direction === 'forward' ? terms.nextJie : terms.previousJie;
  const startDays = targetJie ? termCalendarDays(date, targetJie.date) : 0;
  const startAge = convertDaysToStartAge(startDays);
  const transitDate = addStartAge(date, startAge);
  const voidBranches = getVoidBranches(pillars.day);

  return {
    ...pillars,
    pillars,
    solarDate: date,
    lunar,
    calendarType,
    inputText,
    solarText: formatSolarDateTime(date),
    lunarText: formatLunarDateTime(lunar, date.getHours(), date.getMinutes()),
    previousTerm: terms.previous,
    nextTerm: terms.next,
    previousJie: terms.previousJie,
    nextJie: terms.nextJie,
    previousTermText: formatTerm(terms.previous),
    nextTermText: formatTerm(terms.next),
    gender: normalizedGender,
    genderText: normalizedGender === 'male' ? '男' : '女',
    yearPolarity: YANG_YEAR_STEMS.has(pillars.year.stem) ? '阳年' : '阴年',
    direction,
    directionText: direction === 'forward' ? '顺排' : '逆排',
    luckRuleText: `${YANG_YEAR_STEMS.has(pillars.year.stem) ? '阳年' : '阴年'}${normalizedGender === 'male' ? '男' : '女'}${direction === 'forward' ? '顺排' : '逆排'}`,
    startAge,
    startAgeText: startAge.text,
    transitDate,
    transitText: formatSolarDate(transitDate),
    luckTargetTerm: targetJie,
    luckPillars: buildLuckPillars({ monthPillar: pillars.month, dayStem, direction, startAge }),
    annualLuck: buildAnnualLuck({ birthDate: date, dayStem }),
    shenShaRows: buildShenShaRows(pillars, voidBranches),
    voidBranches,
    dayMaster: {
      stem: dayStem,
      ...STEM_META[dayStem],
      prosperity: getProsperity(dayStem, pillars.day.branch),
    },
  };
}

export function calculateBaZi(year, month, day, hour = 0, minute = 0, options = {}) {
  return calculateBaZiFromDate(new Date(year, month - 1, day, hour, minute), options);
}

export function calculateBaZiFromDate(date, options = {}) {
  return buildChart(date, { ...options, calendarType: options.calendarType || 'solar' });
}

export function calculateBaZiFromLunar({ year, month, day, hour = 0, minute = 0, gender = 'male' }) {
  const lunar = Lunar.fromYmdHms(Number(year), Number(month), Number(day), Number(hour), Number(minute), 0);
  const solar = lunar.getSolar();
  const date = toDateFromSolar(solar);
  return buildChart(date, {
    gender,
    calendarType: 'lunar',
    inputText: `农历${year}年${month}月${day}日 ${pad(hour)}:${pad(minute)}`,
  });
}

export function countFiveElements(pillars) {
  const counts = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  pillars.forEach((pillar) => {
    counts[pillar.stemElement] += 1;
    counts[pillar.branchElement] += 1;
    pillar.hidden.forEach((item) => { counts[item.element] += 0.5; });
  });
  return counts;
}

export function parseDateTimeParts(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value || '');
  if (!match) return null;
  const [, year, month, day, hour, minute] = match;
  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
  };
}
