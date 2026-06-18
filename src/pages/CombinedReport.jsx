import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import { CREDIT_COSTS } from '../data/creditPlans.js';
import { useAccount } from '../hooks/useAccount.js';
import { buildCombinedReportChart } from '../utils/combinedReport.js';
import { parseLocalDateTime, toDateTimeInputValue } from '../utils/dateTime.js';
import { apiErrorMessage, authHeaders } from '../utils/apiAuth.js';
import styles from './CombinedReport.module.css';

const SCOPE_OPTIONS = [
  '事业工作',
  '财运经营',
  '感情婚姻',
  '学业考试',
  '合作决策',
  '综合',
];

function isValidDateTime(value) {
  return Boolean(value) && !Number.isNaN(new Date(value).getTime());
}

function paragraphKey(text, index) {
  return `${index}-${text.slice(0, 16)}`;
}

function buildChart({ birthDateTime, gender, birthplace, castDateTime, question, scope }) {
  return buildCombinedReportChart({
    birthDate: parseLocalDateTime(birthDateTime),
    gender,
    birthplace,
    castDate: parseLocalDateTime(castDateTime),
    question,
    scope,
  });
}

function Snapshot({ chart }) {
  const bazi = chart.bazi;
  const liuyao = chart.liuyao;
  const pillars = [bazi.pillars.year, bazi.pillars.month, bazi.pillars.day, bazi.pillars.hour];

  return (
    <section className={styles.snapshot} aria-label="排盘摘要">
      <div>
        <h2>八字结构</h2>
        <div className={styles.pillarGrid}>
          {pillars.map((pillar) => (
            <span key={pillar.full}>
              <strong>{pillar.full}</strong>
              <small>{pillar.tenGod}</small>
            </span>
          ))}
        </div>
        <p>日主 {bazi.dayMaster.stem}{bazi.dayMaster.element}，{bazi.luck.rule}，{bazi.luck.startAge}起运。</p>
      </div>

      <div>
        <h2>六爻问事</h2>
        <div className={styles.hexLine}>
          <strong>{liuyao.baseHex.fullName}</strong>
          <span>之</span>
          <strong>{liuyao.changedHex.fullName}</strong>
        </div>
        <p>{liuyao.castText} 起卦，{liuyao.movingLines.length || '无'}个动爻，空亡 {liuyao.voidBranches}。</p>
      </div>
    </section>
  );
}

export default function CombinedReport() {
  const nowValue = useMemo(() => toDateTimeInputValue(new Date()), []);
  const { account, refreshAccount, session } = useAccount();
  const [birthDateTime, setBirthDateTime] = useState('1990-05-08T12:00');
  const [gender, setGender] = useState('male');
  const [birthplace, setBirthplace] = useState('北京');
  const [castDateTime, setCastDateTime] = useState(nowValue);
  const [question, setQuestion] = useState('');
  const [scope, setScope] = useState('事业工作');
  const [style, setStyle] = useState('plain');
  const [depth, setDepth] = useState('brief');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [submittedChart, setSubmittedChart] = useState(null);
  const cost = CREDIT_COSTS.aiReading;

  const previewChart = useMemo(() => {
    if (!isValidDateTime(birthDateTime) || !isValidDateTime(castDateTime)) return null;
    return buildChart({ birthDateTime, gender, birthplace, castDateTime, question, scope });
  }, [birthDateTime, castDateTime, gender, birthplace, question, scope]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setResult('');

    if (!account) {
      setError('请先登录后再生成报告。');
      return;
    }

    if (!question.trim()) {
      setError('请填写所问事项。');
      return;
    }

    if (!previewChart) {
      setError('请检查出生时间与起卦时间。');
      return;
    }

    setStatus('loading');
    setSubmittedChart(previewChart);

    try {
      const response = await fetch('/api/deepseek-reading', {
        method: 'POST',
        headers: authHeaders(session),
        body: JSON.stringify({
          domain: 'combined',
          title: `双术合参：${question.trim().slice(0, 24)}`,
          question: question.trim(),
          style,
          depth,
          chart: previewChart,
        }),
      });
      const data = await apiErrorMessage(response, '双术合参报告生成失败');

      const text = data.text || '';
      setResult(text);
      setStatus('ready');
      await refreshAccount();
    } catch (err) {
      setStatus('error');
      setError(err.message || '双术合参报告生成失败');
    }
  };

  return (
    <div className={styles.page}>
      <Seo
        title="双术合参报告 · 八字与六爻 · 易解"
        description="易解双术合参报告结合八字长期结构与六爻当下问事，生成可保存的 AI 综合参考报告。"
        path="/reports/combined"
      />

      <Link to="/reports" className={styles.back}>← AI 报告</Link>

      <section className={styles.hero}>
        <p className={styles.kicker}>双术合参</p>
        <h1>八字看长期结构，六爻看当下问事</h1>
        <p>首版聚焦八字与六爻，紫微作为后续扩展。</p>
      </section>

      <form className={styles.form} onSubmit={submit}>
        <section className={styles.inputPanel}>
          <div className={styles.sectionHead}>
            <h2>基础信息</h2>
            <span>{cost} 积分/次</span>
          </div>

          <div className={styles.grid}>
            <label>
              <span>出生时间</span>
              <input
                type="datetime-local"
                value={birthDateTime}
                onChange={(event) => setBirthDateTime(event.target.value)}
                required
              />
            </label>

            <label>
              <span>性别</span>
              <select value={gender} onChange={(event) => setGender(event.target.value)}>
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </label>

            <label>
              <span>出生地</span>
              <input
                value={birthplace}
                maxLength={40}
                onChange={(event) => setBirthplace(event.target.value)}
              />
            </label>

            <label>
              <span>起卦时间</span>
              <input
                type="datetime-local"
                value={castDateTime}
                onChange={(event) => setCastDateTime(event.target.value)}
                required
              />
            </label>
          </div>
        </section>

        <section className={styles.inputPanel}>
          <div className={styles.sectionHead}>
            <h2>问事</h2>
          </div>

          <label className={styles.questionField}>
            <span>所问事项</span>
            <textarea
              value={question}
              maxLength={160}
              onChange={(event) => setQuestion(event.target.value)}
              required
            />
          </label>

          <div className={styles.grid}>
            <label>
              <span>占事范围</span>
              <select value={scope} onChange={(event) => setScope(event.target.value)}>
                {SCOPE_OPTIONS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              <span>风格</span>
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
        </section>

        {previewChart && <Snapshot chart={previewChart} />}

        <section className={styles.actions}>
          {!account && (
            <p>
              <Link to="/account">登录</Link> 后可生成并保存报告。
            </p>
          )}
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? '正在生成' : '生成双术合参报告'}
          </button>
        </section>
      </form>

      {status === 'loading' && (
        <section className={styles.resultPanel} role="status" aria-live="polite" aria-busy="true">
          <h2>正在生成报告</h2>
          <p>正在核对八字结构、六爻动变与问事范围。</p>
        </section>
      )}

      {result && (
        <section className={styles.resultPanel}>
          <div className={styles.sectionHead}>
            <h2>合参报告</h2>
            <Link to="/reports">查看历史</Link>
          </div>
          {submittedChart && <Snapshot chart={submittedChart} />}
          <article className={styles.resultText}>
            {result.split(/\n{2,}/).map((paragraph, index) => (
              <p key={paragraphKey(paragraph, index)}>{paragraph}</p>
            ))}
          </article>
        </section>
      )}
    </div>
  );
}
