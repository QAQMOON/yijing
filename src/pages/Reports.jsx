import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import { useAiReports } from '../hooks/useAiReports.js';
import styles from './Reports.module.css';

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function ReportCard({ report, onDelete }) {
  const preview = String(report.text || '').replace(/\s+/g, ' ').slice(0, 140);

  return (
    <article className={styles.reportCard}>
      <div className={styles.reportMeta}>
        <span>{report.domainLabel || 'AI 解读'}</span>
        <span>{formatDate(report.createdAt)}</span>
        <span>{report.cloudStatus === 'cloud' ? '云端' : '本地'}</span>
      </div>
      <h2>{report.title || 'AI 解读报告'}</h2>
      {report.question && <p className={styles.question}>占事：{report.question}</p>}
      <p>{preview}{preview.length >= 140 ? '...' : ''}</p>
      <details className={styles.reportDetail}>
        <summary>查看全文</summary>
        <div>
          {String(report.text || '').split(/\n{2,}/).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </details>
      <button type="button" onClick={() => onDelete(report.id)}>删除报告</button>
    </article>
  );
}

export default function Reports() {
  const { reports, deleteReport } = useAiReports();

  return (
    <div className={styles.page}>
      <Seo
        title="AI 报告历史 · 三术合参 · 易解"
        description="易解 AI 报告历史入口，保存六爻 DeepSeek 解读，并预留八字、紫微、六爻三术合参综合报告。"
        path="/reports"
      />

      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>AI 报告</p>
          <h1>把每一次解读沉淀成报告</h1>
          <p>当前报告保存在本设备。账户同步开放后，可在不同设备继续查看。</p>
        </div>
        <div className={styles.heroActions}>
          <Link to="/liuyao/cast">生成六爻报告</Link>
          <Link to="/pricing">查看积分</Link>
        </div>
      </section>

      <section className={styles.comboPanel}>
        <div>
          <h2>三术合参综合报告</h2>
          <p>八字看长期结构，紫微看宫位叙事，六爻看当下问题。合参报告会成为后续付费核心。</p>
        </div>
        <div className={styles.comboGrid}>
          <span>八字结构</span>
          <span>紫微宫位</span>
          <span>六爻问事</span>
          <strong>综合判断</strong>
        </div>
      </section>

      <section className={styles.cloudPanel}>
        <h2>报告同步规划</h2>
        <div>
          <span>账户同步</span>
          <span>积分保护</span>
          <span>报告归档</span>
          <span>风控限流</span>
        </div>
        <p>后续将支持跨设备保存、报告找回和积分消耗记录查询。</p>
      </section>

      <section className={styles.listSection}>
        <div className={styles.sectionHead}>
          <h2>历史报告</h2>
          <span>{reports.length} 份</span>
        </div>

        {reports.length === 0 ? (
          <div className={styles.empty}>
            <p>还没有 AI 报告。</p>
            <Link to="/liuyao/cast">先起一卦</Link>
          </div>
        ) : (
          <div className={styles.reportList}>
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} onDelete={deleteReport} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
