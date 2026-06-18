-- 商业化基础闭环 MVP：AI 报告原子扣费与保存
-- Forward-only migration. Do not edit 0001 after deployment.

create or replace function public.consume_credit_and_save_ai_report(
  target_user_id uuid,
  report_domain text,
  report_title text,
  report_question text,
  report_style text,
  report_depth text,
  report_provider text,
  report_model text,
  report_cost integer,
  report_content text,
  report_chart jsonb,
  report_usage jsonb,
  ledger_reason text,
  ledger_idempotency_key text default null
)
returns table(report_id uuid, balance_after integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_balance integer;
  next_balance integer;
  inserted_report_id uuid;
begin
  if target_user_id is null then
    raise exception 'missing_user_id';
  end if;

  if report_domain not in ('liuyao', 'bazi', 'ziwei', 'combined') then
    raise exception 'invalid_report_domain';
  end if;

  if report_cost is null or report_cost <= 0 then
    raise exception 'invalid_report_cost';
  end if;

  if coalesce(report_content, '') = '' then
    raise exception 'empty_report_content';
  end if;

  perform pg_advisory_xact_lock(hashtext(target_user_id::text));

  select coalesce(sum(amount), 0)::integer
    into current_balance
    from public.credit_ledger
    where user_id = target_user_id;

  if current_balance < report_cost then
    raise exception 'insufficient_credits';
  end if;

  next_balance := current_balance - report_cost;

  insert into public.credit_ledger (
    user_id,
    kind,
    amount,
    balance_after,
    reason,
    idempotency_key,
    metadata
  ) values (
    target_user_id,
    'consume',
    -report_cost,
    next_balance,
    coalesce(nullif(ledger_reason, ''), 'AI 报告生成'),
    ledger_idempotency_key,
    jsonb_build_object('domain', report_domain)
  );

  insert into public.ai_reports (
    user_id,
    domain,
    title,
    question,
    style,
    depth,
    provider,
    model,
    cost,
    content,
    chart,
    usage
  ) values (
    target_user_id,
    report_domain,
    left(coalesce(nullif(report_title, ''), 'AI 报告'), 80),
    nullif(report_question, ''),
    coalesce(nullif(report_style, ''), 'plain'),
    coalesce(nullif(report_depth, ''), 'brief'),
    coalesce(nullif(report_provider, ''), 'deepseek'),
    nullif(report_model, ''),
    report_cost,
    report_content,
    coalesce(report_chart, '{}'::jsonb),
    report_usage
  )
  returning id into inserted_report_id;

  report_id := inserted_report_id;
  balance_after := next_balance;
  return next;
end;
$$;

revoke all on function public.consume_credit_and_save_ai_report(
  uuid, text, text, text, text, text, text, text, integer, text, jsonb, jsonb, text, text
) from public;

grant execute on function public.consume_credit_and_save_ai_report(
  uuid, text, text, text, text, text, text, text, integer, text, jsonb, jsonb, text, text
) to service_role;
