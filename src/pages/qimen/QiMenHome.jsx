import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { toDateTimeInputValue } from '../../utils/dateTime.js';
import styles from './QiMenHome.module.css';

export default function QiMenHome() {
  const navigate = useNavigate();
  const [dateTime, setDateTime] = useState(toDateTimeInputValue(new Date()));

  const submitCustom = (event) => {
    event.preventDefault();
    navigate(`/qimen/display?dt=${encodeURIComponent(dateTime)}&mode=custom`);
  };

  const useCurrentTime = () => {
    navigate(`/qimen/display?dt=${encodeURIComponent(toDateTimeInputValue(new Date()))}&mode=now`);
  };

  return (
    <div className={styles.page}>
      <Helmet><title>奇门遁甲 — 易解</title></Helmet>
      <h1 className={styles.title}>奇门遁甲</h1>
      <p className={styles.subtitle}>八门九星 · 择时定方</p>
      <div className={styles.divider} />
      <p className={styles.desc}>
        奇门遁甲，三式之一。以洛书九宫为基，排八门、布九星、转八神、推三奇六仪。
        阳遁阴遁各九局，共十八局。定方位，择时机，趋吉避凶，运筹帷幄。
      </p>
      <form className={styles.panel} onSubmit={submitCustom}>
        <button type="button" className={styles.btn} onClick={useCurrentTime}>本地时间起局</button>
        <label className={styles.timeRow}>
          <span>自定义时间</span>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={event => setDateTime(event.target.value)}
            min="1900-01-01T00:00"
            max="2100-12-31T23:59"
          />
        </label>
        <button type="submit" className={styles.btnOutline}>自定义排盘</button>
      </form>
      <div className={styles.notice}>
        <p>当前为学习版时家奇门盘面，展示阴阳遁、局数、值符值使、八门九星八神与三奇六仪。</p>
      </div>
    </div>
  );
}
