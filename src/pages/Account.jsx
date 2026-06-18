import { useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import { CREDIT_COSTS, STARTER_CREDITS } from '../data/creditPlans.js';
import { useAccount } from '../hooks/useAccount.js';
import styles from './Account.module.css';

const LEDGER_LABELS = {
  grant: '赠送',
  charge: '充值',
  consume: '消耗',
  refund: '退回',
};

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function LoginPanel() {
  const { authEnabled, authError, authMessage, signIn, status } = useAccount();
  const [form, setForm] = useState({ identifier: '', displayName: '' });
  const [error, setError] = useState('');

  const update = (field, value) => {
    setError('');
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      await signIn(form);
    } catch (err) {
      setError(err.message || '登录失败');
    }
  };

  return (
    <section className={styles.loginPanel}>
      <div>
        <p className={styles.kicker}>我的账号</p>
        <h1>登录易解</h1>
        <p className={styles.lead}>
          使用邮箱验证码登录后可生成 AI 报告，并获得 {STARTER_CREDITS} 积分试用额度。
        </p>
      </div>

      <form className={styles.form} onSubmit={submit}>
        <label className={styles.field}>
          <span>邮箱</span>
          <input
            value={form.identifier}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            onChange={(event) => update('identifier', event.target.value)}
          />
        </label>
        <label className={styles.field}>
          <span>称呼</span>
          <input
            value={form.displayName}
            autoComplete="name"
            placeholder="可不填"
            onChange={(event) => update('displayName', event.target.value)}
          />
        </label>
        {!authEnabled && <p className={styles.error}>Supabase 尚未配置，暂时无法登录。</p>}
        {(error || authError) && <p className={styles.error}>{error || authError}</p>}
        {authMessage && <p className={styles.empty}>{authMessage}</p>}
        <button className={styles.primaryButton} type="submit" disabled={!authEnabled || status === 'loading'}>
          {status === 'loading' ? '正在处理' : '发送登录验证码'}
        </button>
      </form>
    </section>
  );
}

function AccountPanel() {
  const { account, refreshAccount, signOut, status } = useAccount();

  return (
    <div className={styles.accountGrid}>
      <section className={styles.summaryPanel}>
        <p className={styles.kicker}>我的账户</p>
        <h1>{account.displayName}</h1>
        <p className={styles.identifier}>{account.identifier}</p>
        <div className={styles.creditBox}>
          <span>可用积分</span>
          <strong>{account.credits}</strong>
        </div>
        <div className={styles.summaryActions}>
          <Link className={styles.primaryButton} to="/pricing">查看套餐</Link>
          <button className={styles.secondaryButton} type="button" onClick={() => refreshAccount()} disabled={status === 'loading'}>刷新账户</button>
          <button className={styles.secondaryButton} type="button" onClick={signOut}>退出登录</button>
        </div>
      </section>

      <section className={styles.usagePanel}>
        <h2>积分用途</h2>
        <div className={styles.usageItem}>
          <span>六爻 / 八字 / 紫微 AI 深度解读</span>
          <strong>{CREDIT_COSTS.aiReading} 积分/次</strong>
        </div>
        <p>
          免费排盘继续保留，AI 解读只在成功返回结果后保留扣减记录。
        </p>
      </section>

      <section className={styles.ledgerPanel}>
        <h2>积分流水</h2>
        {account.ledger.length === 0 ? (
          <p className={styles.empty}>暂无记录</p>
        ) : (
          <div className={styles.ledgerList}>
            {account.ledger.map((item) => (
              <div key={item.id} className={styles.ledgerRow}>
                <div>
                  <strong>{LEDGER_LABELS[item.type] || '记录'}</strong>
                  <span>{item.reason}</span>
                </div>
                <div className={styles.ledgerAmount}>
                  <strong>{item.amount > 0 ? `+${item.amount}` : item.amount}</strong>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function Account() {
  const { account, status } = useAccount();

  return (
    <div className={styles.page}>
      <Seo
        title="我的账户 · 登录与积分 · 易解"
        description="登录易解账号，查看 AI 解读积分余额、积分消耗记录与充值入口。"
        path="/account"
      />
      {status === 'loading' && !account ? <p className={styles.empty}>正在读取账户...</p> : account ? <AccountPanel /> : <LoginPanel />}
    </div>
  );
}
