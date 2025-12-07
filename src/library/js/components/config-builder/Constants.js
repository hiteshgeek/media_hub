/**
 * Config Builder - Constants
 * Static mappings and configuration constants
 */

/**
 * Map of option keys to their group category
 */
export const OPTION_TO_GROUP = {
  // URLs
  uploadUrl: "urls",
  deleteUrl: "urls",
  downloadAllUrl: "urls",
  cleanupZipUrl: "urls",
  copyFileUrl: "urls",
  configUrl: "urls",
  uploadDir: "urls",
  // Limits
  perFileMaxSize: "limits",
  perFileMaxSizeDisplay: "limits",
  totalMaxSize: "limits",
  totalMaxSizeDisplay: "limits",
  maxFiles: "limits",
  // Per-Type Limits
  perFileMaxSizePerType: "perTypeLimits",
  perFileMaxSizePerTypeDisplay: "perTypeLimits",
  perTypeMaxTotalSize: "perTypeLimits",
  perTypeMaxTotalSizeDisplay: "perTypeLimits",
  perTypeMaxFileCount: "perTypeLimits",
  // File Types
  allowedExtensions: "fileTypes",
  allowedMimeTypes: "fileTypes",
  imageExtensions: "fileTypes",
  videoExtensions: "fileTypes",
  audioExtensions: "fileTypes",
  documentExtensions: "fileTypes",
  archiveExtensions: "fileTypes",
  // Behavior
  multiple: "behavior",
  autoFetchConfig: "behavior",
  confirmBeforeDelete: "behavior",
  preventDuplicates: "behavior",
  duplicateCheckBy: "behavior",
  cleanupOnUnload: "behavior",
  cleanupOnDestroy: "behavior",
  // Limits Display
  showLimits: "limitsDisplay",
  showProgressBar: "limitsDisplay",
  showTypeProgressBar: "limitsDisplay",
  showPerFileLimit: "limitsDisplay",
  showTypeGroupSize: "limitsDisplay",
  showTypeGroupCount: "limitsDisplay",
  defaultLimitsView: "limitsDisplay",
  allowLimitsViewToggle: "limitsDisplay",
  showLimitsToggle: "limitsDisplay",
  defaultLimitsVisible: "limitsDisplay",
  // Alerts
  alertAnimation: "alerts",
  alertDuration: "alerts",
  // Buttons
  showDownloadAllButton: "buttons",
  downloadAllButtonText: "buttons",
  downloadAllButtonClasses: "buttons",
  downloadAllButtonElement: "buttons",
  showClearAllButton: "buttons",
  clearAllButtonText: "buttons",
  clearAllButtonClasses: "buttons",
  clearAllButtonElement: "buttons",
  // Media Capture
  enableFullPageCapture: "mediaCapture",
  enableRegionCapture: "mediaCapture",
  enableScreenCapture: "mediaCapture",
  enableVideoRecording: "mediaCapture",
  enableAudioRecording: "mediaCapture",
  collapsibleCaptureButtons: "mediaCapture",
  maxVideoRecordingDuration: "mediaCapture",
  maxAudioRecordingDuration: "mediaCapture",
  recordingCountdownDuration: "mediaCapture",
  enableMicrophoneAudio: "mediaCapture",
  enableSystemAudio: "mediaCapture",
  showRecordingSize: "mediaCapture",
  videoBitsPerSecond: "mediaCapture",
  audioBitsPerSecond: "mediaCapture",
  maxVideoRecordingFileSize: "mediaCapture",
  maxAudioRecordingFileSize: "mediaCapture",
  externalRecordingToolbarContainer: "mediaCapture",
  regionCaptureShowDimensions: "mediaCapture",
  regionCaptureDimensionsPosition: "mediaCapture",
  regionCaptureImmediateCapture: "mediaCapture",
  // Carousel
  enableCarouselPreview: "carousel",
  carouselAutoPreload: "carousel",
  carouselEnableManualLoading: "carousel",
  carouselVisibleTypes: "carousel",
  carouselPreviewableTypes: "carousel",
  carouselMaxPreviewRows: "carousel",
  carouselMaxTextPreviewChars: "carousel",
  carouselShowDownloadButton: "carousel",
  // Drag & Drop
  enableCrossUploaderDrag: "dragDrop",
  externalDropZone: "dragDrop",
  externalDropZoneActiveClass: "dragDrop",
  // Callbacks
  onUploadStart: "callbacks",
  onUploadSuccess: "callbacks",
  onUploadError: "callbacks",
  onDeleteSuccess: "callbacks",
  onDeleteError: "callbacks",
  onDuplicateFile: "callbacks",
};

/**
 * Human-readable group names for code comments
 */
export const GROUP_TITLES = {
  urls: "URL Configuration",
  limits: "File Size Limits",
  perTypeLimits: "Per-Type Limits",
  fileTypes: "Allowed File Types",
  behavior: "Upload Behavior",
  limitsDisplay: "Limits Display",
  alerts: "Alert Notifications",
  buttons: "Buttons",
  mediaCapture: "Media Capture",
  carousel: "Carousel Preview",
  dragDrop: "Drag & Drop",
  callbacks: "Callbacks",
};

/**
 * Group order for consistent code output
 */
export const GROUP_ORDER = [
  "urls",
  "limits",
  "perTypeLimits",
  "fileTypes",
  "behavior",
  "limitsDisplay",
  "alerts",
  "buttons",
  "mediaCapture",
  "carousel",
  "dragDrop",
  "callbacks",
];

/**
 * PHP group titles for comments
 */
export const PHP_GROUP_TITLES = {
  urls: "Upload Directory",
  limits: "File Size Limits",
  perTypeLimits: "Per-Type Limits",
  fileTypes: "Allowed File Types & MIME Types",
};

