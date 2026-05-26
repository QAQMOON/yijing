import { Link } from 'react-router-dom';
import HexagramDisplay from './HexagramDisplay.jsx';
import { getHexagramFullName } from '../utils/liuyaoMeta.js';
import styles from './HexagramCard.module.css';

export default function HexagramCard({ hexagram }) {
  return (
    <Link to={`/liuyao/hexagram/${hexagram.id}`} className={styles.card}>
      <HexagramDisplay lines={hexagram.lines} size="small" />
      <div className={styles.info}>
        <span className={styles.id}>{hexagram.id}</span>
        <span className={styles.name}>{getHexagramFullName(hexagram)}</span>
      </div>
      <p className={styles.meaning}>{hexagram.meaning}</p>
    </Link>
  );
}
