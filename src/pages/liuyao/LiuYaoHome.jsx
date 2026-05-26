import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import styles from './LiuYaoHome.module.css';

export default function LiuYaoHome() {
  return (
    <div className={styles.page}>
      <Helmet><title>六爻 — 易解</title></Helmet>
      <h1 className={styles.title}>六 爻</h1>
      <p className={styles.subtitle}>以三钱摇卦，观六爻动变</p>
      <div className={styles.divider} />
      <p className={styles.desc}>
        六爻者，八卦相重而为六十四卦，每卦六爻，共三百八十四爻。
        以三枚铜钱抛掷六次，观阴阳老少之变，爻动而生变卦。
        爻辞明吉凶，象传示天道，断卦知来事。
      </p>
      <div className={styles.actions}>
        <Link to="/liuyao/cast?mode=time" className={styles.btnPrimary}>电脑时间起卦</Link>
        <Link to="/liuyao/cast?mode=random" className={styles.btnOutline}>随机起卦(赛锦囊)</Link>
        <Link to="/liuyao/cast?mode=manual" className={styles.btnOutline}>手动摇卦</Link>
        <Link to="/liuyao/hexagrams" className={styles.btnOutline}>浏览六十四卦</Link>
      </div>
      <div className={styles.info}>
        <h3>起卦方法</h3>
        <p>三枚铜钱，同时抛出。正面为阳（3），反面为阴（2）。三点之和：6为老阴（变爻），7为少阳，8为少阴，9为老阳（变爻）。从下往上，六次得六爻，即成一卦。</p>
      </div>
    </div>
  );
}
