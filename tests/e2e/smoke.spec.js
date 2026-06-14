import { expect, test } from '@playwright/test';

const PUBLIC_ROUTES = [
  { path: '/', title: /易解 · 卦命合参/, h1: /.+/ },
  { path: '/liuyao', title: /六爻起卦排盘/, h1: /六\s*爻/ },
  { path: '/liuyao/hexagrams', title: /六十四卦查询/, h1: /六十\s*四\s*卦/ },
  { path: '/bazi', title: /八字排盘/, h1: /八\s*字/ },
  { path: '/ziwei', title: /紫微斗数排盘/, h1: /紫微斗数/ },
  { path: '/daliuren', title: /大六壬排盘/, h1: /大\s*六\s*壬/ },
  { path: '/qimen', title: /奇门遁甲排盘/, h1: /奇门遁甲/ },
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
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /易解|六爻|八字|紫微|奇门|大六壬|隐私|服务|产品路线/);
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
