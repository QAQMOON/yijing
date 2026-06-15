import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Seo from '../../components/Seo.jsx';
import { toDateTimeInputValue } from '../../utils/dateTime.js';
import styles from './InputBirthData.module.css';

const pad = (value) => String(value).padStart(2, '0');
const PLACE_OPTIONS = [
  '北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江',
  '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南',
  '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州',
  '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆', '香港',
  '澳门', '台湾',
];

export default function InputBirthData() {
  const navigate = useNavigate();
  const now = new Date();
  const [gender, setGender] = useState('male');
  const [calendar, setCalendar] = useState('solar');
  const [dateTime, setDateTime] = useState(toDateTimeInputValue(now));
  const [birthplace, setBirthplace] = useState('');
  const [lunar, setLunar] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
  });

  const buildCommonParams = () => ({
    gender,
    ...(birthplace ? { birthplace } : {}),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (calendar === 'lunar') {
      const params = new URLSearchParams({
        calendar: 'lunar',
        ...buildCommonParams(),
        ly: lunar.year,
        lm: lunar.month,
        ld: lunar.day,
        lh: lunar.hour,
        lmin: lunar.minute,
        mode: 'custom',
      });
      navigate(`/bazi/result?${params.toString()}`);
      return;
    }

    const params = new URLSearchParams({
      calendar: 'solar',
      ...buildCommonParams(),
      dt: dateTime,
      mode: 'custom',
    });
    navigate(`/bazi/result?${params.toString()}`);
  };

  const useCurrentTime = () => {
    const current = new Date();
    const params = new URLSearchParams({
      calendar: 'solar',
      ...buildCommonParams(),
      dt: toDateTimeInputValue(current),
      mode: 'now',
    });
    navigate(`/bazi/result?${params.toString()}`);
  };

  const updateLunar = (key, value) => {
    setLunar((prev) => ({ ...prev, [key]: Number(value) }));
  };

  return (
    <div className={styles.page}>
      <Seo
        title="输入生辰 · 八字排盘 · 易解"
        description="输入公历或农历出生时间与性别，生成易解八字四柱排盘。排盘以节气定年月，并展示大运、流年、神煞等基础信息。"
        path="/bazi/chart"
      />
      <h1 className={styles.title}>八字排盘</h1>
      <p className={styles.subtitle}>请输入出生日期、时辰与性别</p>
      <div className={styles.divider} />

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.row}>
          <label className={styles.label}>性别</label>
          <div className={styles.segment}>
            <button type="button" className={gender === 'male' ? styles.active : ''} onClick={() => setGender('male')}>男</button>
            <button type="button" className={gender === 'female' ? styles.active : ''} onClick={() => setGender('female')}>女</button>
          </div>
        </div>

        <div className={styles.row}>
          <label className={styles.label}>历法</label>
          <div className={styles.segment}>
            <button type="button" className={calendar === 'solar' ? styles.active : ''} onClick={() => setCalendar('solar')}>公历</button>
            <button type="button" className={calendar === 'lunar' ? styles.active : ''} onClick={() => setCalendar('lunar')}>农历</button>
          </div>
        </div>

        {calendar === 'solar' ? (
          <div className={styles.row}>
            <label className={styles.label}>出生时间</label>
            <input
              type="datetime-local"
              className={styles.input}
              value={dateTime}
              min="1900-01-01T00:00"
              max="2100-12-31T23:59"
              onChange={e => setDateTime(e.target.value)}
            />
          </div>
        ) : (
          <div className={styles.lunarGrid}>
            <label>
              <span>农历年</span>
              <input type="number" min="1900" max="2100" value={lunar.year} onChange={e => updateLunar('year', e.target.value)} />
            </label>
            <label>
              <span>月</span>
              <input type="number" min="1" max="12" value={lunar.month} onChange={e => updateLunar('month', e.target.value)} />
            </label>
            <label>
              <span>日</span>
              <input type="number" min="1" max="30" value={lunar.day} onChange={e => updateLunar('day', e.target.value)} />
            </label>
            <label>
              <span>时</span>
              <input type="number" min="0" max="23" value={lunar.hour} onChange={e => updateLunar('hour', e.target.value)} />
            </label>
            <label>
              <span>分</span>
              <input type="number" min="0" max="59" value={pad(lunar.minute)} onChange={e => updateLunar('minute', e.target.value)} />
            </label>
          </div>
        )}

        <div className={styles.row}>
          <label className={styles.label} htmlFor="birthplace">出生地</label>
          <div>
            <select
              id="birthplace"
              className={styles.input}
              value={birthplace}
              onChange={e => setBirthplace(e.target.value)}
            >
              <option value="">待选择位置</option>
              {PLACE_OPTIONS.map((place) => <option key={place} value={place}>{place}</option>)}
            </select>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.btn}>自定义排盘</button>
          <button type="button" className={styles.btnGhost} onClick={useCurrentTime}>使用当前时间</button>
        </div>
      </form>

      <p className={styles.note}>年份范围：1900 - 2100。出生地用于真太阳时校正，省级地区按代表城市经度近似校准。</p>
    </div>
  );
}
