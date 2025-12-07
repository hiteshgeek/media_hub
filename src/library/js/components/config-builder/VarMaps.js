/**
 * Config Builder - Variable Maps
 * CSS variable to selector mappings for style highlighting
 */

/**
 * Get mapping of CSS variables to their associated selectors
 * Used for highlighting elements in the preview when editing style variables
 * @returns {Object} Map of CSS variable names to selector strings
 */
export function getVarToSelectorMap() {
  return {
    // Primary colors - dropzone, buttons, links
    "--fu-primary-50": ".file-uploader-dropzone",
    "--fu-primary-100": ".file-uploader-limits-summary",
    "--fu-primary-400": ".file-uploader-dropzone, .file-uploader-btn",
    "--fu-primary-500":
      ".file-uploader-dropzone:hover, .file-uploader-btn:hover",
    "--fu-primary-600": ".file-uploader-type-icon",
    "--fu-color-primary":
      ".file-uploader-dropzone, .file-uploader-btn, .file-uploader-file-link",
    "--fu-color-primary-hover": ".file-uploader-dropzone:hover",
    "--fu-color-primary-light": ".file-uploader-dropzone",

    // Text colors
    "--fu-color-text": ".file-uploader, .file-uploader-file-name, .file-uploader-limits-title",
    "--fu-color-text-muted": ".file-uploader-hint, .file-uploader-file-size",
    "--fu-color-text-light": ".file-uploader-dropzone-text",

    // Background colors
    "--fu-color-bg": ".file-uploader, .file-uploader-file, .file-uploader-type-card",
    "--fu-color-bg-light": ".file-uploader-dropzone, .file-uploader-limits",
    "--fu-color-bg-hover": ".file-uploader-file:hover, .file-uploader-limits-summary, .file-uploader-compact-progress, .file-uploader-type-progress, .file-uploader-general-card-progress",

    // Border colors
    "--fu-color-border": ".file-uploader, .file-uploader-file",
    "--fu-color-border-light": ".file-uploader-dropzone, .file-uploader-limits, .file-uploader-type-card, .file-uploader-type-header",
    "--fu-color-border-hover": ".file-uploader-dropzone:hover",

    // Success colors (palette level)
    "--fu-success-50": ".file-uploader-download",
    "--fu-success-500": ".file-uploader-progress-fill, .file-uploader-type-progress-fill, .file-uploader-limit-progress-fill",
    "--fu-success-600": ".file-uploader-download:hover",
    "--fu-success-700": ".file-uploader-download:active",

    // Status colors (semantic)
    "--fu-color-success":
      ".file-uploader-file-success, .file-uploader-progress-bar",
    "--fu-color-success-bg": ".file-uploader-file-success",
    "--fu-color-success-text": ".file-uploader-file-success",
    "--fu-color-error": ".file-uploader-file-error, .file-uploader-error",
    "--fu-color-error-bg": ".file-uploader-file-error",
    "--fu-color-error-text": ".file-uploader-file-error",
    "--fu-color-error-hover": ".file-uploader-remove:hover",

    // Error colors (palette level)
    "--fu-error-50": ".file-uploader-error-message",
    "--fu-error-100": ".file-uploader-error-details",
    "--fu-error-300": ".file-uploader-type-card.error",
    "--fu-error-500": ".file-uploader-remove",
    "--fu-error-600": ".file-uploader-remove:hover, .file-uploader-type-card.error",
    "--fu-error-700": ".file-uploader-error-icon, .file-uploader-type-card.error",
    "--fu-error-800": ".file-uploader-remove:active",

    // Warning colors (palette level)
    "--fu-warning-400": ".file-uploader-warning-icon",
    "--fu-warning-500": ".file-uploader-type-card.warning",
    "--fu-warning-600": ".file-uploader-type-card.warning",

    // Gray colors (palette level)
    "--fu-gray-50": ".file-uploader-type-card",
    "--fu-gray-100": ".file-uploader-type-header",
    "--fu-gray-200": ".file-uploader-type-divider",
    "--fu-gray-300": ".file-uploader-type-card",
    "--fu-gray-400": ".file-uploader-type-icon.empty",
    "--fu-gray-500": ".file-uploader-file-meta",
    "--fu-gray-600": ".file-uploader-limits-text",

    // Spacing
    "--fu-spacing-xs": ".file-uploader-limits-toggle",
    "--fu-spacing-sm": ".file-uploader-file, .file-uploader-type-header",
    "--fu-spacing-md": ".file-uploader-dropzone, .file-uploader-files, .file-uploader-limits, .file-uploader-type-card",
    "--fu-spacing-lg": ".file-uploader, .file-uploader-limits, .file-uploader-limits-grid",
    "--fu-spacing-xl": ".file-uploader-dropzone",
    "--fu-spacing-2xl": ".file-uploader-files",

    // Typography
    "--fu-font-size-xs": ".file-uploader-limits-toggle, .file-uploader-type-value",
    "--fu-font-size-sm": ".file-uploader-file-size, .file-uploader-hint, .file-uploader-limits-title, .file-uploader-type-name",
    "--fu-font-size-base": ".file-uploader, .file-uploader-file-name",
    "--fu-font-weight-medium": ".file-uploader-limits-title, .file-uploader-type-name",
    "--fu-font-weight-semibold": ".file-uploader-file-name",

    // Border radius
    "--fu-radius-xs": ".file-uploader-compact-progress, .file-uploader-type-progress, .file-uploader-limit-progress",
    "--fu-radius-sm": ".file-uploader-limits-toggle, .file-uploader-type-icon",
    "--fu-radius-md": ".file-uploader-btn, .file-uploader-file, .file-uploader-limits, .file-uploader-type-card",
    "--fu-radius-lg": ".file-uploader, .file-uploader-dropzone",
    "--fu-radius-round": ".file-uploader-remove",

    // Shadows
    "--fu-shadow-sm": ".file-uploader-file",
    "--fu-shadow-md": ".file-uploader-file:hover, .file-uploader-type-card:hover",

    // Transitions
    "--fu-transition-base": ".file-uploader-file, .file-uploader-btn",
    "--fu-transition-fast": ".file-uploader-remove",

    // Component specific
    "--fu-dropzone-padding": ".file-uploader-dropzone",
    "--fu-dropzone-border-width": ".file-uploader-dropzone",
    "--fu-preview-height": ".file-uploader-file-preview",
    "--fu-preview-height-mobile": ".file-uploader-file-preview",
    "--fu-icon-size-sm": ".file-uploader-file-icon",
    "--fu-icon-size-md": ".file-uploader-type-icon",
    "--fu-icon-size-lg": ".file-uploader-dropzone-icon",
    "--fu-icon-size-xl": ".file-uploader-empty-icon",
    "--fu-button-size": ".file-uploader-btn",
    "--fu-spinner-size": ".file-uploader-spinner",
    "--fu-spinner-border-width": ".file-uploader-spinner",
    "--fu-limit-item-width": ".file-uploader-limit-item",
    "--fu-limit-item-width-large": ".file-uploader-limit-item.large",
  };
}

