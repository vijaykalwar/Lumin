// ════════════════════════════════════════════════════════════
// XSS SANITIZATION - Strip/escape HTML and script content
// ════════════════════════════════════════════════════════════

/**
 * Escape HTML entities to prevent XSS
 * @param {string} input - User input
 * @returns {string} - Sanitized string
 */
function escapeHtml(input) {
  if (typeof input !== 'string') return input;
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };
  return input.replace(/[&<>"'`=/]/g, (c) => map[c]);
}

/**
 * Remove script tags and event handlers, then escape
 * @param {string} input - User input
 * @returns {string} - Sanitized string
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  let out = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<\s*\/?\s*\w+[^>]*>/g, '');
  return escapeHtml(out).trim();
}

/**
 * Sanitize array of strings (e.g. tags)
 */
function sanitizeArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => (typeof item === 'string' ? sanitizeInput(item) : item)).filter(Boolean);
}

module.exports = { sanitizeInput, escapeHtml, sanitizeArray };
