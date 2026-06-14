import Seo from '../components/Seo.jsx';
import { APP_ROADMAP } from '../data/siteConfig.js';
import styles from './Legal.module.css';

export default function Roadmap() {
  return (
    <div className={styles.page}>
      <Seo
        title="产品路线 · 工具站到 DeepSeek AI 解读 · 易解"
        description="易解产品路线：稳定工具站、DeepSeek AI 解读体验版、本地积分账户，以及后续云端报告和正式支付接入。"
        path="/roadmap"
      />
      <p className={styles.eyebrow}>ROADMAP</p>
      <h1 className={styles.title}>产品路线</h1>
      <p className={styles.updated}>工具站已上线，AI 解读和本地积分进入体验版，下一步接云端账户与正式支付。</p>

      <div className={styles.roadmap}>
        {APP_ROADMAP.map((item) => (
          <article key={item.stage} className={styles.stage}>
            <div className={styles.stageHeader}>
              <h2>{item.stage} · {item.title}</h2>
              <span className={styles.status}>{item.status}</span>
            </div>
            <ul>
              {item.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <section className={styles.section}>
        <h2>技术方向</h2>
        <p>当前继续使用 Vercel 部署。DeepSeek API 放在服务端接口中调用，前端只提交排盘上下文和解读风格，避免把密钥暴露给浏览器。登录、云端报告、订单和积分记录建议后续接 Supabase 或同级别托管数据库。</p>
      </section>
    </div>
  );
}
