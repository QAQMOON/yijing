import styles from './HexagramDisplay.module.css';

export default function HexagramDisplay({ lines, size = 'normal' }) {
  return (
    <div className={`${styles.hexagram} ${styles[size]}`}>
      {lines.map((line, i) => (
        <div
          key={i}
          className={`${styles.line} ${line === 1 ? styles.yang : styles.yin}`}
        />
      ))}
    </div>
  );
}
