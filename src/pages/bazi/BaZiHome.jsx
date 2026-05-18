import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import styles from './BaZiHome.module.css';

export default function BaZiHome() {
  return (
    <div className={styles.page}>
      <Helmet><title>八字 — 易理</title></Helmet>
      <h1 className={styles.title}>八 字</h1>
      <p className={styles.subtitle}>四柱推命 · 十神生克</p>
      <div className={styles.divider} />
      <p className={styles.desc}>
        八字，又称四柱推命。以出生年、月、日、时配以天干地支，共四柱八字。
        日主为我，观十神之生克制化，推大运流年之吉凶，察命理之消长。
      </p>
      <Link to="/bazi/chart" className={styles.btn}>排八字盘 →</Link>
      <div className={styles.notice}>
        <p>八字排盘功能正在完善中，敬请期待完整版。</p>
      </div>
    </div>
  );
}
