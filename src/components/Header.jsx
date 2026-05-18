import { NavLink } from 'react-router-dom';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.logo}>
          <span className={styles.logoMain}>易 理</span>
          <span className={styles.logoSub}>三式 · 合参</span>
        </NavLink>
        <nav className={styles.nav}>
          <NavLink to="/liuyao" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>六爻</NavLink>
          <NavLink to="/bazi" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>八字</NavLink>
          <NavLink to="/daliuren" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>大六壬</NavLink>
          <NavLink to="/qimen" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>奇门遁甲</NavLink>
          <NavLink to="/history" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>卦历</NavLink>
        </nav>
      </div>
    </header>
  );
}
