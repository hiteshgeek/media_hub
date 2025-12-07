/**
 * CanvasUtils - Canvas and blob manipulation utilities
 * @module CanvasUtils
 */

/**
 * Convert canvas to blob
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {string} imageFormat - Image format (e.g., 'image/png')
 * @param {number} imageQuality - Image quality (0-1)
 * @returns {Promise<Blob>}
 */
export function canvasToBlob(canvas, imageFormat = 'image/png', imageQuality = 0.92) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      imageFormat,
      imageQuality
    );
  });
}

/**
 * Apply an ellipse mask to a canvas
 * @param {HTMLCanvasElement} sourceCanvas - The source canvas
 * @returns {HTMLCanvasElement} - New canvas with ellipse mask applied
 */
export function applyEllipseMask(sourceCanvas) {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  // Create a new canvas for the masked result
  const maskedCanvas = document.createElement('canvas');
  maskedCanvas.width = width;
  maskedCanvas.height = height;
  const ctx = maskedCanvas.getContext('2d');

  // Draw ellipse path as clip mask
  ctx.beginPath();
  ctx.ellipse(width / 2, height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  // Draw the source image within the clipped area
  ctx.drawImage(sourceCanvas, 0, 0);

  return maskedCanvas;
}

/**
 * Convert blob to File object
 * @param {Blob} blob - The blob to convert
 * @param {string} filenamePrefix - Prefix for the filename
 * @param {string} type - Type of capture (fullpage, viewport, region)
 * @returns {File}
 */
export function blobToFile(blob, filenamePrefix = 'screenshot', type = 'screenshot') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `${filenamePrefix}-${type}-${timestamp}.png`;
  return new File([blob], filename, { type: blob.type });
}

export default {
  canvasToBlob,
  applyEllipseMask,
  blobToFile
};
