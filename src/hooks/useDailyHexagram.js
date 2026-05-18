import { useMemo } from 'react';
import { getDailyHexagramIndex } from '../utils/dailyHexagram.js';
import { HEXAGRAMS } from '../data/hexagrams.js';

export function useDailyHexagram() {
  return useMemo(() => {
    const idx = getDailyHexagramIndex();
    return HEXAGRAMS[idx];
  }, []);
}
