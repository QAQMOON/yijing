import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import Seo from '../../components/Seo.jsx';
import SaveReading from '../../components/SaveReading.jsx';
import { CREDIT_COSTS } from '../../data/creditPlans.js';
import { useAccount } from '../../hooks/useAccount.js';
import { useReadingHistory } from '../../hooks/useReadingHistory.js';
import { HEXAGRAMS } from '../../data/hexagrams.js';
import { ZHOUYI_TEXT } from '../../data/zhouyiText.js';
import { dateFromSearchParams, formatDateTimeCN } from '../../utils/dateTime.js';
import HexagramDisplay from '../../components/HexagramDisplay.jsx';
import {
  formatLunarDate,
  formatSolarTerm,
  buildNajiaRows,
  getAdjacentSolarTerms,
  getCommonShenSha,
  getHexagramFullName,
  getHexagramPalace,
  getPillarsForDate,
  getSixGods,
  getVoidBranches,
} from '../../utils/liuyaoMeta.js';
import styles from './ReadingResult.module.css';

const LINE_NAMES = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
const LINE_VALUE_LABELS = {
  6: '老阴',
  7: '少阳',
  8: '少阴',
  9: '老阳',
};
const SOURCE_LABELS = {
  time: '电脑时间起卦',
  random: '随机起卦',
  manual: '手动摇卦',
};
const LINE_POSITIONS = ['初', '二', '三', '四', '五', '上'];
const READING_SECTIONS = ['总体', '事业', '经商', '求名', '出外', '婚恋', '决策'];

function normalizeLines(value, fallback) {
  if (!value || !/^[01]{6}$/.test(value)) return fallback;
  return value.split('').map(Number);
}

function normalizeValues(value, lines) {
  const parsed = (value || '')
    .split(',')
    .map((item) => Number(item))
    .filter((item) => [6, 7, 8, 9].includes(item));

  if (parsed.length === 6) return parsed;
  return lines.map((line) => (line === 1 ? 7 : 8));
}

function findHexagramByLines(lines, fallback) {
  return HEXAGRAMS.find((item) => item.lines.join('') === lines.join('')) || fallback;
}

function zhouyiFor(hex) {
  return ZHOUYI_TEXT[hex.id] || {};
}

function getLineXiang(hex, zhouyi, index) {
  return zhouyi.yaoImage?.[index] || hex.yaoImage?.[index] || '爻象原文待补录。';
}

function getLinePosition(line, index) {
  const yinYang = line === 1 ? '九' : '六';
  if (index === 0) return `初${yinYang}`;
  if (index === 5) return `上${yinYang}`;
  return `${yinYang}${LINE_POSITIONS[index]}`;
}

function endWithPeriod(text) {
  if (!text) return '爻辞原文待补录。';
  return /[。！？；]$/.test(text) ? text : `${text}。`;
}

function parseExternalSections(data) {
  if (!data || typeof data !== 'object') return {};
  return READING_SECTIONS.reduce((acc, name) => {
    const value = data[name];
    acc[name] = typeof value === 'string' && value.trim() ? value.trim() : '';
    return acc;
  }, {});
}

function Badge({ children, tone = 'blue' }) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}

function ZhouyiBlock({ hexagram, title }) {
  const zhouyi = zhouyiFor(hexagram);
  const fullName = getHexagramFullName(hexagram);

  return (
    <section className={styles.textSection}>
      <h2>{title}</h2>
      <article className={styles.classicBlock}>
        <h3>《周易》：{fullName} {hexagram.upperTrigram}上{hexagram.lowerTrigram}下</h3>
        <p>{hexagram.judgment}</p>
        <p><strong>彖曰：</strong>{zhouyi.tuan || '彖传原文待补录。'}</p>
        <p><strong>象曰：</strong>{zhouyi.image || hexagram.image || '象传原文待补录。'}</p>
      </article>
    </section>
  );
}

