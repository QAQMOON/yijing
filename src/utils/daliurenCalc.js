import { BRANCHES, getHourBranchIndex, getDayPillar } from './baziCalc.js';

const EARTH_PLATE = ['巳','午','未','申','辰','','酉','卯','','戌','寅','丑','子','亥'];
const RING_BRANCHES = ['巳','午','未','申','酉','戌','亥','子','丑','寅','卯','辰'];
const GENERALS = ['贵人','腾蛇','朱雀','六合','勾陈','青龙','天空','白虎','太常','玄武','太阴','天后'];

const MONTH_GENERAL = ['丑','子','亥','戌','酉','申','未','午','巳','辰','卯','寅'];

function rotate(list, offset) {
  return list.map((_, index) => list[(index + offset) % list.length]);
}

function mapBranchesToRing(branches) {
  return EARTH_PLATE.map((branch) => {
    if (!branch) return '';
    const index = RING_BRANCHES.indexOf(branch);
    return branches[index] || '';
  });
}

export function calculateDaLiuRen(date = new Date()) {
  const month = date.getMonth();
  const hourIndex = getHourBranchIndex(date.getHours());
  const dayPillar = getDayPillar(date);
  const monthGeneral = MONTH_GENERAL[month];
  const monthGeneralIndex = RING_BRANCHES.indexOf(monthGeneral);
  const heavenOffset = (monthGeneralIndex - hourIndex + RING_BRANCHES.length) % RING_BRANCHES.length;
  const heavenBranches = rotate(RING_BRANCHES, heavenOffset);
  const generalOffset = (hourIndex + dayPillar.stem.charCodeAt(0)) % GENERALS.length;
  const generalBranches = rotate(GENERALS, generalOffset);

  const transmissions = [
    heavenBranches[(hourIndex + 2) % 12],
    heavenBranches[(hourIndex + 6) % 12],
    heavenBranches[(hourIndex + 10) % 12],
  ];

  const lessons = [
    { name:'一课', upper: dayPillar.stem, lower: dayPillar.branch },
    { name:'二课', upper: heavenBranches[hourIndex], lower: BRANCHES[hourIndex] },
    { name:'三课', upper: transmissions[0], lower: transmissions[1] },
    { name:'四课', upper: transmissions[1], lower: transmissions[2] },
  ];

  return {
    date,
    dayPillar,
    hourBranch: BRANCHES[hourIndex],
    monthGeneral,
    earthPlate: EARTH_PLATE,
    heavenPlate: mapBranchesToRing(heavenBranches),
    generals: mapBranchesToRing(generalBranches),
    transmissions,
    lessons,
  };
}
