import { BRANCHES, getHourBranchIndex, getDayPillar } from './baziCalc.js';

const PALACE_BASE = [
  { name:'巽', pos:4, direction:'东南' },
  { name:'离', pos:9, direction:'正南' },
  { name:'坤', pos:2, direction:'西南' },
  { name:'震', pos:3, direction:'正东' },
  { name:'中', pos:5, direction:'中宫' },
  { name:'兑', pos:7, direction:'正西' },
  { name:'艮', pos:8, direction:'东北' },
  { name:'坎', pos:1, direction:'正北' },
  { name:'乾', pos:6, direction:'西北' },
];

const DOORS = ['休门','生门','伤门','杜门','景门','死门','惊门','开门'];
const STARS = ['天蓬','天任','天冲','天辅','天英','天芮','天柱','天心','天禽'];
const GODS = ['值符','腾蛇','太阴','六合','白虎','玄武','九地','九天'];
const STEMS_FOR_QIMEN = ['戊','己','庚','辛','壬','癸','丁','丙','乙'];

function rotate(list, offset) {
  return list.map((_, index) => list[(index + offset) % list.length]);
}

export function calculateQiMen(date = new Date()) {
  const month = date.getMonth() + 1;
  const hourBranchIndex = getHourBranchIndex(date.getHours());
  const dayPillar = getDayPillar(date);
  const hourBranch = BRANCHES[hourBranchIndex];
  const isYang = month >= 1 && month <= 6;
  const ju = ((month + date.getDate() + hourBranchIndex) % 9) + 1;
  const offset = (ju + hourBranchIndex + dayPillar.stem.charCodeAt(0)) % 9;
  const direction = isYang ? '阳遁' : '阴遁';
  const palaceFlow = isYang ? PALACE_BASE : [...PALACE_BASE].reverse();

  const doors = rotate(DOORS, offset % DOORS.length);
  const stars = rotate(STARS, offset);
  const gods = rotate(GODS, (offset + dayPillar.branch.charCodeAt(0)) % GODS.length);
  const stems = rotate(STEMS_FOR_QIMEN, offset);

  const palaces = palaceFlow.map((palace, index) => ({
    ...palace,
    door: palace.pos === 5 ? '寄宫' : doors[index % DOORS.length],
    star: stars[index],
    god: palace.pos === 5 ? '—' : gods[index % GODS.length],
    stem: stems[index],
  }));

  return {
    date,
    direction,
    ju,
    dutyStar: stars[0],
    dutyDoor: doors[0],
    hourBranch,
    dayPillar,
    palaces,
  };
}
