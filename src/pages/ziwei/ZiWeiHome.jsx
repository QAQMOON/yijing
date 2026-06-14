import { useMemo, useState } from 'react';
import Seo from '../../components/Seo.jsx';
import { useNavigate } from 'react-router-dom';
import styles from './ZiWeiHome.module.css';

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

export default function ZiWeiHome() {
  const navigate = useNavigate();
  const defaults = useMemo(() => currentParts(), []);
  const [form, setForm] = useState({
    ...defaults,
    calendar: 'solar',
    gender: 'male',
    astroType: 'heaven',
    isLeapMonth: false,
    fixLeap: true,
  });
  const dayOptions = useMemo(
    () => range(1, form.calendar === 'lunar' ? 30 : daysInMonth(form.year, form.month)),
    [form.calendar, form.year, form.month],
  );

  const update = (field, value) => setForm((prev) => {
    const parsed = typeof value === 'boolean' ? value : Number(value);
    const next = { ...prev, [field]: Number.isNaN(parsed) ? value : parsed };
    const maxDay = next.calendar === 'lunar' ? 30 : daysInMonth(next.year, next.month);
    return { ...next, day: Math.min(next.day, maxDay) };
  });

  const buildParams = (parts, mode) => new URLSearchParams({
    calendar: parts.calendar,
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    gender: parts.gender,
    astroType: parts.astroType,
    isLeapMonth: String(parts.calendar === 'lunar' && parts.isLeapMonth),
    fixLeap: String(parts.fixLeap),
    mode,
  });

  const submit = (event) => {
    event.preventDefault();
    navigate(`/ziwei/chart?${buildParams(form, 'custom').toString()}`);
  };

  const useCurrentTime = () => {
    const now = currentParts();
    navigate(`/ziwei/chart?${buildParams({ ...form, ...now, calendar: 'solar' }, 'now').toString()}`);
  };

  return (
    <div className={styles.page}>
      <Seo
        title="紫微斗数排盘 · 十二宫与星曜四化 · 易解"
        description="易解紫微斗数工具支持阳历或农历生日、男女命、天盘地盘人盘与闰月修正，生成十二宫星曜排盘。"
        path="/ziwei"
      />
      <h1 className={styles.title}>紫微斗数</h1>
      <p className={styles.subtitle}>十二宫垣 · 星曜四化</p>
      <div className={styles.divider} />
      <p className={styles.desc}>
        紫微斗数以出生年月日时安命身十二宫，布紫微天府诸星，参四化、大限、流年。
        此处以开源排盘库为算法底座，输出适合检阅的命盘格局。
      </p>

      <form className={styles.panel} onSubmit={submit}>
        <div className={styles.optionGrid}>
          <label>
            <input type="radio" name="calendar" value="solar" checked={form.calendar === 'solar'} onChange={(event) => update('calendar', event.target.value)} />
            阳历生日
          </label>
          <label>
            <input type="radio" name="calendar" value="lunar" checked={form.calendar === 'lunar'} onChange={(event) => update('calendar', event.target.value)} />
            农历生日
          </label>
          <label>
            <input type="radio" name="gender" value="male" checked={form.gender === 'male'} onChange={(event) => update('gender', event.target.value)} />
            男命
          </label>
          <label>
            <input type="radio" name="gender" value="female" checked={form.gender === 'female'} onChange={(event) => update('gender', event.target.value)} />
            女命
          </label>
        </div>

        <div className={styles.timeLine}>
          <span className={styles.rowLabel}>{form.calendar === 'lunar' ? '农历' : '阳历'}</span>
          <label><select value={form.year} onChange={(event) => update('year', event.target.value)}>{range(defaults.year - 90, defaults.year + 5).map((year) => <option key={year} value={year}>{year}</option>)}</select> 年</label>
          <label><select value={form.month} onChange={(event) => update('month', event.target.value)}>{range(1, 12).map((month) => <option key={month} value={month}>{month}</option>)}</select> 月</label>
          <label><select value={form.day} onChange={(event) => update('day', event.target.value)}>{dayOptions.map((day) => <option key={day} value={day}>{day}</option>)}</select> 日</label>
          <label><select value={form.hour} onChange={(event) => update('hour', event.target.value)}>{range(0, 23).map((hour) => <option key={hour} value={hour}>{hour}</option>)}</select> 时</label>
          <label><select value={form.minute} onChange={(event) => update('minute', event.target.value)}>{range(0, 59).map((minute) => <option key={minute} value={minute}>{minute}</option>)}</select> 分</label>
        </div>

        <div className={styles.optionGrid}>
          <label>
            <input type="radio" name="astroType" value="heaven" checked={form.astroType === 'heaven'} onChange={(event) => update('astroType', event.target.value)} />
            天盘
          </label>
          <label>
            <input type="radio" name="astroType" value="earth" checked={form.astroType === 'earth'} onChange={(event) => update('astroType', event.target.value)} />
            地盘
          </label>
          <label>
            <input type="radio" name="astroType" value="human" checked={form.astroType === 'human'} onChange={(event) => update('astroType', event.target.value)} />
            人盘
          </label>
          <label className={form.calendar === 'lunar' ? '' : styles.disabled}>
            <input type="checkbox" checked={form.calendar === 'lunar' && form.isLeapMonth} disabled={form.calendar !== 'lunar'} onChange={(event) => update('isLeapMonth', event.target.checked)} />
            闰月
          </label>
          <label>
            <input type="checkbox" checked={form.fixLeap} onChange={(event) => update('fixLeap', event.target.checked)} />
            闰月修正
          </label>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.btn}>紫微斗数排盘</button>
          <button type="button" className={styles.btnOutline} onClick={useCurrentTime}>当前时间起盘</button>
        </div>
      </form>
    </div>
  );
}
