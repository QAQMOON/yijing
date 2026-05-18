import { Link } from 'react-router-dom';
import styles from './ToolCard.module.css';

export default function ToolCard({ icon, title, description, to }) {
  return (
    <Link to={to} className={styles.card}>
      <div className={styles.icon}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.desc}>{description}</p>
      <span className={styles.arrow}>→</span>
    </Link>
  );
}
