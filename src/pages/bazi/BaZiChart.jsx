import { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { calculateBaZi } from '../../utils/baziCalc.js';
import styles from './BaZiChart.module.css';

const PILLAR_NAMES = ['年柱', '月柱', '日柱', '时柱'];

export default function BaZiChart() {
  const [params] = useSearchParams();
  const y = Number(params.get('y'));
  const m = Number(params.get('m'));
  const d = Number(params.get('d'));
  const h = Number(params.get('h'));

  const baZi = useMemo(() => {
    if (!y || !m || !d || isNaN(h)) return null;
    if (y < 1900 || y > 2100) return null;
    return calculateBaZi(y, m, d, h);
  }, [y, m, d, h]);

  if (!baZi) {
    return (
      <div className={styles.page}>
        <p className={styles.error}>请输入有效的出生日期（1900-2100年间）</p>
        <Link to="/bazi/chart" className={styles.back}>← 重新输入</Link>
      </div>
    );
  }

  const pillars = [baZi.year, baZi.month, baZi.day, baZi.hour];

  return (
    <div className={styles.page}>
      <Helmet><title>八字排盘 — {y}年{m}月{d}日 — 易理</title></Helmet>
      <Link to="/bazi/chart" className={styles.backLink}>← 重新排盘</Link>

      <div className={styles.header}>
        <p className={styles.birthDate}>出生：{y}年{m}月{d}日 {h}:00</p>
      </div>

      <div className={styles.pillars}>
        {pillars.map((p, i) => (
          <div key={i} className={styles.pillar}>
            <div className={styles.pillarName}>{PILLAR_NAMES[i]}</div>
            <div className={styles.stemBranch}>
              <span className={`${styles.char} ${styles.stem}`}>{p.stem}</span>
              <span className={`${styles.char} ${styles.branch}`}>{p.branch}</span>
            </div>
            <div className={styles.full}>{p.full}</div>
          </div>
        ))}
      </div>

      <div className={styles.infoCard}>
        <h3>日主</h3>
        <p className={styles.dayMaster}>{baZi.day.stem}（{baZi.day.full}）</p>
        <p className={styles.info}>
          日主{baZi.day.stem}为命主自身，代表本命。观四柱中其他干支与日主的生克关系，可知十神之配置，推命运之走向。
        </p>
      </div>

      <div className={styles.infoCard}>
        <h3>关于排盘精度</h3>
        <p className={styles.info}>
          当前版本(V1)使用公历直接换算干支，年柱、日柱准确，月柱为近似计算。
          完整版将支持精确的节气月划分和农历转换。此排盘仅供学习参考。
        </p>
      </div>
    </div>
  );
}
