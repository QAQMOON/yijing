import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import styles from './QiMenHome.module.css';

export default function QiMenHome() {
  return (
    <div className={styles.page}>
      <Helmet><title>奇门遁甲 — 易理</title></Helmet>
      <h1 className={styles.title}>奇门遁甲</h1>
      <p className={styles.subtitle}>八门九星 · 择时定方</p>
      <div className={styles.divider} />
      <p className={styles.desc}>
        奇门遁甲，三式之一。以洛书九宫为基，排八门、布九星、转八神、推三奇六仪。
        阳遁阴遁各九局，共十八局。定方位，择时机，趋吉避凶，运筹帷幄。
      </p>
      <Link to="/qimen/display" className={styles.btn}>查看示例盘面 →</Link>
      <div className={styles.notice}>
        <p>当前为示例盘面。完整实时排盘功能正在完善中，敬请期待。</p>
      </div>
    </div>
  );
}
