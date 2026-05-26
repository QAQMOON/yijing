import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import HexagramDisplay from '../../components/HexagramDisplay.jsx';
import { performReading, performTimeReading, linesToHexagramId } from '../../utils/coinCast.js';
import { HEXAGRAMS } from '../../data/hexagrams.js';
import { formatDateTimeCN, toDateTimeInputValue } from '../../utils/dateTime.js';
import { getHexagramFullName } from '../../utils/liuyaoMeta.js';
import styles from './CoinCast.module.css';

const LINE_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
const MANUAL_LINES = [
  { value: 6, line: 0, label: '老阴', detail: '阴爻发动' },
  { value: 7, line: 1, label: '少阳', detail: '阳爻安静' },
  { value: 8, line: 0, label: '少阴', detail: '阴爻安静' },
  { value: 9, line: 1, label: '老阳', detail: '阳爻发动' },
];

export default function CoinCast() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode');
  const [mode, setMode] = useState(['time', 'random', 'manual'].includes(initialMode) ? initialMode : 'manual');
  const [phase, setPhase] = useState(0);
  const [lines, setLines] = useState([]);
  const [details, setDetails] = useState([]);
  const [animating, setAnimating] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [castDate, setCastDate] = useState(null);

  const toss = useCallback(() => {
    if (animating || phase >= 6) return;
    setAnimating(true);
    setTimeout(() => {
      const result = performReading();
      const newLine = result.lines[0];
      const newDetail = result.details[0];
      setCastDate(prev => prev || new Date());
      setLines(prev => [...prev, newLine]);
      setDetails(prev => [...prev, newDetail]);
      setPhase(prev => prev + 1);
      setAnimating(false);
    }, 600);
  }, [animating, phase]);

  const reset = () => { setPhase(0); setLines([]); setDetails([]); setSourceText(''); setCastDate(null); };

  const applyReading = (reading, source) => {
    const date = reading.date || new Date();
    setCastDate(date);
    setLines(reading.lines);
    setDetails(reading.details);
    setPhase(6);
    setSourceText(source);
  };

  const castByCurrentTime = () => {
    const now = new Date();
    applyReading(performTimeReading(now), `电脑时间起卦：${formatDateTimeCN(now)}`);
  };

  const castRandom = () => {
    applyReading(performReading(), '随机起卦(赛锦囊)：三钱随机六次成卦');
  };

  const addManualLine = (item) => {
    if (phase >= 6) return;
    setCastDate(prev => prev || new Date());
    setLines(prev => [...prev, item.line]);
    setDetails(prev => [...prev, {
      value: item.value,
      yinYang: item.line,
      isChanging: item.value === 6 || item.value === 9,
      label: item.label,
      coins: ['手动'],
    }]);
    setPhase(prev => prev + 1);
    setSourceText('手动摇卦：逐爻录入');
  };

  const viewResult = () => {
    if (lines.length !== 6) return;
    const id = linesToHexagramId(lines);
    const params = new URLSearchParams({
      lines: lines.join(''),
      values: details.map((item) => item.value).join(','),
      dt: toDateTimeInputValue(castDate || new Date()),
      source: mode,
    });
    navigate(`/liuyao/reading/${id}?${params.toString()}`);
  };

  const currentHex = lines.length === 6
    ? HEXAGRAMS.find(h => h.id === linesToHexagramId(lines))
    : null;

  return (
    <div className={styles.page}>
      <Helmet><title>六爻起卦 — 易解</title></Helmet>
      <h1 className={styles.title}>六爻起卦</h1>
      <p className={styles.subtitle}>电脑时间 · 随机起卦(赛锦囊) · 手动摇卦</p>
      <div className={styles.divider} />

      <div className={styles.modeTabs}>
        {[
          ['time', '电脑时间'],
          ['random', '随机起卦(赛锦囊)'],
          ['manual', '手动摇卦'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`${styles.modeTab} ${mode === key ? styles.modeActive : ''}`}
            onClick={() => { setMode(key); reset(); }}
          >
            {label}
          </button>
        ))}
      </div>

      {phase < 6 && mode === 'time' && (
        <div className={styles.quickCast}>
          <p>以当前电脑时间生成六爻，适合问事当下取象。</p>
          <button className={styles.primaryAction} onClick={castByCurrentTime}>用此刻起卦</button>
        </div>
      )}

      {phase < 6 && mode === 'random' && (
        <div className={styles.quickCast}>
          <p>一次完成六次三钱随机，保留每爻阴阳与动静。</p>
          <button className={styles.primaryAction} onClick={castRandom}>随机成卦</button>
        </div>
      )}

      {phase < 6 && mode === 'manual' ? (
        <div className={styles.castArea}>
          <div className={styles.phaseInfo}>
            第 <strong>{phase + 1}</strong> 爻 · {LINE_NAMES[phase]}
          </div>
          <div className={styles.manualGrid}>
            {MANUAL_LINES.map((item) => (
              <button key={item.value} type="button" className={styles.manualBtn} onClick={() => addManualLine(item)}>
                <span>{item.label}</span>
                <small>{item.detail}</small>
              </button>
            ))}
          </div>
          <button className={styles.tossBtn} onClick={toss} disabled={animating}>
            {animating ? <span className={styles.spinning}>抛掷中...</span> : <span>摇 卦</span>}
          </button>
          {details.length > 0 && (
            <div className={styles.currentResult}>
              上次数：<span className={styles.coinLabel}>{details[details.length - 1].label}</span>
              <span className={styles.coinDetail}>
                ({details[details.length - 1].coins.join(' + ')})
              </span>
            </div>
          )}
        </div>
      ) : phase === 6 ? (
        <div className={styles.doneArea}>
          <p className={styles.doneText}>六爻已成</p>
          {sourceText && <p className={styles.sourceText}>{sourceText}</p>}
          {currentHex && (
            <div className={styles.hexName}>
              <strong>{getHexagramFullName(currentHex)}</strong>
              <small>第{currentHex.id}卦 · {currentHex.meaning}</small>
            </div>
          )}
          <HexagramDisplay lines={lines} size="large" />
          <div className={styles.lineList}>
            {details.map((item, index) => (
              <div key={`${item.value}-${index}`} className={styles.lineItem}>
                <span>{LINE_NAMES[index]}</span>
                <strong>{item.label}</strong>
              </div>
            ))}
          </div>
          <div className={styles.doneActions}>
            <button className={styles.viewBtn} onClick={viewResult}>查看卦象 →</button>
            <button className={styles.retryBtn} onClick={reset}>重新摇卦</button>
          </div>
        </div>
      ) : null}

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
