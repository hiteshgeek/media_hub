/**
 * StyleDefinitions.js
 * CSS variable style definitions for the ConfigBuilder
 * @module StyleDefinitions
 */

// Re-export VarMaps functions for backwards compatibility
export { getVarToSelectorMap, getVarSourceMap } from './VarMaps.js';

/**
 * Get all style variable definitions
 * @returns {Object} Style definitions grouped by section
 */
export function getStyleDefinitions() {
  return {
    primaryColors: {
      title: "Primary Colors",
      icon: "palette",
      variables: {
        "--fu-primary-50": { type: "color", default: "#ebf8ff", label: "Primary 50" },
        "--fu-primary-100": { type: "color", default: "#bee3f8", label: "Primary 100" },
        "--fu-primary-200": { type: "color", default: "#90cdf4", label: "Primary 200" },
        "--fu-primary-300": { type: "color", default: "#63b3ed", label: "Primary 300" },
        "--fu-primary-400": { type: "color", default: "#4299e1", label: "Primary 400" },
        "--fu-primary-500": { type: "color", default: "#3182ce", label: "Primary 500" },
        "--fu-primary-600": { type: "color", default: "#2b6cb0", label: "Primary 600" },
        "--fu-primary-700": { type: "color", default: "#2c5282", label: "Primary 700" },
        "--fu-primary-800": { type: "color", default: "#2a4365", label: "Primary 800" },
        "--fu-primary-900": { type: "color", default: "#1a365d", label: "Primary 900" },
      },
    },
    grayColors: {
      title: "Gray Colors",
      icon: "palette",
      variables: {
        "--fu-gray-50": { type: "color", default: "#f7fafc", label: "Gray 50" },
        "--fu-gray-100": { type: "color", default: "#edf2f7", label: "Gray 100" },
        "--fu-gray-200": { type: "color", default: "#e2e8f0", label: "Gray 200" },
        "--fu-gray-300": { type: "color", default: "#cbd5e0", label: "Gray 300" },
        "--fu-gray-400": { type: "color", default: "#a0aec0", label: "Gray 400" },
        "--fu-gray-500": { type: "color", default: "#718096", label: "Gray 500" },
        "--fu-gray-600": { type: "color", default: "#4a5568", label: "Gray 600" },
        "--fu-gray-700": { type: "color", default: "#2d3748", label: "Gray 700" },
        "--fu-gray-800": { type: "color", default: "#1a202c", label: "Gray 800" },
        "--fu-gray-900": { type: "color", default: "#171923", label: "Gray 900" },
      },
    },
    statusColors: {
      title: "Status Colors",
      icon: "check",
      variables: {
        "--fu-success-50": { type: "color", default: "#f0fff4", label: "Success 50" },
        "--fu-success-100": { type: "color", default: "#c6f6d5", label: "Success 100" },
        "--fu-success-500": { type: "color", default: "#48bb78", label: "Success 500" },
        "--fu-success-600": { type: "color", default: "#38a169", label: "Success 600" },
        "--fu-success-700": { type: "color", default: "#2f855a", label: "Success 700" },
        "--fu-success-800": { type: "color", default: "#276749", label: "Success 800" },
        "--fu-error-50": { type: "color", default: "#fff5f5", label: "Error 50" },
        "--fu-error-100": { type: "color", default: "#fed7d7", label: "Error 100" },
        "--fu-error-500": { type: "color", default: "#fc8181", label: "Error 500" },
        "--fu-error-600": { type: "color", default: "#e53e3e", label: "Error 600" },
        "--fu-error-700": { type: "color", default: "#c53030", label: "Error 700" },
        "--fu-error-800": { type: "color", default: "#9b2c2c", label: "Error 800" },
        "--fu-warning-50": { type: "color", default: "#fffbeb", label: "Warning 50" },
        "--fu-warning-100": { type: "color", default: "#fef3c7", label: "Warning 100" },
        "--fu-warning-400": { type: "color", default: "#fbbf24", label: "Warning 400" },
        "--fu-warning-500": { type: "color", default: "#f59e0b", label: "Warning 500" },
        "--fu-warning-600": { type: "color", default: "#d97706", label: "Warning 600" },
        "--fu-warning-700": { type: "color", default: "#b45309", label: "Warning 700" },
      },
    },
    semanticColorsLight: {
      title: "Semantic Colors (Light Mode)",
      icon: "sun",
      mode: "light",
      variables: {
        "--fu-color-primary": { type: "color", default: "#4299e1", label: "Primary" },
        "--fu-color-primary-hover": { type: "color", default: "#3182ce", label: "Primary Hover" },
        "--fu-color-primary-light": { type: "color", default: "#ebf8ff", label: "Primary Light" },
        "--fu-color-text": { type: "color", default: "#2d3748", label: "Text" },
        "--fu-color-text-muted": { type: "color", default: "#718096", label: "Text Muted" },
        "--fu-color-text-light": { type: "color", default: "#4a5568", label: "Text Light" },
        "--fu-color-bg": { type: "color", default: "#ffffff", label: "Background" },
        "--fu-color-bg-light": { type: "color", default: "#f7fafc", label: "Background Light" },
        "--fu-color-bg-hover": { type: "color", default: "#ebf8ff", label: "Background Hover" },
        "--fu-color-border": { type: "color", default: "#cbd5e0", label: "Border" },
        "--fu-color-border-light": { type: "color", default: "#e2e8f0", label: "Border Light" },
        "--fu-color-border-hover": { type: "color", default: "#4299e1", label: "Border Hover" },
        "--fu-color-success": { type: "color", default: "#48bb78", label: "Success" },
        "--fu-color-success-bg": { type: "color", default: "#c6f6d5", label: "Success Background" },
        "--fu-color-success-text": { type: "color", default: "#2f855a", label: "Success Text" },
        "--fu-color-error": { type: "color", default: "#fc8181", label: "Error" },
        "--fu-color-error-bg": { type: "color", default: "#fed7d7", label: "Error Background" },
        "--fu-color-error-text": { type: "color", default: "#c53030", label: "Error Text" },
        "--fu-color-error-hover": { type: "color", default: "#9b2c2c", label: "Error Hover" },
      },
    },
    semanticColorsDark: {
      title: "Semantic Colors (Dark Mode)",
      icon: "moon",
      mode: "dark",
      variables: {
        "--fu-color-text": { type: "color", default: "#e2e8f0", label: "Text" },
        "--fu-color-text-muted": { type: "color", default: "#a0aec0", label: "Text Muted" },
        "--fu-color-text-light": { type: "color", default: "#cbd5e0", label: "Text Light" },
        "--fu-color-bg": { type: "color", default: "#1a202c", label: "Background" },
        "--fu-color-bg-light": { type: "color", default: "#2d3748", label: "Background Light" },
        "--fu-color-bg-hover": { type: "color", default: "#1a365d", label: "Background Hover" },
        "--fu-color-border": { type: "color", default: "#4a5568", label: "Border" },
        "--fu-color-border-light": { type: "color", default: "#2d3748", label: "Border Light" },
        "--fu-color-border-hover": { type: "color", default: "#4299e1", label: "Border Hover" },
      },
    },
    spacing: {
      title: "Spacing",
      icon: "size",
      variables: {
        "--fu-spacing-xs": { type: "size", default: "4px", label: "Extra Small" },
        "--fu-spacing-sm": { type: "size", default: "8px", label: "Small" },
        "--fu-spacing-md": { type: "size", default: "12px", label: "Medium" },
        "--fu-spacing-lg": { type: "size", default: "16px", label: "Large" },
        "--fu-spacing-xl": { type: "size", default: "20px", label: "Extra Large" },
        "--fu-spacing-2xl": { type: "size", default: "24px", label: "2X Large" },
        "--fu-spacing-3xl": { type: "size", default: "32px", label: "3X Large" },
        "--fu-spacing-4xl": { type: "size", default: "40px", label: "4X Large" },
      },
    },
    typography: {
      title: "Typography",
      icon: "text",
      variables: {
        "--fu-font-size-xs": { type: "size", default: "12px", label: "Font Size XS" },
        "--fu-font-size-sm": { type: "size", default: "13px", label: "Font Size SM" },
        "--fu-font-size-base": { type: "size", default: "14px", label: "Font Size Base" },
        "--fu-font-size-md": { type: "size", default: "16px", label: "Font Size MD" },
        "--fu-font-size-lg": { type: "size", default: "18px", label: "Font Size LG" },
        "--fu-font-size-xl": { type: "size", default: "20px", label: "Font Size XL" },
        "--fu-font-weight-normal": { type: "number", default: "400", label: "Weight Normal" },
        "--fu-font-weight-medium": { type: "number", default: "500", label: "Weight Medium" },
        "--fu-font-weight-semibold": { type: "number", default: "600", label: "Weight Semibold" },
        "--fu-font-weight-bold": { type: "number", default: "700", label: "Weight Bold" },
      },
    },
    borderRadius: {
      title: "Border Radius",
      icon: "window",
      variables: {
        "--fu-radius-xs": { type: "size", default: "3px", label: "Extra Small" },
        "--fu-radius-sm": { type: "size", default: "4px", label: "Small" },
        "--fu-radius-md": { type: "size", default: "6px", label: "Medium" },
        "--fu-radius-lg": { type: "size", default: "8px", label: "Large" },
        "--fu-radius-xl": { type: "size", default: "12px", label: "Extra Large" },
        "--fu-radius-round": { type: "size", default: "50%", label: "Round" },
      },
    },
    shadows: {
      title: "Shadows",
      icon: "layers",
      variables: {
        "--fu-shadow-sm": {
          type: "text",
          default: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          label: "Small Shadow",
        },
        "--fu-shadow-md": {
          type: "text",
          default: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          label: "Medium Shadow",
        },
        "--fu-shadow-lg": {
          type: "text",
          default: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          label: "Large Shadow",
        },
        "--fu-shadow-xl": {
          type: "text",
          default: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          label: "XL Shadow",
        },
      },
    },
    transitions: {
      title: "Transitions",
      icon: "settings",
      variables: {
        "--fu-transition-fast": { type: "text", default: "all 0.15s ease", label: "Fast" },
        "--fu-transition-base": { type: "text", default: "all 0.2s ease", label: "Base" },
        "--fu-transition-slow": { type: "text", default: "all 0.3s ease", label: "Slow" },
      },
    },
    components: {
      title: "Component Sizes",
      icon: "settings",
      variables: {
        "--fu-dropzone-border-width": { type: "size", default: "2px", label: "Dropzone Border" },
        "--fu-preview-height": { type: "size", default: "150px", label: "Preview Height" },
        "--fu-preview-height-mobile": { type: "size", default: "120px", label: "Preview Height Mobile" },
        "--fu-icon-size-sm": { type: "size", default: "18px", label: "Icon Small" },
        "--fu-icon-size-md": { type: "size", default: "20px", label: "Icon Medium" },
        "--fu-icon-size-lg": { type: "size", default: "40px", label: "Icon Large" },
        "--fu-icon-size-xl": { type: "size", default: "48px", label: "Icon XL" },
        "--fu-icon-size-2xl": { type: "size", default: "64px", label: "Icon 2XL" },
        "--fu-button-size": { type: "size", default: "40px", label: "Button Size" },
        "--fu-spinner-size": { type: "size", default: "40px", label: "Spinner Size" },
        "--fu-spinner-border-width": { type: "size", default: "4px", label: "Spinner Border" },
        "--fu-limit-item-width": { type: "size", default: "105px", label: "Limit Item Width" },
        "--fu-limit-item-width-large": { type: "size", default: "150px", label: "Limit Item Width Large" },
      },
    },
  };
}

/**
 * Get default style values from definitions
 * @param {Object} styleDefinitions - Style definitions
 * @returns {Object} Default style values
 */
export function getDefaultStyleValues(styleDefinitions) {
  const values = {};
  for (const section of Object.values(styleDefinitions)) {
    for (const [varName, def] of Object.entries(section.variables)) {
      values[varName] = def.default;
    }
  }
  return values;
}

