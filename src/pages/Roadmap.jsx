import Seo from '../components/Seo.jsx';
import { APP_ROADMAP } from '../data/siteConfig.js';
import styles from './Legal.module.css';

export default function Roadmap() {
  return (
    <div className={styles.page}>
      <Seo
        title="更新计划 · 排盘与 AI 解读 · 易解"
        description="易解更新计划：免费排盘、AI 解读报告、积分账户、报告同步和三术合参。"
        path="/roadmap"
      />
      <p className={styles.eyebrow}>UPDATE</p>
      <h1 className={styles.title}>更新计划</h1>
      <p className={styles.updated}>排盘工具、AI 解读、云端积分和报告历史已上线，下一步完善真实支付和订单回调。</p>

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
        <h2>下一步</h2>
        <p>我们会优先完善真实支付、订单回调和对账流程，让 AI 解读逐步变成可长期保存的个人报告库。</p>
      </section>
    </div>
  );
}
