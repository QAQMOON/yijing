import { CommercialError } from './_commercial.js';
import { authenticateRequest, getAccountSnapshot } from './_supabase.js';

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(payload));
}

function sendError(res, error) {
  const status = error instanceof CommercialError ? error.status : 500;
  const code = error instanceof CommercialError ? error.code : 'account_error';
  sendJson(res, status, {
    error: {
      code,
      message: error.message || '账户数据处理失败',
    },
  });
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Allow', 'GET, OPTIONS');
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    sendError(res, new CommercialError(405, 'method_not_allowed', 'Method Not Allowed'));
    return;
  }

  try {
    const { user } = await authenticateRequest(req);
    const account = await getAccountSnapshot(user);
    sendJson(res, 200, { account });
  } catch (error) {
    sendError(res, error);
  }
}