function NajiaTable({ rows }) {
  return (
    <div className={styles.najiaCard}>
      <div className={styles.najiaTitle}>纳甲排盘</div>
      <table className={styles.najiaTable}>
        <thead>
          <tr>
            <th>六神</th>
            <th>伏神</th>
            <th>六亲</th>
            <th>爻位</th>
            <th>本卦爻线</th>
            <th>世应</th>
            <th>变卦爻线</th>
            <th>变卦六亲</th>
          </tr>
        </thead>
        <tbody>
          {[...rows].reverse().map((row) => (
            <tr key={row.index} className={row.isMoving ? styles.najiaMoving : ''}>
              <td>{row.sixGod}</td>
              <td>{row.hiddenSpirit || '无'}</td>
              <td>{row.relative}</td>
              <td>{LINE_NAMES[row.index]}</td>
              <td className={styles.lineSymbol}>{row.baseLineText}</td>
              <td>{row.mark && <Badge>{row.mark}</Badge>}</td>
              <td className={styles.lineSymbol}>{row.changedLineText}</td>
              <td>{row.changedRelative}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExternalReading({ payload }) {
  const [status, setStatus] = useState('loading');
  const [sections, setSections] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadReading() {
      setStatus('loading');
      setError('');
      try {
        const response = await fetch('/api/liuyao-reading', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || '电脑解卦抓取失败');
        setSections(parseExternalSections(data.sections));
        setStatus('ready');
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message || '电脑解卦抓取失败');
        setStatus('error');
      }
    }

    loadReading();
    return () => controller.abort();
  }, [payload]);

  return (
    <section className={styles.aiSection}>
      <h2>电脑解卦</h2>
      <div className={styles.aiCard}>
        {status === 'loading' && <p className={styles.aiState}>正在抓取电脑解卦...</p>}
        {status === 'error' && <p className={styles.aiState}>{error || '电脑解卦抓取失败'}</p>}
        {status !== 'error' && READING_SECTIONS.map((name, index) => (
          <details key={name} className={styles.aiDetail} open={index === 0}>
            <summary>{name}</summary>
            <p>
              {sections[name]
                || (status === 'ready' ? '外站电脑解卦未返回本项内容。' : '等待抓取。')}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

function DeepSeekReading({ payload, question }) {
  const { account, refundCredits, spendCredits } = useAccount();
  const [style, setStyle] = useState('plain');
  const [depth, setDepth] = useState('brief');
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const cost = CREDIT_COSTS.aiReading;

  const requestReading = async () => {
    let charged = false;
    setError('');
    setStatus('loading');

    try {
      spendCredits(cost, '六爻 AI 深度解读');
      charged = true;

      const response = await fetch('/api/deepseek-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: 'liuyao',
          chart: payload,
          question,
          style,
          depth,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'AI 解读失败');
      setResult(data.text);
      setStatus('ready');
    } catch (err) {
      if (charged) refundCredits(cost, 'AI 解读失败退回');
      setError(err.message || 'AI 解读失败');
      setStatus('error');
    }
  };

  return (
    <section className={styles.deepSeekSection}>
      <div className={styles.deepSeekHead}>
        <div>
          <h2>AI 深度解读</h2>
          <p>调用 DeepSeek 结合卦象、动爻、干支、纳甲生成参考解读。</p>
        </div>
        <span className={styles.costBadge}>{cost} 积分/次</span>
      </div>

      <div className={styles.deepSeekCard}>
        <div className={styles.aiControls}>
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
            <p>登录后可使用 AI 解读，新账户赠送体验积分。</p>
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
            {status === 'loading' ? '正在生成' : '生成 AI 解读'}
          </button>
        )}

        {status === 'error' && (
          <p className={styles.aiError}>{error}</p>
        )}

        {status === 'ready' && result && (
          <article className={styles.deepSeekResult}>
            {result.split(/\n{2,}/).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>
        )}
      </div>
    </section>
  );
}

export default function ReadingResult() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { saveReading } = useReadingHistory();

  const reading = useMemo(() => {
    const routeHex = HEXAGRAMS.find((item) => item.id === Number(id));
    if (!routeHex) return null;

    const date = dateFromSearchParams(params);
    const lines = normalizeLines(params.get('lines'), routeHex.lines);
    const values = normalizeValues(params.get('values'), lines);
    const baseHex = findHexagramByLines(lines, routeHex);
    const changedLines = lines.map((line, index) => ([6, 9].includes(values[index]) ? 1 - line : line));
    const changedHex = findHexagramByLines(changedLines, baseHex);
    const movingIndexes = values
      .map((value, index) => ([6, 9].includes(value) ? index : null))
      .filter((index) => index !== null);
    const pillars = getPillarsForDate(date);
    const solarTerms = getAdjacentSolarTerms(date);
    const voidBranches = getVoidBranches(pillars.day);
    const sixGods = getSixGods(pillars.day.stem);
    const najiaRows = buildNajiaRows({ baseHex, changedHex, lines, changedLines, values, sixGods });
    const shensha = [
      ...getCommonShenSha(pillars),
    ].filter((item) => item.value);

    return {
      baseHex,
      changedHex,
      lines,
      values,
      changedLines,
      movingIndexes,
      date,
      pillars,
      solarTerms,
      shensha,
      voidBranches,
      najiaRows,
      source: params.get('source') || '',
      meta: {
        gender: params.get('gender') || '',
        question: params.get('question') || '',
        scope: params.get('scope') || '',
        calendar: params.get('calendar') || '',
        birthYear: params.get('birthYear') || '',
      },
      sixGods,
    };
  }, [id, params]);

  if (!reading) {
    return (
      <div className={styles.page}>
        <p className={styles.notFound}>未找到卦象，请先起卦</p>
        <Link to="/liuyao/cast" className={styles.link}>← 去摇卦</Link>
      </div>
    );
  }

  const {
    baseHex,
    changedHex,
    changedLines,
    date,
    lines,
    movingIndexes,
    najiaRows,
    pillars,
    shensha,
    sixGods,
    solarTerms,
    source,
    meta,
    values,
    voidBranches,
  } = reading;
  const baseZhouyi = zhouyiFor(baseHex);
  const baseFullName = getHexagramFullName(baseHex);
  const changedFullName = getHexagramFullName(changedHex);
  const shenshaText = shensha.map((item) => `${item.name}：${item.value}`).join(' / ');
  const readingPayload = {
    baseHex: {
      id: baseHex.id,
      name: baseFullName,
      meaning: baseHex.meaning,
      judgment: baseHex.judgment,
    },
    changedHex: {
      id: changedHex.id,
      name: changedFullName,
      meaning: changedHex.meaning,
      judgment: changedHex.judgment,
    },
    meta,
    palace: getHexagramPalace(baseHex.id),
    movingLines: movingIndexes.map((index) => LINE_NAMES[index]),
    values,
    lines,
    source,
    date: formatDateTimeCN(date),
    castAt: {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
    },
    lunarDate: formatLunarDate(date),
    pillars: {
      year: pillars.year.full,
      month: pillars.month.full,
      day: pillars.day.full,
      hour: pillars.hour.full,
    },
    voidBranches,
    najiaRows,
  };

  return (
    <div className={styles.page}>
      <Seo
        title={`六爻排盘 · ${baseFullName}之${changedFullName} · 易解`}
        description={`易解六爻排盘结果：本卦${baseFullName}，变卦${changedFullName}，展示干支、六神、纳甲、动爻、卦辞与电脑解卦。`}
        path={`/liuyao/reading/${baseHex.id}`}
      />
      <p className={styles.breadcrumb}>← <Link to="/liuyao/cast">重新起卦</Link></p>

      <section className={styles.topInfoBox} aria-label="排盘基础信息">
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>起卦方式</span>
          <strong>{SOURCE_LABELS[source] || '六爻起卦'}</strong>
        </div>
        {(meta.question || meta.scope || meta.gender || meta.birthYear) && (
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>问事信息</span>
            {meta.question && <span>占事：{meta.question}</span>}
            {meta.scope && <span>范围：{meta.scope}</span>}
            {(meta.gender || meta.birthYear) && <span>本人：{meta.birthYear && `${meta.birthYear}年生`}{meta.birthYear && meta.gender ? ' / ' : ''}{meta.gender}</span>}
          </div>
        )}
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>历法时间</span>
          <span>公历：{formatDateTimeCN(date)}</span>
          <span>农历：{formatLunarDate(date)}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>节气</span>
          <span>前一节气：{formatSolarTerm(solarTerms.previous)}</span>
          <span>后一节气：{formatSolarTerm(solarTerms.next)}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>干支与神煞</span>
          <span>年 {pillars.year.full} / 月 {pillars.month.full} / 日 {pillars.day.full} / 时 {pillars.hour.full}</span>
          <span className={styles.infoInline}>月建 {pillars.month.branch} / 日建 {pillars.day.branch} / 日空 <Badge tone="red">{voidBranches}</Badge></span>
          <span>{shenshaText}</span>
        </div>
      </section>

      <section className={styles.hero}>
        <div className={styles.paipanFrame}>
          <div className={styles.hexPair}>
            <div className={styles.hexCard}>
              <div className={styles.hexMeta}>
                <div className={styles.hexTitle}>
                  <span>本卦 </span>
                  <strong>{baseFullName}</strong>
                </div>
                <p>第{baseHex.id}卦·{baseHex.meaning}</p>
              </div>
              <div className={styles.hexLines}>
                <HexagramDisplay lines={lines} size="xlarge" />
              </div>
            </div>
            <div className={styles.hexCard}>
              <div className={styles.hexMeta}>
                <div className={styles.hexTitle}>
                  <span>变卦 </span>
                  <strong>{changedFullName}</strong>
                </div>
                <p>第{changedHex.id}卦·{changedHex.meaning}</p>
              </div>
              <div className={styles.hexLines}>
                <HexagramDisplay lines={changedLines} size="xlarge" />
              </div>
            </div>
          </div>
          <NajiaTable rows={najiaRows} />
        </div>
      </section>

      <ZhouyiBlock hexagram={baseHex} title="本卦卦辞与彖象" />

      <section className={styles.lineSection}>
        <div className={styles.lineList}>
          {lines.map((line, index) => {
            const value = values[index];
            const isMoving = [6, 9].includes(value);
            const linePosition = getLinePosition(line, index);
            return (
              <article key={`${LINE_NAMES[index]}-${value}-${index}`} className={`${styles.lineItem} ${isMoving ? styles.movingLine : ''}`}>
                <div className={styles.lineHead}>
                  <span className={styles.lineName}>{linePosition}</span>
                  <span className={styles.sixGod}>{sixGods[index]}</span>
                  <span>{LINE_VALUE_LABELS[value]} · {line === 1 ? '阳爻' : '阴爻'}</span>
                </div>
                <p>{linePosition}：{endWithPeriod(baseHex.yaoText[index])}象曰：{getLineXiang(baseHex, baseZhouyi, index)}</p>
              </article>
            );
          })}
        </div>
      </section>

      <div className={styles.actions}>
        <Link to={`/liuyao/hexagram/${baseHex.id}`} className={styles.detailLink}>查看本卦解读 →</Link>
        <Link to="/liuyao/cast" className={styles.retryLink}>重新起卦</Link>
      </div>

      <ExternalReading payload={readingPayload} />

      <DeepSeekReading payload={readingPayload} question={meta.question} />

      <SaveReading
        onSave={(data) => saveReading({
          type: 'coin',
          hexagramId: baseHex.id,
          changedHexagramId: changedHex.id,
          lines,
          values,
          castAt: date.toISOString(),
          source,
          palace: getHexagramPalace(baseHex.id),
          pillars: {
            year: pillars.year.full,
            month: pillars.month.full,
            day: pillars.day.full,
            hour: pillars.hour.full,
          },
          ...data,
        })}
        hexagram={baseHex}
      />
    </div>
  );
}
