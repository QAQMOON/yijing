import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.page}>
      <Helmet>
        <title>页面未找到 — 易理</title>
      </Helmet>
      <div className={styles.code}>404</div>
      <h1 className={styles.title}>此页无卦</h1>
      <p className={styles.text}>天地未分，万象未形。你所寻之处，尚在混沌之中。</p>
      <Link to="/" className={styles.link}>← 返回首页</Link>
    </div>
  );
}
