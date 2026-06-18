import { CommercialError, mapReportRow, normalizeReportDomainFilter } from './_commercial.js';
import { authenticateRequest, ensureProfileAndStarterCredits, getSupabaseServiceClient } from './_supabase.js';

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(payload));
}

function sendError(res, error) {
  const status = error instanceof CommercialError ? error.status : 500;
  const code = error instanceof CommercialError ? error.code : 'reports_error';
  sendJson(res, status, {
    error: {
      code,
      message: error.message || '报告数据处理失败',
    },
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

async function listReports(req, res, user) {
  const supabase = getSupabaseServiceClient();
  const url = new URL(req.url || '/', 'http://localhost');
  const domain = normalizeReportDomainFilter(url.searchParams.get('domain'));

  let query = supabase
    .from('ai_reports')
    .select('id, domain, title, question, style, depth, provider, model, cost, content, chart, usage, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  if (domain) query = query.eq('domain', domain);

  const { data, error } = await query;
  if (error) {
    throw new CommercialError(500, 'reports_load_failed', '报告历史读取失败');
  }

  sendJson(res, 200, { reports: (data || []).map(mapReportRow) });
}

async function deleteReport(req, res, user) {
  const body = await readBody(req);
  const payload = body ? JSON.parse(body) : {};
  const id = String(payload.id || '').trim();
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    throw new CommercialError(400, 'validation_error', '报告 ID 无效');
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase
    .from('ai_reports')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new CommercialError(500, 'report_delete_failed', '报告删除失败');
  }

  sendJson(res, 200, { ok: true });
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Allow', 'GET, DELETE, OPTIONS');
    res.end();
    return;
  }

  if (!['GET', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', 'GET, DELETE');
    sendError(res, new CommercialError(405, 'method_not_allowed', 'Method Not Allowed'));
    return;
  }

  try {
    const { user } = await authenticateRequest(req);
    await ensureProfileAndStarterCredits(user);
    if (req.method === 'DELETE') {
      await deleteReport(req, res, user);
      return;
    }
    await listReports(req, res, user);
  } catch (error) {
    if (error instanceof SyntaxError) {
      sendError(res, new CommercialError(400, 'validation_error', '请求 JSON 格式无效'));
      return;
    }
    sendError(res, error);
  }
}
