import { Link } from 'react-router-dom';
import styles from './ToolCard.module.css';

export default function ToolCard({ icon, title, description, to, tags = [], meta }) {
  return (
    <Link to={to} className={styles.card}>
      <div className={styles.icon}>{icon}</div>
      {meta && <span className={styles.meta}>{meta}</span>}
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.desc}>{description}</p>
      {tags.length > 0 && (
        <div className={styles.tags}>
          {tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
      )}
      <span className={styles.arrow}>→</span>
    </Link>
  );
}
