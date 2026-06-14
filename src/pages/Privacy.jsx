import Seo from '../components/Seo.jsx';
import styles from './Legal.module.css';

export default function Privacy() {
  return (
    <div className={styles.page}>
      <Seo
        title="隐私政策 · 易解"
        description="易解隐私政策说明当前工具站、本地卦历、六爻外部解卦接口，以及未来 DeepSeek AI 解读、登录与积分服务的数据处理原则。"
        path="/privacy"
      />
      <p className={styles.eyebrow}>PRIVACY</p>
      <h1 className={styles.title}>隐私政策</h1>
      <p className={styles.updated}>最后更新：2026 年 6 月 14 日</p>

      <section className={styles.section}>
        <h2>当前阶段</h2>
        <p>易解当前优先作为前端工具站运行。八字、紫微斗数、大六壬、奇门遁甲等排盘计算主要在浏览器本地完成；卦历记录保存在你的浏览器 localStorage 中，不会自动上传到服务器。</p>
      </section>

      <section className={styles.section}>
        <h2>可能处理的信息</h2>
        <ul>
          <li>排盘输入：日期、时间、性别、历法类型、占事描述等。</li>
          <li>本地记录：你主动保存的每日一卦或六爻起卦记录与备注。</li>
          <li>技术信息：Vercel、浏览器和网络环境可能产生的基础访问日志。</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>外部接口</h2>
        <p>六爻结果页当前包含“电脑解卦”功能，会把卦爻、起卦时间等必要参数提交到外部解卦来源以获取参考文本。后续接入 DeepSeek 时，AI 请求会通过服务端代理发送，API Key 不会暴露在浏览器端。</p>
      </section>

      <section className={styles.section}>
        <h2>未来账户功能</h2>
        <p>当易解升级到登录、AI 解读、积分付费阶段时，会在上线前补充账户资料、积分记录、支付记录、报告历史、数据导出与删除方式等说明，并在注册、付费和生成报告前展示必要提示。</p>
      </section>

      <section className={styles.section}>
        <h2>你的控制权</h2>
        <p>当前本地卦历可以在“卦历”页面导出、导入或删除。你也可以通过浏览器站点数据设置清除本地记录。上线账户系统后，会补充云端数据删除和账户注销流程。</p>
      </section>
    </div>
  );
}
