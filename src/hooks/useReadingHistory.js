import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'yijing-readings';

export function useReadingHistory() {
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setReadings(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const persist = useCallback((newReadings) => {
    setReadings(newReadings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newReadings));
  }, []);

  const saveReading = useCallback((reading) => {
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      date: new Date().toISOString().slice(0, 10),
      timestamp: Date.now(),
      ...reading,
    };
    setReadings(prev => {
      const next = [entry, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    return entry;
  }, []);

  const deleteReading = useCallback((id) => {
    const next = readings.filter(r => r.id !== id);
    persist(next);
  }, [readings, persist]);

  const updateNote = useCallback((id, note) => {
    const next = readings.map(r => r.id === id ? { ...r, note } : r);
    persist(next);
  }, [readings, persist]);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(readings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yijing-readings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [readings]);

  const importJSON = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (!Array.isArray(data)) throw new Error('格式错误');
          persist([...data, ...readings]);
          resolve(data.length);
        } catch (err) { reject(err); }
      };
      reader.readAsText(file);
    });
  }, [readings, persist]);

  return { readings, saveReading, deleteReading, updateNote, exportJSON, importJSON };
}
