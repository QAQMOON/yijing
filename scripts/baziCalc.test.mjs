import assert from 'node:assert/strict';
import { calculateBaZiFromDate, calculateBaZiFromLunar } from '../src/utils/baziCalc.js';

const case1994Male = calculateBaZiFromLunar({
  year: 1994,
  month: 10,
  day: 25,
  hour: 8,
  minute: 0,
  gender: 'male',
});

assert.equal(case1994Male.solarText, '1994年11月27日 08:00');
assert.equal(case1994Male.year.full, '甲戌');
assert.equal(case1994Male.month.full, '乙亥');
assert.equal(case1994Male.day.full, '丁巳');
assert.equal(case1994Male.hour.full, '甲辰');
assert.equal(case1994Male.yearPolarity, '阳年');
assert.equal(case1994Male.direction, 'forward');
assert.equal(case1994Male.luckTargetTerm.name, '大雪');
assert.equal(case1994Male.startAge.days, 9);
assert.equal(case1994Male.startAge.years, 3);
assert.equal(case1994Male.luckPillars[0].full, '丙子');
assert.equal(case1994Male.annualLuck.length, 100);
assert.deepEqual(
  case1994Male.annualLuck.map((item) => [item.year, item.virtualAge, item.full]).slice(0, 2),
  [[1994, 1, '甲戌'], [1995, 2, '乙亥']],
);
assert.deepEqual(
  case1994Male.annualLuck.map((item) => [item.year, item.virtualAge, item.full]).slice(-2),
  [[2092, 99, '壬子'], [2093, 100, '癸丑']],
);

const case1994Female = calculateBaZiFromLunar({
  year: 1994,
  month: 10,
  day: 25,
  hour: 8,
  minute: 0,
  gender: 'female',
});

assert.equal(case1994Female.direction, 'backward');
assert.equal(case1994Female.luckPillars[0].full, '甲戌');
assert.notEqual(case1994Male.direction, case1994Female.direction);

const beforeLiChun = calculateBaZiFromDate(new Date(2024, 1, 3, 23, 0), { gender: 'male' });
assert.equal(beforeLiChun.year.full, '癸卯');
assert.equal(beforeLiChun.month.full, '乙丑');

const afterLiChun = calculateBaZiFromDate(new Date(2024, 1, 4, 17, 0), { gender: 'male' });
assert.equal(afterLiChun.year.full, '甲辰');
assert.equal(afterLiChun.month.full, '丙寅');

console.log('baziCalc unit tests passed');
