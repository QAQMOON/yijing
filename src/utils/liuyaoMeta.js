import { BRANCHES, calculateBaZiFromDate } from './baziCalc.js';
import { formatDateTimeCN } from './dateTime.js';

const PALACE_BY_HEXAGRAM = {
  1:'乾宫', 44:'乾宫', 33:'乾宫', 12:'乾宫', 20:'乾宫', 23:'乾宫', 35:'乾宫', 14:'乾宫',
  29:'坎宫', 60:'坎宫', 3:'坎宫', 63:'坎宫', 49:'坎宫', 55:'坎宫', 36:'坎宫', 7:'坎宫',
  52:'艮宫', 22:'艮宫', 26:'艮宫', 41:'艮宫', 38:'艮宫', 10:'艮宫', 61:'艮宫', 53:'艮宫',
  51:'震宫', 16:'震宫', 40:'震宫', 32:'震宫', 46:'震宫', 48:'震宫', 28:'震宫', 17:'震宫',
  57:'巽宫', 9:'巽宫', 37:'巽宫', 42:'巽宫', 25:'巽宫', 21:'巽宫', 27:'巽宫', 18:'巽宫',
  30:'离宫', 56:'离宫', 50:'离宫', 64:'离宫', 4:'离宫', 59:'离宫', 6:'离宫', 13:'离宫',
  2:'坤宫', 24:'坤宫', 19:'坤宫', 11:'坤宫', 34:'坤宫', 43:'坤宫', 5:'坤宫', 8:'坤宫',
  58:'兑宫', 47:'兑宫', 45:'兑宫', 31:'兑宫', 39:'兑宫', 15:'兑宫', 62:'兑宫', 54:'兑宫',
};

const PALACE_SEQUENCES = {
  '乾宫': [1, 44, 33, 12, 20, 23, 35, 14],
  '坎宫': [29, 60, 3, 63, 49, 55, 36, 7],
  '艮宫': [52, 22, 26, 41, 38, 10, 61, 53],
  '震宫': [51, 16, 40, 32, 46, 48, 28, 17],
  '巽宫': [57, 9, 37, 42, 25, 21, 27, 18],
  '离宫': [30, 56, 50, 64, 4, 59, 6, 13],
  '坤宫': [2, 24, 19, 11, 34, 43, 5, 8],
  '兑宫': [58, 47, 45, 31, 39, 15, 62, 54],
};

const WORLD_RESPONDING_BY_STAGE = [
  { world: 5, responding: 2 },
  { world: 0, responding: 3 },
  { world: 1, responding: 4 },
  { world: 2, responding: 5 },
  { world: 3, responding: 0 },
  { world: 4, responding: 1 },
  { world: 3, responding: 0 },
  { world: 2, responding: 5 },
];

const PALACE_ELEMENTS = {
  '乾宫': '金',
  '兑宫': '金',
  '坎宫': '水',
  '艮宫': '土',
  '坤宫': '土',
  '震宫': '木',
  '巽宫': '木',
  '离宫': '火',
};

const TRIGRAM_NAJIA_BRANCHES = {
  '乾': ['子', '寅', '辰', '午', '申', '戌'],
  '坤': ['未', '巳', '卯', '丑', '亥', '酉'],
  '震': ['子', '寅', '辰', '午', '申', '戌'],
  '巽': ['丑', '亥', '酉', '未', '巳', '卯'],
  '坎': ['寅', '辰', '午', '申', '戌', '子'],
  '离': ['卯', '丑', '亥', '酉', '未', '巳'],
  '艮': ['辰', '午', '申', '戌', '子', '寅'],
  '兑': ['巳', '卯', '丑', '亥', '酉', '未'],
};

const BRANCH_ELEMENTS = {
  '子': '水',
  '亥': '水',
  '寅': '木',
  '卯': '木',
  '巳': '火',
  '午': '火',
  '申': '金',
  '酉': '金',
  '辰': '土',
  '戌': '土',
  '丑': '土',
  '未': '土',
};

const ELEMENT_GENERATES = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
const ELEMENT_OVERCOMES = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };

const SIX_GODS = ['青龙', '朱雀', '勾陈', '腾蛇', '白虎', '玄武'];
const SIX_GOD_START = {
  '甲':0, '乙':0,
  '丙':1, '丁':1,
  '戊':2,
  '己':3,
  '庚':4, '辛':4,
  '壬':5, '癸':5,
};

