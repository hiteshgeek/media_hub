/**
 * FileUploader.js
 *
 * Main FileUploader class - A flexible file uploader with drag & drop,
 * preview, and AJAX upload. Compatible with Bootstrap 3-5 and standalone usage.
 *
 * @module FileUploader
 */

// Configuration
import {
  DEFAULT_OPTIONS,
  mergeGroupedOptions
} from "../file-uploader/config/DefaultOptions.js";

// Validators
import { FileValidator } from "../file-uploader/validators/FileValidator.js";

// Managers
import { UIBuilder } from "../file-uploader/managers/UIBuilder.js";
import { EventManager } from "../file-uploader/managers/EventManager.js";
import { UploadManager } from "../file-uploader/managers/UploadManager.js";
import { PreviewManager } from "../file-uploader/managers/PreviewManager.js";
import { CaptureManager } from "../file-uploader/managers/CaptureManager.js";
import { LimitsDisplayManager } from "../file-uploader/managers/LimitsDisplayManager.js";
import { SelectionManager } from "../file-uploader/managers/SelectionManager.js";
import { CrossUploaderManager, uploaderRegistry } from "../file-uploader/managers/CrossUploaderManager.js";
import { CarouselManager } from "../file-uploader/managers/CarouselManager.js";

// Utilities
import { formatAlertDetails, formatFileSize } from "../file-uploader/utils/helpers.js";
import RecordingUI from "../utils/RecordingUI.js";

// UI Components
import Alert from "./Alert.js";

// Instance counter for unique IDs
let instanceCounter = 0;

// ============================================================
// FILE UPLOADER CLASS
// ============================================================

export default class FileUploader {
  /**
   * Get default options organized by category
   * @returns {Object} Default options grouped by category
   */
  static getDefaultOptions() {
    return JSON.parse(JSON.stringify(DEFAULT_OPTIONS));
  }

