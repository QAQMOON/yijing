export const BRAND_NAME = '易解';

export const SITE_URL = 'https://yijing-pi.vercel.app';

export const SITE_TITLE = '易解 · 古籍依据 AI 解读';

export const SITE_DESCRIPTION = '易解是一套面向中国术数文化的在线应用，提供免费排盘、古籍依据、DeepSeek AI 解读、积分账户与报告历史。';

export const SITE_OG_IMAGE = `${SITE_URL}/og-image.png`;

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
  { to: '/ziwei', label: '紫微' },
  { to: '/daliuren', label: '大六壬' },
  { to: '/qimen', label: '奇门' },
  { to: '/classics', label: '藏经阁' },
  { to: '/reports', label: 'AI报告' },
  { to: '/tools', label: '百宝袋' },
  { to: '/history', label: '卦历' },
];

export const FOOTER_NAV = [
  { to: '/pricing', label: '积分套餐' },
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
    status: '当前阶段',
    points: ['服务端代理 DeepSeek API', '按卦盘上下文生成解读', '古籍依据层与报告历史'],
  },
  {
    stage: '阶段三',
    title: '账户与积分',
    status: '体验版',
    points: ['本地体验账号', '服务端积分表设计', '报告历史云端同步', '付费充值与退款规则'],
  },
  {
    stage: '阶段四',
    title: '三术合参',
    status: '规划中',
    points: ['八字长期结构', '紫微宫位叙事', '六爻当下问事', '综合付费报告'],
  },
];

export function getRandomBrandTagline() {
  const index = Math.floor(Math.random() * BRAND_TAGLINES.length);
  return BRAND_TAGLINES[index];
}
