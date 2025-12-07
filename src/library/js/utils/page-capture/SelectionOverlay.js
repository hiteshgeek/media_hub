/**
 * SelectionOverlay - Manages the selection overlay UI elements
 * @module SelectionOverlay
 */

/**
 * Create the selection overlay HTML content
 * @param {boolean} isOvalMode - Whether oval mode is active
 * @returns {string} - HTML content
 */
export function createOverlayContent(isOvalMode) {
  return `
    <div class="file-uploader-page-capture-instructions">
      <span class="file-uploader-page-capture-instructions-text">Click and drag to select an area</span>
      <div class="file-uploader-page-capture-instructions-shortcuts">
        <span class="file-uploader-page-capture-shortcut${!isOvalMode ? ' active' : ''}" data-shape="rectangle"><kbd>1</kbd> Rectangle</span>
        <span class="file-uploader-page-capture-shortcut${isOvalMode ? ' active' : ''}" data-shape="oval"><kbd>2</kbd> Oval</span>
        <span class="file-uploader-page-capture-shortcut"><kbd>Ctrl</kbd> Square/Circle</span>
        <span class="file-uploader-page-capture-shortcut"><kbd>ESC</kbd> Cancel</span>
      </div>
    </div>
  `;
}

/**
 * Create repositioning instructions HTML content
 * @returns {string} - HTML content
 */
export function createRepositionInstructions() {
  return `
    <span class="file-uploader-page-capture-instructions-text">Drag to reposition selection</span>
    <div class="file-uploader-page-capture-instructions-shortcuts">
      <span class="file-uploader-page-capture-shortcut"><kbd>Enter</kbd> Accept</span>
      <span class="file-uploader-page-capture-shortcut"><kbd>R</kbd> Recapture</span>
      <span class="file-uploader-page-capture-shortcut"><kbd>ESC</kbd> Cancel</span>
    </div>
  `;
}

/**
 * Create the selection overlay and related elements
 * @param {boolean} isOvalMode - Whether oval mode is active
 * @returns {Object} - { overlay, selectionBox, shapeFeedback }
 */
export function createSelectionElements(isOvalMode) {
  // Main overlay container (will have clip-path applied)
  const overlay = document.createElement('div');
  overlay.className = 'file-uploader-page-capture-overlay';
  overlay.innerHTML = createOverlayContent(isOvalMode);

  // Selection box must be a SIBLING of the overlay, not a child
  // This prevents it from being clipped when overlay gets clip-path
  const selectionBox = document.createElement('div');
  selectionBox.className = 'file-uploader-page-capture-selection-box';

  // Shape feedback element - also a sibling to avoid clip-path issues
  const shapeFeedback = document.createElement('div');
  shapeFeedback.className = 'file-uploader-page-capture-shape-feedback';

  return { overlay, selectionBox, shapeFeedback };
}

/**
 * Add selection elements to the DOM
 * @param {HTMLElement} overlay - The overlay element
 * @param {HTMLElement} selectionBox - The selection box element
 * @param {HTMLElement} shapeFeedback - The shape feedback element
 */
export function appendSelectionElements(overlay, selectionBox, shapeFeedback) {
  document.body.appendChild(overlay);
  document.body.appendChild(selectionBox);
  document.body.appendChild(shapeFeedback);
}

/**
 * Remove selection overlay and related elements from DOM
 * @param {HTMLElement} overlay - The overlay element
 * @param {HTMLElement} selectionBox - The selection box element
 * @param {HTMLElement} shapeFeedback - The shape feedback element
 */
export function removeSelectionElements(overlay, selectionBox, shapeFeedback) {
  if (overlay) overlay.remove();
  if (selectionBox) selectionBox.remove();
  if (shapeFeedback) shapeFeedback.remove();
}

/**
 * Show shape feedback popup
 * @param {HTMLElement} shapeFeedback - The shape feedback element
 * @param {string} shapeName - Shape name to display
 * @param {boolean} isSquareMode - Whether Ctrl is pressed
 * @returns {number} - Timeout ID for cleanup
 */
export function showShapeFeedback(shapeFeedback, shapeName, isSquareMode) {
  if (!shapeFeedback) return null;

  // Determine the actual shape based on Ctrl state
  let displayText = shapeName;
  if (isSquareMode) {
    displayText = shapeName === 'Oval' ? 'Circle' : 'Square';
  }

  shapeFeedback.textContent = displayText;
  shapeFeedback.classList.add('visible');

  // Return timeout ID for cleanup
  return setTimeout(() => {
    if (shapeFeedback) {
      shapeFeedback.classList.remove('visible');
    }
  }, 800);
}

/**
 * Update the shape indicator in the instructions area
 * @param {HTMLElement} overlay - The overlay element
 * @param {string} shapeName - Current shape name
 */
export function updateShapeIndicator(overlay, shapeName) {
  if (!overlay) return;

  // Update active state on shortcut elements
  const rectangleShortcut = overlay.querySelector('.file-uploader-page-capture-shortcut[data-shape="rectangle"]');
  const ovalShortcut = overlay.querySelector('.file-uploader-page-capture-shortcut[data-shape="oval"]');

  if (rectangleShortcut && ovalShortcut) {
    const isOval = shapeName === 'Oval' || shapeName === 'Circle';
    rectangleShortcut.classList.toggle('active', !isOval);
    ovalShortcut.classList.toggle('active', isOval);
  }
}

/**
 * Update instructions visibility
 * @param {HTMLElement} overlay - The overlay element
 * @param {boolean} visible - Whether instructions should be visible
 */
export function setInstructionsVisibility(overlay, visible) {
  const instructions = overlay?.querySelector('.file-uploader-page-capture-instructions');
  if (instructions) {
    instructions.style.opacity = visible ? '1' : '0';
  }
}

/**
 * Update instructions content for confirmation mode
 * @param {HTMLElement} overlay - The overlay element
 * @param {boolean} isOvalMode - Whether oval mode is active
 * @param {boolean} isConfirmationMode - Whether in confirmation mode
 */
export function updateInstructionsContent(overlay, isOvalMode, isConfirmationMode) {
  const instructions = overlay?.querySelector('.file-uploader-page-capture-instructions');
  if (instructions) {
    instructions.innerHTML = isConfirmationMode
      ? createRepositionInstructions()
      : createOverlayContent(isOvalMode).match(/<div class="file-uploader-page-capture-instructions">([\s\S]*?)<\/div>/)?.[0]?.replace(/<\/?div[^>]*>/g, '') || createOverlayContent(isOvalMode);
    instructions.style.opacity = '1';
  }
}

export default {
  createOverlayContent,
  createRepositionInstructions,
  createSelectionElements,
  appendSelectionElements,
  removeSelectionElements,
  showShapeFeedback,
  updateShapeIndicator,
  setInstructionsVisibility,
  updateInstructionsContent
};
