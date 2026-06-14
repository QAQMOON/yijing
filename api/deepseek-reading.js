const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';
const REQUEST_TIMEOUT_MS = 25000;
const CACHE_TTL_MS = 60 * 60 * 1000;
const MAX_CACHE_ITEMS = 120;
const MAX_BODY_BYTES = 128 * 1024;
const AI_READING_COST = 2;
const RATE_LIMIT_WINDOW_MS = Number(process.env.AI_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000);
const RATE_LIMIT_MAX = Number(process.env.AI_RATE_LIMIT_MAX || 8);
const DAILY_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const DAILY_LIMIT_MAX = Number(process.env.AI_DAILY_LIMIT_MAX || 40);

const globalState = globalThis.__YIJIE_DEEPSEEK_STATE__ || {
  responseCache: new Map(),
  rateBuckets: new Map(),
};
globalThis.__YIJIE_DEEPSEEK_STATE__ = globalState;

class HttpError extends Error {
  constructor(status, code, message, headers = {}) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.headers = headers;
  }
}

class ValidationError extends HttpError {
  constructor(message) {
    super(400, 'validation_error', message);
    this.name = 'ValidationError';
  }
}

class ConfigError extends HttpError {
  constructor(message) {
    super(503, 'service_unavailable', message);
    this.name = 'ConfigError';
  }
}

function sendJson(res, status, payload, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  Object.entries(headers).forEach(([key, value]) => {
    if (value !== undefined && value !== null) res.setHeader(key, String(value));
  });
  res.end(JSON.stringify(payload));
}

function sendError(res, error) {
  const status = error instanceof HttpError
    ? error.status
    : error.name === 'AbortError'
      ? 504
      : 502;
  const code = error instanceof HttpError
    ? error.code
    : error.name === 'AbortError'
      ? 'upstream_timeout'
      : 'upstream_error';
  const logger = status >= 500 ? console.error : console.warn;
  logger('[deepseek-reading]', {
    status,
    code,
    message: error.message || 'AI 解读失败',
  });

  sendJson(res, status, {
    error: {
      code,
      message: error.message || 'AI 解读失败',
    },
  }, error.headers || {});
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new ValidationError('请求内容过大'));
        req.destroy();
        return;
      }
      body += chunk;
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

  const domain = ['liuyao', 'bazi'].includes(payload.domain) ? payload.domain : '';
  if (!domain) {
    throw new ValidationError('当前 AI 解读暂不支持该排盘类型');
  }

  const chart = payload.chart;
  if (!chart || typeof chart !== 'object') {
    throw new ValidationError('缺少排盘上下文');
  }

  if (domain === 'liuyao' && (!chart.baseHex?.name || !chart.changedHex?.name)) {
    throw new ValidationError('缺少本卦或变卦信息');
  }

  if (domain === 'bazi' && (!chart.pillars?.year?.full || !chart.pillars?.month?.full || !chart.pillars?.day?.full || !chart.pillars?.hour?.full)) {
    throw new ValidationError('缺少八字四柱信息');
  }

  const style = ['plain', 'scholar'].includes(payload.style) ? payload.style : 'plain';
  const depth = ['brief', 'full'].includes(payload.depth) ? payload.depth : 'brief';

  return {
    domain,
    style,
    depth,
    question: cleanText(payload.question, 160),
    chart,
  };
}

function getCachedResult(key) {
  const cached = globalState.responseCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.createdAt > CACHE_TTL_MS) {
    globalState.responseCache.delete(key);
    return null;
  }
  return cached.result;
}

function setCachedResult(key, result) {
  if (globalState.responseCache.size >= MAX_CACHE_ITEMS) {
    const firstKey = globalState.responseCache.keys().next().value;
    if (firstKey) globalState.responseCache.delete(firstKey);
  }
  globalState.responseCache.set(key, { createdAt: Date.now(), result });
}

