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
  },

  // ============================================================================
  // File Size Limits
  // Global size limits for uploads
  // ============================================================================
  limits: {
    perFileMaxSize: 10 * 1024 * 1024, // 10MB
    perFileMaxSizeDisplay: "10MB",
    totalMaxSize: 100 * 1024 * 1024, // 100MB
    totalMaxSizeDisplay: "100MB",
    maxFiles: 10,
  },

  // ============================================================================
  // Per-Type Limits
  // Size and count limits per file type (image, video, etc.)
  // ============================================================================
  perTypeLimits: {
    perFileMaxSizePerType: {},
    perFileMaxSizePerTypeDisplay: {},
    perTypeMaxTotalSize: {},
    perTypeMaxTotalSizeDisplay: {},
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
  },

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
    collapsibleCaptureButtons: false,
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
    externalDropZoneActiveClass: "file-uploader-drop-active",
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
  },
};

// ============================================================
// OPTION UTILITIES
// Helper functions for option processing
// ============================================================

/**
 * Flatten grouped options into a flat object for internal use
 * @param {Object} groupedOptions - Options organized by category
 * @returns {Object} - Flat options object
 */
export function flattenOptions(groupedOptions) {
  const flat = {};
  for (const category of Object.values(groupedOptions)) {
    if (
      typeof category === "object" &&
      category !== null &&
      !Array.isArray(category)
    ) {
      Object.assign(flat, category);
    }
  }
  return flat;
}

/**
 * Merge user grouped options with defaults
 * Supports both grouped and flat option formats for backward compatibility
 *
 * @param {Object} userOptions - User-provided options (grouped or flat)
 * @param {Object} defaults - Default grouped options
 * @returns {Object} - Merged flat options object for internal use
 */
export function mergeGroupedOptions(userOptions, defaults = DEFAULT_OPTIONS) {
  // Start with flattened defaults
  const flatDefaults = flattenOptions(defaults);

  // Flatten user options - supports both grouped and flat formats
  const flatUserOptions = {};
  const groupKeys = Object.keys(defaults);

  for (const [key, value] of Object.entries(userOptions)) {
    if (
      groupKeys.includes(key) &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      value !== null
    ) {
      // This is a category object - flatten it
      Object.assign(flatUserOptions, value);
    } else if (!groupKeys.includes(key)) {
      // This is a flat option (not a category key) - include it directly
      flatUserOptions[key] = value;
    }
  }

  return { ...flatDefaults, ...flatUserOptions };
}

/**
 * Get a deep copy of default options
 * @returns {Object} Deep copy of default options
 */
export function getDefaultOptions() {
  return JSON.parse(JSON.stringify(DEFAULT_OPTIONS));
}

export default DEFAULT_OPTIONS;
