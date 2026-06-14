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
      addCredits(plan.credits, `${plan.name}试用积分`, plan.name);
      setMessage(`已为当前账号增加 ${plan.credits} 积分。`);
    } catch (err) {
      setMessage(err.message || '充值失败，请先登录。');
    }
  };

  return (
    <div className={styles.page}>
      <Seo
        title="积分套餐 · AI 解读付费 · 易解"
        description="易解积分套餐页面展示 AI 解读积分包、试用额度和购买说明。"
        path="/pricing"
      />

      <section className={styles.hero}>
        <p className={styles.kicker}>积分套餐</p>
        <h1>AI 解读按次消耗积分</h1>
        <p>
          排盘工具保持免费。AI 深度解读按次扣积分，购买通道开放前可先领取试用额度。
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
                领取积分
              </button>
            ) : (
              <Link className={styles.primaryButton} to="/account">登录后领取</Link>
            )}
          </article>
        ))}
      </section>

      {message && <p className={styles.message}>{message}</p>}

      <section className={styles.setupPanel}>
        <h2>购买通道即将开放</h2>
        <div className={styles.setupGrid}>
          <div>
            <strong>支付方式</strong>
            <span>微信支付、支付宝或 Stripe</span>
          </div>
          <div>
            <strong>积分到账</strong>
            <span>支付完成后自动发放积分</span>
          </div>
          <div>
            <strong>订单记录</strong>
            <span>保留订单、积分和报告记录</span>
          </div>
        </div>
      </section>
    </div>
  );
}
