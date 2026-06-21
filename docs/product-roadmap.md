# 易解产品路线

## 当前决策

- 产品节奏：稳定工具站已完成，DeepSeek AI 解读、双术合参 MVP 和商业化基础闭环进入 MVP；下一步接真实支付。
- 部署平台：继续使用 Vercel。
- AI 供应商：DeepSeek。
- 当前代码形态：Vite + React 应用，排盘逻辑主要在浏览器本地运行，AI 解读通过 Vercel 服务端接口调用。

## 阶段一：工具站

目标是让公开站点稳定、可访问、可被搜索引擎理解。

- 保持六爻、八字、紫微斗数、大六壬、奇门遁甲工具可用。
- 每个工具页维护独立 title、description、canonical。
- 公开路由构建后生成静态 HTML，便于搜索引擎和无 JS 环境读取基础内容。
- 补隐私政策、服务条款、产品路线页面。
- 使用 Vercel rewrites 支持 SPA 直达路由。
- 保持 `npm test`、`npm run lint`、`npm run build`、`npm run test:e2e` 通过。

## 阶段二：DeepSeek AI 解读

DeepSeek 必须从服务端接口调用，不能把 API Key 暴露给前端。

当前接口形态：

```text
POST /api/deepseek-reading
```

请求包含：

- `domain`: `liuyao`、`bazi`、`ziwei`、`combined`
- `chart`: 结构化排盘结果
- `question`: 用户问题，可选
- `style`: `scholar` 或 `plain`
- `depth`: `brief` 或 `full`

服务端负责：

- 读取 `DEEPSEEK_API_KEY`
- 构造系统提示词与排盘上下文
- 调用 DeepSeek
- 返回结构化解读
- 使用服务端 `idempotency_key` 控制扣费幂等

缓存与扣费边界：

- DeepSeek 内容缓存只用于避免重复调用模型。
- 是否收费由 `user_id + normalized payload` 生成的 `idempotency_key` 决定，不由 cache hit 单独决定。
- 同一次请求重试、客户端重复提交或缓存命中，不重复扣积分、不重复保存报告。
- 用户主动重新生成报告后续可通过 `regenerate=true` 另行设计，本阶段不开放。

## 阶段三：账户、积分与云端报告

当前使用 Supabase 管理邮箱验证码登录、用户档案、报告历史和积分账本。AI 报告必须登录后生成，服务端在调用 DeepSeek 前检查积分余额，生成成功后通过数据库 RPC 原子扣减积分并写入 `ai_reports`。

核心表：

- `profiles`: 用户资料
- `credit_ledger`: 积分充值、赠送、消耗、退款记录
- `ai_reports`: 云端 AI 报告历史
- `orders`: 支付订单

积分原则：

- 免费排盘继续保留。
- AI 解读按次消耗积分。
- 付费前展示消耗数量。
- DeepSeek 失败不扣积分；报告保存和扣减在服务端同事务完成。
- 新账户默认赠送 8 积分；六爻、八字、紫微、双术合参 AI 报告统一 2 积分/次。

## 阶段三点五：双术合参报告 MVP

首版先做八字 + 六爻，不把紫微纳入 MVP。

- 八字负责长期结构：四柱、日主、十神、旺衰、神煞、大运。
- 六爻负责当下问事：本卦、变卦、动爻、干支、空亡、六神、纳甲、六亲、世应。
- DeepSeek 接口使用 `domain=combined`，只传结构化排盘上下文。
- 前端入口为 `/reports/combined`，生成后保存到云端报告历史。
- 紫微作为第二阶段扩展，避免首版规格和测试样例过重。

## 阶段四：正式支付

本阶段尚未接入真实支付；`/pricing` 只展示套餐和后续支付入口。

需要准备：

- 支付商户：微信支付、支付宝或 Stripe。
- 支付回调：验证签名，确保订单只入账一次。
- 订单表：保存待支付、已支付、已退款、已关闭状态。
- 积分发放：支付成功后写入 `credit_ledger`。
- 对账与退款：后台可核查订单和积分变更。

## 上线前检查

- `npm test`
- `npm run lint`
- `npm run build`
- `npm run test:e2e`
- `SMOKE_BASE_URL=https://your-domain npm run smoke:prod`
- GitHub Actions `CI` 通过
- Vercel 环境变量已配置
- Supabase migrations 已按 `0001`、`0002`、`0003` 顺序应用
- 隐私政策和服务条款已更新到实际数据处理方式
- DeepSeek key 未出现在前端 bundle 中
- 详细步骤见 `docs/deployment-checklist.md`
