import { useState } from 'react';
import styles from './SaveReading.module.css';

export default function SaveReading({ onSave, hexagram }) {
  const [showForm, setShowForm] = useState(false);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave({ note: note.trim() || null, hexagram });
    setSaved(true);
    setShowForm(false);
    setNote('');
    setTimeout(() => setSaved(false), 2000);
  };

  if (saved) {
    return (
      <div className={styles.saved}>
        <span className={styles.checkmark}>✓</span> 已保存到卦历
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {!showForm ? (
        <button className={styles.saveBtn} onClick={() => setShowForm(true)}>
          📝 保存到卦历
        </button>
      ) : (
        <div className={styles.form}>
          <input
            type="text"
            className={styles.input}
            placeholder="记录所问之事（可选）"
            value={note}
            onChange={e => setNote(e.target.value)}
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setShowForm(false); }}
          />
          <div className={styles.actions}>
            <button className={styles.confirmBtn} onClick={handleSave}>保存</button>
            <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>取消</button>
          </div>
        </div>
      )}
    </div>
  );
}
