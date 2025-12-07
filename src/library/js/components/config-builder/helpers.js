/**
 * helpers.js
 * Utility functions for the ConfigBuilder
 * @module helpers
 */

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalizeFirst(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Escape HTML entities
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Convert bytes to specified unit
 * @param {number} bytes - Bytes value
 * @param {string} unit - Target unit (bytes, KB, MB, GB)
 * @returns {number} Converted value
 */
export function bytesToUnit(bytes, unit) {
  switch (unit) {
    case "bytes":
      return bytes;
    case "KB":
      return bytes / 1024;
    case "MB":
      return bytes / (1024 * 1024);
    case "GB":
      return bytes / (1024 * 1024 * 1024);
    default:
      return bytes;
  }
}

/**
 * Convert unit value to bytes
 * @param {number} value - Value in specified unit
 * @param {string} unit - Source unit (bytes, KB, MB, GB)
 * @returns {number} Value in bytes
 */
export function unitToBytes(value, unit) {
  switch (unit) {
    case "bytes":
      return value;
    case "KB":
      return value * 1024;
    case "MB":
      return value * 1024 * 1024;
    case "GB":
      return value * 1024 * 1024 * 1024;
    default:
      return value;
  }
}

/**
 * Convert bytes to best display unit
 * @param {number} bytes - Bytes value
 * @returns {{ value: number, unit: string }} Value and unit
 */
export function bytesToBestUnit(bytes) {
  if (bytes >= 1024 * 1024 * 1024) {
    return { value: bytes / (1024 * 1024 * 1024), unit: "GB" };
  } else if (bytes >= 1024 * 1024) {
    return { value: bytes / (1024 * 1024), unit: "MB" };
  } else if (bytes >= 1024) {
    return { value: bytes / 1024, unit: "KB" };
  }
  return { value: bytes, unit: "bytes" };
}

/**
 * Format bytes value with unit to display string
 * @param {number} value - Numeric value
 * @param {string} unit - Unit (bytes, KB, MB, GB)
 * @returns {string} Formatted display string
 */
export function formatBytesDisplay(value, unit) {
  if (!value || value === 0) return "";
  const formatted = parseFloat(value);
  if (unit === "bytes") {
    return `${formatted} bytes`;
  }
  return `${formatted}${unit}`;
}

/**
 * Format size expression for code output
 * @param {number} bytes - Bytes value
 * @returns {string} Formatted size expression
 */
export function formatSizeExpression(bytes) {
  if (!bytes || bytes === 0) return "0";

  // Check for exact GB values
  if (bytes % (1024 * 1024 * 1024) === 0) {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb} * 1024 * 1024 * 1024`;
  }
  // Check for exact MB values
  if (bytes % (1024 * 1024) === 0) {
    const mb = bytes / (1024 * 1024);
    return `${mb} * 1024 * 1024`;
  }
  // Check for exact KB values
  if (bytes % 1024 === 0) {
    const kb = bytes / 1024;
    return `${kb} * 1024`;
  }
  return String(bytes);
}

/**
 * Check if a key is a size-related key
 * @param {string} key - Option key
 * @returns {boolean} True if size-related
 */
export function isSizeKey(key) {
  const sizeKeys = [
    "perFileMaxSize",
    "totalMaxSize",
    "perFileMaxSizePerType",
    "perTypeMaxTotalSize",
    "maxVideoRecordingFileSize",
    "maxAudioRecordingFileSize",
  ];
  return sizeKeys.includes(key);
}

/**
 * Check if a key is a bitrate-related key
 * @param {string} key - Option key
 * @returns {boolean} True if bitrate-related
 */
export function isBitrateKey(key) {
  const bitrateKeys = ["videoBitsPerSecond", "audioBitsPerSecond"];
  return bitrateKeys.includes(key);
}

/**
 * Format bitrate expression for code output
 * @param {number} bps - Bits per second
 * @returns {string} Formatted bitrate expression
 */
export function formatBitrateExpression(bps) {
  if (!bps || bps === 0) return "0";

  // Check for exact Mbps values
  if (bps % 1000000 === 0) {
    const mbps = bps / 1000000;
    return `${mbps} * 1000000`;
  }
  // Check for exact Kbps values
  if (bps % 1000 === 0) {
    const kbps = bps / 1000;
    return `${kbps} * 1000`;
  }
  return String(bps);
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @param {HTMLElement} btn - Button element for feedback
 */
export async function copyToClipboard(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
    if (btn) {
      btn.classList.add("copied");
      setTimeout(() => btn.classList.remove("copied"), 2000);
    }
  } catch (err) {
    console.error("Failed to copy:", err);
  }
}

/**
 * Download content as a file
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 */
export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Normalize color value for comparison
 * @param {string} value - Color value
 * @returns {string} Normalized color value
 */
export function normalizeColorValue(value) {
  if (!value) return "";

  // Convert to lowercase
  let normalized = value.toLowerCase().trim();

  // Convert rgb/rgba to hex if possible
  if (normalized.startsWith("rgb")) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = normalized;
    normalized = ctx.fillStyle;
  }

  return normalized;
}

/**
 * Get short category name for tabs
 * @param {string} title - Full category title
 * @returns {string} Short name
 */
export function getShortCategoryName(title) {
  const shortNames = {
    "URL Configuration": "URLs",
    "File Size Limits": "Size",
    "Per-Type Limits": "Per-Type",
    "Allowed File Types": "Types",
    "MIME Type Validation (PHP)": "MIME",
    "Upload Behavior": "Behavior",
    "Limits Display": "Limits",
    "Alert Notifications": "Alerts",
    Buttons: "Buttons",
    "Media Capture": "Media",
    "Carousel Preview": "Carousel",
    "Display Mode": "Display",
    "Cross-Uploader Drag & Drop": "Cross",
  };
  return shortNames[title] || title;
}

/**
 * Get short style section name for tabs
 * @param {string} title - Full style section title
 * @returns {string} Short name
 */
export function getShortStyleName(title) {
  const shortNames = {
    "Primary Colors": "Primary",
    "Gray Colors": "Grays",
    "Status Colors": "Status",
    "Semantic Colors (Light Mode)": "Light",
    "Semantic Colors (Dark Mode)": "Dark",
    Spacing: "Spacing",
    Typography: "Type",
    "Border Radius": "Radius",
    Shadows: "Shadows",
    Transitions: "Motion",
    "Component Sizes": "Components",
  };
  return shortNames[title] || title;
}

/**
 * Get mode badge HTML for style sections
 * @param {string} mode - Mode (light, dark, or undefined)
 * @returns {string} Badge HTML
 */
export function getModeBadge(mode) {
  if (!mode) return "";
  const label = mode === "light" ? "Light" : "Dark";
  const icon =
    mode === "light"
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  return `<span class="fu-config-builder-mode-badge mode-${mode}">${icon} ${label}</span>`;
}
