import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import { HEXAGRAMS } from '../data/hexagrams.js';
import {
  CLASSIC_SOURCES,
  CLASSICS_FAQ,
  GLOSSARY_TERMS,
  TEN_GODS,
  ZIWEI_STARS,
} from '../data/classics.js';
import { getHexagramFullName } from '../utils/liuyaoMeta.js';
import styles from './Classics.module.css';

function includesQuery(...values) {
  return (query) => values.some((value) => String(value || '').includes(query));
}

export default function Classics() {
  const [query, setQuery] = useState('');
  const cleanQuery = query.trim();

  const terms = useMemo(() => {
    if (!cleanQuery) return GLOSSARY_TERMS;
    return GLOSSARY_TERMS.filter((item) => includesQuery(item.term, item.domain, item.explanation)(cleanQuery));
  }, [cleanQuery]);

  const stars = useMemo(() => {
    if (!cleanQuery) return ZIWEI_STARS;
    return ZIWEI_STARS.filter((item) => includesQuery(item.name, item.group, item.meaning)(cleanQuery));
  }, [cleanQuery]);

  const hexagrams = useMemo(() => {
    const list = HEXAGRAMS.map((hexagram) => ({
      ...hexagram,
      fullName: getHexagramFullName(hexagram),
    }));
    if (!cleanQuery) return list.slice(0, 12);
    return list.filter((item) => includesQuery(item.fullName, item.meaning, item.judgment)(cleanQuery)).slice(0, 24);
  }, [cleanQuery]);

  return (
    <div className={styles.page}>
      <Seo
        title="藏经阁与术语库 · 易解"
        description="易解藏经阁整理周易、六爻、八字、紫微斗数的古籍依据、术语库、六十四卦、十神与星曜说明。"
        path="/classics"
      />

      <section className={styles.hero}>
        <p className={styles.kicker}>藏经阁</p>
        <h1>古籍依据先放在台面上</h1>
        <p>六十四卦、十神、星曜和常用术语集中查询，AI 报告也会逐步引用这些依据。</p>
        <label className={styles.search}>
          <span>搜索术语或卦名</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="例如 世应、正官、紫微、乾为天"
          />
        </label>
      </section>

      <section className={styles.sourceGrid} aria-label="古籍依据">
        {CLASSIC_SOURCES.map((source) => (
          <article key={source.id} className={styles.sourceCard}>
            <span>{source.domain}</span>
            <h2>{source.title}</h2>
            <p>{source.summary}</p>
            <div className={styles.tagRow}>
              {source.useFor.map((item) => <small key={item}>{item}</small>)}
            </div>
          </article>
        ))}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>术语库</h2>
          <Link to="/liuyao/hexagrams">查看六十四卦</Link>
        </div>
        <div className={styles.termGrid}>
          {terms.map((item) => (
            <article key={`${item.domain}-${item.term}`} className={styles.termCard}>
              <span>{item.domain}</span>
              <h3>{item.term}</h3>
              <p>{item.explanation}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.splitSection}>
        <div className={styles.panel}>
          <h2>十神说明</h2>
          <div className={styles.compactGrid}>
            {TEN_GODS.map((item) => (
              <div key={item.name} className={styles.compactItem}>
                <strong>{item.name}</strong>
                <span>{item.relation}</span>
                <p>{item.reading}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.panel}>
          <h2>星曜说明</h2>
          <div className={styles.compactGrid}>
            {stars.map((item) => (
              <div key={item.name} className={styles.compactItem}>
                <strong>{item.name}</strong>
                <span>{item.group}</span>
                <p>{item.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>六十四卦速览</h2>
          <Link to="/liuyao/hexagrams">进入卦库</Link>
        </div>
        <div className={styles.hexGrid}>
          {hexagrams.map((hexagram) => (
            <Link key={hexagram.id} to={`/liuyao/hexagram/${hexagram.id}`} className={styles.hexItem}>
              <span>第{hexagram.id}卦</span>
              <strong>{hexagram.fullName}</strong>
              <p>{hexagram.meaning}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.faq}>
        {CLASSICS_FAQ.map((item) => (
          <details key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </section>
    </div>
  );
}
