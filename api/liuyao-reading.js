import { TextDecoder } from 'node:util';

const CHINA95_FORM_URL = 'https://p.china95.com/liuyao/index.asp';
const CHINA95_RESULT_URL = 'https://p.china95.com/liuyao/liuyao.asp';
const REQUEST_TIMEOUT_MS = 10000;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const READING_SECTIONS = ['总体', '事业', '经商', '求名', '出外', '婚恋', '决策'];
const VALUE_TO_CHINA95_YAO = {
  6: '0',
  7: '1',
  8: '2',
  9: '3',
};
const responseCache = new Map();

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
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
      if (body.length > 64 * 1024) {
        reject(new Error('请求内容过大'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function numberOrFallback(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function numberInRange(value, min, max) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max;
}

function normalizeDateParts(value) {
  const now = new Date();
  const date = {
    year: numberOrFallback(value?.year, now.getFullYear()),
    month: numberOrFallback(value?.month, now.getMonth() + 1),
    day: numberOrFallback(value?.day, now.getDate()),
    hour: numberOrFallback(value?.hour, now.getHours()),
    minute: numberOrFallback(value?.minute, now.getMinutes()),
  };

  if (
    !numberInRange(date.year, 1900, 2100)
    || !numberInRange(date.month, 1, 12)
    || !numberInRange(date.day, 1, 31)
    || !numberInRange(date.hour, 0, 23)
    || !numberInRange(date.minute, 0, 59)
  ) {
    throw new ValidationError('起卦时间参数无效');
  }

  return date;
}

function normalizeYaoValues(payload) {
  if (Array.isArray(payload?.values) && payload.values.length === 6) {
    return payload.values.map((value) => VALUE_TO_CHINA95_YAO[Number(value)] ?? null);
  }

  if (Array.isArray(payload?.lines) && payload.lines.length === 6) {
    return payload.lines.map((line) => (Number(line) === 1 ? VALUE_TO_CHINA95_YAO[7] : VALUE_TO_CHINA95_YAO[8]));
  }

  return [];
}

function buildChina95Form(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new ValidationError('请求内容格式无效');
  }

  const date = normalizeDateParts(payload?.castAt);
  const yaoValues = normalizeYaoValues(payload);
  if (yaoValues.length !== 6 || yaoValues.some((value) => value === null)) {
    throw new ValidationError('缺少有效的六爻数据，请重新起卦');
  }

  const fields = {
    csyear: '1990',
    mysex: '男',
    whyarea: '0',
    year: date.year,
    month: date.month,
    day: date.day,
    hour: date.hour,
    minute: date.minute,
    mode: '2',
    ok: '确定',
  };

  yaoValues.forEach((value, index) => {
    fields[`yao${index + 1}`] = value;
  });

  return Object.entries(fields)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
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

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function decodeHtmlEntities(text) {
  const named = {
    nbsp: ' ',
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    copy: '©',
  };

  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code) => {
    const lower = code.toLowerCase();
    if (named[lower]) return named[lower];
    if (lower.startsWith('#x')) return String.fromCodePoint(Number.parseInt(lower.slice(2), 16));
    if (lower.startsWith('#')) return String.fromCodePoint(Number.parseInt(lower.slice(1), 10));
    return entity;
  });
}

function htmlToPlainText(html) {
  return decodeHtmlEntities(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|td|tr|table|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\r/g, '\n')
    .replace(/[ \t\f\v]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function extractComputerReading(html) {
  const plain = htmlToPlainText(html).replace(/\s+/g, ' ').trim();
  const start = plain.indexOf('电脑解卦');
  if (start < 0) {
    const alert = html.match(/window\.alert\('([^']+)/)?.[1];
    throw new Error(alert || '电脑解卦暂时没有返回有效内容');
  }

  const afterMarker = plain.slice(start);
  const copyright = afterMarker.search(/\s(?:Copyright|版权所有|元亨利贞网免费算命论坛)/i);
  const text = (copyright > 0 ? afterMarker.slice(0, copyright) : afterMarker)
    .replace(/^电脑解卦[:：]\s*/, '')
    .trim();

  if (!text) throw new Error('电脑解卦暂时没有返回有效内容');
  return text;
}

function parseSections(text) {
  const markers = ['事业', '经商', '求名', '外出', '婚恋', '决策'];
  const sections = Object.fromEntries(READING_SECTIONS.map((name) => [name, '']));
  const sectionName = {
    外出: '出外',
  };
  const pattern = new RegExp(`(${markers.join('|')})[:：]`, 'g');
  const matches = [...text.matchAll(pattern)];

  if (!matches.length) {
    sections.总体 = text;
    return sections;
  }

  sections.总体 = text.slice(0, matches[0].index).trim();

  matches.forEach((match, index) => {
    const label = sectionName[match[1]] || match[1];
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? text.length;
    sections[label] = text.slice(start, end).trim();
  });

  return sections;
}

async function fetchChina95Reading(payload) {
  const body = buildChina95Form(payload);
  const cached = getCachedResult(body);
  if (cached) return cached;

  const response = await fetchWithTimeout(CHINA95_RESULT_URL, {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; YijingWisdom/1.0)',
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: CHINA95_FORM_URL,
      Origin: 'https://p.china95.com',
    },
    body,
  });

  if (!response.ok) {
    console.error('[liuyao-reading] upstream error', response.status);
    throw new Error('电脑解卦暂时不可用，请稍后再试');
  }

  const html = new TextDecoder('gb18030').decode(await response.arrayBuffer());
  const text = extractComputerReading(html);
  const result = {
    source: 'china95',
    sourceUrl: CHINA95_RESULT_URL,
    text,
    sections: parseSections(text),
  };
  setCachedResult(body, result);
  return result;
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
    sendJson(res, 405, { error: '请在页面中提交排盘后查看解读' });
    return;
  }

  try {
    const raw = await readBody(req);
    const payload = raw ? JSON.parse(raw) : {};
    const result = await fetchChina95Reading(payload);
    sendJson(res, 200, result);
  } catch (error) {
    const status = error instanceof ValidationError
      ? 400
      : error.name === 'AbortError'
        ? 504
        : 502;

    sendJson(res, status, {
      error: error.message || '电脑解卦暂时不可用',
    });
  }
}
