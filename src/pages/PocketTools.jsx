import { useMemo, useState } from 'react';
import Seo from '../components/Seo.jsx';
import { calculateBaZiFromDate } from '../utils/baziCalc.js';
import styles from './PocketTools.module.css';

function toInputValue(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    '-',
    pad(date.getMonth() + 1),
    '-',
    pad(date.getDate()),
    'T',
    pad(date.getHours()),
    ':',
    pad(date.getMinutes()),
  ].join('');
}

function hourName(hour) {
  const branches = ['子', '丑', '丑', '寅', '寅', '卯', '卯', '辰', '辰', '巳', '巳', '午', '午', '未', '未', '申', '申', '酉', '酉', '戌', '戌', '亥', '亥', '子'];
  return `${branches[hour]}时`;
}

function PillarCard({ label, pillar }) {
  return (
    <article className={styles.pillarCard}>
      <span>{label}</span>
      <strong>{pillar.full}</strong>
      <small>{pillar.tenGod}</small>
      <p>{pillar.nayin || '纳音待补'}</p>
    </article>
  );
}

export default function PocketTools() {
  const [dateValue, setDateValue] = useState(() => toInputValue(new Date()));
  const chart = useMemo(() => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return null;
    return calculateBaZiFromDate(date);
  }, [dateValue]);

  return (
    <div className={styles.page}>
      <Seo
        title="百宝袋 · 择日时辰节气纳音空亡 · 易解"
        description="易解百宝袋提供时辰换算、四柱、节气、纳音、空亡等轻工具，适合排盘前快速校对。"
        path="/tools"
      />

      <section className={styles.hero}>
        <p className={styles.kicker}>百宝袋</p>
        <h1>排盘前先校对时间与干支</h1>
        <p>提供时辰换算、节气、四柱、纳音、空亡等常用小工具。七政四余会单独接入星历。</p>
      </section>

      <section className={styles.inputPanel}>
        <label>
          <span>选择公历时间</span>
          <input
            type="datetime-local"
            value={dateValue}
            onChange={(event) => setDateValue(event.target.value)}
          />
        </label>
      </section>

      {chart && (
        <>
          <section className={styles.summaryGrid}>
            <article>
              <span>时辰</span>
              <strong>{hourName(new Date(dateValue).getHours())}</strong>
              <p>按当前小时换算传统时辰。</p>
            </article>
            <article>
              <span>空亡</span>
              <strong>{chart.voidBranches}</strong>
              <p>以日柱所在旬推得。</p>
            </article>
            <article>
              <span>前一节气</span>
              <strong>{chart.previousTermText}</strong>
              <p>节气用于校对月令。</p>
            </article>
            <article>
              <span>后一节气</span>
              <strong>{chart.nextTermText}</strong>
              <p>择日时可先看节令边界。</p>
            </article>
          </section>

          <section className={styles.pillarSection}>
            <h2>四柱与纳音</h2>
            <div className={styles.pillarGrid}>
              <PillarCard label="年柱" pillar={chart.pillars.year} />
              <PillarCard label="月柱" pillar={chart.pillars.month} />
              <PillarCard label="日柱" pillar={chart.pillars.day} />
              <PillarCard label="时柱" pillar={chart.pillars.hour} />
            </div>
          </section>

          <section className={styles.notePanel}>
            <h2>后续百宝袋</h2>
            <div>
              <span>择日筛选</span>
              <span>节气日历</span>
              <span>纳音表</span>
              <span>空亡速查</span>
              <span>七政四余入口</span>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
