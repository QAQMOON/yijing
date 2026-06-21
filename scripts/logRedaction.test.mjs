import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function walk(dir, matcher, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, matcher, files);
    } else if (matcher(fullPath)) {
      files.push(fullPath);
    }
  }
  return files;
}

function relative(file) {
  return path.relative(rootDir, file).replace(/\\/g, '/');
}

const clientFiles = walk(path.join(rootDir, 'src'), (file) => /\.(js|jsx|ts|tsx)$/.test(file));
const serverSecretNames = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'DEEPSEEK_API_KEY',
  'STRIPE_SECRET',
  'STRIPE_SECRET_KEY',
  'WECHAT_PAY_SECRET',
  'ALIPAY_SECRET',
  'PAYMENT_SECRET',
];

for (const file of clientFiles) {
  const text = fs.readFileSync(file, 'utf8');
  for (const secretName of serverSecretNames) {
    assert.ok(
      !text.includes(secretName),
      `${relative(file)} should not reference server-only secret ${secretName}`,
    );
  }
}

const apiFiles = walk(path.join(rootDir, 'api'), (file) => /\.(js|mjs|cjs)$/.test(file));
const sensitiveLogTerms = [
  'authorization',
  'access_token',
  'refresh_token',
  'service_role',
  'api_key',
  'apikey',
  'token',
  'payload',
  'chart',
  'question',
  'birth',
  'birthday',
  'report_content',
  'raw',
];

for (const file of apiFiles) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    if (!/console\.(log|warn|error)/.test(line)) return;
    const lower = line.toLowerCase();
    for (const term of sensitiveLogTerms) {
      assert.ok(
        !lower.includes(term),
        `${relative(file)}:${index + 1} logs potentially sensitive field ${term}`,
      );
    }
  });
}

console.log('logRedaction unit tests passed');
