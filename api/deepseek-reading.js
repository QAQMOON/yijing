const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';
const REQUEST_TIMEOUT_MS = 25000;
const CACHE_TTL_MS = 60 * 60 * 1000;
const MAX_BODY_BYTES = 128 * 1024;
const AI_READING_COST = 2;
const responseCache = new Map();

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

class ConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfigError';
  }
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > MAX_BODY_BYTES) {
        reject(new ValidationError('请求内容过大'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function cleanText(value, maxLength = 1200) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function normalizePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new ValidationError('请求内容格式无效');
  }

  if (payload.domain !== 'liuyao') {
    throw new ValidationError('当前 AI 解读先支持六爻排盘');
  }

  const chart = payload.chart;
  if (!chart || typeof chart !== 'object') {
    throw new ValidationError('缺少排盘上下文');
  }

  if (!chart.baseHex?.name || !chart.changedHex?.name) {
    throw new ValidationError('缺少本卦或变卦信息');
  }

  const style = ['plain', 'scholar'].includes(payload.style) ? payload.style : 'plain';
  const depth = ['brief', 'full'].includes(payload.depth) ? payload.depth : 'brief';

  return {
    domain: 'liuyao',
    style,
    depth,
    question: cleanText(payload.question, 160),
    chart,
  };
}

function getCachedResult(key) {
  const cached = responseCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.createdAt > CACHE_TTL_MS) {
    responseCache.delete(key);
    return null;
  }
  return cached.result;
}

function setCachedResult(key, result) {
  responseCache.set(key, { createdAt: Date.now(), result });
}

function buildSystemPrompt({ style, depth }) {
  const styleGuide = style === 'scholar'
    ? '用较严谨的术语解释卦象、纳甲、动爻与干支关系，但每段都要给出白话落点。'
    : '用通俗中文解释，少用术语；必须让没有术数基础的人也能看懂。';
  const depthGuide = depth === 'full'
    ? '输出较完整，包含结论、卦象、动爻、时令、建议、提醒六部分。'
    : '输出精简，控制在五段以内，先给结论再给依据。';

  return [
    '你是“易解”的六爻解读助手。',
    '你只根据用户提供的排盘上下文做文化解读和决策参考，不做绝对化断言。',
    '不得声称能替代医疗、法律、投资、心理咨询等专业服务。',
    '遇到婚恋、健康、财务等敏感问题，要给出稳妥建议和风险提示。',
    styleGuide,
    depthGuide,
    '输出必须是中文纯文本，段落清晰，不使用 Markdown 表格。',
  ].join('\n');
}

function buildUserPrompt(payload) {
  const { chart, question } = payload;
  const rows = Array.isArray(chart.najiaRows)
    ? chart.najiaRows.map((row) => ({
        position: row.index,
        sixGod: row.sixGod,
        relative: row.relative,
        line: row.baseLineText,
        changedLine: row.changedLineText,
        mark: row.mark,
        moving: row.isMoving,
      }))
    : [];

  return JSON.stringify({
    question: question || chart.meta?.question || '',
    baseHex: chart.baseHex,
    changedHex: chart.changedHex,
    palace: chart.palace,
    movingLines: chart.movingLines,
    values: chart.values,
    date: chart.date,
    lunarDate: chart.lunarDate,
    pillars: chart.pillars,
    voidBranches: chart.voidBranches,
    najiaRows: rows,
  }, null, 2);
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function requestDeepSeek(payload) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new ConfigError('DeepSeek API Key 未配置');
  }

  const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
  const response = await fetchWithTimeout(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: payload.style === 'scholar' ? 0.35 : 0.55,
      messages: [
        { role: 'system', content: buildSystemPrompt(payload) },
        { role: 'user', content: buildUserPrompt(payload) },
      ],
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || `DeepSeek 请求失败：HTTP ${response.status}`);
  }

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('DeepSeek 未返回有效解读');

  return {
    provider: 'deepseek',
    model,
    text,
    usage: data.usage || null,
    cost: AI_READING_COST,
  };
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Allow', 'POST, OPTIONS');
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, { error: 'Method Not Allowed' });
    return;
  }

  try {
    const raw = await readBody(req);
    const payload = normalizePayload(raw ? JSON.parse(raw) : {});
    const cacheKey = JSON.stringify(payload);
    const cached = getCachedResult(cacheKey);
    if (cached) {
      sendJson(res, 200, { ...cached, cached: true });
      return;
    }

    const result = await requestDeepSeek(payload);
    setCachedResult(cacheKey, result);
    sendJson(res, 200, result);
  } catch (error) {
    const status = error instanceof ValidationError
      ? 400
      : error instanceof ConfigError
        ? 503
        : error.name === 'AbortError'
          ? 504
          : 502;

    sendJson(res, status, {
      error: error.message || 'AI 解读失败',
    });
  }
}
