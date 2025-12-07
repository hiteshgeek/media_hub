/**
 * CaptureOperations - Core capture functionality
 * @module CaptureOperations
 */

import { loadHtml2Canvas } from './Html2CanvasLoader.js';
import { canvasToBlob, applyEllipseMask } from './CanvasUtils.js';

/**
 * Default ignore elements filter for html2canvas
 * @param {Element} element - DOM element to check
 * @returns {boolean} - true to ignore, false to include
 */
function defaultIgnoreElements(element) {
  // Ignore elements with blob: src that may have been revoked
  if (element.src && element.src.startsWith('blob:')) {
    return true;
  }
  // Ignore video elements (they often have blob sources)
  if (element.tagName === 'VIDEO') {
    return true;
  }
  return false;
}

/**
 * Capture full page screenshot (including scrolled content)
 * @param {Object} options - Capture options
 * @returns {Promise<Blob>} - Screenshot as blob
 */
export async function captureFullPage(options) {
  const html2canvas = await loadHtml2Canvas();

  // Store current scroll position
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  const canvas = await html2canvas(document.body, {
    scale: options.scale,
    useCORS: options.useCORS,
    allowTaint: options.allowTaint,
    backgroundColor: options.backgroundColor,
    logging: options.logging,
    windowWidth: document.documentElement.scrollWidth,
    windowHeight: document.documentElement.scrollHeight,
    x: 0,
    y: 0,
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
    ignoreElements: defaultIgnoreElements,
  });

  // Restore scroll position
  window.scrollTo(scrollX, scrollY);

  return canvasToBlob(canvas, options.imageFormat, options.imageQuality);
}

/**
 * Capture visible viewport only
 * @param {Object} options - Capture options
 * @returns {Promise<Blob>} - Screenshot as blob
 */
export async function captureViewport(options) {
  const html2canvas = await loadHtml2Canvas();

  const canvas = await html2canvas(document.body, {
    scale: options.scale,
    useCORS: options.useCORS,
    allowTaint: options.allowTaint,
    backgroundColor: options.backgroundColor,
    logging: options.logging,
    x: window.scrollX,
    y: window.scrollY,
    width: window.innerWidth,
    height: window.innerHeight,
    ignoreElements: defaultIgnoreElements,
  });

  return canvasToBlob(canvas, options.imageFormat, options.imageQuality);
}

/**
 * Capture a specific area of the page
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} width - Width of area
 * @param {number} height - Height of area
 * @param {boolean} isOval - Whether to apply ellipse mask
 * @param {Object} options - Capture options
 * @returns {Promise<Blob>} - Screenshot as blob
 */
export async function captureArea(x, y, width, height, isOval, options) {
  const html2canvas = await loadHtml2Canvas();

  const canvas = await html2canvas(document.body, {
    scale: options.scale,
    useCORS: options.useCORS,
    allowTaint: options.allowTaint,
    backgroundColor: options.backgroundColor,
    logging: options.logging,
    x: x,
    y: y,
    width: width,
    height: height,
    windowWidth: document.documentElement.scrollWidth,
    windowHeight: document.documentElement.scrollHeight,
    ignoreElements: defaultIgnoreElements,
  });

  // Apply ellipse mask if in oval/circle mode
  let finalCanvas = canvas;
  if (isOval) {
    finalCanvas = applyEllipseMask(canvas);
  }

  return canvasToBlob(finalCanvas, options.imageFormat, options.imageQuality);
}

export default {
  captureFullPage,
  captureViewport,
  captureArea
};
