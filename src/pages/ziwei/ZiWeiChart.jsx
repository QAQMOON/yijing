import Seo from '../../components/Seo.jsx';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { calculateZiWei, paramsToZiWeiOptions } from '../../utils/ziweiCalc.js';
import { CREDIT_COSTS } from '../../data/creditPlans.js';
import { useAccount } from '../../hooks/useAccount.js';
import { apiErrorMessage, authHeaders } from '../../utils/apiAuth.js';
import styles from './ZiWeiChart.module.css';

const MUTAGEN_LABELS = ['禄', '权', '科', '忌'];
const AI_FOCUS_OPTIONS = [
  { value: 'overall', label: '综合命盘' },
  { value: 'career', label: '事业财帛' },
  { value: 'relationship', label: '感情婚姻' },
  { value: 'family', label: '家庭田宅' },
  { value: 'travel', label: '迁移交友' },
  { value: 'luck', label: '大限流年' },
  { value: 'wellbeing', label: '健康习惯' },
];

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
  const decadalRange = palace.decadal?.range?.join('至') || '';
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
      <p className={styles.systemTitle}>紫微斗数</p>
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

function compactStar(star) {
  return {
    name: star.name,
    text: star.text,
    type: star.type,
    scope: star.scope,
    brightness: star.brightness,
    mutagen: star.mutagen,
    isMajor: star.isMajor,
  };
}

function compactPalace(palace) {
  if (!palace) return null;
  return {
    name: palace.name,
    stemBranch: palace.stemBranch,
    earthlyBranch: palace.earthlyBranch,
    isBodyPalace: palace.isBodyPalace,
    isOriginalPalace: palace.isOriginalPalace,
    majorStars: palace.majorStars.map(compactStar),
    minorStars: palace.minorStars.map(compactStar),
    adjectiveStars: palace.adjectiveStars.slice(0, 12).map(compactStar),
    dynamicStars: palace.dynamicStars.map(compactStar),
    changsheng12: palace.changsheng12,
    boshi12: palace.boshi12,
    jiangqian12: palace.jiangqian12,
    suiqian12: palace.suiqian12,
    decadal: palace.decadal,
    ages: palace.ages?.slice(0, 8) || [],
  };
}

function compactHoroscope(item) {
  if (!item) return null;
  return {
    heavenlyStem: item.heavenlyStem,
    earthlyBranch: item.earthlyBranch,
    mutagen: item.mutagen,
    index: item.index,
    nominalAge: item.nominalAge,
    age: item.age,
  };
}

function buildZiWeiPayload(chart, focusLabel) {
  const lifePalace = chart.palaces.find((palace) => palace.name === '命宫');
  const bodyPalace = chart.palaces.find((palace) => palace.isBodyPalace);
  return {
    focus: focusLabel,
    input: chart.input,
    calendarText: chart.calendarText,
    dateText: chart.dateText,
    gender: chart.gender,
    plateTypeText: chart.plateTypeText,
    solarDate: chart.solarDate,
    lunarDate: chart.lunarDate,
    chineseDate: chart.chineseDate,
    time: chart.time,
    timeRange: chart.timeRange,
    zodiac: chart.zodiac,
    soul: chart.soul,
    body: chart.body,
    fiveElementsClass: chart.fiveElementsClass,
    lifePalace: compactPalace(lifePalace),
    bodyPalace: compactPalace(bodyPalace),
    horoscope: {
      decadal: compactHoroscope(chart.horoscope.decadal),
      age: compactHoroscope(chart.horoscope.age),
      yearly: compactHoroscope(chart.horoscope.yearly),
      monthly: compactHoroscope(chart.horoscope.monthly),
    },
    palaces: chart.palaces.map(compactPalace),
  };
}

function errorMessage(payload, fallback) {
  if (typeof payload?.error === 'string') return payload.error;
  if (payload?.error?.message) return payload.error.message;
  return fallback;
}

