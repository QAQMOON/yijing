import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import styles from './ThreePans.module.css';

const EARTH_PLATE = ['巳','午','未','申','辰','','酉','卯','','戌','寅','丑','子','亥'];
const SAMPLE_HEAVEN = ['戌','亥','子','丑','酉','','寅','申','','卯','未','午','巳','辰'];
const SAMPLE_GENERALS = ['白虎','太常','玄武','太阴','天空','','天后','青龙','','贵人','勾陈','六合','朱雀','腾蛇'];

export default function ThreePans() {
  return (
    <div className={styles.page}>
      <Helmet><title>大六壬三盘 — 易理</title></Helmet>
      <Link to="/daliuren" className={styles.back}>← 大六壬</Link>

      <h1 className={styles.title}>天地人三盘</h1>
      <div className={styles.divider} />

      <div className={styles.plateContainer}>
        {/* Heaven Plate (outer) */}
        <div className={styles.heavenRing}>
          {SAMPLE_HEAVEN.map((s, i) => (
            <div key={i} className={s ? `${styles.heavenCell} ${styles.cell}` : styles.empty} style={{ gridArea: `c${i}` }}>
              {s && <span>{s}</span>}
            </div>
          ))}
        </div>

        {/* Generals Ring (middle) */}
        <div className={styles.generalRing}>
          {SAMPLE_GENERALS.map((g, i) => (
            <div key={i} className={g ? `${styles.generalCell} ${styles.cell}` : styles.empty} style={{ gridArea: `c${i}` }}>
              {g && <span>{g}</span>}
            </div>
          ))}
        </div>

        {/* Earth Plate (inner) */}
        <div className={styles.earthRing}>
          {EARTH_PLATE.map((s, i) => (
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

      <div className={styles.infoCard}>
        <h3>关于大六壬</h3>
        <p>此为示例盘面。完整版将支持基于实际月将、占时、四课三传的实时计算。大六壬以月将加时布天盘，地盘固定，人盘十二天将随天盘流转。三盘叠合，信息交错，断事如神。</p>
      </div>
    </div>
  );
}
