export const CLASSIC_SOURCES = [
  {
    id: 'zhouyi',
    title: '《周易》',
    domain: '六爻与六十四卦',
    summary: '以卦辞、爻辞、彖传、象传作为六爻解读的第一层文本依据。',
    useFor: ['本卦取象', '动爻取义', '变卦趋势'],
  },
  {
    id: 'bushi',
    title: '《卜筮正宗》',
    domain: '六爻纳甲',
    summary: '偏重用神、世应、动变、月日旺衰，是六爻实占体系的重要参考。',
    useFor: ['用神判断', '世应关系', '动爻生克'],
  },
  {
    id: 'zengshan',
    title: '《增删卜易》',
    domain: '六爻断法',
    summary: '重视月建日辰、动静旺衰与占事分类，适合补足实务断语。',
    useFor: ['旺衰取舍', '事类判断', '应期提示'],
  },
  {
    id: 'yuanhai',
    title: '《渊海子平》',
    domain: '八字命理',
    summary: '以日主、十神、格局、岁运为核心，是八字报告的基础古籍层。',
    useFor: ['十神释义', '格局判断', '大运流年'],
  },
  {
    id: 'ziwei',
    title: '《紫微斗数全书》',
    domain: '紫微斗数',
    summary: '围绕十二宫、主星、辅曜、四化建立命盘叙事，可用于星曜依据说明。',
    useFor: ['宫位主题', '星曜组合', '四化飞布'],
  },
];

export const GLOSSARY_TERMS = [
  {
    term: '本卦',
    domain: '六爻',
    explanation: '起卦后最初得到的卦，代表事情的当前格局与问题底色。',
  },
  {
    term: '变卦',
    domain: '六爻',
    explanation: '动爻阴阳变化后形成的卦，常用来观察事情后续走向。',
  },
  {
    term: '世应',
    domain: '六爻',
    explanation: '世爻多代表求测者自身，应爻多代表对方、环境或所问之事。',
  },
  {
    term: '用神',
    domain: '六爻',
    explanation: '按占事类别选取的核心六亲，是六爻判断的主线。',
  },
  {
    term: '月建日辰',
    domain: '六爻',
    explanation: '起卦时的月令与日辰，用于衡量爻的旺衰、生克与应期。',
  },
  {
    term: '十神',
    domain: '八字',
    explanation: '以日主为中心，观察其他天干与日主的生克同异关系。',
  },
  {
    term: '大运',
    domain: '八字',
    explanation: '按出生时节气距离推排的十年运程，用于看人生阶段变化。',
  },
  {
    term: '命宫',
    domain: '紫微',
    explanation: '紫微斗数十二宫之一，通常作为命盘整体气质与主轴的入口。',
  },
  {
    term: '四化',
    domain: '紫微',
    explanation: '化禄、化权、化科、化忌，表示星曜在不同层面的变化倾向。',
  },
  {
    term: '空亡',
    domain: '通用',
    explanation: '干支旬中所空的两个地支，常用于辅助判断虚实与落空感。',
  },
];

export const TEN_GODS = [
  { name: '比肩', relation: '同我同阴阳', reading: '自我、同辈、竞争、独立' },
  { name: '劫财', relation: '同我异阴阳', reading: '行动、分夺、朋友、冲劲' },
  { name: '食神', relation: '我生同阴阳', reading: '表达、口福、才艺、从容' },
  { name: '伤官', relation: '我生异阴阳', reading: '锋芒、突破、表达、规则冲突' },
  { name: '偏财', relation: '我克同阴阳', reading: '机会、流动资源、经营意识' },
  { name: '正财', relation: '我克异阴阳', reading: '稳定收入、责任、现实经营' },
  { name: '七杀', relation: '克我同阴阳', reading: '压力、挑战、纪律、风险' },
  { name: '正官', relation: '克我异阴阳', reading: '秩序、名誉、职位、约束' },
  { name: '偏印', relation: '生我同阴阳', reading: '灵感、偏门知识、保护与孤独' },
  { name: '正印', relation: '生我异阴阳', reading: '学习、资质、贵人、稳定支持' },
];

export const ZIWEI_STARS = [
  { name: '紫微', group: '北斗主星', meaning: '尊贵、统筹、核心控制力' },
  { name: '天机', group: '南斗主星', meaning: '谋略、变化、学习与机动' },
  { name: '太阳', group: '中天星曜', meaning: '公开、照耀、责任与男性象' },
  { name: '武曲', group: '北斗主星', meaning: '财帛、执行、规则与决断' },
  { name: '天同', group: '南斗主星', meaning: '福气、缓和、享受与协调' },
  { name: '廉贞', group: '北斗主星', meaning: '原则、欲望、边界与变化' },
  { name: '天府', group: '南斗主星', meaning: '库藏、管理、稳定与承载' },
  { name: '太阴', group: '中天星曜', meaning: '积累、细腻、女性象与内在资源' },
  { name: '贪狼', group: '北斗主星', meaning: '欲望、才艺、人缘与开拓' },
  { name: '巨门', group: '北斗主星', meaning: '口舌、辨析、疑问与暗处信息' },
  { name: '天相', group: '南斗主星', meaning: '辅佐、形象、制度与服务' },
  { name: '天梁', group: '南斗主星', meaning: '庇护、原则、长辈与解厄' },
  { name: '七杀', group: '南斗主星', meaning: '突破、压力、决断与变局' },
  { name: '破军', group: '北斗主星', meaning: '破旧立新、消耗、改革与迁动' },
];

export const CLASSICS_FAQ = [
  {
    question: '易解的 AI 解读会直接引用古籍吗？',
    answer: '会优先使用排盘中已整理的卦辞、彖传、象传、爻辞等文本，并在报告里标出依据层。',
  },
  {
    question: '古籍依据是否等于确定结论？',
    answer: '不是。古籍依据用于解释推理路径，结论仍应作为文化参考和决策辅助。',
  },
  {
    question: '为什么要做三术合参？',
    answer: '八字看长期结构，紫微看宫位叙事，六爻看具体问题，合参能把长期与当下放到同一份报告里。',
  },
];
