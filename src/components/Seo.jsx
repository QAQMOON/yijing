import { useEffect } from 'react';
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '../data/siteConfig.js';
import { SEO_PAGES } from '../data/seoPages.js';

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function upsertCanonical(href) {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

function normalizePath(path) {
  if (!path || path === '/') return '/';
  return path.startsWith('/') ? path : `/${path}`;
}

export default function Seo({ title = SITE_TITLE, description = SITE_DESCRIPTION, path }) {
  useEffect(() => {
    const pathname = normalizePath(path || window.location.pathname);
    const page = SEO_PAGES.find((item) => item.path === pathname);
    const pageTitle = title || page?.title || SITE_TITLE;
    const pageDescription = description || page?.description || SITE_DESCRIPTION;
    const canonical = `${SITE_URL}${pathname === '/' ? '' : pathname}`;

    document.title = pageTitle;
    upsertMeta('meta[name="description"]', { name: 'description', content: pageDescription });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: 'index, follow' });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: pageTitle });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: pageDescription });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: '易解' });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonical });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: pageTitle });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: pageDescription });
    upsertCanonical(canonical);
  }, [description, path, title]);

  return null;
}
