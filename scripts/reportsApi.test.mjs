import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { CommercialError } from '../api/_commercial.js';
import { createReportsHandler } from '../api/reports.js';

const ownUserId = '00000000-0000-0000-0000-000000000001';
const otherUserId = '00000000-0000-0000-0000-000000000002';
const ownReportId = '11111111-1111-1111-1111-111111111111';
const otherReportId = '22222222-2222-2222-2222-222222222222';

function createRequest({ method = 'GET', url = '/api/reports', body = '', headers = {} } = {}) {
  const req = Readable.from(body ? [Buffer.from(body)] : []);
  req.method = method;
  req.url = url;
  req.headers = headers;
  return req;
}

function createResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(key, value) {
      this.headers[key.toLowerCase()] = value;
    },
    end(chunk = '') {
      this.body += chunk;
    },
  };
}

function matchesFilters(row, filters) {
  return filters.every(([key, value]) => row[key] === value);
}

function createReportsQuery(state) {
  return {
    mode: 'select',
    filters: [],
    limitValue: 100,
    select() {
      return this;
    },
    delete() {
      this.mode = 'delete';
      return this;
    },
    eq(key, value) {
      this.filters.push([key, value]);
      return this;
    },
    order() {
      return this;
    },
    limit(value) {
      this.limitValue = value;
      return this;
    },
    async execute() {
      if (this.mode === 'delete') {
        state.reports = state.reports.filter((row) => !matchesFilters(row, this.filters));
        return { error: null };
      }

      const rows = state.reports.filter((row) => matchesFilters(row, this.filters)).slice(0, this.limitValue);
      return { data: rows, error: null };
    },
    then(resolve, reject) {
      return this.execute().then(resolve, reject);
    },
  };
}

function createSupabase(state) {
  return {
    from(table) {
      assert.equal(table, 'ai_reports');
      return createReportsQuery(state);
    },
  };
}

function createReport(overrides = {}) {
  return {
    id: ownReportId,
    user_id: ownUserId,
    domain: 'bazi',
    title: '八字报告',
    question: '事业',
    style: 'plain',
    depth: 'brief',
    provider: 'deepseek',
    model: 'deepseek-chat',
    cost: 2,
    content: '报告正文',
    chart: { test: true },
    usage: null,
    created_at: '2026-06-21T00:00:00Z',
    ...overrides,
  };
}

async function invoke(handler, options) {
  const req = createRequest(options);
  const res = createResponse();
  await handler(req, res);
  return {
    status: res.statusCode,
    headers: res.headers,
    payload: res.body ? JSON.parse(res.body) : null,
  };
}

function createHandler(state, overrides = {}) {
  return createReportsHandler({
    authenticateRequest: async () => ({ user: { id: ownUserId } }),
    ensureProfileAndStarterCredits: async () => {},
    getSupabaseServiceClient: () => createSupabase(state),
    ...overrides,
  });
}

{
  const state = {
    reports: [
      createReport(),
      createReport({ id: otherReportId, user_id: otherUserId, domain: 'bazi', title: '他人报告' }),
      createReport({ id: '33333333-3333-3333-3333-333333333333', user_id: ownUserId, domain: 'liuyao' }),
    ],
  };
  const response = await invoke(createHandler(state), {
    method: 'GET',
    url: '/api/reports?domain=bazi',
  });

  assert.equal(response.status, 200);
  assert.equal(response.payload.reports.length, 1);
  assert.equal(response.payload.reports[0].id, ownReportId);
}

{
  const response = await invoke(createHandler({ reports: [] }, {
    authenticateRequest: async () => {
      throw new CommercialError(401, 'unauthorized', '请先登录后再继续');
    },
  }), { method: 'GET' });

  assert.equal(response.status, 401);
  assert.equal(response.payload.error.code, 'unauthorized');
}

{
  const state = { reports: [createReport()] };
  const response = await invoke(createHandler(state), {
    method: 'DELETE',
    body: JSON.stringify({ id: 'not-a-uuid' }),
  });

  assert.equal(response.status, 400);
  assert.equal(response.payload.error.code, 'validation_error');
  assert.equal(state.reports.length, 1);
}

{
  const state = { reports: [createReport(), createReport({ id: otherReportId, user_id: otherUserId })] };
  const response = await invoke(createHandler(state), {
    method: 'DELETE',
    body: JSON.stringify({ id: otherReportId }),
  });

  assert.equal(response.status, 200);
  assert.equal(state.reports.some((report) => report.id === otherReportId), true);
}

{
  const state = { reports: [createReport()] };
  const response = await invoke(createHandler(state), {
    method: 'DELETE',
    body: JSON.stringify({ id: ownReportId }),
  });

  assert.equal(response.status, 200);
  assert.equal(state.reports.length, 0);
}

{
  const response = await invoke(createHandler({ reports: [] }), {
    method: 'DELETE',
    body: JSON.stringify({ id: ownReportId, padding: 'x'.repeat(20 * 1024) }),
  });

  assert.equal(response.status, 413);
  assert.equal(response.payload.error.code, 'request_too_large');
}

{
  const response = await invoke(createHandler({ reports: [] }), {
    method: 'DELETE',
    body: '{"id":',
  });

  assert.equal(response.status, 400);
  assert.equal(response.payload.error.code, 'validation_error');
}

console.log('reportsApi unit tests passed');
