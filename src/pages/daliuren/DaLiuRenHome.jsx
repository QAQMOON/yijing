import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import styles from './DaLiuRenHome.module.css';

export default function DaLiuRenHome() {
  return (
    <div className={styles.page}>
      <Helmet><title>大六壬 — 易理</title></Helmet>
      <h1 className={styles.title}>大 六 壬</h1>
      <p className={styles.subtitle}>古三式之冠 · 天地人三盘</p>
      <div className={styles.divider} />
      <p className={styles.desc}>
        大六壬，古传三式之首。以占时为正时，月将加时布天盘，起四课，发三传。
        天地人三盘叠合，十二天将各司其位，信息量最为丰富，细腻解析事物发展脉络。
      </p>
      <Link to="/daliuren/display" className={styles.btn}>查看示例盘面 →</Link>
      <div className={styles.notice}>
        <p>当前为示例盘面。完整实时排盘功能正在完善中，敬请期待。</p>
      </div>
    </div>
  );
}
