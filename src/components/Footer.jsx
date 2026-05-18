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
          © {new Date().getFullYear()} 易理 · 三式合参
        </p>
      </div>
    </footer>
  );
}
