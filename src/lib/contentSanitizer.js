import DOMPurify from 'dompurify';

const ALLOWED_IFRAME_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);

const isAllowedIframeSrc = (src) => {
  if (!src || typeof src !== 'string') return false;
  try {
    const url = new URL(src, window.location.origin);
    if (url.protocol !== 'https:') return false;
    return ALLOWED_IFRAME_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
};

const iframeWhitelistHook = (node) => {
  if (node.tagName === 'IFRAME') {
    const src = node.getAttribute('src') || '';
    if (!isAllowedIframeSrc(src)) {
      node.parentNode?.removeChild(node);
    }
  }
};

export const sanitizeArticleHtml = (html) => {
  if (!html) return '';
  DOMPurify.addHook('afterSanitizeAttributes', iframeWhitelistHook);
  try {
    return DOMPurify.sanitize(html, {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'width', 'height'],
    });
  } finally {
    DOMPurify.removeHook('afterSanitizeAttributes');
  }
};
