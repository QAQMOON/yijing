import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { calculateQiMen } from '../../utils/qimenCalc.js';
import { dateFromSearchParams, formatDateTimeCN } from '../../utils/dateTime.js';
import styles from './PalaceGrid.module.css';

const GRID_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export default function PalaceGrid() {
  const [params] = useSearchParams();
  const date = dateFromSearchParams(params);
  const chart = calculateQiMen(date);

  return (
    <div className={styles.page}>
      <Helmet><title>奇门九宫 — 易解</title></Helmet>
      <Link to="/qimen" className={styles.back}>← 奇门遁甲</Link>

      <h1 className={styles.title}>奇门九宫格</h1>
      <p className={styles.subtitle}>{formatDateTimeCN(date)} · {chart.direction}{chart.ju}局</p>
      <div className={styles.divider} />

      <div className={styles.metaGrid}>
        <div><span>值符</span><strong>{chart.dutyStar}</strong></div>
        <div><span>值使</span><strong>{chart.dutyDoor}</strong></div>
        <div><span>日柱</span><strong>{chart.dayPillar.full}</strong></div>
        <div><span>时支</span><strong>{chart.hourBranch}</strong></div>
      </div>

      <div className={styles.grid}>
        {GRID_ORDER.map(i => (
          <div key={i} className={`${styles.palace} ${chart.palaces[i].pos === 5 ? styles.center : ''}`}>
            <div className={styles.palaceHeader}>
              <span className={styles.palaceName}>{chart.palaces[i].name}</span>
              <span className={styles.palaceNum}>{chart.palaces[i].pos} · {chart.palaces[i].direction}</span>
            </div>
            <div className={styles.palaceBody}>
              <div className={styles.detailRow}><span className={styles.label}>门</span><span className={styles.val}>{chart.palaces[i].door}</span></div>
              <div className={styles.detailRow}><span className={styles.label}>星</span><span className={styles.val}>{chart.palaces[i].star}</span></div>
              <div className={styles.detailRow}><span className={styles.label}>神</span><span className={styles.val}>{chart.palaces[i].god}</span></div>
              <div className={styles.detailRow}><span className={styles.label}>仪</span><span className={`${styles.val} ${styles.stem}`}>{chart.palaces[i].stem}</span></div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.infoCard}>
        <h3>关于奇门遁甲</h3>
        <p>此为学习版时家奇门盘。当前按公历时间近似取阴阳遁与局数，再排八门、九星、八神与三奇六仪，适合前端排盘展示和学习参考。后续可继续接入节气、拆补置闰等精排算法。</p>
      </div>
    </div>
  );
}
