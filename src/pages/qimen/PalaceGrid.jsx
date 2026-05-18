import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import styles from './PalaceGrid.module.css';

const SAMPLE_PALACES = [
  { name:'巽', pos:4, door:'杜门', star:'天辅', god:'九地', stem:'癸' },
  { name:'离', pos:9, door:'景门', star:'天英', god:'九天', stem:'丁' },
  { name:'坤', pos:2, door:'死门', star:'天芮', god:'太阴', stem:'己' },
  { name:'震', pos:3, door:'伤门', star:'天冲', god:'六合', stem:'庚' },
  { name:'中', pos:5, door:'—', star:'天禽', god:'—', stem:'戊' },
  { name:'兑', pos:7, door:'惊门', star:'天柱', god:'朱雀', stem:'辛' },
  { name:'艮', pos:8, door:'生门', star:'天任', god:'勾陈', stem:'丙' },
  { name:'坎', pos:1, door:'休门', star:'天蓬', god:'腾蛇', stem:'乙' },
  { name:'乾', pos:6, door:'开门', star:'天心', god:'值符', stem:'壬' },
];

const GRID_ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export default function PalaceGrid() {
  return (
    <div className={styles.page}>
      <Helmet><title>奇门九宫 — 易理</title></Helmet>
      <Link to="/qimen" className={styles.back}>← 奇门遁甲</Link>

      <h1 className={styles.title}>奇门九宫格</h1>
      <p className={styles.subtitle}>阳遁三局 · 示例</p>
      <div className={styles.divider} />

      <div className={styles.grid}>
        {GRID_ORDER.map(i => (
          <div key={i} className={`${styles.palace} ${SAMPLE_PALACES[i].pos === 5 ? styles.center : ''}`}>
            <div className={styles.palaceHeader}>
              <span className={styles.palaceName}>{SAMPLE_PALACES[i].name}</span>
              <span className={styles.palaceNum}>{SAMPLE_PALACES[i].pos}</span>
            </div>
            <div className={styles.palaceBody}>
              <div className={styles.detailRow}><span className={styles.label}>门</span><span className={styles.val}>{SAMPLE_PALACES[i].door}</span></div>
              <div className={styles.detailRow}><span className={styles.label}>星</span><span className={styles.val}>{SAMPLE_PALACES[i].star}</span></div>
              <div className={styles.detailRow}><span className={styles.label}>神</span><span className={styles.val}>{SAMPLE_PALACES[i].god}</span></div>
              <div className={styles.detailRow}><span className={styles.label}>仪</span><span className={`${styles.val} ${styles.stem}`}>{SAMPLE_PALACES[i].stem}</span></div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.infoCard}>
        <h3>关于奇门遁甲</h3>
        <p>此为示例盘面（阳遁三局）。奇门以洛书九宫为基，分阳遁九局、阴遁九局，共十八局。每局中八门、九星、八神、三奇六仪各安其位。完整版将支持实时排盘。</p>
      </div>
    </div>
  );
}
