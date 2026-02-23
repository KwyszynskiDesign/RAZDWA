// common.js – shared utilities for RAZDWA calculators

/**
 * Convert pixels to millimetres given a DPI resolution.
 * @param {number} px
 * @param {number} dpi
 * @returns {number}
 */
export function pxToMm(px, dpi) {
  return (px * 25.4) / dpi;
}

/**
 * Format a numeric value as a Polish-locale PLN string.
 * @param {number} val
 * @returns {string}
 */
export function formatPLN(val) {
  return val.toFixed(2).replace('.', ',') + ' zł';
}

/**
 * Return the value of a DOM element by id, or a fallback.
 * @param {string} id
 * @param {string} [fallback='']
 * @returns {string}
 */
export function getVal(id, fallback = '') {
  const el = document.getElementById(id);
  return el ? el.value : fallback;
}

/**
 * Set the text content of a DOM element by id.
 * @param {string} id
 * @param {string} text
 */
export function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/**
 * Show or hide a DOM element by id.
 * @param {string} id
 * @param {boolean} visible
 */
export function setVisible(id, visible) {
  const el = document.getElementById(id);
  if (el) el.style.display = visible ? '' : 'none';
}
