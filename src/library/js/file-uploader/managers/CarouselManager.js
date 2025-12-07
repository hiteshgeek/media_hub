/**
 * CarouselManager.js
 *
 * Manages carousel preview integration for the FileUploader.
 * Handles initialization, file conversion, and carousel operations.
 *
 * @module CarouselManager
 */

import { FileCarousel } from "../../file-carousel/index.js";
import { getFileType } from "../utils/helpers.js";

// ============================================================
// CAROUSEL MANAGER CLASS
// ============================================================

export class CarouselManager {
  /**
   * Create a CarouselManager instance
   * @param {FileUploader} uploader - The parent FileUploader instance
   */
  constructor(uploader) {
    this.uploader = uploader;
    this.carousel = null;
    this.carouselContainer = null;
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================

  /**
   * Initialize the carousel preview component
   */
  init() {
    if (!this.uploader.options.enableCarouselPreview) return;

    // Create carousel container (appended to body for proper z-index stacking)
    this.carouselContainer = document.createElement("div");
    this.carouselContainer.className = "file-uploader-carousel-container";
    document.body.appendChild(this.carouselContainer);

    // Initialize carousel with empty files (will update when files are uploaded)
    this.carousel = new FileCarousel({
      container: this.carouselContainer,
      files: [],
      autoPreload: this.uploader.options.carouselAutoPreload,
      enableManualLoading: this.uploader.options.carouselEnableManualLoading,
      showDownloadButton: this.uploader.options.carouselShowDownloadButton,
      visibleTypes: this.uploader.options.carouselVisibleTypes,
      previewableTypes: this.uploader.options.carouselPreviewableTypes,
      maxPreviewRows: this.uploader.options.carouselMaxPreviewRows,
      maxTextPreviewChars: this.uploader.options.carouselMaxTextPreviewChars,
      onFileDownload: (file) => {
        // Use the file uploader's download logic
        const fileObj = this.uploader.files.find((f) => f.id === file.originalId);
        if (fileObj) {
          this.uploader.downloadFile(fileObj.id);
        }
      },
    });
  }

  // ============================================================
  // FILE CONVERSION
  // ============================================================

  /**
   * Convert file uploader files to carousel format
   * @returns {Array} Files in carousel format
   */
  getCarouselFiles() {
    return this.uploader.files
      .filter((f) => f.uploaded && f.serverFilename)
      .map((f) => {
        const fileType = getFileType(f.extension, this.uploader.options);
        const carouselType = this.mapToCarouselType(f.extension, fileType);
        const url = f.serverData?.url || `uploads/${f.serverFilename}`;

        // Get thumbnail for images/videos
        let thumbnail = null;
        if (fileType === "image") {
          thumbnail = url;
        } else if (fileType === "video" && f.previewElement) {
          const thumbImg = f.previewElement.querySelector(
            ".file-uploader-video-thumbnail-img"
          );
          if (thumbImg) {
            thumbnail = thumbImg.src;
          }
        }

        return {
          originalId: f.id,
          name: f.name,
          carouselType: carouselType,
          url: url,
          thumbnail: thumbnail,
          size: f.size,
          extension: f.extension,
        };
      });
  }

  /**
   * Map file extension to carousel type
   * @param {string} extension - File extension
   * @param {string} fileType - File type from getFileType()
   * @returns {string} Carousel type
   */
  mapToCarouselType(extension, fileType) {
    const ext = extension.toLowerCase();

    // Direct mapping for known types
    if (fileType === "image") return "image";
    if (fileType === "video") return "video";
    if (fileType === "audio") return "audio";

    // Document types with specific carousel support
    if (ext === "pdf") return "pdf";
    if (ext === "xlsx" || ext === "xls") return "excel";
    if (ext === "csv") return "csv";
    if (
      ext === "txt" ||
      ext === "md" ||
      ext === "log" ||
      ext === "json" ||
      ext === "xml"
    )
      return "text";

    // Default to text for other document types (won't have preview)
    return "text";
  }

  // ============================================================
  // CAROUSEL OPERATIONS
  // ============================================================

  /**
   * Update carousel with current files
   */
  update() {
    if (!this.carousel || !this.uploader.options.enableCarouselPreview) return;

    const carouselFiles = this.getCarouselFiles();
    this.carousel.updateFiles(carouselFiles);
  }

  /**
   * Open carousel at specific file
   * @param {string} fileId - File ID to open
   */
  open(fileId) {
    if (!this.carousel || !this.uploader.options.enableCarouselPreview) return;

    // Update carousel files first
    this.update();

    // Find index of file in carousel
    const carouselFiles = this.getCarouselFiles();
    const index = carouselFiles.findIndex((f) => f.originalId === fileId);

    if (index !== -1) {
      this.carousel.open(index);
    }
  }

  // ============================================================
  // CLEANUP
  // ============================================================

  /**
   * Destroy carousel instance
   */
  destroy() {
    if (this.carousel) {
      this.carousel.destroy();
      this.carousel = null;
    }
    if (this.carouselContainer) {
      this.carouselContainer.remove();
      this.carouselContainer = null;
    }
  }
}
