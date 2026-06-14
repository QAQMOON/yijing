import { NavLink } from 'react-router-dom';
import styles from './BottomNav.module.css';

const ITEMS = [
  { to: '/', label: '首页', icon: '⌂' },
  { to: '/liuyao/cast', label: '起卦', icon: '卦' },
  { to: '/bazi', label: '八字', icon: '命' },
  { to: '/reports', label: '报告', icon: 'AI' },
  { to: '/account', label: '我的', icon: '我' },
];

export default function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="手机底部导航">
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => isActive ? `${styles.item} ${styles.active}` : styles.item}
        >
          <span aria-hidden="true">{item.icon}</span>
          <strong>{item.label}</strong>
        </NavLink>
      ))}
    </nav>
  );
}
