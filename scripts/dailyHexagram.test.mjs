import assert from 'node:assert/strict';
import { getDailyHexagramIndex } from '../src/utils/dailyHexagram.js';

const date = new Date(2026, 4, 26);
const nextDate = new Date(2026, 4, 27);

const userASeed = 'visitor-a';
const userBSeed = 'visitor-b';

assert.equal(
  getDailyHexagramIndex(date, userASeed),
  getDailyHexagramIndex(date, userASeed),
);

assert.notEqual(
  getDailyHexagramIndex(date, userASeed),
  getDailyHexagramIndex(date, userBSeed),
);

assert.notEqual(
  getDailyHexagramIndex(date, userASeed),
  getDailyHexagramIndex(nextDate, userASeed),
);

console.log('dailyHexagram unit tests passed');
