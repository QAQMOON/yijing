import fs from 'node:fs';
import path from 'node:path';

if (process.argv.includes('--help')) {
  console.log([
    'Usage:',
    '  SMOKE_BASE_URL=https://your-domain npm run smoke:prod',
    '',
    'Optional authenticated checks:',
    '  SMOKE_AUTH_TOKEN=<supabase-access-token> npm run smoke:prod',
    '  SMOKE_AUTH_TOKEN=<token> SMOKE_AI_PAYLOAD_FILE=docs/smoke-ai-payload.example.json npm run smoke:prod',
    '',
    'Optional settings:',
    '  SMOKE_TIMEOUT_MS=10000',
    '  SMOKE_DELETE_CREATED_REPORT=1',
    '  SMOKE_SKIP_API=1  # local static preview only',
  ].join('\n'));
  process.exit(0);
}

const publicPaths = [
  '/',
  '/liuyao',
  '/bazi',
  '/ziwei',
  '/qimen',
  '/daliuren',
  '/reports/combined',
  '/account',
  '/pricing',
];

const apiChecks = [
  { path: '/api/account', method: 'GET', expectedStatus: 401 },
  { path: '/api/reports', method: 'GET', expectedStatus: 401 },
];

const rawBaseUrl = process.env.SMOKE_BASE_URL || process.env.BASE_URL || '';
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS || 10000);
const authToken = String(process.env.SMOKE_AUTH_TOKEN || '').trim();
const aiPayloadFile = String(process.env.SMOKE_AI_PAYLOAD_FILE || '').trim();
const deleteCreatedReport = process.env.SMOKE_DELETE_CREATED_REPORT === '1';
const skipApi = process.env.SMOKE_SKIP_API === '1';
const failures = [];

function sanitize(value) {
  return String(value || '')
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Bearer [redacted]')
    .replace(/(access_token|refresh_token|api[_-]?key|service[_-]?role)["':=\s]+[A-Za-z0-9._~+/=-]+/gi, '$1=[redacted]')
    .slice(0, 500);
}

function normalizeBaseUrl(value) {
  const trimmed = String(value || '').trim().replace(/\/+$/, '');
  if (!trimmed) {
    throw new Error('Set SMOKE_BASE_URL or BASE_URL to the deployed site URL.');
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error('SMOKE_BASE_URL must be a valid http(s) URL.');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('SMOKE_BASE_URL must use http or https.');
  }

  return parsed.toString().replace(/\/+$/, '');
}

function assertValidSettings() {
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1000) {
    throw new Error('SMOKE_TIMEOUT_MS must be a number greater than or equal to 1000.');
  }
  if (skipApi && (authToken || aiPayloadFile)) {
    throw new Error('SMOKE_SKIP_API cannot be combined with authenticated or AI smoke checks.');
  }
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function responseSummary(response, body) {
  const bodyText = typeof body === 'string' ? body : JSON.stringify(body || {});
  return `HTTP ${response.status} ${sanitize(bodyText)}`;
}

async function requestJson(baseUrl, targetPath, options = {}, expectedStatus = 200) {
  const response = await fetchWithTimeout(`${baseUrl}${targetPath}`, options);
  const text = await response.text();
  let json = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`${options.method || 'GET'} ${targetPath} returned non-JSON ${responseSummary(response, text)}`);
    }
  }

  if (response.status !== expectedStatus) {
    throw new Error(`${options.method || 'GET'} ${targetPath} returned ${responseSummary(response, json || text)}, expected HTTP ${expectedStatus}`);
  }

  return { response, json };
}

function authHeaders(extra = {}) {
  if (!authToken) {
    throw new Error('SMOKE_AUTH_TOKEN is required for authenticated smoke checks.');
  }

  return {
    Authorization: `Bearer ${authToken}`,
    'X-Yijie-Client': 'smoke',
    ...extra,
  };
}

async function runCheck(label, callback) {
  try {
    await callback();
    console.log(`[smoke] PASS ${label}`);
  } catch (error) {
    failures.push({ label, error });
    console.error(`[smoke] FAIL ${label}: ${sanitize(error.message)}`);
  }
}

async function checkPublicPath(baseUrl, targetPath) {
  const response = await fetchWithTimeout(`${baseUrl}${targetPath}`);
  const text = await response.text().catch(() => '');
  if (!response.ok) {
    throw new Error(`${targetPath} returned HTTP ${response.status}`);
  }
  if (!text.includes('<html') || !text.includes('易解')) {
    throw new Error(`${targetPath} did not return the expected app HTML`);
  }
}

async function checkApi(baseUrl, { path: targetPath, method, expectedStatus }) {
  const { json } = await requestJson(baseUrl, targetPath, { method }, expectedStatus);
  if (expectedStatus >= 400 && !json?.error?.code) {
    throw new Error(`${method} ${targetPath} did not return a structured error`);
  }
}

