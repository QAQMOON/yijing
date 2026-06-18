import { Link } from 'react-router-dom';
import { useState } from 'react';
import Seo from '../components/Seo.jsx';
import { useAiReports } from '../hooks/useAiReports.js';
import { useAccount } from '../hooks/useAccount.js';
import styles from './Reports.module.css';

const REPORT_FILTERS = [
  { value: 'all', label: '全部' },
  { value: 'liuyao', label: '六爻' },
  { value: 'bazi', label: '八字' },
  { value: 'ziwei', label: '紫微' },
  { value: 'combined', label: '双术合参' },
];

const DOMAIN_LABELS = {
  liuyao: '六爻 AI 解读',
  bazi: '八字 AI 解读',
  ziwei: '紫微 AI 解读',
  combined: '双术合参',
};

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
        <span>{report.domainLabel || DOMAIN_LABELS[report.domain] || 'AI 解读'}</span>
        <span>{formatDate(report.createdAt)}</span>
        <span>{report.cloudStatus === 'cloud' ? '云端' : '本地'}</span>
      </div>
      <h2>{report.title || 'AI 解读报告'}</h2>
      {report.question && <p className={styles.question}>占事：{report.question}</p>}
      {!report.question && report.focusLabel && <p className={styles.question}>重点：{report.focusLabel}</p>}
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
  const { account } = useAccount();
  const [domain, setDomain] = useState('all');
  const { reports, status, error, deleteReport } = useAiReports(domain);

  return (
    <div className={styles.page}>
      <Seo
        title="AI 报告历史 · 三术合参 · 易解"
        description="易解 AI 报告历史入口，保存六爻、八字、紫微解读，并提供八字与六爻双术合参综合报告入口。"
        path="/reports"
      />

      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>AI 报告</p>
          <h1>我的报告</h1>
          <p>AI 报告生成成功后保存到云端账号，可按类型筛选查看。</p>
        </div>
        <div className={styles.heroActions}>
          <Link to="/liuyao/cast">生成六爻报告</Link>
          <Link to="/bazi/chart">生成八字报告</Link>
          <Link to="/reports/combined">双术合参</Link>
          <Link to="/pricing">查看积分</Link>
        </div>
      </section>

      <section className={styles.comboPanel}>
        <div>
          <h2>三术合参综合报告</h2>
          <p>首版先合八字与六爻：八字看长期结构，六爻看当下问题，紫微作为后续扩展。</p>
        </div>
        <div className={styles.comboGrid}>
          <span>八字结构</span>
          <span>六爻问事</span>
          <span>紫微后续</span>
          <strong>综合判断</strong>
        </div>
        <Link to="/reports/combined" className={styles.comboAction}>生成双术合参报告</Link>
      </section>

      <section className={styles.cloudPanel}>
        <h2>报告管理</h2>
        <div>
          <span>云端账户</span>
          <span>服务端扣分</span>
          <span>报告归档</span>
          <span>失败不扣分</span>
        </div>
        <p>当前已支持云端报告历史，真实支付入口仍保留为后续接入。</p>
      </section>

      <section className={styles.listSection}>
        <div className={styles.sectionHead}>
          <h2>历史报告</h2>
          <span>{reports.length} 份</span>
        </div>

        <div className={styles.filterBar} aria-label="报告类型筛选">
          {REPORT_FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={domain === item.value ? styles.activeFilter : ''}
              onClick={() => setDomain(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {!account ? (
          <div className={styles.empty}>
            <p>登录后可查看云端报告历史。</p>
            <Link to="/account">去登录</Link>
          </div>
        ) : status === 'loading' ? (
          <div className={styles.empty}>
            <p>正在读取报告历史...</p>
          </div>
        ) : error ? (
          <div className={styles.empty}>
            <p>{error}</p>
          </div>
        ) : reports.length === 0 ? (
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
