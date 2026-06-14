import { useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import { CREDIT_PLANS } from '../data/creditPlans.js';
import { useAccount } from '../hooks/useAccount.js';
import styles from './Pricing.module.css';

export default function Pricing() {
  const { account, addCredits } = useAccount();
  const [message, setMessage] = useState('');

  const topUp = (plan) => {
    setMessage('');
    try {
      addCredits(plan.credits, `${plan.name}演示充值`, plan.name);
      setMessage(`已为当前体验账号增加 ${plan.credits} 积分。`);
    } catch (err) {
      setMessage(err.message || '充值失败，请先登录。');
    }
  };

  return (
    <div className={styles.page}>
      <Seo
        title="积分套餐 · AI 解读付费 · 易解"
        description="易解积分套餐页面展示 AI 解读积分包、体验充值和后续支付接入准备事项。"
        path="/pricing"
      />

      <section className={styles.hero}>
        <p className={styles.kicker}>积分套餐</p>
        <h1>AI 解读按次消耗积分</h1>
        <p>
          排盘工具保持免费。DeepSeek AI 深度解读按次扣积分，支付网关配置后即可替换演示充值。
        </p>
      </section>

      <section className={styles.planGrid} aria-label="积分套餐">
        {CREDIT_PLANS.map((plan) => (
          <article key={plan.id} className={`${styles.planCard} ${plan.recommended ? styles.recommended : ''}`}>
            {plan.recommended && <span className={styles.badge}>推荐</span>}
            <h2>{plan.name}</h2>
            <p className={styles.price}>{plan.priceLabel}</p>
            <p className={styles.credits}>{plan.credits} 积分</p>
            <p className={styles.description}>{plan.description}</p>
            {account ? (
              <button className={styles.primaryButton} type="button" onClick={() => topUp(plan)}>
                演示充值
              </button>
            ) : (
              <Link className={styles.primaryButton} to="/account">登录后充值</Link>
            )}
          </article>
        ))}
      </section>

      {message && <p className={styles.message}>{message}</p>}

      <section className={styles.setupPanel}>
        <h2>真实支付接入</h2>
        <div className={styles.setupGrid}>
          <div>
            <strong>支付商户</strong>
            <span>微信支付、支付宝或 Stripe</span>
          </div>
          <div>
            <strong>数据库</strong>
            <span>用户、订单、积分流水持久化</span>
          </div>
          <div>
            <strong>回调接口</strong>
            <span>支付成功后发放积分</span>
          </div>
        </div>
      </section>
    </div>
  );
}
