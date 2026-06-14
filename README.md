# 易解

易解是一套面向中国术数文化的在线工具站。当前阶段先把六爻、八字、紫微斗数、大六壬、奇门遁甲等排盘工具做稳，后续再升级为登录、DeepSeek AI 解读与积分付费的完整应用。

在线地址：<https://yijing-pi.vercel.app>

## 当前功能

- 六爻起卦、六十四卦查询、纳甲排盘与电脑解卦
- 八字排盘、四柱十神、大运流年与神煞展示
- 紫微斗数十二宫命盘
- 大六壬天地人三盘、四课三传展示
- 奇门遁甲九宫排盘
- 本地卦历记录、导入与导出
- 隐私政策、服务条款、产品路线与页面 SEO 基础
- robots、sitemap、manifest 与公开路由静态 HTML 生成

## 产品路线

1. 工具站：稳定排盘工具、独立 SEO、Vercel 部署和合规入口。
2. DeepSeek AI 解读：通过服务端接口调用 DeepSeek，支持严谨版和通俗版解读。
3. 账户与积分：登录、云端报告历史、积分账本和付费充值。

更详细的路线见 [docs/product-roadmap.md](docs/product-roadmap.md)。

## 技术栈

- Vite + React
- React Router
- CSS Modules
- lunar-javascript
- iztro
- Vercel

## 本地开发

```bash
npm install
npm run dev
```

常用命令：

```bash
npm test
npm run lint
npm run build
npm run test:e2e
```

`npm run build` 会先执行 Vite 构建，再运行 `scripts/prerender-static.mjs`，为公开路由生成带独立 title、description、canonical 和基础正文的静态 HTML。

## 环境变量

复制 `.env.example` 并在本地或 Vercel 中配置实际值。DeepSeek 密钥只能放在服务端环境变量中，不要使用 `VITE_` 前缀暴露到浏览器。

## 部署

项目继续使用 Vercel。`vercel.json` 已配置 SPA 路由 fallback 和基础安全头，直接访问 `/bazi`、`/privacy`、`/qimen/display` 等前端路由时会回落到 `index.html`。

`public/robots.txt`、`public/sitemap.xml` 和 `public/manifest.webmanifest` 会作为真实静态文件发布，不参与 SPA fallback。
