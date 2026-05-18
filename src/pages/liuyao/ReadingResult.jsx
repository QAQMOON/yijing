import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import HexagramDisplay from '../../components/HexagramDisplay.jsx';
import SaveReading from '../../components/SaveReading.jsx';
import { useReadingHistory } from '../../hooks/useReadingHistory.js';
import { HEXAGRAMS } from '../../data/hexagrams.js';
import styles from './ReadingResult.module.css';

export default function ReadingResult() {
  const { id } = useParams();
  const { saveReading } = useReadingHistory();
  const hex = HEXAGRAMS.find(h => h.id === Number(id));

  if (!hex) {
    return (
      <div className={styles.page}>
        <p className={styles.notFound}>未找到卦象，请先起卦</p>
        <Link to="/liuyao/cast" className={styles.link}>← 去摇卦</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Helmet><title>起卦结果 — {hex.name} — 易理</title></Helmet>
      <p className={styles.breadcrumb}>← <Link to="/liuyao/cast">重新摇卦</Link></p>
      <div className={styles.result}>
        <div className={styles.symbol}>{hex.unicode}</div>
        <h1 className={styles.name}>{hex.name}</h1>
        <p className={styles.id}>第{hex.id}卦</p>
        <HexagramDisplay lines={hex.lines} size="large" />
        <div className={styles.verdict}>
          <p className={styles.judgment}>{hex.judgment}</p>
          <p className={styles.meaning}>— {hex.meaning}</p>
        </div>
        {hex.image && (
          <p className={styles.image}>《象》曰：{hex.image}</p>
        )}
      </div>
      <div className={styles.actions}>
        <Link to={`/liuyao/hexagram/${hex.id}`} className={styles.detailLink}>查看完整解读 →</Link>
        <Link to="/liuyao/cast" className={styles.retryLink}>重新摇卦</Link>
      </div>
      <SaveReading
        onSave={(data) => saveReading({ type: 'coin', hexagramId: hex.id, ...data })}
        hexagram={hex}
      />
    </div>
  );
}
