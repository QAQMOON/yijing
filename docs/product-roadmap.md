# 易解产品路线

## 当前决策

- 产品节奏：稳定工具站已完成，DeepSeek AI 解读和本地积分进入体验版，下一步接云端账户和正式支付。
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

- `domain`: `liuyao`、`bazi`、`ziwei`、`qimen`、`daliuren`
- `chart`: 结构化排盘结果
- `question`: 用户问题，可选
- `style`: `scholar` 或 `plain`
- `depth`: `brief` 或 `full`

服务端负责：

- 读取 `DEEPSEEK_API_KEY`
- 构造系统提示词与排盘上下文
- 调用 DeepSeek
- 返回结构化解读
- 前端体验版本地扣减积分，失败时退回

## 阶段三：账户与积分

当前已提供本地体验账号、积分余额、积分流水和演示充值。正式商业化建议使用 Supabase 管理登录、用户档案、报告历史和积分账本。

核心表：

- `profiles`: 用户资料
- `credit_ledger`: 积分充值、赠送、消耗、退款记录
- `readings`: 云端报告历史
- `orders`: 支付订单

积分原则：

- 免费排盘继续保留。
- AI 解读按次消耗积分。
- 付费前展示消耗数量。
- 异常失败不扣积分，或自动回滚。

## 阶段四：正式支付

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
- Vercel 环境变量已配置
- 隐私政策和服务条款已更新到实际数据处理方式
- DeepSeek key 未出现在前端 bundle 中
