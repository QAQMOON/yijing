import Seo from '../components/Seo.jsx';
import styles from './Legal.module.css';

export default function Terms() {
  return (
    <div className={styles.page}>
      <Seo
        title="服务条款 · 易解"
        description="易解服务条款说明工具站使用边界、内容性质、用户责任、未来 AI 解读与积分付费功能的基本原则。"
        path="/terms"
      />
      <p className={styles.eyebrow}>TERMS</p>
      <h1 className={styles.title}>服务条款</h1>
      <p className={styles.updated}>最后更新：2026 年 6 月 14 日</p>

      <section className={styles.section}>
        <h2>服务说明</h2>
        <p>易解是面向中国术数文化的在线工具站，提供六爻、八字、紫微斗数、大六壬、奇门遁甲等排盘与资料查看功能。当前内容用于传统文化学习、个人记录和工具体验。</p>
      </section>

      <section className={styles.section}>
        <h2>免责声明</h2>
        <p>易解生成或展示的内容不构成医疗、法律、投资、婚恋、生育、求职、风险防范等领域的专业建议。任何现实决策都应以理性判断和专业意见为准。</p>
      </section>

      <section className={styles.section}>
        <h2>用户责任</h2>
        <ul>
          <li>不要提交违法、侵权、恶意攻击或明显无关的信息。</li>
          <li>不要使用自动化脚本高频请求外部解卦或未来 AI 接口。</li>
          <li>不要将工具输出包装为确定性结论向他人收费或误导他人。</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>未来付费功能</h2>
        <p>后续接入登录、DeepSeek AI 解读和积分付费后，会补充积分购买、消耗、退款、异常订单、报告保存、账户注销等细则。付费规则上线前会在产品内明确展示。</p>
      </section>

      <section className={styles.section}>
        <h2>服务变更</h2>
        <p>易解会持续调整算法、页面、内容和功能入口。重大变更会优先更新产品路线、隐私政策和服务条款。</p>
      </section>
    </div>
  );
}
