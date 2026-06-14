import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.page}>
      <Seo
        title="页面未找到 · 易解"
        description="易解未找到当前页面，请返回首页继续使用六爻、八字、紫微斗数、大六壬或奇门遁甲工具。"
        path="/404"
      />
      <div className={styles.code}>404</div>
      <h1 className={styles.title}>此页无卦</h1>
      <p className={styles.text}>天地未分，万象未形。你所寻之处，尚在混沌之中。</p>
      <Link to="/" className={styles.link}>← 返回首页</Link>
    </div>
  );
}
