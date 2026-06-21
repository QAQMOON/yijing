# 生产冒烟与真实链路验收

这份脚本用于小范围试用发布后的人工验收。当前版本仍是积分制 AI 报告 MVP，不包含真实微信、支付宝或 Stripe 支付。

## 1. 前置条件

- GitHub Actions `CI` 已通过。
- Vercel 已配置 Production 环境变量，且 `SUPABASE_SERVICE_ROLE_KEY`、`DEEPSEEK_API_KEY` 没有 `VITE_` 前缀。
- Supabase migrations 已按顺序应用：`0001_accounts_credits_reports.sql` -> `0002_commercial_mvp_rpc.sql` -> `0003_ai_report_idempotency.sql`。
- 测试账号有可消耗积分；新账号默认应初始化 8 积分。

## 2. 自动公开冒烟

PowerShell:

```powershell
$env:SMOKE_BASE_URL='https://your-domain'
npm run smoke:prod
Remove-Item Env:SMOKE_BASE_URL
```

Bash:

```bash
SMOKE_BASE_URL=https://your-domain npm run smoke:prod
```

默认检查公开页面和未登录 API 边界：`/api/account`、`/api/reports` 必须返回结构化 401。

## 3. 可选鉴权与 AI 幂等冒烟

如果已经通过 Magic Link 登录并拿到临时 Supabase access token，可在本机临时执行鉴权检查。不要把 token 写入仓库、截图、聊天记录或 CI。

PowerShell:

```powershell
$env:SMOKE_BASE_URL='https://your-domain'
$env:SMOKE_AUTH_TOKEN='<temporary-supabase-access-token>'
npm run smoke:prod
Remove-Item Env:SMOKE_BASE_URL
Remove-Item Env:SMOKE_AUTH_TOKEN
```

若要实际调用 DeepSeek 并验证同一 payload 重试不重复扣费：

```powershell
$env:SMOKE_BASE_URL='https://your-domain'
$env:SMOKE_AUTH_TOKEN='<temporary-supabase-access-token>'
$env:SMOKE_AI_PAYLOAD_FILE='docs/smoke-ai-payload.example.json'
npm run smoke:prod
Remove-Item Env:SMOKE_BASE_URL
Remove-Item Env:SMOKE_AUTH_TOKEN
Remove-Item Env:SMOKE_AI_PAYLOAD_FILE
```

说明：

- 首次使用一个新的 payload 通常会消耗 2 积分并保存 1 份报告。
- 脚本会用同一 payload 再请求一次，要求返回相同 `reportId` 且 `balanceAfter` 不变。
- 如需测试删除生成的报告，可额外设置 `SMOKE_DELETE_CREATED_REPORT=1`。

## 4. 手动真实链路验收

1. 打开首页，确认首页、六爻、八字、紫微、奇门、大六壬、双术合参页面都能正常打开。
2. 进入 `/account`，使用测试邮箱发起 Magic Link 登录，确认邮件能收到并能回到站点。
3. 新用户首次登录后确认账户页出现 8 试用积分、积分流水有“新账户试用积分”。
4. 进入 `/reports/combined`，填写出生时间、起卦时间和一个唯一问题，生成双术合参 AI 报告。
5. 确认报告成功返回后余额减少 2，报告历史出现新记录，积分流水出现 1 条消费记录。
6. 使用同一 payload 执行第 3 节的 AI 幂等冒烟，确认重复请求不重复扣费。
7. 准备一个余额低于 2 的测试账号，生成 AI 报告应提示积分不足，余额不变，报告历史不新增记录。
8. 删除自己刚生成的报告，应成功从报告历史移除。
9. 使用第二个测试账号确认看不到第一个账号的报告；跨用户删除应不可行。
10. 查看 Vercel Function logs，确认没有 token、密钥、完整生日、完整问题内容或完整排盘 payload。

## 5. Supabase SQL 检查

在 Supabase SQL Editor 中只读执行：

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('profiles', 'credit_ledger', 'ai_reports', 'orders', 'rate_limit_events')
order by tablename;

select indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename = 'credit_ledger'
  and indexname = 'credit_ledger_user_idempotency_key_idx';

select policyname, tablename, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles', 'credit_ledger', 'ai_reports', 'orders')
order by tablename, policyname;

select
  has_function_privilege(
    'anon',
    'public.consume_credit_and_save_ai_report(uuid,text,text,text,text,text,text,text,integer,text,jsonb,jsonb,text,text)',
    'EXECUTE'
  ) as anon_can_execute,
  has_function_privilege(
    'authenticated',
    'public.consume_credit_and_save_ai_report(uuid,text,text,text,text,text,text,text,integer,text,jsonb,jsonb,text,text)',
    'EXECUTE'
  ) as authenticated_can_execute,
  has_function_privilege(
    'service_role',
    'public.consume_credit_and_save_ai_report(uuid,text,text,text,text,text,text,text,integer,text,jsonb,jsonb,text,text)',
    'EXECUTE'
  ) as service_role_can_execute;
```

期望：

- 上述表都开启 RLS。
- `credit_ledger_user_idempotency_key_idx` 存在，且按 `(user_id, idempotency_key)` 唯一约束非空幂等键。
- 用户只能读取自己的 profile、积分流水、报告历史和订单。
- `consume_credit_and_save_ai_report` 仅 `service_role` 可执行，`anon` 和 `authenticated` 不应直接执行。