const SOLAR_TERMS = [
  ['小寒', 1, 5], ['大寒', 1, 20],
  ['立春', 2, 4], ['雨水', 2, 19],
  ['惊蛰', 3, 6], ['春分', 3, 21],
  ['清明', 4, 5], ['谷雨', 4, 20],
  ['立夏', 5, 6], ['小满', 5, 21],
  ['芒种', 6, 6], ['夏至', 6, 21],
  ['小暑', 7, 7], ['大暑', 7, 23],
  ['立秋', 8, 8], ['处暑', 8, 23],
  ['白露', 9, 8], ['秋分', 9, 23],
  ['寒露', 10, 8], ['霜降', 10, 23],
  ['立冬', 11, 7], ['小雪', 11, 22],
  ['大雪', 12, 7], ['冬至', 12, 22],
];

const BRANCH_GROUPS = {
  '申子辰': ['申','子','辰'],
  '寅午戌': ['寅','午','戌'],
  '巳酉丑': ['巳','酉','丑'],
  '亥卯未': ['亥','卯','未'],
};

const PEACH_BLOSSOM = {
  '申子辰':'酉',
  '寅午戌':'卯',
  '巳酉丑':'午',
  '亥卯未':'子',
};

const TRAVEL_HORSE = {
  '申子辰':'寅',
  '寅午戌':'申',
  '巳酉丑':'亥',
  '亥卯未':'巳',
};

const GENERAL_STAR = {
  '申子辰':'子',
  '寅午戌':'午',
  '巳酉丑':'酉',
  '亥卯未':'卯',
};

const FLOWER_CANOPY = {
  '申子辰':'辰',
  '寅午戌':'戌',
  '巳酉丑':'丑',
  '亥卯未':'未',
};

const TRIGRAM_IMAGES = {
  乾: '天',
  坤: '地',
  震: '雷',
  巽: '风',
  坎: '水',
  离: '火',
  艮: '山',
  兑: '泽',
};

const PURE_HEXAGRAM_NAMES = {
  乾: '乾为天',
  坤: '坤为地',
  震: '震为雷',
  巽: '巽为风',
  坎: '坎为水',
  离: '离为火',
  艮: '艮为山',
  兑: '兑为泽',
};

const NOBLEMAN = {
  '甲':['丑','未'], '戊':['丑','未'], '庚':['丑','未'],
  '乙':['子','申'], '己':['子','申'],
  '丙':['亥','酉'], '丁':['亥','酉'],
  '壬':['卯','巳'], '癸':['卯','巳'],
  '辛':['寅','午'],
};

const WENCHANG = {
  '甲':'巳', '乙':'午', '丙':'申', '丁':'酉', '戊':'申',
  '己':'酉', '庚':'亥', '辛':'子', '壬':'寅', '癸':'卯',
};

function findBranchGroup(branch) {
  return Object.entries(BRANCH_GROUPS).find(([, branches]) => branches.includes(branch))?.[0] || '申子辰';
}

function buildSolarTerms(year) {
  return SOLAR_TERMS.map(([name, month, day]) => ({
    name,
    date: new Date(year, month - 1, day, 0, 0, 0, 0),
  }));
}

export function getHexagramPalace(hexagramId) {
  return PALACE_BY_HEXAGRAM[hexagramId] || '未定宫';
}

export function getHexagramFullName(hexagram) {
  if (!hexagram) return '';
  if (hexagram.upperTrigram === hexagram.lowerTrigram) {
    return PURE_HEXAGRAM_NAMES[hexagram.name] || `${hexagram.name}为${TRIGRAM_IMAGES[hexagram.upperTrigram] || hexagram.upperTrigram}`;
  }

  const upper = TRIGRAM_IMAGES[hexagram.upperTrigram] || hexagram.upperTrigram || '';
  const lower = TRIGRAM_IMAGES[hexagram.lowerTrigram] || hexagram.lowerTrigram || '';
  return `${upper}${lower}${hexagram.name}`;
}

export function getWorldResponding(hexagramId) {
  const palace = getHexagramPalace(hexagramId);
  const stage = PALACE_SEQUENCES[palace]?.indexOf(hexagramId) ?? -1;
  return WORLD_RESPONDING_BY_STAGE[stage] || { world: null, responding: null };
}

export function getSixGods(dayStem) {
  const start = SIX_GOD_START[dayStem] ?? 0;
  return Array.from({ length: 6 }, (_, index) => SIX_GODS[(start + index) % SIX_GODS.length]);
}

export function getAdjacentSolarTerms(date) {
  const terms = [
    ...buildSolarTerms(date.getFullYear() - 1),
    ...buildSolarTerms(date.getFullYear()),
    ...buildSolarTerms(date.getFullYear() + 1),
  ].sort((a, b) => a.date - b.date);
  const current = date.getTime();
  const previous = [...terms].reverse().find((term) => term.date.getTime() <= current);
  const next = terms.find((term) => term.date.getTime() > current);
  return { previous, next };
}

