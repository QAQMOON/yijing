import assert from 'node:assert/strict';
import { calculateQiMen } from '../src/utils/qimenCalc.js';

const sample = calculateQiMen(new Date(2026, 4, 28, 2, 5), {
  method: '转盘奇门',
  juMethod: '超接置闰法',
});

assert.equal(sample.method, '转盘奇门');
assert.equal(sample.juMethod, '超接置闰法');
assert.equal(sample.termName, '小满');
assert.equal(sample.yuan, '中元');
assert.equal(sample.direction, '阳遁');
assert.equal(sample.ju, 1);
assert.equal(sample.pillars.year.full, '丙午');
assert.equal(sample.pillars.month.full, '癸巳');
assert.equal(sample.pillars.day.full, '壬寅');
assert.equal(sample.pillars.hour.full, '辛丑');
assert.equal(sample.xun.head, '甲午');
assert.equal(sample.xun.chiefStem, '辛');
assert.equal(sample.xun.voidBranches, '辰、巳');

const lowerYuan = calculateQiMen(new Date(2026, 4, 30, 2, 5));
assert.equal(lowerYuan.pillars.day.full, '甲辰');
assert.equal(lowerYuan.yuan, '下元');
assert.equal(lowerYuan.ju, 8);

console.log('qimenCalc unit tests passed');
