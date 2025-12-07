/**
 * helpers.js
 *
 * Shared utility functions for the FileUploader component.
 * These are pure functions with no side effects.
 *
 * @module helpers
 */

// ============================================================
// FILE SIZE UTILITIES
// ============================================================

/**
 * Format bytes into human-readable file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size (e.g., "1.5 MB")
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

// ============================================================
// FILE TYPE UTILITIES
// ============================================================

/**
 * Get file extension from filename
 * @param {string} filename - The filename
 * @returns {string} Lowercase extension without dot
 */
export function getFileExtension(filename) {
  return filename.split(".").pop().toLowerCase();
}

/**
 * Determine file type category from extension
 * @param {string} extension - File extension
 * @param {Object} options - Options containing extension arrays
 * @returns {string} File type: 'image', 'video', 'audio', 'document', 'archive', or 'other'
 */
export function getFileType(extension, options) {
  if (options.imageExtensions.includes(extension)) {
    return "image";
  } else if (options.videoExtensions.includes(extension)) {
    return "video";
  } else if (options.audioExtensions.includes(extension)) {
    return "audio";
  } else if (options.documentExtensions.includes(extension)) {
    return "document";
  } else if (options.archiveExtensions.includes(extension)) {
    return "archive";
  }
  return "other";
}

// ============================================================
// STRING UTILITIES
// ============================================================

/**
 * Capitalize first letter of a string
 * @param {string} str - Input string
 * @returns {string} String with first letter capitalized
 */
export function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================================
// ALERT FORMATTING
// ============================================================

/**
 * Format alert details with label and chip HTML
 * Used for displaying validation errors with structured information
 * @param {string} label - The label text (e.g., "Allowed:", "Limit:")
 * @param {string|string[]} values - The value(s) to display as chips
 * @returns {string} HTML string with label and chip elements
 */
export function formatAlertDetails(label, values) {
  const chipClass = "file-uploader-alert-details-chip";
  const labelClass = "file-uploader-alert-details-label";

  let chipsHtml;
  if (Array.isArray(values)) {
    chipsHtml = values
      .map((v) => `<span class="${chipClass}">${v}</span>`)
      .join(" ");
  } else {
    chipsHtml = `<span class="${chipClass}">${values}</span>`;
  }

  return `<span class="${labelClass}">${label}</span> ${chipsHtml}`;
}
