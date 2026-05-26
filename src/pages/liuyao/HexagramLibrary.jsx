import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import HexagramCard from '../../components/HexagramCard.jsx';
import { HEXAGRAMS } from '../../data/hexagrams.js';
import { getHexagramFullName } from '../../utils/liuyaoMeta.js';
import styles from './HexagramLibrary.module.css';

export default function HexagramLibrary() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return HEXAGRAMS;
    const q = search.trim();
    return HEXAGRAMS.filter(h =>
      getHexagramFullName(h).includes(q) ||
      h.name.includes(q) || h.meaning.includes(q) || h.judgment.includes(q) ||
      h.upperTrigram.includes(q) || h.lowerTrigram.includes(q) ||
      String(h.id) === q
    );
  }, [search]);

  return (
    <div className={styles.page}>
      <Helmet><title>六十四卦 — 易解</title></Helmet>
      <h1 className={styles.title}>六十 四 卦</h1>
      <p className={styles.subtitle}>文王六十四卦序</p>
      <div className={styles.divider} />
      <input
        type="text"
        className={styles.search}
        placeholder="搜索卦名、卦辞、含义..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className={styles.grid}>
        {filtered.map(h => (
          <HexagramCard key={h.id} hexagram={h} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className={styles.empty}>无匹配卦象</p>
      )}
    </div>
  );
}
