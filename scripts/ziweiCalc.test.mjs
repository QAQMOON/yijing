import assert from 'node:assert/strict';
import { calculateZiWei } from '../src/utils/ziweiCalc.js';

const chart = calculateZiWei({
  calendar: 'solar',
  year: 2026,
  month: 5,
  day: 28,
  hour: 3,
  minute: 5,
  gender: 'male',
});

assert.equal(chart.solarDate, '2026-5-28');
assert.equal(chart.lunarDate, '二〇二六年四月十二');
assert.equal(chart.chineseDate, '丙午 癸巳 壬寅 壬寅');
assert.equal(chart.time, '寅时');
assert.equal(chart.gender, '男');
assert.equal(chart.fiveElementsClass, '木三局');
assert.equal(chart.soul, '文曲');
assert.equal(chart.body, '火星');
assert.equal(chart.palaces.length, 12);
assert.equal(chart.palaces.every((palace) => palace.gridArea), true);

const lifePalace = chart.palaces.find((palace) => palace.name === '命宫');
assert.ok(lifePalace);
assert.equal(lifePalace.stemBranch, '辛卯');
assert.deepEqual(lifePalace.majorStars.map((star) => star.name), ['天相']);

const propertyPalace = chart.palaces.find((palace) => palace.name === '田宅');
assert.ok(propertyPalace);
assert.equal(propertyPalace.stemBranch, '甲午');
assert.deepEqual(propertyPalace.minorStars.map((star) => star.name), ['文曲', '擎羊']);

console.log('ziweiCalc unit tests passed');
