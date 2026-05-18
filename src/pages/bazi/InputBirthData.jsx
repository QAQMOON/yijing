import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styles from './InputBirthData.module.css';

export default function InputBirthData() {
  const navigate = useNavigate();
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [hour, setHour] = useState(12);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (year < 1900 || year > 2100) return;
    navigate(`/bazi/result?y=${year}&m=${month}&d=${day}&h=${hour}`);
  };

  return (
    <div className={styles.page}>
      <Helmet><title>输入生辰 — 八字排盘 — 易理</title></Helmet>
      <h1 className={styles.title}>八字排盘</h1>
      <p className={styles.subtitle}>请输入出生日期与时辰</p>
      <div className={styles.divider} />

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.row}>
          <label className={styles.label}>出生年份</label>
          <input type="number" className={styles.input} value={year} onChange={e => setYear(Number(e.target.value))} min={1900} max={2100} />
        </div>
        <div className={styles.row}>
          <label className={styles.label}>出生月份</label>
          <select className={styles.input} value={month} onChange={e => setMonth(Number(e.target.value))}>
            {Array.from({length:12}, (_,i) => <option key={i+1} value={i+1}>{i+1}月</option>)}
          </select>
        </div>
        <div className={styles.row}>
          <label className={styles.label}>出生日期</label>
          <input type="number" className={styles.input} value={day} onChange={e => setDay(Number(e.target.value))} min={1} max={31} />
        </div>
        <div className={styles.row}>
          <label className={styles.label}>出生时辰</label>
          <select className={styles.input} value={hour} onChange={e => setHour(Number(e.target.value))}>
            {['子时 23-01','丑时 01-03','寅时 03-05','卯时 05-07','辰时 07-09','巳时 09-11','午时 11-13','未时 13-15','申时 15-17','酉时 17-19','戌时 19-21','亥时 21-23'].map((s,i) => (
              <option key={i} value={i*2}>{(i*2+23)%24}:00 - {(i*2+1)%24}:00  {s}</option>
            ))}
          </select>
        </div>
        <button type="submit" className={styles.btn}>排 盘</button>
      </form>

      <p className={styles.note}>年份范围：1900 - 2100。V1版本使用公历直算，后续将支持农历。</p>
    </div>
  );
}
