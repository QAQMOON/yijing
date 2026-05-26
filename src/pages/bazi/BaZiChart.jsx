import { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { calculateBaZiFromDate, calculateBaZiFromLunar } from '../../utils/baziCalc.js';
import { dateFromSearchParams } from '../../utils/dateTime.js';
import styles from './BaZiChart.module.css';

const PILLARS = [
  ['year', '年柱'],
  ['month', '月柱'],
  ['day', '日柱'],
  ['hour', '时柱'],
];

function chartFromParams(params) {
  const gender = params.get('gender') === 'female' ? 'female' : 'male';
  const calendar = params.get('calendar') || (params.get('ly') ? 'lunar' : 'solar');

  try {
    if (calendar === 'lunar') {
      return calculateBaZiFromLunar({
        year: Number(params.get('ly')),
        month: Number(params.get('lm')),
        day: Number(params.get('ld')),
        hour: Number(params.get('lh') || 0),
        minute: Number(params.get('lmin') || 0),
        gender,
      });
    }

    return calculateBaZiFromDate(dateFromSearchParams(params), { gender, calendarType: 'solar' });
  } catch {
    return null;
  }
}

function PillarCard({ label, pillar, isDay }) {
  return (
    <article className={`${styles.pillar} ${isDay ? styles.dayPillar : ''}`}>
      <div className={styles.pillarTop}>
        <span>{label}</span>
        {isDay && <i>日主</i>}
      </div>
      <div className={styles.tenGod}>{pillar.tenGod}</div>
      <div className={styles.stemBranch}>
        <span className={styles.stem}>{pillar.stem}</span>
        <span className={styles.branch}>{pillar.branch}</span>
      </div>
      <div className={styles.full}>{pillar.full}</div>
      <dl className={styles.metaList}>
        <div><dt>五行</dt><dd>{pillar.fiveElementText}</dd></div>
        <div><dt>藏干</dt><dd>{pillar.hiddenText}</dd></div>
        <div><dt>旺衰</dt><dd>{pillar.prosperity}</dd></div>
        <div><dt>纳音</dt><dd>{pillar.nayin}</dd></div>
      </dl>
    </article>
  );
}

function LuckCard({ item, footer }) {
  return (
    <article className={styles.luckCard}>
      <span className={styles.luckAge}>{footer}</span>
      <span className={styles.luckGod}>{item.tenGod}</span>
      <div className={styles.luckChars}>
        <strong>{item.stem}</strong>
        <strong>{item.branch}</strong>
      </div>
      <span>{item.prosperity}</span>
      <small>{item.nayin}</small>
    </article>
  );
}

function FlowYearTable({ years }) {
  const groups = Array.from({ length: 10 }, (_, index) => years.slice(index * 10, index * 10 + 10));

  return (
    <div className={styles.flowYearPanel}>
      <div className={styles.flowTitle}>
        <h3>流年</h3>
        <p>从出生年起排至 100 岁，流年按当年六十甲子排列，与性别无关</p>
      </div>
      <div className={styles.flowScroller}>
        <div className={styles.flowGrid}>
          {groups.map((group, index) => (
            <div key={index} className={styles.flowColumn}>
              <div className={styles.flowColumnHead}>
                {index * 10 + 1}-{index * 10 + group.length}岁
              </div>
              {group.map((item) => (
                <div key={`${item.year}-${item.full}`} className={styles.flowItem}>
                  <span>{item.virtualAge}岁</span>
                  <strong>{item.full}</strong>
                  <small>{item.year}</small>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BaZiChart() {
  const [params] = useSearchParams();
  const baZi = useMemo(() => chartFromParams(params), [params]);

  if (!baZi || baZi.solarDate.getFullYear() < 1900 || baZi.solarDate.getFullYear() > 2100) {
    return (
      <div className={styles.page}>
        <p className={styles.error}>请输入有效的出生日期，年份需在 1900-2100 之间。</p>
        <Link to="/bazi/chart" className={styles.back}>← 重新输入</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Helmet><title>八字排盘 · {baZi.solarText} · 易解</title></Helmet>
      <Link to="/bazi/chart" className={styles.backLink}>← 重新排盘</Link>

      <section className={styles.topInfo}>
        <div className={styles.infoLine}>
          <span>历法时间</span>
          <strong>公历：{baZi.solarText}</strong>
          <strong>农历：{baZi.lunarText}</strong>
        </div>
        <div className={styles.infoLine}>
          <span>节气</span>
          <strong>前一节气：{baZi.previousTermText}</strong>
          <strong>后一节气：{baZi.nextTermText}</strong>
        </div>
        <div className={styles.infoLine}>
          <span>起运</span>
          <strong>起运岁数：{baZi.startAgeText}</strong>
          <strong>交运时间：{baZi.transitText}</strong>
          <em>{baZi.genderText}命 · {baZi.luckRuleText}</em>
        </div>
      </section>

      <section className={styles.pillars}>
        {PILLARS.map(([key, label]) => (
          <PillarCard key={key} label={label} pillar={baZi[key]} isDay={key === 'day'} />
        ))}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>大运</h2>
          <p>{baZi.directionText}，以月柱为起点每十年一运</p>
        </div>
        <div className={styles.luckGrid}>
          {baZi.luckPillars.map((item) => (
            <LuckCard key={`${item.startAge}-${item.full}`} item={item} footer={`${item.startAge}岁起`} />
          ))}
        </div>
        <FlowYearTable years={baZi.annualLuck} />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>神煞</h2>
          <p>按年干、年支、月支、日干、日支分列</p>
        </div>
        <div className={styles.shenShaList}>
          {baZi.shenShaRows.map((row) => (
            <div key={`${row.label}-${row.base}`} className={styles.shenShaRow}>
              <strong>{row.label}<span>{row.base}</span></strong>
              <div>
                {row.items.map((item) => <i key={item}>{item}</i>)}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
