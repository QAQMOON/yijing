import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { BRAND_NAME, TOOL_NAV, getRandomBrandTagline } from '../data/siteConfig.js';
import { useTheme } from '../hooks/useTheme.js';
import styles from './Header.module.css';

export default function Header() {
  const tagline = useMemo(() => getRandomBrandTagline(), []);
  const { themeId, setThemeId, themes } = useTheme();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.logo}>
          <span className={styles.logoMain}>{BRAND_NAME}</span>
          <span className={styles.logoSub}>{tagline}</span>
        </NavLink>
        <div className={styles.actions}>
          <nav className={styles.nav}>
            {TOOL_NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <label className={styles.themeControl}>
            <span className={styles.themeLabel}>主题</span>
            <select
              aria-label="选择背景主题"
              className={styles.themeSelect}
              value={themeId}
              onChange={(event) => setThemeId(event.target.value)}
            >
              {themes.map((theme) => (
                <option key={theme.id} value={theme.id}>{theme.name}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </header>
  );
}
