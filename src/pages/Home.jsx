import { Helmet } from 'react-helmet-async';
import { useMemo } from 'react';
import HexagramDisplay from '../components/HexagramDisplay.jsx';
import ToolCard from '../components/ToolCard.jsx';
import SaveReading from '../components/SaveReading.jsx';
import { useReadingHistory } from '../hooks/useReadingHistory.js';
import { getDailyHexagramIndex, formatDateCN } from '../utils/dailyHexagram.js';
import { HEXAGRAMS } from '../data/hexagrams.js';
import { BRAND_NAME, getRandomBrandTagline } from '../data/siteConfig.js';
import { getHexagramFullName } from '../utils/liuyaoMeta.js';
import styles from './Home.module.css';

export default function Home() {
  const { saveReading } = useReadingHistory();

  const hexagram = useMemo(() => {
    const idx = getDailyHexagramIndex();
    return HEXAGRAMS[idx];
  }, []);
  const tagline = useMemo(() => getRandomBrandTagline(), []);

  return (
    <div className={styles.home}>
      <Helmet>
        <title>{BRAND_NAME} · {tagline}</title>
      </Helmet>

      {/* Hero — Daily Hexagram */}
      <section className={styles.hero}>
        <p className={styles.brandLine}>{BRAND_NAME} · {tagline}</p>
        <p className={styles.date}>{formatDateCN()} · 今日一卦</p>
        <h1 className={styles.hexagramName}>{getHexagramFullName(hexagram)}</h1>
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
      </section>

      {/* Divider */}
      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerText}>{tagline}</span>
        <span className={styles.dividerLine} />
      </div>

      {/* Tool Cards */}
      <section className={styles.tools}>
        <h2 className={styles.sectionTitle}>术数工具</h2>
        <div className={styles.cardGrid}>
          <ToolCard
            icon="☰"
            title="六爻"
            description="以三钱摇卦，观六爻动变。探阴阳消长，明吉凶悔吝。"
            to="/liuyao"
          />
          <ToolCard
            icon="☯"
            title="八字"
            description="四柱八字，推演命运轨迹。十神生克，解读人生密码。"
            to="/bazi"
          />
          <ToolCard
            icon="◎"
            title="大六壬"
            description="古三式之冠。天地人三盘叠合，三传四课构建事象。"
            to="/daliuren"
          />
          <ToolCard
            icon="⬡"
            title="奇门遁甲"
            description="八门九星布九宫。定方位，择时机，趋吉避凶。"
            to="/qimen"
          />
        </div>
      </section>
    </div>
  );
}
