import { useParams, Link } from 'react-router-dom';
import Seo from '../../components/Seo.jsx';
import HexagramDisplay from '../../components/HexagramDisplay.jsx';
import { HEXAGRAMS } from '../../data/hexagrams.js';
import { getHexagramFullName } from '../../utils/liuyaoMeta.js';
import styles from './HexagramDetail.module.css';

export default function HexagramDetail() {
  const { id } = useParams();
  const hex = HEXAGRAMS.find(h => h.id === Number(id));

  if (!hex) {
    return (
      <div className={styles.page}>
        <p className={styles.notFound}>未找到该卦</p>
        <Link to="/liuyao/hexagrams" className={styles.back}>← 返回六十四卦</Link>
      </div>
    );
  }

  const fullName = getHexagramFullName(hex);

  return (
    <div className={styles.page}>
      <Seo
        title={`${fullName} · 六十四卦 · 易解`}
        description={`易解六十四卦：${fullName}，查看卦辞、象传、六爻爻辞与卦义。`}
        path={`/liuyao/hexagram/${hex.id}`}
      />
      <Link to="/liuyao/hexagrams" className={styles.back}>← 六十四卦</Link>
      <div className={styles.header}>
        <h1 className={styles.name}>{fullName}<span className={styles.id}>第{hex.id}卦</span></h1>
        <HexagramDisplay lines={hex.lines} size="large" />
        <p className={styles.trigrams}>{hex.lowerTrigram}下{hex.upperTrigram}上</p>
      </div>
      <div className={styles.section}>
        <h3>卦辞</h3>
        <p className={styles.judgment}>{hex.judgment}</p>
        <p className={styles.meaning}>{hex.meaning}</p>
      </div>
      {hex.image && (
        <div className={styles.section}>
          <h3>象传</h3>
          <p className={styles.imageText}>{hex.image}</p>
        </div>
      )}
      <div className={styles.section}>
        <h3>六爻爻辞（从下至上）</h3>
        <div className={styles.yaoList}>
          {hex.yaoText.map((text, i) => (
            <div key={i} className={`${styles.yaoItem} ${hex.lines[i] === 1 ? styles.yaoYang : styles.yaoYin}`}>
              <span className={styles.yaoPos}>{i === 0 ? '初' : i === 5 ? '上' : ['二','三','四','五'][i-1]}</span>
              <span className={styles.yaoText}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
