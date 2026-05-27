import { astro } from 'iztro';

const PALACE_COORDS = {
  3: { row: 1, col: 1 },
  4: { row: 1, col: 2 },
  5: { row: 1, col: 3 },
  6: { row: 1, col: 4 },
  2: { row: 2, col: 1 },
  7: { row: 2, col: 4 },
  1: { row: 3, col: 1 },
  8: { row: 3, col: 4 },
  0: { row: 4, col: 1 },
  11: { row: 4, col: 2 },
  10: { row: 4, col: 3 },
  9: { row: 4, col: 4 },
};
const MAJOR_STAR_NAMES = new Set([
  '紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府', '太阴',
  '贪狼', '巨门', '天相', '天梁', '七杀', '破军',
]);
const LUCK_LABELS = {
  heaven: '天盘',
  earth: '地盘',
  human: '人盘',
};

function pad(value) {
  return String(value).padStart(2, '0');
}

function toDateString({ year, month, day }) {
  return `${year}-${month}-${day}`;
}

function toDisplayDate({ year, month, day }) {
  return `${year}年${month}月${day}日`;
}

function hourToTimeIndex(hour) {
  const numericHour = Number(hour);
  if (numericHour === 23) return 12;
  return Math.floor((numericHour + 1) / 2);
}

function normalizeGender(gender) {
  return gender === 'female' || gender === '女' ? '女' : '男';
}

function starText(star) {
  const parts = [star.name];
  if (star.brightness) parts.push(star.brightness);
  if (star.mutagen) parts.push(star.mutagen);
  return parts.join('');
}

function mapStar(star) {
  return {
    name: star.name,
    text: starText(star),
    type: star.type,
    scope: star.scope,
    brightness: star.brightness || '',
    mutagen: star.mutagen || '',
    isMajor: MAJOR_STAR_NAMES.has(star.name),
  };
}

function mapPalace(palace, horoscope) {
  const yearlyStars = horoscope?.yearly?.stars?.[palace.index] || [];
  const decadalStars = horoscope?.decadal?.stars?.[palace.index] || [];
  return {
    index: palace.index,
    name: palace.name,
    stemBranch: `${palace.heavenlyStem}${palace.earthlyBranch}`,
    heavenlyStem: palace.heavenlyStem,
    earthlyBranch: palace.earthlyBranch,
    isBodyPalace: palace.isBodyPalace,
    isOriginalPalace: palace.isOriginalPalace,
    majorStars: palace.majorStars.map(mapStar),
    minorStars: palace.minorStars.map(mapStar),
    adjectiveStars: palace.adjectiveStars.map(mapStar),
    dynamicStars: [...decadalStars, ...yearlyStars].map(mapStar),
    changsheng12: palace.changsheng12,
    boshi12: palace.boshi12,
    jiangqian12: palace.jiangqian12,
    suiqian12: palace.suiqian12,
    decadal: palace.decadal,
    ages: palace.ages,
    gridArea: PALACE_COORDS[palace.index],
  };
}

function buildAstrolabe(options) {
  const dateStr = toDateString(options);
  const timeIndex = hourToTimeIndex(options.hour);
  const common = {
    type: options.calendar || 'solar',
    dateStr,
    timeIndex,
    gender: normalizeGender(options.gender),
    isLeapMonth: Boolean(options.isLeapMonth),
    fixLeap: options.fixLeap !== false,
    language: 'zh-CN',
    astroType: options.astroType || 'heaven',
  };

  return astro.withOptions(common);
}

export function calculateZiWei(options = {}) {
  const now = new Date();
  const normalized = {
    calendar: options.calendar || 'solar',
    year: Number(options.year || now.getFullYear()),
    month: Number(options.month || now.getMonth() + 1),
    day: Number(options.day || now.getDate()),
    hour: Number(options.hour ?? now.getHours()),
    minute: Number(options.minute ?? now.getMinutes()),
    gender: options.gender || 'male',
    isLeapMonth: options.isLeapMonth === true || options.isLeapMonth === 'true',
    fixLeap: options.fixLeap !== false && options.fixLeap !== 'false',
    astroType: options.astroType || 'heaven',
  };
  const astrolabe = buildAstrolabe(normalized);
  const horoscope = astrolabe.horoscope(astrolabe.solarDate, hourToTimeIndex(normalized.hour));
  const palaces = astrolabe.palaces.map((palace) => mapPalace(palace, horoscope));

  return {
    input: normalized,
    calendarText: normalized.calendar === 'lunar' ? '农历' : '公历',
    dateText: `${toDisplayDate(normalized)} ${pad(normalized.hour)}:${pad(normalized.minute)}`,
    plateTypeText: LUCK_LABELS[normalized.astroType] || '天盘',
    gender: astrolabe.gender,
    solarDate: astrolabe.solarDate,
    lunarDate: astrolabe.lunarDate,
    chineseDate: astrolabe.chineseDate,
    rawDates: astrolabe.rawDates,
    time: astrolabe.time,
    timeRange: astrolabe.timeRange,
    sign: astrolabe.sign,
    zodiac: astrolabe.zodiac,
    soul: astrolabe.soul,
    body: astrolabe.body,
    fiveElementsClass: astrolabe.fiveElementsClass,
    earthlyBranchOfSoulPalace: astrolabe.earthlyBranchOfSoulPalace,
    earthlyBranchOfBodyPalace: astrolabe.earthlyBranchOfBodyPalace,
    palaces,
    horoscope: {
      decadal: horoscope.decadal,
      age: horoscope.age,
      yearly: horoscope.yearly,
      monthly: horoscope.monthly,
      daily: horoscope.daily,
      hourly: horoscope.hourly,
    },
  };
}

export function paramsToZiWeiOptions(params) {
  const now = new Date();
  return {
    calendar: params.get('calendar') || 'solar',
    year: Number(params.get('year') || now.getFullYear()),
    month: Number(params.get('month') || now.getMonth() + 1),
    day: Number(params.get('day') || now.getDate()),
    hour: Number(params.get('hour') ?? now.getHours()),
    minute: Number(params.get('minute') ?? now.getMinutes()),
    gender: params.get('gender') || 'male',
    isLeapMonth: params.get('isLeapMonth') === 'true',
    fixLeap: params.get('fixLeap') !== 'false',
    astroType: params.get('astroType') || 'heaven',
  };
}
