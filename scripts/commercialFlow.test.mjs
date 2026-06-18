import assert from 'node:assert/strict';
import {
  AI_READING_COST,
  CommercialError,
  assertAuthenticated,
  assertSufficientCredits,
  buildAiResultFromReportRow,
  buildPayloadCacheKey,
  buildReportIdempotencyKey,
  buildReportRecord,
  getBearerToken,
  mapReportRow,
  normalizeReportDomainFilter,
} from '../api/_commercial.js';

assert.equal(getBearerToken({ authorization: 'Bearer token_123' }), 'token_123');
assert.equal(getBearerToken({}), '');

assert.throws(() => assertAuthenticated(''), (error) => {
  assert.equal(error instanceof CommercialError, true);
  assert.equal(error.status, 401);
  assert.equal(error.code, 'unauthorized');
  return true;
});

assert.throws(() => assertSufficientCredits(1, AI_READING_COST), (error) => {
  assert.equal(error instanceof CommercialError, true);
  assert.equal(error.status, 402);
  assert.equal(error.code, 'insufficient_credits');
  return true;
});

assert.doesNotThrow(() => assertSufficientCredits(2, AI_READING_COST));

const reportRecord = buildReportRecord({
  userId: '00000000-0000-0000-0000-000000000001',
  payload: {
    domain: 'combined',
    title: '双术合参：事业选择',
    question: '今年是否适合换工作？',
    style: 'plain',
    depth: 'brief',
    chart: { mode: 'bazi_liuyao' },
  },
  result: {
    provider: 'deepseek',
    model: 'deepseek-chat',
    text: '【结论】可以先准备，不宜仓促。',
    usage: { total_tokens: 128 },
  },
});

assert.equal(reportRecord.domain, 'combined');
assert.equal(reportRecord.cost, AI_READING_COST);
assert.equal(reportRecord.content, '【结论】可以先准备，不宜仓促。');
assert.deepEqual(reportRecord.chart, { mode: 'bazi_liuyao' });

const apiReport = mapReportRow({
  id: 'report-id',
  domain: 'bazi',
  title: '八字报告',
  question: '事业财运',
  style: 'plain',
  depth: 'brief',
  provider: 'deepseek',
  model: 'deepseek-chat',
  cost: 2,
  content: '报告正文',
  chart: { pillars: {} },
  usage: null,
  created_at: '2026-06-18T00:00:00Z',
});

assert.equal(apiReport.text, '报告正文');
assert.equal(apiReport.cloudStatus, 'cloud');
assert.equal(apiReport.createdAt, '2026-06-18T00:00:00Z');

assert.equal(normalizeReportDomainFilter('all'), '');
assert.equal(normalizeReportDomainFilter('liuyao'), 'liuyao');
assert.equal(normalizeReportDomainFilter('bad-domain'), '');

const payloadA = {
  domain: 'bazi',
  style: 'plain',
  depth: 'brief',
  question: '事业财运',
  chart: {
    pillars: {
      year: { full: '庚午' },
      month: { full: '辛巳' },
      day: { full: '癸亥' },
      hour: { full: '戊午' },
    },
  },
};
const payloadB = {
  chart: {
    pillars: {
      hour: { full: '戊午' },
      day: { full: '癸亥' },
      month: { full: '辛巳' },
      year: { full: '庚午' },
    },
  },
  question: '事业财运',
  depth: 'brief',
  style: 'plain',
  domain: 'bazi',
};

const cacheKeyA = buildPayloadCacheKey(payloadA);
const cacheKeyB = buildPayloadCacheKey(payloadB);
assert.equal(cacheKeyA, cacheKeyB);

const userId = '00000000-0000-0000-0000-000000000001';
const otherUserId = '00000000-0000-0000-0000-000000000002';
const idempotencyKey = buildReportIdempotencyKey({ userId, cacheKey: cacheKeyA });
assert.equal(idempotencyKey, buildReportIdempotencyKey({ userId, cacheKey: cacheKeyB }));
assert.notEqual(idempotencyKey, buildReportIdempotencyKey({ userId: otherUserId, cacheKey: cacheKeyA }));

