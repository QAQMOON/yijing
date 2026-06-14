import { useMemo, useState } from 'react';
import Seo from '../../components/Seo.jsx';
import { useNavigate } from 'react-router-dom';
import styles from './QiMenHome.module.css';

function currentParts() {
  const now = new Date();
  return {
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

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function toParamDate(form) {
  return [
    form.year,
    String(form.month).padStart(2, '0'),
    String(form.day).padStart(2, '0'),
  ].join('-') + `T${String(form.hour).padStart(2, '0')}:${String(form.minute).padStart(2, '0')}`;
}

export default function QiMenHome() {
  const navigate = useNavigate();
  const defaults = useMemo(() => currentParts(), []);
  const [form, setForm] = useState({
    ...defaults,
    basis: 'calendar',
    plate: 'rotating',
    juMethod: 'chaibu',
  });

  const dayOptions = useMemo(() => range(1, daysInMonth(form.year, form.month)), [form.year, form.month]);

  const update = (field, value) => setForm((prev) => {
    const numericValue = Number(value);
    const next = { ...prev, [field]: Number.isNaN(numericValue) ? value : numericValue };
    const maxDay = daysInMonth(next.year, next.month);
    return { ...next, day: Math.min(next.day, maxDay) };
  });

  const submit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams({
      dt: toParamDate(form),
      mode: 'custom',
      basis: form.basis,
      plate: form.plate,
      juMethod: form.juMethod,
    });
    navigate(`/qimen/display?${params.toString()}`);
  };

  const useCurrentTime = () => {
    const now = currentParts();
    const params = new URLSearchParams({
      dt: toParamDate({ ...form, ...now }),
      mode: 'now',
      basis: form.basis,
      plate: form.plate,
      juMethod: form.juMethod,
    });
    navigate(`/qimen/display?${params.toString()}`);
  };

  return (
    <div className={styles.page}>
      <Seo
        title="奇门遁甲排盘 · 八门九星九宫 · 易解"
        description="易解奇门遁甲工具支持按公历或四柱起局，提供转盘、飞盘、拆补无闰法与超接置闰法选项。"
        path="/qimen"
      />
      <h1 className={styles.title}>奇门遁甲</h1>
      <p className={styles.subtitle}>八门九星 · 择时定方</p>
      <div className={styles.divider} />
      <p className={styles.desc}>
        奇门遁甲，三式之一。以洛书九宫为基，排八门、布九星、转八神、推三奇六仪。
        阳遁阴遁各九局，共十八局。定方位，择时机，趋吉避凶，运筹帷幄。
      </p>

      <form className={styles.panel} onSubmit={submit}>
        <div className={styles.timeLine}>
          <span className={styles.rowLabel}>公历</span>
          <label><select value={form.year} onChange={(event) => update('year', event.target.value)}>{range(defaults.year - 5, defaults.year + 5).map((year) => <option key={year} value={year}>{year}</option>)}</select> 年</label>
          <label><select value={form.month} onChange={(event) => update('month', event.target.value)}>{range(1, 12).map((month) => <option key={month} value={month}>{month}</option>)}</select> 月</label>
          <label><select value={form.day} onChange={(event) => update('day', event.target.value)}>{dayOptions.map((day) => <option key={day} value={day}>{day}</option>)}</select> 日</label>
          <label><select value={form.hour} onChange={(event) => update('hour', event.target.value)}>{range(0, 23).map((hour) => <option key={hour} value={hour}>{hour}</option>)}</select> 时</label>
          <label><select value={form.minute} onChange={(event) => update('minute', event.target.value)}>{range(0, 59).map((minute) => <option key={minute} value={minute}>{minute}</option>)}</select> 分</label>
        </div>

        <div className={styles.optionGrid}>
          <label>
            <input type="radio" name="basis" value="calendar" checked={form.basis === 'calendar'} onChange={(event) => update('basis', event.target.value)} />
            按公历起局
          </label>
          <label>
            <input type="radio" name="basis" value="fourPillars" checked={form.basis === 'fourPillars'} onChange={(event) => update('basis', event.target.value)} />
            按四柱起局
          </label>
          <label>
            <input type="radio" name="plate" value="rotating" checked={form.plate === 'rotating'} onChange={(event) => update('plate', event.target.value)} />
            转盘奇门
          </label>
          <label>
            <input type="radio" name="plate" value="flying" checked={form.plate === 'flying'} onChange={(event) => update('plate', event.target.value)} />
            飞盘奇门
          </label>
          <label>
            <input type="radio" name="juMethod" value="chaibu" checked={form.juMethod === 'chaibu'} onChange={(event) => update('juMethod', event.target.value)} />
            拆补无闰法
          </label>
          <label>
            <input type="radio" name="juMethod" value="zhirun" checked={form.juMethod === 'zhirun'} onChange={(event) => update('juMethod', event.target.value)} />
            超接置闰法
          </label>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.btn}>奇门遁甲起局</button>
          <button type="button" className={styles.btnOutline} onClick={useCurrentTime}>本地时间起局</button>
        </div>
      </form>
    </div>
  );
}
