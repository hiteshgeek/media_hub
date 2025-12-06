/**
 * PageCapture - Full Page and Region Screenshot Capture
 * Uses html2canvas to capture the current page DOM
 * Supports full page (with scroll) and selected region capture
 */

class PageCapture {
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
    this.startPoint = null;
    this.html2canvasLoaded = false;
    this.html2canvasPromise = null;
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
    // Main overlay container
    this.selectionOverlay = document.createElement('div');
    this.selectionOverlay.className = 'file-uploader-page-capture-overlay';
    this.selectionOverlay.innerHTML = `
      <div class="file-uploader-page-capture-instructions">
        <span class="file-uploader-page-capture-instructions-text">Click and drag to select an area</span>
        <span class="file-uploader-page-capture-instructions-hint">Press <kbd>ESC</kbd> to cancel</span>
      </div>
      <div class="file-uploader-page-capture-selection-box"></div>
    `;

    document.body.appendChild(this.selectionOverlay);

    this.selectionBox = this.selectionOverlay.querySelector('.file-uploader-page-capture-selection-box');

    // Bind event handlers
    this._handleMouseDown = this.handleMouseDown.bind(this);
    this._handleMouseMove = this.handleMouseMove.bind(this);
    this._handleMouseUp = this.handleMouseUp.bind(this);
    this._handleKeyDown = this.handleKeyDown.bind(this);

    this.selectionOverlay.addEventListener('mousedown', this._handleMouseDown);
    document.addEventListener('mousemove', this._handleMouseMove);
    document.addEventListener('mouseup', this._handleMouseUp);
    document.addEventListener('keydown', this._handleKeyDown);

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

    const currentClientX = e.clientX;
    const currentClientY = e.clientY;

    // Calculate viewport-relative bounds for display
    const left = Math.min(this.startPoint.clientX, currentClientX);
    const top = Math.min(this.startPoint.clientY, currentClientY);
    const width = Math.abs(currentClientX - this.startPoint.clientX);
    const height = Math.abs(currentClientY - this.startPoint.clientY);

    // Update selection box position (viewport-relative, fixed positioning)
    this.selectionBox.style.left = left + 'px';
    this.selectionBox.style.top = top + 'px';
    this.selectionBox.style.width = width + 'px';
    this.selectionBox.style.height = height + 'px';

    // Update clip-path on overlay to create the cutout effect
    // Using polygon to draw around the selection (creates a "hole")
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const right = left + width;
    const bottom = top + height;

    // Create a polygon that covers the whole viewport except the selection area
    // This creates a "frame" effect - the selection area is cut out
    this.selectionOverlay.style.clipPath = `polygon(
      0% 0%, 0% 100%, ${left}px 100%, ${left}px ${top}px,
      ${right}px ${top}px, ${right}px ${bottom}px,
      ${left}px ${bottom}px, ${left}px 100%, 100% 100%, 100% 0%
    )`;
  }

  /**
   * Handle mouse up - complete selection
   */
  async handleMouseUp(e) {
    if (!this.startPoint) return;

    const currentClientX = e.clientX;
    const currentClientY = e.clientY;

    // Calculate document-relative coords for actual capture
    const currentX = e.clientX + window.scrollX;
    const currentY = e.clientY + window.scrollY;

    const left = Math.min(this.startPoint.x, currentX);
    const top = Math.min(this.startPoint.y, currentY);
    const width = Math.abs(currentX - this.startPoint.x);
    const height = Math.abs(currentY - this.startPoint.y);

    this.startPoint = null;

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

      const blob = await this.captureArea(left, top, width, height);

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
    }
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

      this.selectionOverlay.remove();
      this.selectionOverlay = null;
      this.selectionBox = null;
    }

    // Restore scrolling
    document.body.style.overflow = '';

    this.isSelecting = false;
    this.startPoint = null;
    this._resolveSelection = null;
    this._rejectSelection = null;
  }

  /**
   * Capture a specific area of the page
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Width of area
   * @param {number} height - Height of area
   * @returns {Promise<Blob>} - Screenshot as blob
   */
  async captureArea(x, y, width, height) {
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

      const blob = await this.canvasToBlob(canvas);

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
