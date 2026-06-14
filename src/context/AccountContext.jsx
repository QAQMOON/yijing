import { useCallback, useMemo, useRef, useState } from 'react';
import { AccountContext } from './accountContext.js';
import { STARTER_CREDITS } from '../data/creditPlans.js';
import { getStorageItem, removeStorageItem, setStorageItem } from '../utils/safeStorage.js';

const ACCOUNT_STORAGE_KEY = 'yijie-account-v1';
const MAX_LEDGER_ITEMS = 50;

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeIdentifier(value) {
  return String(value || '').trim().slice(0, 80);
}

function normalizeName(value, identifier) {
  const clean = String(value || '').trim().slice(0, 24);
  if (clean) return clean;
  return identifier.includes('@') ? identifier.split('@')[0] : identifier;
}

function readStoredAccount() {
  const raw = getStorageItem(ACCOUNT_STORAGE_KEY);
  if (!raw) return null;

  try {
    const account = JSON.parse(raw);
    if (!account || typeof account !== 'object') return null;
    if (!account.id || !account.identifier) return null;
    return {
      id: String(account.id),
      identifier: String(account.identifier),
      displayName: String(account.displayName || account.identifier),
      credits: Number.isFinite(Number(account.credits)) ? Number(account.credits) : 0,
      plan: String(account.plan || '体验账号'),
      createdAt: account.createdAt || nowIso(),
      ledger: Array.isArray(account.ledger) ? account.ledger.slice(0, MAX_LEDGER_ITEMS) : [],
    };
  } catch {
    return null;
  }
}

function persistAccount(account) {
  if (account) setStorageItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account));
  else removeStorageItem(ACCOUNT_STORAGE_KEY);
}

function appendLedger(account, entry) {
  return {
    ...account,
    ledger: [
      {
        id: makeId('ledger'),
        createdAt: nowIso(),
        ...entry,
      },
      ...account.ledger,
    ].slice(0, MAX_LEDGER_ITEMS),
  };
}

function createAccount({ identifier, displayName }) {
  const cleanIdentifier = normalizeIdentifier(identifier);
  if (!cleanIdentifier) {
    throw new Error('请输入手机号或邮箱');
  }

  const account = {
    id: makeId('acct'),
    identifier: cleanIdentifier,
    displayName: normalizeName(displayName, cleanIdentifier),
    credits: STARTER_CREDITS,
    plan: '体验账号',
    createdAt: nowIso(),
    ledger: [],
  };

  return appendLedger(account, {
    type: 'grant',
    amount: STARTER_CREDITS,
    reason: '新账户体验积分',
  });
}

export function AccountProvider({ children }) {
  const [account, setAccount] = useState(() => readStoredAccount());
  const accountRef = useRef(account);

  const commitAccount = useCallback((next) => {
    accountRef.current = next;
    persistAccount(next);
    setAccount(next);
    return next;
  }, []);

  const signIn = useCallback((form) => {
    const next = createAccount(form);
    return commitAccount(next);
  }, [commitAccount]);

  const signOut = useCallback(() => {
    commitAccount(null);
  }, [commitAccount]);

  const addCredits = useCallback((amount, reason = '积分充值', plan = '积分包') => {
    const numericAmount = Number(amount);
    if (!Number.isInteger(numericAmount) || numericAmount <= 0) {
      throw new Error('积分数量无效');
    }
    const current = accountRef.current;
    if (!current) throw new Error('请先登录');

    const next = appendLedger({
      ...current,
      credits: current.credits + numericAmount,
      plan,
    }, {
      type: 'charge',
      amount: numericAmount,
      reason,
    });
    return commitAccount(next);
  }, [commitAccount]);

  const spendCredits = useCallback((amount, reason = 'AI 解读') => {
    const numericAmount = Number(amount);
    if (!Number.isInteger(numericAmount) || numericAmount <= 0) {
      throw new Error('积分数量无效');
    }
    const current = accountRef.current;
    if (!current) throw new Error('请先登录');
    if (current.credits < numericAmount) throw new Error('积分不足');

    const next = appendLedger({
      ...current,
      credits: current.credits - numericAmount,
    }, {
      type: 'consume',
      amount: -numericAmount,
      reason,
    });
    return commitAccount(next);
  }, [commitAccount]);

  const refundCredits = useCallback((amount, reason = '失败退回') => {
    const numericAmount = Number(amount);
    if (!Number.isInteger(numericAmount) || numericAmount <= 0) return null;
    const current = accountRef.current;
    if (!current) return null;

    const next = appendLedger({
      ...current,
      credits: current.credits + numericAmount,
    }, {
      type: 'refund',
      amount: numericAmount,
      reason,
    });
    return commitAccount(next);
  }, [commitAccount]);

  const value = useMemo(() => ({
    account,
    isSignedIn: Boolean(account),
    signIn,
    signOut,
    addCredits,
    spendCredits,
    refundCredits,
  }), [account, addCredits, refundCredits, signIn, signOut, spendCredits]);

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
}
