const baseUrl = (process.env.SMOKE_BASE_URL || process.env.BASE_URL || '').replace(/\/$/, '');

if (process.argv.includes('--help')) {
  console.log('Usage: SMOKE_BASE_URL=https://your-domain npm run smoke:prod');
  process.exit(0);
}

if (!baseUrl) {
  console.error('[smoke] Set SMOKE_BASE_URL or BASE_URL to the deployed site URL.');
  process.exit(1);
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

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function checkPublicPath(path) {
  const response = await fetchWithTimeout(`${baseUrl}${path}`);
  if (!response.ok) {
    throw new Error(`${path} returned HTTP ${response.status}`);
  }
  const body = await response.text();
  if (!body.includes('<html') || !body.includes('易解')) {
    throw new Error(`${path} did not return the expected app HTML`);
  }
}

async function checkApi({ path, method, expectedStatus }) {
  const response = await fetchWithTimeout(`${baseUrl}${path}`, { method });
  if (response.status !== expectedStatus) {
    throw new Error(`${method} ${path} returned HTTP ${response.status}, expected ${expectedStatus}`);
  }
  const body = await response.json().catch(() => null);
  if (expectedStatus >= 400 && !body?.error?.code) {
    throw new Error(`${method} ${path} did not return a structured error`);
  }
}

for (const path of publicPaths) {
  await checkPublicPath(path);
}

for (const check of apiChecks) {
  await checkApi(check);
}

console.log(`[smoke] ${publicPaths.length} pages and ${apiChecks.length} API checks passed for ${baseUrl}`);
