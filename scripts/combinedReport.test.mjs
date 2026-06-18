import assert from 'node:assert/strict';
import { buildCombinedReportChart } from '../src/utils/combinedReport.js';

const chart = buildCombinedReportChart({
  birthDate: new Date(1990, 4, 8, 12, 0),
  gender: 'male',
  birthplace: '北京',
  castDate: new Date(2026, 5, 18, 9, 30),
  question: '现在是否适合推进新项目？',
  scope: '事业工作',
});

assert.equal(chart.mode, 'bazi_liuyao');
assert.equal(chart.scope, '事业工作');
assert.equal(chart.question, '现在是否适合推进新项目？');
assert.equal(chart.extensions.ziwei, 'planned');

assert.ok(chart.bazi.pillars.year.full);
assert.ok(chart.bazi.pillars.month.full);
assert.ok(chart.bazi.pillars.day.full);
assert.ok(chart.bazi.pillars.hour.full);
assert.equal(chart.bazi.input.gender, '男');
assert.equal(chart.bazi.luck.daYun.length, 8);

assert.ok(chart.liuyao.baseHex.name);
assert.ok(chart.liuyao.changedHex.name);
assert.equal(chart.liuyao.lines.length, 6);
assert.equal(chart.liuyao.values.length, 6);
assert.equal(chart.liuyao.najiaRows.length, 6);
assert.ok(chart.liuyao.pillars.day);

console.log('combinedReport unit tests passed');
