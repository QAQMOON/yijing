import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import styles from './BaZiHome.module.css';

export default function BaZiHome() {
  const navigate = useNavigate();
  const useCurrentTime = () => {
    navigate('/bazi/chart');
  };

  return (
    <div className={styles.page}>
      <Helmet><title>八字 — 易解</title></Helmet>
      <h1 className={styles.title}>八 字</h1>
      <p className={styles.subtitle}>四柱推命 · 十神生克</p>
      <div className={styles.divider} />
      <p className={styles.desc}>
        八字，又称四柱推命。以出生年、月、日、时配以天干地支，共四柱八字。
        日主为我，观十神之生克制化，推大运流年之吉凶，察命理之消长。
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.btn} onClick={useCurrentTime}>进入起排</button>
        <Link to="/bazi/chart" className={styles.btnOutline}>自定义时间排盘</Link>
      </div>
      <div className={styles.notice}>
        <p>四柱以节气定年定月，性别用于判定大运顺逆。可按公历或农历输入完整出生年月日时。</p>
      </div>
    </div>
  );
}
