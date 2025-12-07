/**
 * SelectionHandlers - Mouse and keyboard event handlers for selection
 * @module SelectionHandlers
 */

import { saveShapePreference } from './ShapePreference.js';
import { calculateSelectionDimensions, updateSelectionBoxStyle, initSelectionBox, resetSelectionBox } from './SelectionBox.js';
import { updateDimensionsDisplay, hideDimensionsDisplay } from './DimensionsDisplay.js';
import { setInstructionsVisibility, showShapeFeedback, updateShapeIndicator } from './SelectionOverlay.js';

/**
 * Create selection event handler functions bound to a PageCapture instance
 * @param {Object} instance - PageCapture instance
 * @returns {Object} - Event handler functions
 */
export function createSelectionHandlers(instance) {
  /**
   * Handle mouse down - start selection
   */
  function handleMouseDown(e) {
    if (e.button !== 0) return;

    if (instance.isConfirmationMode) {
      instance.exitConfirmationMode();
      resetSelectionBox(instance.selectionBox, instance.selectionOverlay);
    }

    instance.startPoint = {
      clientX: e.clientX,
      clientY: e.clientY,
      x: e.clientX + window.scrollX,
      y: e.clientY + window.scrollY
    };

    initSelectionBox(instance.selectionBox, instance.startPoint.clientX, instance.startPoint.clientY);
    instance.selectionOverlay.classList.add('selecting');
    setInstructionsVisibility(instance.selectionOverlay, false);
  }

  /**
   * Handle mouse move - update selection box
   */
  function handleMouseMove(e) {
    if (!instance.startPoint) return;

    instance.isSquareMode = e.ctrlKey || e.metaKey;
    instance.lastMousePosition = { clientX: e.clientX, clientY: e.clientY };
    updateSelectionBoxFromMouse(instance, e.clientX, e.clientY);
  }

  /**
   * Handle mouse up - complete selection
   */
  async function handleMouseUp(e) {
    if (instance.isDraggingSelection) {
      instance.isDraggingSelection = false;
      instance.dragStartPoint = null;
      return;
    }

    if (!instance.startPoint) return;

    const isSquareOrCircle = e.ctrlKey || e.metaKey || instance.isSquareMode;
    const isOval = instance.isOvalMode;
    const currentX = e.clientX + window.scrollX;
    const currentY = e.clientY + window.scrollY;

    const { left, top, width, height } = calculateFinalDimensions(instance.startPoint, currentX, currentY, isSquareOrCircle);

    instance.startPoint = null;
    instance.isSquareMode = false;

    if (width < instance.options.minSelectionSize || height < instance.options.minSelectionSize) {
      resetSelectionBox(instance.selectionBox, instance.selectionOverlay);
      instance.selectionOverlay.classList.remove('selecting');
      setInstructionsVisibility(instance.selectionOverlay, true);
      return;
    }

    if (!instance.options.immediateCapture) {
      instance.enterConfirmationMode(left, top, width, height, isOval);
      return;
    }

    await instance.performCapture(left, top, width, height, isOval);
  }

  /**
   * Handle keyboard events
   */
  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      instance.cancelSelection();
    } else if (instance.isConfirmationMode) {
      if (e.key === 'Enter') {
        e.preventDefault();
        instance.acceptSelection();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        instance.restartSelection();
      }
    } else if ((e.key === 'Control' || e.key === 'Meta') && instance.startPoint && instance.lastMousePosition) {
      instance.isSquareMode = true;
      updateSelectionBoxFromMouse(instance, instance.lastMousePosition.clientX, instance.lastMousePosition.clientY);
    } else if (e.key === '1' && instance.isOvalMode) {
      instance.isOvalMode = false;
      saveShapePreference(false);
      triggerShapeFeedback(instance, 'Rectangle');
      if (instance.startPoint && instance.lastMousePosition) {
        updateSelectionBoxFromMouse(instance, instance.lastMousePosition.clientX, instance.lastMousePosition.clientY);
      }
    } else if (e.key === '2' && !instance.isOvalMode) {
      instance.isOvalMode = true;
      saveShapePreference(true);
      triggerShapeFeedback(instance, 'Oval');
      if (instance.startPoint && instance.lastMousePosition) {
        updateSelectionBoxFromMouse(instance, instance.lastMousePosition.clientX, instance.lastMousePosition.clientY);
      }
    }
  }

  /**
   * Handle key up - toggle square mode off when Ctrl released
   */
  function handleKeyUp(e) {
    if (e.key === 'Control' || e.key === 'Meta') {
      instance.isSquareMode = false;
      if (instance.startPoint && instance.lastMousePosition) {
        updateSelectionBoxFromMouse(instance, instance.lastMousePosition.clientX, instance.lastMousePosition.clientY);
      }
    }
  }

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleKeyDown,
    handleKeyUp
  };
}

