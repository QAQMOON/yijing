import { expect, test } from '@playwright/test';

const PUBLIC_ROUTES = [
  { path: '/', title: /易解 · 古籍依据 AI 解读/, h1: /.+/ },
  { path: '/liuyao', title: /六爻起卦排盘/, h1: /六\s*爻/ },
  { path: '/liuyao/hexagrams', title: /六十四卦查询/, h1: /六十\s*四\s*卦/ },
  { path: '/bazi', title: /八字排盘/, h1: /八\s*字/ },
  { path: '/ziwei', title: /紫微斗数排盘/, h1: /紫微斗数/ },
  { path: '/daliuren', title: /大六壬排盘/, h1: /大\s*六\s*壬/ },
  { path: '/qimen', title: /奇门遁甲排盘/, h1: /奇门遁甲/ },
  { path: '/classics', title: /藏经阁与术语库/, h1: /古籍依据/ },
  { path: '/reports', title: /AI 报告历史/, h1: /报告/ },
  { path: '/reports/combined', title: /双术合参报告/, h1: /八字看长期结构/ },
  { path: '/tools', title: /百宝袋/, h1: /排盘前/ },
  { path: '/account', title: /我的账户/, h1: /登录易解/ },
  { path: '/pricing', title: /积分套餐/, h1: /AI 解读按次消耗积分/ },
  { path: '/privacy', title: /隐私政策/, h1: /隐私政策/ },
  { path: '/terms', title: /服务条款/, h1: /服务条款/ },
  { path: '/roadmap', title: /更新计划/, h1: /更新计划/ },
];

