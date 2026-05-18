import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import HexagramDisplay from '../../components/HexagramDisplay.jsx';
import { performReading, linesToHexagramId } from '../../utils/coinCast.js';
import { HEXAGRAMS } from '../../data/hexagrams.js';
import styles from './CoinCast.module.css';

const LINE_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

export default function CoinCast() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);
  const [lines, setLines] = useState([]);
  const [details, setDetails] = useState([]);
  const [animating, setAnimating] = useState(false);

  const toss = useCallback(() => {
    if (animating || phase >= 6) return;
    setAnimating(true);
    setTimeout(() => {
      const result = performReading();
      const newLine = result.lines[0];
      const newDetail = result.details[0];
      setLines(prev => [...prev, newLine]);
      setDetails(prev => [...prev, newDetail]);
      setPhase(prev => prev + 1);
      setAnimating(false);
    }, 600);
  }, [animating, phase]);

  const reset = () => { setPhase(0); setLines([]); setDetails([]); };

  const viewResult = () => {
    if (lines.length !== 6) return;
    const id = linesToHexagramId(lines);
    navigate(`/liuyao/reading/${id}`);
  };

  return (
    <div className={styles.page}>
      <Helmet><title>六爻起卦 — 易理</title></Helmet>
      <h1 className={styles.title}>六爻起卦</h1>
      <p className={styles.subtitle}>三枚铜钱 · 诚心默问</p>
      <div className={styles.divider} />

      {phase < 6 ? (
        <div className={styles.castArea}>
          <div className={styles.phaseInfo}>
            第 <strong>{phase + 1}</strong> 次摇卦 · {LINE_NAMES[phase]}
          </div>
          <button className={styles.tossBtn} onClick={toss} disabled={animating}>
            {animating ? (
              <span className={styles.spinning}>抛掷中...</span>
            ) : (
              <span>摇 卦</span>
            )}
          </button>
          {details.length > 0 && (
            <div className={styles.currentResult}>
              上次数：<span className={styles.coinLabel}>{details[details.length - 1].label}</span>
              <span className={styles.coinDetail}>
                ({details[details.length - 1].coins.join(' + ')} = {details[details.length - 1].value})
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.doneArea}>
          <p className={styles.doneText}>六爻已成</p>
          <HexagramDisplay lines={lines} size="large" />
          <div className={styles.doneActions}>
            <button className={styles.viewBtn} onClick={viewResult}>查看卦象 →</button>
            <button className={styles.retryBtn} onClick={reset}>重新摇卦</button>
          </div>
        </div>
      )}

      <div className={styles.progress}>
        {[0,1,2,3,4,5].map(i => (
          <div key={i} className={`${styles.dot} ${i < phase ? styles.dotFilled : ''} ${i === phase - 1 ? styles.dotLatest : ''}`}>
            {i < lines.length ? (lines[i] === 1 ? '—' : '- -') : i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
