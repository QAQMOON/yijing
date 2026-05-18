import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useReadingHistory } from '../hooks/useReadingHistory.js';
import { HEXAGRAMS } from '../data/hexagrams.js';
import styles from './ReadingHistory.module.css';

export default function ReadingHistory() {
  const { readings, deleteReading, updateNote, exportJSON, importJSON } = useReadingHistory();
  const fileRef = useRef(null);

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const count = await importJSON(file);
      alert(`成功导入 ${count} 条记录`);
    } catch {
      alert('文件格式错误');
    }
    e.target.value = '';
  };

  return (
    <div className={styles.page}>
      <Helmet><title>我的卦历 — 易理</title></Helmet>
      <div className={styles.header}>
        <h1 className={styles.title}>我的卦历</h1>
        <p className={styles.subtitle}>排卦记录 · 日积月累</p>
      </div>
      <div className={styles.divider} />

      {readings.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyIcon}>☷</p>
          <p>尚无排卦记录</p>
          <p className={styles.emptyHint}>摇卦或查看每日一卦后，点击"保存到卦历"即可记录于此</p>
          <Link to="/liuyao/cast" className={styles.emptyBtn}>去摇一卦 →</Link>
        </div>
      ) : (
        <>
          <div className={styles.toolbar}>
            <button className={styles.toolBtn} onClick={exportJSON}>导出备份</button>
            <button className={styles.toolBtn} onClick={() => fileRef.current?.click()}>导入恢复</button>
            <input ref={fileRef} type="file" accept=".json" style={{display:'none'}} onChange={handleImport} />
          </div>
          <div className={styles.list}>
            {readings.map(reading => {
              const hex = HEXAGRAMS.find(h => h.id === reading.hexagramId);
              return (
                <div key={reading.id} className={styles.item}>
                  <div className={styles.itemLeft}>
                    <span className={styles.date}>{reading.date}</span>
                    <Link to={`/liuyao/hexagram/${reading.hexagramId}`} className={styles.hexName}>
                      {hex ? `${hex.unicode} ${hex.name}` : `第${reading.hexagramId}卦`}
                    </Link>
                    <span className={styles.type}>{reading.type === 'daily' ? '每日一卦' : '摇卦'}</span>
                  </div>
                  <div className={styles.itemRight}>
                    <input
                      type="text"
                      className={styles.noteInput}
                      placeholder="添加笔记..."
                      defaultValue={reading.note || ''}
                      onBlur={e => updateNote(reading.id, e.target.value)}
                    />
                    <button className={styles.delBtn} onClick={() => deleteReading(reading.id)} title="删除">
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
