export const BRAND_NAME = '易解';

export const BRAND_TAGLINES = [
  '卦命合参',
  '以卦问事，以命观人',
  '六爻问事，八字观命',
];

export const THEME_STORAGE_KEY = 'yijie-theme';

export const THEMES = [
  { id: 'classic', name: '古黄' },
  { id: 'jade', name: '暖玉' },
  { id: 'apricot', name: '暮杏' },
  { id: 'pine', name: '松烟' },
  { id: 'moon', name: '月白' },
];

export function getRandomBrandTagline() {
  const index = Math.floor(Math.random() * BRAND_TAGLINES.length);
  return BRAND_TAGLINES[index];
}
