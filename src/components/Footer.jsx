import { Link } from 'react-router-dom';
import { BRAND_NAME, FOOTER_NAV } from '../data/siteConfig.js';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.decor}>◆</div>
        <p className={styles.text}>
          易与天地准，故能弥纶天地之道
        </p>
        <p className={styles.copy}>
          © {new Date().getFullYear()} {BRAND_NAME} · 卦命合参
        </p>
        <nav className={styles.links} aria-label="页脚链接">
          {FOOTER_NAV.map((item) => (
            <Link key={item.to} to={item.to}>{item.label}</Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