async function getAccount(baseUrl) {
  const { json } = await requestJson(baseUrl, '/api/account', {
    headers: authHeaders(),
  });
  if (typeof json?.account?.credits !== 'number') {
    throw new Error('/api/account did not return account.credits');
  }
  return json.account;
}

async function getReports(baseUrl) {
  const { json } = await requestJson(baseUrl, '/api/reports', {
    headers: authHeaders(),
  });
  if (!Array.isArray(json?.reports)) {
    throw new Error('/api/reports did not return reports[]');
  }
  return json.reports;
}

function readAiPayload() {
  const resolved = path.resolve(aiPayloadFile);
  const payload = JSON.parse(fs.readFileSync(resolved, 'utf8'));
  if (!payload || typeof payload !== 'object') {
    throw new Error('SMOKE_AI_PAYLOAD_FILE must contain a JSON object.');
  }
  return payload;
}

async function postAiReport(baseUrl, payload) {
  const { json } = await requestJson(baseUrl, '/api/deepseek-reading', {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  if (!json?.reportId || typeof json.balanceAfter !== 'number') {
    throw new Error('/api/deepseek-reading did not return reportId and balanceAfter');
  }
  return json;
}

async function checkAuthenticatedSmoke(baseUrl) {
  await runCheck('authenticated account snapshot', async () => {
    await getAccount(baseUrl);
  });

  await runCheck('authenticated reports list', async () => {
    await getReports(baseUrl);
  });
}

async function checkAiSmoke(baseUrl) {
  const payload = readAiPayload();
  let firstResult;

  await runCheck('AI report generation charges at most once', async () => {
    const before = await getAccount(baseUrl);
    firstResult = await postAiReport(baseUrl, payload);
    const after = await getAccount(baseUrl);

    if (!firstResult.alreadyProcessed) {
      const expectedCredits = before.credits - Number(firstResult.cost || 0);
      if (after.credits !== expectedCredits || after.credits !== firstResult.balanceAfter) {
        throw new Error(`credit balance mismatch: before=${before.credits}, after=${after.credits}, report=${firstResult.balanceAfter}`);
      }
    } else if (after.credits !== before.credits) {
      throw new Error('already processed report changed account credits');
    }
  });

  await runCheck('AI report idempotent retry returns same report', async () => {
    if (!firstResult?.reportId) throw new Error('first AI report result is unavailable');
    const retryResult = await postAiReport(baseUrl, payload);
    if (retryResult.reportId !== firstResult.reportId) {
      throw new Error('retry returned a different reportId');
    }
    if (retryResult.balanceAfter !== firstResult.balanceAfter) {
      throw new Error('retry changed balanceAfter');
    }
  });

  await runCheck('AI report appears in report history', async () => {
    if (!firstResult?.reportId) throw new Error('first AI report result is unavailable');
    const reports = await getReports(baseUrl);
    if (!reports.some((report) => report.id === firstResult.reportId)) {
      throw new Error('generated report was not found in report history');
    }
  });

  if (deleteCreatedReport) {
    await runCheck('delete generated report', async () => {
      if (!firstResult?.reportId) throw new Error('first AI report result is unavailable');
      await requestJson(baseUrl, '/api/reports', {
        method: 'DELETE',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ id: firstResult.reportId }),
      });
      const reports = await getReports(baseUrl);
      if (reports.some((report) => report.id === firstResult.reportId)) {
        throw new Error('generated report still appears after delete');
      }
    });
  }
}

async function main() {
  assertValidSettings();
  const baseUrl = normalizeBaseUrl(rawBaseUrl);

  for (const targetPath of publicPaths) {
    await runCheck(`page ${targetPath}`, async () => {
      await checkPublicPath(baseUrl, targetPath);
    });
  }

  if (!skipApi) {
    for (const check of apiChecks) {
      await runCheck(`${check.method} ${check.path} unauthenticated boundary`, async () => {
        await checkApi(baseUrl, check);
      });
    }
  } else {
    console.log('[smoke] SKIP API checks because SMOKE_SKIP_API=1');
  }

  if (authToken) {
    await checkAuthenticatedSmoke(baseUrl);
  }

  if (aiPayloadFile) {
    if (!authToken) {
      throw new Error('SMOKE_AI_PAYLOAD_FILE requires SMOKE_AUTH_TOKEN.');
    }
    await checkAiSmoke(baseUrl);
  }

  if (failures.length) {
    console.error(`[smoke] ${failures.length} check(s) failed for ${baseUrl}`);
    process.exitCode = 1;
    return;
  }

  console.log(`[smoke] all checks passed for ${baseUrl}`);
}

main().catch((error) => {
  console.error(`[smoke] ${sanitize(error.message)}`);
  process.exitCode = 1;
});
