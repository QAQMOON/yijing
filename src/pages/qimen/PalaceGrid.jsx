import Seo from '../../components/Seo.jsx';
import { Link, useSearchParams } from 'react-router-dom';
import { calculateQiMen } from '../../utils/qimenCalc.js';
import { dateFromSearchParams, formatDateTimeCN } from '../../utils/dateTime.js';
import styles from './PalaceGrid.module.css';

const METHOD_LABELS = {
  rotating: '转盘奇门',
  flying: '飞盘奇门',
};

const JU_METHOD_LABELS = {
  chaibu: '拆补无闰法',
  zhirun: '超接置闰法',
};

function MetaRow({ label, children }) {
  return (
    <div className={styles.metaRow}>
      <span>{label}</span>
      <div>{children}</div>
    </div>
  );
}

export default function PalaceGrid() {
  const [params] = useSearchParams();
  const date = dateFromSearchParams(params);
  const plate = params.get('plate') || 'rotating';
  const juMethod = params.get('juMethod') || 'chaibu';
  const chart = calculateQiMen(date, {
    method: METHOD_LABELS[plate] || '转盘奇门',
    juMethod: JU_METHOD_LABELS[juMethod] || '拆补无闰法',
  });

  return (
    <div className={styles.page}>
      <Seo
        title="奇门九宫排盘结果 · 易解"
        description="查看易解奇门遁甲九宫结果，包括阴阳遁、局数、值符值使、八门、九星、八神、三奇六仪与旬空节气。"
        path="/qimen/display"
      />
      <Link to="/qimen" className={styles.back}>← 奇门遁甲</Link>

      <h1 className={styles.title}>奇门遁甲排盘</h1>
      <p className={styles.subtitle}>{chart.direction}{chart.ju}局 · {chart.yuan} · {chart.dutyStar}值符 / {chart.dutyDoor}值使</p>
      <div className={styles.divider} />

      <section className={styles.metaPanel} aria-label="奇门排盘信息">
        <MetaRow label="方式">
          <strong>{chart.method}</strong>
          <strong>{chart.juMethod}</strong>
        </MetaRow>
        <MetaRow label="时间">
          <strong>{formatDateTimeCN(date)}</strong>
        </MetaRow>
        <MetaRow label="农历">
          <strong>{chart.lunarText}</strong>
        </MetaRow>
        <MetaRow label="干支">
          <strong>{chart.pillars.year.full}</strong>
          <strong>{chart.pillars.month.full}</strong>
          <strong>{chart.pillars.day.full}</strong>
          <strong>{chart.pillars.hour.full}</strong>
        </MetaRow>
        <MetaRow label="旬空">
          <strong>{chart.xun.voidBranches}</strong>
          <span>{chart.xun.head}旬首为{chart.xun.chiefStem}</span>
        </MetaRow>
        <MetaRow label="节气">
          <span>上一节气：{chart.termText.previous}</span>
          <span>下一节气：{chart.termText.next}</span>
        </MetaRow>
        <MetaRow label="局盘">
          <strong>{chart.termName}{chart.yuan}</strong>
          <strong>{chart.direction}{chart.ju}局</strong>
          <span>值符{chart.dutyStar}落{chart.dutyTarget}宫</span>
          <span>值使{chart.dutyDoor}落{chart.dutyTarget}宫</span>
        </MetaRow>
      </section>

      <div className={styles.grid}>
        {chart.palaces.map((palace) => (
          <div key={palace.pos} className={`${styles.palace} ${palace.pos === 5 ? styles.center : ''}`}>
            <div className={styles.palaceHeader}>
              <span className={styles.palaceName}>{palace.name}{palace.pos === 5 ? '宫' : ''}</span>
              <span className={styles.palaceNum}>{palace.pos} · {palace.direction}</span>
            </div>
            <div className={styles.palaceBody}>
              <div className={styles.mainLine}>
                <strong>{palace.god || '无'}</strong>
                <strong>{palace.star || '无'}</strong>
              </div>
              <div className={styles.mainLine}>
                <span>{palace.door || '无'}</span>
                <span className={styles.stem}>{palace.stem || '无'}</span>
              </div>
              <div className={styles.detailRow}><span>神</span><b>{palace.god || '无'}</b></div>
              <div className={styles.detailRow}><span>门</span><b>{palace.door || '无'}</b></div>
              <div className={styles.detailRow}><span>星</span><b>{palace.star || '无'}</b></div>
              <div className={styles.detailRow}><span>仪</span><b>{palace.stem || '无'}</b></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