export function formatSolarTerm(term) {
  if (!term) return '未取到节气';
  return `${term.name}（${formatDateTimeCN(term.date).replace(' 00:00', '')}）`;
}

export function formatLunarDate(date) {
  try {
    return new Intl.DateTimeFormat('zh-u-ca-chinese', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return '农历日期需浏览器 Intl Chinese Calendar 支持';
  }
}

export function getCommonShenSha(pillars) {
  const dayBranch = pillars.day.branch;
  const dayStem = pillars.day.stem;
  const group = findBranchGroup(dayBranch);
  const noble = NOBLEMAN[dayStem] || [];

  return [
    { name:'天乙贵人', value:noble.join('、') },
    { name:'文昌', value:WENCHANG[dayStem] },
    { name:'驿马', value:TRAVEL_HORSE[group] },
    { name:'桃花', value:PEACH_BLOSSOM[group] },
    { name:'将星', value:GENERAL_STAR[group] },
    { name:'华盖', value:FLOWER_CANOPY[group] },
  ].filter((item) => item.value);
}

export function getPillarsForDate(date) {
  return calculateBaZiFromDate(date);
}

export function getVoidBranches(dayPillar) {
  const stemIndex = '甲乙丙丁戊己庚辛壬癸'.indexOf(dayPillar.stem);
  const branchIndex = BRANCHES.indexOf(dayPillar.branch);
  if (stemIndex < 0 || branchIndex < 0) return '';
  const cycleStartBranch = (branchIndex - stemIndex + 12) % 12;
  return `${BRANCHES[(cycleStartBranch + 10) % 12]}、${BRANCHES[(cycleStartBranch + 11) % 12]}`;
}

function getRelative(selfElement, targetElement) {
  if (selfElement === targetElement) return '兄弟';
  if (ELEMENT_GENERATES[selfElement] === targetElement) return '子孙';
  if (ELEMENT_GENERATES[targetElement] === selfElement) return '父母';
  if (ELEMENT_OVERCOMES[selfElement] === targetElement) return '妻财';
  if (ELEMENT_OVERCOMES[targetElement] === selfElement) return '官鬼';
  return '';
}

function getHexagramBranches(hexagram) {
  const lower = TRIGRAM_NAJIA_BRANCHES[hexagram.lowerTrigram] || [];
  const upper = TRIGRAM_NAJIA_BRANCHES[hexagram.upperTrigram] || [];
  return [...lower.slice(0, 3), ...upper.slice(3, 6)];
}

function getPurePalaceBranches(palace) {
  const trigram = palace.replace('宫', '');
  return TRIGRAM_NAJIA_BRANCHES[trigram] || [];
}

function formatNajiaLine(line, branch) {
  const symbol = line === 1 ? '━━━' : '━ ━';
  const element = BRANCH_ELEMENTS[branch] || '';
  return `${symbol} ${branch}${element}`;
}

export function buildNajiaRows({ baseHex, changedHex, lines, changedLines, values, sixGods }) {
  const palace = getHexagramPalace(baseHex.id);
  const palaceElement = PALACE_ELEMENTS[palace] || '土';
  const baseBranches = getHexagramBranches(baseHex);
  const changedBranches = getHexagramBranches(changedHex);
  const purePalaceBranches = getPurePalaceBranches(palace);
  const baseRelatives = baseBranches.map((branch) => getRelative(palaceElement, BRANCH_ELEMENTS[branch]));
  const presentRelatives = new Set(baseRelatives.filter(Boolean));
  const { world, responding } = getWorldResponding(baseHex.id);

  return lines.map((line, index) => {
    const baseBranch = baseBranches[index];
    const changedBranch = changedBranches[index];
    const pureBranch = purePalaceBranches[index];
    const pureRelative = getRelative(palaceElement, BRANCH_ELEMENTS[pureBranch]);
    const hiddenSpirit = pureRelative && !presentRelatives.has(pureRelative)
      ? `${pureRelative}${pureBranch}${BRANCH_ELEMENTS[pureBranch]}`
      : '';

    return {
      index,
      sixGod: sixGods[index],
      hiddenSpirit,
      relative: baseRelatives[index],
      baseBranch,
      changedBranch,
      baseLineText: formatNajiaLine(line, baseBranch),
      changedLineText: formatNajiaLine(changedLines[index], changedBranch),
      changedRelative: getRelative(palaceElement, BRANCH_ELEMENTS[changedBranch]),
      isMoving: values[index] === 6 || values[index] === 9,
      mark: index === world ? '世' : index === responding ? '应' : '',
    };
  });
}
