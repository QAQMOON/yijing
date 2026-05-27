import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { calculateZiWei, paramsToZiWeiOptions } from '../../utils/ziweiCalc.js';
import styles from './ZiWeiChart.module.css';

const MUTAGEN_LABELS = ['禄', '权', '科', '忌'];

function StarList({ stars, tone }) {
  if (!stars.length) return null;
  return (
    <div className={styles.starList}>
      {stars.map((star, index) => (
        <span
          key={`${star.name}-${star.scope}-${index}`}
          className={`${styles.star} ${styles[tone]} ${star.mutagen ? styles.mutagen : ''}`}
        >
          {star.text}
        </span>
      ))}
    </div>
  );
}

function PalaceCell({ palace }) {
  const decadalRange = palace.decadal?.range?.join('—') || '';
  const firstAges = palace.ages?.slice(0, 3).join('、') || '';

  return (
    <section className={styles.cell} style={{ gridColumn: palace.gridArea.col, gridRow: palace.gridArea.row }}>
      <div className={styles.cellTop}>
        <span>{palace.heavenlyStem}{palace.earthlyBranch}</span>
        <strong>{palace.name}</strong>
      </div>
      <StarList stars={palace.majorStars} tone="major" />
      <StarList stars={palace.minorStars} tone="minor" />
      <StarList stars={palace.adjectiveStars.slice(0, 8)} tone="adjective" />
      <StarList stars={palace.dynamicStars.slice(0, 4)} tone="dynamic" />
      <div className={styles.cellBottom}>
        <span>{palace.changsheng12}</span>
        <span>{palace.boshi12}</span>
        <span>{palace.jiangqian12}</span>
        <span>{palace.suiqian12}</span>
      </div>
      <div className={styles.limitLine}>
        <span>{decadalRange}</span>
        <b>{palace.isBodyPalace ? '身★宫' : palace.isOriginalPalace ? '来因宫' : ''}</b>
        <span>{firstAges}</span>
      </div>
    </section>
  );
}

function MutagenRow({ label, item }) {
  if (!item) return null;
  return (
    <div className={styles.mutagenRow}>
      <span>{label}</span>
      <strong>{item.heavenlyStem}{item.earthlyBranch}</strong>
      <em>{item.mutagen?.map((star, index) => `${star}${MUTAGEN_LABELS[index] || ''}`).join('  ')}</em>
    </div>
  );
}

function CenterPanel({ chart }) {
  const lunar = chart.rawDates?.lunarDate;
  const lunarMonthText = lunar ? `${lunar.lunarYear}年${lunar.isLeap ? '闰' : ''}${lunar.lunarMonth}月${lunar.lunarDay}日` : chart.lunarDate;

  return (
    <section className={styles.centerPanel}>
      <p className={styles.systemTitle}>元亨利贞网紫微斗数在线排盘系统</p>
      <div className={styles.coreGrid}>
        <span>盘类：{chart.plateTypeText}</span>
        <span>{chart.gender}命</span>
        <span>{chart.fiveElementsClass}</span>
        <span>{chart.zodiac}年</span>
        <span>阳历：{chart.solarDate} {chart.time}</span>
        <span>农历：{lunarMonthText}</span>
        <span>四柱：{chart.chineseDate}</span>
        <span>命主：{chart.soul} / 身主：{chart.body}</span>
        <span>命宫：{chart.earthlyBranchOfSoulPalace}</span>
        <span>身宫：{chart.earthlyBranchOfBodyPalace}</span>
      </div>
      <div className={styles.mutagenBox}>
        <MutagenRow label="大限" item={chart.horoscope.decadal} />
        <MutagenRow label="小限" item={chart.horoscope.age} />
        <MutagenRow label="流年" item={chart.horoscope.yearly} />
        <MutagenRow label="流月" item={chart.horoscope.monthly} />
      </div>
    </section>
  );
}

export default function ZiWeiChart() {
  const [params] = useSearchParams();
  const chart = calculateZiWei(paramsToZiWeiOptions(params));

  return (
    <div className={styles.page}>
      <Helmet><title>紫微斗数排盘 — 易解</title></Helmet>
      <Link to="/ziwei" className={styles.back}>← 紫微斗数</Link>
      <h1 className={styles.title}>紫微斗数排盘</h1>
      <p className={styles.subtitle}>{chart.calendarText} {chart.dateText} · {chart.gender}命 · {chart.plateTypeText}</p>
      <div className={styles.divider} />

      <div className={styles.frame}>
        <div className={styles.frameTitle}>元亨利贞网紫微斗数在线排盘系统</div>
        <div className={styles.chartGrid}>
          {chart.palaces.map((palace) => <PalaceCell key={palace.index} palace={palace} />)}
          <CenterPanel chart={chart} />
        </div>
      </div>
    </div>
  );
}