function getHeader(req, name) {
  const value = req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function getClientIp(req) {
  const forwarded = getHeader(req, 'x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function getRequester(req) {
  const accountId = cleanText(getHeader(req, 'x-yijie-account-id'), 80);
  if (accountId && !/^acct_[a-z0-9]+_[a-z0-9]+$/i.test(accountId)) {
    throw new HttpError(401, 'invalid_account_context', '账户上下文无效');
  }

  const requiredToken = process.env.YIJIE_API_ACCESS_TOKEN;
  if (requiredToken) {
    const auth = getHeader(req, 'authorization') || '';
    if (auth !== `Bearer ${requiredToken}`) {
      throw new HttpError(401, 'unauthorized', '访问验证未通过');
    }
  }

  return accountId ? `acct:${accountId}` : `ip:${getClientIp(req)}`;
}

function hitBucket(key, max, windowMs) {
  const now = Date.now();
  const current = globalState.rateBuckets.get(key);
  if (!current || current.resetAt <= now) {
    const next = { count: 1, resetAt: now + windowMs };
    globalState.rateBuckets.set(key, next);
    return { limit: max, remaining: max - 1, resetAt: next.resetAt };
  }

  if (current.count >= max) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    throw new HttpError(429, 'rate_limit_exceeded', `请求过于频繁，请 ${retryAfter} 秒后再试`, {
      'Retry-After': retryAfter,
      'X-RateLimit-Limit': max,
      'X-RateLimit-Remaining': 0,
      'X-RateLimit-Reset': Math.ceil(current.resetAt / 1000),
    });
  }

  current.count += 1;
  return { limit: max, remaining: max - current.count, resetAt: current.resetAt };
}

function checkRateLimit(requester) {
  const shortWindow = hitBucket(`short:${requester}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  const dailyWindow = hitBucket(`daily:${requester}`, DAILY_LIMIT_MAX, DAILY_LIMIT_WINDOW_MS);
  return {
    'X-RateLimit-Limit': shortWindow.limit,
    'X-RateLimit-Remaining': Math.min(shortWindow.remaining, dailyWindow.remaining),
    'X-RateLimit-Reset': Math.ceil(shortWindow.resetAt / 1000),
  };
}

function buildSystemPrompt({ domain, style, depth }) {
  const styleGuide = style === 'scholar'
    ? '用较严谨的术语解释原理，但每段都要给出白话落点。'
    : '用通俗中文解释，少用术语；必须让没有术数基础的人也能看懂。';
  const depthGuide = domain === 'bazi'
    ? (depth === 'full'
        ? '输出较完整，包含【信息核对】【结论】【依据】【排盘分析】【行动建议】【风险提醒】【后续观察】七部分。'
        : '输出精简，控制在六段以内，包含【信息核对】【结论】【依据】【建议】。')
    : (depth === 'full'
        ? '输出较完整，包含【结论】【依据】【排盘分析】【行动建议】【风险提醒】【后续观察】六部分。'
        : '输出精简，控制在五段以内，包含【结论】【依据】【建议】。');
  const domainGuide = domain === 'bazi'
    ? [
        '你是“易解”的八字解读助手。',
        '你只根据用户提供的八字排盘上下文做传统文化解读和决策参考，不做绝对化断言。',
        '在正式解读前，必须先在内部确认资料是否完整：公历或农历出生时间、性别、出生地或经度、四柱、日主、节气边界、大运顺逆与起运信息。若核心信息缺失，先输出“需要补充的信息”，不要强行断。',
        '如果四柱完整但真太阳时、出生地校时或精确起运缺失，可以继续解读，但必须明确说明“以下按当前排盘参考”。',
        '分析时必须按专业步骤推进：先看日主与月令，再看四柱根气与旺衰，再看五行生克制化，再看十神组合与格局倾向，再看神煞作为辅证，最后结合大运流年落到用户选择的重点。',
        '结论要比普通闲聊更明确：可以使用“较强、偏弱、较有利、需谨慎、短期不宜、适合先做”等清楚判断，避免只说“可能、也许、看情况”。但不得把推断说成百分百确定。',
        '针对事业财运、感情家庭、大运流年、健康习惯等重点，要给出现实可执行建议，并说明这些建议对应的八字依据。',
        '涉及健康只能谈作息、压力、饮食、运动等生活习惯倾向，不得诊断疾病；涉及财务只能谈风险偏好和节奏，不得给投资指令。',
        '不得编造用户未提供的出生信息、神煞、古籍原文或现实经历。',
      ]
    : [
        '你是“易解”的六爻解读助手。',
        '你只根据用户提供的六爻排盘上下文做传统文化解读和决策参考，不做绝对化断言。',
        '分析时优先使用卦辞、彖传、象传、爻辞、动爻、纳甲、六亲、世应、月日空亡和干支信息。',
        '古籍依据只能引用用户提供的卦辞、彖传、象传、爻辞和排盘信息；没有提供的内容，不得编造书名或原文。',
      ];

  return [
    ...domainGuide,
    '不得声称能替代医疗、法律、投资、心理咨询等专业服务。',
    '遇到婚恋、健康、财务等敏感问题，要给出稳妥建议和风险提示。',
    styleGuide,
    depthGuide,
    '不要输出内部思维过程，不要出现“正在思考”之类的标题或自我说明。',
    '输出必须是中文纯文本，段落清晰，不使用 Markdown 表格。',
  ].join('\n');
}

function buildUserPrompt(payload) {
  const { chart, question } = payload;
  if (payload.domain === 'bazi') {
    return JSON.stringify({
      focus: question || chart.focus || '综合解读',
      calendar: chart.calendar,
      birth: chart.birth,
      gender: chart.gender,
      calibration: chart.calibration || null,
      dayMaster: chart.dayMaster,
      pillars: chart.pillars,
      luck: chart.luck,
      shenSha: chart.shenSha,
      upcomingAnnualLuck: chart.upcomingAnnualLuck,
    }, null, 2);
  }

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
    classicContext: chart.classicContext || null,
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
    throw new ConfigError('AI 解读暂未开通，请稍后再试');
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
    console.error('[deepseek-reading] upstream error', data.error || response.status);
    throw new HttpError(502, 'upstream_error', 'AI 解读暂时不可用，请稍后再试');
  }

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new HttpError(502, 'empty_upstream_response', 'AI 解读暂时没有返回内容，请稍后再试');

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
    sendError(res, new HttpError(405, 'method_not_allowed', 'Method Not Allowed'));
    return;
  }

  try {
    const raw = await readBody(req);
    const payload = normalizePayload(raw ? JSON.parse(raw) : {});
    const requester = getRequester(req);
    const cacheKey = JSON.stringify(payload);
    const cached = getCachedResult(cacheKey);
    if (cached) {
      sendJson(res, 200, { ...cached, cached: true }, { 'X-Yijie-Cache': 'hit' });
      return;
    }

    const rateHeaders = checkRateLimit(requester);
    const result = await requestDeepSeek(payload);
    setCachedResult(cacheKey, result);
    sendJson(res, 200, result, rateHeaders);
  } catch (error) {
    if (error instanceof SyntaxError) {
      sendError(res, new ValidationError('请求 JSON 格式无效'));
      return;
    }
    sendError(res, error);
  }
}
