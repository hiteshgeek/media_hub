/**
 * Config Builder - Theme Manager
 * Theme switching and CSS variable application
 */

/**
 * Get theme variable overrides for light/dark mode
 * @param {string} effectiveTheme - 'light' or 'dark'
 * @returns {Object} CSS variable overrides for the theme
 */
export function getThemeVars(effectiveTheme) {
  // Define dark mode CSS variable overrides (matching _variables.scss dark mode)
  // Using actual hex values to ensure proper override regardless of media query state
  const darkModeVars = {
    "--fu-color-text": "#e2e8f0", // --fu-gray-200
    "--fu-color-text-muted": "#a0aec0", // --fu-gray-400
    "--fu-color-text-light": "#cbd5e0", // --fu-gray-300
    "--fu-color-bg": "#1a202c", // --fu-gray-800
    "--fu-color-bg-light": "#374151", // Slightly lighter than container for contrast
    "--fu-color-bg-hover": "#1a365d", // --fu-primary-900
    "--fu-color-border": "#4a5568", // --fu-gray-600
    "--fu-color-border-light": "#4a5568", // Visible border in dark mode
    "--fu-color-border-hover": "#4299e1", // --fu-primary-400
  };

  // Define light mode CSS variable values (defaults from _variables.scss)
  const lightModeVars = {
    "--fu-color-text": "#2d3748", // --fu-gray-700
    "--fu-color-text-muted": "#718096", // --fu-gray-500
    "--fu-color-text-light": "#4a5568", // --fu-gray-600
    "--fu-color-bg": "#ffffff",
    "--fu-color-bg-light": "#f7fafc", // --fu-gray-50
    "--fu-color-bg-hover": "#ebf8ff", // --fu-primary-50
    "--fu-color-border": "#cbd5e0", // --fu-gray-300
    "--fu-color-border-light": "#e2e8f0", // --fu-gray-200
    "--fu-color-border-hover": "#4299e1", // --fu-primary-400
  };

  return effectiveTheme === "dark" ? darkModeVars : lightModeVars;
}

/**
 * Get the effective theme based on theme setting
 * @param {string} theme - 'light', 'dark', or 'system'
 * @returns {string} 'light' or 'dark'
 */
export function getEffectiveTheme(theme) {
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  }
  return theme;
}

/**
 * Apply theme class to container
 * @param {HTMLElement} container - The config builder container
 * @param {string} theme - 'light', 'dark', or 'system'
 * @returns {string} The effective theme that was applied
 */
export function applyThemeClass(container, theme) {
  if (!container) return "light";

  // Remove existing theme classes
  container.classList.remove("theme-light", "theme-dark");

  const effectiveTheme = getEffectiveTheme(theme);
  container.classList.add(`theme-${effectiveTheme}`);
  container.dataset.theme = theme;

  return effectiveTheme;
}

/**
 * Apply theme CSS variables to a container element
 * @param {HTMLElement} container - Container to apply theme to
 * @param {string} effectiveTheme - 'light' or 'dark'
 */
export function applyThemeToContainer(container, effectiveTheme) {
  const themeVars = getThemeVars(effectiveTheme);
  for (const [varName, value] of Object.entries(themeVars)) {
    container.style.setProperty(varName, value);
  }
}

/**
 * Load saved theme from localStorage
 * @param {string} defaultTheme - Default theme if none saved
 * @returns {string} Saved theme or default
 */
export function loadSavedTheme(defaultTheme = "system") {
  return localStorage.getItem("fu-config-builder-theme") || defaultTheme;
}

/**
 * Save theme to localStorage
 * @param {string} theme - Theme to save
 */
export function saveTheme(theme) {
  localStorage.setItem("fu-config-builder-theme", theme);
}
