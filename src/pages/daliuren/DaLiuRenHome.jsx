import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { toDateTimeInputValue } from '../../utils/dateTime.js';
import styles from './DaLiuRenHome.module.css';

export default function DaLiuRenHome() {
  const navigate = useNavigate();
  const [dateTime, setDateTime] = useState(toDateTimeInputValue(new Date()));

  const submitCustom = (event) => {
    event.preventDefault();
    navigate(`/daliuren/display?dt=${encodeURIComponent(dateTime)}&mode=custom`);
  };

  const useCurrentTime = () => {
    navigate(`/daliuren/display?dt=${encodeURIComponent(toDateTimeInputValue(new Date()))}&mode=now`);
  };

  return (
    <div className={styles.page}>
      <Helmet><title>大六壬 — 易解</title></Helmet>
      <h1 className={styles.title}>大 六 壬</h1>
      <p className={styles.subtitle}>古三式之冠 · 天地人三盘</p>
      <div className={styles.divider} />
      <p className={styles.desc}>
        大六壬，古传三式之首。以占时为正时，月将加时布天盘，起四课，发三传。
        天地人三盘叠合，十二天将各司其位，信息量最为丰富，细腻解析事物发展脉络。
      </p>
      <form className={styles.panel} onSubmit={submitCustom}>
        <button type="button" className={styles.btn} onClick={useCurrentTime}>本地时间起课</button>
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
        <p>当前为学习版大六壬盘，展示月将加时、天地人三盘、四课与三传。</p>
      </div>
    </div>
  );
}
