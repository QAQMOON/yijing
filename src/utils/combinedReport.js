import { HEXAGRAMS } from '../data/hexagrams.js';
import { ZHOUYI_TEXT } from '../data/zhouyiText.js';
import { calculateBaZiFromDate } from './baziCalc.js';
import { performTimeReading } from './coinCast.js';
import { formatDateTimeCN } from './dateTime.js';
import {
  buildNajiaRows,
  formatLunarDate,
  getAdjacentSolarTerms,
  getCommonShenSha,
  getHexagramFullName,
  getHexagramPalace,
  getPillarsForDate,
  getSixGods,
  getVoidBranches,
} from './liuyaoMeta.js';

function compactPillar(pillar) {
  return {
    full: pillar.full,
    stem: pillar.stem,
    branch: pillar.branch,
    tenGod: pillar.tenGod,
    fiveElementText: pillar.fiveElementText,
    hiddenText: pillar.hiddenText,
    prosperity: pillar.prosperity,
    nayin: pillar.nayin,
  };
}

function compactLuck(item) {
  return {
    full: item.full,
    tenGod: item.tenGod,
    startAgeText: item.startAgeText,
    startYear: item.startYear,
    endYear: item.endYear,
  };
}

function compactHexagram(hexagram) {
  const zhouyi = ZHOUYI_TEXT[hexagram.id] || {};

  return {
    id: hexagram.id,
    name: hexagram.name,
    fullName: getHexagramFullName(hexagram),
    upperTrigram: hexagram.upperTrigram,
    lowerTrigram: hexagram.lowerTrigram,
    judgment: hexagram.judgment,
    image: zhouyi.image || hexagram.image || '',
    tuan: zhouyi.tuan || '',
  };
}

function findHexagramByLines(lines, fallback = HEXAGRAMS[0]) {
  const lineKey = lines.join('');
  return HEXAGRAMS.find((item) => item.lines.join('') === lineKey) || fallback;
}

function buildBaZiPart({ birthDate, gender, birthplace }) {
  const baZi = calculateBaZiFromDate(birthDate, { gender });

  return {
    input: {
      calendar: 'solar',
      birthTime: baZi.solarText,
      lunarTime: baZi.lunarText,
      gender: baZi.genderText,
      birthplace: birthplace || '',
    },
    dayMaster: baZi.dayMaster,
    pillars: {
      year: compactPillar(baZi.pillars.year),
      month: compactPillar(baZi.pillars.month),
      day: compactPillar(baZi.pillars.day),
      hour: compactPillar(baZi.pillars.hour),
    },
    luck: {
      rule: baZi.luckRuleText,
      startAge: baZi.startAgeText,
      targetTerm: baZi.luckTargetTerm?.name || '',
      daYun: baZi.luckPillars.slice(0, 8).map(compactLuck),
    },
    shenSha: baZi.shenShaRows.map((row) => ({
      label: row.label,
      base: row.base,
      items: row.items,
    })),
    terms: {
      previous: baZi.previousTermText,
      next: baZi.nextTermText,
    },
  };
}

function buildLiuYaoPart({ castDate }) {
  const reading = performTimeReading(castDate);
  const lines = reading.lines;
  const values = reading.details.map((item) => item.value);
  const baseHex = findHexagramByLines(lines);
  const changedLines = lines.map((line, index) => ([6, 9].includes(values[index]) ? 1 - line : line));
  const changedHex = findHexagramByLines(changedLines, baseHex);
  const movingIndexes = values
    .map((value, index) => ([6, 9].includes(value) ? index : -1))
    .filter((index) => index >= 0);
  const pillars = getPillarsForDate(castDate);
  const solarTerms = getAdjacentSolarTerms(castDate);
  const voidBranches = getVoidBranches(pillars.day);
  const sixGods = getSixGods(pillars.day.stem);
  const najiaRows = buildNajiaRows({
    baseHex,
    changedHex,
    lines,
    changedLines,
    values,
    sixGods,
  });

  return {
    source: 'time',
    castTime: castDate.toISOString(),
    castText: formatDateTimeCN(castDate),
    lunarDate: formatLunarDate(castDate),
    baseHex: compactHexagram(baseHex),
    changedHex: compactHexagram(changedHex),
    palace: getHexagramPalace(baseHex.id),
    lines,
    values,
    movingLines: movingIndexes.map((index) => ({
      index,
      position: ['初', '二', '三', '四', '五', '上'][index],
      value: values[index],
      text: baseHex.yaoText?.[index] || '',
      yaoImage: ZHOUYI_TEXT[baseHex.id]?.yaoImage?.[index] || '',
    })),
    pillars: {
      year: pillars.year.full,
      month: pillars.month.full,
      day: pillars.day.full,
      hour: pillars.hour.full,
    },
    solarTerms: {
      previous: solarTerms.previous?.name || '',
      next: solarTerms.next?.name || '',
    },
    voidBranches,
    commonShenSha: getCommonShenSha(pillars),
    najiaRows,
  };
}

export function buildCombinedReportChart({
  birthDate,
  gender = 'male',
  birthplace = '',
  castDate = new Date(),
  question = '',
  scope = '综合',
}) {
  const cleanQuestion = String(question || '').trim();
  const cleanScope = String(scope || '').trim() || '综合';

  return {
    mode: 'bazi_liuyao',
    scope: cleanScope,
    question: cleanQuestion,
    bazi: buildBaZiPart({ birthDate, gender, birthplace }),
    liuyao: buildLiuYaoPart({ castDate }),
    extensions: {
      ziwei: 'planned',
    },
  };
}
