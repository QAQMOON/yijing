import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccountContext } from './accountContext.js';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js';

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase().slice(0, 120);
}

function normalizeName(value, email) {
  const clean = String(value || '').trim().slice(0, 24);
  if (clean) return clean;
  return email.includes('@') ? email.split('@')[0] : '';
}

async function fetchAccount(session) {
  const token = session?.access_token;
  if (!token) return null;

  const response = await fetch('/api/account', {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Yijie-Client': 'browser',
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || data.error || '账户数据读取失败');
  }
  return data.account;
}

export function AccountProvider({ children }) {
  const [session, setSession] = useState(null);
  const [account, setAccount] = useState(null);
  const [status, setStatus] = useState(isSupabaseConfigured ? 'loading' : 'ready');
  const [authMessage, setAuthMessage] = useState('');
  const [authError, setAuthError] = useState('');
  const sessionRef = useRef(null);

  const commitSession = useCallback((nextSession) => {
    sessionRef.current = nextSession;
    setSession(nextSession);
  }, []);

  const refreshAccount = useCallback(async (nextSession = sessionRef.current) => {
    if (!isSupabaseConfigured || !nextSession) {
      setAccount(null);
      setStatus('ready');
      return null;
    }

    setStatus('loading');
    const nextAccount = await fetchAccount(nextSession);
    setAccount(nextAccount);
    setStatus('ready');
    return nextAccount;
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      const nextSession = data.session || null;
      commitSession(nextSession);
      try {
        await refreshAccount(nextSession);
      } catch (error) {
        if (!active) return;
        setAuthError(error.message || '账户数据读取失败');
        setAccount(null);
        setStatus('ready');
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!active) return;
      commitSession(nextSession);
      setAuthMessage('');
      setAuthError('');
      try {
        await refreshAccount(nextSession);
      } catch (error) {
        if (!active) return;
        setAuthError(error.message || '账户数据读取失败');
        setAccount(null);
        setStatus('ready');
      }
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [commitSession, refreshAccount]);

  const signIn = useCallback(async ({ identifier, displayName }) => {
    setAuthMessage('');
    setAuthError('');
    if (!isSupabaseConfigured) {
      throw new Error('Supabase 尚未配置，无法登录');
    }

    const email = normalizeEmail(identifier);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('请输入有效邮箱');
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/account`,
        data: {
          display_name: normalizeName(displayName, email),
        },
      },
    });

    if (error) throw new Error(error.message || '验证码发送失败');
    setAuthMessage('验证码邮件已发送，请在邮箱中完成登录。');
  }, []);

  const signOut = useCallback(async () => {
    setAuthMessage('');
    setAuthError('');
    if (isSupabaseConfigured) await supabase.auth.signOut();
    commitSession(null);
    setAccount(null);
    setStatus('ready');
  }, [commitSession]);

  const unavailable = useCallback(() => {
    throw new Error('积分由服务端校验和扣减');
  }, []);

  const value = useMemo(() => ({
    account,
    session,
    status,
    authEnabled: isSupabaseConfigured,
    authMessage,
    authError,
    isSignedIn: Boolean(account && session),
    signIn,
    signOut,
    refreshAccount,
    addCredits: unavailable,
    spendCredits: unavailable,
    refundCredits: unavailable,
  }), [account, authError, authMessage, refreshAccount, session, signIn, signOut, status, unavailable]);

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
}