test.describe('public route smoke', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route.path} renders metadata and layout`, async ({ page }, testInfo) => {
      const consoleIssues = [];
      page.on('console', (message) => {
        if (['error', 'warning'].includes(message.type())) {
          consoleIssues.push(message.text());
        }
      });

      await page.goto(route.path);
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveTitle(route.title);
      await expect(page.locator('h1').first()).toContainText(route.h1);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /易解|六爻|八字|紫微|奇门|大六壬|隐私|服务|更新计划|积分|账户|藏经阁|报告|百宝袋/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/yijing-pi\.vercel\.app/);

      const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(hasOverflow).toBe(false);
      expect(consoleIssues, `${testInfo.title} console issues`).toEqual([]);
    });
  }
});

test('mobile header stays compact', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const headerHeight = await page.locator('header').evaluate((node) => Math.round(node.getBoundingClientRect().height));
  expect(headerHeight).toBeLessThanOrEqual(130);
});

test('footer legal links work', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await page.getByRole('link', { name: '隐私政策' }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.locator('h1')).toContainText('隐私政策');

  await page.getByRole('link', { name: '服务条款' }).click();
  await expect(page).toHaveURL(/\/terms$/);
  await expect(page.locator('h1')).toContainText('服务条款');
});

test('local account can sign in and top up trial credits', async ({ page }) => {
  await page.goto('/account');
  await page.waitForLoadState('networkidle');

  await page.getByLabel('手机号或邮箱').fill('13800000000');
  await page.getByLabel('称呼').fill('易解测试');
  await page.getByRole('button', { name: '登录并领取积分' }).click();

  await expect(page.locator('h1')).toContainText('易解测试');
  await expect(page.getByText('可用积分')).toBeVisible();
  await expect(page.getByRole('link', { name: /8积分/ })).toBeVisible();

  await page.goto('/pricing');
  await page.getByRole('button', { name: '领取积分' }).nth(1).click();

  await expect(page.getByText('已为当前账号增加 68 积分。')).toBeVisible();
  await expect(page.getByRole('link', { name: /76积分/ })).toBeVisible();
});

test('bazi result loads true solar time calibration', async ({ page }) => {
  let requestBody;
  await page.route('**/api/metaphysics', async (route) => {
    const request = route.request();
    requestBody = request.postDataJSON();
    expect(request.method()).toBe('POST');
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        provider: 'metaphysics-steward',
        mode: 'bazi',
        config: {
          inputTime: '1990-05-08 12:00',
          trueSolarTime: '1990-05-08 11:49',
          birthplace: { name: '北京', longitude: 116.4, source: 'city' },
          sex: '男',
          lunarDate: '一九九〇年四月十四',
        },
        bazi: {
          yun: {
            start_desc: '9年7个月0天起运',
            start_time: '1999-12-08 11:49:10',
            da_yun: [
              { index: 1, pillar: '壬午', start_age: 10 },
              { index: 2, pillar: '癸未', start_age: 20 },
            ],
          },
        },
      }),
    });
  });

  await page.goto('/bazi/result?dt=1990-05-08T12%3A00&calendar=solar&gender=male&birthplace=%E5%8C%97%E4%BA%AC&mode=custom');
  await expect(page.getByText('真太阳时与起运校准')).toBeVisible();
  await expect(page.getByText('1990-05-08 11:49')).toBeVisible();
  await expect(page.getByText('9年7个月0天起运')).toBeVisible();
  expect(requestBody.birthplace).toBe('北京');
  expect(requestBody.mode).toBe('bazi');
});

test('bazi birthplace selector starts empty and can switch options', async ({ page }) => {
  await page.goto('/bazi/chart');
  await page.waitForLoadState('networkidle');

  const birthplace = page.getByLabel('出生地');
  await expect(birthplace).toHaveValue('');
  await expect(page.locator('#birthplace option')).toHaveCount(35);

  await birthplace.selectOption('北京');
  await expect(birthplace).toHaveValue('北京');

  await birthplace.selectOption('湖南');
  await expect(birthplace).toHaveValue('湖南');
});

test('AI reading flow is saved with mocked DeepSeek response', async ({ page }) => {
  await page.route('**/api/liuyao-reading', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        sections: {
          总体: '电脑解卦模拟内容',
        },
      }),
    });
  });

  await page.route('**/api/deepseek-reading', async (route) => {
    const request = route.request();
    expect(request.method()).toBe('POST');
    expect(request.headers()['x-yijie-account-id']).toMatch(/^acct_/);
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        provider: 'deepseek',
        model: 'mock-model',
        text: '【结论】这是 mock AI 解读。\n\n【古籍依据】依据传入的卦辞与动爻上下文。',
        cost: 2,
      }),
    });
  });

  await page.goto('/account');
  await page.getByLabel('手机号或邮箱').fill('ai-test@example.com');
  await page.getByLabel('称呼').fill('AI 测试');
  await page.getByRole('button', { name: '登录并领取积分' }).click();

  await page.goto('/liuyao/reading/1?lines=111111&values=7,7,7,7,7,7&source=random&question=%E5%B7%A5%E4%BD%9C%E9%80%89%E6%8B%A9');
  await expect(page.getByText('古籍依据会随请求传入')).toBeVisible();
  await page.getByRole('button', { name: '生成 AI 解读' }).click();
  await expect(page.getByText('正在推演卦象，请稍候')).toBeVisible();
  await expect(page.getByText('这是 mock AI 解读')).toBeVisible();

  await page.goto('/reports');
  await expect(page.getByText('乾为天之乾为天')).toBeVisible();
  await expect(page.getByText('这是 mock AI 解读').first()).toBeVisible();
});

test('bazi AI reading flow is saved with mocked DeepSeek response', async ({ page }) => {
  await page.route('**/api/metaphysics', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        config: {
          inputTime: '1990-05-08 12:00',
          trueSolarTime: '1990-05-08 11:49',
          birthplace: { name: '北京', longitude: 116.4, source: 'city' },
          sex: '男',
          lunarDate: '一九九〇年四月十四',
        },
        bazi: {
          yun: {
            start_desc: '9年7个月0天起运',
            start_time: '1999-12-08 11:49:10',
            da_yun: [
              { index: 1, pillar: '壬午', start_age: 10 },
              { index: 2, pillar: '癸未', start_age: 20 },
            ],
          },
        },
      }),
    });
  });

  await page.route('**/api/deepseek-reading', async (route) => {
    const request = route.request();
    const body = request.postDataJSON();
    expect(request.method()).toBe('POST');
    expect(request.headers()['x-yijie-account-id']).toMatch(/^acct_/);
    expect(body.domain).toBe('bazi');
    expect(body.chart.pillars.year.full).toBeTruthy();
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        provider: 'deepseek',
        model: 'mock-model',
        text: '【结论】这是八字 mock AI 解读。\n\n【依据】依据传入的四柱、十神和大运上下文。',
        cost: 2,
      }),
    });
  });

  await page.goto('/account');
  await page.getByLabel('手机号或邮箱').fill('bazi-ai@example.com');
  await page.getByLabel('称呼').fill('八字 AI 测试');
  await page.getByRole('button', { name: '登录并领取积分' }).click();

  await page.goto('/bazi/result?dt=1990-05-08T12%3A00&calendar=solar&gender=male&birthplace=%E5%8C%97%E4%BA%AC&mode=custom');
  await expect(page.getByText('八字 AI 深度解读')).toBeVisible();
  await expect(page.getByText('报告依据会随请求传入')).toBeVisible();
  await page.getByRole('button', { name: '生成八字 AI 解读' }).click();
  await expect(page.getByText('正在推演命盘，请稍候')).toBeVisible();
  await expect(page.getByText('这是八字 mock AI 解读')).toBeVisible();

  await page.goto('/reports');
  await expect(page.getByText('八字 AI 解读')).toBeVisible();
  await expect(page.getByText('这是八字 mock AI 解读').first()).toBeVisible();
});

test('ziwei AI reading flow is saved with mocked DeepSeek response', async ({ page }) => {
  await page.route('**/api/deepseek-reading', async (route) => {
    const request = route.request();
    const body = request.postDataJSON();
    expect(request.method()).toBe('POST');
    expect(request.headers()['x-yijie-account-id']).toMatch(/^acct_/);
    expect(body.domain).toBe('ziwei');
    expect(body.chart.lifePalace.name).toBe('命宫');
    expect(body.chart.palaces).toHaveLength(12);
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        provider: 'deepseek',
        model: 'mock-model',
        text: '【结论】这是紫微 mock AI 解读。\n\n【依据】依据传入的命身宫、星曜四化和大限流年上下文。',
        cost: 2,
      }),
    });
  });

  await page.goto('/account');
  await page.getByLabel('手机号或邮箱').fill('ziwei-ai@example.com');
  await page.getByLabel('称呼').fill('紫微 AI 测试');
  await page.getByRole('button', { name: '登录并领取积分' }).click();

  await page.goto('/ziwei/chart?calendar=solar&year=1990&month=5&day=8&hour=12&minute=0&gender=male&astroType=heaven');
  await expect(page.getByText('紫微 AI 深度解读')).toBeVisible();
  await expect(page.getByText('解读依据会随请求传入')).toBeVisible();
  await page.getByRole('button', { name: '生成紫微 AI 解读' }).click();
  await expect(page.getByText('正在推演紫微命盘，请稍候')).toBeVisible();
  await expect(page.getByText('这是紫微 mock AI 解读')).toBeVisible();

  await page.goto('/reports');
  await expect(page.getByText('紫微 AI 解读')).toBeVisible();
  await expect(page.getByText('这是紫微 mock AI 解读').first()).toBeVisible();
});

test('combined bazi and liuyao AI report is saved with mocked DeepSeek response', async ({ page }) => {
  await page.route('**/api/deepseek-reading', async (route) => {
    const request = route.request();
    const body = request.postDataJSON();
    expect(request.method()).toBe('POST');
    expect(request.headers()['x-yijie-account-id']).toMatch(/^acct_/);
    expect(body.domain).toBe('combined');
    expect(body.chart.mode).toBe('bazi_liuyao');
    expect(body.chart.bazi.pillars.year.full).toBeTruthy();
    expect(body.chart.liuyao.baseHex.name).toBeTruthy();
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        provider: 'deepseek',
        model: 'mock-model',
        text: '【结论】这是双术合参 mock 报告。\n\n【合参依据】八字看长期结构，六爻看当下问事。',
        cost: 2,
      }),
    });
  });

  await page.goto('/account');
  await page.getByLabel('手机号或邮箱').fill('combined-ai@example.com');
  await page.getByLabel('称呼').fill('合参测试');
  await page.getByRole('button', { name: '登录并领取积分' }).click();

  await page.goto('/reports/combined');
  await page.getByLabel('出生时间').fill('1990-05-08T12:00');
  await page.getByLabel('起卦时间').fill('2026-06-18T09:30');
  await page.getByLabel('所问事项').fill('现在是否适合推进新项目？');
  await page.getByRole('button', { name: '生成双术合参报告' }).click();
  await expect(page.getByText('正在核对八字结构')).toBeVisible();
  await expect(page.getByText('这是双术合参 mock 报告')).toBeVisible();

  await page.goto('/reports');
  const combinedReport = page.getByRole('article').filter({ hasText: '现在是否适合推进新项目？' });
  await expect(combinedReport.getByText('双术合参', { exact: true })).toBeVisible();
  await expect(combinedReport.getByText('这是双术合参 mock 报告').first()).toBeVisible();
});
