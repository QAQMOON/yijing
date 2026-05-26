import { HEXAGRAMS } from '../data/hexagrams.js';

const LINE_LABELS = { 6:'老阴', 7:'少阳', 8:'少阴', 9:'老阳' };

function buildLine(coins) {
  const sum = coins[0] + coins[1] + coins[2];
  const yinYang = sum % 2 === 0 ? 0 : 1;
  const isChanging = sum === 6 || sum === 9;
  return { value: sum, yinYang, isChanging, label: LINE_LABELS[sum], coins };
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6D2B79F5) >>> 0;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromDate(date) {
  return (
    date.getFullYear() * 100000000 +
    (date.getMonth() + 1) * 1000000 +
    date.getDate() * 10000 +
    date.getHours() * 100 +
    date.getMinutes()
  );
}

export function tossThreeCoins() {
  return buildLine([
    Math.random() < 0.5 ? 3 : 2,
    Math.random() < 0.5 ? 3 : 2,
    Math.random() < 0.5 ? 3 : 2,
  ]);
}

export function performReading() {
  const lines = [];
  const details = [];
  for (let i = 0; i < 6; i++) {
    const result = tossThreeCoins();
    lines.push(result.yinYang);
    details.push(result);
  }
  return { lines, details };
}

export function performTimeReading(date = new Date()) {
  const random = seededRandom(seedFromDate(date));
  const lines = [];
  const details = [];

  for (let i = 0; i < 6; i += 1) {
    const coins = [
      random() < 0.5 ? 3 : 2,
      random() < 0.5 ? 3 : 2,
      random() < 0.5 ? 3 : 2,
    ];
    const result = buildLine(coins);
    lines.push(result.yinYang);
    details.push(result);
  }

  return { lines, details, date };
}

export function linesToHexagramId(lines) {
  const lineStr = lines.join('');
  const hexagram = HEXAGRAMS.find((item) => item.lines.join('') === lineStr);
  return hexagram?.id || 1;
}
