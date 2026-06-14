import { useMemo, useState } from 'react';
import Seo from '../../components/Seo.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { Lunar } from 'lunar-javascript';
import { performReading, performTimeReading, linesToHexagramId } from '../../utils/coinCast.js';
import styles from './LiuYaoHome.module.css';

const SCOPE_OPTIONS = [
  '选择范围',
  '预测比赛',
  '预测天气',
  '预测财运',
  '预测合作',
  '预测出行',
  '预测行人',
  '预测失物',
  '预测学业',
  '预测事业',
  '预测婚姻',
];

const CAST_METHODS = [
  { value: 'random', label: '电脑自动', enabled: true },
  { value: 'time', label: '时间起卦', enabled: true },
  { value: 'manual', label: '手动摇卦', enabled: true },
  { value: 'number', label: '报数起卦', enabled: false },
  { value: 'name', label: '姓名（汉字）起卦', enabled: false },
];

const CALENDAR_OPTIONS = [
  { value: 'solar', label: '按公历时间起卦', enabled: true },
  { value: 'lunar', label: '按农历时间起卦', enabled: true },
];

function currentParts() {
  const now = new Date();
  return {
    birthYear: now.getFullYear(),
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
  };
}

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function readingMetaFromForm(form) {
  return {
    gender: form.gender,
    question: form.question.trim(),
    scope: form.scope === '选择范围' ? '' : form.scope,
    calendar: form.calendar,
    birthYear: String(form.birthYear),
  };
}

function appendParams(params, values) {
  Object.entries(values).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
}

function dateFromForm(form) {
  const year = Number(form.year);
  const month = Number(form.month);
  const day = Number(form.day);
  const hour = Number(form.hour);
  const minute = Number(form.minute);

  if (form.calendar === 'lunar') {
    const solar = Lunar.fromYmdHms(year, month, day, hour, minute, 0).getSolar();
    return new Date(
      solar.getYear(),
      solar.getMonth() - 1,
      solar.getDay(),
      solar.getHour(),
      solar.getMinute(),
      solar.getSecond(),
    );
  }

  return new Date(year, month - 1, day, hour, minute);
}

