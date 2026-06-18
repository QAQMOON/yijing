import Seo from '../components/Seo.jsx';
import styles from './Legal.module.css';

export default function Privacy() {
  return (
    <div className={styles.page}>
      <Seo
        title="隐私政策 · 易解"
        description="易解隐私政策说明排盘输入、卦历记录、AI 解读、账号与积分记录的数据处理原则。"
        path="/privacy"
      />
      <p className={styles.eyebrow}>PRIVACY</p>
      <h1 className={styles.title}>隐私政策</h1>
      <p className={styles.updated}>最后更新：2026 年 6 月 14 日</p>

      <section className={styles.section}>
        <h2>基本原则</h2>
        <p>易解只在提供排盘、解读、卦历和积分服务所需的范围内处理信息。八字、紫微斗数、大六壬、奇门遁甲等排盘计算优先在当前设备完成；你主动保存的记录会保存在当前设备中。</p>
      </section>

      <section className={styles.section}>
        <h2>可能处理的信息</h2>
        <ul>
          <li>排盘输入：日期、时间、性别、历法类型、占事描述等。</li>
          <li>卦历记录：你主动保存的每日一卦或六爻起卦记录与备注。</li>
          <li>账号信息：登录标识、称呼、积分余额和积分流水。</li>
          <li>AI 解读：六爻、八字、紫微排盘上下文，所选重点、解读风格和篇幅。</li>
          <li>访问日志：浏览器和网络环境可能产生的基础访问记录。</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>外部接口</h2>
        <p>六爻结果页包含“电脑解卦”和 AI 深度解读功能，八字与紫微结果页包含 AI 深度解读功能。使用这些功能时，系统会提交对应排盘上下文和所选重点等必要信息，用于生成参考文本和解读报告。</p>
      </section>

      <section className={styles.section}>
        <h2>支付与云端账户</h2>
        <p>当前套餐页只展示套餐说明，不会创建真实订单。云端账户会保存积分流水和 AI 报告历史；购买通道开放后，会补充支付记录、数据导出与删除方式等说明，并在付费和生成报告前展示必要提示。</p>
      </section>

      <section className={styles.section}>
        <h2>你的控制权</h2>
        <p>卦历可以在“卦历”页面导出、导入或删除。账号和积分记录可通过退出登录或清除浏览器站点数据移除。账号同步开放后，会补充数据删除和账户注销流程。</p>
      </section>
    </div>
  );
}
