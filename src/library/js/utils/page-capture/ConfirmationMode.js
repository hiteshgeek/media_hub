/**
 * ConfirmationMode - Manages confirmation mode state and interactions
 * @module ConfirmationMode
 */

import { createConfirmationToolbar, updateToolbarPosition } from './ConfirmationToolbar.js';
import { updateDimensionsDisplay, hideDimensionsDisplay } from './DimensionsDisplay.js';
import { updateOverlayClipPath, resetSelectionBox } from './SelectionBox.js';
import { createOverlayContent } from './SelectionOverlay.js';

/**
 * Create confirmation mode handler functions bound to a PageCapture instance
 * @param {Object} instance - PageCapture instance
 * @returns {Object} - Confirmation mode handler functions
 */
export function createConfirmationHandlers(instance) {
  /**
   * Enter confirmation mode - show toolbar and allow repositioning
   */
  function enterConfirmationMode(left, top, width, height, isOval) {
    instance.isConfirmationMode = true;
    instance.confirmedSelection = { left, top, width, height, isOval };
    instance.selectionBox.classList.add('confirmation-mode');

    const toolbar = createConfirmationToolbar({
      onAccept: () => acceptSelection(),
      onRecapture: () => restartSelection(),
      onCancel: () => instance.cancelSelection()
    });
    instance.confirmationToolbar = toolbar.element;
    instance._toolbarCleanup = toolbar.cleanup;

    updateToolbarPosition(instance.confirmationToolbar, instance.confirmedSelection);
    updateInstructionsForConfirmation(instance);
    bindConfirmationEvents();
  }

  /**
   * Update instructions for confirmation mode
   */
  function updateInstructionsForConfirmation() {
    const instructions = instance.selectionOverlay?.querySelector('.file-uploader-page-capture-instructions');
    if (instructions) {
      instructions.innerHTML = `
        <span class="file-uploader-page-capture-instructions-text">Drag to reposition selection</span>
        <div class="file-uploader-page-capture-instructions-shortcuts">
          <span class="file-uploader-page-capture-shortcut"><kbd>Enter</kbd> Accept</span>
          <span class="file-uploader-page-capture-shortcut"><kbd>R</kbd> Recapture</span>
          <span class="file-uploader-page-capture-shortcut"><kbd>ESC</kbd> Cancel</span>
        </div>
      `;
      instructions.style.opacity = '1';
    }
  }

  /**
   * Bind confirmation mode mouse events
   */
  function bindConfirmationEvents() {
    instance._handleConfirmationMouseDown = handleConfirmationMouseDown;
    instance._handleConfirmationMouseMove = handleConfirmationMouseMove;
    instance._handleConfirmationMouseUp = handleConfirmationMouseUp;

    instance.selectionBox.addEventListener('mousedown', instance._handleConfirmationMouseDown);
    document.addEventListener('mousemove', instance._handleConfirmationMouseMove);
    document.addEventListener('mouseup', instance._handleConfirmationMouseUp);
  }

  /**
   * Handle mouse down on selection box in confirmation mode (start drag)
   */
  function handleConfirmationMouseDown(e) {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    instance.isDraggingSelection = true;
    instance.dragStartPoint = {
      clientX: e.clientX,
      clientY: e.clientY,
      selectionLeft: instance.confirmedSelection.left,
      selectionTop: instance.confirmedSelection.top
    };
    instance.selectionBox.classList.add('dragging');
  }

  /**
   * Handle mouse move in confirmation mode (drag selection)
   */
  function handleConfirmationMouseMove(e) {
    if (!instance.isDraggingSelection || !instance.dragStartPoint) return;

    const deltaX = e.clientX - instance.dragStartPoint.clientX;
    const deltaY = e.clientY - instance.dragStartPoint.clientY;

    instance.confirmedSelection.left = instance.dragStartPoint.selectionLeft + deltaX;
    instance.confirmedSelection.top = instance.dragStartPoint.selectionTop + deltaY;

    const viewportLeft = instance.confirmedSelection.left - window.scrollX;
    const viewportTop = instance.confirmedSelection.top - window.scrollY;

    instance.selectionBox.style.left = viewportLeft + 'px';
    instance.selectionBox.style.top = viewportTop + 'px';

    updateOverlayClipPath(
      instance.selectionOverlay,
      viewportLeft,
      viewportTop,
      instance.confirmedSelection.width,
      instance.confirmedSelection.height,
      instance.confirmedSelection.isOval
    );

    updateToolbarPosition(instance.confirmationToolbar, instance.confirmedSelection);

    if (instance.options.showDimensions && instance.dimensionsDisplay) {
      updateDimensionsDisplay(
        instance.dimensionsDisplay,
        viewportLeft,
        viewportTop,
        instance.confirmedSelection.width,
        instance.confirmedSelection.height,
        instance.options.dimensionsPosition
      );
    }
  }

  /**
   * Handle mouse up in confirmation mode (end drag)
   */
  function handleConfirmationMouseUp() {
    if (instance.isDraggingSelection) {
      instance.isDraggingSelection = false;
      instance.dragStartPoint = null;
      instance.selectionBox.classList.remove('dragging');
    }
  }

  /**
   * Accept the current selection and perform capture
   */
  async function acceptSelection() {
    if (!instance.confirmedSelection) return;
    const { left, top, width, height, isOval } = instance.confirmedSelection;
    await instance.performCapture(left, top, width, height, isOval);
  }

  /**
   * Restart the selection process
   */
  function restartSelection() {
    exitConfirmationMode();
    resetSelectionBox(instance.selectionBox, instance.selectionOverlay);
    instance.selectionOverlay.classList.remove('selecting');

    const instructions = instance.selectionOverlay?.querySelector('.file-uploader-page-capture-instructions');
    if (instructions) {
      const content = createOverlayContent(instance.isOvalMode);
      const match = content.match(/<div class="file-uploader-page-capture-instructions">([\s\S]*?)<\/div>/);
      instructions.innerHTML = match ? match[0] : content;
      instructions.style.opacity = '1';
    }

    hideDimensionsDisplay(instance.dimensionsDisplay);
  }

  /**
   * Exit confirmation mode and clean up
   */
  function exitConfirmationMode() {
    instance.isConfirmationMode = false;
    instance.confirmedSelection = null;
    instance.isDraggingSelection = false;
    instance.dragStartPoint = null;

    if (instance._toolbarCleanup) {
      instance._toolbarCleanup();
      instance._toolbarCleanup = null;
      instance.confirmationToolbar = null;
    }

    if (instance._handleConfirmationMouseDown && instance.selectionBox) {
      instance.selectionBox.removeEventListener('mousedown', instance._handleConfirmationMouseDown);
    }
    if (instance._handleConfirmationMouseMove) {
      document.removeEventListener('mousemove', instance._handleConfirmationMouseMove);
    }
    if (instance._handleConfirmationMouseUp) {
      document.removeEventListener('mouseup', instance._handleConfirmationMouseUp);
    }

    if (instance.selectionBox) {
      instance.selectionBox.classList.remove('confirmation-mode', 'dragging');
    }
  }

  return {
    enterConfirmationMode,
    acceptSelection,
    restartSelection,
    exitConfirmationMode,
    handleConfirmationMouseDown,
    handleConfirmationMouseMove,
    handleConfirmationMouseUp
  };
}

export default {
  createConfirmationHandlers
};