/**
 * Update selection box from mouse position
 * @param {Object} instance - PageCapture instance
 * @param {number} clientX - Mouse X position
 * @param {number} clientY - Mouse Y position
 */
export function updateSelectionBoxFromMouse(instance, clientX, clientY) {
  if (!instance.startPoint) return;

  const isCircle = instance.isSquareMode && instance.isOvalMode;
  const { left, top, width, height } = calculateSelectionDimensions(
    instance.startPoint,
    clientX,
    clientY,
    instance.isSquareMode
  );

  updateSelectionBoxStyle(instance.selectionBox, left, top, width, height, instance.isOvalMode);

  if (instance.options.showDimensions && instance.dimensionsDisplay) {
    if (instance.isOvalMode && !isCircle) {
      hideDimensionsDisplay(instance.dimensionsDisplay);
    } else if (isCircle) {
      const radius = Math.round(width / 2);
      updateDimensionsDisplay(instance.dimensionsDisplay, left, top, width, height, instance.options.dimensionsPosition, `${radius}`);
    } else {
      updateDimensionsDisplay(instance.dimensionsDisplay, left, top, width, height, instance.options.dimensionsPosition);
    }
  }

  // Import and use updateOverlayClipPath
  const { updateOverlayClipPath } = require('./SelectionBox.js');
  updateOverlayClipPath(instance.selectionOverlay, left, top, width, height, instance.isOvalMode);
}

/**
 * Calculate final dimensions from document coordinates
 * @param {Object} startPoint - Starting point { x, y }
 * @param {number} currentX - Current X (document coords)
 * @param {number} currentY - Current Y (document coords)
 * @param {boolean} isSquareOrCircle - Whether square/circle mode is active
 * @returns {Object} - { left, top, width, height }
 */
export function calculateFinalDimensions(startPoint, currentX, currentY, isSquareOrCircle) {
  let rawWidth = Math.abs(currentX - startPoint.x);
  let rawHeight = Math.abs(currentY - startPoint.y);

  let width, height;
  if (isSquareOrCircle) {
    const size = Math.max(rawWidth, rawHeight);
    width = size;
    height = size;
  } else {
    width = rawWidth;
    height = rawHeight;
  }

  let left, top;
  if (isSquareOrCircle) {
    const dirX = currentX >= startPoint.x ? 1 : -1;
    const dirY = currentY >= startPoint.y ? 1 : -1;
    left = dirX >= 0 ? startPoint.x : startPoint.x - width;
    top = dirY >= 0 ? startPoint.y : startPoint.y - height;
  } else {
    left = Math.min(startPoint.x, currentX);
    top = Math.min(startPoint.y, currentY);
  }

  return { left, top, width, height };
}

/**
 * Trigger shape feedback display
 * @param {Object} instance - PageCapture instance
 * @param {string} shapeName - Shape name
 */
export function triggerShapeFeedback(instance, shapeName) {
  let displayText = shapeName;
  if (instance.isSquareMode) {
    displayText = shapeName === 'Oval' ? 'Circle' : 'Square';
  }

  updateShapeIndicator(instance.selectionOverlay, displayText);

  if (instance._feedbackTimeout) {
    clearTimeout(instance._feedbackTimeout);
  }
  instance._feedbackTimeout = showShapeFeedback(instance.shapeFeedback, shapeName, instance.isSquareMode);
}

export default {
  createSelectionHandlers,
  updateSelectionBoxFromMouse,
  calculateFinalDimensions,
  triggerShapeFeedback
};