function createFakeProcessor(initialBalance) {
  const state = {
    balance: initialBalance,
    ledger: [],
    reports: [],
    modelCalls: 0,
    contentCache: new Map(),
  };

  function generateText(cacheKey) {
    if (state.contentCache.has(cacheKey)) return { ...state.contentCache.get(cacheKey), cached: true };
    state.modelCalls += 1;
    const result = {
      provider: 'deepseek',
      model: 'mock-model',
      text: `报告正文 ${state.modelCalls}`,
      usage: null,
      cost: AI_READING_COST,
    };
    state.contentCache.set(cacheKey, result);
    return { ...result, cached: false };
  }

  function process({ key, cacheKey, payload, checkExistingFirst = true }) {
    const existing = state.ledger.find((item) => item.idempotencyKey === key);
    if (existing && checkExistingFirst) {
      const report = state.reports.find((item) => item.id === existing.reportId);
      return {
        ...buildAiResultFromReportRow(report, { balanceAfter: existing.balanceAfter }),
        alreadyProcessed: true,
      };
    }

    assertSufficientCredits(state.balance, AI_READING_COST);
    const result = generateText(cacheKey);
    const existingAfterCache = state.ledger.find((item) => item.idempotencyKey === key);
    if (existingAfterCache) {
      const report = state.reports.find((item) => item.id === existingAfterCache.reportId);
      return {
        ...buildAiResultFromReportRow(report, { balanceAfter: existingAfterCache.balanceAfter }),
        alreadyProcessed: true,
      };
    }

    const report = {
      id: `report-${state.reports.length + 1}`,
      domain: payload.domain,
      title: payload.title || 'AI 报告',
      question: payload.question,
      style: payload.style,
      depth: payload.depth,
      provider: result.provider,
      model: result.model,
      cost: result.cost,
      content: result.text,
      chart: payload.chart,
      usage: result.usage,
      created_at: '2026-06-19T00:00:00Z',
    };
    state.balance -= AI_READING_COST;
    state.reports.push(report);
    state.ledger.push({
      idempotencyKey: key,
      amount: -AI_READING_COST,
      balanceAfter: state.balance,
      reportId: report.id,
    });
    return {
      ...result,
      reportId: report.id,
      balanceAfter: state.balance,
      alreadyProcessed: false,
    };
  }

  return { state, process };
}

const firstProcessor = createFakeProcessor(8);
const firstCharge = firstProcessor.process({ key: idempotencyKey, cacheKey: cacheKeyA, payload: payloadA });
const duplicateCharge = firstProcessor.process({ key: idempotencyKey, cacheKey: cacheKeyA, payload: payloadB });
assert.equal(firstCharge.alreadyProcessed, false);
assert.equal(duplicateCharge.alreadyProcessed, true);
assert.equal(duplicateCharge.reportId, firstCharge.reportId);
assert.equal(firstProcessor.state.balance, 6);
assert.equal(firstProcessor.state.ledger.length, 1);
assert.equal(firstProcessor.state.reports.length, 1);
assert.equal(firstProcessor.state.modelCalls, 1);

const cachedProcessor = createFakeProcessor(8);
const cacheFirst = cachedProcessor.process({ key: idempotencyKey, cacheKey: cacheKeyA, payload: payloadA });
const cacheRetry = cachedProcessor.process({
  key: idempotencyKey,
  cacheKey: cacheKeyA,
  payload: payloadA,
  checkExistingFirst: false,
});
assert.equal(cacheFirst.reportId, cacheRetry.reportId);
assert.equal(cacheRetry.alreadyProcessed, true);
assert.equal(cachedProcessor.state.balance, 6);
assert.equal(cachedProcessor.state.ledger.length, 1);
assert.equal(cachedProcessor.state.reports.length, 1);
assert.equal(cachedProcessor.state.modelCalls, 1);

const insufficientProcessor = createFakeProcessor(1);
assert.throws(() => {
  insufficientProcessor.process({ key: idempotencyKey, cacheKey: cacheKeyA, payload: payloadA });
}, /积分不足/);
assert.equal(insufficientProcessor.state.ledger.length, 0);
assert.equal(insufficientProcessor.state.reports.length, 0);

console.log('commercialFlow unit tests passed');
