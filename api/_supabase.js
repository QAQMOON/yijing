import { createClient } from '@supabase/supabase-js';
import { CommercialError, STARTER_CREDITS, buildAiResultFromReportRow, getBearerToken } from './_commercial.js';

let serviceClient;

function getSupabaseUrl() {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
}

function getServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

export function getSupabaseServiceClient() {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new CommercialError(503, 'supabase_not_configured', '云端账户暂未配置，请稍后再试');
  }

  if (!serviceClient) {
    serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return serviceClient;
}

export async function authenticateRequest(req) {
  const token = getBearerToken(req.headers);
  if (!token) {
    throw new CommercialError(401, 'unauthorized', '请先登录后再继续');
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    throw new CommercialError(401, 'unauthorized', '登录状态已失效，请重新登录');
  }

  return { token, user: data.user };
}

function displayNameFromUser(user) {
  const metaName = user.user_metadata?.display_name || user.user_metadata?.name;
  if (metaName) return String(metaName).trim().slice(0, 24);
  const email = user.email || '';
  return email.includes('@') ? email.split('@')[0].slice(0, 24) : '易解用户';
}

async function insertStarterCredit(supabase, userId) {
  const idempotencyKey = `starter:${userId}`;
  const { error } = await supabase.from('credit_ledger').insert({
    user_id: userId,
    kind: 'grant',
    amount: STARTER_CREDITS,
    balance_after: STARTER_CREDITS,
    reason: '新账户试用积分',
    idempotency_key: idempotencyKey,
  });

  if (error && error.code !== '23505') {
    throw new CommercialError(500, 'starter_credit_failed', '初始化试用积分失败');
  }
}

export async function ensureProfileAndStarterCredits(user) {
  const supabase = getSupabaseServiceClient();
  const displayName = displayNameFromUser(user);

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    display_name: displayName,
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    throw new CommercialError(500, 'profile_sync_failed', '账户资料同步失败');
  }

  await insertStarterCredit(supabase, user.id);
}

export async function getAccountSnapshot(user) {
  const supabase = getSupabaseServiceClient();
  await ensureProfileAndStarterCredits(user);

  const [{ data: profile, error: profileError }, { data: ledger, error: ledgerError }, credits] = await Promise.all([
    supabase.from('profiles').select('display_name, created_at').eq('id', user.id).maybeSingle(),
    supabase
      .from('credit_ledger')
      .select('id, kind, amount, balance_after, reason, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50),
    getCreditBalance(user.id),
  ]);

  if (profileError || ledgerError) {
    throw new CommercialError(500, 'account_load_failed', '账户数据读取失败');
  }

  const rows = ledger || [];

  return {
    id: user.id,
    identifier: user.email || user.phone || user.id,
    displayName: profile?.display_name || displayNameFromUser(user),
    credits,
    plan: '基础账号',
    createdAt: profile?.created_at || user.created_at,
    ledger: rows.map((item) => ({
      id: item.id,
      type: item.kind,
      amount: item.amount,
      balanceAfter: item.balance_after,
      reason: item.reason,
      createdAt: item.created_at,
    })),
  };
}

export async function getCreditBalance(userId) {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from('credit_ledger')
    .select('amount')
    .eq('user_id', userId);

  if (error) {
    throw new CommercialError(500, 'credit_load_failed', '积分余额读取失败');
  }

  return (data || []).reduce((total, item) => total + Number(item.amount || 0), 0);
}

export async function getProcessedAiReportByIdempotencyKey({ userId, idempotencyKey }) {
  if (!userId || !idempotencyKey) return null;

  const supabase = getSupabaseServiceClient();
  const { data: ledger, error: ledgerError } = await supabase
    .from('credit_ledger')
    .select('balance_after, metadata')
    .eq('user_id', userId)
    .eq('kind', 'consume')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (ledgerError) {
    throw new CommercialError(500, 'idempotency_lookup_failed', '报告幂等记录读取失败');
  }

  const reportId = ledger?.metadata?.report_id;
  if (!reportId) return null;

  const { data: report, error: reportError } = await supabase
    .from('ai_reports')
    .select('id, domain, title, question, style, depth, provider, model, cost, content, chart, usage, created_at')
    .eq('id', reportId)
    .eq('user_id', userId)
    .maybeSingle();

  if (reportError) {
    throw new CommercialError(500, 'processed_report_load_failed', '已生成报告读取失败');
  }

  if (!report) return null;
  return buildAiResultFromReportRow(report, { balanceAfter: ledger.balance_after });
}
