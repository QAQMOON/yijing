import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
}

const ci = read('.github/workflows/ci.yml');
for (const expected of [
  'npm ci',
  'npm run test',
  'npm run lint',
  'npm run build',
  'git diff --exit-code -- public/sitemap.xml',
  'npm audit --audit-level=high',
  'npx playwright install --with-deps chromium',
  'npm run test:e2e',
  'node scripts/smoke-check.mjs --help',
]) {
  assert.ok(ci.includes(expected), `CI workflow should include ${expected}`);
}
assert.match(ci, /node-version:\s+'22'/, 'CI should pin Node 22');

const gitignore = read('.gitignore');
for (const expected of ['.env', '.env.*', '!.env.example']) {
  assert.ok(gitignore.includes(expected), `.gitignore should include ${expected}`);
}

const readme = read('README.md');
assert.ok(readme.includes('docs/deployment-checklist.md'), 'README should link the deployment checklist');

const e2eRunner = read('scripts/run-e2e.mjs');
for (const expected of [
  'waitForPreview',
  'Preview server failed to start',
  'Preview server exited early',
  'is already in use',
  'stopPreview(server)',
]) {
  assert.ok(e2eRunner.includes(expected), `E2E runner should include ${expected}`);
}

const packageJson = read('package.json');
for (const expected of ['reportsApi.test.mjs', '"smoke:prod": "node scripts/smoke-check.mjs"']) {
  assert.ok(packageJson.includes(expected), `package scripts should include ${expected}`);
}

const smokeCheck = read('scripts/smoke-check.mjs');
for (const expected of ['SMOKE_BASE_URL', '/api/account', '/api/reports', 'expectedStatus: 401']) {
  assert.ok(smokeCheck.includes(expected), `smoke check should include ${expected}`);
}

const checklist = read('docs/deployment-checklist.md');
for (const expected of [
  'VITE_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DEEPSEEK_API_KEY',
  'AI_RATE_LIMIT_WINDOW_MS',
  'AI_RATE_LIMIT_MAX',
  'AI_DAILY_LIMIT_MAX',
  '0001_accounts_credits_reports.sql',
  '0002_commercial_mvp_rpc.sql',
  '0003_ai_report_idempotency.sql',
  '不包含真实微信、支付宝或 Stripe 支付',
  'npm run smoke:prod',
]) {
  assert.ok(checklist.includes(expected), `deployment checklist should include ${expected}`);
}

console.log('releaseGate unit tests passed');
