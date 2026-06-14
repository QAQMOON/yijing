import { expect, test } from '@playwright/test';

const PUBLIC_ROUTES = [
  { path: '/', title: /易解 · 古籍依据 AI 解读/, h1: /免费排盘/ },
  { path: '/liuyao', title: /六爻起卦排盘/, h1: /六\s*爻/ },
  { path: '/liuyao/hexagrams', title: /六十四卦查询/, h1: /六十\s*四\s*卦/ },
  { path: '/bazi', title: /八字排盘/, h1: /八\s*字/ },
  { path: '/ziwei', title: /紫微斗数排盘/, h1: /紫微斗数/ },
  { path: '/daliuren', title: /大六壬排盘/, h1: /大\s*六\s*壬/ },
  { path: '/qimen', title: /奇门遁甲排盘/, h1: /奇门遁甲/ },
  { path: '/classics', title: /藏经阁与术语库/, h1: /古籍依据/ },
  { path: '/reports', title: /AI 报告历史/, h1: /报告/ },
  { path: '/tools', title: /百宝袋/, h1: /排盘前/ },
  { path: '/account', title: /我的账户/, h1: /登录易解/ },
  { path: '/pricing', title: /积分套餐/, h1: /AI 解读按次消耗积分/ },
  { path: '/privacy', title: /隐私政策/, h1: /隐私政策/ },
  { path: '/terms', title: /服务条款/, h1: /服务条款/ },
  { path: '/roadmap', title: /产品路线/, h1: /产品路线/ },
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
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /易解|六爻|八字|紫微|奇门|大六壬|隐私|服务|产品路线|积分|账户|藏经阁|报告|百宝袋/);
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

test('local account can sign in and top up demo credits', async ({ page }) => {
  await page.goto('/account');
  await page.waitForLoadState('networkidle');

  await page.getByLabel('手机号或邮箱').fill('13800000000');
  await page.getByLabel('称呼').fill('易解测试');
  await page.getByRole('button', { name: '登录并领取积分' }).click();

  await expect(page.locator('h1')).toContainText('易解测试');
  await expect(page.getByText('可用积分')).toBeVisible();
  await expect(page.getByRole('link', { name: /8积分/ })).toBeVisible();

  await page.goto('/pricing');
  await page.getByRole('button', { name: '演示充值' }).nth(1).click();

  await expect(page.getByText('已为当前体验账号增加 68 积分。')).toBeVisible();
  await expect(page.getByRole('link', { name: /76积分/ })).toBeVisible();
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
  await expect(page.getByText('这是 mock AI 解读')).toBeVisible();

  await page.goto('/reports');
  await expect(page.getByText('乾为天之乾为天')).toBeVisible();
  await expect(page.getByText('这是 mock AI 解读').first()).toBeVisible();
});
