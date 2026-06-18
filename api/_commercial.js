import { createHash } from 'node:crypto';

export const AI_READING_COST = 2;
export const STARTER_CREDITS = 8;
export const REPORT_DOMAINS = ['liuyao', 'bazi', 'ziwei', 'combined'];

export class CommercialError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'CommercialError';
    this.status = status;
    this.code = code;
  }
}

export function getBearerToken(headers = {}) {
  const raw = headers.authorization || headers.Authorization || '';
  const value = Array.isArray(raw) ? raw[0] : raw;
  const match = String(value).match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || '';
}

export function assertAuthenticated(token) {
  if (!token) {
    throw new CommercialError(401, 'unauthorized', '请先登录后再生成 AI 报告');
  }
}

export function assertSufficientCredits(balance, cost = AI_READING_COST) {
  if (!Number.isFinite(balance) || balance < cost) {
    throw new CommercialError(402, 'insufficient_credits', `积分不足，需要 ${cost} 积分`);
  }
}

export function normalizeReportDomain(value) {
  return REPORT_DOMAINS.includes(value) ? value : '';
}

export function normalizeReportDomainFilter(value) {
  if (!value || value === 'all') return '';
  return normalizeReportDomain(value);
}

export function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  const entries = Object.entries(value)
    .filter(([, item]) => item !== undefined)
    .sort(([left], [right]) => left.localeCompare(right));
  return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(',')}}`;
}

export function buildPayloadCacheKey(payload) {
  return stableStringify(payload);
}

export function buildReportIdempotencyKey({ userId, cacheKey }) {
  const hash = createHash('sha256')
    .update(String(userId || ''))
    .update('\n')
    .update(String(cacheKey || ''))
    .digest('hex');
  return `ai-report:v1:${hash}`;
}

export function makeDefaultReportTitle(payload) {
  const domain = normalizeReportDomain(payload?.domain);
  const question = String(payload?.question || '').trim();
  if (question) return question.slice(0, 40);
  if (domain === 'bazi') return '八字 AI 解读';
  if (domain === 'ziwei') return '紫微 AI 解读';
  if (domain === 'combined') return '双术合参报告';
  return '六爻 AI 解读';
}

export function buildReportRecord({ userId, payload, result, title, cost = AI_READING_COST }) {
  const domain = normalizeReportDomain(payload?.domain);
  if (!domain) {
    throw new CommercialError(400, 'validation_error', '当前 AI 解读暂不支持该排盘类型');
  }

  return {
    user_id: userId,
    domain,
    title: String(title || makeDefaultReportTitle(payload)).trim().slice(0, 80),
    question: String(payload?.question || '').trim().slice(0, 160) || null,
    style: payload?.style || 'plain',
    depth: payload?.depth || 'brief',
    provider: result?.provider || 'deepseek',
    model: result?.model || null,
    cost,
    content: result?.text || '',
    chart: payload?.chart || {},
    usage: result?.usage || null,
  };
}

export function buildAiResultFromReportRow(row, extra = {}) {
  return {
    provider: row.provider,
    model: row.model,
    text: row.content,
    usage: row.usage || null,
    cost: row.cost,
    reportId: row.id,
    balanceAfter: Number(extra.balanceAfter || 0),
    alreadyProcessed: true,
    cached: true,
  };
}

export function mapReportRow(row) {
  return {
    id: row.id,
    domain: row.domain,
    title: row.title,
    question: row.question || '',
    style: row.style,
    depth: row.depth,
    provider: row.provider,
    model: row.model,
    cost: row.cost,
    text: row.content,
    chart: row.chart,
    usage: row.usage,
    createdAt: row.created_at,
    cloudStatus: 'cloud',
  };
}