  /**
   * Create a FileUploader instance
   * @param {HTMLElement|string} element - Target element or selector
   * @param {Object} options - Configuration options
   */
  constructor(element, options = {}) {
    this.element =
      typeof element === "string" ? document.querySelector(element) : element;

    if (!this.element) {
      console.error("FileUploader: Element not found:", element);
      return;
    }

    // Generate unique instance ID
    this.instanceId = `media-hub-${++instanceCounter}`;
    uploaderRegistry.set(this.instanceId, this);

    // Merge user options with defaults
    this.options = mergeGroupedOptions(options, DEFAULT_OPTIONS);

    // Auto-generate Display properties from byte values
    this.generateDisplayProperties();

    // Validate button configurations
    this.validateButtonConfig();

    // Initialize state
    this.files = [];
    this.selectedFiles = new Set();
    this.limitsViewMode = this.options.limitsDisplay.defaultLimitsView || "concise";
    this.limitsVisible = this.options.limitsDisplay.defaultLimitsVisible !== false;
    this.draggedFileObj = null;

    // Initialize recording UI
    this.recordingUI = new RecordingUI(this);

    // Initialize managers
    this.initializeManagers();

    // Start initialization
    this.init();
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================

  /**
   * Validate button configuration options
   */
  validateButtonConfig() {
    if (this.options.buttons.showDownloadAllButton && this.options.buttons.downloadAllButtonElement) {
      console.error(
        "FileUploader: Cannot use both showDownloadAllButton and downloadAllButtonElement. Using internal button."
      );
      this.options.buttons.downloadAllButtonElement = null;
    }

    if (this.options.buttons.showClearAllButton && this.options.buttons.clearAllButtonElement) {
      console.error(
        "FileUploader: Cannot use both showClearAllButton and clearAllButtonElement. Using internal button."
      );
      this.options.buttons.clearAllButtonElement = null;
    }
  }

  /**
   * Initialize all manager instances
   */
  initializeManagers() {
    this.fileValidator = new FileValidator(this.options, () => this.files);
    this.uiBuilder = new UIBuilder(this);
    this.eventManager = new EventManager(this);
    this.uploadManager = new UploadManager(this);
    this.previewManager = new PreviewManager(this);
    this.captureManager = new CaptureManager(this);
    this.limitsManager = new LimitsDisplayManager(this);
    this.selectionManager = new SelectionManager(this);
    this.crossUploaderManager = new CrossUploaderManager(this);
    this.carouselManager = new CarouselManager(this);
  }

  /**
   * Initialize the uploader
   */
  async init() {
    // Fetch config from server if enabled
    if (this.options.behavior.autoFetchConfig) {
      await this.fetchConfig();
    }

    // Build UI structure
    this.uiBuilder.createStructure();

    // Attach event handlers
    this.eventManager.attachEvents();
    this.eventManager.attachBeforeUnloadHandler();

    // Initialize carousel
    this.carouselManager.init();
  }

  /**
   * Fetch configuration from server
   */
  async fetchConfig() {
    try {
      const response = await fetch(this.options.urls.configUrl);
      const config = await response.json();

      // Merge config into grouped options structure
      if (config.perFileMaxSize !== undefined) {
        this.options.limits.perFileMaxSize = config.perFileMaxSize;
      }
      if (config.totalMaxSize !== undefined) {
        this.options.limits.totalMaxSize = config.totalMaxSize;
      }
      if (config.maxFiles !== undefined) {
        this.options.limits.maxFiles = config.maxFiles;
      }
      if (config.perFileMaxSizePerType !== undefined) {
        this.options.perTypeLimits.perFileMaxSizePerType = config.perFileMaxSizePerType;
      }
      if (config.perTypeMaxTotalSize !== undefined) {
        this.options.perTypeLimits.perTypeMaxTotalSize = config.perTypeMaxTotalSize;
      }
      if (config.perTypeMaxFileCount !== undefined) {
        this.options.perTypeLimits.perTypeMaxFileCount = config.perTypeMaxFileCount;
      }
      if (config.allowedExtensions !== undefined) {
        this.options.fileTypes.allowedExtensions = config.allowedExtensions;
      }
      if (config.imageExtensions !== undefined) {
        this.options.fileTypes.imageExtensions = config.imageExtensions;
      }
      if (config.videoExtensions !== undefined) {
        this.options.fileTypes.videoExtensions = config.videoExtensions;
      }
      if (config.audioExtensions !== undefined) {
        this.options.fileTypes.audioExtensions = config.audioExtensions;
      }
      if (config.documentExtensions !== undefined) {
        this.options.fileTypes.documentExtensions = config.documentExtensions;
      }
      if (config.archiveExtensions !== undefined) {
        this.options.fileTypes.archiveExtensions = config.archiveExtensions;
      }
      if (config.uploadDir !== undefined) {
        this.options.urls.uploadDir = config.uploadDir;
      }

      // Auto-generate Display properties from byte values
      this.generateDisplayProperties();
    } catch (error) {
      console.warn(
        "FileUploader: Could not fetch config from server, using default options"
      );
    }
  }

  /**
   * Auto-generate *Display properties from byte values
   */
  generateDisplayProperties() {
    // Generate perFileMaxSizeDisplay
    if (this.options.limits.perFileMaxSize) {
      this.options.limits.perFileMaxSizeDisplay = formatFileSize(this.options.limits.perFileMaxSize);
    }

    // Generate totalMaxSizeDisplay
    if (this.options.limits.totalMaxSize) {
      this.options.limits.totalMaxSizeDisplay = formatFileSize(this.options.limits.totalMaxSize);
    }

    // Generate perFileMaxSizePerTypeDisplay
    this.options.perTypeLimits.perFileMaxSizePerTypeDisplay = {};
    for (const [type, bytes] of Object.entries(this.options.perTypeLimits.perFileMaxSizePerType)) {
      this.options.perTypeLimits.perFileMaxSizePerTypeDisplay[type] = formatFileSize(bytes);
    }

    // Generate perTypeMaxTotalSizeDisplay
    this.options.perTypeLimits.perTypeMaxTotalSizeDisplay = {};
    for (const [type, bytes] of Object.entries(this.options.perTypeLimits.perTypeMaxTotalSize)) {
      this.options.perTypeLimits.perTypeMaxTotalSizeDisplay[type] = formatFileSize(bytes);
    }
  }

  // ============================================================
  // FILE HANDLING
  // ============================================================

  /**
   * Handle files from input or drag-drop
   * @param {FileList} fileList - List of files to process
   */
  handleFiles(fileList) {
    const files = Array.from(fileList);

    // Check multiple file limit
    if (!this.options.behavior.multiple && files.length > 1) {
      this.showError("Only one file allowed at a time");
      return;
    }

    // Check max files limit
    if (files.length + this.files.length > this.options.limits.maxFiles) {
      this.showError({
        filename: "",
        error: "Too many files",
        details: formatAlertDetails("Maximum:", `${this.options.limits.maxFiles} files`),
      });
      return;
    }

    // Process each file
    files.forEach((file) => {
      const validation = this.fileValidator.validateFile(file);
      if (!validation.valid) {
        this.showError(validation.error);
        return;
      }

      const fileObj = {
        id: Date.now() + Math.random().toString(36).slice(2, 11),
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        extension: file.name.split(".").pop().toLowerCase(),
        uploaded: false,
        uploading: false,
        serverFilename: null,
        serverData: null,
      };

      this.files.push(fileObj);
      this.previewManager.createPreview(fileObj);
      this.uploadManager.uploadFile(fileObj);
    });

    // Clear file input
    if (this.fileInput) {
      this.fileInput.value = "";
    }
  }

  /**
   * Handle captured file from screen/video/audio capture
   * @param {Blob|File} blobOrFile - Captured data blob or File object
   * @param {string} captureType - Type of capture (screenshot, fullpage-screenshot, region-screenshot, recording, audio_recording)
   */
  handleCapturedFile(blobOrFile, captureType = "capture") {
    // If it's already a File, use it directly; otherwise create a File from blob
    const file = blobOrFile instanceof File ? blobOrFile : new File([blobOrFile], `${captureType}.png`, { type: blobOrFile.type });
    const filename = file.name;

    const fileObj = {
      id: Date.now() + Math.random().toString(36).slice(2, 11),
      file: file,
      name: filename,
      size: file.size,
      type: file.type,
      extension: filename.split(".").pop().toLowerCase(),
      uploaded: false,
      uploading: false,
      serverFilename: null,
      serverData: null,
      captureType: captureType,
    };

    this.files.push(fileObj);
    this.previewManager.createPreview(fileObj);
    this.uploadManager.uploadFile(fileObj);
  }

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  /**
   * Show an error notification
   * @param {string|Object} message - Error message or object
   */
  showError(message) {
    if (typeof message === "object" && message !== null) {
      console.error("FileUploader:", message.filename, message.error, message.details);
    } else {
      console.error("FileUploader:", message);
    }

    Alert.error(message, {
      animation: this.options.alerts.alertAnimation,
      duration: this.options.alerts.alertDuration,
    });
  }

  /**
   * Show a success notification
   * @param {string} message - Success message
   */
  showSuccess(message) {
    Alert.success(message, {
      animation: this.options.alerts.alertAnimation,
      duration: this.options.alerts.alertDuration,
    });
  }

  /**
   * Show a warning notification
   * @param {string} message - Warning message
   */
  showWarning(message) {
    Alert.warning(message, {
      animation: this.options.alerts.alertAnimation,
      duration: this.options.alerts.alertDuration,
    });
  }

  /**
   * Show an info notification
   * @param {string} message - Info message
   */
  showInfo(message) {
    Alert.info(message, {
      animation: this.options.alerts.alertAnimation,
      duration: this.options.alerts.alertDuration,
    });
  }

  /**
   * Format server error response to Alert-compatible format
   * @param {Object} serverError - Error object from server
   * @returns {Object} Alert-compatible error object
   */
  formatServerError(serverError) {
    const { filename, error, allowed, moreCount, limit, fileType, mimeType } = serverError;

    let details = "";

    if (allowed && Array.isArray(allowed)) {
      const displayExts = allowed.map((ext) => `.${ext}`);
      if (moreCount > 0) {
        displayExts.push(`+${moreCount} more`);
      }
      details = formatAlertDetails("Allowed:", displayExts);
    } else if (limit) {
      const limitLabel = fileType ? `Max ${fileType} size:` : "Max size:";
      details = formatAlertDetails(limitLabel, limit);
    } else if (mimeType) {
      details = formatAlertDetails("Detected:", mimeType);
    }

    return {
      filename: filename,
      error: error,
      details: details,
    };
  }

  // ============================================================
  // RECORDING DELEGATES (for RecordingUI compatibility)
  // ============================================================

  /**
   * Get the video recorder instance from capture manager
   * @returns {VideoRecorder|null}
   */
  get videoRecorder() {
    return this.captureManager?.videoRecorder || null;
  }

  /**
   * Get the audio recorder instance from capture manager
   * @returns {AudioWorkletRecorder|null}
   */
  get audioRecorder() {
    return this.captureManager?.audioRecorder || null;
  }

  /**
   * Stop video recording (delegates to CaptureManager)
   * @returns {Promise<void>}
   */
  async stopVideoRecording() {
    return this.captureManager.stopVideoRecording();
  }

  /**
   * Stop audio recording (delegates to CaptureManager)
   * @returns {Promise<void>}
   */
  async stopAudioRecording() {
    return this.captureManager.stopAudioRecording();
  }

  /**
   * Capture screenshot (delegates to CaptureManager)
   * @returns {Promise<void>}
   */
  async captureScreenshot() {
    return this.captureManager.captureScreenshot();
  }

  /**
   * Capture full page screenshot (delegates to CaptureManager)
   * @returns {Promise<void>}
   */
  async captureFullPage() {
    return this.captureManager.captureFullPage();
  }

  /**
   * Capture region screenshot (delegates to CaptureManager)
   * @returns {Promise<void>}
   */
  async captureRegion() {
    return this.captureManager.captureRegion();
  }

  /**
   * Toggle video recording on/off (delegates to CaptureManager)
   * @returns {Promise<void>}
   */
  async toggleVideoRecording() {
    return this.captureManager.toggleVideoRecording();
  }

  /**
   * Toggle audio recording on/off (delegates to CaptureManager)
   * @returns {Promise<void>}
   */
  async toggleAudioRecording() {
    return this.captureManager.toggleAudioRecording();
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  /**
   * Get all files
   * @returns {Array} All file objects
   */
  getFiles() {
    return this.files;
  }

  /**
   * Get uploaded files only
   * @returns {Array} Uploaded file objects
   */
  getUploadedFiles() {
    return this.files.filter((f) => f.uploaded);
  }

  /**
   * Get uploaded file names (server filenames)
   * @returns {Array} Array of server filenames
   */
  getUploadedFileNames() {
    return this.files.filter((f) => f.uploaded).map((f) => f.serverFilename);
  }

  /**
   * Get detailed uploaded files data
   * @returns {Array} Array of file data objects
   */
  getUploadedFilesData() {
    return this.files
      .filter((f) => f.uploaded)
      .map((f) => ({
        originalName: f.name,
        serverFilename: f.serverFilename,
        size: f.size,
        type: f.type,
        extension: f.extension,
        url: f.serverData?.url || `uploads/${f.serverFilename}`,
      }));
  }

  /**
   * Download all uploaded files
   */
  async downloadAll() {
    return this.uploadManager.downloadAll();
  }

  /**
   * Clear a specific file
   * @param {string|number} fileId - File ID to clear
   */
  clear(fileId) {
    return this.uploadManager.clear(fileId);
  }

  /**
   * Clear all files
   */
  async clearAll() {
    return this.uploadManager.clearAll();
  }

  /**
   * Delete a file
   * @param {string|number} fileId - File ID to delete
   * @param {Object} options - Delete options
   */
  async deleteFile(fileId, options = {}) {
    return this.uploadManager.deleteFile(fileId, options);
  }

  /**
   * Download a file
   * @param {string|number} fileId - File ID to download
   */
  downloadFile(fileId) {
    return this.uploadManager.downloadFile(fileId);
  }

  /**
   * Set the theme dynamically
   * @param {string} theme - Theme to set: "auto" | "light" | "dark"
   */
  setTheme(theme) {
    const validThemes = ["auto", "light", "dark"];
    if (!validThemes.includes(theme)) {
      console.warn(`FileUploader: Invalid theme "${theme}". Valid options: ${validThemes.join(", ")}`);
      return;
    }

    // Update options
    this.options.theme.theme = theme;

    // Update wrapper data attribute
    if (this.wrapper) {
      if (theme === "auto") {
        // Remove data-theme to let CSS handle system preference
        delete this.wrapper.dataset.theme;
      } else {
        this.wrapper.dataset.theme = theme;
      }
    }
  }

  /**
   * Get the current theme
   * @returns {string} Current theme: "auto" | "light" | "dark"
   */
  getTheme() {
    return this.options.theme.theme || "auto";
  }

  // ============================================================
  // LIFECYCLE
  // ============================================================

  /**
   * Destroy the uploader instance
   */
  destroy() {
    // Cleanup uploaded files from server if option is enabled
    if (this.options.behavior.cleanupOnDestroy) {
      this.cleanupUploadedFiles();
    }

    // Remove from registry
    uploaderRegistry.delete(this.instanceId);

    // Remove beforeunload handler
    this.eventManager.removeBeforeUnloadHandler();

    // Destroy carousel
    this.carouselManager.destroy();

    // Remove wrapper from DOM
    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper);
    }

    // Clear references
    this.files = [];
    this.selectedFiles.clear();
    this.element = null;
  }

  /**
   * Cleanup uploaded files (called on page unload)
   */
  async cleanupUploadedFiles() {
    return this.uploadManager.cleanupUploadedFiles();
  }
}
