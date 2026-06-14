import Seo from '../components/Seo.jsx';
import styles from './Legal.module.css';

export default function Privacy() {
  return (
    <div className={styles.page}>
      <Seo
        title="隐私政策 · 易解"
        description="易解隐私政策说明工具站、本地卦历、六爻外部解卦接口、DeepSeek AI 解读、体验账号与积分记录的数据处理原则。"
        path="/privacy"
      />
      <p className={styles.eyebrow}>PRIVACY</p>
      <h1 className={styles.title}>隐私政策</h1>
      <p className={styles.updated}>最后更新：2026 年 6 月 14 日</p>

      <section className={styles.section}>
        <h2>当前阶段</h2>
        <p>易解当前作为工具站和 AI 解读体验版运行。八字、紫微斗数、大六壬、奇门遁甲等排盘计算主要在浏览器本地完成；卦历记录、体验账号和积分流水保存在你的浏览器 localStorage 中，不会自动上传到数据库。</p>
      </section>

      <section className={styles.section}>
        <h2>可能处理的信息</h2>
        <ul>
          <li>排盘输入：日期、时间、性别、历法类型、占事描述等。</li>
          <li>本地记录：你主动保存的每日一卦或六爻起卦记录与备注。</li>
          <li>体验账户：登录标识、称呼、积分余额和积分流水。</li>
          <li>AI 解读：六爻排盘上下文、占事描述、解读风格和篇幅。</li>
          <li>技术信息：Vercel、浏览器和网络环境可能产生的基础访问日志。</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>外部接口</h2>
        <p>六爻结果页包含“电脑解卦”功能，会把卦爻、起卦时间等必要参数提交到外部解卦来源以获取参考文本。AI 深度解读会通过 Vercel 服务端接口请求 DeepSeek，API Key 不会暴露在浏览器端。</p>
      </section>

      <section className={styles.section}>
        <h2>支付与云端账户</h2>
        <p>当前套餐页提供体验积分领取，不会创建真实订单。接入正式支付和云端账户后，会补充账户资料、支付记录、报告历史、数据导出与删除方式等说明，并在付费和生成报告前展示必要提示。</p>
      </section>

      <section className={styles.section}>
        <h2>你的控制权</h2>
        <p>当前本地卦历可以在“卦历”页面导出、导入或删除。体验账号和积分记录可通过退出登录或清除浏览器站点数据移除。上线云端账户系统后，会补充云端数据删除和账户注销流程。</p>
      </section>
    </div>
  );
}
