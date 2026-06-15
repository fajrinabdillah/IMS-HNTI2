// Sanitize HTML pasted from MS Word / Excel for contentEditable editors.
const ALLOWED_TAGS = new Set([
  'P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE',
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'UL', 'OL', 'LI',
  'TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TH', 'TD', 'COLGROUP', 'COL',
  'DIV', 'SPAN', 'A', 'IMG', 'SUP', 'SUB', 'BLOCKQUOTE',
]);

const STRIP_TAGS = new Set(['STYLE', 'SCRIPT', 'META', 'LINK', 'TITLE', 'HEAD', 'HTML', 'BODY', 'NOSCRIPT', 'XML', 'FONT']);

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function isOfficeTag(tag) {
  return !tag || tag.includes(':') || /^[OWMX]:/i.test(tag);
}

function stripOfficeArtifacts(html) {
  return String(html || '')
    .replace(/<!--(?:Start|End)Fragment-->/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?(?:o|w|m|v|st1|x):[^>]*>/gi, '')
    .replace(/<\/?font[^>]*>/gi, '')
    .replace(/\s(?:class|lang|xml:lang|xmlns(?::\w+)?|dir|face|size|color|width|height|valign|border|cellpadding|cellspacing|background|bgcolor|align|x:num|x:str|x:fmla|data-[\w-]+)\s*=\s*"[^"]*"/gi, '')
    .replace(/\s(?:class|style|lang)\s*=\s*'[^']*'/gi, '')
    .replace(/\sstyle\s*=\s*"[^"]*mso-[^"]*"/gi, '')
    .replace(/\sstyle\s*=\s*"[^"]*"/gi, '');
}

function cleanNode(node, doc) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.replace(/\u00a0/g, ' ') ?? '';
    return text ? doc.createTextNode(text) : null;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const tag = String(node.tagName || '').toUpperCase();
  if (isOfficeTag(tag) || STRIP_TAGS.has(tag)) {
    const frag = doc.createDocumentFragment();
    Array.from(node.childNodes).forEach(child => {
      const cleaned = cleanNode(child, doc);
      if (cleaned) frag.appendChild(cleaned);
    });
    return frag.childNodes.length ? frag : null;
  }

  if (!ALLOWED_TAGS.has(tag)) {
    const frag = doc.createDocumentFragment();
    Array.from(node.childNodes).forEach(child => {
      const cleaned = cleanNode(child, doc);
      if (cleaned) frag.appendChild(cleaned);
    });
    return frag.childNodes.length ? frag : null;
  }

  const el = doc.createElement(tag.toLowerCase());
  if (tag === 'A') {
    const href = node.getAttribute('href');
    if (href && (/^https?:\/\//i.test(href) || href.startsWith('#') || href.startsWith('mailto:'))) {
      el.setAttribute('href', href);
    }
  }
  if (tag === 'IMG') {
    const src = node.getAttribute('src');
    if (src) {
      el.setAttribute('src', src);
      el.style.maxWidth = '100%';
      el.style.height = 'auto';
    }
  }
  if (tag === 'TD' || tag === 'TH') {
    ['colspan', 'rowspan'].forEach(attr => {
      const v = node.getAttribute(attr);
      if (v && v !== '1') el.setAttribute(attr, v);
    });
  }
  const textAlign = node.style?.textAlign || node.getAttribute('align');
  if (textAlign && ['left', 'center', 'right', 'justify'].includes(String(textAlign).toLowerCase())) {
    el.style.textAlign = textAlign.toLowerCase();
  }

  Array.from(node.childNodes).forEach(child => {
    const cleaned = cleanNode(child, doc);
    if (cleaned) el.appendChild(cleaned);
  });

  if ((tag === 'TD' || tag === 'TH') && !el.textContent.trim()) {
    el.innerHTML = '&nbsp;';
  }
  if (tag === 'DIV' && el.childNodes.length === 1 && el.firstChild?.nodeName === 'P') {
    return el.firstChild;
  }
  if (tag === 'DIV' && !el.querySelector('table') && el.textContent.trim()) {
    const p = doc.createElement('p');
    while (el.firstChild) p.appendChild(el.firstChild);
    return p;
  }

  return el;
}

function normalizeTableStructure(html) {
  if (!html || typeof document === 'undefined') return html || '';
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  wrap.querySelectorAll('table').forEach(table => {
    const orphanRows = Array.from(table.querySelectorAll(':scope > tr'));
    if (orphanRows.length) {
      let tbody = table.querySelector('tbody');
      if (!tbody) {
        tbody = document.createElement('tbody');
        table.appendChild(tbody);
      }
      orphanRows.forEach(tr => tbody.appendChild(tr));
    }
    table.querySelectorAll('colgroup, col').forEach(n => n.remove());
    table.removeAttribute('style');
    table.removeAttribute('width');
    table.querySelectorAll('td, th').forEach(cell => {
      cell.removeAttribute('style');
      cell.removeAttribute('width');
      cell.removeAttribute('height');
      if (!cell.textContent.trim()) cell.innerHTML = '&nbsp;';
    });
  });
  return wrap.innerHTML;
}

function sanitizeOfficeHtml(html) {
  if (!html) return '';
  if (typeof document === 'undefined') return html;

  const stripped = stripOfficeArtifacts(html);
  const parsed = new DOMParser().parseFromString(`<div>${stripped}</div>`, 'text/html');
  const root = parsed.body?.firstElementChild;
  if (!root) return '';

  const out = document.createDocumentFragment();
  Array.from(root.childNodes).forEach(child => {
    const cleaned = cleanNode(child, document);
    if (cleaned) out.appendChild(cleaned);
  });

  const wrap = document.createElement('div');
  wrap.appendChild(out);
  return normalizeTableStructure(wrap.innerHTML);
}

function plainTextToEditableHtml(text) {
  const raw = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (!raw.trim()) return '';

  const rows = raw.split('\n').filter(row => row.length > 0);
  const hasTabs = rows.some(row => row.includes('\t'));
  if (!hasTabs) return raw.replace(/\n/g, '<br>');

  const body = rows.map(row => {
    const cells = row.split('\t').map(cell => `<td>${escapeHtml(cell.trim()) || '&nbsp;'}</td>`).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  return normalizeTableStructure(`<table><tbody>${body}</tbody></table>`);
}

/** Paste handler for Word + Excel into template editor. */
function sanitizeOfficePaste(html, plainText = '') {
  const cleanedHtml = html ? sanitizeOfficeHtml(html) : '';
  if (cleanedHtml && /<table[\s>]/i.test(cleanedHtml)) return cleanedHtml;
  if (cleanedHtml && cleanedHtml.replace(/<br\s*\/?>/gi, '').trim()) return cleanedHtml;

  const fromPlain = plainTextToEditableHtml(plainText);
  if (/<table[\s>]/i.test(fromPlain)) return fromPlain;

  return String(plainText || '').replace(/\n/g, '<br>');
}

/** @deprecated use sanitizeOfficePaste */
const sanitizeWordHtml = sanitizeOfficeHtml;

export { sanitizeOfficePaste, sanitizeOfficeHtml, sanitizeWordHtml, plainTextToEditableHtml };
