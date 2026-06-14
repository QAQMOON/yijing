import { useCallback, useState } from 'react';
import { getStorageItem, setStorageItem } from '../utils/safeStorage.js';

const STORAGE_KEY = 'yijie-ai-reports-v1';
const MAX_REPORTS = 80;

function makeId() {
  return `report_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function readStoredReports() {
  try {
    const raw = getStorageItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_REPORTS) : [];
  } catch {
    return [];
  }
}

function persistReports(reports) {
  setStorageItem(STORAGE_KEY, JSON.stringify(reports.slice(0, MAX_REPORTS)));
}

export function useAiReports() {
  const [reports, setReports] = useState(readStoredReports);

  const saveReport = useCallback((report) => {
    const entry = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      cloudStatus: 'local',
      ...report,
    };

    setReports((prev) => {
      const next = [entry, ...prev].slice(0, MAX_REPORTS);
      persistReports(next);
      return next;
    });

    return entry;
  }, []);

  const deleteReport = useCallback((id) => {
    setReports((prev) => {
      const next = prev.filter((report) => report.id !== id);
      persistReports(next);
      return next;
    });
  }, []);

  return { reports, saveReport, deleteReport };
}