/**
 * Get mapping of semantic variables to their source palette variables
 * This matches the CSS definitions in _variables.scss
 * @returns {Object} Map with 'light' and 'dark' mode mappings
 */
export function getVarSourceMap() {
  return {
    // Light mode semantic -> palette mappings
    light: {
      "--fu-color-primary": "--fu-primary-400",
      "--fu-color-primary-hover": "--fu-primary-500",
      "--fu-color-primary-light": "--fu-primary-50",
      "--fu-color-text": "--fu-gray-700",
      "--fu-color-text-muted": "--fu-gray-500",
      "--fu-color-text-light": "--fu-gray-600",
      "--fu-color-bg-light": "--fu-gray-50",
      "--fu-color-bg-hover": "--fu-primary-50",
      "--fu-color-border": "--fu-gray-300",
      "--fu-color-border-light": "--fu-gray-200",
      "--fu-color-border-hover": "--fu-primary-400",
      "--fu-color-success": "--fu-success-500",
      "--fu-color-success-bg": "--fu-success-100",
      "--fu-color-success-text": "--fu-success-700",
      "--fu-color-error": "--fu-error-500",
      "--fu-color-error-bg": "--fu-error-100",
      "--fu-color-error-text": "--fu-error-700",
      "--fu-color-error-hover": "--fu-error-800",
    },
    // Dark mode semantic -> palette mappings
    dark: {
      "--fu-color-text": "--fu-gray-200",
      "--fu-color-text-muted": "--fu-gray-400",
      "--fu-color-text-light": "--fu-gray-300",
      "--fu-color-bg": "--fu-gray-800",
      "--fu-color-bg-light": "--fu-gray-700",
      "--fu-color-bg-hover": "--fu-primary-900",
      "--fu-color-border": "--fu-gray-600",
      "--fu-color-border-light": "--fu-gray-700",
      "--fu-color-border-hover": "--fu-primary-400",
    },
  };
}
