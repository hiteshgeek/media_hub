/**
 * SelectionBox - Manages the selection box during region capture
 * @module SelectionBox
 */

import { generateEllipseClipPath, generateRectangleClipPath } from './ClipPathUtils.js';
import { updateDimensionsDisplay, hideDimensionsDisplay } from './DimensionsDisplay.js';

/**
 * Calculate selection box dimensions from mouse coordinates
 * @param {Object} startPoint - Starting point { clientX, clientY, x, y }
 * @param {number} currentClientX - Current mouse X position
 * @param {number} currentClientY - Current mouse Y position
 * @param {boolean} isSquareMode - Whether square/circle mode is active
 * @returns {Object} - { left, top, width, height }
 */
export function calculateSelectionDimensions(startPoint, currentClientX, currentClientY, isSquareMode) {
  // Calculate raw dimensions
  let rawWidth = Math.abs(currentClientX - startPoint.clientX);
  let rawHeight = Math.abs(currentClientY - startPoint.clientY);

  // If square/circle mode, use the larger dimension for both
  let width, height;
  if (isSquareMode) {
    const size = Math.max(rawWidth, rawHeight);
    width = size;
    height = size;
  } else {
    width = rawWidth;
    height = rawHeight;
  }

  // Calculate left/top based on drag direction
  let left, top;
  if (isSquareMode) {
    const dirX = currentClientX >= startPoint.clientX ? 1 : -1;
    const dirY = currentClientY >= startPoint.clientY ? 1 : -1;
    left = dirX >= 0 ? startPoint.clientX : startPoint.clientX - width;
    top = dirY >= 0 ? startPoint.clientY : startPoint.clientY - height;
  } else {
    left = Math.min(startPoint.clientX, currentClientX);
    top = Math.min(startPoint.clientY, currentClientY);
  }

  return { left, top, width, height };
}

/**
 * Update selection box visual appearance
 * @param {HTMLElement} selectionBox - The selection box element
 * @param {number} left - Left position
 * @param {number} top - Top position
 * @param {number} width - Width
 * @param {number} height - Height
 * @param {boolean} isOval - Whether oval mode is active
 */
export function updateSelectionBoxStyle(selectionBox, left, top, width, height, isOval) {
  selectionBox.style.left = left + 'px';
  selectionBox.style.top = top + 'px';
  selectionBox.style.width = width + 'px';
  selectionBox.style.height = height + 'px';

  if (isOval) {
    selectionBox.style.borderRadius = '50%';
    selectionBox.classList.add('oval-mode');
  } else {
    selectionBox.style.borderRadius = '0';
    selectionBox.classList.remove('oval-mode');
  }
}

/**
 * Update overlay clip-path based on selection
 * @param {HTMLElement} overlay - The overlay element
 * @param {number} left - Left position
 * @param {number} top - Top position
 * @param {number} width - Width
 * @param {number} height - Height
 * @param {boolean} isOval - Whether oval mode is active
 */
export function updateOverlayClipPath(overlay, left, top, width, height, isOval) {
  const right = left + width;
  const bottom = top + height;
  const centerX = left + width / 2;
  const centerY = top + height / 2;
  const radiusX = width / 2;
  const radiusY = height / 2;

  if (isOval) {
    overlay.style.clipPath = generateEllipseClipPath(centerX, centerY, radiusX, radiusY, 48);
  } else {
    overlay.style.clipPath = generateRectangleClipPath(left, top, width, height);
  }
}

/**
 * Update selection box and related elements
 * @param {Object} elements - { selectionBox, overlay, dimensionsDisplay }
 * @param {Object} startPoint - Starting point
 * @param {number} currentClientX - Current mouse X
 * @param {number} currentClientY - Current mouse Y
 * @param {Object} options - { isSquareMode, isOvalMode, showDimensions, dimensionsPosition }
 */
export function updateSelectionBox(elements, startPoint, currentClientX, currentClientY, options) {
  const { selectionBox, overlay, dimensionsDisplay } = elements;
  const { isSquareMode, isOvalMode, showDimensions, dimensionsPosition } = options;

  if (!startPoint) return;

  const isCircle = isSquareMode && isOvalMode;
  const { left, top, width, height } = calculateSelectionDimensions(
    startPoint,
    currentClientX,
    currentClientY,
    isSquareMode
  );

  // Update selection box visual
  updateSelectionBoxStyle(selectionBox, left, top, width, height, isOvalMode);

  // Update dimensions display based on mode
  if (showDimensions && dimensionsDisplay) {
    if (isOvalMode && !isCircle) {
      // Oval mode - hide dimensions
      hideDimensionsDisplay(dimensionsDisplay);
    } else if (isCircle) {
      // Circle mode - show radius
      const radius = Math.round(width / 2);
      updateDimensionsDisplay(dimensionsDisplay, left, top, width, height, dimensionsPosition, `${radius}`);
    } else {
      // Rectangle/square mode - show width × height
      updateDimensionsDisplay(dimensionsDisplay, left, top, width, height, dimensionsPosition);
    }
  }

  // Update clip-path on overlay
  updateOverlayClipPath(overlay, left, top, width, height, isOvalMode);
}

/**
 * Initialize selection box for mouse down
 * @param {HTMLElement} selectionBox - The selection box element
 * @param {number} clientX - Mouse X position
 * @param {number} clientY - Mouse Y position
 */
export function initSelectionBox(selectionBox, clientX, clientY) {
  selectionBox.style.display = 'block';
  selectionBox.style.left = clientX + 'px';
  selectionBox.style.top = clientY + 'px';
  selectionBox.style.width = '0';
  selectionBox.style.height = '0';
}

/**
 * Reset selection box to hidden state
 * @param {HTMLElement} selectionBox - The selection box element
 * @param {HTMLElement} overlay - The overlay element
 */
export function resetSelectionBox(selectionBox, overlay) {
  if (selectionBox) {
    selectionBox.style.display = 'none';
    selectionBox.classList.remove('oval-mode', 'confirmation-mode', 'dragging');
  }
  if (overlay) {
    overlay.style.clipPath = '';
  }
}

export default {
  calculateSelectionDimensions,
  updateSelectionBoxStyle,
  updateOverlayClipPath,
  updateSelectionBox,
  initSelectionBox,
  resetSelectionBox
};
