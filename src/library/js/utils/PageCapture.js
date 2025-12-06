/**
 * PageCapture - Full Page and Region Screenshot Capture
 * Uses html2canvas to capture the current page DOM
 * Supports full page (with scroll) and selected region capture
 */

class PageCapture {
  // Valid positions for dimensions display
  static DIMENSIONS_POSITIONS = [
    'top-left', 'top-center', 'top-right',
    'center-left', 'center', 'center-right',
    'bottom-left', 'bottom-center', 'bottom-right'
  ];

  // Storage key for remembering shape preference
  static SHAPE_STORAGE_KEY = 'file-uploader-capture-shape';

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
      showDimensions: options.showDimensions !== false, // Show dimensions by default
      dimensionsPosition: options.dimensionsPosition || 'bottom-center', // Position of dimensions display

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
    this.startPoint = null;
    this.lastMousePosition = null; // Track last mouse position for key toggle
    this.isSquareMode = false; // Ctrl key pressed for square/circle selection
    this.isOvalMode = this.loadShapePreference(); // Load saved shape preference
    this.html2canvasLoaded = false;
    this.html2canvasPromise = null;
  }

  /**
   * Load shape preference from localStorage
   * @returns {boolean} - true if oval mode, false if rectangle mode
   */
  loadShapePreference() {
    try {
      const saved = localStorage.getItem(PageCapture.SHAPE_STORAGE_KEY);
      return saved === 'oval';
    } catch (e) {
      return false; // Default to rectangle if localStorage unavailable
    }
  }

  /**
   * Save shape preference to localStorage
   * @param {boolean} isOval - true for oval, false for rectangle
   */
  saveShapePreference(isOval) {
    try {
      localStorage.setItem(PageCapture.SHAPE_STORAGE_KEY, isOval ? 'oval' : 'rectangle');
    } catch (e) {
      // Ignore if localStorage unavailable
    }
  }

  /**
   * Check if html2canvas is available
   */
  static isSupported() {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  /**
   * Load html2canvas library dynamically
   */
  async loadHtml2Canvas() {
    if (this.html2canvasLoaded && window.html2canvas) {
      return window.html2canvas;
    }

    if (this.html2canvasPromise) {
      return this.html2canvasPromise;
    }

    this.html2canvasPromise = new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.html2canvas) {
        this.html2canvasLoaded = true;
        resolve(window.html2canvas);
        return;
      }

      // Load from CDN
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      script.integrity = 'sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGibyoeqMV/TJlSKda6FXzoEyYGjTe+vXA==';
      script.crossOrigin = 'anonymous';
      script.referrerPolicy = 'no-referrer';

      script.onload = () => {
        this.html2canvasLoaded = true;
        resolve(window.html2canvas);
      };

      script.onerror = () => {
        reject(new Error('Failed to load html2canvas library'));
      };

      document.head.appendChild(script);
    });

    return this.html2canvasPromise;
  }

  /**
   * Capture full page screenshot (including scrolled content)
   * @returns {Promise<Blob>} - Screenshot as blob
   */
  async captureFullPage() {
    if (this.isCapturing) {
      throw new Error('Capture already in progress');
    }

    this.isCapturing = true;

    try {
      if (this.options.onCaptureStart) {
        this.options.onCaptureStart('fullpage');
      }

      const html2canvas = await this.loadHtml2Canvas();

      // Store current scroll position
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      // Capture the entire document body
      const canvas = await html2canvas(document.body, {
        scale: this.options.scale,
        useCORS: this.options.useCORS,
        allowTaint: this.options.allowTaint,
        backgroundColor: this.options.backgroundColor,
        logging: this.options.logging,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
        x: 0,
        y: 0,
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
      });

      // Restore scroll position
      window.scrollTo(scrollX, scrollY);

      // Convert to blob
      const blob = await this.canvasToBlob(canvas);

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

  /**
   * Capture visible viewport only
   * @returns {Promise<Blob>} - Screenshot as blob
   */
  async captureViewport() {
    if (this.isCapturing) {
      throw new Error('Capture already in progress');
    }

    this.isCapturing = true;

    try {
      if (this.options.onCaptureStart) {
        this.options.onCaptureStart('viewport');
      }

      const html2canvas = await this.loadHtml2Canvas();

      const canvas = await html2canvas(document.body, {
        scale: this.options.scale,
        useCORS: this.options.useCORS,
        allowTaint: this.options.allowTaint,
        backgroundColor: this.options.backgroundColor,
        logging: this.options.logging,
        x: window.scrollX,
        y: window.scrollY,
        width: window.innerWidth,
        height: window.innerHeight,
      });

      const blob = await this.canvasToBlob(canvas);

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

  /**
   * Start region selection mode
   * User can draw a rectangle to select area to capture
   * @returns {Promise<Blob>} - Screenshot of selected region as blob
   */
  async captureRegion() {
    if (this.isSelecting || this.isCapturing) {
      throw new Error('Selection or capture already in progress');
    }

    return new Promise((resolve, reject) => {
      this.isSelecting = true;

      if (this.options.onSelectionStart) {
        this.options.onSelectionStart();
      }

      // Create overlay
      this.createSelectionOverlay();

      // Store resolve/reject for later use
      this._resolveSelection = resolve;
      this._rejectSelection = reject;
    });
  }

  /**
   * Create the selection overlay UI
   */
  createSelectionOverlay() {
    // Main overlay container (will have clip-path applied)
    this.selectionOverlay = document.createElement('div');
    this.selectionOverlay.className = 'file-uploader-page-capture-overlay';
    this.selectionOverlay.innerHTML = `
      <div class="file-uploader-page-capture-instructions">
        <span class="file-uploader-page-capture-instructions-text">Click and drag to select an area</span>
        <div class="file-uploader-page-capture-instructions-shortcuts">
          <span class="file-uploader-page-capture-shortcut${!this.isOvalMode ? ' active' : ''}" data-shape="rectangle"><kbd>1</kbd> Rectangle</span>
          <span class="file-uploader-page-capture-shortcut${this.isOvalMode ? ' active' : ''}" data-shape="oval"><kbd>2</kbd> Oval</span>
          <span class="file-uploader-page-capture-shortcut"><kbd>Ctrl</kbd> Square/Circle</span>
          <span class="file-uploader-page-capture-shortcut"><kbd>ESC</kbd> Cancel</span>
        </div>
      </div>
    `;

    // Selection box must be a SIBLING of the overlay, not a child
    // This prevents it from being clipped when overlay gets clip-path
    this.selectionBox = document.createElement('div');
    this.selectionBox.className = 'file-uploader-page-capture-selection-box';

    // Shape feedback element - also a sibling to avoid clip-path issues
    this.shapeFeedback = document.createElement('div');
    this.shapeFeedback.className = 'file-uploader-page-capture-shape-feedback';

    // Create dimensions display element if enabled
    if (this.options.showDimensions) {
      this.dimensionsDisplay = document.createElement('div');
      this.dimensionsDisplay.className = 'file-uploader-page-capture-dimensions';
      this.dimensionsDisplay.style.display = 'none';
      document.body.appendChild(this.dimensionsDisplay);
    }

    document.body.appendChild(this.selectionOverlay);
    document.body.appendChild(this.selectionBox);
    document.body.appendChild(this.shapeFeedback);

    // Show initial shape feedback based on saved preference
    this.showShapeFeedback(this.isOvalMode ? 'Oval' : 'Rectangle');

    // Bind event handlers
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

    // Prevent scrolling while selecting
    document.body.style.overflow = 'hidden';
  }

  /**
   * Handle mouse down - start selection
   */
  handleMouseDown(e) {
    if (e.button !== 0) return; // Only left click

    // Store both viewport coords (for display) and document coords (for capture)
    this.startPoint = {
      clientX: e.clientX,
      clientY: e.clientY,
      x: e.clientX + window.scrollX,
      y: e.clientY + window.scrollY
    };

    this.selectionBox.style.display = 'block';
    this.selectionBox.style.left = this.startPoint.clientX + 'px';
    this.selectionBox.style.top = this.startPoint.clientY + 'px';
    this.selectionBox.style.width = '0';
    this.selectionBox.style.height = '0';

    // Add selecting class to overlay
    this.selectionOverlay.classList.add('selecting');

    // Hide instructions
    const instructions = this.selectionOverlay.querySelector('.file-uploader-page-capture-instructions');
    if (instructions) {
      instructions.style.opacity = '0';
    }
  }

  /**
   * Handle mouse move - update selection box and clip-path
   */
  handleMouseMove(e) {
    if (!this.startPoint) return;

    // Check if Ctrl is pressed for square mode
    this.isSquareMode = e.ctrlKey || e.metaKey;

    const currentClientX = e.clientX;
    const currentClientY = e.clientY;

    // Store last mouse position for key toggle updates
    this.lastMousePosition = { clientX: currentClientX, clientY: currentClientY };

    // Update the selection box
    this.updateSelectionBox(currentClientX, currentClientY);
  }

  /**
   * Update dimensions display position and content
   * @param {number} left - Left position
   * @param {number} top - Top position
   * @param {number} width - Selection width
   * @param {number} height - Selection height
   * @param {string} customText - Optional custom text to display instead of dimensions
   */
  updateDimensionsDisplay(left, top, width, height, customText = null) {
    if (!this.dimensionsDisplay || !this.options.showDimensions) return;

    // Show dimensions display
    this.dimensionsDisplay.style.display = 'block';
    this.dimensionsDisplay.textContent = customText || `${Math.round(width)} × ${Math.round(height)}`;

    // Calculate position based on option
    const position = this.options.dimensionsPosition;
    const boxRight = left + width;
    const boxBottom = top + height;
    const boxCenterX = left + width / 2;
    const boxCenterY = top + height / 2;

    // Get dimensions display size for positioning
    const displayRect = this.dimensionsDisplay.getBoundingClientRect();
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

    this.dimensionsDisplay.style.left = posX + 'px';
    this.dimensionsDisplay.style.top = posY + 'px';
  }

  /**
   * Handle mouse up - complete selection
   */
  async handleMouseUp(e) {
    if (!this.startPoint) return;

    // Check if Ctrl is pressed for square/circle mode
    const isSquareOrCircle = e.ctrlKey || e.metaKey || this.isSquareMode;
    // Capture oval mode state before resetting
    const isOval = this.isOvalMode;

    // Calculate document-relative coords for actual capture
    const currentX = e.clientX + window.scrollX;
    const currentY = e.clientY + window.scrollY;

    // Calculate raw dimensions
    let rawWidth = Math.abs(currentX - this.startPoint.x);
    let rawHeight = Math.abs(currentY - this.startPoint.y);

    // If square/circle mode, use the larger dimension for both
    let width, height;
    if (isSquareOrCircle) {
      const size = Math.max(rawWidth, rawHeight);
      width = size;
      height = size;
    } else {
      width = rawWidth;
      height = rawHeight;
    }

    // Calculate left/top based on drag direction
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

    this.startPoint = null;
    this.isSquareMode = false;
    // Note: isOvalMode is NOT reset here to preserve the saved shape preference
    // The isOval variable above captures the state needed for this capture

    // Check minimum size
    if (width < this.options.minSelectionSize || height < this.options.minSelectionSize) {
      // Selection too small, reset
      this.selectionBox.style.display = 'none';
      this.selectionOverlay.style.clipPath = '';
      this.selectionOverlay.classList.remove('selecting');
      const instructions = this.selectionOverlay.querySelector('.file-uploader-page-capture-instructions');
      if (instructions) {
        instructions.style.opacity = '1';
      }
      return;
    }

    // Capture the selected region
    // Store the resolve/reject callbacks before removing overlay
    const resolveSelection = this._resolveSelection;
    const rejectSelection = this._rejectSelection;

    try {
      // Remove overlay first (so it doesn't appear in the capture)
      this.removeSelectionOverlay();

      if (this.options.onSelectionComplete) {
        this.options.onSelectionComplete({ left, top, width, height });
      }

      // Wait for DOM to fully update and repaint before capturing
      // This ensures the overlay is completely removed from the screen
      // Use both requestAnimationFrame and a minimum delay for reliability
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Additional delay to ensure browser has fully repainted
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

  /**
   * Handle keyboard events
   */
  handleKeyDown(e) {
    if (e.key === 'Escape') {
      this.cancelSelection();
    } else if ((e.key === 'Control' || e.key === 'Meta') && this.startPoint && this.lastMousePosition) {
      // Toggle to square/circle mode immediately when Ctrl is pressed
      this.isSquareMode = true;
      this.updateSelectionBox(this.lastMousePosition.clientX, this.lastMousePosition.clientY);
    } else if (e.key === '1') {
      // Switch to rectangle mode when 1 is pressed
      if (this.isOvalMode) {
        this.isOvalMode = false;
        this.saveShapePreference(false); // Save preference
        this.showShapeFeedback('Rectangle');
        // Update selection box if we have an active selection
        if (this.startPoint && this.lastMousePosition) {
          this.updateSelectionBox(this.lastMousePosition.clientX, this.lastMousePosition.clientY);
        }
      }
    } else if (e.key === '2') {
      // Switch to oval mode when 2 is pressed
      if (!this.isOvalMode) {
        this.isOvalMode = true;
        this.saveShapePreference(true); // Save preference
        this.showShapeFeedback('Oval');
        // Update selection box if we have an active selection
        if (this.startPoint && this.lastMousePosition) {
          this.updateSelectionBox(this.lastMousePosition.clientX, this.lastMousePosition.clientY);
        }
      }
    }
  }

  /**
   * Show shape change feedback
   */
  showShapeFeedback(shapeName) {
    // Determine the actual shape based on Ctrl state
    let displayText = shapeName;
    if (this.isSquareMode) {
      displayText = shapeName === 'Oval' ? 'Circle' : 'Square';
    }

    // Update the shape indicator in instructions
    this.updateShapeIndicator(displayText);

    // Show center popup feedback
    if (!this.shapeFeedback) return;

    this.shapeFeedback.textContent = displayText;
    this.shapeFeedback.classList.add('visible');

    // Remove after animation
    clearTimeout(this._feedbackTimeout);
    this._feedbackTimeout = setTimeout(() => {
      if (this.shapeFeedback) {
        this.shapeFeedback.classList.remove('visible');
      }
    }, 800);
  }

  /**
   * Update the shape indicator in the instructions area
   */
  updateShapeIndicator(shapeName) {
    if (!this.selectionOverlay) return;

    // Update active state on shortcut elements
    const rectangleShortcut = this.selectionOverlay.querySelector('.file-uploader-page-capture-shortcut[data-shape="rectangle"]');
    const ovalShortcut = this.selectionOverlay.querySelector('.file-uploader-page-capture-shortcut[data-shape="oval"]');

    if (rectangleShortcut && ovalShortcut) {
      const isOval = shapeName === 'Oval' || shapeName === 'Circle';
      rectangleShortcut.classList.toggle('active', !isOval);
      ovalShortcut.classList.toggle('active', isOval);
    }
  }

  /**
   * Handle key up - toggle square mode off when Ctrl released
   */
  handleKeyUp(e) {
    if (e.key === 'Control' || e.key === 'Meta') {
      this.isSquareMode = false;
      // If we have a selection in progress, update it immediately
      if (this.startPoint && this.lastMousePosition) {
        this.updateSelectionBox(this.lastMousePosition.clientX, this.lastMousePosition.clientY);
      }
    }
  }

  /**
   * Update selection box position and size
   */
  updateSelectionBox(currentClientX, currentClientY) {
    if (!this.startPoint) return;

    // Determine if we're in square/circle mode (Ctrl pressed)
    const isSquareOrCircle = this.isSquareMode;
    const isOval = this.isOvalMode;
    const isCircle = isSquareOrCircle && isOval;

    // Calculate raw dimensions
    let rawWidth = Math.abs(currentClientX - this.startPoint.clientX);
    let rawHeight = Math.abs(currentClientY - this.startPoint.clientY);

    // If square/circle mode, use the larger dimension for both
    let width, height;
    if (isSquareOrCircle) {
      const size = Math.max(rawWidth, rawHeight);
      width = size;
      height = size;
    } else {
      width = rawWidth;
      height = rawHeight;
    }

    // Calculate left/top based on drag direction
    let left, top;
    if (isSquareOrCircle) {
      // For square/circle mode, adjust position based on drag direction
      const dirX = currentClientX >= this.startPoint.clientX ? 1 : -1;
      const dirY = currentClientY >= this.startPoint.clientY ? 1 : -1;
      left = dirX >= 0 ? this.startPoint.clientX : this.startPoint.clientX - width;
      top = dirY >= 0 ? this.startPoint.clientY : this.startPoint.clientY - height;
    } else {
      left = Math.min(this.startPoint.clientX, currentClientX);
      top = Math.min(this.startPoint.clientY, currentClientY);
    }

    // Update selection box position (viewport-relative, fixed positioning)
    this.selectionBox.style.left = left + 'px';
    this.selectionBox.style.top = top + 'px';
    this.selectionBox.style.width = width + 'px';
    this.selectionBox.style.height = height + 'px';

    // Apply oval/circle border-radius if in oval mode
    if (isOval) {
      this.selectionBox.style.borderRadius = '50%';
      // Hide corner handles for oval/circle
      this.selectionBox.classList.add('oval-mode');
    } else {
      this.selectionBox.style.borderRadius = '0';
      this.selectionBox.classList.remove('oval-mode');
    }

    // Update dimensions display based on mode
    // For oval mode: don't show dimensions
    // For circle mode: show radius
    // For rectangle/square: show width × height
    if (isOval && !isCircle) {
      // Oval mode - hide dimensions
      if (this.dimensionsDisplay) {
        this.dimensionsDisplay.style.display = 'none';
      }
    } else if (isCircle) {
      // Circle mode - show radius (just the number)
      const radius = Math.round(width / 2);
      this.updateDimensionsDisplay(left, top, width, height, `${radius}`);
    } else {
      // Rectangle/square mode - show width × height
      this.updateDimensionsDisplay(left, top, width, height);
    }

    // Update clip-path on overlay to create the cutout effect
    const right = left + width;
    const bottom = top + height;
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const radiusX = width / 2;
    const radiusY = height / 2;

    if (isOval) {
      // Use ellipse clip-path for oval/circle
      // We need to create an inverted ellipse effect
      // This is done by creating a polygon that covers everything except the ellipse
      // Since CSS clip-path doesn't support "subtract ellipse", we'll use a workaround
      // by setting the overlay background only outside the ellipse area using multiple gradients
      // For now, we'll use a simpler approach with the selection box visible and overlay darkened

      // Create an ellipse cutout using clip-path with polygon approximation
      const points = this.generateEllipseClipPath(centerX, centerY, radiusX, radiusY, 48);
      this.selectionOverlay.style.clipPath = points;
    } else {
      // Rectangle/square clip-path
      this.selectionOverlay.style.clipPath = `polygon(
        0% 0%, 0% 100%, ${left}px 100%, ${left}px ${top}px,
        ${right}px ${top}px, ${right}px ${bottom}px,
        ${left}px ${bottom}px, ${left}px 100%, 100% 100%, 100% 0%
      )`;
    }
  }

  /**
   * Generate clip-path polygon points to create an ellipse cutout
   * This creates a polygon that covers the entire viewport EXCEPT the ellipse area
   */
  generateEllipseClipPath(cx, cy, rx, ry, segments = 64) {
    // Generate ellipse points - we need to trace the ellipse to create a hole
    // The trick is to go: outer rectangle → entry point → around ellipse (clockwise) → exit point → continue outer rectangle

    const ellipsePoints = [];
    // Start from right side of ellipse (0 degrees) and go clockwise
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      const x = cx + rx * Math.cos(angle);
      const y = cy + ry * Math.sin(angle);
      ellipsePoints.push(`${x}px ${y}px`);
    }

    // Create clip-path with a hole for the ellipse
    // We trace the outer viewport, then cut in to trace the ellipse (creating a hole)
    // Using evenodd fill rule by tracing the ellipse in opposite direction

    // Entry point: right side of ellipse (cx + rx, cy)
    const entryX = cx + rx;
    const entryY = cy;

    return `polygon(
      evenodd,
      0 0,
      100% 0,
      100% 100%,
      0 100%,
      0 0,
      ${entryX}px ${entryY}px,
      ${ellipsePoints.join(', ')}
    )`;
  }

  /**
   * Cancel the current selection
   */
  cancelSelection() {
    this.removeSelectionOverlay();

    if (this.options.onSelectionCancel) {
      this.options.onSelectionCancel();
    }

    if (this._rejectSelection) {
      this._rejectSelection(new Error('Selection cancelled'));
    }
  }

  /**
   * Remove the selection overlay
   */
  removeSelectionOverlay() {
    if (this.selectionOverlay) {
      this.selectionOverlay.removeEventListener('mousedown', this._handleMouseDown);
      document.removeEventListener('mousemove', this._handleMouseMove);
      document.removeEventListener('mouseup', this._handleMouseUp);
      document.removeEventListener('keydown', this._handleKeyDown);
      document.removeEventListener('keyup', this._handleKeyUp);

      this.selectionOverlay.remove();
      this.selectionOverlay = null;
    }

    // Selection box is now a separate element, remove it too
    if (this.selectionBox) {
      this.selectionBox.remove();
      this.selectionBox = null;
    }

    // Dimensions display is also a separate element
    if (this.dimensionsDisplay) {
      this.dimensionsDisplay.remove();
      this.dimensionsDisplay = null;
    }

    // Shape feedback is also a separate element
    if (this.shapeFeedback) {
      this.shapeFeedback.remove();
      this.shapeFeedback = null;
    }

    // Restore scrolling
    document.body.style.overflow = '';

    // Clear feedback timeout
    if (this._feedbackTimeout) {
      clearTimeout(this._feedbackTimeout);
      this._feedbackTimeout = null;
    }

    this.isSelecting = false;
    this.isSquareMode = false;
    // Note: isOvalMode is NOT reset here to preserve the saved shape preference
    this.startPoint = null;
    this.lastMousePosition = null;
    this._resolveSelection = null;
    this._rejectSelection = null;
  }

  /**
   * Capture a specific area of the page
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Width of area
   * @param {number} height - Height of area
   * @param {boolean} isOval - Whether to apply ellipse mask
   * @returns {Promise<Blob>} - Screenshot as blob
   */
  async captureArea(x, y, width, height, isOval = false) {
    if (this.isCapturing) {
      throw new Error('Capture already in progress');
    }

    this.isCapturing = true;

    try {
      if (this.options.onCaptureStart) {
        this.options.onCaptureStart('region');
      }

      const html2canvas = await this.loadHtml2Canvas();

      const canvas = await html2canvas(document.body, {
        scale: this.options.scale,
        useCORS: this.options.useCORS,
        allowTaint: this.options.allowTaint,
        backgroundColor: this.options.backgroundColor,
        logging: this.options.logging,
        x: x,
        y: y,
        width: width,
        height: height,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });

      // Apply ellipse mask if in oval/circle mode
      let finalCanvas = canvas;
      if (isOval) {
        finalCanvas = this.applyEllipseMask(canvas);
      }

      const blob = await this.canvasToBlob(finalCanvas);

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

  /**
   * Apply an ellipse mask to a canvas
   * @param {HTMLCanvasElement} sourceCanvas - The source canvas
   * @returns {HTMLCanvasElement} - New canvas with ellipse mask applied
   */
  applyEllipseMask(sourceCanvas) {
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
   * Convert canvas to blob
   * @param {HTMLCanvasElement} canvas
   * @returns {Promise<Blob>}
   */
  canvasToBlob(canvas) {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        },
        this.options.imageFormat,
        this.options.imageQuality
      );
    });
  }

  /**
   * Convert blob to File object
   * @param {Blob} blob
   * @param {string} type - Type of capture (fullpage, viewport, region)
   * @returns {File}
   */
  blobToFile(blob, type = 'screenshot') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `${this.options.filenamePrefix}-${type}-${timestamp}.png`;
    return new File([blob], filename, { type: blob.type });
  }

  /**
   * Destroy the instance and clean up
   */
  destroy() {
    this.removeSelectionOverlay();
    this.isCapturing = false;
  }
}

export default PageCapture;