/**
 * Media capture button icons - exactly matching FileUploader's icons.js
 */
export const MEDIA_CAPTURE_ICONS = {
  screenshot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M193.1 32c-18.7 0-36.2 9.4-46.6 24.9L120.5 96 64 96C28.7 96 0 124.7 0 160L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64l-56.5 0-26-39.1C355.1 41.4 337.6 32 318.9 32L193.1 32zm-6.7 51.6c1.5-2.2 4-3.6 6.7-3.6l125.7 0c2.7 0 5.2 1.3 6.7 3.6l33.2 49.8c4.5 6.7 11.9 10.7 20 10.7l69.3 0c8.8 0 16 7.2 16 16l0 256c0 8.8-7.2 16-16 16L64 432c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l69.3 0c8 0 15.5-4 20-10.7l33.2-49.8zM256 384a112 112 0 1 0 0-224 112 112 0 1 0 0 224zM192 272a64 64 0 1 1 128 0 64 64 0 1 1 -128 0z"/></svg>`,
  video: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor"><path d="M96 64c-35.3 0-64 28.7-64 64l0 256c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64L96 64zM464 336l73.5 58.8c4.2 3.4 9.4 5.2 14.8 5.2 13.1 0 23.7-10.6 23.7-23.7l0-240.6c0-13.1-10.6-23.7-23.7-23.7-5.4 0-10.6 1.8-14.8 5.2L464 176 464 336z"/></svg>`,
  audio: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor"><path d="M192 0C139 0 96 43 96 96l0 128c0 53 43 96 96 96s96-43 96-96l0-128c0-53-43-96-96-96zM48 184c0-13.3-10.7-24-24-24S0 170.7 0 184l0 40c0 97.9 73.3 178.7 168 190.5l0 49.5-48 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l144 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-48 0 0-49.5c94.7-11.8 168-92.6 168-190.5l0-40c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 79.5-64.5 144-144 144S48 303.5 48 224l0-40z"/></svg>`,
  fullpage: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM96 96l320 0c17.7 0 32 14.3 32 32l0 256c0 17.7-14.3 32-32 32L96 416c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32zM200 208c0-13.3-10.7-24-24-24l-32 0c-13.3 0-24 10.7-24 24l0 32c0 13.3 10.7 24 24 24s24-10.7 24-24l0-8 8 0c13.3 0 24-10.7 24-24zm192 0c0-13.3-10.7-24-24-24l-32 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l8 0 0 8c0 13.3 10.7 24 24 24s24-10.7 24-24l0-32zm-192 96c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 32c0 13.3 10.7 24 24 24l32 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-8 0 0-8zm192 0c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 8-8 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l32 0c13.3 0 24-10.7 24-24l0-32z"/></svg>`,
  region: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M0 80C0 53.5 21.5 32 48 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L48 96l0 64c0 17.7-14.3 32-32 32s-32-14.3-32-32L0 80zM0 432c0-17.7 14.3-32 32-32l0-64c0-17.7 14.3-32 32-32s32 14.3 32 32l0 64 64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L48 464c-26.5 0-48-21.5-48-48zM464 96l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0c26.5 0 48 21.5 48 48l0 80c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-64zM512 336l0 64c0 26.5-21.5 48-48 48l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0 0-64c0-17.7 14.3-32 32-32s32 14.3 32 32zM176 224l160 0c8.8 0 16 7.2 16 16l0 96c0 8.8-7.2 16-16 16l-160 0c-8.8 0-16-7.2-16-16l0-96c0-8.8 7.2-16 16-16z"/></svg>`,
  chevron_right: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor"><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>`
};

/**
 * Media capture button titles
 */
export const MEDIA_CAPTURE_TITLES = {
  screenshot: "Capture Screenshot",
  video: "Record Screen",
  audio: "Record Audio",
  fullpage: "Capture Full Page",
  region: "Capture Region"
};

/**
 * File type icons
 */
export const FILE_TYPE_ICONS = {
  image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  video: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`,
  audio: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  document: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  archive: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`
};

/**
 * Modal button icons
 */
export const MODAL_BUTTON_ICONS = {
  upload: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  folder: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>',
  none: "",
};

/**
 * PHP-relevant option keys (for server-side validation)
 */
export const PHP_RELEVANT_KEYS = [
  // File type validation
  "allowedExtensions",
  "allowedMimeTypes",
  // File type category extensions (for per-type validation)
  "imageExtensions",
  "videoExtensions",
  "audioExtensions",
  "documentExtensions",
  "archiveExtensions",
  // Size limits
  "perFileMaxSize",
  "perFileMaxSizeDisplay",
  "perFileMaxSizePerType",
  "perFileMaxSizePerTypeDisplay",
  "perTypeMaxTotalSize",
  "perTypeMaxTotalSizeDisplay",
  "perTypeMaxFileCount",
  "totalMaxSize",
  "totalMaxSizeDisplay",
  "maxFiles",
  // Upload directory
  "uploadDir",
];

/**
 * PHP-relevant groups (for server-side validation)
 */
export const PHP_RELEVANT_GROUPS = ["limits", "perTypeLimits", "fileTypes", "urls"];

/**
 * Group changed config options by their category
 * @param {Object} changedConfig - Flat changed config object
 * @returns {Object} - Config grouped by category
 */
export function groupChangedConfig(changedConfig) {
  const grouped = {};

  for (const [key, value] of Object.entries(changedConfig)) {
    const group = OPTION_TO_GROUP[key] || "other";
    if (!grouped[group]) {
      grouped[group] = {};
    }
    grouped[group][key] = value;
  }

  return grouped;
}
