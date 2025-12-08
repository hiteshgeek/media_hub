/**
 * FileUploader Config Builder
 * Visual configuration interface for the FileUploader component
 * Allows users to explore all options and generate configuration code
 */

import TooltipManager from "../utils/TooltipManager.js";
import FileUploader from "./FileUploader.js";

// Import from modular config-builder components
import {
  getVarToSelectorMap,
  getVarSourceMap,
} from "./config-builder/VarMaps.js";
import {
  getThemeVars,
  getEffectiveTheme,
  applyThemeToContainer,
  loadSavedTheme,
  saveTheme,
} from "./config-builder/ThemeManager.js";
import {
  buildSearchIndex as buildSearchIndexFn,
  fuzzySearch as fuzzySearchFn,
  highlightMatch,
} from "./config-builder/SearchEngine.js";
import {
  OPTION_TO_GROUP,
  GROUP_TITLES,
  GROUP_ORDER,
  PHP_GROUP_TITLES,
  MEDIA_CAPTURE_ICONS,
  MEDIA_CAPTURE_TITLES,
  FILE_TYPE_ICONS,
  MODAL_BUTTON_ICONS,
  GROUP_HINTS,
  PHP_RELEVANT_KEYS,
  PHP_RELEVANT_GROUPS,
  groupChangedConfig,
} from "./config-builder/Constants.js";
import {
  getFileTypeIcon as getFileTypeIconFn,
  capitalizeFirst as capitalizeFirstFn,
  renderPerTypeLimitsByFileType as renderPerTypeLimitsByFileTypeFn,
  rerenderPerTypeLimitsPanel as rerenderPerTypeLimitsPanelFn,
  attachTypeSizeSliderEvents as attachTypeSizeSliderEventsFn,
  attachTypeCountSliderEvents as attachTypeCountSliderEventsFn,
  attachPerTypeByFileTypeEvents as attachPerTypeByFileTypeEventsFn,
} from "./config-builder/PerTypeLimits.js";
import { getCategoryIcon as getCategoryIconFn } from "./config-builder/Icons.js";
import {
  getOptionDefinitions as getOptionDefinitionsFn,
  getDefaultConfig as getDefaultConfigFn,
} from "./config-builder/OptionDefinitions.js";
import {
  getStyleDefinitions as getStyleDefinitionsFn,
  getDefaultStyleValues as getDefaultStyleValuesFn,
} from "./config-builder/StyleDefinitions.js";
import {
  renderUploaderTabs as renderUploaderTabsFn,
  refreshAllPreviews as refreshAllPreviewsFn,
  addUploader as addUploaderFn,
  duplicateUploader as duplicateUploaderFn,
  selectUploader as selectUploaderFn,
  removeUploader as removeUploaderFn,
  isNameDuplicate as isNameDuplicateFn,
  editUploaderName as editUploaderNameFn,
  updatePreviewHeader as updatePreviewHeaderFn,
  updateUploaderTabsUI as updateUploaderTabsUIFn,
} from "./config-builder/UploaderManager.js";
import {
  attachSearchEvents as attachSearchEventsFn,
  buildSearchIndexForBuilder as buildSearchIndexForBuilderFn,
  fuzzySearchForBuilder as fuzzySearchForBuilderFn,
  renderSearchResults as renderSearchResultsFn,
  hideSearchResults as hideSearchResultsFn,
  navigateToOption as navigateToOptionFn,
} from "./config-builder/SearchUI.js";

/**
 * Get FileUploader's default options (flattened)
 * @returns {Object} Flat object with all default option values
 */
function getFileUploaderDefaults() {
  // Import directly from FileUploader class
  if (FileUploader && typeof FileUploader.getDefaultOptions === "function") {
    const groupedDefaults = FileUploader.getDefaultOptions();
    // Flatten the grouped defaults
    const flat = {};
    for (const category of Object.values(groupedDefaults)) {
      if (
        typeof category === "object" &&
        category !== null &&
        !Array.isArray(category)
      ) {
        Object.assign(flat, category);
      }
    }
    console.log(
      "ConfigBuilder: Loaded defaults from FileUploader:",
      Object.keys(flat).length,
      "options"
    );
    return flat;
  }
  // Fallback: try window.FileUploader (for IIFE)
  if (
    typeof window !== "undefined" &&
    window.FileUploader &&
    typeof window.FileUploader.getDefaultOptions === "function"
  ) {
    const groupedDefaults = window.FileUploader.getDefaultOptions();
    const flat = {};
    for (const category of Object.values(groupedDefaults)) {
      if (
        typeof category === "object" &&
        category !== null &&
        !Array.isArray(category)
      ) {
        Object.assign(flat, category);
      }
    }
    console.log(
      "ConfigBuilder: Loaded defaults from window.FileUploader:",
      Object.keys(flat).length,
      "options"
    );
    return flat;
  }
  // Final fallback: return empty object (will use hardcoded defaults in option definitions)
  console.warn(
    "ConfigBuilder: FileUploader not found, using fallback defaults"
  );
  return {};
}

export default class ConfigBuilder {
  constructor(element, options = {}) {
    this.element =
      typeof element === "string" ? document.querySelector(element) : element;

    if (!this.element) {
      console.error("ConfigBuilder: Element not found:", element);
      return;
    }

    this.options = {
      previewSelector: null, // Selector for preview container
      onConfigChange: null, // Callback when config changes
      ...options,
    };

    // Get FileUploader's default options to use as defaults
    this.fileUploaderDefaults = getFileUploaderDefaults();
    console.log(
      "ConfigBuilder: fileUploaderDefaults loaded:",
      this.fileUploaderDefaults
    );

    // All available options with metadata
    this.optionDefinitions = this.getOptionDefinitions();

    // Current config values
    this.config = this.getDefaultConfig();
    console.log(
      "ConfigBuilder: config initialized with defaults:",
      this.config
    );

    // Current active preset
    this.currentPreset = "default";

    // FileUploader instances for preview (supports multiple)
    this.uploaderInstances = {};
    this.activeUploaderId = null;
    this.uploaderCounter = 0;

    // Slider configuration for size inputs
    this.sliderConfig = {
      minValue: 5, // Minimum value
      maxValue: 500, // Maximum value
      unit: "MB", // Unit for min/max (bytes, KB, MB, GB)
      sliderStep: 50, // Slider step
      buttonStep: 10, // +/- button step
    };

    // Store panel width for persistence across re-renders
    this.optionsPanelWidth = null;

    // Active main tab (config or styles)
    this.activeMainTab = "config";

    // Style variable definitions
    this.styleDefinitions = this.getStyleDefinitions();

    // Current style values (CSS variables)
    this.styleValues = this.getDefaultStyleValues();

    // Highlight mode for showing where CSS variables are applied
    this.highlightMode = false;

    // CSS variable to selector mapping for highlighting
    this.varToSelectorMap = this.getVarToSelectorMap();

    // Theme mode (light, dark, system)
    this.theme = localStorage.getItem("fu-config-builder-theme") || "system";

    // Restore active main tab and category from localStorage
    this.activeMainTab =
      localStorage.getItem("fu-config-builder-main-tab") || "config";
    this.currentCategory =
      localStorage.getItem("fu-config-builder-category") || "urls";
    this.currentStyleSection =
      localStorage.getItem("fu-config-builder-style-section") ||
      "primaryColors";

    this.init();
  }

  /**
   * Get all option definitions with metadata
   * Delegates to OptionDefinitions module
   */
  getOptionDefinitions() {
    return getOptionDefinitionsFn();
  }

  /**
   * Get the default value for an option
   * Prioritizes FileUploader defaults, falls back to hardcoded default
   */
  getOptionDefault(key, fallbackDefault) {
    if (this.fileUploaderDefaults && key in this.fileUploaderDefaults) {
      return structuredClone(this.fileUploaderDefaults[key]);
    }
    return structuredClone(fallbackDefault);
  }

  /**
   * Get default config values
   * Uses optionDefinitions and fileUploaderDefaults
   */
  getDefaultConfig() {
    return getDefaultConfigFn(
      this.optionDefinitions,
      this.fileUploaderDefaults
    );
  }

  /**
   * Get style variable definitions organized by section
   * Delegates to StyleDefinitions module
   */
  getStyleDefinitions() {
    return getStyleDefinitionsFn();
  }

  /**
   * Get default style values
   * Delegates to StyleDefinitions module
   */
  getDefaultStyleValues() {
    return getDefaultStyleValuesFn(this.styleDefinitions);
  }

  /**
   * Get mapping of CSS variables to their associated selectors
   * Delegates to VarMaps module
   */
  getVarToSelectorMap() {
    return getVarToSelectorMap();
  }

  /**
   * Get mapping of semantic variables to their source palette variables
   * Delegates to VarMaps module
   */
  getVarSourceMap() {
    return getVarSourceMap();
  }

  /**
   * Initialize the config builder
   */
  init() {
    this.render();
    this.attachEvents();
    this.initTooltips();
    this.updateCodeOutput();
    this.updatePreview();
    this.applyTheme();
  }

  /**
   * Initialize tooltips for all elements with data-tooltip attribute
   */
  initTooltips() {
    TooltipManager.init(this.element);
  }

  /**
   * Apply theme based on current setting
   */
  applyTheme() {
    const container = this.element.querySelector(".fu-config-builder");
    if (!container) return;

    // Remove existing theme classes
    container.classList.remove("theme-light", "theme-dark");

    let effectiveTheme;
    if (this.theme === "system") {
      // Use system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      effectiveTheme = prefersDark ? "dark" : "light";
    } else {
      effectiveTheme = this.theme;
    }

    container.classList.add(`theme-${effectiveTheme}`);
    container.dataset.theme = this.theme;

    // Apply theme to file uploader preview containers
    this.applyThemeToUploaders(effectiveTheme);
  }

  /**
   * Apply theme CSS variables to all file uploader preview containers
   */
  applyThemeToUploaders(effectiveTheme) {
    // Get all uploader containers in the preview
    const uploaderContainers = this.element.querySelectorAll(
      ".fu-config-builder-uploader-container"
    );
    uploaderContainers.forEach((container) => {
      this.applyThemeToContainer(container, effectiveTheme);
    });
  }

  /**
   * Get theme variable overrides for light/dark mode
   * Delegates to ThemeManager module
   */
  getThemeVars(effectiveTheme) {
    return getThemeVars(effectiveTheme);
  }

