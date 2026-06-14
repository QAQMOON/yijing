import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalFor, SEO_PAGES } from '../src/data/seoPages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outputPath = path.join(rootDir, 'public', 'sitemap.xml');
const today = new Date().toISOString().slice(0, 10);

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function changefreqFor(page) {
  if (page.path === '/') return 'daily';
  if (Number(page.priority) >= 0.8) return 'weekly';
  return 'monthly';
}

const urls = SEO_PAGES.map((page) => [
  '  <url>',
  `    <loc>${escapeXml(canonicalFor(page.path))}</loc>`,
  `    <lastmod>${today}</lastmod>`,
  `    <changefreq>${changefreqFor(page)}</changefreq>`,
  `    <priority>${escapeXml(page.priority || '0.5')}</priority>`,
  '  </url>',
].join('\n')).join('\n');

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  urls,
  '</urlset>',
  '',
].join('\n');

await fs.writeFile(outputPath, sitemap, 'utf8');
console.log(`Generated sitemap with ${SEO_PAGES.length} URLs.`);
