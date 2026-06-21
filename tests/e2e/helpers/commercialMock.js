import { expect } from '@playwright/test';

export const MOCK_ACCESS_TOKEN = 'e2e-access-token';
const SUPABASE_STORAGE_KEY = 'sb-e2e-auth-token';
const AI_COST = 2;

function nowIso() {
  return new Date('2026-06-22T08:00:00.000Z').toISOString();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createMockReport(overrides = {}) {
  return {
    id: overrides.id || '11111111-1111-4111-8111-111111111111',
    domain: overrides.domain || 'combined',
    title: overrides.title || '双术合参：本地测试',
    question: overrides.question || '本地测试问题',
    style: overrides.style || 'plain',
    depth: overrides.depth || 'brief',
    provider: 'deepseek',
    model: 'mock-model',
    cost: AI_COST,
    text: overrides.text || '【结论】这是本地 mock AI 报告。',
    chart: overrides.chart || {},
    usage: null,
    createdAt: overrides.createdAt || nowIso(),
    cloudStatus: 'cloud',
  };
}

export async function installMockSession(page, {
  email = 'e2e-user@example.com',
  displayName = 'E2E 用户',
} = {}) {
  await page.addInitScript(({ key, token, userEmail, name, createdAt }) => {
    window.localStorage.setItem(key, JSON.stringify({
      access_token: token,
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: 'e2e-refresh-token',
      user: {
        id: '00000000-0000-4000-8000-000000000001',
        aud: 'authenticated',
        role: 'authenticated',
        email: userEmail,
        user_metadata: { display_name: name },
        created_at: createdAt,
      },
    }));
  }, {
    key: SUPABASE_STORAGE_KEY,
    token: MOCK_ACCESS_TOKEN,
    userEmail: email,
    name: displayName,
    createdAt: nowIso(),
  });
}

export async function mockSupabaseOtp(page) {
  await page.route('https://e2e.supabase.co/auth/v1/otp*', async (route) => {
    expect(route.request().method()).toBe('POST');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });
}

export async function mockCommercialApis(page, options = {}) {
  const state = {
    credits: options.credits ?? 8,
    reports: [...(options.reports || [])],
    deepseekCalls: 0,
    failNextAi: false,
    savedByPayload: new Map(),
  };

  function accountPayload() {
    return {
      account: {
        id: '00000000-0000-4000-8000-000000000001',
        identifier: 'e2e-user@example.com',
        displayName: 'E2E 用户',
        credits: state.credits,
        plan: '基础账号',
        createdAt: nowIso(),
        ledger: [
          {
            id: 'ledger-grant',
            type: 'grant',
            amount: 8,
            balanceAfter: 8,
            reason: '新账户试用积分',
            createdAt: nowIso(),
          },
        ],
      },
    };
  }

  function requireAuth(route) {
    const authorization = route.request().headers().authorization || '';
    expect(authorization).toBe(`Bearer ${MOCK_ACCESS_TOKEN}`);
  }

  await page.route('**/api/account', async (route) => {
    requireAuth(route);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(accountPayload()),
    });
  });

  await page.route('**/api/reports**', async (route) => {
    requireAuth(route);
    const request = route.request();
    if (request.method() === 'GET') {
      const url = new URL(request.url());
      const domain = url.searchParams.get('domain');
      const reports = domain
        ? state.reports.filter((report) => report.domain === domain)
        : state.reports;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ reports }),
      });
      return;
    }

    if (request.method() === 'DELETE') {
      const payload = request.postDataJSON();
      state.reports = state.reports.filter((report) => report.id !== payload.id);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
      return;
    }

    await route.fulfill({ status: 405, body: '{}' });
  });

  await page.route('**/api/deepseek-reading', async (route) => {
    requireAuth(route);
    const request = route.request();
    expect(request.method()).toBe('POST');
    state.deepseekCalls += 1;

    if (state.failNextAi) {
      state.failNextAi = false;
      await route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: 'upstream_error',
            message: 'AI 解读暂时不可用，请稍后再试',
          },
        }),
      });
      return;
    }

    const payload = request.postDataJSON();
    await sleep(options.aiDelayMs ?? 200);
    const key = JSON.stringify(payload);
    const existing = state.savedByPayload.get(key);
    if (existing) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...existing.result,
          alreadyProcessed: true,
          cached: true,
        }),
      });
      return;
    }

    if (state.credits < AI_COST) {
      await route.fulfill({
        status: 402,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: 'insufficient_credits',
            message: `积分不足，需要 ${AI_COST} 积分`,
          },
        }),
      });
      return;
    }

    state.credits -= AI_COST;
    const reportId = `22222222-2222-4222-8222-${String(state.reports.length + 1).padStart(12, '0')}`;
    const report = createMockReport({
      id: reportId,
      domain: payload.domain,
      title: payload.title || 'AI 解读报告',
      question: payload.question || '',
      style: payload.style || 'plain',
      depth: payload.depth || 'brief',
      text: options.aiText || `【结论】这是${payload.domain}本地 mock AI 解读。\n\n【依据】已保存到云端报告历史。`,
      chart: payload.chart,
    });
    state.reports.unshift(report);
    const result = {
      provider: 'deepseek',
      model: 'mock-model',
      text: report.text,
      usage: null,
      cost: AI_COST,
      reportId,
      balanceAfter: state.credits,
      alreadyProcessed: false,
      cached: false,
    };
    state.savedByPayload.set(key, { report, result });
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(result),
    });
  });

  return {
    state,
    failNextAi() {
      state.failNextAi = true;
    },
  };
}

export async function setupSignedInCommercialMocks(page, options = {}) {
  await installMockSession(page, options);
  return mockCommercialApis(page, options);
}
