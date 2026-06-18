export function authHeaders(session) {
  const token = session?.access_token;
  if (!token) throw new Error('请先登录后再生成 AI 报告');
  return {
    'Content-Type': 'application/json',
    'X-Yijie-Client': 'browser',
    Authorization: `Bearer ${token}`,
  };
}

export async function apiErrorMessage(response, fallback) {
  const data = await response.json().catch(() => ({}));
  if (response.ok) return data;
  const message = data?.error?.message || data?.error || fallback;
  throw new Error(message);
}
