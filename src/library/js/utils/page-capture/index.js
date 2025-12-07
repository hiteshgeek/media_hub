/**
 * PageCapture - Full Page and Region Screenshot Capture
 * Uses html2canvas to capture the current page DOM
 * Supports full page (with scroll) and selected region capture
 *
 * @module PageCapture
 */

// Core utilities
import { isSupported } from './Html2CanvasLoader.js';
import { captureFullPage, captureViewport, captureArea } from './CaptureOperations.js';
import { blobToFile } from './CanvasUtils.js';

// Shape and preferences
import { SHAPE_STORAGE_KEY, loadShapePreference, saveShapePreference } from './ShapePreference.js';
import { DIMENSIONS_POSITIONS, createDimensionsDisplay, updateDimensionsDisplay, hideDimensionsDisplay, removeDimensionsDisplay } from './DimensionsDisplay.js';

// Selection UI
import { createSelectionElements, appendSelectionElements, removeSelectionElements, showShapeFeedback, updateShapeIndicator, setInstructionsVisibility, createOverlayContent } from './SelectionOverlay.js';
import { calculateSelectionDimensions, updateSelectionBoxStyle, updateOverlayClipPath, initSelectionBox, resetSelectionBox } from './SelectionBox.js';
import { generateEllipseClipPath } from './ClipPathUtils.js';

// Confirmation mode
import { createConfirmationToolbar, updateToolbarPosition } from './ConfirmationToolbar.js';

/**
 * PageCapture class - Main entry point for page capture functionality
 */
class PageCapture {
  static DIMENSIONS_POSITIONS = DIMENSIONS_POSITIONS;
  static SHAPE_STORAGE_KEY = SHAPE_STORAGE_KEY;

  constructor(options = {}) {
    this.options = {
      // html2canvas options
      scale: options.scale || window.devicePixelRatio || 2,
      useCORS: options.useCORS !== false,
      allowTaint: options.allowTaint || false,
      backgroundColor: options.backgroundColor || '#ffffff',
      logging: options.logging || false,

      // Region selector options
      overlayColor: options.overlayColor || 'rgba(0, 0, 0, 0.5)',
      selectionBorderColor: options.selectionBorderColor || '#6366f1',
      selectionBorderWidth: options.selectionBorderWidth || 2,
      minSelectionSize: options.minSelectionSize || 10,

      // Dimensions display options
      showDimensions: options.showDimensions !== false,
      dimensionsPosition: options.dimensionsPosition || 'center',

      // Capture behavior options
      immediateCapture: options.immediateCapture !== false,

      // Output options
      imageFormat: options.imageFormat || 'image/png',
      imageQuality: options.imageQuality || 0.92,
      filenamePrefix: options.filenamePrefix || 'screenshot',

      // Callbacks
      onCaptureStart: options.onCaptureStart || null,
      onCaptureComplete: options.onCaptureComplete || null,
      onCaptureError: options.onCaptureError || null,
      onSelectionStart: options.onSelectionStart || null,
      onSelectionComplete: options.onSelectionComplete || null,
      onSelectionCancel: options.onSelectionCancel || null,

      ...options
    };

    this.isCapturing = false;
    this.isSelecting = false;
    this.selectionOverlay = null;
    this.selectionBox = null;
    this.dimensionsDisplay = null;
    this.shapeFeedback = null;
    this.confirmationToolbar = null;
    this.startPoint = null;
    this.lastMousePosition = null;
    this.isSquareMode = false;
    this.isOvalMode = loadShapePreference();

    // Confirmation mode state
    this.isConfirmationMode = false;
    this.confirmedSelection = null;
    this.isDraggingSelection = false;
    this.dragStartPoint = null;

    // Bound event handlers
    this._handleMouseDown = null;
    this._handleMouseMove = null;
    this._handleMouseUp = null;
    this._handleKeyDown = null;
    this._handleKeyUp = null;
    this._handleConfirmationMouseDown = null;
    this._handleConfirmationMouseMove = null;
    this._handleConfirmationMouseUp = null;
    this._feedbackTimeout = null;
    this._toolbarCleanup = null;
  }

  static isSupported() {
    return isSupported();
  }

  // ============================================================
  // CAPTURE METHODS
  // ============================================================

