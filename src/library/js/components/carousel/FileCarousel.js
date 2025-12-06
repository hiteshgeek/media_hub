/**
 * FileCarousel - Main carousel component for file uploader preview
 * Adapted from mix_carousel for file_uploader integration
 *
 * Usage:
 * const carousel = new FileCarousel({
 *   container: document.getElementById('carousel-container'),
 *   files: [...], // Files in carousel format
 *   autoPreload: true, // or false, or ['image', 'video']
 * });
 *
 * carousel.open(index); // Open modal at specific file
 * carousel.updateFiles(newFiles); // Update file list
 * carousel.destroy(); // Cleanup
 */

import { MediaPreloader } from "./MediaPreloader.js";
import { MediaRenderer } from "./MediaRenderer.js";
import { ModalController } from "./ModalController.js";

export default class FileCarousel {
  constructor(options = {}) {
    this.options = {
      container: options.container || document.body,
      files: options.files || [],
      autoPreload: options.autoPreload !== undefined ? options.autoPreload : true,
      enableManualLoading:
        options.enableManualLoading !== undefined
          ? options.enableManualLoading
          : true,
      showDownloadButton:
        options.showDownloadButton !== undefined
          ? options.showDownloadButton
          : true,
      visibleTypes: options.visibleTypes || [
        "image",
        "video",
        "audio",
        "pdf",
        "excel",
        "csv",
        "text",
      ],
      previewableTypes: options.previewableTypes || [
        "image",
        "video",
        "audio",
        "pdf",
        "csv",
        "excel",
        "text",
      ],
      onFileClick: options.onFileClick || null,
      onFileDownload: options.onFileDownload || null,
      maxPreviewRows: options.maxPreviewRows || 100,
      maxTextPreviewChars: options.maxTextPreviewChars || 50000,
    };

    this.currentIndex = 0;
    this.preloader = new MediaPreloader(this.options);
    this.renderer = new MediaRenderer(this.options, this.preloader);
    this.modal = new ModalController(
      this.options,
      this.preloader,
      this.renderer
    );

    this.init();
  }

  init() {
    this.render();

    if (this.shouldAutoPreload()) {
      this.preloader.preloadAll(this.getAutoPreloadFiles());
    }

    this.attachEventListeners();
  }

  shouldAutoPreload() {
    return this.options.autoPreload !== false;
  }

  getAutoPreloadFiles() {
    if (this.options.autoPreload === true) {
      return this.getPreloadableFiles();
    } else if (Array.isArray(this.options.autoPreload)) {
      return this.options.files.filter(
        (file) =>
          this.options.visibleTypes.includes(file.carouselType) &&
          this.options.previewableTypes.includes(file.carouselType) &&
          this.options.autoPreload.includes(file.carouselType)
      );
    }
    return [];
  }

  getPreloadableFiles() {
    return this.options.files.filter(
      (file) =>
        this.options.visibleTypes.includes(file.carouselType) &&
        this.options.previewableTypes.includes(file.carouselType)
    );
  }

  getVisibleFiles() {
    return this.options.files;
  }

  render() {
    const container = this.options.container;
    container.innerHTML = this.generateHTML();
  }

  generateHTML() {
    const showToggleButton =
      this.options.autoPreload !== true && this.options.enableManualLoading;

    return `
      <div class="fc-modal" data-fc-modal>
        <div class="fc-modal-container">
          <div class="fc-modal-header">
            <div class="fc-modal-title-section">
              <h2 class="fc-modal-file-name" data-fc-modal-filename>File Name</h2>
              <span class="fc-file-badge" data-fc-modal-filetype>TYPE</span>
            </div>
            <div class="fc-modal-actions">
              ${
                showToggleButton
                  ? `
              <button class="fc-modal-btn fc-preload-toggle-btn" data-fc-preload-toggle title="Toggle Preload">
                <svg class="fc-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
                <span class="fc-btn-text">Load All</span>
              </button>
              `
                  : ""
              }
              ${
                this.options.showDownloadButton
                  ? `<button class="fc-modal-btn fc-download-btn" data-fc-download title="Download (D)">
                <svg class="fc-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
              </button>`
                  : ""
              }
              <button class="fc-modal-btn fc-close-btn" data-fc-close title="Close (Esc)">
                <svg class="fc-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="fc-modal-content-wrapper">
            <button class="fc-nav-button fc-prev" data-fc-prev>
              <svg class="fc-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <div class="fc-modal-content" data-fc-modal-content></div>
            <button class="fc-nav-button fc-next" data-fc-next>
              <svg class="fc-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
          <div class="fc-thumbnail-strip" data-fc-thumbnail-strip></div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    this.modal.attachEventListeners();

    // Keyboard shortcuts
    this.keyboardHandler = (e) => {
      if (!this.modal.isOpen()) return;

      switch (e.key) {
        case "ArrowLeft":
          this.modal.prev();
          break;
        case "ArrowRight":
          this.modal.next();
          break;
        case "Escape":
          this.modal.close();
          break;
        case "d":
        case "D":
          this.downloadFile(this.modal.currentIndex);
          break;
      }
    };

    document.addEventListener("keydown", this.keyboardHandler);
  }

  /**
   * Open carousel modal at specific file index
   * @param {number} index - File index to open
   */
  open(index) {
    if (index >= 0 && index < this.options.files.length) {
      this.modal.open(index, this.options.files);
    }
  }

  /**
   * Close the carousel modal
   */
  close() {
    this.modal.close();
  }

  /**
   * Check if carousel is currently open
   * @returns {boolean}
   */
  isOpen() {
    return this.modal.isOpen();
  }

  downloadFile(index) {
    const file = this.options.files[index];

    if (this.options.onFileDownload) {
      this.options.onFileDownload(file, index);
    } else {
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  destroy() {
    document.removeEventListener("keydown", this.keyboardHandler);
    this.preloader.cleanup();
    this.modal.destroy();
    this.options.container.innerHTML = "";
  }

  preloadFiles() {
    this.preloader.preloadAll(this.getPreloadableFiles());
  }

  /**
   * Update files in the carousel
   * @param {Array} files - New files array in carousel format
   */
  updateFiles(files) {
    // Cleanup existing preloaded media
    this.preloader.cleanup();

    // Update files
    this.options.files = files;

    // Reset the thumbnail strip when files change
    const strip = this.options.container.querySelector("[data-fc-thumbnail-strip]");
    if (strip) {
      strip.innerHTML = "";
    }

    // Preload new files if auto-preload is enabled
    if (this.shouldAutoPreload()) {
      this.preloader.preloadAll(this.getAutoPreloadFiles());
    }
  }

  /**
   * Get current file index
   * @returns {number}
   */
  getCurrentIndex() {
    return this.modal.currentIndex;
  }

  /**
   * Get current file
   * @returns {Object|null}
   */
  getCurrentFile() {
    return this.options.files[this.modal.currentIndex] || null;
  }
}

export { FileCarousel };
