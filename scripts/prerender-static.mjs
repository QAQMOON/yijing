import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalFor, SEO_PAGES } from '../src/data/seoPages.js';
import { BRAND_NAME, FOOTER_NAV, TOOL_NAV } from '../src/data/siteConfig.js';

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

function setTag(html, regex, replacement) {
  if (regex.test(html)) return html.replace(regex, replacement);
  return html.replace('</head>', `    ${replacement}\n  </head>`);
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
  html = setTag(html, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`);
  html = setTag(html, /<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`);
  html = setTag(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${escapeHtml(canonical)}" />`);
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
