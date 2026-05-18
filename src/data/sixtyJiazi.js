// 60 Jiazi cycle: Heavenly Stem + Earthly Branch combinations
const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

export const SIXTY_JIAZI = Array.from({ length: 60 }, (_, i) => ({
  index: i,
  name: STEMS[i % 10] + BRANCHES[i % 12],
  stem: STEMS[i % 10],
  branch: BRANCHES[i % 12],
}));

export function getJiaziByIndex(index) {
  return SIXTY_JIAZI[((index % 60) + 60) % 60];
}

export function getJiaziByName(name) {
  return SIXTY_JIAZI.find(j => j.name === name);
}
