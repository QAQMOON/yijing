import { useCallback, useEffect, useState } from 'react';
import { useAccount } from './useAccount.js';

function domainQuery(domain) {
  return domain && domain !== 'all' ? `?domain=${encodeURIComponent(domain)}` : '';
}

async function parseApiResponse(response, fallback) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || data.error || fallback);
  }
  return data;
}

export function useAiReports(domain = 'all') {
  const { session } = useAccount();
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!session?.access_token) {
      setReports([]);
      setStatus('ready');
      return [];
    }

    setStatus('loading');
    setError('');
    try {
      const response = await fetch(`/api/reports${domainQuery(domain)}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'X-Yijie-Client': 'browser',
        },
      });
      const data = await parseApiResponse(response, '报告历史读取失败');
      setReports(data.reports || []);
      setStatus('ready');
      return data.reports || [];
    } catch (err) {
      setError(err.message || '报告历史读取失败');
      setStatus('error');
      return [];
    }
  }, [domain, session]);

  useEffect(() => {
    queueMicrotask(() => {
      reload();
    });
  }, [reload]);

  const deleteReport = useCallback(async (id) => {
    if (!session?.access_token) throw new Error('请先登录');
    const response = await fetch('/api/reports', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'X-Yijie-Client': 'browser',
      },
      body: JSON.stringify({ id }),
    });
    await parseApiResponse(response, '报告删除失败');
    await reload();
  }, [reload, session]);

  return {
    reports,
    status,
    error,
    reload,
    deleteReport,
  };
}
