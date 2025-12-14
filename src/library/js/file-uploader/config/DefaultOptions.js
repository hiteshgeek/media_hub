/**
 * DefaultOptions.js
 *
 * Default configuration options for FileUploader.
 * Options are organized by category for better readability.
 * Supports both grouped and flat option formats for backward compatibility.
 *
 * @module DefaultOptions
 */

// ============================================================
// DEFAULT OPTIONS
// Organized by category for clarity
// ============================================================

/**
 * Default options organized by category for better readability and control.
 * Each category groups related options together.
 * Supports both grouped and flat option formats for backward compatibility.
 */
export const DEFAULT_OPTIONS = {
  // ============================================================================
  // URL Configuration
  // Server endpoints for upload, delete, download operations
  // ============================================================================
  urls: {
    uploadUrl: "./upload.php",
    deleteUrl: "./delete.php",
    downloadAllUrl: "./download-all.php",
    cleanupZipUrl: "./cleanup-zip.php",
    copyFileUrl: "./copy-file.php",
    configUrl: "./get-config.php",
    uploadDir: "",
    // Additional data to include in POST requests
    additionalData: {}, // Data included in ALL POST requests
    uploadData: {}, // Data included only in upload requests
    deleteData: {}, // Data included only in delete requests
    downloadData: {}, // Data included only in download requests
    copyData: {}, // Data included only in copy file requests
    cleanupData: {}, // Data included only in cleanup zip requests
  },

  // ============================================================================
  // File Size Limits
  // Global size limits for uploads
  // ============================================================================
  limits: {
    perFileMaxSize: 10 * 1024 * 1024, // 10MB
    totalMaxSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 10,
  },

  // ============================================================================
  // Per-Type Limits
  // Size and count limits per file type (image, video, etc.)
  // ============================================================================
  perTypeLimits: {
    perFileMaxSizePerType: {},
    perTypeMaxTotalSize: {},
    perTypeMaxFileCount: {},
  },

  // ============================================================================
  // Allowed File Types
  // Extensions categorized by type
  // ============================================================================
  fileTypes: {
    allowedExtensions: [],
    imageExtensions: ["jpg", "jpeg", "png", "gif", "webp", "svg"],
    videoExtensions: ["mp4", "mpeg", "mov", "avi", "webm"],
    audioExtensions: ["mp3", "wav", "ogg", "webm", "aac", "m4a", "flac"],
    documentExtensions: [
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "txt",
      "csv",
    ],
    archiveExtensions: ["zip", "rar", "7z", "tar", "gz"],
  },

  // ============================================================================
  // Theme Configuration
  // Control the visual theme of the uploader
  // ============================================================================
  theme: {
    theme: "auto", // "auto" | "light" | "dark"
  },

  // ============================================================================
  // Upload Behavior
  // Controls for upload process
  // ============================================================================
  behavior: {
    multiple: true,
    autoFetchConfig: true,
    confirmBeforeDelete: false,
    preventDuplicates: false,
    duplicateCheckBy: "name-size",
    cleanupOnUnload: true,
    cleanupOnDestroy: true,
    showUploadProgress: true, // Show actual upload progress bar on file preview
  },

  // ============================================================================
  // Existing Files
  // Pre-load existing files on initialization (for edit forms)
  // ============================================================================
  existingFiles: [], // Array of existing file objects to load on init

  // ============================================================================
  // Limits Display
  // Controls for limits visibility and display mode
  // ============================================================================
  limitsDisplay: {
    showLimits: true,
    showProgressBar: false,
    showTypeProgressBar: true,
    showPerFileLimit: true,
    showTypeGroupSize: true,
    showTypeGroupCount: true,
    defaultLimitsView: "concise",
    allowLimitsViewToggle: true,
    showLimitsToggle: true,
    defaultLimitsVisible: true,
  },

  // ============================================================================
  // Alert Notifications
  // Toast notification settings
  // ============================================================================
  alerts: {
    alertAnimation: "shake",
    alertDuration: 5000,
  },

  // ============================================================================
  // Buttons Configuration
  // Download All and Clear All button settings
  // ============================================================================
  buttons: {
    showDownloadAllButton: true,
    downloadAllButtonText: "Download All",
    downloadAllButtonClasses: [],
    downloadAllButtonElement: null,
    showClearAllButton: true,
    clearAllButtonText: "Clear All",
    clearAllButtonClasses: [],
    clearAllButtonElement: null,
    buttonSize: "md",
    timerSize: "md",
    collapsibleCaptureButtons: false,
    modalMediaButtons: [],
    enableModalDropZone: true,
    showAllowedExtensionsButton: true, // Show button to view allowed file types
  },

  // ============================================================================
  // Media Capture
  // Screen capture and recording settings
  // ============================================================================
  mediaCapture: {
    enableFullPageCapture: true,
    enableRegionCapture: true,
    enableScreenCapture: true,
    enableVideoRecording: true,
    enableAudioRecording: true,
    maxVideoRecordingDuration: 300,
    maxAudioRecordingDuration: 300,
    recordingCountdownDuration: 3,
    enableMicrophoneAudio: true,
    enableSystemAudio: true,
    // Recording timer display options
    showRecordingTime: true, // Show the recording time in timer
    showRecordingLimit: true, // Show the time limit (if set)
    showRecordingSize: true, // Show approximate file size
    recordingTimeClickToggle: true, // Allow clicking to toggle between elapsed/remaining time
    recordingTimeDefaultView: "elapsed", // "elapsed" or "remaining" - starting view for time display
    videoBitsPerSecond: 2500000,
    audioBitsPerSecond: 128000,
    maxVideoRecordingFileSize: null,
    maxAudioRecordingFileSize: null,
    externalRecordingToolbarContainer: null,
    regionCaptureShowDimensions: true,
    regionCaptureDimensionsPosition: "center",
    regionCaptureImmediateCapture: true,
  },

  // ============================================================================
  // Carousel Preview
  // File carousel/gallery settings
  // ============================================================================
  carousel: {
    enableCarouselPreview: true,
    carouselAutoPreload: true,
    carouselEnableManualLoading: true,
    carouselVisibleTypes: [
      "image",
      "video",
      "audio",
      "pdf",
      "excel",
      "csv",
      "text",
    ],
    carouselPreviewableTypes: [
      "image",
      "video",
      "audio",
      "pdf",
      "csv",
      "excel",
      "text",
    ],
    carouselMaxPreviewRows: 100,
    carouselMaxTextPreviewChars: 50000,
    carouselShowDownloadButton: true,
  },

  // ============================================================================
  // Cross-Uploader & External Drop Zone
  // Drag-drop between uploaders and external drop targets
  // ============================================================================
  dragDrop: {
    enableCrossUploaderDrag: true,
    externalDropZone: null,
    externalDropZoneActiveClass: "media-hub-drop-active",
  },

  // ============================================================================
  // Callbacks
  // Event handlers for upload lifecycle
  // ============================================================================
  callbacks: {
    onUploadStart: null,
    onUploadSuccess: null,
    onUploadError: null,
    onDeleteSuccess: null,
    onDeleteError: null,
    onDuplicateFile: null,
    /**
     * Called when config is successfully fetched from server
     * @param {Object} config - The config object received from server
     */
    onConfigFetched: null,
    /**
     * Called before each request to allow dynamic data modification
     * @param {string} requestType - Type of request: 'upload', 'delete', 'download', 'copy', 'cleanup'
     * @param {Object} data - The data object that will be sent (can be modified)
     * @param {Object} context - Additional context (fileObj, files array, etc.)
     * @returns {Object|void} - Return modified data object, or modify in place
     */
    onBeforeRequest: null,
  },
};

// ============================================================
// OPTION UTILITIES
// Helper functions for option processing
// ============================================================

/**
 * Deep merge two objects, preserving the grouped structure
 * @param {Object} target - Target object
 * @param {Object} source - Source object to merge
 * @returns {Object} - Merged object
 */
function deepMerge(target, source) {
  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key]) &&
        target[key] &&
        typeof target[key] === "object" &&
        !Array.isArray(target[key])
      ) {
        // Both are objects, merge recursively
        result[key] = deepMerge(target[key], source[key]);
      } else {
        // Otherwise, override with source value
        result[key] = source[key];
      }
    }
  }

  return result;
}

/**
 * Merge user options with defaults, preserving grouped structure
 * @param {Object} userOptions - User-provided options (grouped structure)
 * @param {Object} defaults - Default grouped options
 * @returns {Object} - Merged grouped options object
 */
export function mergeGroupedOptions(userOptions, defaults = DEFAULT_OPTIONS) {
  return deepMerge(defaults, userOptions);
}

/**
 * Get a deep copy of default options
 * @returns {Object} Deep copy of default options
 */
export function getDefaultOptions() {
  return JSON.parse(JSON.stringify(DEFAULT_OPTIONS));
}

export default DEFAULT_OPTIONS;