function buildReadingParams(reading, date, source, extra) {
  const id = linesToHexagramId(reading.lines);
  const params = new URLSearchParams({
    lines: reading.lines.join(''),
    values: reading.details.map((item) => item.value).join(','),
    dt: [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-') + `T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
    source,
  });

  appendParams(params, extra);

  return { id, params };
}

export default function LiuYaoHome() {
  const navigate = useNavigate();
  const defaults = useMemo(() => currentParts(), []);
  const [form, setForm] = useState({
    birthYear: defaults.birthYear,
    gender: '男',
    question: '',
    scope: '选择范围',
    year: defaults.year,
    month: defaults.month,
    day: defaults.day,
    hour: defaults.hour,
    minute: defaults.minute,
    method: 'time',
    calendar: 'solar',
  });
  const [notice, setNotice] = useState('');

  const update = (field, value) => {
    setNotice('');
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const reset = () => {
    const next = currentParts();
    setNotice('');
    setForm({
      birthYear: next.birthYear,
      gender: '男',
      question: '',
      scope: '选择范围',
      year: next.year,
      month: next.month,
      day: next.day,
      hour: next.hour,
      minute: next.minute,
      method: 'time',
      calendar: 'solar',
    });
  };

  const submit = (event) => {
    event.preventDefault();
    const method = CAST_METHODS.find((item) => item.value === form.method);

    if (!method?.enabled) {
      setNotice(`${method?.label || '此方式'}即将开放，先用电脑自动、时间起卦或手动摇卦。`);
      return;
    }

    const meta = readingMetaFromForm(form);

    if (form.method === 'manual') {
      const params = new URLSearchParams({ mode: 'manual' });
      appendParams(params, meta);
      navigate(`/liuyao/cast?${params.toString()}`);
      return;
    }

    const date = dateFromForm(form);
    const reading = form.method === 'time' ? performTimeReading(date) : performReading();
    const { id, params } = buildReadingParams(reading, date, form.method, meta);

    navigate(`/liuyao/reading/${id}?${params.toString()}`);
  };

  return (
    <div className={styles.page}>
      <Seo
        title="六爻起卦排盘 · 纳甲与变卦 · 易解"
        description="易解六爻工具支持电脑自动、时间起卦和手动摇卦，可填写占事范围，生成本卦、变卦、干支、六神与纳甲信息。"
        path="/liuyao"
      />
      <section className={styles.hero}>
        <h1 className={styles.title}>六 爻</h1>
        <p className={styles.subtitle}>以三钱摇卦，观六爻动变</p>
        <div className={styles.divider} />
        <p className={styles.desc}>
          六爻者，八卦相重而为六十四卦，每卦六爻，共三百八十四爻。
          可按电脑自动、时间起卦或手动摇卦取象，问事时以一念初动为准。
        </p>
      </section>

      <form className={styles.castPanel} onSubmit={submit}>
        <div className={styles.cornerTop} />
        <div className={styles.panelTitle}>六爻起卦信息</div>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>出生年</span>
            <select value={form.birthYear} onChange={(event) => update('birthYear', event.target.value)}>
              {range(defaults.year - 90, defaults.year).reverse().map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>性别</span>
            <select value={form.gender} onChange={(event) => update('gender', event.target.value)}>
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </label>

          <label className={`${styles.field} ${styles.questionField}`}>
            <span>占事</span>
            <input
              value={form.question}
              placeholder="不用填写"
              onChange={(event) => update('question', event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>占测范围</span>
            <select value={form.scope} onChange={(event) => update('scope', event.target.value)}>
              {SCOPE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.timeRow}>
          <span className={styles.rowLabel}>{form.calendar === 'lunar' ? '农历时间' : '公历时间'}</span>
          <label><select value={form.year} onChange={(event) => update('year', event.target.value)}>{range(defaults.year - 5, defaults.year + 5).map((year) => <option key={year} value={year}>{year}</option>)}</select> 年</label>
          <label><select value={form.month} onChange={(event) => update('month', event.target.value)}>{range(1, 12).map((month) => <option key={month} value={month}>{month}</option>)}</select> 月</label>
          <label><select value={form.day} onChange={(event) => update('day', event.target.value)}>{range(1, 31).map((day) => <option key={day} value={day}>{day}</option>)}</select> 日</label>
          <label><select value={form.hour} onChange={(event) => update('hour', event.target.value)}>{range(0, 23).map((hour) => <option key={hour} value={hour}>{hour}</option>)}</select> 时</label>
          <label><select value={form.minute} onChange={(event) => update('minute', event.target.value)}>{range(0, 59).map((minute) => <option key={minute} value={minute}>{minute}</option>)}</select> 分</label>
        </div>

        <div className={styles.methodRow}>
          <span className={styles.rowLabel}>起卦方式</span>
          <div className={styles.radioGrid}>
            {CAST_METHODS.map((method) => (
              <label key={method.value} className={`${styles.radioItem} ${!method.enabled ? styles.disabled : ''}`}>
                <input
                  type="radio"
                  name="method"
                  value={method.value}
                  checked={form.method === method.value}
                  onChange={(event) => update('method', event.target.value)}
                />
                <span>{method.label}</span>
                {!method.enabled && <small className={styles.comingSoon}>即将开放</small>}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.methodRow}>
          <span className={styles.rowLabel}>历法</span>
          <div className={styles.radioGrid}>
            {CALENDAR_OPTIONS.map((calendar) => (
              <label key={calendar.value} className={styles.radioItem}>
                <input
                  type="radio"
                  name="calendar"
                  value={calendar.value}
                  checked={form.calendar === calendar.value}
                  onChange={(event) => update('calendar', event.target.value)}
                />
                <span>{calendar.label}</span>
              </label>
            ))}
          </div>
        </div>

        {notice && <p className={styles.notice}>{notice}</p>}

        <div className={styles.panelActions}>
          <button type="submit" className={styles.primaryBtn}>确定起卦</button>
          <button type="button" className={styles.secondaryBtn} onClick={reset}>重来</button>
        </div>
        <div className={styles.cornerBottom} />
      </form>

      <div className={styles.quickLinks}>
        <Link to="/liuyao/cast?mode=manual">手动摇卦</Link>
        <Link to="/liuyao/hexagrams">浏览六十四卦</Link>
        <Link to="/history">查看卦历</Link>
      </div>

      <section className={styles.info}>
        <h3>起卦方法</h3>
        <p>三枚铜钱，同时抛出。正面为阳（3），反面为阴（2）。三点之和：6为老阴（变爻），7为少阳，8为少阴，9为老阳（变爻）。从下往上，六次得六爻，即成一卦。</p>
      </section>
    </div>
  );
}
