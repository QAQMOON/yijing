import { Link, useNavigate } from 'react-router-dom';
import Seo from '../../components/Seo.jsx';
import styles from './BaZiHome.module.css';

export default function BaZiHome() {
  const navigate = useNavigate();
  const useCurrentTime = () => {
    navigate('/bazi/chart');
  };

  return (
    <div className={styles.page}>
      <Seo
        title="八字排盘 · 四柱十神与大运流年 · 易解"
        description="易解八字排盘支持按公历或农历输入生辰，以节气定年定月，展示四柱、十神、旺衰、纳音、神煞、大运流年与 AI 解读。"
        path="/bazi"
      />
      <h1 className={styles.title}>八 字</h1>
      <p className={styles.subtitle}>四柱推命 · 十神生克</p>
      <div className={styles.divider} />
      <p className={styles.desc}>
        八字，又称四柱推命。以出生年、月、日、时配以天干地支，共四柱八字。
        日主为我，观十神之生克制化，推大运流年之吉凶，察命理之消长，结果页可生成 AI 参考报告。
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
