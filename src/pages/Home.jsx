import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import HexagramDisplay from '../components/HexagramDisplay.jsx';
import Seo from '../components/Seo.jsx';
import ToolCard from '../components/ToolCard.jsx';
import SaveReading from '../components/SaveReading.jsx';
import { useReadingHistory } from '../hooks/useReadingHistory.js';
import { getDailyHexagramIndex, formatDateCN } from '../utils/dailyHexagram.js';
import { HEXAGRAMS } from '../data/hexagrams.js';
import { BRAND_NAME, getRandomBrandTagline } from '../data/siteConfig.js';
import { getHexagramFullName } from '../utils/liuyaoMeta.js';
import styles from './Home.module.css';

const FEATURE_MATRIX = [
  {
    icon: '卦',
    title: '六爻问事',
    description: '电脑时间、随机、手动摇卦，生成本卦、变卦、纳甲、六神与动爻。',
    to: '/liuyao',
    meta: '免费排盘',
    tags: ['AI 解读', '古籍依据'],
  },
  {
    icon: '命',
    title: '八字排盘',
    description: '以节气定年月，展示四柱、十神、旺衰、纳音、神煞与大运。',
    to: '/bazi',
    meta: '免费排盘',
    tags: ['十神', '大运'],
  },
  {
    icon: '星',
    title: '紫微斗数',
    description: '安命身十二宫，查看主星辅曜、四化、大限、小限与流年信息。',
    to: '/ziwei',
    meta: '免费排盘',
    tags: ['星曜说明', '宫位'],
  },
  {
    icon: '合',
    title: '三术合参',
    description: '八字看长期结构，紫微看宫位叙事，六爻看当下问题。',
    to: '/reports',
    meta: '付费价值点',
    tags: ['综合报告', 'AI 解读'],
  },
  {
    icon: '典',
    title: '藏经阁',
    description: '集中查看古籍依据、术语库、六十四卦、十神与星曜说明。',
    to: '/classics',
    meta: '资料库',
    tags: ['古籍依据', '术语库'],
  },
  {
    icon: '袋',
    title: '百宝袋',
    description: '先做时辰、节气、四柱、纳音、空亡等排盘前轻工具。',
    to: '/tools',
    meta: '小工具',
    tags: ['时辰换算', '空亡'],
  },
];

export default function Home() {
  const { saveReading } = useReadingHistory();

  const hexagram = useMemo(() => {
    const idx = getDailyHexagramIndex();
    return HEXAGRAMS[idx];
  }, []);
  const tagline = useMemo(() => getRandomBrandTagline(), []);

  return (
    <div className={styles.home}>
      <Seo
        title="易解 · 古籍依据 AI 解读"
        description="易解提供免费排盘、古籍依据、DeepSeek AI 解读、积分账户与报告历史，覆盖六爻、八字、紫微斗数和三术合参。"
        path="/"
      />

      <section className={styles.productHero}>
        <div className={styles.heroCopy}>
          <p className={styles.brandLine}>{BRAND_NAME} · {tagline}</p>
          <h1>免费排盘，AI 引经据典解读</h1>
          <p className={styles.heroLead}>
            六爻、八字、紫微先排清楚，再用 DeepSeek 生成可追溯报告。
          </p>
          <div className={styles.heroActions}>
            <Link to="/liuyao/cast">开始排盘</Link>
            <Link to="/classics">看古籍依据</Link>
          </div>
        </div>
        <div className={styles.heroPanel} aria-label="AI 解读产品能力">
          <div className={styles.panelTop}>
            <span>AI 报告结构</span>
            <strong>古籍依据层</strong>
          </div>
          <div className={styles.panelRows}>
            <span>卦辞、彖象、动爻</span>
            <span>纳甲、六亲、世应</span>
            <span>十神、星曜、节气</span>
            <span>结论、依据、建议、提醒</span>
          </div>
          <Link to="/reports" className={styles.panelLink}>进入报告历史</Link>
        </div>
      </section>

      <section className={styles.matrixSection}>
        <div className={styles.sectionHead}>
          <h2>功能矩阵</h2>
          <p>工具免费可用，AI 深度解读按积分消耗，三术合参作为后续付费报告。</p>
        </div>
        <div className={styles.cardGrid}>
          {FEATURE_MATRIX.map((item) => (
            <ToolCard key={item.title} {...item} />
          ))}
        </div>
      </section>

      <section className={styles.appPanel}>
        <div>
          <h2>登录、积分与 AI 解读</h2>
          <p>体验账号可领取积分，六爻结果页已支持 DeepSeek 解读并保存报告。</p>
        </div>
        <div className={styles.appActions}>
          <Link to="/account">登录账户</Link>
          <Link to="/pricing">查看套餐</Link>
        </div>
      </section>

      <section className={styles.triplePanel}>
        <div>
          <h2>三术合参</h2>
          <p>把长期命盘、宫位叙事和当下问事放到同一份 AI 报告里，这是后续付费核心。</p>
        </div>
        <div className={styles.tripleGrid}>
          <span>八字</span>
          <span>紫微</span>
          <span>六爻</span>
          <strong>综合报告</strong>
        </div>
      </section>

      <section className={styles.dailySection}>
        <div className={styles.dailyCard}>
          <p className={styles.date}>{formatDateCN()} · 今日一卦</p>
          <h2 className={styles.hexagramName}>{getHexagramFullName(hexagram)}</h2>
          <HexagramDisplay lines={hexagram.lines} size="large" />
          <p className={styles.judgment}>{hexagram.judgment}</p>
          {hexagram.image && (
            <p className={styles.image}>《象》曰：{hexagram.image}</p>
          )}
          <p className={styles.meaning}>{hexagram.meaning}</p>
          <SaveReading
            onSave={(data) => saveReading({ type: 'daily', hexagramId: hexagram.id, ...data })}
            hexagram={hexagram}
          />
        </div>
      </section>
    </div>
  );
}
