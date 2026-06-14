import { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Seo from '../../components/Seo.jsx';
import { CREDIT_COSTS } from '../../data/creditPlans.js';
import { useAiReports } from '../../hooks/useAiReports.js';
import { useAccount } from '../../hooks/useAccount.js';
import { calculateBaZiFromDate, calculateBaZiFromLunar } from '../../utils/baziCalc.js';
import { dateFromSearchParams } from '../../utils/dateTime.js';
import styles from './BaZiChart.module.css';

const PILLARS = [
  ['year', '年柱'],
  ['month', '月柱'],
  ['day', '日柱'],
  ['hour', '时柱'],
];
const AI_FOCUS_OPTIONS = [
  { value: 'overall', label: '综合命局' },
  { value: 'career', label: '事业财运' },
  { value: 'relationship', label: '感情家庭' },
  { value: 'luck', label: '大运流年' },
  { value: 'wellbeing', label: '健康习惯' },
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
  if (typeof data?.error === 'string') return data.error;
  if (data?.error?.message) return data.error.message;
  if (status) return fallback;
  return fallback;
}

function compactPillar(pillar) {
  return {
    full: pillar.full,
    stem: pillar.stem,
    branch: pillar.branch,
    tenGod: pillar.tenGod,
    fiveElementText: pillar.fiveElementText,
    hiddenText: pillar.hiddenText,
    prosperity: pillar.prosperity,
    nayin: pillar.nayin,
  };
}

function compactLuck(item) {
  return {
    startAge: item.startAge,
    full: item.full,
    tenGod: item.tenGod,
    prosperity: item.prosperity,
    nayin: item.nayin,
  };
}

function buildUpcomingAnnualLuck(annualLuck) {
  const currentYear = new Date().getFullYear();
  const firstIndex = annualLuck.findIndex((item) => item.year >= currentYear);
  const start = firstIndex >= 0 ? firstIndex : Math.max(0, annualLuck.length - 8);
  return annualLuck.slice(start, start + 8).map((item) => ({
    year: item.year,
    virtualAge: item.virtualAge,
    full: item.full,
    tenGod: item.tenGod,
    prosperity: item.prosperity,
    nayin: item.nayin,
  }));
}

function buildBaZiAiPayload({ baZi, stewardData, birthplace, focusLabel }) {
  const config = stewardData?.config;
  const yun = stewardData?.bazi?.yun;

  return {
    focus: focusLabel,
    birth: {
      solarText: baZi.solarText,
      lunarText: baZi.lunarText,
      birthplace,
    },
    gender: baZi.genderText,
    calendar: {
      previousTermText: baZi.previousTermText,
      nextTermText: baZi.nextTermText,
      luckRuleText: baZi.luckRuleText,
      startAgeText: baZi.startAgeText,
      transitText: baZi.transitText,
      voidBranches: baZi.voidBranches,
    },
    calibration: config ? {
      inputTime: config.inputTime,
      trueSolarTime: config.trueSolarTime,
      birthplace: config.birthplace,
      preciseStart: yun?.start_desc || '',
      preciseStartTime: yun?.start_time || '',
      daYun: (yun?.da_yun || []).slice(0, 8).map((item) => ({
        pillar: item.pillar,
        startAge: item.start_age,
      })),
    } : null,
    dayMaster: baZi.dayMaster,
    pillars: {
      year: compactPillar(baZi.year),
      month: compactPillar(baZi.month),
      day: compactPillar(baZi.day),
      hour: compactPillar(baZi.hour),
    },
    luck: {
      rule: baZi.luckRuleText,
      startAge: baZi.startAgeText,
      transit: baZi.transitText,
      daYun: baZi.luckPillars.map(compactLuck),
    },
    shenSha: baZi.shenShaRows.map((row) => ({
      label: row.label,
      base: row.base,
      items: row.items,
    })),
    upcomingAnnualLuck: buildUpcomingAnnualLuck(baZi.annualLuck),
  };
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
  const statusLabel = {
    ready: '已完成',
    error: '暂不可用',
    idle: '校准中',
    loading: '校准中',
  }[status] || '校准中';

  return (
    <section className={styles.stewardPanel}>
      <div className={styles.stewardHead}>
        <div>
          <p>出生地校时</p>
          <h2>真太阳时与起运校准</h2>
        </div>
        <span>{statusLabel}</span>
      </div>

      {status === 'loading' && (
        <p className={styles.stewardState}>正在校准出生地、真太阳时与精确起运。</p>
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
          <div className={styles.stewardLuck} aria-label="校准后大运">
            {daYun.map((item) => (
              <span key={`${item.index}-${item.pillar}`}>
                {item.pillar}<small>{item.start_age}岁</small>
              </span>
            ))}
          </div>
          <p className={styles.stewardFoot}>校准结果用于核对时辰、大运和后续 AI 报告依据。</p>
        </>
      )}
    </section>
  );
}

function BaZiAiReading({ baZi, stewardData, birthplace }) {
  const { account, refundCredits, spendCredits } = useAccount();
  const { saveReport } = useAiReports();
  const [focus, setFocus] = useState('overall');
  const [style, setStyle] = useState('plain');
  const [depth, setDepth] = useState('brief');
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const cost = CREDIT_COSTS.aiReading;
  const focusLabel = AI_FOCUS_OPTIONS.find((item) => item.value === focus)?.label || '综合命局';
  const payload = useMemo(() => buildBaZiAiPayload({
    baZi,
    stewardData,
    birthplace,
    focusLabel,
  }), [baZi, birthplace, focusLabel, stewardData]);
  const reportTitle = `${payload.pillars.year.full}${payload.pillars.month.full}${payload.pillars.day.full}${payload.pillars.hour.full} 八字报告`;

  const requestReading = async () => {
    let charged = false;
    setError('');
    setStatus('loading');

    try {
      spendCredits(cost, '八字 AI 深度解读');
      charged = true;

      const response = await fetch('/api/deepseek-reading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Yijie-Client': 'browser',
          ...(account?.id ? { 'X-Yijie-Account-Id': account.id } : {}),
        },
        body: JSON.stringify({
          domain: 'bazi',
          chart: payload,
          question: focusLabel,
          style,
          depth,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(getApiError(data, 'AI 解读失败', response.status));
      setResult(data.text);
      saveReport({
        domain: 'bazi',
        domainLabel: '八字 AI 解读',
        title: reportTitle,
        focusLabel,
        style,
        depth,
        provider: data.provider,
        model: data.model,
        cost: data.cost || cost,
        text: data.text,
        chart: payload,
      });
      setStatus('ready');
    } catch (err) {
      if (charged) refundCredits(cost, 'AI 解读失败退回');
      setError(err.message || 'AI 解读失败');
      setStatus('error');
    }
  };

  return (
    <section className={styles.aiReadingSection}>
      <div className={styles.aiReadingHead}>
        <div>
          <h2>八字 AI 深度解读</h2>
          <p>结合四柱、十神、旺衰、大运流年与真太阳时校准生成参考报告。</p>
        </div>
        <span className={styles.costBadge}>{cost} 积分/次</span>
      </div>

      <div className={styles.aiReadingCard}>
        <div className={styles.aiControls}>
          <label>
            <span>解读重点</span>
            <select value={focus} onChange={(event) => setFocus(event.target.value)}>
              {AI_FOCUS_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>解读风格</span>
            <select value={style} onChange={(event) => setStyle(event.target.value)}>
              <option value="plain">通俗版</option>
              <option value="scholar">严谨版</option>
            </select>
          </label>
          <label>
            <span>篇幅</span>
            <select value={depth} onChange={(event) => setDepth(event.target.value)}>
              <option value="brief">精简</option>
              <option value="full">完整</option>
            </select>
          </label>
        </div>

        {!account && (
          <div className={styles.aiNotice}>
            <p>登录后可使用 AI 解读，新账户赠送试用积分。</p>
            <Link to="/account" className={styles.aiInlineLink}>去登录</Link>
          </div>
        )}

        {account && account.credits < cost && (
          <div className={styles.aiNotice}>
            <p>当前积分不足，需要 {cost} 积分。</p>
            <Link to="/pricing" className={styles.aiInlineLink}>购买积分</Link>
          </div>
        )}

        {account && account.credits >= cost && (
          <button
            className={styles.aiButton}
            type="button"
            disabled={status === 'loading'}
            onClick={requestReading}
          >
            {status === 'loading' ? '正在生成' : '生成八字 AI 解读'}
          </button>
        )}

        <div className={styles.aiBasis}>
          <strong>报告依据会随请求传入</strong>
          <span>四柱十神</span>
          <span>旺衰纳音</span>
          <span>神煞大运</span>
          <span>{stewardData?.config ? '真太阳时校准' : '基础排盘'}</span>
        </div>

        {status === 'error' && (
          <p className={styles.aiError}>{error}</p>
        )}

        {status === 'ready' && result && (
          <article className={styles.aiResult}>
            {result.split(/\n{2,}/).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>
        )}
      </div>
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
        if (!response.ok) throw new Error(getApiError(data, '校时数据暂不可用', response.status));
        setStewardData(data);
        setStewardStatus('ready');
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setStewardError(err.message || '校时数据暂不可用');
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

      <BaZiAiReading baZi={baZi} stewardData={stewardData} birthplace={birthplace} />

    </div>
  );
}
