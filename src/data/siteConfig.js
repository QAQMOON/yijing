export const BRAND_NAME = '易解';

export const SITE_URL = 'https://yijing-pi.vercel.app';

export const SITE_TITLE = '易解 · 卦命合参';

export const SITE_DESCRIPTION = '易解是一套面向中国术数文化的在线工具站，提供六爻起卦、八字排盘、紫微斗数、大六壬、奇门遁甲与卦历记录。';

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

export const TOOL_NAV = [
  { to: '/liuyao', label: '六爻' },
  { to: '/bazi', label: '八字' },
  { to: '/ziwei', label: '紫微斗数' },
  { to: '/daliuren', label: '大六壬' },
  { to: '/qimen', label: '奇门遁甲' },
  { to: '/history', label: '卦历' },
];

export const FOOTER_NAV = [
  { to: '/privacy', label: '隐私政策' },
  { to: '/terms', label: '服务条款' },
  { to: '/roadmap', label: '产品路线' },
];

export const APP_ROADMAP = [
  {
    stage: '阶段一',
    title: '工具站',
    status: '当前阶段',
    points: ['稳定排盘工具', '独立 SEO 元信息', '本地卦历记录', 'Vercel 静态部署'],
  },
  {
    stage: '阶段二',
    title: 'DeepSeek AI 解读',
    status: '规划中',
    points: ['服务端代理 DeepSeek API', '按卦盘上下文生成解读', '严谨版与通俗版两种输出'],
  },
  {
    stage: '阶段三',
    title: '账户与积分',
    status: '规划中',
    points: ['登录与用户档案', '积分消耗记录', '报告历史云端同步', '付费充值与退款规则'],
  },
];

export function getRandomBrandTagline() {
  const index = Math.floor(Math.random() * BRAND_TAGLINES.length);
  return BRAND_TAGLINES[index];
}
