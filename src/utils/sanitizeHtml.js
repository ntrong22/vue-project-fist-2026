import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_HTML_TAGS = Object.freeze([
  'p',
  'br',
  'strong',
  'em',
  'u',
  'a',
  'ul',
  'ol',
  'li',
  'blockquote',
  'h2',
  'h3',
  'h4',
  'img',
]);

const ALLOWED_HTML_ATTR = Object.freeze([
  'href',
  'title',
  'target',
  'rel',
  'src',
  'alt',
  'loading',
  'decoding',
  'referrerpolicy',
  'class',
]);

const FORBIDDEN_HTML_TAGS = Object.freeze([
  'iframe',
  'script',
  'object',
  'embed',
  'style',
  'meta',
  'link',
  'base',
  'form',
  'input',
  'button',
  'textarea',
  'select',
]);

const SAFE_LINK_PATTERN = /^(?:(?:https?|mailto|tel):|\/(?!\/)|#|\.{1,2}\/)/i;
const SAFE_IMAGE_PATTERN = /^(?:(?:https?):|\/(?!\/)|\.{1,2}\/)/i;

const FORBIDDEN_ATTR = Object.freeze(['style', 'srcset']);

const MAX_SEARCH_LENGTH = 120;
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/g;
const SEARCH_FORBIDDEN_CHARS = /[^\p{L}\p{N}\s\-_.:,/()+]/gu;

let hookAttached = false;

const attachSanitizeHooks = () => {
  if (hookAttached) {
    return;
  }

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    const elementNodeType = typeof Node === 'undefined' ? 1 : Node.ELEMENT_NODE;

    if (!node || node.nodeType !== elementNodeType) {
      return;
    }

    const tag = node.tagName.toLowerCase();

    if (node.hasAttribute('href')) {
      const href = node.getAttribute('href')?.trim() || '';

      if (!SAFE_LINK_PATTERN.test(href)) {
        node.removeAttribute('href');
      }
    }

    if (node.hasAttribute('src')) {
      const src = node.getAttribute('src')?.trim() || '';

      if (tag === 'img') {
        if (!SAFE_IMAGE_PATTERN.test(src)) {
          node.removeAttribute('src');
        }
      } else if (!SAFE_LINK_PATTERN.test(src)) {
        node.removeAttribute('src');
      }
    }

    if (tag === 'a') {
      node.setAttribute('rel', 'noopener noreferrer nofollow');
      node.setAttribute('target', '_blank');
    }

    if (tag === 'img') {
      node.setAttribute('loading', 'lazy');
      node.setAttribute('decoding', 'async');
      node.setAttribute('referrerpolicy', 'no-referrer');
    }
  });

  hookAttached = true;
};

const getSanitizeOptions = () => {
  return {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [...ALLOWED_HTML_TAGS],
    ALLOWED_ATTR: [...ALLOWED_HTML_ATTR],
    FORBID_TAGS: [...FORBIDDEN_HTML_TAGS],
    FORBID_ATTR: [...FORBIDDEN_ATTR],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SANITIZE_DOM: true,
    SANITIZE_NAMED_PROPS: true,
    CUSTOM_ELEMENT_HANDLING: {
      tagNameCheck: null,
      attributeNameCheck: null,
      allowCustomizedBuiltInElements: false,
    },
  };
};

export const sanitizeHtml = (input = '') => {
  if (typeof input !== 'string') {
    return '';
  }

  const content = input.trim();

  if (!content) {
    return '';
  }

  attachSanitizeHooks();

  return DOMPurify.sanitize(content, getSanitizeOptions());
};

export const escapeHtml = (value = '') => {
  return value
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export const normalizeSearchInput = (value = '') => {
  return value
    .toString()
    .normalize('NFKC')
    .replace(CONTROL_CHARACTERS, '')
    .replace(SEARCH_FORBIDDEN_CHARS, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_SEARCH_LENGTH);
};

export const sanitizeSearchInput = (value = '') => {
  return normalizeSearchInput(value);
};

export const encodeForDisplay = (value = '') => {
  return escapeHtml(normalizeSearchInput(value));
};