  async captureFullPage() {
    if (this.isCapturing) {
      throw new Error('Capture already in progress');
    }

    this.isCapturing = true;

    try {
      if (this.options.onCaptureStart) {
        this.options.onCaptureStart('fullpage');
      }

      const blob = await captureFullPage(this.options);

      if (this.options.onCaptureComplete) {
        this.options.onCaptureComplete(blob, 'fullpage');
      }

      return blob;
    } catch (error) {
      if (this.options.onCaptureError) {
        this.options.onCaptureError(error, 'fullpage');
      }
      throw error;
    } finally {
      this.isCapturing = false;
    }
  }

  async captureViewport() {
    if (this.isCapturing) {
      throw new Error('Capture already in progress');
    }

    this.isCapturing = true;

    try {
      if (this.options.onCaptureStart) {
        this.options.onCaptureStart('viewport');
      }

      const blob = await captureViewport(this.options);

      if (this.options.onCaptureComplete) {
        this.options.onCaptureComplete(blob, 'viewport');
      }

      return blob;
    } catch (error) {
      if (this.options.onCaptureError) {
        this.options.onCaptureError(error, 'viewport');
      }
      throw error;
    } finally {
      this.isCapturing = false;
    }
  }

  async captureArea(x, y, width, height, isOval = false) {
    if (this.isCapturing) {
      throw new Error('Capture already in progress');
    }

    this.isCapturing = true;

    try {
      if (this.options.onCaptureStart) {
        this.options.onCaptureStart('region');
      }

      const blob = await captureArea(x, y, width, height, isOval, this.options);

      if (this.options.onCaptureComplete) {
        this.options.onCaptureComplete(blob, 'region');
      }

      return blob;
    } catch (error) {
      if (this.options.onCaptureError) {
        this.options.onCaptureError(error, 'region');
      }
      throw error;
    } finally {
      this.isCapturing = false;
    }
  }

  // ============================================================
  // REGION SELECTION
  // ============================================================

  async captureRegion() {
    if (this.isSelecting || this.isCapturing) {
      throw new Error('Selection or capture already in progress');
    }

    return new Promise((resolve, reject) => {
      this.isSelecting = true;

      if (this.options.onSelectionStart) {
        this.options.onSelectionStart();
      }

      this.createSelectionOverlay();
      this._resolveSelection = resolve;
      this._rejectSelection = reject;
    });
  }

  createSelectionOverlay() {
    const elements = createSelectionElements(this.isOvalMode);
    this.selectionOverlay = elements.overlay;
    this.selectionBox = elements.selectionBox;
    this.shapeFeedback = elements.shapeFeedback;

    if (this.options.showDimensions) {
      this.dimensionsDisplay = createDimensionsDisplay();
    }

    appendSelectionElements(this.selectionOverlay, this.selectionBox, this.shapeFeedback);
    this._showShapeFeedback(this.isOvalMode ? 'Oval' : 'Rectangle');
    this._bindSelectionEvents();
    document.body.style.overflow = 'hidden';
  }

  _bindSelectionEvents() {
    this._handleMouseDown = this.handleMouseDown.bind(this);
    this._handleMouseMove = this.handleMouseMove.bind(this);
    this._handleMouseUp = this.handleMouseUp.bind(this);
    this._handleKeyDown = this.handleKeyDown.bind(this);
    this._handleKeyUp = this.handleKeyUp.bind(this);

    this.selectionOverlay.addEventListener('mousedown', this._handleMouseDown);
    document.addEventListener('mousemove', this._handleMouseMove);
    document.addEventListener('mouseup', this._handleMouseUp);
    document.addEventListener('keydown', this._handleKeyDown);
    document.addEventListener('keyup', this._handleKeyUp);
  }

  handleMouseDown(e) {
    if (e.button !== 0) return;

    if (this.isConfirmationMode) {
      this.exitConfirmationMode();
      resetSelectionBox(this.selectionBox, this.selectionOverlay);
    }

    this.startPoint = {
      clientX: e.clientX,
      clientY: e.clientY,
      x: e.clientX + window.scrollX,
      y: e.clientY + window.scrollY
    };

    initSelectionBox(this.selectionBox, this.startPoint.clientX, this.startPoint.clientY);
    this.selectionOverlay.classList.add('selecting');
    setInstructionsVisibility(this.selectionOverlay, false);
  }

  handleMouseMove(e) {
    if (!this.startPoint) return;

    this.isSquareMode = e.ctrlKey || e.metaKey;
    this.lastMousePosition = { clientX: e.clientX, clientY: e.clientY };
    this._updateSelectionBox(e.clientX, e.clientY);
  }

