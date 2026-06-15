import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Seo from '../../components/Seo.jsx';
import { toDateTimeInputValue } from '../../utils/dateTime.js';
import styles from './InputBirthData.module.css';

const pad = (value) => String(value).padStart(2, '0');
const PLACE_OPTIONS = [
  '北京', '上海', '天津', '重庆', '广州', '深圳', '杭州', '成都', '武汉', '西安',
  '南京', '长沙', '郑州', '沈阳', '昆明', '南宁', '哈尔滨', '乌鲁木齐', '拉萨',
  '海口', '兰州', '贵阳', '福州', '南昌', '合肥', '济南', '太原', '石家庄',
  '呼和浩特', '银川', '西宁', '香港', '澳门', '台北',
  '河北', '山西', '辽宁', '吉林', '黑龙江', '江苏', '浙江', '安徽', '福建',
  '江西', '山东', '河南', '湖北', '湖南', '广东', '海南', '四川', '贵州',
  '云南', '陕西', '甘肃', '青海', '台湾', '内蒙古', '广西', '西藏', '宁夏', '新疆',
  '宁波', '温州', '无锡', '苏州', '常州', '南通', '徐州', '扬州', '佛山',
  '东莞', '珠海', '中山', '惠州', '汕头', '厦门', '泉州', '青岛', '大连',
];

export default function InputBirthData() {
  const navigate = useNavigate();
  const now = new Date();
  const [gender, setGender] = useState('male');
  const [calendar, setCalendar] = useState('solar');
  const [dateTime, setDateTime] = useState(toDateTimeInputValue(now));
  const [birthplace, setBirthplace] = useState('北京');
  const [lunar, setLunar] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
  });

  const buildCommonParams = () => ({
    gender,
    birthplace: birthplace.trim() || '120.0',
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
          <label className={styles.label}>出生地</label>
          <div>
            <input
              type="text"
              className={styles.input}
              value={birthplace}
              list="birthplace-options"
              placeholder="北京 / 湖南 / 116.4"
              onChange={e => setBirthplace(e.target.value)}
            />
            <datalist id="birthplace-options">
              {PLACE_OPTIONS.map((place) => <option key={place} value={place} />)}
            </datalist>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.btn}>自定义排盘</button>
          <button type="button" className={styles.btnGhost} onClick={useCurrentTime}>使用当前时间</button>
        </div>
      </form>

      <p className={styles.note}>年份范围：1900 - 2100。出生地用于真太阳时校正，可填省份、城市名或经度。</p>
    </div>
  );
}
