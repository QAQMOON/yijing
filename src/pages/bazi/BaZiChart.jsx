import { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Seo from '../../components/Seo.jsx';
import { calculateBaZiFromDate, calculateBaZiFromLunar } from '../../utils/baziCalc.js';
import { dateFromSearchParams } from '../../utils/dateTime.js';
import styles from './BaZiChart.module.css';

const PILLARS = [
  ['year', '年柱'],
  ['month', '月柱'],
  ['day', '日柱'],
  ['hour', '时柱'],
];
const pad = (value) => String(value).padStart(2, '0');

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

function formatStewardBirthdate(date) {
  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  ].join(' ');
}

function getApiError(data, fallback, status) {
  const code = data?.error?.code;
  const suffix = code ? `（${code}）` : '';
  if (typeof data?.error === 'string') return `${data.error}${suffix}`;
  if (data?.error?.message) return `${data.error.message}${suffix}`;
  if (status) return `${fallback}（HTTP ${status}）`;
  return fallback;
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

function StewardPanel({ status, data, error }) {
  const config = data?.config;
  const yun = data?.bazi?.yun;
  const daYun = yun?.da_yun?.slice(0, 8) || [];

  return (
    <section className={styles.stewardPanel}>
      <div className={styles.stewardHead}>
        <div>
          <p>Metaphysics Steward</p>
          <h2>服务端增强</h2>
        </div>
        <span>{status === 'ready' ? '已校正' : '校验中'}</span>
      </div>

      {status === 'loading' && (
        <p className={styles.stewardState}>正在校验真太阳时、经度与精确起运。</p>
      )}

      {status === 'error' && (
        <p className={styles.stewardError}>{error}</p>
      )}

      {status === 'ready' && config && (
        <>
          <div className={styles.stewardFacts}>
            <div>
              <span>出生地</span>
              <strong>{config.birthplace.name}</strong>
              <small>东经 {config.birthplace.longitude}°</small>
            </div>
            <div>
              <span>真太阳时</span>
              <strong>{config.trueSolarTime}</strong>
              <small>民用时 {config.inputTime}</small>
            </div>
            <div>
              <span>精确起运</span>
              <strong>{yun?.start_desc || '待校验'}</strong>
              <small>{yun?.start_time || config.lunarDate}</small>
            </div>
          </div>
          <div className={styles.stewardLuck} aria-label="服务端大运">
            {daYun.map((item) => (
              <span key={`${item.index}-${item.pillar}`}>
                {item.pillar}<small>{item.start_age}岁</small>
              </span>
            ))}
          </div>
          <p className={styles.stewardFoot}>这层数据会作为八字 AI 报告的排盘依据，不替换当前浏览器排盘。</p>
        </>
      )}
    </section>
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
  const paramsKey = params.toString();
  const baZi = useMemo(() => chartFromParams(new URLSearchParams(paramsKey)), [paramsKey]);
  const [stewardStatus, setStewardStatus] = useState('idle');
  const [stewardData, setStewardData] = useState(null);
  const [stewardError, setStewardError] = useState('');
  const gender = params.get('gender') === 'female' ? 'female' : 'male';
  const birthplace = params.get('birthplace') || '120.0';

  useEffect(() => {
    if (!baZi) return undefined;

    const controller = new AbortController();
    queueMicrotask(() => {
      if (controller.signal.aborted) return;
      setStewardStatus('loading');
      setStewardData(null);
      setStewardError('');
    });

    fetch('/api/metaphysics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Yijie-Client': 'browser',
      },
      signal: controller.signal,
      body: JSON.stringify({
        mode: 'bazi',
        birthdate: formatStewardBirthdate(baZi.solarDate),
        sex: gender,
        birthplace,
      }),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(getApiError(data, '服务端增强暂不可用', response.status));
        setStewardData(data);
        setStewardStatus('ready');
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setStewardError(err.message || '服务端增强暂不可用');
        setStewardStatus('error');
      });

    return () => controller.abort();
  }, [baZi, birthplace, gender]);

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
      <Seo
        title={`八字排盘 · ${baZi.solarText} · 易解`}
        description={`易解八字排盘结果：${baZi.solarText}，展示四柱、十神、旺衰、纳音、神煞、大运与流年。`}
        path="/bazi/result"
      />
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
        </div>
      </section>

      <StewardPanel status={stewardStatus} data={stewardData} error={stewardError} />

      <section className={styles.pillars}>
        {PILLARS.map(([key, label]) => (
          <PillarCard key={key} label={label} pillar={baZi[key]} isDay={key === 'day'} />
        ))}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2>大运</h2>
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