  async handleMouseUp(e) {
    if (this.isDraggingSelection) {
      this.isDraggingSelection = false;
      this.dragStartPoint = null;
      return;
    }

    if (!this.startPoint) return;

    const isSquareOrCircle = e.ctrlKey || e.metaKey || this.isSquareMode;
    const isOval = this.isOvalMode;
    const currentX = e.clientX + window.scrollX;
    const currentY = e.clientY + window.scrollY;

    const { left, top, width, height } = this._calculateFinalDimensions(currentX, currentY, isSquareOrCircle);

    this.startPoint = null;
    this.isSquareMode = false;

    if (width < this.options.minSelectionSize || height < this.options.minSelectionSize) {
      resetSelectionBox(this.selectionBox, this.selectionOverlay);
      this.selectionOverlay.classList.remove('selecting');
      setInstructionsVisibility(this.selectionOverlay, true);
      return;
    }

    if (!this.options.immediateCapture) {
      this.enterConfirmationMode(left, top, width, height, isOval);
      return;
    }

    await this.performCapture(left, top, width, height, isOval);
  }

  handleKeyDown(e) {
    if (e.key === 'Escape') {
      this.cancelSelection();
    } else if (this.isConfirmationMode) {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.acceptSelection();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        this.restartSelection();
      }
    } else if ((e.key === 'Control' || e.key === 'Meta') && this.startPoint && this.lastMousePosition) {
      this.isSquareMode = true;
      this._updateSelectionBox(this.lastMousePosition.clientX, this.lastMousePosition.clientY);
    } else if (e.key === '1' && this.isOvalMode) {
      this.isOvalMode = false;
      saveShapePreference(false);
      this._showShapeFeedback('Rectangle');
      if (this.startPoint && this.lastMousePosition) {
        this._updateSelectionBox(this.lastMousePosition.clientX, this.lastMousePosition.clientY);
      }
    } else if (e.key === '2' && !this.isOvalMode) {
      this.isOvalMode = true;
      saveShapePreference(true);
      this._showShapeFeedback('Oval');
      if (this.startPoint && this.lastMousePosition) {
        this._updateSelectionBox(this.lastMousePosition.clientX, this.lastMousePosition.clientY);
      }
    }
  }

  handleKeyUp(e) {
    if (e.key === 'Control' || e.key === 'Meta') {
      this.isSquareMode = false;
      if (this.startPoint && this.lastMousePosition) {
        this._updateSelectionBox(this.lastMousePosition.clientX, this.lastMousePosition.clientY);
      }
    }
  }

  // ============================================================
  // CONFIRMATION MODE
  // ============================================================

  enterConfirmationMode(left, top, width, height, isOval) {
    this.isConfirmationMode = true;
    this.confirmedSelection = { left, top, width, height, isOval };
    this.selectionBox.classList.add('confirmation-mode');

    const toolbar = createConfirmationToolbar({
      onAccept: () => this.acceptSelection(),
      onRecapture: () => this.restartSelection(),
      onCancel: () => this.cancelSelection()
    });
    this.confirmationToolbar = toolbar.element;
    this._toolbarCleanup = toolbar.cleanup;

    updateToolbarPosition(this.confirmationToolbar, this.confirmedSelection);

    const instructions = this.selectionOverlay.querySelector('.file-uploader-page-capture-instructions');
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

    this._bindConfirmationEvents();
  }

  _bindConfirmationEvents() {
    this._handleConfirmationMouseDown = this.handleConfirmationMouseDown.bind(this);
    this._handleConfirmationMouseMove = this.handleConfirmationMouseMove.bind(this);
    this._handleConfirmationMouseUp = this.handleConfirmationMouseUp.bind(this);

    this.selectionBox.addEventListener('mousedown', this._handleConfirmationMouseDown);
    document.addEventListener('mousemove', this._handleConfirmationMouseMove);
    document.addEventListener('mouseup', this._handleConfirmationMouseUp);
  }

  handleConfirmationMouseDown(e) {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    this.isDraggingSelection = true;
    this.dragStartPoint = {
      clientX: e.clientX,
      clientY: e.clientY,
      selectionLeft: this.confirmedSelection.left,
      selectionTop: this.confirmedSelection.top
    };
    this.selectionBox.classList.add('dragging');
  }

  handleConfirmationMouseMove(e) {
    if (!this.isDraggingSelection || !this.dragStartPoint) return;

    const deltaX = e.clientX - this.dragStartPoint.clientX;
    const deltaY = e.clientY - this.dragStartPoint.clientY;

    this.confirmedSelection.left = this.dragStartPoint.selectionLeft + deltaX;
    this.confirmedSelection.top = this.dragStartPoint.selectionTop + deltaY;

    const viewportLeft = this.confirmedSelection.left - window.scrollX;
    const viewportTop = this.confirmedSelection.top - window.scrollY;

    this.selectionBox.style.left = viewportLeft + 'px';
    this.selectionBox.style.top = viewportTop + 'px';

    this._updateClipPath();
    updateToolbarPosition(this.confirmationToolbar, this.confirmedSelection);

    if (this.options.showDimensions && this.dimensionsDisplay) {
      updateDimensionsDisplay(
        this.dimensionsDisplay,
        viewportLeft,
        viewportTop,
        this.confirmedSelection.width,
        this.confirmedSelection.height,
        this.options.dimensionsPosition
      );
    }
  }

  handleConfirmationMouseUp() {
    if (this.isDraggingSelection) {
      this.isDraggingSelection = false;
      this.dragStartPoint = null;
      this.selectionBox.classList.remove('dragging');
    }
  }

  async acceptSelection() {
    if (!this.confirmedSelection) return;
    const { left, top, width, height, isOval } = this.confirmedSelection;
    await this.performCapture(left, top, width, height, isOval);
  }

  restartSelection() {
    this.exitConfirmationMode();
    resetSelectionBox(this.selectionBox, this.selectionOverlay);
    this.selectionOverlay.classList.remove('selecting');

    const instructions = this.selectionOverlay.querySelector('.file-uploader-page-capture-instructions');
    if (instructions) {
      instructions.innerHTML = createOverlayContent(this.isOvalMode)
        .match(/<div class="file-uploader-page-capture-instructions">([\s\S]*)<\/div>/)?.[0] || '';
      instructions.style.opacity = '1';
    }

    hideDimensionsDisplay(this.dimensionsDisplay);
  }

  exitConfirmationMode() {
    this.isConfirmationMode = false;
    this.confirmedSelection = null;
    this.isDraggingSelection = false;
    this.dragStartPoint = null;

    if (this._toolbarCleanup) {
      this._toolbarCleanup();
      this._toolbarCleanup = null;
      this.confirmationToolbar = null;
    }

    if (this._handleConfirmationMouseDown && this.selectionBox) {
      this.selectionBox.removeEventListener('mousedown', this._handleConfirmationMouseDown);
    }
    if (this._handleConfirmationMouseMove) {
      document.removeEventListener('mousemove', this._handleConfirmationMouseMove);
    }
    if (this._handleConfirmationMouseUp) {
      document.removeEventListener('mouseup', this._handleConfirmationMouseUp);
    }

    if (this.selectionBox) {
      this.selectionBox.classList.remove('confirmation-mode', 'dragging');
    }
  }

  // ============================================================
  // CAPTURE EXECUTION
  // ============================================================

  async performCapture(left, top, width, height, isOval) {
    const resolveSelection = this._resolveSelection;
    const rejectSelection = this._rejectSelection;

    try {
      if (this.isConfirmationMode) {
        this.exitConfirmationMode();
      }

      this.removeSelectionOverlay();

      if (this.options.onSelectionComplete) {
        this.options.onSelectionComplete({ left, top, width, height });
      }

      await new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(resolve, 100);
          });
        });
      });

      const blob = await this.captureArea(left, top, width, height, isOval);

      if (resolveSelection) {
        resolveSelection(blob);
      }
    } catch (error) {
      if (rejectSelection) {
        rejectSelection(error);
      }
    }
  }

  cancelSelection() {
    const rejectSelection = this._rejectSelection;
    this.removeSelectionOverlay();

    if (this.options.onSelectionCancel) {
      this.options.onSelectionCancel();
    }

    if (rejectSelection) {
      rejectSelection(new Error('Selection cancelled'));
    }
  }

  removeSelectionOverlay() {
    if (this.selectionOverlay) {
      this.selectionOverlay.removeEventListener('mousedown', this._handleMouseDown);
      document.removeEventListener('mousemove', this._handleMouseMove);
      document.removeEventListener('mouseup', this._handleMouseUp);
      document.removeEventListener('keydown', this._handleKeyDown);
      document.removeEventListener('keyup', this._handleKeyUp);
    }

    removeSelectionElements(this.selectionOverlay, this.selectionBox, this.shapeFeedback);
    this.selectionOverlay = null;
    this.selectionBox = null;
    this.shapeFeedback = null;

    removeDimensionsDisplay(this.dimensionsDisplay);
    this.dimensionsDisplay = null;

    if (this._toolbarCleanup) {
      this._toolbarCleanup();
      this._toolbarCleanup = null;
      this.confirmationToolbar = null;
    }

    if (this._handleConfirmationMouseDown) {
      document.removeEventListener('mousemove', this._handleConfirmationMouseMove);
      document.removeEventListener('mouseup', this._handleConfirmationMouseUp);
    }

    document.body.style.overflow = '';

    if (this._feedbackTimeout) {
      clearTimeout(this._feedbackTimeout);
      this._feedbackTimeout = null;
    }

    this.isSelecting = false;
    this.isSquareMode = false;
    this.isConfirmationMode = false;
    this.confirmedSelection = null;
    this.isDraggingSelection = false;
    this.dragStartPoint = null;
    this.startPoint = null;
    this.lastMousePosition = null;
    this._resolveSelection = null;
    this._rejectSelection = null;
  }

  // ============================================================
  // HELPER METHODS
  // ============================================================

  _updateSelectionBox(currentClientX, currentClientY) {
    if (!this.startPoint) return;

    const isCircle = this.isSquareMode && this.isOvalMode;
    const { left, top, width, height } = calculateSelectionDimensions(
      this.startPoint,
      currentClientX,
      currentClientY,
      this.isSquareMode
    );

    updateSelectionBoxStyle(this.selectionBox, left, top, width, height, this.isOvalMode);

    if (this.options.showDimensions && this.dimensionsDisplay) {
      if (this.isOvalMode && !isCircle) {
        hideDimensionsDisplay(this.dimensionsDisplay);
      } else if (isCircle) {
        const radius = Math.round(width / 2);
        updateDimensionsDisplay(this.dimensionsDisplay, left, top, width, height, this.options.dimensionsPosition, `${radius}`);
      } else {
        updateDimensionsDisplay(this.dimensionsDisplay, left, top, width, height, this.options.dimensionsPosition);
      }
    }

    updateOverlayClipPath(this.selectionOverlay, left, top, width, height, this.isOvalMode);
  }

  _calculateFinalDimensions(currentX, currentY, isSquareOrCircle) {
    let rawWidth = Math.abs(currentX - this.startPoint.x);
    let rawHeight = Math.abs(currentY - this.startPoint.y);

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
      const dirX = currentX >= this.startPoint.x ? 1 : -1;
      const dirY = currentY >= this.startPoint.y ? 1 : -1;
      left = dirX >= 0 ? this.startPoint.x : this.startPoint.x - width;
      top = dirY >= 0 ? this.startPoint.y : this.startPoint.y - height;
    } else {
      left = Math.min(this.startPoint.x, currentX);
      top = Math.min(this.startPoint.y, currentY);
    }

    return { left, top, width, height };
  }

  _updateClipPath() {
    if (!this.selectionOverlay || !this.confirmedSelection) return;

    const { left, top, width, height, isOval } = this.confirmedSelection;
    const viewportLeft = left - window.scrollX;
    const viewportTop = top - window.scrollY;

    updateOverlayClipPath(this.selectionOverlay, viewportLeft, viewportTop, width, height, isOval);
  }

  _showShapeFeedback(shapeName) {
    let displayText = shapeName;
    if (this.isSquareMode) {
      displayText = shapeName === 'Oval' ? 'Circle' : 'Square';
    }

    updateShapeIndicator(this.selectionOverlay, displayText);

    if (this._feedbackTimeout) {
      clearTimeout(this._feedbackTimeout);
    }
    this._feedbackTimeout = showShapeFeedback(this.shapeFeedback, shapeName, this.isSquareMode);
  }

  blobToFile(blob, type = 'screenshot') {
    return blobToFile(blob, this.options.filenamePrefix, type);
  }

  destroy() {
    this.removeSelectionOverlay();
    this.isCapturing = false;
  }
}

export default PageCapture;
