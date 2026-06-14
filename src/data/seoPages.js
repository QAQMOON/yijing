import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from './siteConfig.js';

export const SEO_PAGES = [
  {
    path: '/',
    title: SITE_TITLE,
    description: '易解提供六爻起卦、八字排盘、紫微斗数、大六壬、奇门遁甲与每日一卦，适合作为传统术数文化的在线学习和排盘工具。',
    heading: '易解',
    summary: SITE_DESCRIPTION,
    priority: '1.0',
  },
  {
    path: '/liuyao',
    title: '六爻起卦排盘 · 纳甲与变卦 · 易解',
    description: '易解六爻工具支持电脑自动、时间起卦和手动摇卦，可填写占事范围，生成本卦、变卦、干支、六神与纳甲信息。',
    heading: '六爻起卦',
    summary: '以三钱摇卦，观六爻动变，生成本卦、变卦、干支、六神与纳甲信息。',
    priority: '0.9',
  },
  {
    path: '/liuyao/hexagrams',
    title: '六十四卦查询 · 文王卦序 · 易解',
    description: '易解六十四卦库支持按卦名、卦辞、含义、上下卦和序号检索，查看每一卦的卦辞、象传与爻辞。',
    heading: '六十四卦',
    summary: '按文王卦序查询六十四卦，查看卦辞、象传、爻辞与卦义。',
    priority: '0.8',
  },
  {
    path: '/bazi',
    title: '八字排盘 · 四柱十神与大运流年 · 易解',
    description: '易解八字排盘支持按公历或农历输入生辰，以节气定年定月，展示四柱、十神、旺衰、纳音、神煞与大运流年。',
    heading: '八字排盘',
    summary: '按公历或农历输入生辰，以节气定年月，展示四柱、十神、旺衰、神煞与大运流年。',
    priority: '0.9',
  },
  {
    path: '/ziwei',
    title: '紫微斗数排盘 · 十二宫与星曜四化 · 易解',
    description: '易解紫微斗数工具支持阳历或农历生日、男女命、天盘地盘人盘与闰月修正，生成十二宫星曜排盘。',
    heading: '紫微斗数',
    summary: '以出生年月日时安命身十二宫，查看星曜四化、大限、小限与流年信息。',
    priority: '0.9',
  },
  {
    path: '/daliuren',
    title: '大六壬排盘 · 天地人三盘 · 易解',
    description: '易解大六壬工具按时间起课，展示月将加时、天地人三盘、四课与三传，适合传统三式学习与排盘查看。',
    heading: '大六壬',
    summary: '按时间起课，展示月将加时、天地人三盘、四课与三传。',
    priority: '0.8',
  },
  {
    path: '/qimen',
    title: '奇门遁甲排盘 · 八门九星九宫 · 易解',
    description: '易解奇门遁甲工具支持按公历或四柱起局，提供转盘、飞盘、拆补无闰法与超接置闰法选项。',
    heading: '奇门遁甲',
    summary: '以九宫排八门、九星、八神、三奇六仪，支持多种起局方式。',
    priority: '0.8',
  },
  {
    path: '/history',
    title: '我的卦历 · 本地排盘记录 · 易解',
    description: '易解卦历在浏览器本地保存每日一卦和六爻起卦记录，支持备注、导入和导出备份。',
    heading: '我的卦历',
    summary: '在浏览器本地保存每日一卦和六爻起卦记录，支持备注、导入与导出。',
    priority: '0.5',
  },
  {
    path: '/privacy',
    title: '隐私政策 · 易解',
    description: '易解隐私政策说明当前工具站、本地卦历、六爻外部解卦接口，以及未来 DeepSeek AI 解读、登录与积分服务的数据处理原则。',
    heading: '隐私政策',
    summary: '说明当前工具站、本地卦历、外部接口与未来账户功能的数据处理原则。',
    priority: '0.4',
  },
  {
    path: '/terms',
    title: '服务条款 · 易解',
    description: '易解服务条款说明工具站使用边界、内容性质、用户责任、未来 AI 解读与积分付费功能的基本原则。',
    heading: '服务条款',
    summary: '说明工具站使用边界、内容性质、用户责任与未来付费功能原则。',
    priority: '0.4',
  },
  {
    path: '/roadmap',
    title: '产品路线 · 工具站到 DeepSeek AI 解读 · 易解',
    description: '易解产品路线：先完成稳定工具站，再接入 DeepSeek AI 解读，最后升级为登录、报告历史、积分付费的完整应用。',
    heading: '产品路线',
    summary: '先完成稳定工具站，再接入 DeepSeek AI 解读，最后升级到账户与积分。',
    priority: '0.4',
  },
];

export function canonicalFor(path) {
  return `${SITE_URL}${path === '/' ? '' : path}`;
}
