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
assert.ok(readme.includes('docs/production-smoke-test.md'), 'README should link the production smoke test guide');

const e2eRunner = read('scripts/run-e2e.mjs');
for (const expected of [
  'waitForPreview',
  'Preview server failed to start',
  'Preview server exited early',
  'is already in use',
  'stopPreview(server)',
  'VITE_SUPABASE_URL',
  'https://e2e.supabase.co',
]) {
  assert.ok(e2eRunner.includes(expected), `E2E runner should include ${expected}`);
}

const e2eSmoke = read('tests/e2e/smoke.spec.js');
assert.ok(!e2eSmoke.includes('test.skip'), 'local E2E smoke tests should not contain test.skip');
assert.ok(e2eSmoke.includes('setupSignedInCommercialMocks'), 'local E2E should cover signed-in commercial flows with route mocks');

const packageJson = read('package.json');
for (const expected of ['reportsApi.test.mjs', 'logRedaction.test.mjs', '"smoke:prod": "node scripts/smoke-check.mjs"']) {
  assert.ok(packageJson.includes(expected), `package scripts should include ${expected}`);
}

const smokeCheck = read('scripts/smoke-check.mjs');
for (const expected of ['SMOKE_BASE_URL', 'SMOKE_AUTH_TOKEN', 'SMOKE_AI_PAYLOAD_FILE', 'SMOKE_SKIP_API', '/api/account', '/api/reports', '/api/deepseek-reading', 'expectedStatus: 401']) {
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
  'production-smoke-test.md',
  'SMOKE_AI_PAYLOAD_FILE',
]) {
  assert.ok(checklist.includes(expected), `deployment checklist should include ${expected}`);
}

const productionSmoke = read('docs/production-smoke-test.md');
for (const expected of [
  'Magic Link',
  'SMOKE_AUTH_TOKEN',
  'SMOKE_AI_PAYLOAD_FILE',
  'credit_ledger_user_idempotency_key_idx',
  'consume_credit_and_save_ai_report',
  '不包含真实微信、支付宝或 Stripe 支付',
]) {
  assert.ok(productionSmoke.includes(expected), `production smoke guide should include ${expected}`);
}

const smokePayload = JSON.parse(read('docs/smoke-ai-payload.example.json'));
assert.equal(smokePayload.domain, 'combined');
assert.equal(smokePayload.chart.mode, 'bazi_liuyao');

console.log('releaseGate unit tests passed');
