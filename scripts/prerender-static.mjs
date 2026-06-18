import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalFor, SEO_PAGES } from '../src/data/seoPages.js';
import {
  BRAND_NAME,
  FOOTER_NAV,
  SITE_DESCRIPTION,
  SITE_OG_IMAGE,
  SITE_URL,
  TOOL_NAV,
} from '../src/data/siteConfig.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const indexPath = path.join(distDir, 'index.html');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJsonLd(value) {
  return String(value).replace(/</g, '\\u003c');
}

function setTag(html, regex, replacement) {
  if (regex.test(html)) return html.replace(regex, replacement);
  return html.replace('</head>', `    ${replacement}\n  </head>`);
}

function buildStructuredData(page, canonical) {
  const graph = [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: BRAND_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: 'zh-CN',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/classics?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#app`,
      name: BRAND_NAME,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web',
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'CNY',
      },
    },
    {
      '@type': 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: page.title,
      description: page.description,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      inLanguage: 'zh-CN',
    },
  ];

  if (page.path === '/' || page.path === '/classics') {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${canonical}#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: '易解的 AI 解读会直接引用古籍吗？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '会优先使用排盘中已整理的卦辞、彖传、象传、爻辞等文本，并在报告里标出依据层。',
          },
        },
        {
          '@type': 'Question',
          name: '古籍依据是否等于确定结论？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '不是。古籍依据用于解释推理路径，结论仍应作为文化参考和决策辅助。',
          },
        },
        {
          '@type': 'Question',
          name: '双术合参报告是什么？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '双术合参 MVP 把八字长期结构和六爻当下问事放进同一份综合报告，紫微作为后续扩展。',
          },
        },
      ],
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

function renderFallback(page) {
  const nav = [...TOOL_NAV, ...FOOTER_NAV]
    .map((item) => `<a href="${escapeHtml(item.to)}">${escapeHtml(item.label)}</a>`)
    .join('');

  return [
    '<div id="root">',
    '<main style="max-width:760px;margin:0 auto;padding:48px 24px;font-family:serif;line-height:1.8;color:#1c1410;background:#f5f1e8">',
    `<p style="letter-spacing:.18em;color:#9a7a20">${escapeHtml(BRAND_NAME)}</p>`,
    `<h1>${escapeHtml(page.heading)}</h1>`,
    `<p>${escapeHtml(page.summary)}</p>`,
    `<nav style="display:flex;flex-wrap:wrap;gap:12px;margin-top:32px">${nav}</nav>`,
    '</main>',
    '</div>',
  ].join('');
}

function renderPage(baseHtml, page) {
  const canonical = canonicalFor(page.path);
  let html = baseHtml;

  html = setTag(html, /<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`);
  html = setTag(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeHtml(page.description)}" />`);
  html = setTag(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeHtml(page.title)}" />`);
  html = setTag(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escapeHtml(page.description)}" />`);
  html = setTag(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${escapeHtml(canonical)}" />`);
  html = setTag(html, /<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${escapeHtml(SITE_OG_IMAGE)}" />`);
  html = setTag(html, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`);
  html = setTag(html, /<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`);
  html = setTag(html, /<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${escapeHtml(SITE_OG_IMAGE)}" />`);
  html = setTag(html, /<meta name="twitter:card" content="[^"]*" \/>/, '<meta name="twitter:card" content="summary_large_image" />');
  html = setTag(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${escapeHtml(canonical)}" />`);
  html = setTag(
    html,
    /<script type="application\/ld\+json" data-yijie-jsonld="primary">[\s\S]*?<\/script>/,
    `<script type="application/ld+json" data-yijie-jsonld="primary">${escapeJsonLd(JSON.stringify(buildStructuredData(page, canonical)))}</script>`,
  );
  html = html.replace(/<div id="root"><\/div>/, renderFallback(page));

  return html;
}

async function writeRoutePage(baseHtml, page) {
  const html = renderPage(baseHtml, page);
  const outputPath = page.path === '/'
    ? indexPath
    : path.join(distDir, page.path.slice(1), 'index.html');

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, html, 'utf8');
}

const baseHtml = await fs.readFile(indexPath, 'utf8');
await Promise.all(SEO_PAGES.map((page) => writeRoutePage(baseHtml, page)));

console.log(`Generated ${SEO_PAGES.length} static route HTML files.`);