function ZiWeiAiReading({ chart }) {
  const { account, refreshAccount, session } = useAccount();
  const [focus, setFocus] = useState('overall');
  const [style, setStyle] = useState('plain');
  const [depth, setDepth] = useState('brief');
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const cost = CREDIT_COSTS.aiReading;
  const focusLabel = AI_FOCUS_OPTIONS.find((item) => item.value === focus)?.label || '综合命盘';
  const payload = useMemo(() => buildZiWeiPayload(chart, focusLabel), [chart, focusLabel]);
  const title = `${chart.solarDate} ${chart.gender}命紫微报告`;

  const generate = async () => {
    setError('');
    setStatus('loading');
    try {
      const response = await fetch('/api/deepseek-reading', {
        method: 'POST',
        headers: authHeaders(session),
        body: JSON.stringify({
          domain: 'ziwei',
          title,
          chart: payload,
          question: focusLabel,
          style,
          depth,
        }),
      });
      const data = await apiErrorMessage(response, errorMessage({}, 'AI 解读失败'));
      setResult(data.text);
      await refreshAccount();
      setStatus('ready');
    } catch (requestError) {
      setError(requestError.message || 'AI 解读失败');
      setStatus('error');
    }
  };

  return (
    <section className={styles.aiReadingSection}>
      <div className={styles.aiReadingHead}>
        <div>
          <h2>紫微 AI 深度解读</h2>
          <p>结合命身宫、三方四正、星曜四化、大限流年生成参考报告。</p>
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
          <button className={styles.aiButton} type="button" disabled={status === 'loading'} onClick={generate}>
            {status === 'loading' ? '正在生成' : '生成紫微 AI 解读'}
          </button>
        )}

        {status === 'loading' && (
          <div className={styles.aiThinking} role="status" aria-live="polite" aria-busy="true">
            <div className={styles.aiThinkingOrb} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className={styles.aiThinkingContent}>
              <strong>正在推演紫微命盘，请稍候</strong>
              <p>正在核对命身宫、三方四正、星曜四化并组织解读报告。</p>
              <div className={styles.aiThinkingSteps} aria-hidden="true">
                <span>命身宫</span>
                <span>三方四正</span>
                <span>四化</span>
                <span>建议</span>
              </div>
            </div>
          </div>
        )}

        <div className={styles.aiBasis}>
          <strong>解读依据会随请求传入</strong>
          <span>命宫身宫</span>
          <span>十二宫星曜</span>
          <span>四化飞布</span>
          <span>大限流年</span>
        </div>

        {status === 'error' && <p className={styles.aiError}>{error}</p>}
        {status === 'ready' && result && (
          <article className={styles.aiResult}>
            {result.split(/\n{2,}/).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </article>
        )}
      </div>
    </section>
  );
}

export default function ZiWeiChart() {
  const [params] = useSearchParams();
  const chart = calculateZiWei(paramsToZiWeiOptions(params));

  return (
    <div className={styles.page}>
      <Seo
        title="紫微斗数排盘结果 · 十二宫命盘 · 易解"
        description="查看易解紫微斗数命盘结果，包括命身十二宫、主星辅星、四化、大限、小限、流年、流月与命身主信息。"
        path="/ziwei/chart"
      />
      <Link to="/ziwei" className={styles.back}>← 紫微斗数</Link>
      <h1 className={styles.title}>紫微斗数排盘</h1>
      <p className={styles.subtitle}>{chart.calendarText} {chart.dateText} · {chart.gender}命 · {chart.plateTypeText}</p>
      <div className={styles.divider} />

      <div className={styles.frame}>
        <div className={styles.frameTitle}>紫微斗数</div>
        <div className={styles.chartGrid}>
          {chart.palaces.map((palace) => <PalaceCell key={palace.index} palace={palace} />)}
          <CenterPanel chart={chart} />
        </div>
      </div>

      <ZiWeiAiReading chart={chart} />
    </div>
  );
}
