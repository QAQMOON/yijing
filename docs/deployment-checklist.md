# 部署检查清单

这份清单用于公开小范围试用前的人工发布门禁。当前版本是“积分制 AI 报告 MVP”，不包含真实微信、支付宝或 Stripe 支付。

## 1. 代码与 CI

- 确认目标分支是 `master` 或 `main`，且工作区无未确认改动。
- GitHub Actions `CI` 必须通过：
  - `npm run test`
  - `npm run lint`
  - `npm run build`
  - `git diff --exit-code -- public/sitemap.xml`
  - `npm audit --audit-level=high`
  - `npm run test:e2e`
- 本地发布前建议同样执行以上命令；`npm run test:e2e` 会自动构建、启动 Vite preview、运行 Playwright 并关闭本地服务。
- 部署后建议执行 `SMOKE_BASE_URL=https://your-domain npm run smoke:prod` 检查公开页面和未登录 API 边界。

## 2. Vercel 环境变量

生产环境必须配置：

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
DEEPSEEK_API_KEY
DEEPSEEK_MODEL
AI_RATE_LIMIT_WINDOW_MS
AI_RATE_LIMIT_MAX
AI_DAILY_LIMIT_MAX
```

检查要求：

- `SUPABASE_SERVICE_ROLE_KEY`、`DEEPSEEK_API_KEY` 只配置在服务端环境变量，不使用 `VITE_` 前缀。
- Preview 与 Production 环境变量分开管理，生产密钥不写入代码、文档或 CI。
- `DEEPSEEK_MODEL` 默认可用 `deepseek-chat`。

## 3. Supabase 数据库

首次部署或新环境初始化时，必须按顺序应用：

```text
supabase/migrations/0001_accounts_credits_reports.sql
supabase/migrations/0002_commercial_mvp_rpc.sql
supabase/migrations/0003_ai_report_idempotency.sql
```

发布前检查：

- `profiles`、`credit_ledger`、`ai_reports`、`orders` 表存在。
- `consume_credit_and_save_ai_report` RPC 存在。
- `credit_ledger` 对同一 `user_id + idempotency_key` 保持唯一扣费。
- RLS 策略允许用户读取自己的账户、积分流水和报告历史，不允许跨用户读取。

## 4. Vercel 发布

- Build Command：`npm run build`
- Output Directory：`dist`
- Framework Preset：Vite
- Node.js 建议使用 22.x。
- `vercel.json` 必须保留 SPA fallback 和基础安全头。

## 5. 发布后冒烟

上线后至少检查：

- 首页、六爻、八字、紫微、奇门、大六壬、双术合参页面可打开。
- `SMOKE_BASE_URL=https://your-domain npm run smoke:prod` 通过。
- 未登录访问 AI 报告入口有明确登录引导。
- Supabase 邮箱验证码登录可发起。
- 登录后余额、积分流水、报告历史可读取。
- 生成一份 AI 报告后积分扣减与报告保存一致。
- 重复提交同一报告请求不重复扣费。
- 积分不足时不保存报告。
- Vercel Function logs 中没有密钥、token、完整用户隐私输入。

## 6. 回滚

- 优先使用 Vercel 上一个成功 deployment 回滚前端与 API。
- 数据库 migration 按 forward-only 原则处理，不重写已经部署过的 migration。
- 若 AI 报告或扣费异常，先隐藏或暂停收费报告入口，保留免费排盘工具可用。
