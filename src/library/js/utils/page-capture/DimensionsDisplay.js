/**
 * DimensionsDisplay - Manages dimensions display during selection
 * @module DimensionsDisplay
 */

// Valid positions for dimensions display
export const DIMENSIONS_POSITIONS = [
  'top-left', 'top-center', 'top-right',
  'center-left', 'center', 'center-right',
  'bottom-left', 'bottom-center', 'bottom-right'
];

/**
 * Create dimensions display element
 * @returns {HTMLElement}
 */
export function createDimensionsDisplay() {
  const element = document.createElement('div');
  element.className = 'file-uploader-page-capture-dimensions';
  element.style.display = 'none';
  document.body.appendChild(element);
  return element;
}

/**
 * Update dimensions display position and content
 * @param {HTMLElement} displayElement - The dimensions display element
 * @param {number} left - Left position
 * @param {number} top - Top position
 * @param {number} width - Selection width
 * @param {number} height - Selection height
 * @param {string} position - Position option (e.g., 'center', 'bottom-center')
 * @param {string} customText - Optional custom text to display instead of dimensions
 */
export function updateDimensionsDisplay(displayElement, left, top, width, height, position = 'center', customText = null) {
  if (!displayElement) return;

  // Show dimensions display
  displayElement.style.display = 'block';
  displayElement.textContent = customText || `${Math.round(width)} × ${Math.round(height)}`;

  // Calculate position based on option
  const boxRight = left + width;
  const boxBottom = top + height;
  const boxCenterX = left + width / 2;
  const boxCenterY = top + height / 2;

  // Get dimensions display size for positioning
  const displayRect = displayElement.getBoundingClientRect();
  const displayWidth = displayRect.width || 80;
  const displayHeight = displayRect.height || 24;
  const offset = 8; // Gap between selection box and dimensions

  let posX, posY;

  switch (position) {
    case 'top-left':
      posX = left;
      posY = top - displayHeight - offset;
      break;
    case 'top-center':
      posX = boxCenterX - displayWidth / 2;
      posY = top - displayHeight - offset;
      break;
    case 'top-right':
      posX = boxRight - displayWidth;
      posY = top - displayHeight - offset;
      break;
    case 'center-left':
      posX = left - displayWidth - offset;
      posY = boxCenterY - displayHeight / 2;
      break;
    case 'center':
      posX = boxCenterX - displayWidth / 2;
      posY = boxCenterY - displayHeight / 2;
      break;
    case 'center-right':
      posX = boxRight + offset;
      posY = boxCenterY - displayHeight / 2;
      break;
    case 'bottom-left':
      posX = left;
      posY = boxBottom + offset;
      break;
    case 'bottom-center':
    default:
      posX = boxCenterX - displayWidth / 2;
      posY = boxBottom + offset;
      break;
    case 'bottom-right':
      posX = boxRight - displayWidth;
      posY = boxBottom + offset;
      break;
  }

  // Ensure dimensions stay within viewport
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  posX = Math.max(8, Math.min(posX, viewportWidth - displayWidth - 8));
  posY = Math.max(8, Math.min(posY, viewportHeight - displayHeight - 8));

  displayElement.style.left = posX + 'px';
  displayElement.style.top = posY + 'px';
}

/**
 * Hide dimensions display
 * @param {HTMLElement} displayElement - The dimensions display element
 */
export function hideDimensionsDisplay(displayElement) {
  if (displayElement) {
    displayElement.style.display = 'none';
  }
}

/**
 * Remove dimensions display element from DOM
 * @param {HTMLElement} displayElement - The dimensions display element
 */
export function removeDimensionsDisplay(displayElement) {
  if (displayElement) {
    displayElement.remove();
  }
}

export default {
  DIMENSIONS_POSITIONS,
  createDimensionsDisplay,
  updateDimensionsDisplay,
  hideDimensionsDisplay,
  removeDimensionsDisplay
};
