import { useEffect } from 'react';
import { SITE_DESCRIPTION, SITE_OG_IMAGE, SITE_TITLE, SITE_URL } from '../data/siteConfig.js';
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

function upsertJsonLd(id, data) {
  let element = document.head.querySelector(`script[data-yijie-jsonld="${id}"]`);
  if (!element) {
    element = document.createElement('script');
    element.setAttribute('type', 'application/ld+json');
    element.setAttribute('data-yijie-jsonld', id);
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(data);
}

function buildStructuredData({ canonical, description, pathname, title }) {
  const graph = [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: '易解',
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
      name: '易解',
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
      name: title,
      description,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      inLanguage: 'zh-CN',
    },
  ];

  if (pathname === '/' || pathname === '/classics') {
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
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: SITE_OG_IMAGE });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: pageTitle });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: pageDescription });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: SITE_OG_IMAGE });
    upsertCanonical(canonical);
    upsertJsonLd('primary', buildStructuredData({
      canonical,
      description: pageDescription,
      pathname,
      title: pageTitle,
    }));
  }, [description, path, title]);

  return null;
}
