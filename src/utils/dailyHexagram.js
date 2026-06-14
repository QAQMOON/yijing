import { getStorageItem, setStorageItem } from './safeStorage.js';

const DAILY_HEXAGRAM_SEED_KEY = 'yijie-daily-hexagram-seed';

function hashToIndex(key) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash) + key.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 64;
}

function getDateKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function createSeed() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getVisitorSeed() {
  if (typeof window === 'undefined') return 'server';

  const savedSeed = getStorageItem(DAILY_HEXAGRAM_SEED_KEY);
  if (savedSeed) return savedSeed;

  const seed = createSeed();
  setStorageItem(DAILY_HEXAGRAM_SEED_KEY, seed);
  return seed;
}

export function getDailyHexagramIndex(date = new Date(), seed = getVisitorSeed()) {
  return hashToIndex(`${seed}-${getDateKey(date)}`);
}

export function formatDateCN(date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${y}年${m}月${d}日`;
}
