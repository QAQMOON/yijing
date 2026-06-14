import Seo from '../../components/Seo.jsx';
import { Link, useSearchParams } from 'react-router-dom';
import { calculateDaLiuRen } from '../../utils/daliurenCalc.js';
import { dateFromSearchParams, formatDateTimeCN } from '../../utils/dateTime.js';
import styles from './ThreePans.module.css';

export default function ThreePans() {
  const [params] = useSearchParams();
  const date = dateFromSearchParams(params);
  const chart = calculateDaLiuRen(date);

  return (
    <div className={styles.page}>
      <Seo
        title="大六壬三盘结果 · 易解"
        description="查看易解大六壬排盘结果，包括月将、占时、天地人三盘、十二天将、四课与三传展示。"
        path="/daliuren/display"
      />
      <Link to="/daliuren" className={styles.back}>← 大六壬</Link>

      <h1 className={styles.title}>天地人三盘</h1>
      <p className={styles.subtitle}>{formatDateTimeCN(date)} · 月将{chart.monthGeneral}加{chart.hourBranch}时</p>
      <div className={styles.divider} />

      <div className={styles.metaGrid}>
        <div><span>日柱</span><strong>{chart.dayPillar.full}</strong></div>
        <div><span>占时</span><strong>{chart.hourBranch}</strong></div>
        <div><span>月将</span><strong>{chart.monthGeneral}</strong></div>
        <div><span>三传</span><strong>{chart.transmissions.join(' → ')}</strong></div>
      </div>

      <div className={styles.plateContainer}>
        {/* Heaven Plate (outer) */}
        <div className={styles.heavenRing}>
          {chart.heavenPlate.map((s, i) => (
            <div key={i} className={s ? `${styles.heavenCell} ${styles.cell}` : styles.empty} style={{ gridArea: `c${i}` }}>
              {s && <span>{s}</span>}
            </div>
          ))}
        </div>

        {/* Generals Ring (middle) */}
        <div className={styles.generalRing}>
          {chart.generals.map((g, i) => (
            <div key={i} className={g ? `${styles.generalCell} ${styles.cell}` : styles.empty} style={{ gridArea: `c${i}` }}>
              {g && <span>{g}</span>}
            </div>
          ))}
        </div>

        {/* Earth Plate (inner) */}
        <div className={styles.earthRing}>
          {chart.earthPlate.map((s, i) => (
            <div key={i} className={s ? `${styles.earthCell} ${styles.cell}` : styles.empty} style={{ gridArea: `c${i}` }}>
              {s && <span>{s}</span>}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}><span className={styles.dotH} /> 天盘（月将）</div>
        <div className={styles.legendItem}><span className={styles.dotG} /> 人盘（天将）</div>
        <div className={styles.legendItem}><span className={styles.dotE} /> 地盘（地支）</div>
      </div>

      <div className={styles.lessonGrid}>
        {chart.lessons.map((lesson) => (
          <div key={lesson.name} className={styles.lessonCard}>
            <span>{lesson.name}</span>
            <strong>{lesson.upper}</strong>
            <small>{lesson.lower}</small>
          </div>
        ))}
      </div>

      <div className={styles.infoCard}>
        <h3>关于大六壬</h3>
        <p>此为学习版大六壬盘。当前按公历月份取月将，以占时布天盘，并生成四课三传的展示结构。若要进入严密断课，还需要继续补入节气月将、贵人昼夜、课传法则与神煞体系。</p>
      </div>
    </div>
  );
}