  /**
   * Set theme and save to localStorage
   */
  setTheme(theme) {
    this.theme = theme;
    localStorage.setItem("fu-config-builder-theme", theme);
    this.applyTheme();

    // Update active button states
    this.element
      .querySelectorAll(".fu-config-builder-theme-btn")
      .forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.theme === theme);
      });

    // Refresh CSS vars panels to show mode-specific variables
    this.refreshCssVarsPanels();
  }

  /**
   * Refresh all CSS vars panels to reflect current theme mode
   */
  refreshCssVarsPanels() {
    this.element
      .querySelectorAll(".fu-config-builder-css-vars-panel")
      .forEach((panel) => {
        const wrapper = panel.closest("[data-uploader-wrapper]");
        if (wrapper) {
          const containerId = wrapper.querySelector("[data-uploader-container]")
            ?.dataset.uploaderContainer;
          if (containerId) {
            panel.innerHTML = this.renderUsedCssVariables(containerId);
            this.attachCssVarsPanelEvents(panel);
          }
        }
      });
  }

  /**
   * Render the config builder UI
   */
  render() {
    // Get category keys and validate saved category exists
    const categoryKeys = Object.keys(this.optionDefinitions);
    const firstCategoryKey = categoryKeys[0] || "urls";

    // Use saved category if valid, otherwise use first category
    const activeCategory = categoryKeys.includes(this.currentCategory)
      ? this.currentCategory
      : firstCategoryKey;

    this.element.innerHTML = `
      <div class="fu-config-builder theme-${this.getEffectiveThemeMode()}" data-theme="${
      this.theme
    }">
        <div class="fu-config-builder-header">
          <div class="fu-config-builder-header-left">
            <div class="fu-config-builder-header-title">
              <svg viewBox="0 0 640 640" fill="currentColor"><path d="M352 96C352 78.3 337.7 64 320 64C302.3 64 288 78.3 288 96L288 306.7L246.6 265.3C234.1 252.8 213.8 252.8 201.3 265.3C188.8 277.8 188.8 298.1 201.3 310.6L297.3 406.6C309.8 419.1 330.1 419.1 342.6 406.6L438.6 310.6C451.1 298.1 451.1 277.8 438.6 265.3C426.1 252.8 405.8 252.8 393.3 265.3L352 306.7L352 96zM160 384C124.7 384 96 412.7 96 448L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 448C544 412.7 515.3 384 480 384L433.1 384L376.5 440.6C345.3 471.8 294.6 471.8 263.4 440.6L206.9 384L160 384zM464 440C477.3 440 488 450.7 488 464C488 477.3 477.3 488 464 488C450.7 488 440 477.3 440 464C440 450.7 450.7 440 464 440z"/></svg>
              <span>FileUploader Config Builder</span>
            </div>
            <div class="fu-config-builder-theme-switcher" id="theme-switcher">
              <button class="fu-config-builder-theme-btn ${
                this.theme === "light" ? "active" : ""
              }" data-theme="light" data-tooltip="Light Mode" data-tooltip-position="bottom">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              </button>
              <button class="fu-config-builder-theme-btn ${
                this.theme === "dark" ? "active" : ""
              }" data-theme="dark" data-tooltip="Dark Mode" data-tooltip-position="bottom">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              </button>
              <button class="fu-config-builder-theme-btn ${
                this.theme === "system" ? "active" : ""
              }" data-theme="system" data-tooltip="System Default" data-tooltip-position="bottom">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              </button>
            </div>
          </div>
          <div class="fu-config-builder-header-actions">
            <a href="index.php" data-tooltip="FileUploader Home" data-tooltip-position="bottom">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
              Home
            </a>
            <a href="usage/demo-modular-library.php" data-tooltip="View Demos" data-tooltip-position="bottom">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Demos
            </a>
            <a href="../../index.php" data-tooltip="All Projects" data-tooltip-position="bottom">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              All Projects
            </a>
          </div>
        </div>

        <div class="fu-config-builder-panels">
          <!-- Options Panel with Vertical Tabs -->
          <div class="fu-config-builder-panel fu-config-builder-options" id="options-panel">
            <div class="fu-config-builder-panel-header">
              <!-- Main Tabs: Config / Styles -->
              <div class="fu-config-builder-main-tabs">
                <button class="fu-config-builder-main-tab ${
                  this.activeMainTab === "config" ? "active" : ""
                }" data-main-tab="config">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/><path d="M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2"/><path d="M19 11h2m-1 -1v2"/></svg>
                  Configuration
                </button>
                <button class="fu-config-builder-main-tab ${
                  this.activeMainTab === "styles" ? "active" : ""
                }" data-main-tab="styles" id="styles-main-tab">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21a9 9 0 0 1 0 -18c4.97 0 9 3.582 9 8c0 1.06 -.474 2.078 -1.318 2.828c-.844 .75 -1.989 1.172 -3.182 1.172h-2.5a2 2 0 0 0 -1 3.75a1.3 1.3 0 0 1 -1 2.25"/><circle cx="8.5" cy="10.5" r="1"/><circle cx="12.5" cy="7.5" r="1"/><circle cx="16.5" cy="10.5" r="1"/></svg>
                  Styles
                  <span class="fu-config-builder-custom-indicator" id="styles-custom-indicator"></span>
                </button>
              </div>
            </div>
            <div class="fu-config-builder-panel-content">
              <!-- Config Tab Content -->
              <div class="fu-config-builder-main-tab-content ${
                this.activeMainTab === "config" ? "active" : ""
              }" id="main-tab-config">
                <!-- Vertical Tabs -->
                <div class="fu-config-builder-vertical-tabs">
                  ${this.renderVerticalTabs(activeCategory)}
                </div>

                <!-- Options Content -->
                <div class="fu-config-builder-options-content">
                  <!-- Search -->
                  <div class="fu-config-builder-search">
                    <div class="fu-config-builder-search-wrapper">
                      <svg class="fu-config-builder-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                      </svg>
                      <input type="text" class="fu-config-builder-search-input" id="option-search" placeholder="Search options..." autocomplete="off">
                      <button type="button" class="fu-config-builder-search-clear" id="search-clear" style="display: none;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                    <div class="fu-config-builder-search-results" id="search-results" style="display: none;"></div>
                  </div>

                  <!-- Presets -->
                  <div class="fu-config-builder-presets">
                    <button class="fu-config-builder-preset ${
                      this.currentPreset === "custom" ? "active" : ""
                    }" data-preset="custom">Custom</button>
                    <button class="fu-config-builder-preset ${
                      this.currentPreset === "default" ? "active" : ""
                    }" data-preset="default">Default</button>
                    <button class="fu-config-builder-preset ${
                      this.currentPreset === "minimal" ? "active" : ""
                    }" data-preset="minimal">Minimal</button>
                    <button class="fu-config-builder-preset ${
                      this.currentPreset === "images-only" ? "active" : ""
                    }" data-preset="images-only">Images Only</button>
                    <button class="fu-config-builder-preset ${
                      this.currentPreset === "documents" ? "active" : ""
                    }" data-preset="documents">Documents</button>
                    <button class="fu-config-builder-preset ${
                      this.currentPreset === "media" ? "active" : ""
                    }" data-preset="media">Media</button>
                    <button class="fu-config-builder-preset ${
                      this.currentPreset === "single-file" ? "active" : ""
                    }" data-preset="single-file">Single File</button>
                  </div>

                  <!-- Category Panels -->
                  ${this.renderCategoryPanels(activeCategory)}
                </div>
              </div>

              <!-- Styles Tab Content -->
              <div class="fu-config-builder-main-tab-content ${
                this.activeMainTab === "styles" ? "active" : ""
              }" id="main-tab-styles">
                <!-- Style Vertical Tabs with Reset at bottom -->
                <div class="fu-config-builder-vertical-tabs fu-config-builder-style-tabs">
                  ${this.renderStyleVerticalTabs()}
                  <div class="fu-config-builder-vertical-tabs-spacer"></div>
                  <button class="fu-config-builder-reset-styles-btn" id="reset-styles" data-tooltip="Reset All Styles" data-tooltip-position="right">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/></svg>
                    <span>Reset</span>
                  </button>
                </div>

                <!-- Style Options Content -->
                <div class="fu-config-builder-options-content">
                  <!-- Highlight Toggle -->
                  <div class="fu-config-builder-style-toolbar">
                    <label class="fu-config-builder-highlight-toggle">
                      <input type="checkbox" id="highlight-toggle">
                      <span class="fu-config-builder-highlight-toggle-slider"></span>
                      <span class="fu-config-builder-highlight-toggle-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                        Highlight in Preview
                      </span>
                    </label>
                  </div>

                  <!-- Style Section Panels -->
                  ${this.renderStylePanels()}
                </div>
              </div>
            </div>
          </div>

          <!-- Resizer Handle -->
          <div class="fu-config-builder-resizer" id="panel-resizer"></div>

          <!-- Preview Panel -->
          <div class="fu-config-builder-panel fu-config-builder-preview">
            <div class="fu-config-builder-panel-header">
              <h2>Preview & Code</h2>
            </div>
            <div class="fu-config-builder-panel-content">
              <!-- Tabs -->
              <div class="fu-config-builder-tabs">
                <button class="fu-config-builder-tab active" data-tab="preview">Live Preview</button>
                <button class="fu-config-builder-tab" data-tab="code-js">JavaScript</button>
                <button class="fu-config-builder-tab" data-tab="code-php">PHP</button>
                <button class="fu-config-builder-tab fu-config-builder-modal-tab" data-tab="code-modal" style="display: none;">Modal</button>
                <button class="fu-config-builder-tab" data-tab="code-css">CSS Variables</button>
              </div>

              <!-- Preview Tab -->
              <div class="fu-config-builder-tab-content active" id="tab-preview">
                <!-- Uploader Selector -->
                <div class="fu-config-builder-uploader-selector">
                  <button class="fu-config-builder-add-uploader has-tooltip" id="add-uploader" data-tooltip="Add new uploader" data-tooltip-position="right">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                  <div class="fu-config-builder-uploader-list" id="uploader-list">
                    ${this.renderUploaderTabs()}
                  </div>
                </div>
                <div class="fu-config-builder-preview-area" id="uploader-preview"></div>
              </div>

              <!-- JavaScript Code Tab -->
              <div class="fu-config-builder-tab-content" id="tab-code-js">
                <div class="fu-config-builder-code-cards" id="js-code-cards"></div>
              </div>

              <!-- PHP Code Tab -->
              <div class="fu-config-builder-tab-content" id="tab-code-php">
                <div class="fu-config-builder-code-cards" id="php-code-cards"></div>
              </div>

              <!-- Modal Code Tab (HTML + CSS + JS for modal implementation) -->
              <div class="fu-config-builder-tab-content" id="tab-code-modal">
                <div class="fu-config-builder-modal-subtabs">
                  <div class="fu-config-builder-modal-subtab-btns">
                    <button class="fu-config-builder-modal-subtab-btn active" data-modal-subtab="html">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <path d="M4 7h16M4 12h16M4 17h8"/>
                      </svg>
                      HTML
                    </button>
                    <button class="fu-config-builder-modal-subtab-btn" data-modal-subtab="css">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                      CSS
                    </button>
                    <button class="fu-config-builder-modal-subtab-btn" data-modal-subtab="js">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
                      </svg>
                      JavaScript
                    </button>
                  </div>
                  <div class="fu-config-builder-modal-subtab-content active" id="modal-subtab-html">
                    <div class="fu-config-builder-code-cards" id="modal-html-cards"></div>
                  </div>
                  <div class="fu-config-builder-modal-subtab-content" id="modal-subtab-css">
                    <div class="fu-config-builder-code-cards" id="modal-css-cards"></div>
                  </div>
                  <div class="fu-config-builder-modal-subtab-content" id="modal-subtab-js">
                    <div class="fu-config-builder-code-cards" id="modal-js-cards"></div>
                  </div>
                </div>
              </div>

              <!-- CSS Variables Tab -->
              <div class="fu-config-builder-tab-content" id="tab-code-css">
                <div class="fu-config-builder-code-cards">
                  <div class="fu-config-builder-code-card active">
                    <div class="fu-config-builder-code">
                      <div class="fu-config-builder-code-header">
                        <span class="fu-config-builder-code-title">Custom CSS Variables</span>
                        <div class="fu-config-builder-code-actions">
                          <button class="fu-config-builder-code-btn" id="copy-css" data-tooltip="Copy to clipboard" data-tooltip-position="top">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                            Copy
                          </button>
                          <button class="fu-config-builder-code-btn" id="download-css" data-tooltip="Download CSS file" data-tooltip-position="top">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            Download
                          </button>
                        </div>
                      </div>
                      <div class="fu-config-builder-code-content">
                        <pre id="css-code-output"></pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Initialize current category (use validated activeCategory)
    this.currentCategory = activeCategory;
  }

  /**
   * Render vertical tabs for categories
   */
  renderVerticalTabs(activeCategory) {
    let html = "";
    for (const [categoryKey, category] of Object.entries(
      this.optionDefinitions
    )) {
      const isActive = categoryKey === activeCategory;
      html += `
        <button class="fu-config-builder-vertical-tab ${
          isActive ? "active" : ""
        }" data-category="${categoryKey}" data-tooltip="${
        category.title
      }" data-tooltip-position="right">
          ${this.getCategoryIcon(category.icon)}
          <span class="fu-config-builder-vertical-tab-label">${this.getShortCategoryName(
            category.title
          )}</span>
        </button>
      `;
    }
    return html;
  }

  /**
   * Get short category name for vertical tab
   */
  getShortCategoryName(title) {
    const shortNames = {
      "URL Configuration": "URLs",
      "File Size Limits": "Sizes",
      "Per-Type Limits": "Types",
      "Allowed File Types": "Files",
      "MIME Type Validation (PHP)": "MIME",
      "Upload Behavior": "Behavior",
      "Limits Display": "Limits",
      "Alert Notifications": "Alerts",
      Buttons: "Buttons",
      "Media Capture": "Media",
      "Carousel Preview": "Carousel",
      "Cross-Uploader Drag & Drop": "Cross",
    };
    return shortNames[title] || title.split(" ")[0];
  }

  /**
   * Render vertical tabs for style sections
   */
  renderStyleVerticalTabs() {
    const sectionKeys = Object.keys(this.styleDefinitions);
    const firstSection = this.currentStyleSection || sectionKeys[0];

    let html = "";
    for (const [sectionKey, section] of Object.entries(this.styleDefinitions)) {
      const isActive = sectionKey === firstSection;
      const modeClass = section.mode ? `mode-${section.mode}` : "";
      html += `
        <button class="fu-config-builder-vertical-tab ${
          isActive ? "active" : ""
        } ${modeClass}" data-style-section="${sectionKey}" data-tooltip="${
        section.title
      }" data-tooltip-position="right">
          ${this.getCategoryIcon(section.icon)}
          <span class="fu-config-builder-vertical-tab-label">${this.getShortStyleName(
            section.title
          )}</span>
        </button>
      `;
    }
    return html;
  }

  /**
   * Get short style section name for vertical tab
   */
  getShortStyleName(title) {
    const shortNames = {
      "Primary Colors": "Primary",
      "Gray Colors": "Gray",
      "Status Colors": "Status",
      "Semantic Colors (Light Mode)": "Light",
      "Semantic Colors (Dark Mode)": "Dark",
      Spacing: "Space",
      Typography: "Type",
      "Border Radius": "Radius",
      Shadows: "Shadow",
      Transitions: "Trans",
      "Component Sizes": "Comps",
    };
    return shortNames[title] || title.split(" ")[0];
  }

  /**
   * Get mode badge HTML for style sections
   */
  getModeBadge(mode) {
    if (!mode) return "";
    const icon =
      mode === "light"
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    const label = mode === "light" ? "Light Mode" : "Dark Mode";
    return `<span class="fu-config-builder-mode-badge mode-${mode}">${icon} ${label}</span>`;
  }

  /**
   * Render style section panels
   */
  renderStylePanels() {
    const sectionKeys = Object.keys(this.styleDefinitions);
    const firstSection = this.currentStyleSection || sectionKeys[0];

    let html = "";
    for (const [sectionKey, section] of Object.entries(this.styleDefinitions)) {
      const isActive = sectionKey === firstSection;
      const modeClass = section.mode ? `mode-${section.mode}` : "";
      html += `
        <div class="fu-config-builder-category-panel fu-config-builder-style-panel ${
          isActive ? "active" : ""
        } ${modeClass}" data-style-panel="${sectionKey}">
          <div class="fu-config-builder-category-panel-header">
            <h3>${section.title}</h3>
            ${this.getModeBadge(section.mode)}
          </div>
          <div class="fu-config-builder-style-variables">
            ${this.renderStyleVariables(section.variables)}
          </div>
        </div>
      `;
    }
    return html;
  }

  /**
   * Render style variable inputs
   */
  renderStyleVariables(variables) {
    let html = "";

    // Get computed styles from the DOM for actual values
    // Style variables are defined at :root level, so use document.documentElement
    const computedStyles = getComputedStyle(document.documentElement);

    for (const [varName, def] of Object.entries(variables)) {
      // Get actual computed value from DOM
      const computedValue = computedStyles.getPropertyValue(varName).trim();
      // Use user-modified value if exists, otherwise use computed value, then fall back to default
      const currentValue =
        this.styleValues[varName] || computedValue || def.default;

      if (def.type === "color") {
        html += `
          <div class="fu-config-builder-style-var" data-var="${varName}">
            <div class="fu-config-builder-style-var-header">
              <label class="fu-config-builder-style-var-label">${def.label}</label>
              <code class="fu-config-builder-style-var-name">${varName}</code>
            </div>
            <div class="fu-config-builder-style-var-input">
              <input type="color" class="fu-config-builder-color-picker" data-var="${varName}" value="${currentValue}">
              <input type="text" class="fu-config-builder-color-text" data-var="${varName}" value="${currentValue}" placeholder="#000000">
            </div>
          </div>
        `;
      } else if (def.type === "size") {
        html += `
          <div class="fu-config-builder-style-var" data-var="${varName}">
            <div class="fu-config-builder-style-var-header">
              <label class="fu-config-builder-style-var-label">${def.label}</label>
              <code class="fu-config-builder-style-var-name">${varName}</code>
            </div>
            <div class="fu-config-builder-style-var-input">
              <input type="text" class="fu-config-builder-size-input" data-var="${varName}" value="${currentValue}" placeholder="12px">
            </div>
          </div>
        `;
      } else if (def.type === "number") {
        html += `
          <div class="fu-config-builder-style-var" data-var="${varName}">
            <div class="fu-config-builder-style-var-header">
              <label class="fu-config-builder-style-var-label">${def.label}</label>
              <code class="fu-config-builder-style-var-name">${varName}</code>
            </div>
            <div class="fu-config-builder-style-var-input">
              <input type="number" class="fu-config-builder-number-input" data-var="${varName}" value="${currentValue}" min="100" max="900" step="100">
            </div>
          </div>
        `;
      } else if (def.type === "text") {
        html += `
          <div class="fu-config-builder-style-var" data-var="${varName}">
            <div class="fu-config-builder-style-var-header">
              <label class="fu-config-builder-style-var-label">${def.label}</label>
              <code class="fu-config-builder-style-var-name">${varName}</code>
            </div>
            <div class="fu-config-builder-style-var-input">
              <input type="text" class="fu-config-builder-text-input" data-var="${varName}" value="${currentValue}" placeholder="${def.default}">
            </div>
          </div>
        `;
      }
    }
    return html;
  }

  /**
   * Generate CSS output for style variables
   */
  generateCssOutput() {
    const defaults = this.getDefaultStyleValues();
    const changedVars = {};

    // Find changed values
    for (const [varName, value] of Object.entries(this.styleValues)) {
      if (value !== defaults[varName]) {
        changedVars[varName] = value;
      }
    }

    if (Object.keys(changedVars).length === 0) {
      return "/* No style changes - using default CSS variables */\n\n:root {\n  /* All values are at defaults */\n}";
    }

    let css = "/* Custom FileUploader CSS Variables */\n";
    css += "/* Add this to your stylesheet to override defaults */\n\n";
    css += ":root {\n";

    for (const [varName, value] of Object.entries(changedVars)) {
      css += `  ${varName}: ${value};\n`;
    }

    css += "}\n";

    return css;
  }

  /**
   * Check if styles have been customized
   */
  hasCustomStyles() {
    const defaults = this.getDefaultStyleValues();
    for (const [varName, value] of Object.entries(this.styleValues)) {
      if (value !== defaults[varName]) {
        return true;
      }
    }
    return false;
  }

  /**
   * Update the custom styles indicator
   */
  updateCustomIndicator() {
    const indicator = this.element.querySelector("#styles-custom-indicator");
    const stylesTab = this.element.querySelector("#styles-main-tab");

    if (indicator && stylesTab) {
      if (this.hasCustomStyles()) {
        indicator.classList.add("visible");
        stylesTab.classList.add("has-custom");
      } else {
        indicator.classList.remove("visible");
        stylesTab.classList.remove("has-custom");
      }
    }
  }

  /**
   * Update CSS output display
   */
  updateCssOutput() {
    const cssOutput = this.element.querySelector("#css-code-output");
    if (cssOutput) {
      cssOutput.textContent = this.generateCssOutput();
    }
    this.updateCustomIndicator();
  }

  /**
   * Apply style variables to preview
   */
  applyStylesToPreview() {
    const previewArea = this.element.querySelector("#uploader-preview");
    if (previewArea) {
      for (const [varName, value] of Object.entries(this.styleValues)) {
        previewArea.style.setProperty(varName, value);
      }
    }
  }

  /**
   * Reset styles to defaults
   */
  resetStyles() {
    this.styleValues = this.getDefaultStyleValues();
    this.applyStylesToPreview();
    this.updateCssOutput();

    // Update all input fields
    this.element
      .querySelectorAll(
        ".fu-config-builder-color-picker, .fu-config-builder-color-text"
      )
      .forEach((input) => {
        const varName = input.dataset.var;
        if (varName && this.styleValues[varName]) {
          input.value = this.styleValues[varName];
        }
      });

    this.element
      .querySelectorAll(
        ".fu-config-builder-size-input, .fu-config-builder-number-input, .fu-config-builder-text-input"
      )
      .forEach((input) => {
        const varName = input.dataset.var;
        if (varName && this.styleValues[varName]) {
          input.value = this.styleValues[varName];
        }
      });
  }

  /**
   * Highlight elements in preview that use a specific CSS variable
   */
  highlightElements(varName) {
    const previewArea = this.element.querySelector("#uploader-preview");
    if (!previewArea) return;

    const selector = this.varToSelectorMap[varName];
    if (!selector) return;

    // Remove pseudo-selectors for querySelectorAll
    const cleanSelector = selector
      .split(",")
      .map((s) => s.trim().replace(/:hover|:focus|:active/g, ""))
      .filter((s) => s)
      .join(", ");

    try {
      const elements = previewArea.querySelectorAll(cleanSelector);
      elements.forEach((el) => {
        el.classList.add("fu-highlight-glow");
      });
    } catch (e) {
      // Invalid selector, ignore
    }
  }

  /**
   * Clear all highlights from preview
   */
  clearHighlights() {
    const previewArea = this.element.querySelector("#uploader-preview");
    if (!previewArea) return;

    previewArea.querySelectorAll(".fu-highlight-glow").forEach((el) => {
      el.classList.remove("fu-highlight-glow");
    });
  }

  /**
   * Render category panels for vertical tabs
   */
  renderCategoryPanels(activeCategory) {
    let html = "";
    for (const [categoryKey, category] of Object.entries(
      this.optionDefinitions
    )) {
      const isActive = categoryKey === activeCategory;
      const sliderConfigHtml =
        categoryKey === "sizeLimits" ? this.renderSliderConfig() : "";
      const perTypeLimitsConfigHtml =
        categoryKey === "perTypeLimits" ? this.renderPerTypeLimitsConfig() : "";

      // Render category content based on view mode
      let categoryContent;
      if (categoryKey === "perTypeLimits") {
        categoryContent = this.renderPerTypeLimitsContent(category.options);
      } else {
        categoryContent = this.renderCategoryOptions(category.options);
      }

      html += `
        <div class="fu-config-builder-category-panel ${
          isActive ? "active" : ""
        }" data-category-panel="${categoryKey}">
          <div class="fu-config-builder-category-panel-header">
            <h3>${category.title}</h3>
          </div>
          ${sliderConfigHtml}
          ${perTypeLimitsConfigHtml}
          <div class="fu-config-builder-category-options">
            ${categoryContent}
          </div>
        </div>
      `;
    }
    return html;
  }

  /**
   * Render slider configuration panel
   */
  renderSliderConfig() {
    const units = ["bytes", "KB", "MB", "GB"];
    const unitOptions = units
      .map(
        (u) =>
          `<option value="${u}" ${
            this.sliderConfig.unit === u ? "selected" : ""
          }>${u}</option>`
      )
      .join("");

    return `
      <div class="fu-config-builder-slider-config">
        <div class="fu-config-builder-slider-config-item fu-config-builder-slider-config-unit-item">
          <label>Unit</label>
          <select id="slider-config-unit" class="fu-config-builder-slider-config-unit">
            ${unitOptions}
          </select>
        </div>
        <div class="fu-config-builder-slider-config-item">
          <label>Min (${this.sliderConfig.unit})</label>
          <input type="number" id="slider-config-min" value="${this.sliderConfig.minValue}" min="1" max="10000">
        </div>
        <div class="fu-config-builder-slider-config-item">
          <label>Max (${this.sliderConfig.unit})</label>
          <input type="number" id="slider-config-max" value="${this.sliderConfig.maxValue}" min="10" max="100000">
        </div>
        <div class="fu-config-builder-slider-config-item">
          <label>Slider Step</label>
          <input type="number" id="slider-config-step" value="${this.sliderConfig.sliderStep}" min="1" max="1000">
        </div>
        <div class="fu-config-builder-slider-config-item">
          <label>+/- Step</label>
          <input type="number" id="slider-config-btn-step" value="${this.sliderConfig.buttonStep}" min="1" max="100">
        </div>
      </div>
    `;
  }

  /**
   * Render per-type limits configuration panel with view toggle
   */
  renderPerTypeLimitsConfig() {
    const viewMode = this.perTypeLimitsViewMode || "byLimitType";
    const units = ["bytes", "KB", "MB", "GB"];
    const unitOptions = units
      .map(
        (u) =>
          `<option value="${u}" ${
            this.sliderConfig.unit === u ? "selected" : ""
          }>${u}</option>`
      )
      .join("");

    return `
      <div class="fu-config-builder-pertype-config">
        <div class="fu-config-builder-pertype-view-toggle">
          <span class="fu-config-builder-pertype-view-label">Group by:</span>
          <div class="fu-config-builder-pertype-view-buttons">
            <button type="button" class="fu-config-builder-pertype-view-btn ${
              viewMode === "byLimitType" ? "active" : ""
            }" data-view="byLimitType">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
              By Limit Type
            </button>
            <button type="button" class="fu-config-builder-pertype-view-btn ${
              viewMode === "byFileType" ? "active" : ""
            }" data-view="byFileType">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 4h6a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2H9a2 2 0 0 1 -2 -2V6a2 2 0 0 1 2 -2z"/><path d="M9 4v0a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0"/></svg>
              By File Type
            </button>
          </div>
        </div>
        <div class="fu-config-builder-slider-config">
          <div class="fu-config-builder-slider-config-item fu-config-builder-slider-config-unit-item">
            <label>Unit</label>
            <select id="pertype-slider-config-unit" class="fu-config-builder-slider-config-unit">
              ${unitOptions}
            </select>
          </div>
          <div class="fu-config-builder-slider-config-item">
            <label>Min (${this.sliderConfig.unit})</label>
            <input type="number" id="pertype-slider-config-min" value="${
              this.sliderConfig.minValue
            }" min="1" max="10000">
          </div>
          <div class="fu-config-builder-slider-config-item">
            <label>Max (${this.sliderConfig.unit})</label>
            <input type="number" id="pertype-slider-config-max" value="${
              this.sliderConfig.maxValue
            }" min="10" max="100000">
          </div>
          <div class="fu-config-builder-slider-config-item">
            <label>Slider Step</label>
            <input type="number" id="pertype-slider-config-step" value="${
              this.sliderConfig.sliderStep
            }" min="1" max="1000">
          </div>
          <div class="fu-config-builder-slider-config-item">
            <label>+/- Step</label>
            <input type="number" id="pertype-slider-config-btn-step" value="${
              this.sliderConfig.buttonStep
            }" min="1" max="100">
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render per-type limits content based on view mode
   */
  renderPerTypeLimitsContent(options) {
    const viewMode = this.perTypeLimitsViewMode || "byLimitType";

    if (viewMode === "byFileType") {
      return this.renderPerTypeLimitsByFileType(options);
    }

    // Default: by limit type (current behavior)
    return this.renderCategoryOptions(options);
  }

  /**
   * Render per-type limits grouped by file type
   * Delegates to PerTypeLimits module
   */
  renderPerTypeLimitsByFileType(options) {
    return renderPerTypeLimitsByFileTypeFn(this, options);
  }

  /**
   * Get file type icon
   * Delegates to PerTypeLimits module
   */
  getFileTypeIcon(type) {
    return getFileTypeIconFn(type);
  }

  /**
   * Capitalize first letter
   * Delegates to PerTypeLimits module
   */
  capitalizeFirst(str) {
    return capitalizeFirstFn(str);
  }

  /**
   * Re-render the perTypeLimits panel content when view mode changes
   * Delegates to PerTypeLimits module
   */
  rerenderPerTypeLimitsPanel() {
    return rerenderPerTypeLimitsPanelFn(this);
  }

  /**
   * Attach events for type size sliders within a container
   * Delegates to PerTypeLimits module
   */
  attachTypeSizeSliderEvents(container) {
    return attachTypeSizeSliderEventsFn(this, container);
  }

  /**
   * Attach events for type count sliders within a container
   * Delegates to PerTypeLimits module
   */
  attachTypeCountSliderEvents(container) {
    return attachTypeCountSliderEventsFn(this, container);
  }

  /**
   * Attach events for "By File Type" view sliders
   * Delegates to PerTypeLimits module
   */
  attachPerTypeByFileTypeEvents() {
    return attachPerTypeByFileTypeEventsFn(this);
  }

  /**
   * Render uploader tabs for preview selector
   * Delegates to UploaderManager module
   */
  renderUploaderTabs() {
    return renderUploaderTabsFn(this);
  }

  /**
   * Render all categories
   */
  renderCategories() {
    let html = "";

    for (const [categoryKey, category] of Object.entries(
      this.optionDefinitions
    )) {
      html += `
        <div class="fu-config-builder-category" data-category="${categoryKey}">
          <div class="fu-config-builder-category-header">
            ${this.getCategoryIcon(category.icon)}
            <span class="fu-config-builder-category-title">${
              category.title
            }</span>
            <svg class="fu-config-builder-category-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
          <div class="fu-config-builder-category-content">
            ${this.renderCategoryOptions(category.options)}
          </div>
        </div>
      `;
    }

    return html;
  }

  /**
   * Render options for a category
   */
  renderCategoryOptions(options) {
    let html = "";

    // Check if any options have groups
    const hasGroups = Object.values(options).some((def) => def.group);

    if (hasGroups) {
      // Collect options by group (preserving order)
      const groups = new Map();
      const ungrouped = [];

      for (const [key, def] of Object.entries(options)) {
        if (def.group) {
          if (!groups.has(def.group)) {
            groups.set(def.group, []);
          }
          groups.get(def.group).push({ key, def });
        } else {
          ungrouped.push({ key, def });
        }
      }

      // Render ungrouped options first (if any)
      for (const { key, def } of ungrouped) {
        html += this.renderOption(key, def);
      }

      // Render grouped options
      for (const [groupName, groupOptions] of groups) {
        const groupHint = GROUP_HINTS[groupName] || "";
        const hintHtml = groupHint
          ? `<span class="fu-config-builder-option-group-hint">${groupHint}</span>`
          : "";

        html += `<div class="fu-config-builder-option-group">
          <div class="fu-config-builder-option-group-title">${groupName}${hintHtml}</div>
          <div class="fu-config-builder-option-group-content">`;

        for (const { key, def } of groupOptions) {
          html += this.renderOption(key, def);
        }

        html += `</div></div>`;
      }
    } else {
      // No groups, render all options directly
      for (const [key, def] of Object.entries(options)) {
        html += this.renderOption(key, def);
      }
    }

    return html;
  }

  /**
   * Check if an option's dependency is satisfied (controls disabled state)
   * Note: This only checks dependsOn, NOT showWhen.
   * showWhen controls visibility, dependsOn controls enabled/disabled state.
   */
  isDependencySatisfied(def) {
    // Only check dependsOn for disabled state (not showWhen)
    if (def.dependsOn) {
      const depValue = this.config[def.dependsOn];
      // For boolean dependencies, check if true
      if (typeof depValue === "boolean") {
        return depValue === true;
      }
      // For non-boolean, just check if it has a truthy value
      return !!depValue;
    }
    return true;
  }

  /**
   * Render a single option
   */
  renderOption(key, def) {
    const isDisabled = !this.isDependencySatisfied(def);
    const dependencyClass = isDisabled ? "fu-config-builder-disabled" : "";
    const dependencyIndicator = def.dependsOn
      ? `<span class="fu-config-builder-depends-on" data-tooltip="Requires: ${def.dependsOn}" data-tooltip-position="top">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
             <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
           </svg>
         </span>`
      : "";

    let content = "";
    switch (def.type) {
      case "boolean":
        content = this.renderToggle(key, def, isDisabled, dependencyIndicator);
        break;
      case "text":
        content = this.renderTextInput(
          key,
          def,
          isDisabled,
          dependencyIndicator
        );
        break;
      case "number":
        content = this.renderNumberInput(
          key,
          def,
          isDisabled,
          dependencyIndicator
        );
        break;
      case "size":
        content = this.renderSizeInput(
          key,
          def,
          isDisabled,
          dependencyIndicator
        );
        break;
      case "select":
        content = this.renderSelect(key, def, isDisabled, dependencyIndicator);
        break;
      case "selectWithInput":
        content = this.renderSelectWithInput(
          key,
          def,
          isDisabled,
          dependencyIndicator
        );
        break;
      case "multiSelect":
        content = this.renderMultiSelect(
          key,
          def,
          isDisabled,
          dependencyIndicator
        );
        break;
      case "extensions":
        content = this.renderExtensions(key, def);
        break;
      case "typeSize":
        content = this.renderTypeSizeInputs(key, def);
        break;
      case "typeCount":
        content = this.renderTypeCountInputs(key, def);
        break;
      case "mimeTypes":
        content = this.renderMimeTypes(key, def);
        break;
      case "buttonSizeSelect":
        content = this.renderButtonSizeSelect(
          key,
          def,
          isDisabled,
          dependencyIndicator
        );
        break;
      case "timerSizeSelect":
        content = this.renderTimerSizeSelect(
          key,
          def,
          isDisabled,
          dependencyIndicator
        );
        break;
      default:
        return "";
    }

    // Wrap with dependency container if has dependency or showWhen
    if (def.dependsOn || def.showWhen) {
      const hiddenClass =
        def.showWhen && !def.showWhen(this.config)
          ? "fu-config-builder-hidden"
          : "";
      return `<div class="fu-config-builder-option-wrapper ${dependencyClass} ${hiddenClass}" data-depends-on="${
        def.dependsOn || ""
      }" data-option-key="${key}">${content}</div>`;
    }
    return content;
  }

  /**
   * Render copyable option key code element
   * @param {string} key - The option key to display
   * @returns {string} HTML for the copyable code element
   */
  renderOptionKey(key) {
    return `<code class="fu-config-builder-option-key has-tooltip tooltip-top" data-copy-key="${key}" data-tooltip="Click to copy">${key}<svg class="fu-config-builder-copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></code>`;
  }

  /**
   * Setup tooltips for vertical tabs using the global TooltipManager
   * This uses fixed positioning to escape scrollable containers
   */
  setupVerticalTabTooltips() {
    // Initialize TooltipManager for elements with data-tooltip attribute
    TooltipManager.init(this.element);
  }

  /**
   * Render toggle (boolean) option
   */
  renderToggle(key, def, isDisabled = false, dependencyIndicator = "") {
    const isActive = this.config[key] === true;
    const disabledClass = isDisabled ? "disabled" : "";
    return `
      <div class="fu-config-builder-toggle ${
        isActive ? "active" : ""
      } ${disabledClass}" data-option="${key}" data-type="boolean" ${
      isDisabled ? 'data-disabled="true"' : ""
    }>
        <div class="fu-config-builder-toggle-switch"></div>
        <div class="fu-config-builder-toggle-content">
          <div class="fu-config-builder-toggle-label">
            ${def.label}
            ${dependencyIndicator}
            ${this.renderOptionKey(key)}
          </div>
          <div class="fu-config-builder-toggle-hint">${def.hint}</div>
        </div>
      </div>
    `;
  }

  /**
   * Render text input option
   */
  renderTextInput(key, def, isDisabled = false, dependencyIndicator = "") {
    return `
      <div class="fu-config-builder-group ${isDisabled ? "disabled" : ""}">
        <label class="fu-config-builder-label">
          ${def.label}
          ${dependencyIndicator}
          ${this.renderOptionKey(key)}
        </label>
        <input type="text" class="fu-config-builder-input"
               data-option="${key}" data-type="text"
               value="${this.config[key] || ""}"
               placeholder="${def.default || ""}"
               ${isDisabled ? "disabled" : ""}>
        <div class="fu-config-builder-hint">${def.hint}</div>
      </div>
    `;
  }

  /**
   * Render number input option (with slider for maxFiles)
   */
  renderNumberInput(key, def, isDisabled = false, dependencyIndicator = "") {
    // Use slider design for maxFiles
    if (key === "maxFiles") {
      return this.renderCountSliderInput(
        key,
        def,
        isDisabled,
        dependencyIndicator
      );
    }

    return `
      <div class="fu-config-builder-group ${isDisabled ? "disabled" : ""}">
        <label class="fu-config-builder-label">
          ${def.label}
          ${dependencyIndicator}
          ${this.renderOptionKey(key)}
        </label>
        <input type="number" class="fu-config-builder-input"
               data-option="${key}" data-type="number"
               value="${this.config[key]}"
               min="${def.min || 0}"
               max="${def.max || 999999}"
               step="${def.step || 1}"
               ${isDisabled ? "disabled" : ""}>
        <div class="fu-config-builder-hint">${def.hint}</div>
      </div>
    `;
  }

  /**
   * Render count slider input (for maxFiles)
   */
  renderCountSliderInput(
    key,
    def,
    isDisabled = false,
    dependencyIndicator = ""
  ) {
    const value = this.config[key] || 0;
    const min = def.min || 1;
    const max = def.max || 100;
    const step = def.step || 1;

    const minusIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"/></svg>`;
    const plusIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/></svg>`;

    return `
      <div class="fu-config-builder-group ${isDisabled ? "disabled" : ""}">
        <label class="fu-config-builder-label">
          ${def.label}
          ${dependencyIndicator}
          ${this.renderOptionKey(key)}
        </label>
        <div class="fu-config-builder-count-slider" data-option="${key}" data-type="countSlider">
          <div class="fu-config-builder-slider-row">
            <button type="button" class="fu-config-builder-slider-btn" data-action="decrease" ${
              isDisabled ? "disabled" : ""
            }>
              ${minusIcon}
            </button>
            <input type="range"
                   class="fu-config-builder-slider-input"
                   data-slider-for="${key}"
                   value="${value}"
                   min="${min}"
                   max="${max}"
                   step="${step}"
                   ${isDisabled ? "disabled" : ""}>
            <button type="button" class="fu-config-builder-slider-btn" data-action="increase" ${
              isDisabled ? "disabled" : ""
            }>
              ${plusIcon}
            </button>
            <input type="number"
                   class="fu-config-builder-slider-value-input"
                   data-value-for="${key}"
                   value="${value}"
                   min="${min}"
                   max="${max}"
                   ${isDisabled ? "disabled" : ""}>
            <span class="fu-config-builder-slider-value-label">files</span>
          </div>
          <div class="fu-config-builder-slider-labels">
            <span class="fu-config-builder-slider-label">${min}</span>
            <span class="fu-config-builder-slider-label">${max}</span>
          </div>
        </div>
        <div class="fu-config-builder-hint">${def.hint}</div>
      </div>
    `;
  }

  /**
   * Render size input with slider and +/- buttons
   */
  renderSizeInput(key, def, isDisabled = false, dependencyIndicator = "") {
    const bytes = this.config[key];
    // Determine best unit and value for display
    const { value: displayValue, unit: displayUnit } =
      this.bytesToBestUnit(bytes);

    // Convert to current slider unit for slider display
    const sliderValue = this.bytesToUnit(bytes, displayUnit);
    const minValue = this.bytesToUnit(this.getSliderMinBytes(), displayUnit);
    const maxValue = this.bytesToUnit(this.getSliderMaxBytes(), displayUnit);
    const stepValue = this.bytesToUnit(this.getSliderStepBytes(), displayUnit);

    const minusIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"/></svg>`;
    const plusIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/></svg>`;

    const units = ["bytes", "KB", "MB", "GB"];
    const unitOptions = units
      .map(
        (u) =>
          `<option value="${u}" ${
            displayUnit === u ? "selected" : ""
          }>${u}</option>`
      )
      .join("");

    return `
      <div class="fu-config-builder-group ${isDisabled ? "disabled" : ""}">
        <label class="fu-config-builder-label">
          ${def.label}
          ${dependencyIndicator}
          ${this.renderOptionKey(key)}
        </label>
        <div class="fu-config-builder-size-slider" data-option="${key}" data-type="sizeSlider" data-unit="${displayUnit}">
          <!-- Single row: - slider + input + unit dropdown -->
          <div class="fu-config-builder-slider-row">
            <button type="button" class="fu-config-builder-slider-btn" data-action="decrease" ${
              isDisabled ? "disabled" : ""
            }>
              ${minusIcon}
            </button>
            <input type="range"
                   class="fu-config-builder-slider-input"
                   data-slider-for="${key}"
                   value="${sliderValue}"
                   min="${minValue}"
                   max="${maxValue}"
                   step="${stepValue}"
                   ${isDisabled ? "disabled" : ""}>
            <button type="button" class="fu-config-builder-slider-btn" data-action="increase" ${
              isDisabled ? "disabled" : ""
            }>
              ${plusIcon}
            </button>
            <input type="number"
                   class="fu-config-builder-slider-value-input"
                   data-value-for="${key}"
                   value="${displayValue}"
                   min="${minValue}"
                   max="${maxValue}"
                   ${isDisabled ? "disabled" : ""}>
            <select class="fu-config-builder-unit-dropdown" data-unit-for="${key}" ${
      isDisabled ? "disabled" : ""
    }>
              ${unitOptions}
            </select>
          </div>
          <!-- Range labels -->
          <div class="fu-config-builder-slider-labels">
            <span class="fu-config-builder-slider-label">${minValue} ${displayUnit}</span>
            <span class="fu-config-builder-slider-label">${maxValue} ${displayUnit}</span>
          </div>
        </div>
        <div class="fu-config-builder-hint">${def.hint}</div>
      </div>
    `;
  }

  /**
   * Convert bytes to a specific unit
   */
  bytesToUnit(bytes, unit) {
    const multipliers = {
      bytes: 1,
      KB: 1024,
      MB: 1024 * 1024,
      GB: 1024 * 1024 * 1024,
    };
    const multiplier = multipliers[unit] || 1;
    return Math.round((bytes || 0) / multiplier);
  }

  /**
   * Convert value in a unit to bytes
   */
  unitToBytes(value, unit) {
    const multipliers = {
      bytes: 1,
      KB: 1024,
      MB: 1024 * 1024,
      GB: 1024 * 1024 * 1024,
    };
    const multiplier = multipliers[unit] || 1;
    return (value || 0) * multiplier;
  }

  /**
   * Get slider config min value in bytes
   */
  getSliderMinBytes() {
    return this.unitToBytes(this.sliderConfig.minValue, this.sliderConfig.unit);
  }

  /**
   * Get slider config max value in bytes
   */
  getSliderMaxBytes() {
    return this.unitToBytes(this.sliderConfig.maxValue, this.sliderConfig.unit);
  }

  /**
   * Get slider step value in bytes
   */
  getSliderStepBytes() {
    return this.unitToBytes(
      this.sliderConfig.sliderStep,
      this.sliderConfig.unit
    );
  }

  /**
   * Get best unit for displaying bytes
   */
  bytesToBestUnit(bytes) {
    bytes = bytes || 0;
    if (bytes >= 1024 * 1024 * 1024) {
      return { value: Math.round(bytes / (1024 * 1024 * 1024)), unit: "GB" };
    } else if (bytes >= 1024 * 1024) {
      return { value: Math.round(bytes / (1024 * 1024)), unit: "MB" };
    } else if (bytes >= 1024) {
      return { value: Math.round(bytes / 1024), unit: "KB" };
    }
    return { value: bytes, unit: "bytes" };
  }

  /**
   * Render select dropdown
   */
  renderSelect(key, def, isDisabled = false, dependencyIndicator = "") {
    const options = def.options
      .map(
        (opt) =>
          `<option value="${opt.value}" ${
            this.config[key] === opt.value ? "selected" : ""
          }>${opt.label}</option>`
      )
      .join("");

    return `
      <div class="fu-config-builder-group ${isDisabled ? "disabled" : ""}">
        <label class="fu-config-builder-label">
          ${def.label}
          ${dependencyIndicator}
          ${this.renderOptionKey(key)}
        </label>
        <select class="fu-config-builder-select" data-option="${key}" data-type="select" ${
      isDisabled ? "disabled" : ""
    }>
          ${options}
        </select>
        <div class="fu-config-builder-hint">${def.hint}</div>
      </div>
    `;
  }

  /**
   * Render button size selector with visual button samples
   * Shows actual button appearance for each size option
   */
  renderButtonSizeSelect(
    key,
    def,
    isDisabled = false,
    dependencyIndicator = ""
  ) {
    const currentValue = this.config[key] || def.default;

    // Camera icon SVG for circular buttons
    const cameraIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`;

    // Download icon SVG for rectangular buttons
    const downloadIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;

    const buttons = def.options
      .map((opt) => {
        const isSelected = currentValue === opt.value;
        const circularSizeClass = opt.value !== "md" ? `media-hub-capture-btn-${opt.value}` : "";
        const rectSizeClass = opt.value !== "md" ? `btn-${opt.value}` : "";
        return `
          <div class="fu-config-builder-size-option ${isSelected ? "selected" : ""}" data-size="${opt.value}" data-option="${key}">
            <span class="fu-config-builder-size-label">${opt.label}</span>
            <button type="button"
              class="fu-config-builder-size-sample fu-config-builder-size-circular media-hub-capture-btn ${circularSizeClass}"
              ${isDisabled ? "disabled" : ""}
              title="Circular button (${opt.label})">
              ${cameraIcon}
            </button>
            <button type="button"
              class="fu-config-builder-size-sample fu-config-builder-size-rect media-hub-download-all ${rectSizeClass}"
              ${isDisabled ? "disabled" : ""}
              title="Rectangular button (${opt.label})">
              ${downloadIcon}
            </button>
          </div>
        `;
      })
      .join("");

    return `
      <div class="fu-config-builder-group ${isDisabled ? "disabled" : ""}">
        <label class="fu-config-builder-label">
          ${def.label}
          ${dependencyIndicator}
          ${this.renderOptionKey(key)}
        </label>
        <div class="fu-config-builder-button-size-selector" data-option="${key}" data-type="buttonSizeSelect">
          ${buttons}
        </div>
        <div class="fu-config-builder-hint">${def.hint}</div>
      </div>
    `;
  }

  /**
   * Render timer size selector with visual preview of timer indicator
   */
  renderTimerSizeSelect(
    key,
    def,
    isDisabled = false,
    dependencyIndicator = ""
  ) {
    const currentValue = this.config[key] || def.default;

    // Recording dot SVG
    const dotSvg = `<span class="media-hub-recording-dot"></span>`;

    // Video icon SVG for recording type indicator
    const videoIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor"><path d="M96 64c-35.3 0-64 28.7-64 64l0 256c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64L96 64zM464 336l73.5 58.8c4.2 3.4 9.4 5.2 14.8 5.2 13.1 0 23.7-10.6 23.7-23.7l0-240.6c0-13.1-10.6-23.7-23.7-23.7-5.4 0-10.6 1.8-14.8 5.2L464 176 464 336z"/></svg>`;

    const buttons = def.options
      .map((opt) => {
        const isSelected = currentValue === opt.value;
        const timerSizeClass = opt.value !== "md" ? `timer-${opt.value}` : "";
        return `
          <div class="fu-config-builder-size-option ${isSelected ? "selected" : ""}" data-size="${opt.value}" data-option="${key}">
            <span class="fu-config-builder-size-label">${opt.label}</span>
            <div class="fu-config-builder-timer-sample media-hub-recording-indicator ${timerSizeClass}"
              ${isDisabled ? "style='pointer-events:none;opacity:0.5'" : ""}
              title="Timer indicator (${opt.label})">
              <span class="media-hub-recording-type">${videoIcon}</span>
              ${dotSvg}
              <span class="media-hub-recording-time">00:00</span>
            </div>
          </div>
        `;
      })
      .join("");

    return `
      <div class="fu-config-builder-group ${isDisabled ? "disabled" : ""}">
        <label class="fu-config-builder-label">
          ${def.label}
          ${dependencyIndicator}
          ${this.renderOptionKey(key)}
        </label>
        <div class="fu-config-builder-button-size-selector fu-config-builder-timer-size-selector" data-option="${key}" data-type="timerSizeSelect">
          ${buttons}
        </div>
        <div class="fu-config-builder-hint">${def.hint}</div>
      </div>
    `;
  }

  /**
   * Render select dropdown with custom input option
   * Allows users to either select from presets or enter a custom value
   */
  renderSelectWithInput(
    key,
    def,
    isDisabled = false,
    dependencyIndicator = ""
  ) {
    const currentValue = this.config[key];
    const isCustomValue =
      currentValue !== null &&
      !def.options.some((opt) => opt.value === currentValue);

    // Add "Custom" option if not already present
    const optionsWithCustom = [
      ...def.options,
      { value: "__custom__", label: "Custom..." },
    ];

    const options = optionsWithCustom
      .map(
        (opt) =>
          `<option value="${opt.value}" ${
            (opt.value === "__custom__" && isCustomValue) ||
            (!isCustomValue && this.config[key] === opt.value)
              ? "selected"
              : ""
          }>${opt.label}</option>`
      )
      .join("");

    // Format the current value for display in the input
    let inputValue = "";
    let inputUnit = def.inputUnit || "";
    if (isCustomValue && currentValue !== null) {
      if (def.formatType === "size") {
        // Convert bytes to appropriate unit for display
        const { value, unit } = this.bytesToBestUnit(currentValue);
        inputValue = value;
        inputUnit = unit;
      } else if (def.formatType === "bitrate") {
        // Convert bps to appropriate unit for display
        if (currentValue >= 1000000) {
          inputValue = currentValue / 1000000;
          inputUnit = "Mbps";
        } else if (currentValue >= 1000) {
          inputValue = currentValue / 1000;
          inputUnit = "Kbps";
        } else {
          inputValue = currentValue;
          inputUnit = "bps";
        }
      } else {
        inputValue = currentValue;
      }
    }

    // Unit options based on format type
    let unitOptions = "";
    if (def.formatType === "size") {
      unitOptions = `
        <option value="bytes" ${
          inputUnit === "bytes" ? "selected" : ""
        }>bytes</option>
        <option value="KB" ${inputUnit === "KB" ? "selected" : ""}>KB</option>
        <option value="MB" ${inputUnit === "MB" ? "selected" : ""}>MB</option>
        <option value="GB" ${inputUnit === "GB" ? "selected" : ""}>GB</option>
      `;
    } else if (def.formatType === "bitrate") {
      unitOptions = `
        <option value="bps" ${
          inputUnit === "bps" ? "selected" : ""
        }>bps</option>
        <option value="Kbps" ${
          inputUnit === "Kbps" ? "selected" : ""
        }>Kbps</option>
        <option value="Mbps" ${
          inputUnit === "Mbps" ? "selected" : ""
        }>Mbps</option>
      `;
    }

    // Custom inputs are always visible but disabled when not in custom mode
    const customInputsDisabled = isDisabled || !isCustomValue;

    return `
      <div class="fu-config-builder-group ${isDisabled ? "disabled" : ""}">
        <label class="fu-config-builder-label">
          ${def.label}
          ${dependencyIndicator}
          ${this.renderOptionKey(key)}
        </label>
        <div class="fu-config-builder-select-with-input" data-option="${key}" data-type="selectWithInput" data-format-type="${
      def.formatType || ""
    }">
          <select class="fu-config-builder-select" data-role="preset" ${
            isDisabled ? "disabled" : ""
          }>
            ${options}
          </select>
          <input type="number" class="fu-config-builder-input fu-config-builder-custom-value visible" data-role="custom-value"
                 value="${inputValue}" placeholder="Value" ${
      customInputsDisabled ? "disabled" : ""
    }
                 min="0" step="any">
          ${
            unitOptions
              ? `<select class="fu-config-builder-select fu-config-builder-custom-unit visible" data-role="custom-unit" ${
                  customInputsDisabled ? "disabled" : ""
                }>${unitOptions}</select>`
              : ""
          }
        </div>
        <div class="fu-config-builder-hint">${def.hint}</div>
      </div>
    `;
  }

  /**
   * Render multi-select tags
   */
  renderMultiSelect(key, def, isDisabled = false, dependencyIndicator = "") {
    const selected = this.config[key] || [];

    // Get available options - use filterOptions if defined, otherwise use all options
    const availableOptions = def.filterOptions
      ? def.filterOptions(this.config)
      : def.options;

    // Filter out any selected values that are no longer available
    const validSelected = selected.filter((s) => availableOptions.includes(s));
    if (validSelected.length !== selected.length) {
      // Update config to remove invalid selections
      this.config[key] = validSelected;
    }

    const tags = def.options
      .map((opt) => {
        const label = def.optionLabels ? def.optionLabels[opt] || opt : opt;
        const isAvailable = availableOptions.includes(opt);
        const isSelected = validSelected.includes(opt);

        return `<span class="fu-config-builder-tag ${
          isSelected ? "selected" : ""
        } ${isDisabled || !isAvailable ? "disabled" : ""}"
              data-value="${opt}"
              ${
                !isAvailable
                  ? 'title="Enable this option in Media Capture settings first"'
                  : ""
              }>${label}</span>`;
      })
      .join("");

    return `
      <div class="fu-config-builder-group ${isDisabled ? "disabled" : ""}">
        <label class="fu-config-builder-label">
          ${def.label}
          ${dependencyIndicator}
          ${this.renderOptionKey(key)}
        </label>
        <div class="fu-config-builder-tags ${
          isDisabled ? "disabled" : ""
        }" data-option="${key}" data-type="multiSelect" ${
      isDisabled ? 'data-disabled="true"' : ""
    }>
          ${tags}
        </div>
        <div class="fu-config-builder-hint">${def.hint}</div>
      </div>
    `;
  }

  /**
   * Render extensions selector
   */
  renderExtensions(key, def) {
    const allExtensions = {
      image: ["bmp", "gif", "ico", "jpeg", "jpg", "png", "svg", "webp"],
      video: ["avi", "flv", "mkv", "mov", "mp4", "mpeg", "webm"],
      audio: ["aac", "flac", "m4a", "mp3", "ogg", "wav", "wma"],
      document: [
        "csv",
        "doc",
        "docx",
        "pdf",
        "ppt",
        "pptx",
        "rtf",
        "txt",
        "xls",
        "xlsx",
      ],
      archive: ["7z", "bz2", "gz", "rar", "tar", "zip"],
    };

    const selected = this.config[key] || [];

    let html = `
      <div class="fu-config-builder-group">
        <label class="fu-config-builder-label">
          ${def.label}
          ${this.renderOptionKey(key)}
        </label>
        <div class="fu-config-builder-hint" style="margin-bottom: 12px;">${
          def.hint
        }</div>
        <div data-option="${key}" data-type="extensions">
    `;

    for (const [group, exts] of Object.entries(allExtensions)) {
      const sortedExts = [...exts].sort((a, b) => a.localeCompare(b));
      const allSelected = sortedExts.every((ext) => selected.includes(ext));
      html += `
        <div class="fu-config-builder-ext-group">
          <div class="fu-config-builder-ext-group-header">
            <span class="fu-config-builder-ext-group-title">${group}</span>
            <span class="fu-config-builder-ext-group-toggle" data-group="${group}">
              ${allSelected ? "Deselect All" : "Select All"}
            </span>
          </div>
          <div class="fu-config-builder-extensions">
            ${sortedExts
              .map(
                (ext) =>
                  `<span class="fu-config-builder-ext ${
                    selected.includes(ext) ? "selected" : ""
                  }" data-ext="${ext}">.${ext}</span>`
              )
              .join("")}
          </div>
        </div>
      `;
    }

    html += `</div></div>`;
    return html;
  }

  /**
   * Render per-type size inputs with sliders (title on separate row)
   */
  renderTypeSizeInputs(key, def) {
    const types = def.types || [];
    const values = this.config[key] || {};

    const minusIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"/></svg>`;
    const plusIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/></svg>`;

    const units = ["bytes", "KB", "MB", "GB"];

    let html = `
      <div class="fu-config-builder-group">
        <label class="fu-config-builder-label">
          ${def.label}
          ${this.renderOptionKey(key)}
        </label>
        <div class="fu-config-builder-hint" style="margin-bottom: 12px;">${
          def.hint
        }</div>
        <div class="fu-config-builder-type-sliders" data-option="${key}" data-type="typeSizeSlider">
    `;

    for (const type of types) {
      const bytes = values[type] || 0;
      const { value: displayValue, unit: displayUnit } =
        bytes > 0
          ? this.bytesToBestUnit(bytes)
          : { value: 0, unit: this.sliderConfig.unit };
      const maxValue = this.bytesToUnit(this.getSliderMaxBytes(), displayUnit);
      const stepValue = Math.max(
        1,
        this.bytesToUnit(this.getSliderStepBytes(), displayUnit)
      );

      const unitOptions = units
        .map(
          (u) =>
            `<option value="${u}" ${
              displayUnit === u ? "selected" : ""
            }>${u}</option>`
        )
        .join("");

      const typeIcon = this.getFileTypeIcon(type);

      html += `
        <div class="fu-config-builder-type-slider-block" data-type-key="${type}" data-unit="${displayUnit}">
          <div class="fu-config-builder-type-slider-header">
            ${typeIcon}
            <span class="fu-config-builder-type-slider-title">${this.capitalizeFirst(
              type
            )}</span>
          </div>
          <div class="fu-config-builder-type-slider-controls">
            <button type="button" class="fu-config-builder-slider-btn fu-config-builder-slider-btn-sm" data-action="decrease">
              ${minusIcon}
            </button>
            <input type="range"
                   class="fu-config-builder-slider-input"
                   data-slider-type="${type}"
                   value="${displayValue}"
                   min="0"
                   max="${maxValue}"
                   step="${stepValue}">
            <button type="button" class="fu-config-builder-slider-btn fu-config-builder-slider-btn-sm" data-action="increase">
              ${plusIcon}
            </button>
            <input type="number"
                   class="fu-config-builder-slider-value-input fu-config-builder-slider-value-input-sm"
                   data-value-type="${type}"
                   value="${displayValue || ""}"
                   min="0"
                   max="${maxValue}"
                   placeholder="0">
            <select class="fu-config-builder-unit-dropdown fu-config-builder-unit-dropdown-sm" data-unit-type="${type}">
              ${unitOptions}
            </select>
          </div>
          <div class="fu-config-builder-slider-labels fu-config-builder-slider-labels-sm">
            <span class="fu-config-builder-slider-label">0 ${displayUnit}</span>
            <span class="fu-config-builder-slider-label">${maxValue} ${displayUnit}</span>
          </div>
        </div>
      `;
    }

    html += `</div></div>`;
    return html;
  }

  /**
   * Render per-type count inputs with sliders (title on separate row)
   */
  renderTypeCountInputs(key, def) {
    const types = def.types || [];
    const values = this.config[key] || {};

    const minusIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"/></svg>`;
    const plusIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/></svg>`;

    let html = `
      <div class="fu-config-builder-group">
        <label class="fu-config-builder-label">
          ${def.label}
          ${this.renderOptionKey(key)}
        </label>
        <div class="fu-config-builder-hint" style="margin-bottom: 12px;">${
          def.hint
        }</div>
        <div class="fu-config-builder-type-sliders" data-option="${key}" data-type="typeCountSlider">
    `;

    for (const type of types) {
      const value = values[type] || 0;
      const typeIcon = this.getFileTypeIcon(type);

      html += `
        <div class="fu-config-builder-type-slider-block" data-type-key="${type}">
          <div class="fu-config-builder-type-slider-header">
            ${typeIcon}
            <span class="fu-config-builder-type-slider-title">${this.capitalizeFirst(
              type
            )}</span>
          </div>
          <div class="fu-config-builder-type-slider-controls">
            <button type="button" class="fu-config-builder-slider-btn fu-config-builder-slider-btn-sm" data-action="decrease">
              ${minusIcon}
            </button>
            <input type="range"
                   class="fu-config-builder-slider-input"
                   data-slider-type="${type}"
                   value="${value}"
                   min="0"
                   max="100"
                   step="1">
            <button type="button" class="fu-config-builder-slider-btn fu-config-builder-slider-btn-sm" data-action="increase">
              ${plusIcon}
            </button>
            <input type="number"
                   class="fu-config-builder-slider-value-input fu-config-builder-slider-value-input-sm"
                   data-value-type="${type}"
                   value="${value || ""}"
                   min="0"
                   max="100"
                   placeholder="0">
            <span class="fu-config-builder-slider-value-label">files</span>
          </div>
          <div class="fu-config-builder-slider-labels fu-config-builder-slider-labels-sm">
            <span class="fu-config-builder-slider-label">0</span>
            <span class="fu-config-builder-slider-label">100 files</span>
          </div>
        </div>
      `;
    }

    html += `</div></div>`;
    return html;
  }

  /**
   * Render MIME types selector (PHP validation only)
   */
  renderMimeTypes(key, def) {
    const allMimeTypes = {
      image: [
        "image/bmp",
        "image/gif",
        "image/jpeg",
        "image/png",
        "image/svg+xml",
        "image/webp",
        "image/x-icon",
      ],
      video: [
        "video/mp4",
        "video/mpeg",
        "video/quicktime",
        "video/webm",
        "video/x-flv",
        "video/x-matroska",
        "video/x-msvideo",
      ],
      audio: [
        "audio/aac",
        "audio/flac",
        "audio/mp4",
        "audio/mpeg",
        "audio/ogg",
        "audio/wav",
        "audio/webm",
        "audio/x-ms-wma",
      ],
      document: [
        "application/msword",
        "application/pdf",
        "application/rtf",
        "application/vnd.ms-excel",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/csv",
        "text/plain",
      ],
      archive: [
        "application/gzip",
        "application/x-7z-compressed",
        "application/x-bzip2",
        "application/x-rar-compressed",
        "application/x-tar",
        "application/zip",
      ],
    };

    // Friendly labels for MIME types
    const mimeLabels = {
      "image/jpeg": "JPEG",
      "image/png": "PNG",
      "image/gif": "GIF",
      "image/webp": "WebP",
      "image/svg+xml": "SVG",
      "image/bmp": "BMP",
      "image/x-icon": "ICO",
      "video/mp4": "MP4",
      "video/mpeg": "MPEG",
      "video/quicktime": "MOV",
      "video/x-msvideo": "AVI",
      "video/webm": "WebM",
      "video/x-matroska": "MKV",
      "video/x-flv": "FLV",
      "audio/mpeg": "MP3",
      "audio/wav": "WAV",
      "audio/ogg": "OGG",
      "audio/aac": "AAC",
      "audio/mp4": "M4A",
      "audio/flac": "FLAC",
      "audio/x-ms-wma": "WMA",
      "audio/webm": "WebM Audio",
      "application/pdf": "PDF",
      "application/msword": "DOC",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "DOCX",
      "application/vnd.ms-excel": "XLS",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        "XLSX",
      "application/vnd.ms-powerpoint": "PPT",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        "PPTX",
      "text/plain": "TXT",
      "text/csv": "CSV",
      "application/rtf": "RTF",
      "application/zip": "ZIP",
      "application/x-rar-compressed": "RAR",
      "application/x-7z-compressed": "7Z",
      "application/x-tar": "TAR",
      "application/gzip": "GZ",
      "application/x-bzip2": "BZ2",
    };

    const selected = this.config[key] || [];

    let html = `
      <div class="fu-config-builder-group">
        <label class="fu-config-builder-label">
          ${def.label}
          ${this.renderOptionKey(key)}
        </label>
        <div class="fu-config-builder-hint" style="margin-bottom: 12px;">${
          def.hint
        }</div>
        <div data-option="${key}" data-type="mimeTypes">
    `;

    for (const [group, mimes] of Object.entries(allMimeTypes)) {
      // Sort MIME types alphabetically by their friendly label
      const sortedMimes = [...mimes].sort((a, b) => {
        const labelA = (mimeLabels[a] || a).toLowerCase();
        const labelB = (mimeLabels[b] || b).toLowerCase();
        return labelA.localeCompare(labelB);
      });
      const allSelected = sortedMimes.every((mime) => selected.includes(mime));
      html += `
        <div class="fu-config-builder-mime-group">
          <div class="fu-config-builder-mime-group-header">
            <span class="fu-config-builder-mime-group-title">${group}</span>
            <span class="fu-config-builder-mime-group-toggle" data-group="${group}">
              ${allSelected ? "Deselect All" : "Select All"}
            </span>
          </div>
          <div class="fu-config-builder-mimes">
            ${sortedMimes
              .map(
                (mime) => `
              <span class="fu-config-builder-mime ${
                selected.includes(mime) ? "selected" : ""
              }"
                    data-mime="${mime}">
                <span class="fu-config-builder-mime-label">${
                  mimeLabels[mime] || mime
                }</span>
                <span class="fu-config-builder-mime-value">${mime}</span>
              </span>
            `
              )
              .join("")}
          </div>
        </div>
      `;
    }

    html += `</div></div>`;
    return html;
  }

  /**
   * Get category icon SVG - Using filled Font Awesome style icons
   * Delegates to Icons module
   */
  getCategoryIcon(icon) {
    return getCategoryIconFn(icon);
  }

  /**
   * Format bytes value with unit to display string (e.g., "5MB")
   */
  formatBytesDisplay(value, unit) {
    if (!value || value === 0) return "";
    // Remove trailing zeros and format nicely
    const formatted = parseFloat(value);
    if (unit === "bytes") {
      return `${formatted} bytes`;
    }
    return `${formatted}${unit}`;
  }

  /**
   * Attach event handlers
   */
  attachEvents() {
    // Search functionality
    this.attachSearchEvents();

    // Theme switcher buttons
    this.element
      .querySelectorAll(".fu-config-builder-theme-btn")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          this.setTheme(btn.dataset.theme);
        });
      });

    // Listen for system theme changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        if (this.theme === "system") {
          this.applyTheme();
          // Refresh CSS vars panels for system theme change
          this.refreshCssVarsPanels();
        }
      });

    // Main tab switching (Config / Styles)
    this.element
      .querySelectorAll(".fu-config-builder-main-tab")
      .forEach((tab) => {
        tab.addEventListener("click", () => {
          const mainTab = tab.dataset.mainTab;

          // Update main tab active states
          this.element
            .querySelectorAll(".fu-config-builder-main-tab")
            .forEach((t) => {
              t.classList.remove("active");
            });
          tab.classList.add("active");

          // Update main tab content visibility
          this.element
            .querySelectorAll(".fu-config-builder-main-tab-content")
            .forEach((content) => {
              content.classList.remove("active");
            });
          const targetContent = this.element.querySelector(
            `#main-tab-${mainTab}`
          );
          if (targetContent) {
            targetContent.classList.add("active");
          }

          this.activeMainTab = mainTab;
          localStorage.setItem("fu-config-builder-main-tab", mainTab);

          // Update CSS output when switching to styles
          if (mainTab === "styles") {
            this.updateCssOutput();
          }
        });
      });

    // Vertical tab switching for config categories
    this.element
      .querySelectorAll(".fu-config-builder-vertical-tab[data-category]")
      .forEach((tab) => {
        tab.addEventListener("click", () => {
          const categoryKey = tab.dataset.category;

          // Update tab active states within config tab
          const configTab = this.element.querySelector("#main-tab-config");
          if (configTab) {
            configTab
              .querySelectorAll(".fu-config-builder-vertical-tab")
              .forEach((t) => {
                t.classList.remove("active");
              });
          }
          tab.classList.add("active");

          // Update panel visibility
          this.element
            .querySelectorAll(
              ".fu-config-builder-category-panel[data-category-panel]"
            )
            .forEach((panel) => {
              panel.classList.remove("active");
            });
          const targetPanel = this.element.querySelector(
            `[data-category-panel="${categoryKey}"]`
          );
          if (targetPanel) {
            targetPanel.classList.add("active");
          }

          this.currentCategory = categoryKey;
          localStorage.setItem("fu-config-builder-category", categoryKey);
        });
      });

    // Vertical tab switching for style sections
    this.element
      .querySelectorAll(".fu-config-builder-vertical-tab[data-style-section]")
      .forEach((tab) => {
        tab.addEventListener("click", () => {
          const sectionKey = tab.dataset.styleSection;

          // Update tab active states within styles tab
          const stylesTab = this.element.querySelector("#main-tab-styles");
          if (stylesTab) {
            stylesTab
              .querySelectorAll(".fu-config-builder-vertical-tab")
              .forEach((t) => {
                t.classList.remove("active");
              });
          }
          tab.classList.add("active");

          // Update style panel visibility
          this.element
            .querySelectorAll(".fu-config-builder-style-panel")
            .forEach((panel) => {
              panel.classList.remove("active");
            });
          const targetPanel = this.element.querySelector(
            `[data-style-panel="${sectionKey}"]`
          );
          if (targetPanel) {
            targetPanel.classList.add("active");
          }

          this.currentStyleSection = sectionKey;
          localStorage.setItem("fu-config-builder-style-section", sectionKey);
        });
      });

    // Setup tooltips for vertical tabs (using fixed positioning to escape scroll container)
    this.setupVerticalTabTooltips();

    // Modal subtab switching (HTML, CSS, JS within Modal tab)
    this.element
      .querySelectorAll(".fu-config-builder-modal-subtab-btn")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const subtab = btn.dataset.modalSubtab;

          // Update button active states
          this.element
            .querySelectorAll(".fu-config-builder-modal-subtab-btn")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");

          // Update subtab content visibility
          this.element
            .querySelectorAll(".fu-config-builder-modal-subtab-content")
            .forEach((content) => content.classList.remove("active"));
          const targetContent = this.element.querySelector(
            `#modal-subtab-${subtab}`
          );
          if (targetContent) {
            targetContent.classList.add("active");
          }
        });
      });

    // Style color picker inputs
    this.element
      .querySelectorAll(".fu-config-builder-color-picker")
      .forEach((picker) => {
        picker.addEventListener("input", (e) => {
          const varName = e.target.dataset.var;
          const value = e.target.value;
          this.styleValues[varName] = value;

          // Update text input
          const textInput = this.element.querySelector(
            `.fu-config-builder-color-text[data-var="${varName}"]`
          );
          if (textInput) {
            textInput.value = value;
          }

          this.applyStylesToPreview();
          this.updateCssOutput();
        });
      });

    // Style color text inputs
    this.element
      .querySelectorAll(".fu-config-builder-color-text")
      .forEach((input) => {
        input.addEventListener("input", (e) => {
          const varName = e.target.dataset.var;
          let value = e.target.value.trim();

          // Auto-add # if missing
          if (value && !value.startsWith("#")) {
            value = "#" + value;
          }

          // Validate hex color (3 or 6 characters)
          const isValidHex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value);

          if (isValidHex) {
            // Expand 3-char hex to 6-char for color picker
            let fullHex = value;
            if (value.length === 4) {
              fullHex =
                "#" +
                value[1] +
                value[1] +
                value[2] +
                value[2] +
                value[3] +
                value[3];
            }

            this.styleValues[varName] = fullHex;

            // Update color picker
            const picker = this.element.querySelector(
              `.fu-config-builder-color-picker[data-var="${varName}"]`
            );
            if (picker) {
              picker.value = fullHex;
            }

            this.applyStylesToPreview();
            this.updateCssOutput();
          }
        });
      });

    // Style size inputs
    this.element
      .querySelectorAll(".fu-config-builder-size-input")
      .forEach((input) => {
        input.addEventListener("input", (e) => {
          const varName = e.target.dataset.var;
          const value = e.target.value;
          this.styleValues[varName] = value;
          this.applyStylesToPreview();
          this.updateCssOutput();
        });
      });

    // Style number inputs
    this.element
      .querySelectorAll(".fu-config-builder-number-input")
      .forEach((input) => {
        input.addEventListener("input", (e) => {
          const varName = e.target.dataset.var;
          const value = e.target.value;
          this.styleValues[varName] = value;
          this.applyStylesToPreview();
          this.updateCssOutput();
        });
      });

    // Style text inputs (for shadows, transitions, etc.)
    this.element
      .querySelectorAll(".fu-config-builder-text-input")
      .forEach((input) => {
        input.addEventListener("input", (e) => {
          const varName = e.target.dataset.var;
          const value = e.target.value;
          this.styleValues[varName] = value;
          this.applyStylesToPreview();
          this.updateCssOutput();
        });
      });

    // Reset styles button
    const resetStylesBtn = this.element.querySelector("#reset-styles");
    if (resetStylesBtn) {
      resetStylesBtn.addEventListener("click", () => {
        this.resetStyles();
      });
    }

    // Highlight toggle
    const highlightToggle = this.element.querySelector("#highlight-toggle");
    if (highlightToggle) {
      highlightToggle.addEventListener("change", (e) => {
        this.highlightMode = e.target.checked;
        if (!this.highlightMode) {
          this.clearHighlights();
        }
      });
    }

    // Style variable hover events for highlighting
    this.element
      .querySelectorAll(".fu-config-builder-style-var")
      .forEach((varEl) => {
        varEl.addEventListener("mouseenter", () => {
          if (this.highlightMode) {
            const varName = varEl.dataset.var;
            this.highlightElements(varName);
          }
        });

        varEl.addEventListener("mouseleave", () => {
          if (this.highlightMode) {
            this.clearHighlights();
          }
        });
      });

    // Copy CSS button
    const copyCssBtn = this.element.querySelector("#copy-css");
    if (copyCssBtn) {
      copyCssBtn.addEventListener("click", () => {
        const cssOutput = this.generateCssOutput();
        navigator.clipboard.writeText(cssOutput).then(() => {
          const originalText = copyCssBtn.innerHTML;
          copyCssBtn.innerHTML =
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copied!';
          setTimeout(() => {
            copyCssBtn.innerHTML = originalText;
          }, 2000);
        });
      });
    }

    // Download CSS button
    const downloadCssBtn = this.element.querySelector("#download-css");
    if (downloadCssBtn) {
      downloadCssBtn.addEventListener("click", () => {
        const cssOutput = this.generateCssOutput();
        const blob = new Blob([cssOutput], { type: "text/css" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "media-hub-custom.css";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }

    // Panel resizer
    const resizer = this.element.querySelector("#panel-resizer");
    const optionsPanel = this.element.querySelector("#options-panel");

    if (resizer && optionsPanel) {
      // Restore saved width if available
      if (this.optionsPanelWidth) {
        optionsPanel.style.width = `${this.optionsPanelWidth}px`;
      }

      let isResizing = false;
      let startX = 0;
      let startWidth = 0;

      resizer.addEventListener("mousedown", (e) => {
        isResizing = true;
        startX = e.clientX;
        startWidth = optionsPanel.offsetWidth;
        resizer.classList.add("active");
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        e.preventDefault();
      });

      document.addEventListener("mousemove", (e) => {
        if (!isResizing) return;

        const diff = e.clientX - startX;
        const newWidth = Math.min(Math.max(startWidth + diff, 320), 600);
        optionsPanel.style.width = `${newWidth}px`;
        // Save width for persistence
        this.optionsPanelWidth = newWidth;
      });

      document.addEventListener("mouseup", () => {
        if (isResizing) {
          isResizing = false;
          resizer.classList.remove("active");
          document.body.style.cursor = "";
          document.body.style.userSelect = "";
        }
      });
    }

    // Category collapse/expand (legacy, keeping for compatibility)
    this.element
      .querySelectorAll(".fu-config-builder-category-header")
      .forEach((header) => {
        header.addEventListener("click", () => {
          header.classList.toggle("collapsed");
          const content = header.nextElementSibling;
          content.classList.toggle("hidden");
        });
      });

    // Tab switching
    this.element.querySelectorAll(".fu-config-builder-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        this.element
          .querySelectorAll(".fu-config-builder-tab")
          .forEach((t) => t.classList.remove("active"));
        this.element
          .querySelectorAll(".fu-config-builder-tab-content")
          .forEach((c) => c.classList.remove("active"));

        tab.classList.add("active");
        this.element
          .querySelector(`#tab-${tab.dataset.tab}`)
          .classList.add("active");
      });
    });

    // Preset buttons
    this.element
      .querySelectorAll(".fu-config-builder-preset")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          this.applyPreset(btn.dataset.preset);
        });
      });

    // Add uploader button
    const addUploaderBtn = this.element.querySelector("#add-uploader");
    if (addUploaderBtn) {
      addUploaderBtn.addEventListener("click", () => {
        this.addUploader();
      });
    }

    // Uploader tab clicks
    this.element
      .querySelectorAll(".fu-config-builder-uploader-tab")
      .forEach((tab) => {
        tab.addEventListener("click", (e) => {
          if (
            !e.target.closest(".fu-config-builder-uploader-tab-close") &&
            !e.target.closest(".fu-config-builder-uploader-tab-duplicate")
          ) {
            this.selectUploader(tab.dataset.uploaderId);
          }
        });
      });

    // Uploader tab close buttons
    this.element
      .querySelectorAll(".fu-config-builder-uploader-tab-close")
      .forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.removeUploader(btn.dataset.uploaderId);
        });
      });

    // Uploader tab duplicate buttons
    this.element
      .querySelectorAll(".fu-config-builder-uploader-tab-duplicate")
      .forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.duplicateUploader(btn.dataset.uploaderId);
        });
      });

    // Uploader tab name editing (double-click)
    this.element
      .querySelectorAll(".fu-config-builder-uploader-tab-name")
      .forEach((nameEl) => {
        nameEl.addEventListener("dblclick", (e) => {
          e.stopPropagation();
          this.editUploaderName(nameEl.dataset.uploaderId);
        });
      });

    // Click-to-copy option keys
    this.element
      .querySelectorAll(".fu-config-builder-option-key")
      .forEach((codeEl) => {
        codeEl.addEventListener("click", (e) => {
          e.stopPropagation();
          const key = codeEl.dataset.copyKey;
          navigator.clipboard
            .writeText(key)
            .then(() => {
              // Add copied state and update tooltip
              codeEl.classList.add("copied");
              codeEl.dataset.tooltip = "Copied!";
              // Reset after delay
              setTimeout(() => {
                codeEl.classList.remove("copied");
                codeEl.dataset.tooltip = "Click to copy";
              }, 1500);
            })
            .catch((err) => {
              console.error("Failed to copy:", err);
            });
        });
      });

    // Toggle options
    this.element
      .querySelectorAll('.fu-config-builder-toggle[data-type="boolean"]')
      .forEach((toggle) => {
        toggle.addEventListener("click", () => {
          // Skip if disabled
          if (toggle.dataset.disabled === "true") return;

          toggle.classList.toggle("active");
          const optionKey = toggle.dataset.option;
          this.config[optionKey] = toggle.classList.contains("active");

          // Update dependent options visibility
          this.updateDependentOptions(optionKey);

          this.onConfigChange();
        });
      });

    // Text inputs
    this.element
      .querySelectorAll('.fu-config-builder-input[data-type="text"]')
      .forEach((input) => {
        input.addEventListener("input", () => {
          this.config[input.dataset.option] = input.value;
          this.onConfigChange();
        });
      });

    // Number inputs
    this.element
      .querySelectorAll('.fu-config-builder-input[data-type="number"]')
      .forEach((input) => {
        input.addEventListener("input", () => {
          this.config[input.dataset.option] = parseInt(input.value) || 0;
          this.onConfigChange();
        });
      });

    // Slider configuration inputs
    const sliderConfigUnit = this.element.querySelector("#slider-config-unit");
    const sliderConfigMin = this.element.querySelector("#slider-config-min");
    const sliderConfigMax = this.element.querySelector("#slider-config-max");
    const sliderConfigStep = this.element.querySelector("#slider-config-step");
    const sliderConfigBtnStep = this.element.querySelector(
      "#slider-config-btn-step"
    );

    // Helper to update label text when unit changes
    const updateSliderConfigLabels = () => {
      const minLabel = this.element
        .querySelector("#slider-config-min")
        ?.closest(".fu-config-builder-slider-config-item")
        ?.querySelector("label");
      const maxLabel = this.element
        .querySelector("#slider-config-max")
        ?.closest(".fu-config-builder-slider-config-item")
        ?.querySelector("label");
      if (minLabel) minLabel.textContent = `Min (${this.sliderConfig.unit})`;
      if (maxLabel) maxLabel.textContent = `Max (${this.sliderConfig.unit})`;
    };

    if (sliderConfigUnit) {
      sliderConfigUnit.addEventListener("change", () => {
        this.sliderConfig.unit = sliderConfigUnit.value;
        updateSliderConfigLabels();
        // Sync all unit dropdowns in File Size Limits section to the same unit
        this.syncUnitDropdowns(sliderConfigUnit.value, "sizeSlider");
        this.updateAllSizeSliders();
      });
    }
    if (sliderConfigMin) {
      sliderConfigMin.addEventListener("input", () => {
        this.sliderConfig.minValue = parseInt(sliderConfigMin.value) || 5;
        this.updateAllSizeSliders();
      });
    }
    if (sliderConfigMax) {
      sliderConfigMax.addEventListener("input", () => {
        this.sliderConfig.maxValue = parseInt(sliderConfigMax.value) || 500;
        this.updateAllSizeSliders();
      });
    }
    if (sliderConfigStep) {
      sliderConfigStep.addEventListener("input", () => {
        this.sliderConfig.sliderStep = parseInt(sliderConfigStep.value) || 50;
        this.updateAllSizeSliders();
      });
    }
    if (sliderConfigBtnStep) {
      sliderConfigBtnStep.addEventListener("input", () => {
        this.sliderConfig.buttonStep =
          parseInt(sliderConfigBtnStep.value) || 10;
      });
    }

    // Size slider inputs with unit dropdown
    this.element
      .querySelectorAll(
        '.fu-config-builder-size-slider[data-type="sizeSlider"]'
      )
      .forEach((container) => {
        const optionKey = container.dataset.option;
        const slider = container.querySelector(
          ".fu-config-builder-slider-input"
        );
        const valueInput = container.querySelector(
          ".fu-config-builder-slider-value-input"
        );
        const unitDropdown = container.querySelector(
          ".fu-config-builder-unit-dropdown"
        );
        const decreaseBtn = container.querySelector('[data-action="decrease"]');
        const increaseBtn = container.querySelector('[data-action="increase"]');
        const labels = container.querySelectorAll(
          ".fu-config-builder-slider-label"
        );

        if (
          !slider ||
          !valueInput ||
          !decreaseBtn ||
          !increaseBtn ||
          !unitDropdown
        ) {
          console.warn("Size slider elements not found for:", optionKey);
          return;
        }

        const getCurrentUnit = () => unitDropdown.value;

        const updateSliderRange = (unit) => {
          const minValue = this.bytesToUnit(this.getSliderMinBytes(), unit);
          const maxValue = this.bytesToUnit(this.getSliderMaxBytes(), unit);
          const stepValue = this.bytesToUnit(this.getSliderStepBytes(), unit);

          slider.min = minValue;
          slider.max = maxValue;
          slider.step = stepValue;
          valueInput.min = minValue;
          valueInput.max = maxValue;

          // Update labels
          if (labels.length >= 2) {
            labels[0].textContent = `${minValue} ${unit}`;
            labels[1].textContent = `${maxValue} ${unit}`;
          }
        };

        const updateValue = (value, unit) => {
          // Clamp to slider range
          const minValue = this.bytesToUnit(this.getSliderMinBytes(), unit);
          const maxValue = this.bytesToUnit(this.getSliderMaxBytes(), unit);
          value = Math.max(minValue, Math.min(maxValue, value));

          // Update UI
          slider.value = value;
          valueInput.value = value;

          // Update config (convert to bytes)
          const bytes = this.unitToBytes(value, unit);
          this.config[optionKey] = bytes;

          // Also set display value
          const displayKey = optionKey + "Display";
          this.config[displayKey] = value + " " + unit;

          this.onConfigChange();
        };

        // Unit dropdown change
        unitDropdown.addEventListener("change", () => {
          const newUnit = unitDropdown.value;
          const currentBytes = this.config[optionKey];
          const newValue = this.bytesToUnit(currentBytes, newUnit);

          updateSliderRange(newUnit);
          slider.value = newValue;
          valueInput.value = newValue;
          container.dataset.unit = newUnit;
        });

        // Slider change
        slider.addEventListener("input", () => {
          updateValue(parseInt(slider.value) || 0, getCurrentUnit());
        });

        // Direct value input
        valueInput.addEventListener("input", () => {
          updateValue(parseInt(valueInput.value) || 0, getCurrentUnit());
        });

        // Decrease button
        decreaseBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const unit = getCurrentUnit();
          const buttonStep = this.bytesToUnit(
            this.sliderConfig.buttonStep * 1024 * 1024,
            unit
          );
          const currentValue = parseInt(valueInput.value) || 0;
          updateValue(currentValue - buttonStep, unit);
        });

        // Increase button
        increaseBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const unit = getCurrentUnit();
          const buttonStep = this.bytesToUnit(
            this.sliderConfig.buttonStep * 1024 * 1024,
            unit
          );
          const currentValue = parseInt(valueInput.value) || 0;
          updateValue(currentValue + buttonStep, unit);
        });
      });

    // Count slider inputs (for maxFiles)
    this.element
      .querySelectorAll(
        '.fu-config-builder-count-slider[data-type="countSlider"]'
      )
      .forEach((container) => {
        const optionKey = container.dataset.option;
        const slider = container.querySelector(
          ".fu-config-builder-slider-input"
        );
        const valueInput = container.querySelector(
          ".fu-config-builder-slider-value-input"
        );
        const decreaseBtn = container.querySelector('[data-action="decrease"]');
        const increaseBtn = container.querySelector('[data-action="increase"]');

        if (!slider || !valueInput || !decreaseBtn || !increaseBtn) {
          console.warn("Count slider elements not found for:", optionKey);
          return;
        }

        const updateValue = (value) => {
          const min = parseInt(slider.min) || 1;
          const max = parseInt(slider.max) || 100;
          value = Math.max(min, Math.min(max, value));

          slider.value = value;
          valueInput.value = value;
          this.config[optionKey] = value;
          this.onConfigChange();
        };

        slider.addEventListener("input", () => {
          updateValue(parseInt(slider.value) || 1);
        });

        valueInput.addEventListener("input", () => {
          updateValue(parseInt(valueInput.value) || 1);
        });

        decreaseBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          updateValue((parseInt(valueInput.value) || 1) - 1);
        });

        increaseBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          updateValue((parseInt(valueInput.value) || 1) + 1);
        });
      });

    // Select dropdowns
    this.element
      .querySelectorAll('.fu-config-builder-select[data-type="select"]')
      .forEach((select) => {
        select.addEventListener("change", () => {
          this.config[select.dataset.option] = select.value;
          this.onConfigChange();
        });
      });

    // Button size select (visual button samples) - also handles timer size select
    this.element
      .querySelectorAll('.fu-config-builder-button-size-selector')
      .forEach((container) => {
        container.querySelectorAll('.fu-config-builder-size-option').forEach((option) => {
          option.addEventListener("click", () => {
            // Check if button sample is disabled (for button size)
            const sampleBtn = option.querySelector('.fu-config-builder-size-sample');
            if (sampleBtn && sampleBtn.disabled) return;

            // Check if timer sample is disabled (for timer size)
            const timerSample = option.querySelector('.fu-config-builder-timer-sample');
            if (timerSample && timerSample.style.pointerEvents === 'none') return;

            const optionKey = option.dataset.option;
            const sizeValue = option.dataset.size;

            // Update config
            this.config[optionKey] = sizeValue;

            // Update UI - remove selected from all options in this container
            container.querySelectorAll('.fu-config-builder-size-option').forEach((opt) => {
              opt.classList.remove("selected");
            });

            // Add selected to clicked option
            option.classList.add("selected");

            this.onConfigChange();
          });
        });
      });

    // Select with custom input
    this.element
      .querySelectorAll('[data-type="selectWithInput"]')
      .forEach((container) => {
        const optionKey = container.dataset.option;
        const formatType = container.dataset.formatType;
        const presetSelect = container.querySelector('[data-role="preset"]');
        const customValueInput = container.querySelector(
          '[data-role="custom-value"]'
        );
        const customUnitSelect = container.querySelector(
          '[data-role="custom-unit"]'
        );

        // Helper to convert value with unit to base unit (bytes or bps)
        const convertToBaseUnit = (value, unit) => {
          const numValue = parseFloat(value) || 0;
          if (formatType === "size") {
            switch (unit) {
              case "GB":
                return numValue * 1024 * 1024 * 1024;
              case "MB":
                return numValue * 1024 * 1024;
              case "KB":
                return numValue * 1024;
              default:
                return numValue;
            }
          } else if (formatType === "bitrate") {
            switch (unit) {
              case "Mbps":
                return numValue * 1000000;
              case "Kbps":
                return numValue * 1000;
              default:
                return numValue;
            }
          }
          return numValue;
        };

        // Helper to enable/disable custom inputs (always visible, but disabled when preset is selected)
        const setCustomInputsEnabled = (enabled) => {
          if (customValueInput) {
            customValueInput.disabled = !enabled;
          }
          if (customUnitSelect) {
            customUnitSelect.disabled = !enabled;
          }
        };

        // Helper to reset custom inputs to defaults
        const resetCustomInputs = () => {
          if (customValueInput) {
            customValueInput.value = "";
          }
          if (customUnitSelect) {
            customUnitSelect.value = formatType === "bitrate" ? "Mbps" : "MB";
          }
        };

        // Handle preset selection change
        presetSelect.addEventListener("change", () => {
          const selectedValue = presetSelect.value;
          if (selectedValue === "__custom__") {
            // Enable custom inputs
            setCustomInputsEnabled(true);
            // Set a default value if empty
            if (!customValueInput.value) {
              customValueInput.value = formatType === "bitrate" ? "1" : "10";
              if (customUnitSelect) {
                customUnitSelect.value =
                  formatType === "bitrate" ? "Mbps" : "MB";
              }
            }
            // Update config with custom value
            const unit = customUnitSelect ? customUnitSelect.value : "";
            this.config[optionKey] = convertToBaseUnit(
              customValueInput.value,
              unit
            );
          } else {
            // Disable custom inputs and reset them
            setCustomInputsEnabled(false);
            resetCustomInputs();
            // Handle null value
            this.config[optionKey] =
              selectedValue === "null" ? null : parseFloat(selectedValue);
          }
          this.onConfigChange();
        });

        // Handle custom value input change
        if (customValueInput) {
          customValueInput.addEventListener("input", () => {
            const unit = customUnitSelect ? customUnitSelect.value : "";
            this.config[optionKey] = convertToBaseUnit(
              customValueInput.value,
              unit
            );
            this.onConfigChange();
          });
        }

        // Handle custom unit change
        if (customUnitSelect) {
          customUnitSelect.addEventListener("change", () => {
            this.config[optionKey] = convertToBaseUnit(
              customValueInput.value,
              customUnitSelect.value
            );
            this.onConfigChange();
          });
        }
      });

    // Multi-select tags
    this.element
      .querySelectorAll('.fu-config-builder-tags[data-type="multiSelect"]')
      .forEach((container) => {
        container.querySelectorAll(".fu-config-builder-tag").forEach((tag) => {
          tag.addEventListener("click", () => {
            // Don't allow clicking on disabled tags
            if (tag.classList.contains("disabled")) {
              return;
            }
            tag.classList.toggle("selected");
            const selected = Array.from(
              container.querySelectorAll(".fu-config-builder-tag.selected")
            ).map((t) => t.dataset.value);
            this.config[container.dataset.option] = selected;
            this.onConfigChange();
          });
        });
      });

    // Extension selector
    this.element
      .querySelectorAll('[data-type="extensions"]')
      .forEach((container) => {
        // Individual extension toggle
        container.querySelectorAll(".fu-config-builder-ext").forEach((ext) => {
          ext.addEventListener("click", () => {
            ext.classList.toggle("selected");
            this.updateExtensionsFromUI(container);
          });
        });

        // Group toggle
        container
          .querySelectorAll(".fu-config-builder-ext-group-toggle")
          .forEach((toggle) => {
            toggle.addEventListener("click", () => {
              const group = toggle.closest(".fu-config-builder-ext-group");
              const exts = group.querySelectorAll(".fu-config-builder-ext");
              const allSelected = Array.from(exts).every((e) =>
                e.classList.contains("selected")
              );

              exts.forEach((e) => {
                if (allSelected) {
                  e.classList.remove("selected");
                } else {
                  e.classList.add("selected");
                }
              });

              toggle.textContent = allSelected ? "Select All" : "Deselect All";
              this.updateExtensionsFromUI(container);
            });
          });
      });

    // MIME type selector
    this.element
      .querySelectorAll('[data-type="mimeTypes"]')
      .forEach((container) => {
        // Individual MIME type toggle
        container
          .querySelectorAll(".fu-config-builder-mime")
          .forEach((mime) => {
            mime.addEventListener("click", () => {
              mime.classList.toggle("selected");
              this.updateMimeTypesFromUI(container);
            });
          });

        // Group toggle
        container
          .querySelectorAll(".fu-config-builder-mime-group-toggle")
          .forEach((toggle) => {
            toggle.addEventListener("click", () => {
              const group = toggle.closest(".fu-config-builder-mime-group");
              const mimes = group.querySelectorAll(".fu-config-builder-mime");
              const allSelected = Array.from(mimes).every((m) =>
                m.classList.contains("selected")
              );

              mimes.forEach((m) => {
                if (allSelected) {
                  m.classList.remove("selected");
                } else {
                  m.classList.add("selected");
                }
              });

              toggle.textContent = allSelected ? "Select All" : "Deselect All";
              this.updateMimeTypesFromUI(container);
            });
          });
      });

    // Type size slider inputs with unit dropdown
    this.element
      .querySelectorAll('[data-type="typeSizeSlider"]')
      .forEach((container) => {
        const optionKey = container.dataset.option;

        container
          .querySelectorAll(".fu-config-builder-type-slider-block")
          .forEach((block) => {
            const typeKey = block.dataset.typeKey;
            const slider = block.querySelector(
              ".fu-config-builder-slider-input"
            );
            const valueInput = block.querySelector(
              ".fu-config-builder-slider-value-input"
            );
            const unitDropdown = block.querySelector(
              ".fu-config-builder-unit-dropdown"
            );
            const decreaseBtn = block.querySelector('[data-action="decrease"]');
            const increaseBtn = block.querySelector('[data-action="increase"]');
            const labels = block.querySelectorAll(
              ".fu-config-builder-slider-label"
            );

            if (
              !slider ||
              !valueInput ||
              !decreaseBtn ||
              !increaseBtn ||
              !unitDropdown
            )
              return;

            const getCurrentUnit = () => unitDropdown.value;

            const updateSliderRange = (unit) => {
              const maxValue = this.bytesToUnit(this.getSliderMaxBytes(), unit);
              const stepValue = Math.max(
                1,
                this.bytesToUnit(this.getSliderStepBytes(), unit)
              );

              slider.max = maxValue;
              slider.step = stepValue;
              valueInput.max = maxValue;

              // Update labels
              if (labels.length >= 2) {
                labels[0].textContent = `0 ${unit}`;
                labels[1].textContent = `${maxValue} ${unit}`;
              }
            };

            const updateTypeValue = (value, unit) => {
              // Clamp to slider range (0 means no limit)
              const maxValue = this.bytesToUnit(this.getSliderMaxBytes(), unit);
              value = Math.max(0, Math.min(maxValue, value));

              // Update UI
              slider.value = value;
              valueInput.value = value || "";

              // Initialize objects if needed
              if (!this.config[optionKey]) {
                this.config[optionKey] = {};
              }

              // Get the corresponding display key
              const displayKey = optionKey + "Display";
              if (!this.config[displayKey]) {
                this.config[displayKey] = {};
              }

              if (value > 0) {
                const bytes = this.unitToBytes(value, unit);
                this.config[optionKey][typeKey] = bytes;
                this.config[displayKey][typeKey] = value + " " + unit;
              } else {
                delete this.config[optionKey][typeKey];
                delete this.config[displayKey][typeKey];
              }
              this.onConfigChange();
            };

            // Unit dropdown change
            unitDropdown.addEventListener("change", () => {
              const newUnit = unitDropdown.value;
              const currentBytes = this.config[optionKey]?.[typeKey] || 0;
              const newValue =
                currentBytes > 0 ? this.bytesToUnit(currentBytes, newUnit) : 0;

              updateSliderRange(newUnit);
              slider.value = newValue;
              valueInput.value = newValue || "";
              block.dataset.unit = newUnit;
            });

            // Slider change
            slider.addEventListener("input", () => {
              updateTypeValue(parseInt(slider.value) || 0, getCurrentUnit());
            });

            // Direct value input
            valueInput.addEventListener("input", () => {
              updateTypeValue(
                parseInt(valueInput.value) || 0,
                getCurrentUnit()
              );
            });

            // Decrease button
            decreaseBtn.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              const unit = getCurrentUnit();
              const buttonStep = this.bytesToUnit(
                this.sliderConfig.buttonStep * 1024 * 1024,
                unit
              );
              const currentValue = parseInt(valueInput.value) || 0;
              updateTypeValue(currentValue - buttonStep, unit);
            });

            // Increase button
            increaseBtn.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              const unit = getCurrentUnit();
              const buttonStep = this.bytesToUnit(
                this.sliderConfig.buttonStep * 1024 * 1024,
                unit
              );
              const currentValue = parseInt(valueInput.value) || 0;
              updateTypeValue(currentValue + buttonStep, unit);
            });
          });
      });

    // Type count slider inputs
    this.element
      .querySelectorAll('[data-type="typeCountSlider"]')
      .forEach((container) => {
        const optionKey = container.dataset.option;

        container
          .querySelectorAll(".fu-config-builder-type-slider-block")
          .forEach((block) => {
            const typeKey = block.dataset.typeKey;
            const slider = block.querySelector(
              ".fu-config-builder-slider-input"
            );
            const valueInput = block.querySelector(
              ".fu-config-builder-slider-value-input"
            );
            const decreaseBtn = block.querySelector('[data-action="decrease"]');
            const increaseBtn = block.querySelector('[data-action="increase"]');

            if (!slider || !valueInput || !decreaseBtn || !increaseBtn) return;

            const updateTypeValue = (value) => {
              value = Math.max(0, Math.min(100, value));

              slider.value = value;
              valueInput.value = value || "";

              if (!this.config[optionKey]) {
                this.config[optionKey] = {};
              }

              if (value > 0) {
                this.config[optionKey][typeKey] = value;
              } else {
                delete this.config[optionKey][typeKey];
              }
              this.onConfigChange();
            };

            slider.addEventListener("input", () => {
              updateTypeValue(parseInt(slider.value) || 0);
            });

            valueInput.addEventListener("input", () => {
              updateTypeValue(parseInt(valueInput.value) || 0);
            });

            decreaseBtn.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              updateTypeValue((parseInt(valueInput.value) || 0) - 1);
            });

            increaseBtn.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              updateTypeValue((parseInt(valueInput.value) || 0) + 1);
            });
          });
      });

    // Per-Type Limits view toggle buttons
    this.element
      .querySelectorAll(".fu-config-builder-pertype-view-btn")
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const view = btn.dataset.view;
          this.perTypeLimitsViewMode = view;

          // Update button active states
          this.element
            .querySelectorAll(".fu-config-builder-pertype-view-btn")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");

          // Re-render the perTypeLimits panel content
          this.rerenderPerTypeLimitsPanel();
        });
      });

    // Per-Type slider configuration inputs
    const pertypeSliderUnit = this.element.querySelector(
      "#pertype-slider-config-unit"
    );
    const pertypeSliderMin = this.element.querySelector(
      "#pertype-slider-config-min"
    );
    const pertypeSliderMax = this.element.querySelector(
      "#pertype-slider-config-max"
    );
    const pertypeSliderStep = this.element.querySelector(
      "#pertype-slider-config-step"
    );
    const pertypeSliderBtnStep = this.element.querySelector(
      "#pertype-slider-config-btn-step"
    );

    // Helper to update pertype label text when unit changes
    const updatePertypeSliderConfigLabels = () => {
      const minLabel = this.element
        .querySelector("#pertype-slider-config-min")
        ?.closest(".fu-config-builder-slider-config-item")
        ?.querySelector("label");
      const maxLabel = this.element
        .querySelector("#pertype-slider-config-max")
        ?.closest(".fu-config-builder-slider-config-item")
        ?.querySelector("label");
      if (minLabel) minLabel.textContent = `Min (${this.sliderConfig.unit})`;
      if (maxLabel) maxLabel.textContent = `Max (${this.sliderConfig.unit})`;
    };

    if (pertypeSliderUnit) {
      pertypeSliderUnit.addEventListener("change", () => {
        this.sliderConfig.unit = pertypeSliderUnit.value;
        updatePertypeSliderConfigLabels();
        // Sync all unit dropdowns in Per-Type Limits section to the same unit
        this.syncUnitDropdowns(pertypeSliderUnit.value, "perType");
        this.rerenderPerTypeLimitsPanel();
      });
    }
    if (pertypeSliderMin) {
      pertypeSliderMin.addEventListener("input", () => {
        this.sliderConfig.minValue = parseInt(pertypeSliderMin.value) || 5;
        this.rerenderPerTypeLimitsPanel();
      });
    }
    if (pertypeSliderMax) {
      pertypeSliderMax.addEventListener("input", () => {
        this.sliderConfig.maxValue = parseInt(pertypeSliderMax.value) || 500;
        this.rerenderPerTypeLimitsPanel();
      });
    }
    if (pertypeSliderStep) {
      pertypeSliderStep.addEventListener("input", () => {
        this.sliderConfig.sliderStep = parseInt(pertypeSliderStep.value) || 50;
        this.rerenderPerTypeLimitsPanel();
      });
    }
    if (pertypeSliderBtnStep) {
      pertypeSliderBtnStep.addEventListener("input", () => {
        this.sliderConfig.buttonStep =
          parseInt(pertypeSliderBtnStep.value) || 10;
      });
    }

    // Attach events for "By File Type" view sliders
    this.attachPerTypeByFileTypeEvents();

    // Note: Copy/Download button events are now attached dynamically per-card in updateCodeOutput()
  }

  /**
   * Copy text to clipboard with visual feedback
   */
  copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
      btn.classList.add("fu-config-builder-copy-success");
      const originalHtml = btn.innerHTML;
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        Copied!
      `;
      setTimeout(() => {
        btn.classList.remove("fu-config-builder-copy-success");
        btn.innerHTML = originalHtml;
      }, 2000);
    });
  }

  /**
   * Download text as a file
   */
  downloadFile(content, filename, mimeType) {
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
   * Update extensions from UI
   */
  updateExtensionsFromUI(container) {
    const selected = Array.from(
      container.querySelectorAll(".fu-config-builder-ext.selected")
    ).map((e) => e.dataset.ext);
    this.config[container.dataset.option] = selected;
    this.onConfigChange();
  }

  /**
   * Update MIME types from UI
   */
  updateMimeTypesFromUI(container) {
    const selected = Array.from(
      container.querySelectorAll(".fu-config-builder-mime.selected")
    ).map((m) => m.dataset.mime);
    this.config[container.dataset.option] = selected;
    this.onConfigChange();
  }

  /**
   * Update all size sliders with current slider config
   */
  updateAllSizeSliders() {
    this.element
      .querySelectorAll(
        '.fu-config-builder-size-slider[data-type="sizeSlider"]'
      )
      .forEach((container) => {
        const slider = container.querySelector(
          ".fu-config-builder-slider-input"
        );
        const valueInput = container.querySelector(
          ".fu-config-builder-slider-value-input"
        );
        const unitDropdown = container.querySelector(
          ".fu-config-builder-unit-dropdown"
        );
        const labels = container.querySelectorAll(
          ".fu-config-builder-slider-label"
        );

        // Get current unit from dropdown or fallback to configured unit
        const currentUnit = unitDropdown?.value || this.sliderConfig.unit;
        const minValue = this.bytesToUnit(
          this.getSliderMinBytes(),
          currentUnit
        );
        const maxValue = this.bytesToUnit(
          this.getSliderMaxBytes(),
          currentUnit
        );
        const stepValue = Math.max(
          1,
          this.bytesToUnit(this.getSliderStepBytes(), currentUnit)
        );

        if (slider) {
          slider.min = minValue;
          slider.max = maxValue;
          slider.step = stepValue;
          // Clamp current value
          const currentValue = parseInt(slider.value) || minValue;
          slider.value = Math.max(minValue, Math.min(maxValue, currentValue));
        }

        if (valueInput) {
          valueInput.min = minValue;
          valueInput.max = maxValue;
          const currentValue = parseInt(valueInput.value) || minValue;
          valueInput.value = Math.max(
            minValue,
            Math.min(maxValue, currentValue)
          );
        }

        // Update range labels
        if (labels.length >= 2) {
          labels[0].textContent = `${minValue} ${currentUnit}`;
          labels[1].textContent = `${maxValue} ${currentUnit}`;
        }
      });
  }

  /**
   * Sync all unit dropdowns in a section to the same unit (without converting values)
   * @param {string} newUnit - The new unit to set (bytes, KB, MB, GB)
   * @param {string} sectionType - Either "sizeSlider" or "perType"
   */
  syncUnitDropdowns(newUnit, sectionType) {
    if (sectionType === "sizeSlider") {
      // Sync all unit dropdowns in File Size Limits section
      this.element
        .querySelectorAll(
          '.fu-config-builder-size-slider[data-type="sizeSlider"] .fu-config-builder-unit-dropdown'
        )
        .forEach((dropdown) => {
          if (dropdown.value !== newUnit) {
            dropdown.value = newUnit;
            // Reset the slider value to 0 when unit changes
            const container = dropdown.closest(
              ".fu-config-builder-size-slider"
            );
            const slider = container?.querySelector(
              ".fu-config-builder-slider-input"
            );
            const valueInput = container?.querySelector(
              ".fu-config-builder-slider-value-input"
            );
            if (slider) slider.value = 0;
            if (valueInput) valueInput.value = "";
            // Clear the config value for this option
            const optionKey = container?.dataset.option;
            if (optionKey) {
              this.config[optionKey] = 0;
            }
          }
        });
    } else if (sectionType === "perType") {
      // Sync all unit dropdowns in Per-Type Limits section
      this.element
        .querySelectorAll(
          ".fu-config-builder-filetype-card .fu-config-builder-unit-dropdown-sm"
        )
        .forEach((dropdown) => {
          if (dropdown.value !== newUnit) {
            dropdown.value = newUnit;
          }
        });
    }
  }

  /**
   * Apply a preset configuration
   */
  applyPreset(preset) {
    // Track current preset
    this.currentPreset = preset;

    // Custom preset keeps current config, others reset to defaults first
    if (preset !== "custom") {
      this.config = this.getDefaultConfig();
    }

    switch (preset) {
      case "custom":
        // Custom preset - keep current config as is, just mark as custom
        break;

      case "minimal":
        this.config.showLimits = false;
        this.config.enableScreenCapture = false;
        this.config.enableVideoRecording = false;
        this.config.enableAudioRecording = false;
        this.config.enableFullPageCapture = false;
        this.config.enableRegionCapture = false;
        this.config.showDownloadAllButton = false;
        this.config.showClearAllButton = false;
        break;

      case "images-only":
        this.config.allowedExtensions = [
          "jpg",
          "jpeg",
          "png",
          "gif",
          "webp",
          "svg",
        ];
        this.config.perFileMaxSize = 5 * 1024 * 1024;
        this.config.maxFiles = 20;
        break;

      case "documents":
        this.config.allowedExtensions = [
          "pdf",
          "doc",
          "docx",
          "xls",
          "xlsx",
          "ppt",
          "pptx",
          "txt",
          "csv",
        ];
        this.config.perFileMaxSize = 25 * 1024 * 1024;
        this.config.enableScreenCapture = false;
        this.config.enableVideoRecording = false;
        this.config.enableAudioRecording = false;
        this.config.enableFullPageCapture = false;
        this.config.enableRegionCapture = false;
        break;

      case "media":
        this.config.allowedExtensions = [
          "jpg",
          "jpeg",
          "png",
          "gif",
          "mp4",
          "webm",
          "mp3",
          "wav",
        ];
        this.config.perFileMaxSize = 100 * 1024 * 1024;
        this.config.totalMaxSize = 500 * 1024 * 1024;
        break;

      case "single-file":
        this.config.multiple = false;
        this.config.maxFiles = 1;
        this.config.showDownloadAllButton = false;
        this.config.showClearAllButton = false;
        break;
    }

    // Update the current uploader instance's preset immediately
    if (
      this.activeUploaderId &&
      this.uploaderInstances[this.activeUploaderId]
    ) {
      this.uploaderInstances[this.activeUploaderId].preset = preset;
    }

    // Re-render and update
    this.render();
    this.attachEvents();
    this.initTooltips();
    this.onConfigChange(true); // Pass true to indicate this is from preset (don't clear selection)
  }

  /**
   * Update dependent options visibility based on their parent option state
   */
  updateDependentOptions(parentOptionKey) {
    const isEnabled = this.config[parentOptionKey] === true;

    // Find all elements that depend on this option
    this.element
      .querySelectorAll(`[data-depends-on="${parentOptionKey}"]`)
      .forEach((wrapper) => {
        if (isEnabled) {
          wrapper.classList.remove("fu-config-builder-disabled");
          // Enable inputs inside
          wrapper.querySelectorAll("input, select").forEach((el) => {
            el.disabled = false;
          });
          wrapper.querySelectorAll(".fu-config-builder-group").forEach((el) => {
            el.classList.remove("disabled");
          });
          wrapper
            .querySelectorAll(".fu-config-builder-toggle")
            .forEach((el) => {
              el.dataset.disabled = "false";
              el.classList.remove("disabled");
            });
          wrapper.querySelectorAll(".fu-config-builder-tags").forEach((el) => {
            el.dataset.disabled = "false";
            el.classList.remove("disabled");
          });
          wrapper.querySelectorAll(".fu-config-builder-tag").forEach((el) => {
            el.classList.remove("disabled");
          });
        } else {
          wrapper.classList.add("fu-config-builder-disabled");
          // Disable inputs inside
          wrapper.querySelectorAll("input, select").forEach((el) => {
            el.disabled = true;
          });
          wrapper.querySelectorAll(".fu-config-builder-group").forEach((el) => {
            el.classList.add("disabled");
          });
          wrapper
            .querySelectorAll(".fu-config-builder-toggle")
            .forEach((el) => {
              el.dataset.disabled = "true";
              el.classList.add("disabled");
            });
          wrapper.querySelectorAll(".fu-config-builder-tags").forEach((el) => {
            el.dataset.disabled = "true";
            el.classList.add("disabled");
          });
          wrapper.querySelectorAll(".fu-config-builder-tag").forEach((el) => {
            el.classList.add("disabled");
          });
        }
      });
  }

  /**
   * Switch to custom preset (when user manually changes an option)
   */
  clearPresetSelection() {
    if (this.currentPreset && this.currentPreset !== "custom") {
      this.currentPreset = "custom";
      this.element
        .querySelectorAll(".fu-config-builder-preset")
        .forEach((btn) => {
          btn.classList.remove("active");
          if (btn.dataset.preset === "custom") {
            btn.classList.add("active");
          }
        });
    }
  }

  /**
   * Update visibility of options with showWhen conditions
   */
  updateShowWhenOptions() {
    // Iterate through all option definitions to find showWhen options
    for (const [categoryKey, category] of Object.entries(
      this.optionDefinitions
    )) {
      for (const [optionKey, def] of Object.entries(category.options)) {
        if (def.showWhen && typeof def.showWhen === "function") {
          const wrapper = this.element.querySelector(
            `[data-option-key="${optionKey}"]`
          );
          if (wrapper) {
            const shouldShow = def.showWhen(this.config);
            if (shouldShow) {
              wrapper.classList.remove("fu-config-builder-hidden");
              wrapper.classList.remove("fu-config-builder-disabled");
              // Enable inputs inside
              wrapper.querySelectorAll("input, select").forEach((el) => {
                el.disabled = false;
              });
              wrapper
                .querySelectorAll(".fu-config-builder-group")
                .forEach((el) => {
                  el.classList.remove("disabled");
                });
            } else {
              wrapper.classList.add("fu-config-builder-hidden");
            }
          }
        }

        // Handle filterOptions for multiSelect - update disabled state of tags
        if (def.type === "multiSelect" && def.filterOptions) {
          const container = this.element.querySelector(
            `.fu-config-builder-tags[data-option="${optionKey}"]`
          );
          if (container) {
            const availableOptions = def.filterOptions(this.config);
            const currentSelected = this.config[optionKey] || [];

            // Update each tag's disabled state
            container
              .querySelectorAll(".fu-config-builder-tag")
              .forEach((tag) => {
                const value = tag.dataset.value;
                const isAvailable = availableOptions.includes(value);

                if (isAvailable) {
                  tag.classList.remove("disabled");
                  tag.removeAttribute("title");
                } else {
                  tag.classList.add("disabled");
                  tag.classList.remove("selected"); // Deselect if disabled
                  tag.setAttribute(
                    "title",
                    "Enable this option in Media Capture settings first"
                  );
                }
              });

            // Update config to remove any selected values that are no longer available
            const validSelected = currentSelected.filter((s) =>
              availableOptions.includes(s)
            );
            if (validSelected.length !== currentSelected.length) {
              this.config[optionKey] = validSelected;
            }
          }
        }
      }
    }
  }

  /**
   * Handle config change
   */
  onConfigChange(fromPreset = false) {
    // Clear preset selection if change was from manual user interaction
    if (!fromPreset) {
      this.clearPresetSelection();
    }

    // Update showWhen option visibility
    this.updateShowWhenOptions();

    this.updateCodeOutput();

    // Debounce preview updates to avoid too many re-renders
    if (this._previewTimeout) {
      clearTimeout(this._previewTimeout);
    }

    this._previewTimeout = setTimeout(() => {
      this.updatePreview();
      this.showPreviewFeedback();
      // Refresh CSS variables panel - elements may have appeared/disappeared due to config change
      this.refreshCssVarsPanels();
    }, 300);

    if (this.options.onConfigChange) {
      this.options.onConfigChange(this.config);
    }
  }

  /**
   * Show visual feedback that preview was updated
   */
  showPreviewFeedback() {
    const previewArea = this.element.querySelector(
      ".fu-config-builder-preview-area"
    );
    if (!previewArea) return;

    // Add flash animation
    previewArea.style.transition = "box-shadow 0.3s ease";
    previewArea.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.5)";

    // Show toast notification
    this.showToast("Preview updated");

    setTimeout(() => {
      previewArea.style.boxShadow = "none";
    }, 500);
  }

  /**
   * Show a toast notification
   */
  showToast(message) {
    // Remove existing toast
    const existingToast = this.element.querySelector(
      ".fu-config-builder-toast"
    );
    if (existingToast) {
      existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement("div");
    toast.className = "fu-config-builder-toast";
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      <span>${message}</span>
    `;

    // Style the toast
    Object.assign(toast.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "12px 20px",
      background: "#10b981",
      color: "#ffffff",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "500",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      zIndex: "10000",
      animation: "toastSlideIn 0.3s ease",
    });

    // Add animation keyframes if not exists
    if (!document.querySelector("#fu-toast-styles")) {
      const style = document.createElement("style");
      style.id = "fu-toast-styles";
      style.textContent = `
        @keyframes toastSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes toastSlideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // Auto remove after delay
    setTimeout(() => {
      toast.style.animation = "toastSlideOut 0.3s ease forwards";
      setTimeout(() => toast.remove(), 300);
    }, 1500);
  }

  /**
   * Update the code output - generates individual cards for each uploader
   */
  updateCodeOutput() {
    // Make sure active uploader's config is saved
    if (
      this.activeUploaderId &&
      this.uploaderInstances[this.activeUploaderId]
    ) {
      this.uploaderInstances[this.activeUploaderId].config = { ...this.config };
    }

    const jsCardsEl = this.element.querySelector("#js-code-cards");
    const phpCardsEl = this.element.querySelector("#php-code-cards");
    const modalHtmlCardsEl = this.element.querySelector("#modal-html-cards");
    const modalCssCardsEl = this.element.querySelector("#modal-css-cards");
    const modalJsCardsEl = this.element.querySelector("#modal-js-cards");
    const modalTabBtn = this.element.querySelector(
      ".fu-config-builder-modal-tab"
    );

    if (jsCardsEl) {
      jsCardsEl.innerHTML = this.renderCodeCards("js");
      this.attachCodeCardEvents(jsCardsEl, "js");
    }

    if (phpCardsEl) {
      phpCardsEl.innerHTML = this.renderCodeCards("php");
      this.attachCodeCardEvents(phpCardsEl, "php");
    }

    // Check if any uploader has modal display mode
    const hasModalMode = Object.values(this.uploaderInstances).some(
      (data) =>
        data.config.displayMode === "modal-minimal" ||
        data.config.displayMode === "modal-detailed"
    );

    // Show/hide modal tab button
    if (modalTabBtn) {
      modalTabBtn.style.display = hasModalMode ? "" : "none";
    }

    // Update modal code cards (separate subtabs for HTML, CSS, JS)
    if (hasModalMode) {
      if (modalHtmlCardsEl) {
        modalHtmlCardsEl.innerHTML = this.renderCodeCards("modal-html");
        this.attachCodeCardEvents(modalHtmlCardsEl, "modal");
      }
      if (modalCssCardsEl) {
        modalCssCardsEl.innerHTML = this.renderCodeCards("modal-css");
        this.attachCodeCardEvents(modalCssCardsEl, "modal");
      }
      if (modalJsCardsEl) {
        modalJsCardsEl.innerHTML = this.renderCodeCards("modal-js");
        this.attachCodeCardEvents(modalJsCardsEl, "modal");
      }
    } else {
      if (modalHtmlCardsEl) modalHtmlCardsEl.innerHTML = "";
      if (modalCssCardsEl) modalCssCardsEl.innerHTML = "";
      if (modalJsCardsEl) modalJsCardsEl.innerHTML = "";
    }
  }

  /**
   * Render code cards for all uploaders
   */
  renderCodeCards(type) {
    const uploaders = Object.entries(this.uploaderInstances);
    let html = "";

    uploaders.forEach(([id, data]) => {
      // Skip uploaders without modal mode for modal subtabs
      if (type.startsWith("modal-")) {
        const displayMode = data.config.displayMode || "inline";
        if (
          displayMode !== "modal-minimal" &&
          displayMode !== "modal-detailed"
        ) {
          return;
        }
        // Render specific modal section (html, css, or js)
        const section = type.replace("modal-", "");
        html += this.renderModalCodeSection(id, data, section);
        return;
      }

      const isActive = id === this.activeUploaderId;

      // Check if "include defaults" is enabled for this uploader/type (JS only)
      const includeDefaultsKey = `${id}-${type}-includeDefaults`;
      const includeDefaults = this.includeDefaultsState?.[includeDefaultsKey] || false;

      let code;
      if (type === "js") {
        code = this.generateSingleUploaderJsCode(id, data, includeDefaults);
      } else if (type === "php") {
        // PHP always includes all defaults with changed values marked
        code = this.generateSingleUploaderPhpCode(id, data);
      }

      const highlightedCode =
        type === "js"
          ? this.highlightJsCode(code)
          : this.highlightPhpCode(code);

      // Generate defaults section code (JS only - PHP already shows all defaults)
      let defaultsSection = "";
      if (type === "js") {
        const defaultsCode = this.generateDefaultsOnlyCode(id, data, type);
        const highlightedDefaultsCode = this.highlightJsCode(defaultsCode);
        defaultsSection = `
          <!-- Defaults Reference Section (not included in copy) -->
          <div class="fu-config-builder-defaults-section" data-uploader-id="${id}" data-type="${type}">
            <div class="fu-config-builder-defaults-header" data-action="toggle-defaults-section" data-uploader-id="${id}" data-type="${type}">
              <svg class="fu-config-builder-defaults-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              <span>Default Values Reference</span>
              <span class="fu-config-builder-defaults-hint">(for reference only - not copied)</span>
            </div>
            <div class="fu-config-builder-defaults-content">
              <pre>${highlightedDefaultsCode}</pre>
            </div>
          </div>`;
      }

      // Generate filename from uploader name
      const filename =
        data.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || `uploader`;

      const fileExt = type === "js" ? "js" : "php";

      // Include Defaults toggle only for JS (PHP always shows all defaults)
      const includeDefaultsToggle = type === "js" ? `
                <label class="fu-config-builder-code-toggle" title="Include all default values in the generated code">
                  <input type="checkbox" data-action="toggle-defaults" data-uploader-id="${id}" data-type="${type}" ${includeDefaults ? "checked" : ""}>
                  <span>Include Defaults</span>
                </label>` : "";

      html += `
        <div class="fu-config-builder-code-card ${
          isActive ? "active" : ""
        }" data-uploader-id="${id}">
          <div class="fu-config-builder-code">
            <div class="fu-config-builder-code-header">
              <span class="fu-config-builder-code-title">${data.name}${
        isActive
          ? ' <span class="fu-config-builder-code-badge">Editing</span>'
          : ""
      }</span>
              <div class="fu-config-builder-code-actions">${includeDefaultsToggle}
                <button class="fu-config-builder-code-btn" data-action="copy" data-uploader-id="${id}" data-type="${type}">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                  Copy
                </button>
                <button class="fu-config-builder-code-btn" data-action="download" data-uploader-id="${id}" data-type="${type}" data-filename="${filename}" data-ext="${fileExt}">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download
                </button>
              </div>
            </div>
            <div class="fu-config-builder-code-content">
              <pre>${highlightedCode}</pre>
            </div>
          </div>${defaultsSection}
        </div>
      `;
    });

    return html;
  }

  /**
   * Render a single modal code section (html, css, or js) as a card
   * @param {string} id - Uploader ID
   * @param {Object} data - Uploader data
   * @param {string} section - Section type: 'html', 'css', or 'js'
   */
  renderModalCodeSection(id, data, section) {
    const isActive = id === this.activeUploaderId;
    const displayMode = data.config.displayMode || "inline";
    const isMinimal = displayMode === "modal-minimal";

    // Generate variable name from uploader name
    const varName =
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "") || "uploader";

    const filename =
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || `uploader`;

    const modeBadge = `<span class="fu-config-builder-mode-badge">${
      isMinimal ? "Minimal" : "Detailed"
    } Mode</span>`;
    const editingBadge = isActive
      ? ' <span class="fu-config-builder-code-badge">Editing</span>'
      : "";

    let code, highlightedCode, ext;

    if (section === "html") {
      code = this.generateModalHtmlOnly(varName, data.config);
      highlightedCode = this.highlightHtmlCode(code);
      ext = "html";
    } else if (section === "css") {
      code = this.generateModalCss(isMinimal);
      highlightedCode = this.highlightCssCode(code);
      ext = "css";
    } else {
      const changedConfig = this.getChangedConfig(data.config);
      code = this.generateModalJsOnly(varName, data.config, changedConfig);
      highlightedCode = this.highlightJsCode(code);
      ext = "js";
    }

    return `
      <div class="fu-config-builder-code-card ${
        isActive ? "active" : ""
      }" data-uploader-id="${id}" data-modal-section="${section}">
        <div class="fu-config-builder-code">
          <div class="fu-config-builder-code-header">
            <span class="fu-config-builder-code-title">${
              data.name
            }${editingBadge} ${modeBadge}</span>
            <div class="fu-config-builder-code-actions">
              <button class="fu-config-builder-code-btn" data-action="copy-section" data-section="${section}" data-uploader-id="${id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                Copy
              </button>
              <button class="fu-config-builder-code-btn" data-action="download-section" data-section="${section}" data-uploader-id="${id}" data-filename="${filename}-modal" data-ext="${ext}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download
              </button>
            </div>
          </div>
          <div class="fu-config-builder-code-content">
            <pre>${highlightedCode}</pre>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate only the HTML portion of modal code (without CSS/JS)
   */
  generateModalHtmlOnly(varName, config) {
    const displayMode = config.displayMode;
    const buttonText = config.modalButtonText || "Upload Files";
    const buttonIcon = config.modalButtonIcon || "upload";
    const modalTitle = config.modalTitle || "Upload Files";
    const modalSize = config.modalSize || "lg";
    const bootstrapVersion = config.bootstrapVersion || "5";
    // Filter media buttons to only include those whose capture option is enabled
    const mediaButtons = this.filterEnabledMediaButtons(
      config.modalMediaButtons || [],
      config
    );

    const modalId = `${varName}Modal`;
    const containerId = `${varName}Container`;
    const isMinimal = displayMode === "modal-minimal";

    const iconSvg = this.getModalButtonIconSvg(buttonIcon);

    return this.generateModalHtml(
      varName,
      modalId,
      containerId,
      buttonText,
      iconSvg,
      modalTitle,
      modalSize,
      bootstrapVersion,
      isMinimal,
      mediaButtons
    );
  }

  /**
   * Generate only the JS portion of modal code (without HTML/CSS)
   */
  generateModalJsOnly(varName, config, changedConfig) {
    const displayMode = config.displayMode;
    const bootstrapVersion = config.bootstrapVersion || "5";
    const isMinimal = displayMode === "modal-minimal";
    // Filter media buttons to only include those whose capture option is enabled
    const mediaButtons = this.filterEnabledMediaButtons(
      config.modalMediaButtons || [],
      config
    );
    const enableModalDropZone = config.enableModalDropZone !== false;

    const modalId = `${varName}Modal`;
    const containerId = `${varName}Container`;

    return this.generateModalJs(
      varName,
      modalId,
      containerId,
      changedConfig,
      bootstrapVersion,
      isMinimal,
      mediaButtons,
      enableModalDropZone
    );
  }

  /**
   * Highlight HTML code with syntax coloring
   */
  highlightHtmlCode(code) {
    // Escape HTML entities first
    let escaped = this.escapeHtml(code);

    // Highlight HTML tags
    escaped = escaped.replace(
      /(&lt;\/?)([\w-]+)/g,
      '$1<span class="fu-config-builder-code-tag">$2</span>'
    );

    // Highlight attributes
    escaped = escaped.replace(
      /\s([\w-]+)=/g,
      ' <span class="fu-config-builder-code-attr">$1</span>='
    );

    // Highlight attribute values
    escaped = escaped.replace(
      /=(&quot;[^&]*&quot;)/g,
      '=<span class="fu-config-builder-code-string">$1</span>'
    );

    // Highlight comments
    escaped = escaped.replace(
      /(&lt;!--[\s\S]*?--&gt;)/g,
      '<span class="fu-config-builder-code-comment">$1</span>'
    );

    return escaped;
  }

  /**
   * Highlight CSS code with syntax coloring
   */
  highlightCssCode(code) {
    // Escape HTML entities first
    let escaped = this.escapeHtml(code);

    // Highlight selectors (before {)
    escaped = escaped.replace(
      /^([^{]+)\{/gm,
      '<span class="fu-config-builder-code-selector">$1</span>{'
    );

    // Highlight properties
    escaped = escaped.replace(
      /\s+([\w-]+):/g,
      '\n  <span class="fu-config-builder-code-property">$1</span>:'
    );

    // Highlight values (after :)
    escaped = escaped.replace(
      /:\s*([^;]+);/g,
      ': <span class="fu-config-builder-code-value">$1</span>;'
    );

    // Highlight comments
    escaped = escaped.replace(
      /(\/\*[\s\S]*?\*\/)/g,
      '<span class="fu-config-builder-code-comment">$1</span>'
    );

    return escaped;
  }

  /**
   * Attach event handlers to code card buttons
   */
  attachCodeCardEvents(container, type) {
    // Initialize includeDefaultsState if not exists
    if (!this.includeDefaultsState) {
      this.includeDefaultsState = {};
    }

    // Toggle defaults checkbox
    container.querySelectorAll('[data-action="toggle-defaults"]').forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const uploaderId = checkbox.dataset.uploaderId;
        const checkboxType = checkbox.dataset.type;
        const includeDefaultsKey = `${uploaderId}-${checkboxType}-includeDefaults`;
        this.includeDefaultsState[includeDefaultsKey] = checkbox.checked;
        this.updateCodeOutput();
      });
    });

    // Toggle defaults section visibility
    container.querySelectorAll('[data-action="toggle-defaults-section"]').forEach((header) => {
      header.addEventListener("click", () => {
        const section = header.closest(".fu-config-builder-defaults-section");
        if (section) {
          section.classList.toggle("expanded");
        }
      });
    });

    // Standard copy buttons (for JS and PHP tabs)
    container.querySelectorAll('[data-action="copy"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        const uploaderId = btn.dataset.uploaderId;
        const uploaderData = this.uploaderInstances[uploaderId];
        const btnType = btn.dataset.type;
        const includeDefaultsKey = `${uploaderId}-${btnType}-includeDefaults`;
        const includeDefaults = this.includeDefaultsState?.[includeDefaultsKey] || false;
        let code;
        if (type === "js") {
          code = this.generateSingleUploaderJsCode(uploaderId, uploaderData, includeDefaults);
        } else if (type === "php") {
          code = this.generateSingleUploaderPhpCode(uploaderId, uploaderData, includeDefaults);
        }
        this.copyToClipboard(code, btn);
      });
    });

    // Standard download buttons (for JS and PHP tabs)
    container.querySelectorAll('[data-action="download"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        const uploaderId = btn.dataset.uploaderId;
        const uploaderData = this.uploaderInstances[uploaderId];
        const filename = btn.dataset.filename;
        const btnType = btn.dataset.type;
        const includeDefaultsKey = `${uploaderId}-${btnType}-includeDefaults`;
        const includeDefaults = this.includeDefaultsState?.[includeDefaultsKey] || false;
        let code, ext, mimeType;
        if (type === "js") {
          code = this.generateSingleUploaderJsCode(uploaderId, uploaderData, includeDefaults);
          ext = "js";
          mimeType = "text/javascript";
        } else if (type === "php") {
          code = this.generateSingleUploaderPhpCode(uploaderId, uploaderData, includeDefaults);
          ext = "php";
          mimeType = "text/php";
        }
        this.downloadFile(code, `${filename}-config.${ext}`, mimeType);
      });
    });

    // Section-specific copy buttons (for Modal tab)
    container
      .querySelectorAll('[data-action="copy-section"]')
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const uploaderId = btn.dataset.uploaderId;
          const section = btn.dataset.section;
          const uploaderData = this.uploaderInstances[uploaderId];
          const code = this.getModalSectionCode(
            uploaderId,
            uploaderData,
            section
          );
          this.copyToClipboard(code, btn);
        });
      });

    // Section-specific download buttons (for Modal tab)
    container
      .querySelectorAll('[data-action="download-section"]')
      .forEach((btn) => {
        btn.addEventListener("click", () => {
          const uploaderId = btn.dataset.uploaderId;
          const section = btn.dataset.section;
          const filename = btn.dataset.filename;
          const ext = btn.dataset.ext;
          const uploaderData = this.uploaderInstances[uploaderId];
          const code = this.getModalSectionCode(
            uploaderId,
            uploaderData,
            section
          );
          const mimeType =
            section === "js"
              ? "text/javascript"
              : section === "css"
              ? "text/css"
              : "text/html";
          this.downloadFile(code, `${filename}.${ext}`, mimeType);
        });
      });
  }

  /**
   * Get modal section code (HTML, CSS, or JS)
   */
  getModalSectionCode(uploaderId, uploaderData, section) {
    const config = uploaderData.config;
    const displayMode = config.displayMode || "inline";
    const isMinimal = displayMode === "modal-minimal";

    const varName =
      uploaderData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "") || "uploader";

    const changedConfig = this.getChangedConfig(config);

    if (section === "html") {
      return this.generateModalHtmlOnly(varName, config);
    } else if (section === "css") {
      return this.generateModalCss(isMinimal);
    } else if (section === "js") {
      return this.generateModalJsOnly(varName, config, changedConfig);
    }

    return "";
  }

  /**
   * Generate JS code for a single uploader
   * Always generates plain FileUploader config, never modal wrapper code
   * @param {string} id - Uploader ID
   * @param {Object} data - Uploader data
   * @param {boolean} includeDefaults - Whether to include default values in the output
   */
  generateSingleUploaderJsCode(id, data, includeDefaults = false) {
    const changedConfig = this.getChangedConfig(data.config);
    const displayMode = data.config.displayMode || "inline";

    // Generate variable name from uploader name
    const varName =
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "") || "uploader";

    // For modal modes, use the container ID as selector
    const containerId =
      displayMode === "modal-minimal" || displayMode === "modal-detailed"
        ? `${varName}Container`
        : varName;

    // Group the changed config by category
    const groupedConfig = this.groupChangedConfig(changedConfig);
    const hasChanges = Object.keys(changedConfig).length > 0;

    // If includeDefaults is true, merge defaults with changed config
    let configToOutput = groupedConfig;
    if (includeDefaults) {
      configToOutput = this.getMergedConfigWithDefaults(changedConfig, "js");
    }

    let code = "";

    const groupKeys = GROUP_ORDER.filter((g) => configToOutput[g]);

    if (!hasChanges && !includeDefaults) {
      code += `const ${varName} = new FileUploader('#${containerId}');`;
      return code;
    }

    if (groupKeys.length === 0) {
      code += `const ${varName} = new FileUploader('#${containerId}');`;
      return code;
    }

    code += `const ${varName} = new FileUploader('#${containerId}', {\n`;

    // Output grouped config
    groupKeys.forEach((groupKey, groupIndex) => {
      const groupTitle = GROUP_TITLES[groupKey] || groupKey;
      const groupEntries = Object.entries(configToOutput[groupKey]);
      const isLastGroup = groupIndex === groupKeys.length - 1;

      code += `  // ${groupTitle}\n`;
      code += `  ${groupKey}: {\n`;

      groupEntries.forEach(([key, value], index) => {
        const comma = index < groupEntries.length - 1 ? "," : "";
        const formattedValue = this.formatJsValue(key, value, "    ", comma);
        code += `    ${key}: ${formattedValue}\n`;
      });

      code += `  }${isLastGroup ? "" : ","}\n`;
    });

    code += `});`;

    return code;
  }

  /**
   * Get merged config with defaults for display purposes
   * @param {Object} changedConfig - The changed configuration values
   * @param {string} language - 'js' or 'php'
   * @returns {Object} - Grouped config with all defaults included
   */
  getMergedConfigWithDefaults(changedConfig, language = "js") {
    const defaults = this.getDefaultConfig();
    const changedKeys = Object.keys(changedConfig);

    // PHP-relevant keys only (server-side validation)
    const phpRelevantKeys = [
      "allowedExtensions",
      "allowedMimeTypes",
      "imageExtensions",
      "videoExtensions",
      "audioExtensions",
      "documentExtensions",
      "archiveExtensions",
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
      "uploadDir",
    ];

    // PHP-relevant groups only
    const phpRelevantGroups = ["limits", "perTypeLimits", "fileTypes", "urls"];

    // Group all defaults by category
    const groupedDefaults = {};
    Object.entries(defaults).forEach(([key, defaultValue]) => {
      // For PHP, skip non-relevant keys
      if (language === "php" && !phpRelevantKeys.includes(key)) return;

      const group = OPTION_TO_GROUP[key] || "other";

      // For PHP, skip non-relevant groups
      if (language === "php" && !phpRelevantGroups.includes(group)) return;

      if (!groupedDefaults[group]) {
        groupedDefaults[group] = {};
      }

      // Use changed value if available, otherwise use default
      groupedDefaults[group][key] = changedKeys.includes(key)
        ? changedConfig[key]
        : defaultValue;
    });

    return groupedDefaults;
  }

  /**
   * Generate defaults-only code for display in a separate section
   * @param {string} id - Uploader ID
   * @param {Object} data - Uploader data
   * @param {string} language - 'js' or 'php'
   * @returns {string} - Code showing only default values
   */
  generateDefaultsOnlyCode(id, data, language = "js") {
    const changedConfig = this.getChangedConfig(data.config, language === "php");
    const changedKeys = Object.keys(changedConfig);

    // Get defaults - use fileUploaderDefaults (flattened) for accurate defaults
    let defaults = this.fileUploaderDefaults;

    // Fallback to getDefaultConfig if fileUploaderDefaults is empty
    if (!defaults || Object.keys(defaults).length === 0) {
      defaults = this.getDefaultConfig();
    }

    // PHP-relevant groups for server-side validation
    const phpRelevantGroups = ["urls", "limits", "perTypeLimits", "fileTypes"];

    // Hardcoded PHP defaults as ultimate fallback
    const phpDefaults = {
      uploadDir: "",
      perFileMaxSize: 10 * 1024 * 1024,
      perFileMaxSizeDisplay: "10MB",
      totalMaxSize: 100 * 1024 * 1024,
      totalMaxSizeDisplay: "100MB",
      maxFiles: 10,
      perFileMaxSizePerType: {},
      perFileMaxSizePerTypeDisplay: {},
      perTypeMaxTotalSize: {},
      perTypeMaxTotalSizeDisplay: {},
      perTypeMaxFileCount: {},
      allowedExtensions: [],
      imageExtensions: ["jpg", "jpeg", "png", "gif", "webp", "svg"],
      videoExtensions: ["mp4", "mpeg", "mov", "avi", "webm"],
      audioExtensions: ["mp3", "wav", "ogg", "webm", "aac", "m4a", "flac"],
      documentExtensions: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv"],
      archiveExtensions: ["zip", "rar", "7z", "tar", "gz"],
    };

    // Define which keys belong to which PHP group
    const phpGroupKeys = {
      urls: ["uploadDir"],
      limits: ["perFileMaxSize", "perFileMaxSizeDisplay", "totalMaxSize", "totalMaxSizeDisplay", "maxFiles"],
      perTypeLimits: ["perFileMaxSizePerType", "perFileMaxSizePerTypeDisplay", "perTypeMaxTotalSize", "perTypeMaxTotalSizeDisplay", "perTypeMaxFileCount"],
      fileTypes: ["allowedExtensions", "imageExtensions", "videoExtensions", "audioExtensions", "documentExtensions", "archiveExtensions"],
    };

    if (language === "php") {
      let code = "[\n";
      let groupIndex = 0;
      const totalGroups = phpRelevantGroups.length;

      phpRelevantGroups.forEach((groupKey) => {
        const keysInGroup = phpGroupKeys[groupKey] || [];
        const groupTitle = PHP_GROUP_TITLES[groupKey] || GROUP_TITLES[groupKey] || groupKey;
        const isLastGroup = groupIndex === totalGroups - 1;
        groupIndex++;

        code += `    // ${groupTitle}\n`;
        code += `    '${groupKey}' => [\n`;

        keysInGroup.forEach((key, keyIndex) => {
          // Use defaults first, fallback to phpDefaults
          let value = defaults[key];
          if (value === undefined) {
            value = phpDefaults[key];
          }
          if (value === undefined) return; // Skip if still not found

          const isChanged = changedKeys.includes(key);
          const marker = isChanged ? " // <- changed" : "";
          const comma = keyIndex < keysInGroup.length - 1 ? "," : "";
          const phpValue = this.jsValueToPhp(value, key);
          code += `        '${key}' => ${phpValue}${comma}${marker}\n`;
        });

        code += `    ]${isLastGroup ? "" : ","}\n`;
      });

      code += "]";
      return code;
    } else {
      // For JS, group by OPTION_TO_GROUP mapping
      const groupedDefaults = {};
      Object.entries(defaults).forEach(([key, defaultValue]) => {
        const group = OPTION_TO_GROUP[key] || "other";
        if (!groupedDefaults[group]) {
          groupedDefaults[group] = {};
        }
        groupedDefaults[group][key] = defaultValue;
      });

      let code = "{\n";
      const groupKeys = GROUP_ORDER.filter((g) => groupedDefaults[g]);

      groupKeys.forEach((groupKey, groupIndex) => {
        const groupTitle = GROUP_TITLES[groupKey] || groupKey;
        const groupEntries = Object.entries(groupedDefaults[groupKey]);
        const isLastGroup = groupIndex === groupKeys.length - 1;

        code += `  // ${groupTitle}\n`;
        code += `  ${groupKey}: {\n`;

        groupEntries.forEach(([key, value], index) => {
          const isChanged = changedKeys.includes(key);
          const marker = isChanged ? " // <- changed" : "";
          const comma = index < groupEntries.length - 1 ? "," : "";
          const formattedValue = this.formatJsValue(key, value, "    ", comma);
          // Remove the comma from formattedValue and add marker before it
          const valueWithoutTrailingComma = formattedValue.replace(/,(\s*\/\/.*)?\s*$/, "$1");
          code += `    ${key}: ${valueWithoutTrailingComma}${comma}${marker}\n`;
        });

        code += `  }${isLastGroup ? "" : ","}\n`;
      });

      code += "}";
      return code;
    }
  }

  /**
   * Generate a comment block showing default configuration values in grouped format
   * @param {Object} changedConfig - The changed configuration values (used to mark which are changed)
   * @param {string} language - 'js' or 'php'
   * @returns {string} - Comment block with default values organized by group
   */
  generateDefaultsComment(changedConfig, language = "js") {
    const defaults = this.getDefaultConfig();
    const changedKeys = Object.keys(changedConfig);

    // PHP-relevant keys only (server-side validation)
    const phpRelevantKeys = [
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

    // PHP-relevant groups only (server-side validation)
    const phpRelevantGroups = ["limits", "perTypeLimits", "fileTypes", "urls"];

    // Group all defaults by category
    const groupedDefaults = {};
    Object.entries(defaults).forEach(([key, defaultValue]) => {
      const group = OPTION_TO_GROUP[key] || "other";
      if (!groupedDefaults[group]) {
        groupedDefaults[group] = {};
      }
      groupedDefaults[group][key] = defaultValue;
    });

    // Check if any groups have content
    const hasContent = Object.keys(groupedDefaults).length > 0;
    if (!hasContent) return "";

    if (language === "php") {
      // For PHP, only show server-relevant groups and keys
      let comment = "/**\n";
      comment +=
        " * Default configuration values for reference (server-relevant options):\n";
      comment += " * [\n";

      GROUP_ORDER.forEach((groupKey) => {
        // Skip non-PHP relevant groups
        if (!phpRelevantGroups.includes(groupKey)) return;
        if (!groupedDefaults[groupKey]) return;

        // Filter to only PHP-relevant keys within this group
        const phpKeysInGroup = Object.entries(groupedDefaults[groupKey]).filter(
          ([key]) => phpRelevantKeys.includes(key)
        );

        // Skip group if no PHP-relevant keys
        if (phpKeysInGroup.length === 0) return;

        const groupTitle =
          PHP_GROUP_TITLES[groupKey] || GROUP_TITLES[groupKey] || groupKey;
        comment += ` *   // ${groupTitle}\n`;
        comment += ` *   '${groupKey}' => [\n`;

        phpKeysInGroup.forEach(([key, value]) => {
          const formattedValue = this.formatDefaultValueForComment(
            key,
            value,
            language
          );
          const marker = changedKeys.includes(key) ? " // <- changed" : "";
          comment += ` *     '${key}' => ${formattedValue},${marker}\n`;
        });

        comment += ` *   ],\n`;
      });

      comment += " * ]\n";
      comment += " */\n\n";
      return comment;
    } else {
      let comment = "/**\n";
      comment += " * Default configuration values for reference (grouped):\n";
      comment += " * {\n";

      GROUP_ORDER.forEach((groupKey) => {
        if (!groupedDefaults[groupKey]) return;

        const groupTitle = GROUP_TITLES[groupKey] || groupKey;
        comment += ` *   // ${groupTitle}\n`;
        comment += ` *   ${groupKey}: {\n`;

        Object.entries(groupedDefaults[groupKey]).forEach(([key, value]) => {
          const formattedValue = this.formatDefaultValueForComment(
            key,
            value,
            language
          );
          const marker = changedKeys.includes(key) ? " // <- changed" : "";
          comment += ` *     ${key}: ${formattedValue},${marker}\n`;
        });

        comment += ` *   },\n`;
      });

      comment += " * }\n";
      comment += " */\n";
      return comment;
    }
  }

  /**
   * Format a default value for display in a comment
   * @param {string} key - The config key
   * @param {any} value - The default value
   * @param {string} language - 'js' or 'php'
   * @returns {string} - Formatted value string
   */
  formatDefaultValueForComment(key, value, language = "js") {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "number") {
      // Format size values
      if (this.isSizeKey(key)) {
        const formatted = this.formatSizeExpression(value);
        return `${formatted.expression} ${formatted.comment}`.trim();
      }
      // Format bitrate values
      if (this.isBitrateKey(key)) {
        const formatted = this.formatBitrateExpression(value);
        return `${formatted.expression} ${formatted.comment}`.trim();
      }
      return String(value);
    }
    if (typeof value === "string") {
      return language === "php" ? `'${value}'` : `'${value}'`;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return "[]";
      return JSON.stringify(value);
    }
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    return String(value);
  }

  /**
   * Generate modal wrapper code for a single uploader
   * Returns HTML + CSS + JS for modal integration
   */
  generateSingleUploaderModalCode(id, data) {
    const changedConfig = this.getChangedConfig(data.config);
    const displayMode = data.config.displayMode || "inline";

    // Only generate for modal modes
    if (displayMode !== "modal-minimal" && displayMode !== "modal-detailed") {
      return "";
    }

    // Generate variable name from uploader name
    const varName =
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "") || "uploader";

    return this.generateModalCode(varName, data, changedConfig);
  }

  /**
   * Generate modal wrapper code (HTML + JS)
   */
  generateModalCode(varName, data, changedConfig) {
    const config = data.config;
    const displayMode = config.displayMode;
    const buttonText = config.modalButtonText || "Upload Files";
    const buttonIcon = config.modalButtonIcon || "upload";
    const modalTitle = config.modalTitle || "Upload Files";
    const modalSize = config.modalSize || "lg";
    const bootstrapVersion = config.bootstrapVersion || "5";
    // Filter media buttons to only include those whose capture option is enabled
    const mediaButtons = this.filterEnabledMediaButtons(
      config.modalMediaButtons || [],
      config
    );
    const enableModalDropZone = config.enableModalDropZone !== false;

    const modalId = `${varName}Modal`;
    const containerId = `${varName}Container`;
    const isMinimal = displayMode === "modal-minimal";

    // Button icon SVG
    const iconSvg = this.getModalButtonIconSvg(buttonIcon);

    let code = `// ============================================\n`;
    code += `// ${data.name} - Modal Mode (${
      isMinimal ? "Minimal" : "Detailed"
    } Preview)\n`;
    code += `// ============================================\n\n`;

    // CSS Section (only once per mode type)
    code += `/* ----- CSS (add to your stylesheet) ----- */\n\n`;
    code += this.generateModalCss(isMinimal, mediaButtons);

    // HTML Section
    code += `\n\n/* ----- HTML ----- */\n\n`;
    code += this.generateModalHtml(
      varName,
      modalId,
      containerId,
      buttonText,
      iconSvg,
      modalTitle,
      modalSize,
      bootstrapVersion,
      isMinimal,
      mediaButtons
    );

    // JS Section
    code += `\n\n/* ----- JavaScript ----- */\n\n`;
    code += this.generateModalJs(
      varName,
      modalId,
      containerId,
      changedConfig,
      bootstrapVersion,
      isMinimal,
      mediaButtons,
      enableModalDropZone
    );

    return code;
  }

  /**
   * Generate CSS for modal preview styles
   */
  generateModalCss(isMinimal, mediaButtons = []) {
    const hasMediaButtons = mediaButtons && mediaButtons.length > 0;

    // Common media button CSS
    const mediaButtonCss = hasMediaButtons
      ? `
/* Media Capture Button Styles */
.media-capture-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem 0.75rem;
}

.media-capture-btn svg {
  width: 18px;
  height: 18px;
}

.media-capture-btn.recording {
  background-color: #dc3545 !important;
  border-color: #dc3545 !important;
  color: white !important;
  animation: pulse-recording 1.5s ease-in-out infinite;
}

@keyframes pulse-recording {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
`
      : "";

    if (isMinimal) {
      return `.upload-btn-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-file-badge {
  display: none;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #e0f2fe;
  border-radius: 20px;
  font-size: 13px;
  color: #0369a1;
  font-weight: 500;
}

.btn-file-badge.has-files {
  display: inline-flex;
}

.btn-file-badge .badge-separator {
  color: #94a3b8;
  font-weight: 400;
}

.btn-file-badge .badge-count { font-weight: 600; }
.btn-file-badge .badge-size { font-weight: 500; }${mediaButtonCss}`;
    } else {
      return `.file-preview-summary {
  display: none;
  margin-top: 16px;
  padding: 16px 20px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 10px;
}

.file-preview-summary.has-files { display: block; }

.summary-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.summary-header svg { width: 20px; height: 20px; color: #0284c7; }
.summary-header > span { font-weight: 600; color: #0369a1; font-size: 15px; }

.summary-actions { display: flex; gap: 8px; margin-left: auto; }

.summary-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.summary-action-btn svg { width: 18px; height: 18px; }
.summary-action-btn.download-all-btn { background: #dbeafe; color: #2563eb; }
.summary-action-btn.download-all-btn:hover { background: #bfdbfe; color: #1d4ed8; }
.summary-action-btn.clear-all-btn { background: #fee2e2; color: #dc2626; }
.summary-action-btn.clear-all-btn:hover { background: #fecaca; color: #b91c1c; }

.summary-stats { display: flex; gap: 24px; margin-bottom: 12px; }
.stat-item { display: flex; align-items: center; gap: 6px; }
.stat-value { font-weight: 600; color: #1e40af; font-size: 18px; }
.stat-label { color: #64748b; font-size: 13px; }

.file-types { display: flex; flex-wrap: wrap; gap: 8px; }

.file-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: white;
  border-radius: 20px;
  font-size: 12px;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.file-type-badge .count {
  background: #3b82f6;
  color: white;
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.edit-files-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  color: #3b82f6;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
}

.edit-files-link:hover { text-decoration: underline; }
.edit-files-link svg { width: 16px; height: 16px; }${mediaButtonCss}`;
    }
  }

  /**
   * Get SVG for modal button icon
   */
  getModalButtonIconSvg(icon) {
    const icons = {
      upload:
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
      plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
      folder:
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>',
      none: "",
    };
    return icons[icon] || icons.upload;
  }

  /**
   * Generate modal HTML markup
   */
  generateModalHtml(
    varName,
    modalId,
    containerId,
    buttonText,
    iconSvg,
    modalTitle,
    modalSize,
    bsVersion,
    isMinimal,
    mediaButtons = []
  ) {
    const sizeClass = modalSize === "md" ? "" : ` modal-${modalSize}`;
    const hasMediaButtons = mediaButtons && mediaButtons.length > 0;

    // Media button icons
    const mediaButtonIcons = {
      screenshot: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
      video: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`,
      audio: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
    };

    const mediaButtonTitles = {
      screenshot: "Capture Screenshot",
      video: "Record Screen",
      audio: "Record Audio",
    };

    // Button with optional preview badge
    let html = `<!-- Trigger Button -->\n`;
    if (isMinimal) {
      html += `<div class="upload-btn-wrapper">\n`;
      if (hasMediaButtons) {
        html += `  <div class="btn-group" role="group">\n`;
        html += `    <button type="button" id="${varName}Btn" class="btn btn-primary" data-${
          bsVersion === "3" ? "toggle" : "bs-toggle"
        }="modal" data-${
          bsVersion === "3" ? "target" : "bs-target"
        }="#${modalId}">\n`;
        if (iconSvg) html += `      ${iconSvg}\n`;
        html += `      ${buttonText}\n`;
        html += `    </button>\n`;
        for (const btnType of mediaButtons) {
          html += `    <button type="button" class="btn btn-outline-primary media-capture-btn" data-capture-type="${btnType}" data-uploader="${varName}" title="${mediaButtonTitles[btnType]}">\n`;
          html += `      ${mediaButtonIcons[btnType]}\n`;
          html += `    </button>\n`;
        }
        html += `  </div>\n`;
      } else {
        html += `  <button type="button" id="${varName}Btn" class="btn btn-primary" data-${
          bsVersion === "3" ? "toggle" : "bs-toggle"
        }="modal" data-${
          bsVersion === "3" ? "target" : "bs-target"
        }="#${modalId}">\n`;
        if (iconSvg) html += `    ${iconSvg}\n`;
        html += `    ${buttonText}\n`;
        html += `  </button>\n`;
      }
      html += `  <span class="btn-file-badge" id="${varName}Badge">\n`;
      html += `    <span class="badge-count" id="${varName}Count">0</span> files\n`;
      html += `    <span class="badge-separator">|</span>\n`;
      html += `    <span class="badge-size" id="${varName}Size">0 KB</span>\n`;
      html += `  </span>\n`;
      html += `</div>\n`;
    } else {
      if (hasMediaButtons) {
        html += `<div class="btn-group" role="group">\n`;
        html += `  <button type="button" id="${varName}Btn" class="btn btn-primary" data-${
          bsVersion === "3" ? "toggle" : "bs-toggle"
        }="modal" data-${
          bsVersion === "3" ? "target" : "bs-target"
        }="#${modalId}">\n`;
        if (iconSvg) html += `    ${iconSvg}\n`;
        html += `    ${buttonText}\n`;
        html += `  </button>\n`;
        for (const btnType of mediaButtons) {
          html += `  <button type="button" class="btn btn-outline-primary media-capture-btn" data-capture-type="${btnType}" data-uploader="${varName}" title="${mediaButtonTitles[btnType]}">\n`;
          html += `    ${mediaButtonIcons[btnType]}\n`;
          html += `  </button>\n`;
        }
        html += `</div>\n\n`;
      } else {
        html += `<button type="button" id="${varName}Btn" class="btn btn-primary" data-${
          bsVersion === "3" ? "toggle" : "bs-toggle"
        }="modal" data-${
          bsVersion === "3" ? "target" : "bs-target"
        }="#${modalId}">\n`;
        if (iconSvg) html += `  ${iconSvg}\n`;
        html += `  ${buttonText}\n`;
        html += `</button>\n\n`;
      }
      html += `<!-- Detailed Preview Summary -->\n`;
      html += `<div class="file-preview-summary" id="${varName}Summary">\n`;
      html += `  <div class="summary-header">\n`;
      html += `    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>\n`;
      html += `    <span>Files Ready</span>\n`;
      html += `    <div class="summary-actions">\n`;
      html += `      <button type="button" class="summary-action-btn download-all-btn" id="${varName}DownloadAll" title="Download All">\n`;
      html += `        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>\n`;
      html += `      </button>\n`;
      html += `      <button type="button" class="summary-action-btn clear-all-btn" id="${varName}ClearAll" title="Clear All">\n`;
      html += `        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>\n`;
      html += `      </button>\n`;
      html += `    </div>\n`;
      html += `  </div>\n`;
      html += `  <div class="summary-stats">\n`;
      html += `    <div class="stat-item"><span class="stat-value" id="${varName}FileCount">0</span><span class="stat-label">files</span></div>\n`;
      html += `    <div class="stat-item"><span class="stat-value" id="${varName}TotalSize">0 KB</span><span class="stat-label">total</span></div>\n`;
      html += `  </div>\n`;
      html += `  <div class="file-types" id="${varName}FileTypes"></div>\n`;
      html += `  <a class="edit-files-link" data-${
        bsVersion === "3" ? "toggle" : "bs-toggle"
      }="modal" data-${
        bsVersion === "3" ? "target" : "bs-target"
      }="#${modalId}">\n`;
      html += `    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>\n`;
      html += `    Edit files\n`;
      html += `  </a>\n`;
      html += `</div>\n`;
    }

    // Modal markup
    html += `\n<!-- Modal -->\n`;
    if (bsVersion === "3") {
      html += `<div class="modal fade" id="${modalId}" tabindex="-1" role="dialog">\n`;
      html += `  <div class="modal-dialog${sizeClass} modal-dialog-centered" role="document">\n`;
      html += `    <div class="modal-content">\n`;
      html += `      <div class="modal-header">\n`;
      html += `        <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>\n`;
      html += `        <h4 class="modal-title">${modalTitle}</h4>\n`;
      html += `      </div>\n`;
      html += `      <div class="modal-body">\n`;
      html += `        <div id="${containerId}"></div>\n`;
      html += `      </div>\n`;
      html += `      <div class="modal-footer">\n`;
      html += `        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>\n`;
      html += `        <button type="button" class="btn btn-primary" data-dismiss="modal">Done</button>\n`;
      html += `      </div>\n`;
      html += `    </div>\n`;
      html += `  </div>\n`;
      html += `</div>`;
    } else {
      html += `<div class="modal fade" id="${modalId}" tabindex="-1">\n`;
      html += `  <div class="modal-dialog${sizeClass} modal-dialog-centered">\n`;
      html += `    <div class="modal-content">\n`;
      html += `      <div class="modal-header">\n`;
      html += `        <h5 class="modal-title">${modalTitle}</h5>\n`;
      html += `        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>\n`;
      html += `      </div>\n`;
      html += `      <div class="modal-body">\n`;
      html += `        <div id="${containerId}"></div>\n`;
      html += `      </div>\n`;
      html += `      <div class="modal-footer">\n`;
      html += `        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>\n`;
      html += `        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Done</button>\n`;
      html += `      </div>\n`;
      html += `    </div>\n`;
      html += `  </div>\n`;
      html += `</div>`;
    }

    return html;
  }

  /**
   * Generate modal JavaScript code
   */
  generateModalJs(
    varName,
    modalId,
    containerId,
    changedConfig,
    bsVersion,
    isMinimal,
    mediaButtons = [],
    enableModalDropZone = true
  ) {
    const hasMediaButtons = mediaButtons && mediaButtons.length > 0;

    // Build config entries including externalDropZone if enabled
    const configEntries = { ...changedConfig };
    if (enableModalDropZone) {
      configEntries.externalDropZone = `#${varName}Btn`;
    }

    let code = `// Initialize FileUploader\n`;

    const entries = Object.entries(configEntries);
    if (entries.length === 0) {
      code += `const ${varName} = new FileUploader('#${containerId}');\n\n`;
    } else {
      code += `const ${varName} = new FileUploader('#${containerId}', {\n`;

      entries.forEach(([key, value], index) => {
        const comma = index < entries.length - 1 ? "," : "";
        const formattedValue = this.formatJsValue(key, value, "  ", comma);
        code += `  ${key}: ${formattedValue}\n`;
      });

      code += `});\n\n`;
    }

    // Update preview function
    if (isMinimal) {
      code += `// Update minimal preview badge\n`;
      code += `function update${this.capitalizeFirst(varName)}Preview() {\n`;
      code += `  const files = ${varName}.getFiles();\n`;
      code += `  const badge = document.getElementById('${varName}Badge');\n`;
      code += `  \n`;
      code += `  if (files.length === 0) {\n`;
      code += `    badge.classList.remove('has-files');\n`;
      code += `    return;\n`;
      code += `  }\n`;
      code += `  \n`;
      code += `  badge.classList.add('has-files');\n`;
      code += `  document.getElementById('${varName}Count').textContent = files.length;\n`;
      code += `  const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);\n`;
      code += `  document.getElementById('${varName}Size').textContent = formatFileSize(totalSize);\n`;
      code += `}\n\n`;
    } else {
      code += `// Update detailed preview summary\n`;
      code += `function update${this.capitalizeFirst(varName)}Preview() {\n`;
      code += `  const files = ${varName}.getFiles();\n`;
      code += `  const summary = document.getElementById('${varName}Summary');\n`;
      code += `  \n`;
      code += `  if (files.length === 0) {\n`;
      code += `    summary.classList.remove('has-files');\n`;
      code += `    return;\n`;
      code += `  }\n`;
      code += `  \n`;
      code += `  summary.classList.add('has-files');\n`;
      code += `  document.getElementById('${varName}FileCount').textContent = files.length;\n`;
      code += `  \n`;
      code += `  const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);\n`;
      code += `  document.getElementById('${varName}TotalSize').textContent = formatFileSize(totalSize);\n`;
      code += `  \n`;
      code += `  // Group files by type\n`;
      code += `  const typeGroups = {};\n`;
      code += `  files.forEach(f => {\n`;
      code += `    const ext = f.name.split('.').pop().toLowerCase();\n`;
      code += `    const type = getFileTypeLabel(ext);\n`;
      code += `    typeGroups[type] = (typeGroups[type] || 0) + 1;\n`;
      code += `  });\n`;
      code += `  \n`;
      code += `  document.getElementById('${varName}FileTypes').innerHTML = \n`;
      code += `    Object.entries(typeGroups)\n`;
      code += `      .map(([type, count]) => \`<span class="file-type-badge">\${type}<span class="count">\${count}</span></span>\`)\n`;
      code += `      .join('');\n`;
      code += `}\n\n`;

      code += `// Download all button\n`;
      code += `document.getElementById('${varName}DownloadAll').addEventListener('click', () => {\n`;
      code += `  ${varName}.downloadAll();\n`;
      code += `});\n\n`;

      code += `// Clear all button\n`;
      code += `document.getElementById('${varName}ClearAll').addEventListener('click', () => {\n`;
      code += `  if (confirm('Are you sure you want to remove all files?')) {\n`;
      code += `    ${varName}.clear();\n`;
      code += `    update${this.capitalizeFirst(varName)}Preview();\n`;
      code += `  }\n`;
      code += `});\n\n`;
    }

    // Modal hidden event
    const modalEvent =
      bsVersion === "3" ? "hidden.bs.modal" : "hidden.bs.modal";
    code += `// Update preview when modal closes\n`;
    code += `document.getElementById('${modalId}').addEventListener('${modalEvent}', update${this.capitalizeFirst(
      varName
    )}Preview);\n\n`;

    // Utility functions
    code += `// Utility functions\n`;
    code += `function formatFileSize(bytes) {\n`;
    code += `  if (bytes === 0) return '0 B';\n`;
    code += `  const k = 1024;\n`;
    code += `  const sizes = ['B', 'KB', 'MB', 'GB'];\n`;
    code += `  const i = Math.floor(Math.log(bytes) / Math.log(k));\n`;
    code += `  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];\n`;
    code += `}\n`;

    if (!isMinimal) {
      code += `\n`;
      code += `function getFileTypeLabel(ext) {\n`;
      code += `  const typeMap = {\n`;
      code += `    'jpg': 'Images', 'jpeg': 'Images', 'png': 'Images', 'gif': 'Images', 'webp': 'Images',\n`;
      code += `    'mp4': 'Videos', 'webm': 'Videos', 'avi': 'Videos', 'mov': 'Videos',\n`;
      code += `    'mp3': 'Audio', 'wav': 'Audio', 'ogg': 'Audio',\n`;
      code += `    'pdf': 'PDFs', 'doc': 'Documents', 'docx': 'Documents',\n`;
      code += `    'xls': 'Spreadsheets', 'xlsx': 'Spreadsheets', 'csv': 'Spreadsheets',\n`;
      code += `    'zip': 'Archives', 'rar': 'Archives'\n`;
      code += `  };\n`;
      code += `  return typeMap[ext] || 'Files';\n`;
      code += `}`;
    }

    // Add media capture button handlers
    if (hasMediaButtons) {
      code += `\n\n// Media capture button handlers\n`;
      code += `document.querySelectorAll('.media-capture-btn[data-uploader="${varName}"]').forEach(btn => {\n`;
      code += `  btn.addEventListener('click', async function() {\n`;
      code += `    const captureType = this.dataset.captureType;\n`;
      code += `    \n`;
      code += `    switch(captureType) {\n`;
      if (mediaButtons.includes("screenshot")) {
        code += `      case 'screenshot':\n`;
        code += `        // Capture screenshot using FileUploader's built-in method\n`;
        code += `        ${varName}.captureScreenshot();\n`;
        code += `        break;\n`;
      }
      if (mediaButtons.includes("video")) {
        code += `      case 'video':\n`;
        code += `        // Toggle video recording\n`;
        code += `        if (this.classList.contains('recording')) {\n`;
        code += `          ${varName}.stopVideoRecording();\n`;
        code += `          this.classList.remove('recording');\n`;
        code += `        } else {\n`;
        code += `          ${varName}.startVideoRecording();\n`;
        code += `          this.classList.add('recording');\n`;
        code += `        }\n`;
        code += `        break;\n`;
      }
      if (mediaButtons.includes("audio")) {
        code += `      case 'audio':\n`;
        code += `        // Toggle audio recording\n`;
        code += `        if (this.classList.contains('recording')) {\n`;
        code += `          ${varName}.stopAudioRecording();\n`;
        code += `          this.classList.remove('recording');\n`;
        code += `        } else {\n`;
        code += `          ${varName}.startAudioRecording();\n`;
        code += `          this.classList.add('recording');\n`;
        code += `        }\n`;
        code += `        break;\n`;
      }
      if (mediaButtons.includes("fullpage")) {
        code += `      case 'fullpage':\n`;
        code += `        // Capture full page screenshot\n`;
        code += `        ${varName}.captureFullPage();\n`;
        code += `        break;\n`;
      }
      if (mediaButtons.includes("region")) {
        code += `      case 'region':\n`;
        code += `        // Capture selected region screenshot\n`;
        code += `        ${varName}.captureRegion();\n`;
        code += `        break;\n`;
      }
      code += `    }\n`;
      code += `  });\n`;
      code += `});\n`;

      // Add listeners for recording state changes
      if (mediaButtons.includes("video") || mediaButtons.includes("audio")) {
        code += `\n// Listen for recording state changes to update button states\n`;
        code += `${varName}.on('recordingStateChange', (state) => {\n`;
        code += `  const btn = document.querySelector('.media-capture-btn[data-uploader="${varName}"][data-capture-type="' + state.type + '"]');\n`;
        code += `  if (btn) {\n`;
        code += `    if (state.isRecording) {\n`;
        code += `      btn.classList.add('recording');\n`;
        code += `    } else {\n`;
        code += `      btn.classList.remove('recording');\n`;
        code += `    }\n`;
        code += `  }\n`;
        code += `});\n`;
      }
    }

    return code;
  }

  /**
   * Capitalize first letter of a string
   */
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Generate PHP code for a single uploader
   * Always shows all defaults with changed values marked
   * @param {string} id - Uploader ID
   * @param {Object} data - Uploader data
   * @param {boolean} includeDefaults - Ignored, always includes defaults for PHP
   */
  generateSingleUploaderPhpCode(id, data, includeDefaults = false) {
    const changedConfig = this.getChangedConfig(data.config, true); // server-only
    const changedKeys = Object.keys(changedConfig);

    let code = `<?php\n/**\n * ${data.name} - Server Configuration\n * Generated by Config Builder\n */\n\n`;

    // Get defaults
    let defaults = this.fileUploaderDefaults;
    if (!defaults || Object.keys(defaults).length === 0) {
      defaults = this.getDefaultConfig();
    }

    // Hardcoded PHP defaults as fallback
    const phpDefaults = {
      uploadDir: "",
      perFileMaxSize: 10 * 1024 * 1024,
      perFileMaxSizeDisplay: "10MB",
      totalMaxSize: 100 * 1024 * 1024,
      totalMaxSizeDisplay: "100MB",
      maxFiles: 10,
      perFileMaxSizePerType: {},
      perFileMaxSizePerTypeDisplay: {},
      perTypeMaxTotalSize: {},
      perTypeMaxTotalSizeDisplay: {},
      perTypeMaxFileCount: {},
      allowedExtensions: [],
      imageExtensions: ["jpg", "jpeg", "png", "gif", "webp", "svg"],
      videoExtensions: ["mp4", "mpeg", "mov", "avi", "webm"],
      audioExtensions: ["mp3", "wav", "ogg", "webm", "aac", "m4a", "flac"],
      documentExtensions: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv"],
      archiveExtensions: ["zip", "rar", "7z", "tar", "gz"],
    };

    // PHP-relevant groups
    const phpRelevantGroups = ["urls", "limits", "perTypeLimits", "fileTypes"];

    // Define which keys belong to which PHP group
    const phpGroupKeys = {
      urls: ["uploadDir"],
      limits: ["perFileMaxSize", "perFileMaxSizeDisplay", "totalMaxSize", "totalMaxSizeDisplay", "maxFiles"],
      perTypeLimits: ["perFileMaxSizePerType", "perFileMaxSizePerTypeDisplay", "perTypeMaxTotalSize", "perTypeMaxTotalSizeDisplay", "perTypeMaxFileCount"],
      fileTypes: ["allowedExtensions", "imageExtensions", "videoExtensions", "audioExtensions", "documentExtensions", "archiveExtensions"],
    };

    code += `return [\n`;

    phpRelevantGroups.forEach((groupKey, groupIndex) => {
      const keysInGroup = phpGroupKeys[groupKey] || [];
      const groupTitle = PHP_GROUP_TITLES[groupKey] || GROUP_TITLES[groupKey] || groupKey;
      const isLastGroup = groupIndex === phpRelevantGroups.length - 1;

      code += `    // ${groupTitle}\n`;
      code += `    '${groupKey}' => [\n`;

      keysInGroup.forEach((key, keyIndex) => {
        // Get value: use changed value if exists, otherwise default, otherwise phpDefaults
        let value;
        if (changedKeys.includes(key)) {
          value = changedConfig[key];
        } else if (defaults[key] !== undefined) {
          value = defaults[key];
        } else {
          value = phpDefaults[key];
        }

        if (value === undefined) return; // Skip if still not found

        const isChanged = changedKeys.includes(key);
        const marker = isChanged ? " // <- changed" : "";
        const comma = keyIndex < keysInGroup.length - 1 ? "," : "";
        const phpValue = this.jsValueToPhp(value, key);
        code += `        '${key}' => ${phpValue}${comma}${marker}\n`;
      });

      code += `    ]${isLastGroup ? "" : ","}\n`;
    });

    code += `];\n`;

    return code;
  }

  /**
   * Escape HTML entities
   */
  escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Get modal button icon SVG based on icon type
   */
  getModalButtonIcon(iconType) {
    if (iconType === "none") return "";
    const icons = {
      upload:
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
      plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
      folder:
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>',
    };
    return icons[iconType] || icons.upload;
  }

  /**
   * Media capture button icons - exactly matching FileUploader's icons.js
   * Uses the same SVG icons from the FileUploader library for consistency
   * Note: fill="currentColor" ensures icons inherit the button's text color (white)
   */
  static MEDIA_CAPTURE_ICONS = {
    // Camera icon for screenshot (matches icons.js camera icon structure)
    screenshot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M193.1 32c-18.7 0-36.2 9.4-46.6 24.9L120.5 96 64 96C28.7 96 0 124.7 0 160L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64l-56.5 0-26-39.1C355.1 41.4 337.6 32 318.9 32L193.1 32zm-6.7 51.6c1.5-2.2 4-3.6 6.7-3.6l125.7 0c2.7 0 5.2 1.3 6.7 3.6l33.2 49.8c4.5 6.7 11.9 10.7 20 10.7l69.3 0c8.8 0 16 7.2 16 16l0 256c0 8.8-7.2 16-16 16L64 432c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l69.3 0c8 0 15.5-4 20-10.7l33.2-49.8zM256 384a112 112 0 1 0 0-224 112 112 0 1 0 0 224zM192 272a64 64 0 1 1 128 0 64 64 0 1 1 -128 0z"/></svg>`,
    // Video icon (matches icons.js video icon)
    video: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor"><path d="M96 64c-35.3 0-64 28.7-64 64l0 256c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64L96 64zM464 336l73.5 58.8c4.2 3.4 9.4 5.2 14.8 5.2 13.1 0 23.7-10.6 23.7-23.7l0-240.6c0-13.1-10.6-23.7-23.7-23.7-5.4 0-10.6 1.8-14.8 5.2L464 176 464 336z"/></svg>`,
    // Audio/mic icon (matches icons.js mic icon)
    audio: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor"><path d="M192 0C139 0 96 43 96 96l0 128c0 53 43 96 96 96s96-43 96-96l0-128c0-53-43-96-96-96zM48 184c0-13.3-10.7-24-24-24S0 170.7 0 184l0 40c0 97.9 73.3 178.7 168 190.5l0 49.5-48 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l144 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-48 0 0-49.5c94.7-11.8 168-92.6 168-190.5l0-40c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 79.5-64.5 144-144 144S48 303.5 48 224l0-40z"/></svg>`,
    // Full page capture icon
    fullpage: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM96 96l320 0c17.7 0 32 14.3 32 32l0 256c0 17.7-14.3 32-32 32L96 416c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32zM200 208c0-13.3-10.7-24-24-24l-32 0c-13.3 0-24 10.7-24 24l0 32c0 13.3 10.7 24 24 24s24-10.7 24-24l0-8 8 0c13.3 0 24-10.7 24-24zm192 0c0-13.3-10.7-24-24-24l-32 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l8 0 0 8c0 13.3 10.7 24 24 24s24-10.7 24-24l0-32zm-192 96c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 32c0 13.3 10.7 24 24 24l32 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-8 0 0-8zm192 0c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 8-8 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l32 0c13.3 0 24-10.7 24-24l0-32z"/></svg>`,
    // Region capture icon
    region: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor"><path d="M0 80C0 53.5 21.5 32 48 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L48 96l0 64c0 17.7-14.3 32-32 32s-32-14.3-32-32L0 80zM0 432c0-17.7 14.3-32 32-32l0-64c0-17.7 14.3-32 32-32s32 14.3 32 32l0 64 64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L48 464c-26.5 0-48-21.5-48-48zM464 96l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0c26.5 0 48 21.5 48 48l0 80c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-64zM512 336l0 64c0 26.5-21.5 48-48 48l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0 0-64c0-17.7 14.3-32 32-32s32 14.3 32 32zM176 224l160 0c8.8 0 16 7.2 16 16l0 96c0 8.8-7.2 16-16 16l-160 0c-8.8 0-16-7.2-16-16l0-96c0-8.8 7.2-16 16-16z"/></svg>`,
    // Chevron right icon for expandable media buttons toggle
    chevron_right: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor"><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>`,
  };

  static MEDIA_CAPTURE_TITLES = {
    screenshot: "Capture Screenshot",
    video: "Record Screen",
    audio: "Record Audio",
    fullpage: "Capture Full Page",
    region: "Capture Region",
  };

  /**
   * Filter media buttons to only include those whose capture option is enabled
   * @param {string[]} buttons - Array of button types
   * @param {Object} config - The config object
   * @returns {string[]} Filtered array of button types
   */
  filterEnabledMediaButtons(buttons, config) {
    if (!buttons || buttons.length === 0) return [];
    return buttons.filter((btn) => {
      if (btn === "screenshot") return config.enableScreenCapture !== false;
      if (btn === "fullpage") return config.enableFullPageCapture !== false;
      if (btn === "region") return config.enableRegionCapture !== false;
      if (btn === "video") return config.enableVideoRecording !== false;
      if (btn === "audio") return config.enableAudioRecording !== false;
      return false;
    });
  }

  /**
   * Generate media capture buttons HTML with expandable toggle
   * Uses media-hub-capture-btn class for consistent styling with FileUploader
   * @param {string[]} buttonTypes - Array of button types: 'screenshot', 'video', 'audio'
   * @param {string} uploaderId - The uploader ID for data attribute
   * @param {string} buttonSize - Button size: 'xs', 'sm', 'md', 'lg' (default: 'md')
   * @returns {string} HTML string for the expandable media capture buttons container
   */
  getMediaCaptureButtonsHtml(buttonTypes, uploaderId, buttonSize = "md") {
    if (!buttonTypes || buttonTypes.length === 0) return "";

    // Get size class for buttons (empty for default 'md')
    const sizeClass = buttonSize && buttonSize !== "md" ? ` media-hub-capture-btn-${buttonSize}` : "";
    const toggleSizeClass = buttonSize && buttonSize !== "md" ? ` media-hub-capture-toggle-${buttonSize}` : "";

    const buttons = buttonTypes
      .map((btnType) => {
        const icon = MEDIA_CAPTURE_ICONS[btnType];
        const title = MEDIA_CAPTURE_TITLES[btnType];
        if (!icon) return "";

        return `<button type="button" class="media-hub-capture-btn${sizeClass} has-tooltip" data-capture-type="${btnType}" data-uploader-id="${uploaderId}" data-tooltip="${title}" data-tooltip-position="top">${icon}</button>`;
      })
      .join("");

    const chevronIcon = MEDIA_CAPTURE_ICONS.chevron_right;

    return `
      <div class="media-hub-capture-expandable" data-uploader-id="${uploaderId}">
        <button type="button" class="media-hub-capture-toggle${toggleSizeClass} has-tooltip" data-uploader-id="${uploaderId}" data-tooltip="Media Capture" data-tooltip-position="top">
          <span class="toggle-chevron">${chevronIcon}</span>
        </button>
        <div class="media-hub-capture-buttons-wrapper">
          <div class="media-hub-capture-container" data-uploader-id="${uploaderId}">${buttons}</div>
        </div>
      </div>`;
  }

  /**
   * Attach event handlers to media capture buttons
   * @param {HTMLElement} container - Container element with the capture buttons
   * @param {string} uploaderId - The uploader ID to find the FileUploader instance
   */
  attachMediaCaptureHandlers(container, uploaderId) {
    // Attach toggle handler for expandable media buttons
    this.attachMediaCaptureToggleHandler(container, uploaderId);

    const buttons = container.querySelectorAll(
      '.media-hub-capture-btn[data-uploader-id="' + uploaderId + '"]'
    );

    buttons.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const captureType = btn.dataset.captureType;

        const uploaderData = this.uploaderInstances[uploaderId];
        if (!uploaderData || !uploaderData.instance) {
          return;
        }

        const uploader = uploaderData.instance;

        try {
          if (captureType === "screenshot") {
            if (typeof uploader.captureScreenshot === "function") {
              await uploader.captureScreenshot();
              this.updatePreviewFileInfo(uploaderId);
            }
          } else if (captureType === "video") {
            if (typeof uploader.toggleVideoRecording === "function") {
              await uploader.toggleVideoRecording();
              this.updatePreviewFileInfo(uploaderId);
            }
          } else if (captureType === "audio") {
            if (typeof uploader.toggleAudioRecording === "function") {
              await uploader.toggleAudioRecording();
              this.updatePreviewFileInfo(uploaderId);
            }
          } else if (captureType === "fullpage") {
            if (typeof uploader.captureFullPage === "function") {
              await uploader.captureFullPage();
              this.updatePreviewFileInfo(uploaderId);
            }
          } else if (captureType === "region") {
            if (typeof uploader.captureRegion === "function") {
              await uploader.captureRegion();
              this.updatePreviewFileInfo(uploaderId);
            }
          }
        } catch (error) {
          console.error(`Error during ${captureType} capture:`, error);
        }
      });
    });
  }

  /**
   * Attach toggle handler for expandable media capture buttons
   * @param {HTMLElement} container - Container element with the toggle button
   * @param {string} uploaderId - The uploader ID
   */
  attachMediaCaptureToggleHandler(container, uploaderId) {
    const toggleBtn = container.querySelector(
      '.media-hub-capture-toggle[data-uploader-id="' + uploaderId + '"]'
    );
    if (!toggleBtn) return;

    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const expandable = toggleBtn.closest(".media-hub-capture-expandable");
      if (expandable) {
        expandable.classList.toggle("expanded");
      }
    });
  }

  /**
   * Update the preview file info for a specific uploader
   * @param {string} uploaderId - The uploader ID
   */
  updatePreviewFileInfo(uploaderId) {
    const uploaderData = this.uploaderInstances[uploaderId];
    if (!uploaderData) return;

    const wrapper = document.querySelector(
      `[data-uploader-wrapper="${uploaderId}"]`
    );
    if (!wrapper) return;

    const displayMode = uploaderData.config?.displayMode || "inline";
    const isMinimal = displayMode === "modal-minimal";

    // Call the existing updateModalFileInfo method
    this.updateModalFileInfo(wrapper, uploaderId, uploaderData, isMinimal);
  }

  /**
   * Set up a MutationObserver to watch for file changes in the FileUploader
   * This automatically updates the preview file info when files are added, updated, or removed
   * @param {string} uploaderId - The uploader ID
   */
  setupFileChangeObserver(uploaderId) {
    const uploaderData = this.uploaderInstances[uploaderId];
    if (!uploaderData || !uploaderData.instance) return;

    // Get the FileUploader's preview container element
    const uploader = uploaderData.instance;
    const previewContainer = uploader.previewContainer;

    if (!previewContainer) {
      console.warn(
        "[ConfigBuilder] Could not find previewContainer for observer:",
        uploaderId
      );
      return;
    }

    // Disconnect any existing observer for this uploader
    if (uploaderData.fileChangeObserver) {
      uploaderData.fileChangeObserver.disconnect();
    }

    // Create a MutationObserver to watch for DOM changes in the preview container
    const observer = new MutationObserver((mutations) => {
      // Debounce updates to avoid excessive calls during rapid changes
      if (uploaderData.fileChangeTimeout) {
        clearTimeout(uploaderData.fileChangeTimeout);
      }
      uploaderData.fileChangeTimeout = setTimeout(() => {
        this.updatePreviewFileInfo(uploaderId);
      }, 100);
    });

    // Observe childList changes (files added/removed) and subtree for updates
    observer.observe(previewContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "data-status"], // Watch for status changes like upload complete
    });

    // Store the observer reference so we can disconnect it later
    uploaderData.fileChangeObserver = observer;
  }

  /**
   * Update modal file info display after files are selected or removed
   */
  updateModalFileInfo(wrapper, uploaderId, data, isMinimal) {
    if (!data.instance) return;

    const files = data.instance.getFiles ? data.instance.getFiles() : [];
    const fileCount = files.length;
    const previousCount = data.previousFileCount || 0;
    const filesAdded = fileCount > previousCount;
    data.previousFileCount = fileCount;

    // Format size helper
    const formatSize = (bytes) => {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    // Handle empty state (all files deleted)
    if (fileCount === 0) {
      if (isMinimal) {
        const badge = wrapper.querySelector(
          `[data-file-badge="${uploaderId}"]`
        );
        if (badge) {
          badge.classList.remove("has-files");
          badge.innerHTML = `<span class="badge-text">No files selected</span>`;
        }
      } else {
        const summary = wrapper.querySelector(
          `[data-file-summary="${uploaderId}"]`
        );
        if (summary) {
          summary.classList.remove("has-files");
          summary.innerHTML = `
            <div class="summary-empty">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              <span>No files selected yet</span>
            </div>
          `;
        }
      }
      return;
    }

    // Calculate total size
    let totalSize = 0;
    files.forEach((file) => {
      totalSize += file.size || 0;
    });

    if (isMinimal) {
      // Update minimal badge
      const badge = wrapper.querySelector(`[data-file-badge="${uploaderId}"]`);
      if (badge) {
        badge.classList.add("has-files");
        badge.innerHTML = `
          <span class="badge-count">${fileCount}</span> file${
          fileCount !== 1 ? "s" : ""
        }
          <span class="badge-separator">|</span>
          <span class="badge-size">${formatSize(totalSize)}</span>
        `;

        // Add pulse animation when files are added
        if (filesAdded) {
          badge.classList.remove("file-added-pulse");
          // Force reflow to restart animation
          void badge.offsetWidth;
          badge.classList.add("file-added-pulse");
        }
      }
    } else {
      // Update detailed summary
      const summary = wrapper.querySelector(
        `[data-file-summary="${uploaderId}"]`
      );
      if (summary) {
        // Group files by type with icons
        const typeConfig = {
          Images: { icon: "image", color: "#8b5cf6" },
          Videos: { icon: "video", color: "#ef4444" },
          Audio: { icon: "audio", color: "#f59e0b" },
          Documents: { icon: "document", color: "#3b82f6" },
          Archives: { icon: "archive", color: "#6366f1" },
          Other: { icon: "other", color: "#6b7280" },
        };

        const typeGroups = {};
        files.forEach((file) => {
          const ext = (file.name || "").split(".").pop().toLowerCase();
          let type = "Other";
          if (
            ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(
              ext
            )
          )
            type = "Images";
          else if (["mp4", "webm", "avi", "mov", "mkv"].includes(ext))
            type = "Videos";
          else if (["mp3", "wav", "ogg", "flac", "m4a"].includes(ext))
            type = "Audio";
          else if (
            [
              "pdf",
              "doc",
              "docx",
              "txt",
              "rtf",
              "xls",
              "xlsx",
              "ppt",
              "pptx",
            ].includes(ext)
          )
            type = "Documents";
          else if (["zip", "rar", "7z", "tar", "gz"].includes(ext))
            type = "Archives";

          if (!typeGroups[type]) typeGroups[type] = 0;
          typeGroups[type]++;
        });

        const typeIcons = {
          Images:
            '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
          Videos:
            '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>',
          Audio:
            '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
          Documents:
            '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>',
          Archives:
            '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/></svg>',
          Other:
            '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M13 2v7h7"/></svg>',
        };

        const typeBadges = Object.entries(typeGroups)
          .map(([type, count]) => {
            const config = typeConfig[type] || typeConfig["Other"];
            return `
              <div class="summary-type">
                <span class="type-icon icon-${config.icon}">${
              typeIcons[type] || typeIcons["Other"]
            }</span>
                <span class="type-name">${type}</span>
                <span class="type-count">${count}</span>
              </div>
            `;
          })
          .join("");

        summary.classList.add("has-files");
        summary.innerHTML = `
          <div class="summary-header">
            <div class="summary-icon">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <span class="summary-title">Files Ready</span>
          </div>
          <div class="summary-content">
            <div class="summary-stats">
              <div class="summary-stat">
                <span class="stat-value">${fileCount}</span>
                <span class="stat-label">file${
                  fileCount !== 1 ? "s" : ""
                }</span>
              </div>
              <div class="summary-stat">
                <span class="stat-value">${formatSize(totalSize)}</span>
                <span class="stat-label">total</span>
              </div>
            </div>
            <div class="summary-types">${typeBadges}</div>
          </div>
        `;

        // Add pulse animation when files are added
        if (filesAdded) {
          summary.classList.remove("file-added-pulse");
          // Force reflow to restart animation
          void summary.offsetWidth;
          summary.classList.add("file-added-pulse");
        }
      }
    }
  }

  /**
   * Highlight JS code
   */
  highlightJsCode(code) {
    // Escape HTML entities first to prevent raw HTML from being rendered
    let result = this.escapeHtml(code);

    // Use placeholders to prevent nested replacements
    const stringPlaceholders = [];
    const commentPlaceholders = [];

    // Extract comments FIRST (before strings) so string placeholders don't end up inside comments
    // Extract block comments (/** ... */ or /* ... */)
    result = result.replace(/(\/\*[\s\S]*?\*\/)/g, (match) => {
      const index = commentPlaceholders.length;
      commentPlaceholders.push(`<span class="code-comment">${match}</span>`);
      return `__COMMENT_${index}__`;
    });

    // Extract single line comments
    result = result.replace(/(\/\/.*$)/gm, (match) => {
      const index = commentPlaceholders.length;
      commentPlaceholders.push(`<span class="code-comment">${match}</span>`);
      return `__COMMENT_${index}__`;
    });

    // Extract strings (after comments are extracted)
    // Note: quotes are now escaped as &quot; and &#039;
    // Handle double-quoted strings
    result = result.replace(/&quot;([^&]|&(?!quot;))*?&quot;/g, (match) => {
      const index = stringPlaceholders.length;
      stringPlaceholders.push(`<span class="code-string">${match}</span>`);
      return `__STRING_${index}__`;
    });

    // Handle single-quoted strings (&#039; is escaped single quote)
    result = result.replace(/&#039;([^&]|&(?!#039;))*?&#039;/g, (match) => {
      const index = stringPlaceholders.length;
      // Convert &#039; back to ' for display
      const displayMatch = match.replace(/&#039;/g, "'");
      stringPlaceholders.push(
        `<span class="code-string">${displayMatch}</span>`
      );
      return `__STRING_${index}__`;
    });

    // Now apply other highlighting
    result = result
      // Keywords
      .replace(
        /\b(const|let|var|new|true|false|null)\b/g,
        '<span class="code-keyword">$1</span>'
      )
      // Numbers
      .replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>')
      // Property names
      .replace(/(\w+):/g, '<span class="code-property">$1</span>:');

    // Restore strings and comments
    stringPlaceholders.forEach((str, i) => {
      result = result.replace(`__STRING_${i}__`, str);
    });
    commentPlaceholders.forEach((str, i) => {
      result = result.replace(`__COMMENT_${i}__`, str);
    });

    return result;
  }

  /**
   * Highlight PHP code
   */
  highlightPhpCode(code) {
    // Escape HTML entities first to prevent raw HTML from being rendered
    let result = this.escapeHtml(code);

    // Use placeholders to prevent nested replacements
    const stringPlaceholders = [];
    const commentPlaceholders = [];

    // Extract comments FIRST (before strings) so string placeholders don't end up inside comments
    // Extract block comments
    result = result.replace(/(\/\*\*[\s\S]*?\*\/)/g, (match) => {
      const index = commentPlaceholders.length;
      commentPlaceholders.push(`<span class="code-comment">${match}</span>`);
      return `__COMMENT_${index}__`;
    });

    // Extract single line comments
    result = result.replace(/(\/\/.*$)/gm, (match) => {
      const index = commentPlaceholders.length;
      commentPlaceholders.push(`<span class="code-comment">${match}</span>`);
      return `__COMMENT_${index}__`;
    });

    // Extract strings (single quotes for PHP) - after comments are extracted
    // Note: quotes are now escaped as &#039;
    result = result.replace(/&#039;([^&]|&(?!#039;))*?&#039;/g, (match) => {
      const index = stringPlaceholders.length;
      stringPlaceholders.push(`<span class="code-string">${match}</span>`);
      return `__STRING_${index}__`;
    });

    // Now apply other highlighting
    result = result
      // PHP tags
      .replace(
        /(&lt;\?php|<\?php)/g,
        '<span class="code-keyword">&lt;?php</span>'
      )
      // Keywords
      .replace(
        /\b(return|true|false|null)\b/g,
        '<span class="code-keyword">$1</span>'
      )
      // Numbers
      .replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>');

    // Restore strings (and handle array keys within them)
    stringPlaceholders.forEach((str, i) => {
      // Check if this string is an array key (followed by =>)
      // Note: => is escaped to =&gt;
      const placeholder = `__STRING_${i}__`;
      if (
        result.includes(placeholder + " =&gt;") ||
        result.includes(placeholder + "=&gt;")
      ) {
        // It's an array key, use property styling
        // Note: quotes are escaped as &#039;
        const innerMatch = str.match(
          /<span class="code-string">&#039;([^&]+)&#039;<\/span>/
        );
        if (innerMatch) {
          result = result.replace(
            placeholder,
            `<span class="code-property">&#039;${innerMatch[1]}&#039;</span>`
          );
        } else {
          result = result.replace(placeholder, str);
        }
      } else {
        result = result.replace(placeholder, str);
      }
    });

    // Restore comments
    commentPlaceholders.forEach((str, i) => {
      result = result.replace(`__COMMENT_${i}__`, str);
    });

    return result;
  }

  /**
   * Get changed config (non-default values) for a given config object
   */
  getChangedConfig(config, serverOnly = false) {
    const defaults = this.getDefaultConfig();
    const changedConfig = {};

    // Server-relevant keys for PHP config
    const serverRelevantKeys = [
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

    // Keys that are ConfigBuilder-only (not FileUploader options)
    const configBuilderOnlyKeys = [
      "displayMode",
      "modalButtonText",
      "modalButtonIcon",
      "modalTitle",
      "modalSize",
      "bootstrapVersion",
      "enableModalDropZone",
      "modalMediaButtons",
    ];

    for (const [key, value] of Object.entries(config)) {
      if (serverOnly && !serverRelevantKeys.includes(key)) continue;
      // Skip ConfigBuilder-only keys - they're not FileUploader options
      if (configBuilderOnlyKeys.includes(key)) continue;

      const defaultValue = defaults[key];

      // Check if value differs from default
      if (JSON.stringify(value) !== JSON.stringify(defaultValue)) {
        // Skip empty objects/arrays that are default
        if (
          typeof value === "object" &&
          Object.keys(value).length === 0 &&
          typeof defaultValue === "object" &&
          Object.keys(defaultValue).length === 0
        ) {
          continue;
        }
        changedConfig[key] = value;
      }
    }

    return changedConfig;
  }

  /**
   * Mapping of option keys to their category groups
   * Used to organize changed config into grouped format
   */
  /**
   * Group changed config options by their category
   * Delegates to Constants module
   * @param {Object} changedConfig - Flat changed config object
   * @returns {Object} - Config grouped by category
   */
  groupChangedConfig(changedConfig) {
    return groupChangedConfig(changedConfig);
  }

  /**
   * Generate the configuration code for ALL uploaders
   * Now generates grouped options format for better readability
   */
  generateCode() {
    // Make sure active uploader's config is saved
    if (
      this.activeUploaderId &&
      this.uploaderInstances[this.activeUploaderId]
    ) {
      this.uploaderInstances[this.activeUploaderId].config = { ...this.config };
    }

    const uploaders = Object.entries(this.uploaderInstances);
    let code = "";

    uploaders.forEach(([id, data], uploaderIndex) => {
      const isActive = id === this.activeUploaderId;
      const changedConfig = this.getChangedConfig(data.config);
      const groupedConfig = this.groupChangedConfig(changedConfig);

      // Add comment header for each uploader
      const marker = isActive ? " ← Currently Editing" : "";
      code += `// ${data.name}${marker}\n`;

      // Generate variable name from uploader name
      const varName =
        data.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_|_$/g, "") || `uploader${uploaderIndex + 1}`;

      const groupKeys = GROUP_ORDER.filter((g) => groupedConfig[g]);

      if (groupKeys.length === 0) {
        code += `const ${varName} = new FileUploader('#${varName}');\n`;
      } else {
        code += `const ${varName} = new FileUploader('#${varName}', {\n`;

        groupKeys.forEach((groupKey, groupIndex) => {
          const groupOptions = groupedConfig[groupKey];
          const groupTitle = GROUP_TITLES[groupKey] || groupKey;
          const isLastGroup = groupIndex === groupKeys.length - 1;

          // Add group comment
          code += `  // ${groupTitle}\n`;
          code += `  ${groupKey}: {\n`;

          const entries = Object.entries(groupOptions);
          entries.forEach(([key, value], index) => {
            const isLastEntry = index === entries.length - 1;
            const comma = isLastEntry ? "" : ",";
            const formattedValue = this.formatJsValue(
              key,
              value,
              "    ",
              comma
            );
            code += `    ${key}: ${formattedValue}\n`;
          });

          const groupComma = isLastGroup ? "" : ",";
          code += `  }${groupComma}\n`;

          // Add spacing between groups (except after last)
          if (!isLastGroup) {
            code += "\n";
          }
        });

        code += `});\n`;
      }

      // Add spacing between uploaders
      if (uploaderIndex < uploaders.length - 1) {
        code += "\n";
      }
    });

    return code;
  }

  /**
   * Generate highlighted code
   */
  generateHighlightedCode() {
    let code = this.generateCode();

    // Apply syntax highlighting
    code = code
      // Comments (must be first to avoid interference)
      .replace(/(\/\/.*$)/gm, '<span class="code-comment">$1</span>')
      // Keywords
      .replace(
        /\b(const|let|var|new|true|false|null)\b/g,
        '<span class="code-keyword">$1</span>'
      )
      // Strings
      .replace(/"([^"\\]|\\.)*"/g, '<span class="code-string">"$&"</span>')
      .replace(
        /<span class="code-string">"(".*?")"<\/span>/g,
        '<span class="code-string">$1</span>'
      )
      // Numbers
      .replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>')
      // Property names
      .replace(/(\w+):/g, '<span class="code-property">$1</span>:');

    return code;
  }

  /**
   * PHP group titles for comments
   */
  static PHP_GROUP_TITLES = {
    urls: "Upload Directory",
    limits: "File Size Limits",
    perTypeLimits: "Per-Type Limits",
    fileTypes: "Allowed File Types & MIME Types",
  };

  /**
   * Generate PHP configuration code for ALL uploaders (grouped format)
   */
  generatePhpCode() {
    // Make sure active uploader's config is saved
    if (
      this.activeUploaderId &&
      this.uploaderInstances[this.activeUploaderId]
    ) {
      this.uploaderInstances[this.activeUploaderId].config = { ...this.config };
    }

    const uploaders = Object.entries(this.uploaderInstances);

    let code = `<?php\n/**\n * FileUploader Server Configuration\n * Generated by Config Builder\n */\n\nreturn [\n`;

    uploaders.forEach(([id, data], uploaderIndex) => {
      const isActive = id === this.activeUploaderId;
      const changedConfig = this.getChangedConfig(data.config, true); // server-only
      const groupedConfig = this.groupChangedConfig(changedConfig);

      // Generate key name from uploader name
      const keyName =
        data.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_|_$/g, "") || `uploader${uploaderIndex + 1}`;

      // Add comment for each uploader
      const marker = isActive ? " ← Currently Editing" : "";
      code += `    // ${data.name}${marker}\n`;
      code += `    '${keyName}' => [\n`;

      // PHP only needs specific groups: urls, limits, perTypeLimits, fileTypes
      const phpGroups = ["urls", "limits", "perTypeLimits", "fileTypes"];
      const groupKeys = phpGroups.filter((g) => groupedConfig[g]);

      if (groupKeys.length === 0) {
        // No server-relevant options changed
        code += `        // Using defaults\n`;
      } else {
        groupKeys.forEach((groupKey, groupIndex) => {
          const groupOptions = groupedConfig[groupKey];
          const groupTitle = PHP_GROUP_TITLES[groupKey] || groupKey;
          const isLastGroup = groupIndex === groupKeys.length - 1;

          // Add group comment
          code += `        // ${groupTitle}\n`;
          code += `        '${groupKey}' => [\n`;

          const entries = Object.entries(groupOptions);
          entries.forEach(([key, value], index) => {
            const isLastEntry = index === entries.length - 1;
            const comma = isLastEntry ? "" : ",";
            const phpValue = this.jsValueToPhp(value, key);
            code += `            '${key}' => ${phpValue}${comma}\n`;
          });

          const groupComma = isLastGroup ? "" : ",";
          code += `        ]${groupComma}\n`;

          // Add spacing between groups (except after last)
          if (!isLastGroup) {
            code += "\n";
          }
        });
      }

      const uploaderComma = uploaderIndex < uploaders.length - 1 ? "," : "";
      code += `    ]${uploaderComma}\n`;

      // Add spacing between uploaders
      if (uploaderIndex < uploaders.length - 1) {
        code += "\n";
      }
    });

    code += `];\n`;

    return code;
  }

  /**
   * Format a byte size value as a readable multiplication expression
   * e.g., 10485760 becomes "10 * 1024 * 1024" with comment "// 10 MB"
   * @param {number} bytes - Size in bytes
   * @returns {Object} - { expression: string, comment: string }
   */
  formatSizeExpression(bytes) {
    if (bytes === 0) return { expression: "0", comment: "" };

    const GB = 1024 * 1024 * 1024;
    const MB = 1024 * 1024;
    const KB = 1024;

    // Check for clean GB values
    if (bytes >= GB && bytes % GB === 0) {
      const value = bytes / GB;
      return {
        expression: `${value} * 1024 * 1024 * 1024`,
        comment: `// ${value} GB`,
      };
    }

    // Check for clean MB values
    if (bytes >= MB && bytes % MB === 0) {
      const value = bytes / MB;
      return {
        expression: `${value} * 1024 * 1024`,
        comment: `// ${value} MB`,
      };
    }

    // Check for clean KB values
    if (bytes >= KB && bytes % KB === 0) {
      const value = bytes / KB;
      return {
        expression: `${value} * 1024`,
        comment: `// ${value} KB`,
      };
    }

    // No clean unit, just return the raw value
    return { expression: String(bytes), comment: `// ${bytes} bytes` };
  }

  /**
   * Check if a key represents a size value (in bytes)
   * @param {string} key - Config key name
   * @returns {boolean}
   */
  isSizeKey(key) {
    const sizeKeys = [
      "perFileMaxSize",
      "totalMaxSize",
      "perTypeMaxTotalSize",
      "perFileMaxSizePerType",
      "maxVideoRecordingFileSize",
      "maxAudioRecordingFileSize",
    ];
    return sizeKeys.includes(key);
  }

  /**
   * Check if a key represents a bitrate value (in bits per second)
   * @param {string} key - Config key name
   * @returns {boolean}
   */
  isBitrateKey(key) {
    const bitrateKeys = ["videoBitsPerSecond", "audioBitsPerSecond"];
    return bitrateKeys.includes(key);
  }

  /**
   * Format a bitrate value as a readable expression
   * e.g., 2500000 becomes "2500000" with comment "// 2.5 Mbps"
   * @param {number} bps - Bitrate in bits per second
   * @returns {Object} - { expression: string, comment: string }
   */
  formatBitrateExpression(bps) {
    if (bps === 0) return { expression: "0", comment: "" };

    const Mbps = 1000000;
    const Kbps = 1000;

    // Check for clean Mbps values (divisible by 1,000,000)
    if (bps >= Mbps && bps % Mbps === 0) {
      const value = bps / Mbps;
      return {
        expression: `${value} * 1000 * 1000`,
        comment: `// ${value} Mbps`,
      };
    }

    // Check for clean Kbps values (divisible by 1,000)
    if (bps >= Kbps && bps % Kbps === 0) {
      const value = bps / Kbps;
      return {
        expression: `${value} * 1000`,
        comment: `// ${value} Kbps`,
      };
    }

    // For non-clean values, just return the raw number
    return { expression: String(bps), comment: `// ${bps} bps` };
  }

  /**
   * Format a config value for JavaScript output
   * Handles size values specially to show readable expressions
   * @param {string} key - Config key
   * @param {any} value - Config value
   * @param {string} indent - Current indentation
   * @param {string} trailingComma - Optional comma to place before any trailing comment
   * @returns {string} - Formatted value with optional comment
   */
  formatJsValue(key, value, indent = "  ", trailingComma = "") {
    // Handle size objects (perTypeMaxTotalSize, perFileMaxSizePerType)
    if (this.isSizeKey(key) && typeof value === "object" && value !== null) {
      const entries = Object.entries(value);
      if (entries.length === 0) return `{}${trailingComma}`;

      let result = "{\n";
      entries.forEach(([k, v], idx) => {
        const innerComma = idx < entries.length - 1 ? "," : "";
        const formatted = this.formatSizeExpression(v);
        // Use quotes for non-identifier keys (like "image", "video", etc.)
        const quotedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `"${k}"`;
        result += `${indent}  ${quotedKey}: ${formatted.expression}${innerComma} ${formatted.comment}\n`;
      });
      result += `${indent}}${trailingComma}`;
      return result;
    }

    // Handle single size value (perFileMaxSize, totalMaxSize, maxVideoRecordingFileSize, maxAudioRecordingFileSize)
    if (this.isSizeKey(key) && typeof value === "number") {
      const formatted = this.formatSizeExpression(value);
      // Place comma before the comment
      return `${formatted.expression}${trailingComma} ${formatted.comment}`;
    }

    // Handle bitrate values (videoBitsPerSecond, audioBitsPerSecond)
    if (this.isBitrateKey(key) && typeof value === "number") {
      const formatted = this.formatBitrateExpression(value);
      // Place comma before the comment
      return `${formatted.expression}${trailingComma} ${formatted.comment}`;
    }

    // Default: use JSON.stringify
    return (
      JSON.stringify(value, null, 2).replace(/\n/g, `\n${indent}`) +
      trailingComma
    );
  }

  /**
   * Convert JavaScript value to PHP syntax
   * @param {any} value - The value to convert
   * @param {string} key - Optional key name for context (to detect size values)
   */
  jsValueToPhp(value, key = "") {
    if (value === null) return "null";
    if (value === true) return "true";
    if (value === false) return "false";
    if (typeof value === "number") {
      // Check if this is a size value
      if (key && this.isSizeKey(key)) {
        const formatted = this.formatSizeExpression(value);
        return `${formatted.expression} ${formatted.comment}`;
      }
      return String(value);
    }
    if (typeof value === "string") return `'${value.replace(/'/g, "\\'")}'`;

    if (Array.isArray(value)) {
      if (value.length === 0) return "[]";
      const items = value.map((v) => this.jsValueToPhp(v)).join(", ");
      return `[${items}]`;
    }

    if (typeof value === "object") {
      const entries = Object.entries(value);
      if (entries.length === 0) return "[]";

      // Check if this is a size object
      if (key && this.isSizeKey(key)) {
        const items = entries
          .map(([k, v]) => {
            const formatted = this.formatSizeExpression(v);
            return `'${k}' => ${formatted.expression}, ${formatted.comment}`;
          })
          .join("\n            ");
        return `[\n            ${items}\n        ]`;
      }

      const items = entries
        .map(([k, v]) => `'${k}' => ${this.jsValueToPhp(v)}`)
        .join(",\n            ");
      return `[\n            ${items}\n        ]`;
    }

    return String(value);
  }

  /**
   * Generate highlighted PHP code
   */
  generateHighlightedPhpCode() {
    let code = this.generatePhpCode();

    // Apply PHP syntax highlighting
    code = code
      // PHP tags
      .replace(
        /(&lt;\?php|<\?php)/g,
        '<span class="code-keyword">&lt;?php</span>'
      )
      // Block comments
      .replace(/(\/\*\*[\s\S]*?\*\/)/g, '<span class="code-comment">$1</span>')
      // Single line comments
      .replace(/(\/\/.*$)/gm, '<span class="code-comment">$1</span>')
      // Keywords
      .replace(
        /\b(return|true|false|null)\b/g,
        '<span class="code-keyword">$1</span>'
      )
      // Numbers
      .replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>')
      // Strings (single quotes)
      .replace(/'([^'\\]|\\.)*'/g, '<span class="code-string">$&</span>')
      // Array keys
      .replace(/'(\w+)'\s*=>/g, "<span class=\"code-property\">'$1'</span> =>");

    return code;
  }

  /**
   * Update the live preview - shows ALL uploaders vertically
   * Only the active uploader gets re-created when config changes
   */
  updatePreview(forceRefreshAll = false) {
    const previewEl = this.element.querySelector("#uploader-preview");
    if (!previewEl) return;

    // Get or create active uploader data
    if (
      !this.activeUploaderId ||
      !this.uploaderInstances[this.activeUploaderId]
    ) {
      // Initialize if needed
      if (Object.keys(this.uploaderInstances).length === 0) {
        this.uploaderCounter = 1;
        this.activeUploaderId = "uploader-1";
        this.uploaderInstances["uploader-1"] = {
          name: "Uploader 1",
          config: { ...this.config },
          preset: this.currentPreset,
          instance: null,
          containerId: null,
        };
      }
    }

    // Update the active uploader's config and preset
    if (this.uploaderInstances[this.activeUploaderId]) {
      this.uploaderInstances[this.activeUploaderId].config = { ...this.config };
      this.uploaderInstances[this.activeUploaderId].preset = this.currentPreset;
    }

    // If force refresh all or first time, rebuild everything
    if (forceRefreshAll || previewEl.children.length === 0) {
      // Destroy all existing instances and disconnect observers
      for (const [id, data] of Object.entries(this.uploaderInstances)) {
        // Disconnect file change observer
        if (data.fileChangeObserver) {
          data.fileChangeObserver.disconnect();
          data.fileChangeObserver = null;
        }
        if (data.instance && typeof data.instance.destroy === "function") {
          // Stop any active recordings before destroying
          this.cancelActiveRecordings(data.instance);
          data.instance.destroy();
        }
        data.instance = null;
      }

      // Clear preview
      previewEl.innerHTML = "";

      // Create all uploaders vertically
      for (const [id, data] of Object.entries(this.uploaderInstances)) {
        this.createUploaderPreview(previewEl, id, data);
      }
    } else {
      // Only refresh the active uploader
      const activeData = this.uploaderInstances[this.activeUploaderId];
      if (activeData) {
        // Disconnect file change observer
        if (activeData.fileChangeObserver) {
          activeData.fileChangeObserver.disconnect();
          activeData.fileChangeObserver = null;
        }
        // Destroy existing active instance
        if (
          activeData.instance &&
          typeof activeData.instance.destroy === "function"
        ) {
          // Stop any active recordings before destroying
          this.cancelActiveRecordings(activeData.instance);
          activeData.instance.destroy();
        }
        activeData.instance = null;

        // Find the existing wrapper
        const existingWrapper = previewEl.querySelector(
          `[data-uploader-wrapper="${this.activeUploaderId}"]`
        );

        if (existingWrapper) {
          // Check if we need to rebuild the entire wrapper (displayMode changed)
          const currentDisplayMode = activeData.config.displayMode || "inline";
          const isModalMode =
            currentDisplayMode === "modal-minimal" ||
            currentDisplayMode === "modal-detailed";
          const isMinimalMode = currentDisplayMode === "modal-minimal";
          const wrapperHasModalPreview =
            existingWrapper.querySelector(
              ".fu-config-builder-modal-preview"
            ) !== null;
          const wrapperHasMinimalPreview =
            existingWrapper.querySelector(
              ".fu-config-builder-modal-minimal-preview"
            ) !== null;

          // If display mode type changed (inline <-> modal, or minimal <-> detailed), rebuild the entire wrapper
          // Also rebuild for modal mode when any modal option changes (button text, title, etc.)
          const needsRebuild =
            isModalMode !== wrapperHasModalPreview ||
            (isModalMode &&
              wrapperHasModalPreview &&
              isMinimalMode !== wrapperHasMinimalPreview) ||
            isModalMode; // Always rebuild for modal mode to reflect option changes

          if (needsRebuild) {
            // Remove the old wrapper and recreate it
            existingWrapper.remove();
            this.createUploaderPreview(
              previewEl,
              this.activeUploaderId,
              activeData
            );
          } else {
            // Inline mode - just update the container content
            const uploaderContainer = existingWrapper.querySelector(
              ".fu-config-builder-uploader-container"
            );
            if (uploaderContainer) {
              uploaderContainer.innerHTML = "";
              const containerId = `preview-${
                this.activeUploaderId
              }-${Date.now()}`;
              const container = document.createElement("div");
              container.id = containerId;
              uploaderContainer.appendChild(container);

              if (window.FileUploader) {
                const previewConfig = {
                  ...activeData.config,
                  autoFetchConfig: false,
                };
                activeData.instance = new window.FileUploader(
                  `#${containerId}`,
                  previewConfig
                );
                activeData.containerId = containerId;
              }
            }
          }
        }
      }
    }

    // Apply theme to newly created uploaders
    const effectiveTheme = this.getEffectiveThemeMode();
    this.applyThemeToUploaders(effectiveTheme);
  }

  /**
   * Cancel any active recordings on an uploader instance (without saving files)
   * @param {Object} instance - The FileUploader instance
   */
  cancelActiveRecordings(instance) {
    if (!instance) return;

    try {
      // Cancel video recording if active (without saving file)
      if (instance.captureManager?.videoRecorder?.isRecording) {
        instance.captureManager.videoRecorder.cancelRecording();
        instance.recordingUI?.cleanup();
      }

      // Cancel audio recording if active (without saving file)
      if (instance.captureManager?.audioRecorder?.isRecording) {
        instance.captureManager.audioRecorder.cancelRecording();
        instance.recordingUI?.cleanup();
      }
    } catch (error) {
      // Silently handle errors during cleanup
      console.warn("Error cancelling active recordings:", error);
    }
  }

  /**
   * Create a single uploader preview with header
   */
  createUploaderPreview(previewEl, id, data) {
    const isActive = id === this.activeUploaderId;
    const containerId = `preview-${id}-${Date.now()}`;
    const displayMode = data.config.displayMode || "inline";
    const isModalMode =
      displayMode === "modal-minimal" || displayMode === "modal-detailed";

    const wrapper = document.createElement("div");
    wrapper.className = `fu-config-builder-uploader-wrapper ${
      isActive ? "active" : ""
    }`;
    wrapper.dataset.uploaderWrapper = id;

    // For modal mode, create a button + modal preview
    if (isModalMode) {
      const modalId = `preview-modal-${id}-${Date.now()}`;
      const buttonText = data.config.modalButtonText || "Upload Files";
      const buttonIcon = data.config.modalButtonIcon || "upload";
      const modalTitle = data.config.modalTitle || "Upload Files";
      const modalSize = data.config.modalSize || "lg";
      const bootstrapVersion = data.config.bootstrapVersion || "5";
      const isMinimal = displayMode === "modal-minimal";

      // Filter media buttons to only include those whose capture option is enabled
      const mediaButtons = this.filterEnabledMediaButtons(
        data.config.modalMediaButtons || [],
        data.config
      );

      // Get the button icon SVG
      const buttonIconSvg = this.getModalButtonIcon(buttonIcon);

      // Generate media capture buttons HTML using the reusable function
      const buttonSize = data.config.buttonSize || "md";
      const mediaButtonsHtml = this.getMediaCaptureButtonsHtml(
        mediaButtons,
        id,
        buttonSize
      );

      wrapper.innerHTML = `
        <div class="fu-config-builder-uploader-header">
          <span class="fu-config-builder-uploader-label">${
            data.name
          } <span class="fu-config-builder-mode-badge">${
        isMinimal ? "Minimal" : "Detailed"
      } Mode</span></span>
          ${
            isActive
              ? '<span class="fu-config-builder-uploader-badge">Editing</span>'
              : '<button class="fu-config-builder-uploader-edit-btn" data-uploader-id="' +
                id +
                '">Edit This</button>'
          }
        </div>
        <div class="fu-config-builder-uploader-container fu-config-builder-modal-preview">
          <div class="fu-config-builder-modal-info">
            <span class="fu-config-builder-modal-info-item">Size: <strong>${modalSize.toUpperCase()}</strong></span>
            <span class="fu-config-builder-modal-info-item">Bootstrap: <strong>v${bootstrapVersion}</strong></span>
          </div>
          ${
            isMinimal
              ? `
            <div class="fu-config-builder-modal-minimal-preview">
              <button type="button" class="fu-config-builder-modal-btn" data-modal-id="${modalId}" data-uploader-id="${id}">
                ${buttonIconSvg}
                ${buttonText}
              </button>
              ${mediaButtonsHtml}
              <span class="fu-config-builder-file-badge" data-file-badge="${id}">
                <span class="badge-text">No files selected</span>
              </span>
            </div>
            <p class="fu-config-builder-preview-hint">Click button to open modal with FileUploader. Drag and drop files here.</p>
          `
              : `
            <div class="fu-config-builder-modal-detailed-preview">
              <div class="fu-config-builder-modal-buttons-row">
                <button type="button" class="fu-config-builder-modal-btn" data-modal-id="${modalId}" data-uploader-id="${id}">
                  ${buttonIconSvg}
                  ${buttonText}
                </button>
                ${mediaButtonsHtml}
              </div>
              <div class="fu-config-builder-file-summary" data-file-summary="${id}">
                <div class="summary-empty">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  <span>No files selected yet</span>
                </div>
              </div>
            </div>
            <p class="fu-config-builder-preview-hint">Click button to open modal with FileUploader. Drag and drop files here.</p>
          `
          }
          <!-- Hidden modal container for actual FileUploader -->
          <div class="fu-config-builder-modal-hidden" id="${modalId}" style="display: none;">
            <div class="fu-config-builder-modal-dialog fu-config-builder-modal-${modalSize}">
              <div class="fu-config-builder-modal-header">
                <h5>${modalTitle}</h5>
                <button type="button" class="fu-config-builder-modal-close" data-close-modal="${modalId}">&times;</button>
              </div>
              <div class="fu-config-builder-modal-body">
                <div id="${containerId}" data-uploader-container="${containerId}"></div>
              </div>
              <div class="fu-config-builder-modal-footer">
                <button type="button" class="fu-config-builder-modal-close-btn" data-close-modal="${modalId}">Done</button>
              </div>
            </div>
          </div>
        </div>
        <div class="fu-config-builder-css-vars-toggle">
          <button class="fu-config-builder-css-vars-btn" data-uploader-id="${id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            <span>Show CSS Variables</span>
            <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </button>
        </div>
        <div class="fu-config-builder-css-vars-panel" data-vars-panel="${id}" style="display: none;">
          ${this.renderUsedCssVariables(containerId)}
        </div>
      `;

      previewEl.appendChild(wrapper);

      // Create uploader instance inside the hidden modal
      if (window.FileUploader) {
        const enableModalDropZone = data.config.enableModalDropZone !== false; // Default true

        const previewConfig = {
          ...data.config,
          autoFetchConfig: false,
          cleanupOnDestroy: true, // Clean up files when preview is refreshed
        };

        // Enable drag-drop on the modal trigger button if option is enabled
        if (enableModalDropZone) {
          previewConfig.externalDropZone = `.fu-config-builder-modal-btn[data-uploader-id="${id}"]`;
        }

        // Enable capture features based on modalMediaButtons selection
        // This ensures the FileUploader instance can handle captures from external buttons
        if (mediaButtons && mediaButtons.length > 0) {
          if (mediaButtons.includes("screenshot")) {
            previewConfig.enableScreenCapture = true;
          }
          if (mediaButtons.includes("video")) {
            previewConfig.enableVideoRecording = true;
          }
          if (mediaButtons.includes("audio")) {
            previewConfig.enableAudioRecording = true;
          }
          if (mediaButtons.includes("fullpage")) {
            previewConfig.enableFullPageCapture = true;
          }
          if (mediaButtons.includes("region")) {
            previewConfig.enableRegionCapture = true;
          }

          // Set external recording toolbar container for video/audio recording
          // This shows recording controls (pause, stop, etc.) next to the media capture buttons
          // Use a selector string so it works even after DOM updates
          previewConfig.externalRecordingToolbarContainer = `.media-hub-capture-container[data-uploader-id="${id}"]`;
        }

        data.instance = new window.FileUploader(
          `#${containerId}`,
          previewConfig
        );
        data.containerId = containerId;

        // Set up file change observer to auto-update preview info
        this.setupFileChangeObserver(id);
      }

      // Add modal open/close handlers
      const modalOpenBtn = wrapper.querySelector(
        `[data-modal-id="${modalId}"]`
      );
      const modal = wrapper.querySelector(`#${modalId}`);
      const modalCloseBtns = wrapper.querySelectorAll(
        `[data-close-modal="${modalId}"]`
      );

      if (modalOpenBtn && modal) {
        modalOpenBtn.addEventListener("click", () => {
          modal.style.display = "flex";
        });
      }

      modalCloseBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          modal.style.display = "none";
          // Update file info when modal closes
          this.updateModalFileInfo(wrapper, id, data, isMinimal);
        });
      });

      // Close modal on backdrop click
      if (modal) {
        modal.addEventListener("click", (e) => {
          if (e.target === modal) {
            modal.style.display = "none";
            // Update file info when modal closes
            this.updateModalFileInfo(wrapper, id, data, isMinimal);
          }
        });
      }

      // Attach media capture button handlers using the reusable function
      this.attachMediaCaptureHandlers(wrapper, id);
    } else {
      // Standard inline mode
      wrapper.innerHTML = `
        <div class="fu-config-builder-uploader-header">
          <span class="fu-config-builder-uploader-label">${data.name}</span>
          ${
            isActive
              ? '<span class="fu-config-builder-uploader-badge">Editing</span>'
              : '<button class="fu-config-builder-uploader-edit-btn" data-uploader-id="' +
                id +
                '">Edit This</button>'
          }
        </div>
        <div class="fu-config-builder-uploader-container">
          <div id="${containerId}" data-uploader-container="${containerId}"></div>
        </div>
        <div class="fu-config-builder-css-vars-toggle">
          <button class="fu-config-builder-css-vars-btn" data-uploader-id="${id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            <span>Show CSS Variables</span>
            <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
          </button>
        </div>
        <div class="fu-config-builder-css-vars-panel" data-vars-panel="${id}" style="display: none;">
          ${this.renderUsedCssVariables(containerId)}
        </div>
      `;

      previewEl.appendChild(wrapper);

      // Create uploader instance
      if (window.FileUploader) {
        const previewConfig = {
          ...data.config,
          autoFetchConfig: false,
          cleanupOnDestroy: true, // Clean up files when preview is refreshed
        };
        data.instance = new window.FileUploader(
          `#${containerId}`,
          previewConfig
        );
        data.containerId = containerId;
      }
    }

    // Add click handler for "Edit This" button
    const editBtn = wrapper.querySelector(
      ".fu-config-builder-uploader-edit-btn"
    );
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        this.selectUploader(id);
      });
    }

    // Add click handler for CSS vars toggle button
    const cssVarsBtn = wrapper.querySelector(".fu-config-builder-css-vars-btn");
    if (cssVarsBtn) {
      cssVarsBtn.addEventListener("click", () => {
        this.toggleCssVarsPanel(id);
      });
    }

    // Attach CSS variables panel events
    const cssVarsPanel = wrapper.querySelector(
      ".fu-config-builder-css-vars-panel"
    );
    if (cssVarsPanel) {
      this.attachCssVarsPanelEvents(cssVarsPanel);
    }

    // Apply current theme to the new uploader container
    const effectiveTheme = this.getEffectiveThemeMode();
    const uploaderContainer = wrapper.querySelector(
      ".fu-config-builder-uploader-container"
    );
    if (uploaderContainer) {
      this.applyThemeToContainer(uploaderContainer, effectiveTheme);
    }
  }

  /**
   * Apply theme CSS variables to a single container
   */
  applyThemeToContainer(container, effectiveTheme) {
    const varsToApply = this.getThemeVars(effectiveTheme);
    for (const [varName, value] of Object.entries(varsToApply)) {
      container.style.setProperty(varName, value);
    }
  }

  /**
   * Toggle CSS variables panel visibility
   */
  toggleCssVarsPanel(uploaderId) {
    const wrapper = this.element.querySelector(
      `[data-uploader-wrapper="${uploaderId}"]`
    );
    if (!wrapper) return;

    const panel = wrapper.querySelector(`[data-vars-panel="${uploaderId}"]`);
    const btn = wrapper.querySelector(".fu-config-builder-css-vars-btn");

    if (panel && btn) {
      const isVisible = panel.style.display !== "none";
      panel.style.display = isVisible ? "none" : "block";
      btn.classList.toggle("active", !isVisible);

      // Update button text
      const btnText = btn.querySelector("span");
      if (btnText) {
        btnText.textContent = isVisible
          ? "Show CSS Variables"
          : "Hide CSS Variables";
      }

      // Refresh panel content when opening to get latest computed values
      if (!isVisible) {
        const containerId = wrapper.querySelector("[data-uploader-container]")
          ?.dataset.uploaderContainer;
        if (containerId) {
          panel.innerHTML = this.renderUsedCssVariables(containerId);
          this.attachCssVarsPanelEvents(panel);
        }
      }
    }
  }

  /**
   * Attach event handlers to CSS variables panel elements
   */
  attachCssVarsPanelEvents(panel) {
    // Click on item to navigate to Styles panel
    panel
      .querySelectorAll(".fu-config-builder-css-var-item")
      .forEach((item) => {
        item.addEventListener("click", () => {
          // If this variable has a source variable (references another var),
          // navigate to the source variable instead
          const sourceVar = item.dataset.sourceVar;
          const varName = sourceVar || item.dataset.varName;
          if (varName) {
            this.navigateToStyleVariable(varName);
          }
        });
      });
  }

  /**
   * Get the actual computed CSS variable value from an element
   */
  getComputedCssVariable(element, varName) {
    const styles = getComputedStyle(element);
    return styles.getPropertyValue(varName).trim();
  }

  /**
   * Check if a CSS variable is actually being applied (has a computed value)
   */
  isVariableApplied(containerId, varName) {
    const container = this.element.querySelector(
      `[data-uploader-container="${containerId}"]`
    );
    if (!container) return false;

    // Get the computed value of the CSS variable from the root/container
    const uploaderElement = container.querySelector(".file-uploader");
    if (!uploaderElement) return false;

    const computedValue = this.getComputedCssVariable(uploaderElement, varName);
    return computedValue !== "";
  }

  /**
   * Get applied CSS variables with their actual computed values for an uploader
   */
  getAppliedCssVariables(containerId) {
    const container = this.element.querySelector(
      `[data-uploader-container="${containerId}"]`
    );
    if (!container) return [];

    const uploaderElement = container.querySelector(".file-uploader");
    if (!uploaderElement) return [];

    const appliedVars = [];
    const seenVars = new Set();

    // Map of CSS properties to the CSS variables that control them
    const propToVarMap = {
      color: [
        "--fu-color-text",
        "--fu-color-text-muted",
        "--fu-color-text-light",
        "--fu-color-success-text",
        "--fu-color-error-text",
      ],
      "background-color": [
        "--fu-color-bg",
        "--fu-color-bg-light",
        "--fu-color-bg-hover",
        "--fu-color-primary",
        "--fu-color-primary-light",
        "--fu-color-success-bg",
        "--fu-color-error-bg",
      ],
      "border-color": [
        "--fu-color-border",
        "--fu-color-border-light",
        "--fu-color-border-hover",
        "--fu-color-primary",
      ],
      "font-size": [
        "--fu-font-size-xs",
        "--fu-font-size-sm",
        "--fu-font-size-base",
        "--fu-font-size-md",
        "--fu-font-size-lg",
      ],
      "font-family": ["--fu-font-family"],
      "font-weight": [
        "--fu-font-weight-normal",
        "--fu-font-weight-medium",
        "--fu-font-weight-semibold",
        "--fu-font-weight-bold",
      ],
      "border-radius": [
        "--fu-radius-xs",
        "--fu-radius-sm",
        "--fu-radius-md",
        "--fu-radius-lg",
        "--fu-radius-xl",
      ],
      padding: [
        "--fu-spacing-xs",
        "--fu-spacing-sm",
        "--fu-spacing-md",
        "--fu-spacing-lg",
        "--fu-spacing-xl",
      ],
      gap: [
        "--fu-spacing-xs",
        "--fu-spacing-sm",
        "--fu-spacing-md",
        "--fu-spacing-lg",
      ],
      "box-shadow": ["--fu-shadow-sm", "--fu-shadow-md", "--fu-shadow-lg"],
      width: [
        "--fu-icon-size-sm",
        "--fu-icon-size-md",
        "--fu-icon-size-lg",
        "--fu-button-size",
        "--fu-spinner-size",
      ],
      height: [
        "--fu-preview-height",
        "--fu-button-size",
        "--fu-spinner-size",
        "--fu-icon-size-lg",
      ],
      "border-width": ["--fu-dropzone-border-width"],
    };

    // Elements to check in the uploader
    const elementsToCheck = [
      { selector: ".file-uploader", name: "Container" },
      { selector: ".media-hub-dropzone", name: "Dropzone" },
      { selector: ".media-hub-dropzone-icon", name: "Dropzone Icon" },
      { selector: ".media-hub-dropzone-text", name: "Dropzone Text" },
      { selector: ".media-hub-hint", name: "Hint" },
      { selector: ".media-hub-files", name: "Files List" },
      { selector: ".media-hub-file", name: "File Item" },
      { selector: ".media-hub-file-preview", name: "File Preview" },
      { selector: ".media-hub-file-name", name: "File Name" },
      { selector: ".media-hub-file-size", name: "File Size" },
      { selector: ".media-hub-btn", name: "Button" },
      { selector: ".media-hub-progress-bar", name: "Progress Bar" },
      { selector: ".media-hub-compact-progress", name: "Compact Progress" },
      { selector: ".media-hub-type-progress", name: "Type Progress" },
      { selector: ".media-hub-limit-progress", name: "Limit Progress" },
      { selector: ".media-hub-limits", name: "Limits" },
      { selector: ".media-hub-limits-summary", name: "Limits Summary" },
    ];

    for (const { selector } of elementsToCheck) {
      const element = container.querySelector(selector);
      if (!element) continue;

      const styles = getComputedStyle(element);

      // Check each CSS property and find which variable is being applied
      for (const [prop, possibleVars] of Object.entries(propToVarMap)) {
        const computedValue = styles.getPropertyValue(prop);
        if (!computedValue) continue;

        for (const varName of possibleVars) {
          if (seenVars.has(varName)) continue;

          // Get the CSS variable value
          const varValue = styles.getPropertyValue(varName).trim();
          if (!varValue) continue;

          // Check if this variable's value matches (or is part of) the computed value
          // For colors, we need to compare normalized values
          const normalizedComputed = this.normalizeColorValue(computedValue);
          const normalizedVar = this.normalizeColorValue(varValue);

          if (
            normalizedComputed &&
            normalizedVar &&
            (normalizedComputed === normalizedVar ||
              computedValue.includes(varValue))
          ) {
            seenVars.add(varName);
            appliedVars.push({
              name: varName,
              computedValue: varValue,
              element: selector,
            });
          }
        }
      }
    }

    // Also check CSS variables that are definitely set on :root
    const rootStyles = getComputedStyle(document.documentElement);
    for (const section of Object.values(this.styleDefinitions)) {
      for (const varName of Object.keys(section.variables)) {
        if (seenVars.has(varName)) continue;

        const varValue = rootStyles.getPropertyValue(varName).trim();
        if (varValue && this.varToSelectorMap[varName]) {
          seenVars.add(varName);
          appliedVars.push({
            name: varName,
            computedValue: varValue,
            element: this.varToSelectorMap[varName],
          });
        }
      }
    }

    return appliedVars;
  }

  /**
   * Normalize color value for comparison (convert hex, rgb, etc to a common format)
   */
  normalizeColorValue(value) {
    if (!value) return null;

    // Create a temporary element to parse the color
    const temp = document.createElement("div");
    temp.style.color = value;
    document.body.appendChild(temp);
    const computed = getComputedStyle(temp).color;
    document.body.removeChild(temp);

    return computed;
  }

  /**
   * Get current effective theme mode (light or dark)
   */
  getEffectiveThemeMode() {
    if (this.theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return this.theme;
  }

  /**
   * Render used CSS variables for an uploader
   */
  renderUsedCssVariables(containerId) {
    // Get actually applied CSS variables
    const appliedVars = this.getAppliedCssVariables(containerId);
    const appliedVarNames = new Set(appliedVars.map((v) => v.name));

    // Determine current theme mode to filter mode-specific sections
    const currentMode = this.getEffectiveThemeMode();

    // Get the variable source mapping for current mode
    const varSourceMap = this.getVarSourceMap();
    const modeSourceMap = varSourceMap[currentMode] || {};

    // Group variables by their section - show all mapped variables, not just computed ones
    const groupedVars = {};

    for (const [sectionKey, section] of Object.entries(this.styleDefinitions)) {
      // Skip sections that don't match current mode (if they have a mode)
      if (section.mode && section.mode !== currentMode) {
        continue;
      }

      for (const [varName, def] of Object.entries(section.variables)) {
        // Show variable if it's in the selector map OR if it was detected as applied
        const inSelectorMap = !!this.varToSelectorMap[varName];
        const inApplied = appliedVarNames.has(varName);

        if (inSelectorMap || inApplied) {
          if (!groupedVars[sectionKey]) {
            groupedVars[sectionKey] = {
              title: section.title,
              mode: section.mode,
              variables: [],
            };
          }

          // Get value - prefer computed value from DOM, then stored value, then default
          const appliedInfo = appliedVars.find((v) => v.name === varName);

          // Get the actual computed value from the uploader container or document root
          const container = this.element.querySelector(
            `[data-uploader-container="${containerId}"]`
          );
          const computedStyles = container
            ? getComputedStyle(container)
            : getComputedStyle(document.documentElement);
          const actualComputedValue = computedStyles
            .getPropertyValue(varName)
            .trim();

          // Use actual computed value if available, otherwise fall back to stored/default
          const currentValue =
            actualComputedValue || this.styleValues[varName] || def.default;
          const computedValue = appliedInfo
            ? appliedInfo.computedValue
            : currentValue;
          const isModified =
            this.styleValues[varName] &&
            this.styleValues[varName] !== def.default;

          // Check if this variable references another variable (from varSourceMap)
          const sourceVar = modeSourceMap[varName] || null;

          groupedVars[sectionKey].variables.push({
            name: varName,
            label: def.label,
            value: computedValue,
            currentValue: currentValue,
            defaultValue: def.default,
            type: def.type,
            selector: this.varToSelectorMap[varName] || appliedInfo?.element,
            isModified: isModified,
            sourceVar: sourceVar,
          });
        }
      }
    }

    let html = '<div class="fu-config-builder-css-vars-list">';

    // Check if we have any variables
    const hasVariables = Object.values(groupedVars).some(
      (g) => g.variables.length > 0
    );

    if (!hasVariables) {
      html +=
        '<div class="fu-config-builder-css-vars-empty">Loading CSS variables...</div>';
    }

    for (const [sectionKey, group] of Object.entries(groupedVars)) {
      if (group.variables.length === 0) continue;

      const modeIndicator = group.mode
        ? `<span class="fu-config-builder-css-vars-mode ${group.mode}">${
            group.mode === "light" ? "☀" : "☾"
          }</span>`
        : "";

      html += `
        <div class="fu-config-builder-css-vars-group">
          <div class="fu-config-builder-css-vars-group-title">${modeIndicator}${group.title}</div>
          <div class="fu-config-builder-css-vars-items">
      `;

      for (const v of group.variables) {
        // Show color preview for color types, or value for others
        let valueDisplay = "";
        if (v.type === "color") {
          valueDisplay = `<span class="fu-config-builder-css-var-color" style="background: ${v.currentValue}"></span>`;
        } else {
          valueDisplay = `<code class="fu-config-builder-css-var-value">${v.currentValue}</code>`;
        }

        // Show source variable if this semantic variable references a palette variable
        const sourceDisplay = v.sourceVar
          ? `<code class="fu-config-builder-css-var-source" data-source-var="${v.sourceVar}" data-tooltip="Uses ${v.sourceVar}" data-tooltip-position="top">← ${v.sourceVar}</code>`
          : "";

        // If there's a source var, clicking should navigate to it
        const dataSourceAttr = v.sourceVar
          ? `data-source-var="${v.sourceVar}"`
          : "";

        html += `
          <div class="fu-config-builder-css-var-item ${
            v.isModified ? "modified" : ""
          }${v.sourceVar ? " has-source" : ""}" data-var-name="${
          v.name
        }" data-section="${sectionKey}" ${dataSourceAttr} data-tooltip="${
          v.sourceVar
            ? `Uses ${v.sourceVar} - Click to edit source`
            : "Click to edit in Styles panel"
        }" data-tooltip-position="top">
            ${valueDisplay}
            <span class="fu-config-builder-css-var-label">${v.label}</span>
            <code class="fu-config-builder-css-var-name">${v.name}</code>
            ${sourceDisplay}
          </div>
        `;
      }

      html += `
          </div>
        </div>
      `;
    }

    html += "</div>";
    return html;
  }

  /**
   * Handle CSS variable input change from the panel
   */
  handleCssVarInputChange(varName, value, panel = null) {
    // Update the style value
    this.styleValues[varName] = value;

    // Apply to CSS
    document.documentElement.style.setProperty(varName, value);

    // Update the Styles panel if it has this variable
    const styleVar = this.element.querySelector(
      `.fu-config-builder-style-var[data-var="${varName}"]`
    );
    if (styleVar) {
      // Try color picker first
      const colorInput = styleVar.querySelector(
        ".fu-config-builder-color-input"
      );
      if (colorInput) {
        colorInput.value = value;
        // Update color preview
        const colorPreview = styleVar.querySelector(
          ".fu-config-builder-color-preview"
        );
        if (colorPreview) colorPreview.style.background = value;
        // Update text input
        const textInput = styleVar.querySelector(
          ".fu-config-builder-color-text"
        );
        if (textInput) textInput.value = value;
      } else {
        // Try regular input
        const input = styleVar.querySelector("input");
        if (input) input.value = value;
      }
    }

    // Find the default value for this variable to check if modified
    let defaultValue = null;
    for (const section of Object.values(this.styleDefinitions)) {
      if (section.variables[varName]) {
        defaultValue = section.variables[varName].default;
        break;
      }
    }

    // Update the CSS var item in the panel to show/hide reset button
    if (panel) {
      const item = panel.querySelector(
        `.fu-config-builder-css-var-item[data-var-name="${varName}"]`
      );
      if (item) {
        const isModified = value !== defaultValue;
        item.classList.toggle("modified", isModified);

        // Add or remove reset button
        let resetBtn = item.querySelector(".fu-config-builder-css-var-reset");
        if (isModified && !resetBtn) {
          // Add reset button
          const editBtn = item.querySelector(".fu-config-builder-css-var-edit");
          if (editBtn) {
            resetBtn = document.createElement("button");
            resetBtn.className = "fu-config-builder-css-var-reset";
            resetBtn.dataset.varName = varName;
            resetBtn.dataset.default = defaultValue;
            resetBtn.title = `Reset to default: ${defaultValue}`;
            resetBtn.innerHTML =
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>';
            editBtn.parentNode.insertBefore(resetBtn, editBtn);

            // Attach click handler
            resetBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              this.resetCssVariable(varName, defaultValue);
              // Refresh the panel
              const wrapper = panel.closest("[data-uploader-wrapper]");
              if (wrapper) {
                const containerId = wrapper.querySelector(
                  "[data-uploader-container]"
                )?.dataset.uploaderContainer;
                if (containerId) {
                  panel.innerHTML = this.renderUsedCssVariables(containerId);
                  this.attachCssVarsPanelEvents(panel);
                }
              }
            });
          }
        } else if (!isModified && resetBtn) {
          // Remove reset button
          resetBtn.remove();
        }
      }
    }

    // Update code output
    this.updateCodeOutput();
  }

  /**
   * Reset a CSS variable to its default value
   */
  resetCssVariable(varName, defaultValue) {
    // Remove from styleValues (will use default)
    delete this.styleValues[varName];

    // Apply default to CSS
    document.documentElement.style.setProperty(varName, defaultValue);

    // Update the Styles panel if it has this variable
    const styleVar = this.element.querySelector(
      `.fu-config-builder-style-var[data-var="${varName}"]`
    );
    if (styleVar) {
      // Try color picker first
      const colorInput = styleVar.querySelector(
        ".fu-config-builder-color-input"
      );
      if (colorInput) {
        colorInput.value = defaultValue;
        // Update color preview
        const colorPreview = styleVar.querySelector(
          ".fu-config-builder-color-preview"
        );
        if (colorPreview) colorPreview.style.background = defaultValue;
        // Update text input
        const textInput = styleVar.querySelector(
          ".fu-config-builder-color-text"
        );
        if (textInput) textInput.value = defaultValue;
      } else {
        // Try regular input
        const input = styleVar.querySelector("input");
        if (input) input.value = defaultValue;
      }
    }

    // Update code output
    this.updateCodeOutput();
  }

  /**
   * Navigate to a style variable in the styles tab
   */
  navigateToStyleVariable(varName) {
    // Find which section this variable belongs to
    // Prioritize sections that match the current theme mode
    const currentMode = this.getEffectiveThemeMode();
    let targetSection = null;
    let fallbackSection = null;

    for (const [sectionKey, section] of Object.entries(this.styleDefinitions)) {
      if (section.variables[varName]) {
        // If section has a mode and matches current mode, this is the target
        if (section.mode === currentMode) {
          targetSection = sectionKey;
          break;
        }
        // If section has no mode (shared) or we haven't found a match yet
        if (!section.mode && !fallbackSection) {
          fallbackSection = sectionKey;
        } else if (!targetSection && !fallbackSection) {
          fallbackSection = sectionKey;
        }
      }
    }

    // Use fallback if no mode-specific section found
    if (!targetSection) targetSection = fallbackSection;

    if (!targetSection) return;

    // Switch to Styles main tab
    this.activeMainTab = "styles";
    this.currentStyleSection = targetSection;

    // Update main tab UI
    this.element
      .querySelectorAll(".fu-config-builder-main-tab")
      .forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.mainTab === "styles");
      });
    this.element
      .querySelectorAll(".fu-config-builder-main-tab-content")
      .forEach((content) => {
        content.classList.toggle("active", content.id === "main-tab-styles");
      });

    // Update style vertical tabs
    this.element
      .querySelectorAll(".fu-config-builder-vertical-tab[data-style-section]")
      .forEach((tab) => {
        tab.classList.toggle(
          "active",
          tab.dataset.styleSection === targetSection
        );
      });

    // Update style panels
    this.element
      .querySelectorAll(".fu-config-builder-style-panel")
      .forEach((panel) => {
        panel.classList.toggle(
          "active",
          panel.dataset.stylePanel === targetSection
        );
      });

    // Scroll to the variable after a short delay to allow UI to update
    setTimeout(() => {
      // Find the active panel first, then look for the variable within it
      const activePanel = this.element.querySelector(
        `.fu-config-builder-style-panel[data-style-panel="${targetSection}"]`
      );
      if (!activePanel) return;

      const varElement = activePanel.querySelector(
        `.fu-config-builder-style-var[data-var="${varName}"]`
      );
      if (varElement) {
        // Get the scrollable container (options-content)
        const scrollContainer = activePanel.closest(
          ".fu-config-builder-options-content"
        );
        if (scrollContainer) {
          // Calculate the scroll position to center the element
          const containerRect = scrollContainer.getBoundingClientRect();
          const elementRect = varElement.getBoundingClientRect();
          const scrollTop =
            scrollContainer.scrollTop +
            (elementRect.top - containerRect.top) -
            containerRect.height / 2 +
            elementRect.height / 2;
          scrollContainer.scrollTo({ top: scrollTop, behavior: "smooth" });
        } else {
          // Fallback to scrollIntoView
          varElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        // Add highlight effect
        varElement.classList.add("fu-config-builder-style-var-highlight");
        setTimeout(() => {
          varElement.classList.remove("fu-config-builder-style-var-highlight");
        }, 2000);
      }
    }, 150);
  }

  /**
   * Refresh all uploader previews (used after add/remove)
   * Delegates to UploaderManager module
   */
  refreshAllPreviews() {
    return refreshAllPreviewsFn(this);
  }

  /**
   * Add a new uploader to the preview
   * Delegates to UploaderManager module
   */
  addUploader() {
    return addUploaderFn(this);
  }

  /**
   * Duplicate an existing uploader with its config
   * Delegates to UploaderManager module
   */
  duplicateUploader(uploaderId) {
    return duplicateUploaderFn(this, uploaderId);
  }

  /**
   * Select an uploader and load its config
   * Delegates to UploaderManager module
   */
  selectUploader(uploaderId) {
    return selectUploaderFn(this, uploaderId);
  }

  /**
   * Remove an uploader from the preview
   * Delegates to UploaderManager module
   */
  removeUploader(uploaderId) {
    return removeUploaderFn(this, uploaderId);
  }

  /**
   * Check if an uploader name is already in use
   * Delegates to UploaderManager module
   */
  isNameDuplicate(name, excludeUploaderId = null) {
    return isNameDuplicateFn(this, name, excludeUploaderId);
  }

  /**
   * Edit uploader name
   * Delegates to UploaderManager module
   */
  editUploaderName(uploaderId) {
    return editUploaderNameFn(this, uploaderId);
  }

  /**
   * Update preview header with new name
   * Delegates to UploaderManager module
   */
  updatePreviewHeader(uploaderId, newName) {
    return updatePreviewHeaderFn(this, uploaderId, newName);
  }

  /**
   * Update uploader tabs UI without full re-render
   * Delegates to UploaderManager module
   */
  updateUploaderTabsUI() {
    return updateUploaderTabsUIFn(this);
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Set configuration
   */
  setConfig(config) {
    this.config = { ...this.getDefaultConfig(), ...config };
    this.render();
    this.attachEvents();
    this.initTooltips();
    this.onConfigChange();
  }

  /**
   * Get all uploaders' configurations
   */
  getAllConfigs() {
    // Update current uploader's config
    if (
      this.activeUploaderId &&
      this.uploaderInstances[this.activeUploaderId]
    ) {
      this.uploaderInstances[this.activeUploaderId].config = { ...this.config };
    }

    return Object.entries(this.uploaderInstances).map(([id, data]) => ({
      id,
      name: data.name,
      config: { ...data.config },
    }));
  }

  // ============================================================================
  // Search Functionality - Delegates to SearchUI module
  // ============================================================================

  /**
   * Attach search event handlers
   * Delegates to SearchUI module
   */
  attachSearchEvents() {
    return attachSearchEventsFn(this);
  }

  /**
   * Build search index from option definitions
   * Delegates to SearchUI module
   */
  buildSearchIndex() {
    return buildSearchIndexForBuilderFn(this);
  }

  /**
   * Fuzzy search implementation
   * Delegates to SearchUI module
   */
  fuzzySearch(query) {
    return fuzzySearchForBuilderFn(this, query);
  }

  /**
   * Render search results dropdown
   * Delegates to SearchUI module
   */
  renderSearchResults(results, query) {
    return renderSearchResultsFn(this, results, query);
  }

  /**
   * Highlight matching parts of text
   * Delegates to SearchEngine module
   */
  highlightMatch(text, query) {
    return highlightMatch(text, query);
  }

  /**
   * Hide search results dropdown
   * Delegates to SearchUI module
   */
  hideSearchResults() {
    return hideSearchResultsFn(this);
  }

  /**
   * Navigate to a specific option
   * Delegates to SearchUI module
   */
  navigateToOption(optionKey, categoryKey, type) {
    return navigateToOptionFn(this, optionKey, categoryKey, type);
  }
}
