/**
 * FileUploader Config Builder
 * Visual configuration interface for the FileUploader component
 * Allows users to explore all options and generate configuration code
 */

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

    // All available options with metadata
    this.optionDefinitions = this.getOptionDefinitions();

    // Current config values
    this.config = this.getDefaultConfig();

    // Current active preset
    this.currentPreset = "default";

    // FileUploader instances for preview (supports multiple)
    this.uploaderInstances = {};
    this.activeUploaderId = null;
    this.uploaderCounter = 0;

    // Slider configuration for size inputs
    this.sliderConfig = {
      minMB: 5,       // Minimum value in MB
      maxMB: 500,     // Maximum value in MB
      sliderStep: 50, // Slider step in MB
      buttonStep: 10  // +/- button step in MB
    };

    // Store panel width for persistence across re-renders
    this.optionsPanelWidth = null;

    this.init();
  }

  /**
   * Get all option definitions with metadata
   */
  getOptionDefinitions() {
    return {
      // URL Configuration
      urls: {
        title: "URL Configuration",
        icon: "link",
        options: {
          uploadUrl: {
            type: "text",
            default: "./upload.php",
            label: "Upload URL",
            hint: "Server endpoint for file uploads",
          },
          deleteUrl: {
            type: "text",
            default: "./delete.php",
            label: "Delete URL",
            hint: "Server endpoint for file deletion",
          },
          downloadAllUrl: {
            type: "text",
            default: "./download-all.php",
            label: "Download All URL",
            hint: "Server endpoint for downloading all files as ZIP",
          },
          cleanupZipUrl: {
            type: "text",
            default: "./cleanup-zip.php",
            label: "Cleanup ZIP URL",
            hint: "Server endpoint for cleaning up temporary ZIP files",
          },
          copyFileUrl: {
            type: "text",
            default: "./copy-file.php",
            label: "Copy File URL",
            hint: "Server endpoint for copying files between directories",
          },
          configUrl: {
            type: "text",
            default: "./get-config.php",
            label: "Config URL",
            hint: "Server endpoint to fetch configuration",
          },
          uploadDir: {
            type: "text",
            default: "",
            label: "Upload Directory",
            hint: "Target folder for uploads (e.g., 'profile_pictures')",
          },
        },
      },

      // File Size Limits
      sizeLimits: {
        title: "File Size Limits",
        icon: "size",
        options: {
          perFileMaxSize: {
            type: "size",
            default: 10 * 1024 * 1024,
            label: "Per File Max Size",
            hint: "Maximum size for a single file",
          },
          totalMaxSize: {
            type: "size",
            default: 100 * 1024 * 1024,
            label: "Total Max Size",
            hint: "Maximum total size for all files combined",
          },
          maxFiles: {
            type: "number",
            default: 10,
            min: 1,
            max: 100,
            label: "Max Files",
            hint: "Maximum number of files allowed",
          },
        },
      },

      // Per-Type Size Limits
      perTypeLimits: {
        title: "Per-Type Limits",
        icon: "layers",
        options: {
          perFileMaxSizePerType: {
            type: "typeSize",
            default: {},
            label: "Per File Max Size (by type)",
            hint: "Maximum size for a single file of each type",
            types: ["image", "video", "audio", "document", "archive"],
          },
          perTypeMaxTotalSize: {
            type: "typeSize",
            default: {},
            label: "Max Total Size (by type)",
            hint: "Maximum total size for all files of each type",
            types: ["image", "video", "audio", "document", "archive"],
          },
          perTypeMaxFileCount: {
            type: "typeCount",
            default: {},
            label: "Max File Count (by type)",
            hint: "Maximum number of files per type",
            types: ["image", "video", "audio", "document", "archive"],
          },
        },
      },

      // File Type Configuration
      fileTypes: {
        title: "Allowed File Types",
        icon: "file",
        options: {
          allowedExtensions: {
            type: "extensions",
            default: [],
            label: "Allowed Extensions",
            hint: "Leave empty to allow all types, or select specific extensions",
          },
        },
      },

      // MIME Type Validation (PHP only)
      mimeTypes: {
        title: "MIME Type Validation (PHP)",
        icon: "shield",
        options: {
          allowedMimeTypes: {
            type: "mimeTypes",
            default: [],
            label: "Allowed MIME Types",
            hint: "Server-side MIME type validation. Leave empty to allow all types, or select specific MIME types. This is used for PHP validation only.",
          },
        },
      },

      // Upload Behavior
      behavior: {
        title: "Upload Behavior",
        icon: "settings",
        options: {
          multiple: {
            type: "boolean",
            default: true,
            label: "Multiple Files",
            hint: "Allow selecting multiple files at once",
            affectsOptions: ["maxFiles"], // When false, maxFiles becomes 1
          },
          autoFetchConfig: {
            type: "boolean",
            default: true,
            label: "Auto Fetch Config",
            hint: "Automatically fetch configuration from server on init",
            affectsOptions: ["configUrl"],
          },
          confirmBeforeDelete: {
            type: "boolean",
            default: false,
            label: "Confirm Before Delete",
            hint: "Show confirmation dialog before deleting files",
          },
          preventDuplicates: {
            type: "boolean",
            default: false,
            label: "Prevent Duplicates",
            hint: "Prevent uploading the same file again",
            affectsOptions: ["duplicateCheckBy"],
          },
          duplicateCheckBy: {
            type: "select",
            default: "name-size",
            label: "Duplicate Check Method",
            hint: "How to detect duplicate files",
            options: [
              { value: "name", label: "File Name Only" },
              { value: "size", label: "File Size Only" },
              { value: "name-size", label: "Name + Size" },
              { value: "hash", label: "File Hash (slower)" },
            ],
            dependsOn: "preventDuplicates",
          },
          cleanupOnUnload: {
            type: "boolean",
            default: true,
            label: "Cleanup On Unload",
            hint: "Delete uploaded files from server when leaving the page",
          },
        },
      },

      // Limits Display
      limitsDisplay: {
        title: "Limits Display",
        icon: "eye",
        options: {
          showLimits: {
            type: "boolean",
            default: true,
            label: "Show Limits",
            hint: "Display file limits section",
            affectsOptions: ["showFileTypeCount", "showProgressBar", "showPerFileLimit", "showTypeGroupSize", "showTypeGroupCount", "defaultLimitsView", "allowLimitsViewToggle", "showLimitsToggle", "defaultLimitsVisible"],
          },
          showFileTypeCount: {
            type: "boolean",
            default: false,
            label: "Show File Type Count",
            hint: "Show count of files per type",
            dependsOn: "showLimits",
          },
          showProgressBar: {
            type: "boolean",
            default: false,
            label: "Show Progress Bar",
            hint: "Show progress bar for size/count limits",
            dependsOn: "showLimits",
          },
          showPerFileLimit: {
            type: "boolean",
            default: true,
            label: "Show Per File Limit",
            hint: "Show per file size limit in type groups",
            dependsOn: "showLimits",
          },
          showTypeGroupSize: {
            type: "boolean",
            default: true,
            label: "Show Type Group Size",
            hint: "Show total uploaded size per type group",
            dependsOn: "showLimits",
          },
          showTypeGroupCount: {
            type: "boolean",
            default: true,
            label: "Show Type Group Count",
            hint: "Show file count per type group",
            dependsOn: "showLimits",
          },
          defaultLimitsView: {
            type: "select",
            default: "concise",
            label: "Default Limits View",
            hint: "Default view mode for limits section",
            options: [
              { value: "concise", label: "Concise" },
              { value: "detailed", label: "Detailed" },
            ],
            dependsOn: "showLimits",
          },
          allowLimitsViewToggle: {
            type: "boolean",
            default: true,
            label: "Allow Limits View Toggle",
            hint: "Allow toggling between concise and detailed view",
            dependsOn: "showLimits",
          },
          showLimitsToggle: {
            type: "boolean",
            default: true,
            label: "Show Limits Toggle",
            hint: "Show button to hide/show limits section",
            dependsOn: "showLimits",
          },
          defaultLimitsVisible: {
            type: "boolean",
            default: true,
            label: "Default Limits Visible",
            hint: "Show limits section by default",
            dependsOn: "showLimits",
          },
        },
      },

      // Alert Notifications
      alerts: {
        title: "Alert Notifications",
        icon: "bell",
        options: {
          alertAnimation: {
            type: "select",
            default: "shake",
            label: "Alert Animation",
            hint: "Animation style for alert notifications",
            options: [
              { value: "fade", label: "Fade" },
              { value: "shake", label: "Shake" },
              { value: "bounce", label: "Bounce" },
              { value: "slideDown", label: "Slide Down" },
              { value: "pop", label: "Pop" },
              { value: "flip", label: "Flip" },
            ],
          },
          alertDuration: {
            type: "number",
            default: 5000,
            min: 0,
            max: 30000,
            step: 500,
            label: "Alert Duration (ms)",
            hint: "Auto-dismiss duration (0 = no auto-dismiss)",
          },
        },
      },

      // Buttons Configuration
      buttons: {
        title: "Buttons",
        icon: "button",
        options: {
          showDownloadAllButton: {
            type: "boolean",
            default: true,
            label: "Show Download All Button",
            hint: "Show internal download-all button",
            affectsOptions: ["downloadAllButtonText"],
          },
          downloadAllButtonText: {
            type: "text",
            default: "Download All",
            label: "Download All Button Text",
            hint: "Text for download-all button",
            dependsOn: "showDownloadAllButton",
          },
          showClearAllButton: {
            type: "boolean",
            default: true,
            label: "Show Clear All Button",
            hint: "Show internal clear-all button",
            affectsOptions: ["clearAllButtonText"],
          },
          clearAllButtonText: {
            type: "text",
            default: "Clear All",
            label: "Clear All Button Text",
            hint: "Text for clear-all button",
            dependsOn: "showClearAllButton",
          },
        },
      },

      // Media Capture
      mediaCapture: {
        title: "Media Capture",
        icon: "camera",
        options: {
          enableScreenCapture: {
            type: "boolean",
            default: true,
            label: "Enable Screen Capture",
            hint: "Enable screenshot capture button",
            affectsOptions: ["enableMicrophoneAudio", "enableSystemAudio"],
          },
          enableVideoRecording: {
            type: "boolean",
            default: true,
            label: "Enable Video Recording",
            hint: "Enable video recording button",
            affectsOptions: ["maxVideoRecordingDuration", "recordingCountdownDuration"],
          },
          enableAudioRecording: {
            type: "boolean",
            default: true,
            label: "Enable Audio Recording",
            hint: "Enable audio recording button",
            affectsOptions: ["maxAudioRecordingDuration"],
          },
          maxVideoRecordingDuration: {
            type: "number",
            default: 300,
            min: 10,
            max: 3600,
            label: "Max Video Duration (sec)",
            hint: "Maximum video recording duration in seconds",
            dependsOn: "enableVideoRecording",
          },
          maxAudioRecordingDuration: {
            type: "number",
            default: 300,
            min: 10,
            max: 3600,
            label: "Max Audio Duration (sec)",
            hint: "Maximum audio recording duration in seconds",
            dependsOn: "enableAudioRecording",
          },
          recordingCountdownDuration: {
            type: "number",
            default: 3,
            min: 0,
            max: 10,
            label: "Recording Countdown (sec)",
            hint: "Countdown duration before recording starts",
            dependsOn: "enableVideoRecording",
          },
          enableMicrophoneAudio: {
            type: "boolean",
            default: false,
            label: "Enable Microphone Audio",
            hint: "Record microphone audio during screen capture",
            dependsOn: "enableScreenCapture",
          },
          enableSystemAudio: {
            type: "boolean",
            default: false,
            label: "Enable System Audio",
            hint: "Record system audio during screen capture",
            dependsOn: "enableScreenCapture",
          },
        },
      },

      // Carousel Preview
      carousel: {
        title: "Carousel Preview",
        icon: "image",
        options: {
          enableCarouselPreview: {
            type: "boolean",
            default: true,
            label: "Enable Carousel Preview",
            hint: "Enable carousel preview modal on file click",
            affectsOptions: ["carouselAutoPreload", "carouselEnableManualLoading", "carouselMaxPreviewRows", "carouselMaxTextPreviewChars", "carouselVisibleTypes", "carouselPreviewableTypes"],
          },
          carouselAutoPreload: {
            type: "boolean",
            default: true,
            label: "Auto Preload Files",
            hint: "Automatically preload files in carousel",
            dependsOn: "enableCarouselPreview",
          },
          carouselEnableManualLoading: {
            type: "boolean",
            default: true,
            label: "Enable Manual Loading",
            hint: 'Show "Load All" button in carousel',
            dependsOn: "enableCarouselPreview",
          },
          carouselMaxPreviewRows: {
            type: "number",
            default: 100,
            min: 10,
            max: 1000,
            label: "Max Preview Rows",
            hint: "Max rows to show for CSV/Excel preview",
            dependsOn: "enableCarouselPreview",
          },
          carouselMaxTextPreviewChars: {
            type: "number",
            default: 50000,
            min: 1000,
            max: 500000,
            label: "Max Text Preview Chars",
            hint: "Max characters for text file preview",
            dependsOn: "enableCarouselPreview",
          },
          carouselVisibleTypes: {
            type: "multiSelect",
            default: [
              "image",
              "video",
              "audio",
              "pdf",
              "excel",
              "csv",
              "text",
            ],
            label: "Visible Types",
            hint: "File types visible in carousel",
            options: [
              "image",
              "video",
              "audio",
              "pdf",
              "excel",
              "csv",
              "text",
              "document",
              "archive",
            ],
            dependsOn: "enableCarouselPreview",
          },
          carouselPreviewableTypes: {
            type: "multiSelect",
            default: [
              "image",
              "video",
              "audio",
              "pdf",
              "csv",
              "excel",
              "text",
            ],
            label: "Previewable Types",
            hint: "File types that can be previewed",
            options: [
              "image",
              "video",
              "audio",
              "pdf",
              "excel",
              "csv",
              "text",
              "document",
              "archive",
            ],
            dependsOn: "enableCarouselPreview",
          },
        },
      },

      // Cross-Uploader
      crossUploader: {
        title: "Cross-Uploader Drag & Drop",
        icon: "move",
        options: {
          enableCrossUploaderDrag: {
            type: "boolean",
            default: true,
            label: "Enable Cross-Uploader Drag",
            hint: "Allow dragging files between uploaders",
          },
        },
      },
    };
  }

  /**
   * Get default config values
   */
  getDefaultConfig() {
    const config = {};
    for (const category of Object.values(this.optionDefinitions)) {
      for (const [key, def] of Object.entries(category.options)) {
        config[key] = structuredClone(def.default);
      }
    }
    return config;
  }

  /**
   * Initialize the config builder
   */
  init() {
    this.render();
    this.attachEvents();
    this.updateCodeOutput();
    this.updatePreview();
  }

  /**
   * Render the config builder UI
   */
  render() {
    // Get first category key for default active tab
    const categoryKeys = Object.keys(this.optionDefinitions);
    const firstCategoryKey = categoryKeys[0] || 'urls';

    this.element.innerHTML = `
      <div class="fu-config-builder">
        <div class="fu-config-builder-header">
          <a href="index.php" class="fu-config-builder-home-link" title="Back to Home">
            <svg viewBox="0 0 576 512" fill="currentColor"><path d="M575.8 255.5c0 18-15 32.1-32 32.1l-32 0 0 160c0 35.3-28.7 64-64 64l-320 0c-35.3 0-64-28.7-64-64l0-160-32 0c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/></svg>
          </a>
          <div class="fu-config-builder-header-text">
            <h1>FileUploader Configuration Builder</h1>
            <p>Explore all options and generate configuration code for your uploader</p>
          </div>
        </div>

        <div class="fu-config-builder-panels">
          <!-- Options Panel with Vertical Tabs -->
          <div class="fu-config-builder-panel fu-config-builder-options" id="options-panel">
            <div class="fu-config-builder-panel-header">
              <h2>Configuration Options</h2>
            </div>
            <div class="fu-config-builder-panel-content">
              <!-- Vertical Tabs -->
              <div class="fu-config-builder-vertical-tabs">
                ${this.renderVerticalTabs(firstCategoryKey)}
              </div>

              <!-- Options Content -->
              <div class="fu-config-builder-options-content">
                <!-- Presets -->
                <div class="fu-config-builder-presets">
                  <button class="fu-config-builder-preset ${this.currentPreset === "custom" ? "active" : ""}" data-preset="custom">Custom</button>
                  <button class="fu-config-builder-preset ${this.currentPreset === "default" ? "active" : ""}" data-preset="default">Default</button>
                  <button class="fu-config-builder-preset ${this.currentPreset === "minimal" ? "active" : ""}" data-preset="minimal">Minimal</button>
                  <button class="fu-config-builder-preset ${this.currentPreset === "images-only" ? "active" : ""}" data-preset="images-only">Images Only</button>
                  <button class="fu-config-builder-preset ${this.currentPreset === "documents" ? "active" : ""}" data-preset="documents">Documents</button>
                  <button class="fu-config-builder-preset ${this.currentPreset === "media" ? "active" : ""}" data-preset="media">Media</button>
                  <button class="fu-config-builder-preset ${this.currentPreset === "single-file" ? "active" : ""}" data-preset="single-file">Single File</button>
                </div>

                <!-- Category Panels -->
                ${this.renderCategoryPanels(firstCategoryKey)}
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
              </div>

              <!-- Preview Tab -->
              <div class="fu-config-builder-tab-content active" id="tab-preview">
                <!-- Uploader Selector -->
                <div class="fu-config-builder-uploader-selector">
                  <div class="fu-config-builder-uploader-list" id="uploader-list">
                    ${this.renderUploaderTabs()}
                  </div>
                  <button class="fu-config-builder-add-uploader" id="add-uploader" title="Add new uploader">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
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
            </div>
          </div>
        </div>
      </div>
    `;

    // Initialize current category
    this.currentCategory = firstCategoryKey;
  }

  /**
   * Render vertical tabs for categories
   */
  renderVerticalTabs(activeCategory) {
    let html = "";
    for (const [categoryKey, category] of Object.entries(this.optionDefinitions)) {
      const isActive = categoryKey === activeCategory;
      html += `
        <button class="fu-config-builder-vertical-tab ${isActive ? "active" : ""}" data-category="${categoryKey}" title="${category.title}">
          ${this.getCategoryIcon(category.icon)}
          <span class="fu-config-builder-vertical-tab-label">${this.getShortCategoryName(category.title)}</span>
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
      "Buttons": "Buttons",
      "Media Capture": "Media",
      "Carousel Preview": "Carousel",
      "Cross-Uploader Drag & Drop": "Cross"
    };
    return shortNames[title] || title.split(" ")[0];
  }

  /**
   * Render category panels for vertical tabs
   */
  renderCategoryPanels(activeCategory) {
    let html = "";
    for (const [categoryKey, category] of Object.entries(this.optionDefinitions)) {
      const isActive = categoryKey === activeCategory;
      const sliderConfigHtml = categoryKey === "sizeLimits" ? this.renderSliderConfig() : "";
      html += `
        <div class="fu-config-builder-category-panel ${isActive ? "active" : ""}" data-category-panel="${categoryKey}">
          <div class="fu-config-builder-category-panel-header">
            <h3>${category.title}</h3>
          </div>
          ${sliderConfigHtml}
          <div class="fu-config-builder-category-options">
            ${this.renderCategoryOptions(category.options)}
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
    return `
      <div class="fu-config-builder-slider-config">
        <div class="fu-config-builder-slider-config-item">
          <label>Min (MB)</label>
          <input type="number" id="slider-config-min" value="${this.sliderConfig.minMB}" min="1" max="100">
        </div>
        <div class="fu-config-builder-slider-config-item">
          <label>Max (MB)</label>
          <input type="number" id="slider-config-max" value="${this.sliderConfig.maxMB}" min="10" max="10000">
        </div>
        <div class="fu-config-builder-slider-config-item">
          <label>Slider Step</label>
          <input type="number" id="slider-config-step" value="${this.sliderConfig.sliderStep}" min="1" max="100">
        </div>
        <div class="fu-config-builder-slider-config-item">
          <label>+/- Step</label>
          <input type="number" id="slider-config-btn-step" value="${this.sliderConfig.buttonStep}" min="1" max="100">
        </div>
      </div>
    `;
  }

  /**
   * Render uploader tabs for preview selector
   */
  renderUploaderTabs() {
    // Initialize first uploader if none exist
    if (Object.keys(this.uploaderInstances).length === 0) {
      this.uploaderCounter = 1;
      this.activeUploaderId = "uploader-1";
      this.uploaderInstances["uploader-1"] = {
        name: "Uploader 1",
        config: { ...this.config },
        preset: this.currentPreset,
        instance: null
      };
    }

    let html = "";
    for (const [id, data] of Object.entries(this.uploaderInstances)) {
      const isActive = id === this.activeUploaderId;
      html += `
        <div class="fu-config-builder-uploader-tab ${isActive ? "active" : ""}" data-uploader-id="${id}">
          <span class="fu-config-builder-uploader-tab-name" data-uploader-id="${id}">${data.name}</span>
          <div class="fu-config-builder-uploader-tab-actions">
            <button class="fu-config-builder-uploader-tab-duplicate" data-uploader-id="${id}" title="Duplicate uploader">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
            </button>
            ${Object.keys(this.uploaderInstances).length > 1 ? `
              <button class="fu-config-builder-uploader-tab-close" data-uploader-id="${id}" title="Remove uploader">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            ` : ""}
          </div>
        </div>
      `;
    }
    return html;
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
            <span class="fu-config-builder-category-title">${category.title}</span>
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

    for (const [key, def] of Object.entries(options)) {
      html += this.renderOption(key, def);
    }

    return html;
  }

  /**
   * Check if an option's dependency is satisfied
   */
  isDependencySatisfied(def) {
    if (!def.dependsOn) return true;
    return this.config[def.dependsOn] === true;
  }

  /**
   * Render a single option
   */
  renderOption(key, def) {
    const isDisabled = !this.isDependencySatisfied(def);
    const dependencyClass = isDisabled ? "fu-config-builder-disabled" : "";
    const dependencyIndicator = def.dependsOn
      ? `<span class="fu-config-builder-depends-on" title="Requires: ${def.dependsOn}">
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
        content = this.renderTextInput(key, def, isDisabled, dependencyIndicator);
        break;
      case "number":
        content = this.renderNumberInput(key, def, isDisabled, dependencyIndicator);
        break;
      case "size":
        content = this.renderSizeInput(key, def, isDisabled, dependencyIndicator);
        break;
      case "select":
        content = this.renderSelect(key, def, isDisabled, dependencyIndicator);
        break;
      case "multiSelect":
        content = this.renderMultiSelect(key, def, isDisabled, dependencyIndicator);
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
      default:
        return "";
    }

    // Wrap with dependency container if has dependency
    if (def.dependsOn) {
      return `<div class="fu-config-builder-option-wrapper ${dependencyClass}" data-depends-on="${def.dependsOn}">${content}</div>`;
    }
    return content;
  }

  /**
   * Render toggle (boolean) option
   */
  renderToggle(key, def, isDisabled = false, dependencyIndicator = "") {
    const isActive = this.config[key] === true;
    const disabledClass = isDisabled ? "disabled" : "";
    return `
      <div class="fu-config-builder-toggle ${isActive ? "active" : ""} ${disabledClass}" data-option="${key}" data-type="boolean" ${isDisabled ? 'data-disabled="true"' : ""}>
        <div class="fu-config-builder-toggle-switch"></div>
        <div class="fu-config-builder-toggle-content">
          <div class="fu-config-builder-toggle-label">
            ${def.label}
            ${dependencyIndicator}
            <code>${key}</code>
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
          <code>${key}</code>
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
    if (key === 'maxFiles') {
      return this.renderCountSliderInput(key, def, isDisabled, dependencyIndicator);
    }

    return `
      <div class="fu-config-builder-group ${isDisabled ? "disabled" : ""}">
        <label class="fu-config-builder-label">
          ${def.label}
          ${dependencyIndicator}
          <code>${key}</code>
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
  renderCountSliderInput(key, def, isDisabled = false, dependencyIndicator = "") {
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
          <code>${key}</code>
        </label>
        <div class="fu-config-builder-count-slider" data-option="${key}" data-type="countSlider">
          <div class="fu-config-builder-slider-row">
            <button type="button" class="fu-config-builder-slider-btn" data-action="decrease" ${isDisabled ? "disabled" : ""}>
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
            <button type="button" class="fu-config-builder-slider-btn" data-action="increase" ${isDisabled ? "disabled" : ""}>
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
    const { value: displayValue, unit: displayUnit } = this.bytesToBestUnit(bytes);
    const { minMB, maxMB, sliderStep } = this.sliderConfig;

    // Convert to current slider unit for slider display
    const sliderValue = this.bytesToUnit(bytes, displayUnit);
    const minValue = this.bytesToUnit(minMB * 1024 * 1024, displayUnit);
    const maxValue = this.bytesToUnit(maxMB * 1024 * 1024, displayUnit);
    const stepValue = this.bytesToUnit(sliderStep * 1024 * 1024, displayUnit);

    const minusIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"/></svg>`;
    const plusIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/></svg>`;

    const units = ['bytes', 'KB', 'MB', 'GB'];
    const unitOptions = units.map(u =>
      `<option value="${u}" ${displayUnit === u ? 'selected' : ''}>${u}</option>`
    ).join('');

    return `
      <div class="fu-config-builder-group ${isDisabled ? "disabled" : ""}">
        <label class="fu-config-builder-label">
          ${def.label}
          ${dependencyIndicator}
          <code>${key}</code>
        </label>
        <div class="fu-config-builder-size-slider" data-option="${key}" data-type="sizeSlider" data-unit="${displayUnit}">
          <!-- Single row: - slider + input + unit dropdown -->
          <div class="fu-config-builder-slider-row">
            <button type="button" class="fu-config-builder-slider-btn" data-action="decrease" ${isDisabled ? "disabled" : ""}>
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
            <button type="button" class="fu-config-builder-slider-btn" data-action="increase" ${isDisabled ? "disabled" : ""}>
              ${plusIcon}
            </button>
            <input type="number"
                   class="fu-config-builder-slider-value-input"
                   data-value-for="${key}"
                   value="${displayValue}"
                   min="${minValue}"
                   max="${maxValue}"
                   ${isDisabled ? "disabled" : ""}>
            <select class="fu-config-builder-unit-dropdown" data-unit-for="${key}" ${isDisabled ? "disabled" : ""}>
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
      'bytes': 1,
      'KB': 1024,
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024
    };
    const multiplier = multipliers[unit] || 1;
    return Math.round((bytes || 0) / multiplier);
  }

  /**
   * Convert value in a unit to bytes
   */
  unitToBytes(value, unit) {
    const multipliers = {
      'bytes': 1,
      'KB': 1024,
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024
    };
    const multiplier = multipliers[unit] || 1;
    return (value || 0) * multiplier;
  }

  /**
   * Get best unit for displaying bytes
   */
  bytesToBestUnit(bytes) {
    bytes = bytes || 0;
    if (bytes >= 1024 * 1024 * 1024) {
      return { value: Math.round(bytes / (1024 * 1024 * 1024)), unit: 'GB' };
    } else if (bytes >= 1024 * 1024) {
      return { value: Math.round(bytes / (1024 * 1024)), unit: 'MB' };
    } else if (bytes >= 1024) {
      return { value: Math.round(bytes / 1024), unit: 'KB' };
    }
    return { value: bytes, unit: 'bytes' };
  }

  /**
   * Render select dropdown
   */
  renderSelect(key, def, isDisabled = false, dependencyIndicator = "") {
    const options = def.options
      .map(
        (opt) =>
          `<option value="${opt.value}" ${this.config[key] === opt.value ? "selected" : ""}>${opt.label}</option>`
      )
      .join("");

    return `
      <div class="fu-config-builder-group ${isDisabled ? "disabled" : ""}">
        <label class="fu-config-builder-label">
          ${def.label}
          ${dependencyIndicator}
          <code>${key}</code>
        </label>
        <select class="fu-config-builder-select" data-option="${key}" data-type="select" ${isDisabled ? "disabled" : ""}>
          ${options}
        </select>
        <div class="fu-config-builder-hint">${def.hint}</div>
      </div>
    `;
  }

  /**
   * Render multi-select tags
   */
  renderMultiSelect(key, def, isDisabled = false, dependencyIndicator = "") {
    const selected = this.config[key] || [];
    const tags = def.options
      .map(
        (opt) =>
          `<span class="fu-config-builder-tag ${selected.includes(opt) ? "selected" : ""} ${isDisabled ? "disabled" : ""}"
              data-value="${opt}">${opt}</span>`
      )
      .join("");

    return `
      <div class="fu-config-builder-group ${isDisabled ? "disabled" : ""}">
        <label class="fu-config-builder-label">
          ${def.label}
          ${dependencyIndicator}
          <code>${key}</code>
        </label>
        <div class="fu-config-builder-tags ${isDisabled ? "disabled" : ""}" data-option="${key}" data-type="multiSelect" ${isDisabled ? 'data-disabled="true"' : ""}>
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
      document: ["csv", "doc", "docx", "pdf", "ppt", "pptx", "rtf", "txt", "xls", "xlsx"],
      archive: ["7z", "bz2", "gz", "rar", "tar", "zip"],
    };

    const selected = this.config[key] || [];

    let html = `
      <div class="fu-config-builder-group">
        <label class="fu-config-builder-label">
          ${def.label}
          <code>${key}</code>
        </label>
        <div class="fu-config-builder-hint" style="margin-bottom: 12px;">${def.hint}</div>
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
            ${sortedExts.map((ext) => `<span class="fu-config-builder-ext ${selected.includes(ext) ? "selected" : ""}" data-ext="${ext}">.${ext}</span>`).join("")}
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
    const { minMB, maxMB, sliderStep } = this.sliderConfig;

    const minusIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"/></svg>`;
    const plusIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/></svg>`;

    const units = ['bytes', 'KB', 'MB', 'GB'];

    let html = `
      <div class="fu-config-builder-group">
        <label class="fu-config-builder-label">
          ${def.label}
          <code>${key}</code>
        </label>
        <div class="fu-config-builder-hint" style="margin-bottom: 12px;">${def.hint}</div>
        <div class="fu-config-builder-type-sliders" data-option="${key}" data-type="typeSizeSlider">
    `;

    for (const type of types) {
      const bytes = values[type] || 0;
      const { value: displayValue, unit: displayUnit } = bytes > 0 ? this.bytesToBestUnit(bytes) : { value: 0, unit: 'MB' };
      const maxValue = this.bytesToUnit(maxMB * 1024 * 1024, displayUnit);
      const stepValue = Math.max(1, this.bytesToUnit(sliderStep * 1024 * 1024, displayUnit));

      const unitOptions = units.map(u =>
        `<option value="${u}" ${displayUnit === u ? 'selected' : ''}>${u}</option>`
      ).join('');

      html += `
        <div class="fu-config-builder-type-slider-block" data-type-key="${type}" data-unit="${displayUnit}">
          <div class="fu-config-builder-type-slider-title">${type}</div>
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
                   value="${displayValue || ''}"
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
          <code>${key}</code>
        </label>
        <div class="fu-config-builder-hint" style="margin-bottom: 12px;">${def.hint}</div>
        <div class="fu-config-builder-type-sliders" data-option="${key}" data-type="typeCountSlider">
    `;

    for (const type of types) {
      const value = values[type] || 0;

      html += `
        <div class="fu-config-builder-type-slider-block" data-type-key="${type}">
          <div class="fu-config-builder-type-slider-title">${type}</div>
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
                   value="${value || ''}"
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
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
      "application/vnd.ms-excel": "XLS",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
      "application/vnd.ms-powerpoint": "PPT",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
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
          <code>${key}</code>
        </label>
        <div class="fu-config-builder-hint" style="margin-bottom: 12px;">${def.hint}</div>
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
            ${sortedMimes.map((mime) => `
              <span class="fu-config-builder-mime ${selected.includes(mime) ? "selected" : ""}"
                    data-mime="${mime}">
                <span class="fu-config-builder-mime-label">${mimeLabels[mime] || mime}</span>
                <span class="fu-config-builder-mime-value">${mime}</span>
              </span>
            `).join("")}
          </div>
        </div>
      `;
    }

    html += `</div></div>`;
    return html;
  }

  /**
   * Get category icon SVG - Using filled Font Awesome style icons
   */
  getCategoryIcon(icon) {
    const icons = {
      // URL Configuration - Link icon
      link: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>',
      // File Size Limits - Ruler/scale icon
      size: '<svg viewBox="0 0 512 512" fill="currentColor"><path d="M177.9 494.1c-18.7 18.7-49.1 18.7-67.9 0L17.9 402.1c-18.7-18.7-18.7-49.1 0-67.9l50.7-50.7 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 50.7-50.7c18.7-18.7 49.1-18.7 67.9 0l92.1 92.1c18.7 18.7 18.7 49.1 0 67.9L177.9 494.1z"/></svg>',
      // Per-Type Limits - Layers/stack icon
      layers: '<svg viewBox="0 0 576 512" fill="currentColor"><path d="M264.5 5.2c14.9-6.9 32.1-6.9 47 0l218.6 101c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L45.9 149.8C37.4 145.8 32 137.3 32 128s5.4-17.9 13.9-21.8L264.5 5.2zM476.9 209.6l53.2 24.6c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L45.9 277.8C37.4 273.8 32 265.3 32 256s5.4-17.9 13.9-21.8l53.2-24.6 152 70.2c23.4 10.8 50.4 10.8 73.8 0l152-70.2zm-152 198.2l152-70.2 53.2 24.6c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L45.9 405.8C37.4 401.8 32 393.3 32 384s5.4-17.9 13.9-21.8l53.2-24.6 152 70.2c23.4 10.8 50.4 10.8 73.8 0z"/></svg>',
      // Allowed File Types - File icon
      file: '<svg viewBox="0 0 384 512" fill="currentColor"><path d="M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 288c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128z"/></svg>',
      // Upload Behavior - Gear/cog icon
      settings: '<svg viewBox="0 0 512 512" fill="currentColor"><path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>',
      // Limits Display - Eye icon
      eye: '<svg viewBox="0 0 576 512" fill="currentColor"><path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"/></svg>',
      // Alert Notifications - Bell icon
      bell: '<svg viewBox="0 0 448 512" fill="currentColor"><path d="M224 0c-17.7 0-32 14.3-32 32l0 19.2C119 66 64 130.6 64 208l0 18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416l384 0c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8l0-18.8c0-77.4-55-142-128-156.8L256 32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3l-64 0-64 0c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z"/></svg>',
      // Buttons - Square with plus
      button: '<svg viewBox="0 0 448 512" fill="currentColor"><path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM200 344l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/></svg>',
      // Media Capture - Camera icon
      camera: '<svg viewBox="0 0 512 512" fill="currentColor"><path d="M149.1 64.8L138.7 96 64 96C28.7 96 0 124.7 0 160L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64l-74.7 0L362.9 64.8C356.4 45.2 338.1 32 317.4 32L194.6 32c-20.7 0-39 13.2-45.5 32.8zM256 192a96 96 0 1 1 0 192 96 96 0 1 1 0-192z"/></svg>',
      // Carousel Preview - Image/photo icon
      image: '<svg viewBox="0 0 512 512" fill="currentColor"><path d="M0 96C0 60.7 28.7 32 64 32l384 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6l96 0 32 0 208 0c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7l-120-176zM112 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"/></svg>',
      // MIME Type Validation - Shield with check
      shield: '<svg viewBox="0 0 512 512" fill="currentColor"><path d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0zm0 66.8l0 378.1C394 378 431.1 230.1 432 141.4L256 66.8z"/></svg>',
    };

    return `<span class="fu-config-builder-category-icon">${icons[icon] || icons.settings}</span>`;
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
    // Vertical tab switching for categories
    this.element.querySelectorAll(".fu-config-builder-vertical-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const categoryKey = tab.dataset.category;

        // Update tab active states
        this.element.querySelectorAll(".fu-config-builder-vertical-tab").forEach((t) => {
          t.classList.remove("active");
        });
        tab.classList.add("active");

        // Update panel visibility
        this.element.querySelectorAll(".fu-config-builder-category-panel").forEach((panel) => {
          panel.classList.remove("active");
        });
        const targetPanel = this.element.querySelector(`[data-category-panel="${categoryKey}"]`);
        if (targetPanel) {
          targetPanel.classList.add("active");
        }

        this.currentCategory = categoryKey;
      });
    });

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
    this.element.querySelectorAll(".fu-config-builder-category-header").forEach((header) => {
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
    this.element.querySelectorAll(".fu-config-builder-preset").forEach((btn) => {
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
    this.element.querySelectorAll(".fu-config-builder-uploader-tab").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        if (!e.target.closest(".fu-config-builder-uploader-tab-close") &&
            !e.target.closest(".fu-config-builder-uploader-tab-duplicate")) {
          this.selectUploader(tab.dataset.uploaderId);
        }
      });
    });

    // Uploader tab close buttons
    this.element.querySelectorAll(".fu-config-builder-uploader-tab-close").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.removeUploader(btn.dataset.uploaderId);
      });
    });

    // Uploader tab duplicate buttons
    this.element.querySelectorAll(".fu-config-builder-uploader-tab-duplicate").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.duplicateUploader(btn.dataset.uploaderId);
      });
    });

    // Uploader tab name editing (double-click)
    this.element.querySelectorAll(".fu-config-builder-uploader-tab-name").forEach((nameEl) => {
      nameEl.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        this.editUploaderName(nameEl.dataset.uploaderId);
      });
    });

    // Toggle options
    this.element.querySelectorAll('.fu-config-builder-toggle[data-type="boolean"]').forEach((toggle) => {
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
    this.element.querySelectorAll('.fu-config-builder-input[data-type="text"]').forEach((input) => {
      input.addEventListener("input", () => {
        this.config[input.dataset.option] = input.value;
        this.onConfigChange();
      });
    });

    // Number inputs
    this.element.querySelectorAll('.fu-config-builder-input[data-type="number"]').forEach((input) => {
      input.addEventListener("input", () => {
        this.config[input.dataset.option] = parseInt(input.value) || 0;
        this.onConfigChange();
      });
    });

    // Slider configuration inputs
    const sliderConfigMin = this.element.querySelector("#slider-config-min");
    const sliderConfigMax = this.element.querySelector("#slider-config-max");
    const sliderConfigStep = this.element.querySelector("#slider-config-step");
    const sliderConfigBtnStep = this.element.querySelector("#slider-config-btn-step");

    if (sliderConfigMin) {
      sliderConfigMin.addEventListener("input", () => {
        this.sliderConfig.minMB = parseInt(sliderConfigMin.value) || 5;
        this.updateAllSizeSliders();
      });
    }
    if (sliderConfigMax) {
      sliderConfigMax.addEventListener("input", () => {
        this.sliderConfig.maxMB = parseInt(sliderConfigMax.value) || 500;
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
        this.sliderConfig.buttonStep = parseInt(sliderConfigBtnStep.value) || 10;
      });
    }

    // Size slider inputs with unit dropdown
    this.element.querySelectorAll('.fu-config-builder-size-slider[data-type="sizeSlider"]').forEach((container) => {
      const optionKey = container.dataset.option;
      const slider = container.querySelector(".fu-config-builder-slider-input");
      const valueInput = container.querySelector(".fu-config-builder-slider-value-input");
      const unitDropdown = container.querySelector(".fu-config-builder-unit-dropdown");
      const decreaseBtn = container.querySelector('[data-action="decrease"]');
      const increaseBtn = container.querySelector('[data-action="increase"]');
      const labels = container.querySelectorAll(".fu-config-builder-slider-label");

      if (!slider || !valueInput || !decreaseBtn || !increaseBtn || !unitDropdown) {
        console.warn("Size slider elements not found for:", optionKey);
        return;
      }

      const getCurrentUnit = () => unitDropdown.value;

      const updateSliderRange = (unit) => {
        const { minMB, maxMB, sliderStep } = this.sliderConfig;
        const minValue = this.bytesToUnit(minMB * 1024 * 1024, unit);
        const maxValue = this.bytesToUnit(maxMB * 1024 * 1024, unit);
        const stepValue = this.bytesToUnit(sliderStep * 1024 * 1024, unit);

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
        const { minMB, maxMB } = this.sliderConfig;
        const minValue = this.bytesToUnit(minMB * 1024 * 1024, unit);
        const maxValue = this.bytesToUnit(maxMB * 1024 * 1024, unit);
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
        const buttonStep = this.bytesToUnit(this.sliderConfig.buttonStep * 1024 * 1024, unit);
        const currentValue = parseInt(valueInput.value) || 0;
        updateValue(currentValue - buttonStep, unit);
      });

      // Increase button
      increaseBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const unit = getCurrentUnit();
        const buttonStep = this.bytesToUnit(this.sliderConfig.buttonStep * 1024 * 1024, unit);
        const currentValue = parseInt(valueInput.value) || 0;
        updateValue(currentValue + buttonStep, unit);
      });
    });

    // Count slider inputs (for maxFiles)
    this.element.querySelectorAll('.fu-config-builder-count-slider[data-type="countSlider"]').forEach((container) => {
      const optionKey = container.dataset.option;
      const slider = container.querySelector(".fu-config-builder-slider-input");
      const valueInput = container.querySelector(".fu-config-builder-slider-value-input");
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
    this.element.querySelectorAll('.fu-config-builder-select[data-type="select"]').forEach((select) => {
      select.addEventListener("change", () => {
        this.config[select.dataset.option] = select.value;
        this.onConfigChange();
      });
    });

    // Multi-select tags
    this.element.querySelectorAll('.fu-config-builder-tags[data-type="multiSelect"]').forEach((container) => {
      container.querySelectorAll(".fu-config-builder-tag").forEach((tag) => {
        tag.addEventListener("click", () => {
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
    this.element.querySelectorAll('[data-type="extensions"]').forEach((container) => {
      // Individual extension toggle
      container.querySelectorAll(".fu-config-builder-ext").forEach((ext) => {
        ext.addEventListener("click", () => {
          ext.classList.toggle("selected");
          this.updateExtensionsFromUI(container);
        });
      });

      // Group toggle
      container.querySelectorAll(".fu-config-builder-ext-group-toggle").forEach((toggle) => {
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
    this.element.querySelectorAll('[data-type="mimeTypes"]').forEach((container) => {
      // Individual MIME type toggle
      container.querySelectorAll(".fu-config-builder-mime").forEach((mime) => {
        mime.addEventListener("click", () => {
          mime.classList.toggle("selected");
          this.updateMimeTypesFromUI(container);
        });
      });

      // Group toggle
      container.querySelectorAll(".fu-config-builder-mime-group-toggle").forEach((toggle) => {
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
    this.element.querySelectorAll('[data-type="typeSizeSlider"]').forEach((container) => {
      const optionKey = container.dataset.option;

      container.querySelectorAll(".fu-config-builder-type-slider-block").forEach((block) => {
        const typeKey = block.dataset.typeKey;
        const slider = block.querySelector(".fu-config-builder-slider-input");
        const valueInput = block.querySelector(".fu-config-builder-slider-value-input");
        const unitDropdown = block.querySelector(".fu-config-builder-unit-dropdown");
        const decreaseBtn = block.querySelector('[data-action="decrease"]');
        const increaseBtn = block.querySelector('[data-action="increase"]');
        const labels = block.querySelectorAll(".fu-config-builder-slider-label");

        if (!slider || !valueInput || !decreaseBtn || !increaseBtn || !unitDropdown) return;

        const getCurrentUnit = () => unitDropdown.value;

        const updateSliderRange = (unit) => {
          const { maxMB, sliderStep } = this.sliderConfig;
          const maxValue = this.bytesToUnit(maxMB * 1024 * 1024, unit);
          const stepValue = Math.max(1, this.bytesToUnit(sliderStep * 1024 * 1024, unit));

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
          const { maxMB } = this.sliderConfig;
          const maxValue = this.bytesToUnit(maxMB * 1024 * 1024, unit);
          value = Math.max(0, Math.min(maxValue, value));

          // Update UI
          slider.value = value;
          valueInput.value = value || '';

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
          const newValue = currentBytes > 0 ? this.bytesToUnit(currentBytes, newUnit) : 0;

          updateSliderRange(newUnit);
          slider.value = newValue;
          valueInput.value = newValue || '';
          block.dataset.unit = newUnit;
        });

        // Slider change
        slider.addEventListener("input", () => {
          updateTypeValue(parseInt(slider.value) || 0, getCurrentUnit());
        });

        // Direct value input
        valueInput.addEventListener("input", () => {
          updateTypeValue(parseInt(valueInput.value) || 0, getCurrentUnit());
        });

        // Decrease button
        decreaseBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const unit = getCurrentUnit();
          const buttonStep = this.bytesToUnit(this.sliderConfig.buttonStep * 1024 * 1024, unit);
          const currentValue = parseInt(valueInput.value) || 0;
          updateTypeValue(currentValue - buttonStep, unit);
        });

        // Increase button
        increaseBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const unit = getCurrentUnit();
          const buttonStep = this.bytesToUnit(this.sliderConfig.buttonStep * 1024 * 1024, unit);
          const currentValue = parseInt(valueInput.value) || 0;
          updateTypeValue(currentValue + buttonStep, unit);
        });
      });
    });

    // Type count slider inputs
    this.element.querySelectorAll('[data-type="typeCountSlider"]').forEach((container) => {
      const optionKey = container.dataset.option;

      container.querySelectorAll(".fu-config-builder-type-slider-block").forEach((block) => {
        const typeKey = block.dataset.typeKey;
        const slider = block.querySelector(".fu-config-builder-slider-input");
        const valueInput = block.querySelector(".fu-config-builder-slider-value-input");
        const decreaseBtn = block.querySelector('[data-action="decrease"]');
        const increaseBtn = block.querySelector('[data-action="increase"]');

        if (!slider || !valueInput || !decreaseBtn || !increaseBtn) return;

        const updateTypeValue = (value) => {
          value = Math.max(0, Math.min(100, value));

          slider.value = value;
          valueInput.value = value || '';

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
    const { minMB, maxMB, sliderStep } = this.sliderConfig;

    this.element.querySelectorAll('.fu-config-builder-size-slider[data-type="sizeSlider"]').forEach((container) => {
      const slider = container.querySelector(".fu-config-builder-slider-input");
      const valueInput = container.querySelector(".fu-config-builder-slider-value-input");
      const unitDropdown = container.querySelector(".fu-config-builder-unit-dropdown");
      const labels = container.querySelectorAll(".fu-config-builder-slider-label");

      // Get current unit from dropdown or fallback to MB
      const currentUnit = unitDropdown?.value || 'MB';
      const minValue = this.bytesToUnit(minMB * 1024 * 1024, currentUnit);
      const maxValue = this.bytesToUnit(maxMB * 1024 * 1024, currentUnit);
      const stepValue = Math.max(1, this.bytesToUnit(sliderStep * 1024 * 1024, currentUnit));

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
        valueInput.value = Math.max(minValue, Math.min(maxValue, currentValue));
      }

      // Update range labels
      if (labels.length >= 2) {
        labels[0].textContent = `${minValue} ${currentUnit}`;
        labels[1].textContent = `${maxValue} ${currentUnit}`;
      }
    });
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
    if (this.activeUploaderId && this.uploaderInstances[this.activeUploaderId]) {
      this.uploaderInstances[this.activeUploaderId].preset = preset;
    }

    // Re-render and update
    this.render();
    this.attachEvents();
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
          wrapper.querySelectorAll(".fu-config-builder-toggle").forEach((el) => {
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
          wrapper.querySelectorAll(".fu-config-builder-toggle").forEach((el) => {
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
      this.element.querySelectorAll(".fu-config-builder-preset").forEach((btn) => {
        btn.classList.remove("active");
        if (btn.dataset.preset === "custom") {
          btn.classList.add("active");
        }
      });
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

    this.updateCodeOutput();

    // Debounce preview updates to avoid too many re-renders
    if (this._previewTimeout) {
      clearTimeout(this._previewTimeout);
    }

    this._previewTimeout = setTimeout(() => {
      this.updatePreview();
      this.showPreviewFeedback();
    }, 300);

    if (this.options.onConfigChange) {
      this.options.onConfigChange(this.config);
    }
  }

  /**
   * Show visual feedback that preview was updated
   */
  showPreviewFeedback() {
    const previewArea = this.element.querySelector(".fu-config-builder-preview-area");
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
    const existingToast = this.element.querySelector(".fu-config-builder-toast");
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
      animation: "toastSlideIn 0.3s ease"
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
    if (this.activeUploaderId && this.uploaderInstances[this.activeUploaderId]) {
      this.uploaderInstances[this.activeUploaderId].config = { ...this.config };
    }

    const jsCardsEl = this.element.querySelector("#js-code-cards");
    const phpCardsEl = this.element.querySelector("#php-code-cards");

    if (jsCardsEl) {
      jsCardsEl.innerHTML = this.renderCodeCards("js");
      this.attachCodeCardEvents(jsCardsEl, "js");
    }

    if (phpCardsEl) {
      phpCardsEl.innerHTML = this.renderCodeCards("php");
      this.attachCodeCardEvents(phpCardsEl, "php");
    }
  }

  /**
   * Render code cards for all uploaders
   */
  renderCodeCards(type) {
    const uploaders = Object.entries(this.uploaderInstances);
    let html = "";

    uploaders.forEach(([id, data]) => {
      const isActive = id === this.activeUploaderId;
      const code = type === "js"
        ? this.generateSingleUploaderJsCode(id, data)
        : this.generateSingleUploaderPhpCode(id, data);

      const highlightedCode = type === "js"
        ? this.highlightJsCode(code)
        : this.highlightPhpCode(code);

      // Generate filename from uploader name
      const filename = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || `uploader`;

      html += `
        <div class="fu-config-builder-code-card ${isActive ? "active" : ""}" data-uploader-id="${id}">
          <div class="fu-config-builder-code">
            <div class="fu-config-builder-code-header">
              <span class="fu-config-builder-code-title">${data.name}${isActive ? ' <span class="fu-config-builder-code-badge">Editing</span>' : ''}</span>
              <div class="fu-config-builder-code-actions">
                <button class="fu-config-builder-code-btn" data-action="copy" data-uploader-id="${id}" data-type="${type}">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                  Copy
                </button>
                <button class="fu-config-builder-code-btn" data-action="download" data-uploader-id="${id}" data-type="${type}" data-filename="${filename}">
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
    });

    return html;
  }

  /**
   * Attach event handlers to code card buttons
   */
  attachCodeCardEvents(container, type) {
    container.querySelectorAll('[data-action="copy"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        const uploaderId = btn.dataset.uploaderId;
        const uploaderData = this.uploaderInstances[uploaderId];
        const code = type === "js"
          ? this.generateSingleUploaderJsCode(uploaderId, uploaderData)
          : this.generateSingleUploaderPhpCode(uploaderId, uploaderData);
        this.copyToClipboard(code, btn);
      });
    });

    container.querySelectorAll('[data-action="download"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        const uploaderId = btn.dataset.uploaderId;
        const uploaderData = this.uploaderInstances[uploaderId];
        const filename = btn.dataset.filename;
        const code = type === "js"
          ? this.generateSingleUploaderJsCode(uploaderId, uploaderData)
          : this.generateSingleUploaderPhpCode(uploaderId, uploaderData);
        const ext = type === "js" ? "js" : "php";
        const mimeType = type === "js" ? "text/javascript" : "text/php";
        this.downloadFile(code, `${filename}-config.${ext}`, mimeType);
      });
    });
  }

  /**
   * Generate JS code for a single uploader
   */
  generateSingleUploaderJsCode(id, data) {
    const changedConfig = this.getChangedConfig(data.config);

    // Generate variable name from uploader name
    const varName = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "") || "uploader";

    let code = `const ${varName} = new FileUploader('#${varName}', {\n`;

    const entries = Object.entries(changedConfig);
    entries.forEach(([key, value], index) => {
      const comma = index < entries.length - 1 ? "," : "";
      code += `  ${key}: ${JSON.stringify(value, null, 2).replace(/\n/g, "\n  ")}${comma}\n`;
    });

    code += `});`;

    return code;
  }

  /**
   * Generate PHP code for a single uploader
   */
  generateSingleUploaderPhpCode(id, data) {
    const changedConfig = this.getChangedConfig(data.config, true); // server-only

    let code = `<?php\n/**\n * ${data.name} - Server Configuration\n * Generated by Config Builder\n */\n\nreturn [\n`;

    const entries = Object.entries(changedConfig);
    entries.forEach(([key, value], index) => {
      const comma = index < entries.length - 1 ? "," : "";
      const phpValue = this.jsValueToPhp(value);
      code += `    '${key}' => ${phpValue}${comma}\n`;
    });

    code += `];\n`;

    return code;
  }

  /**
   * Highlight JS code
   */
  highlightJsCode(code) {
    // Use placeholders to prevent nested replacements
    const stringPlaceholders = [];
    const commentPlaceholders = [];

    // Extract strings first (to protect them from other replacements)
    let result = code.replace(/"([^"\\]|\\.)*"/g, (match) => {
      const index = stringPlaceholders.length;
      stringPlaceholders.push(`<span class="code-string">${match}</span>`);
      return `__STRING_${index}__`;
    });

    // Extract comments
    result = result.replace(/(\/\/.*$)/gm, (match) => {
      const index = commentPlaceholders.length;
      commentPlaceholders.push(`<span class="code-comment">${match}</span>`);
      return `__COMMENT_${index}__`;
    });

    // Now apply other highlighting
    result = result
      // Keywords
      .replace(/\b(const|let|var|new|true|false|null)\b/g, '<span class="code-keyword">$1</span>')
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
    // Use placeholders to prevent nested replacements
    const stringPlaceholders = [];
    const commentPlaceholders = [];

    // Extract strings first (single quotes for PHP)
    let result = code.replace(/'([^'\\]|\\.)*'/g, (match) => {
      const index = stringPlaceholders.length;
      stringPlaceholders.push(`<span class="code-string">${match}</span>`);
      return `__STRING_${index}__`;
    });

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

    // Now apply other highlighting
    result = result
      // PHP tags
      .replace(/(&lt;\?php|<\?php)/g, '<span class="code-keyword">&lt;?php</span>')
      // Keywords
      .replace(/\b(return|true|false|null)\b/g, '<span class="code-keyword">$1</span>')
      // Numbers
      .replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>');

    // Restore strings (and handle array keys within them)
    stringPlaceholders.forEach((str, i) => {
      // Check if this string is an array key (followed by =>)
      const placeholder = `__STRING_${i}__`;
      if (result.includes(placeholder + ' =>') || result.includes(placeholder + '=>')) {
        // It's an array key, use property styling
        const innerMatch = str.match(/<span class="code-string">'([^']+)'<\/span>/);
        if (innerMatch) {
          result = result.replace(placeholder, `<span class="code-property">'${innerMatch[1]}'</span>`);
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
      "allowedExtensions",
      "allowedMimeTypes",
      "perFileMaxSize",
      "perFileMaxSizeDisplay",
      "perFileMaxSizePerType",
      "perFileMaxSizePerTypeDisplay",
      "perTypeMaxTotalSize",
      "perTypeMaxTotalSizeDisplay",
      "perTypeMaxFileCount",
      "totalMaxSize",
      "totalMaxSizeDisplay",
      "maxFiles"
    ];

    for (const [key, value] of Object.entries(config)) {
      if (serverOnly && !serverRelevantKeys.includes(key)) continue;

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
   * Generate the configuration code for ALL uploaders
   */
  generateCode() {
    // Make sure active uploader's config is saved
    if (this.activeUploaderId && this.uploaderInstances[this.activeUploaderId]) {
      this.uploaderInstances[this.activeUploaderId].config = { ...this.config };
    }

    const uploaders = Object.entries(this.uploaderInstances);
    let code = "";

    uploaders.forEach(([id, data], uploaderIndex) => {
      const isActive = id === this.activeUploaderId;
      const changedConfig = this.getChangedConfig(data.config);

      // Add comment header for each uploader
      const marker = isActive ? " ← Currently Editing" : "";
      code += `// ${data.name}${marker}\n`;

      // Generate variable name from uploader name
      const varName = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "") || `uploader${uploaderIndex + 1}`;

      code += `const ${varName} = new FileUploader('#${varName}', {\n`;

      const entries = Object.entries(changedConfig);
      entries.forEach(([key, value], index) => {
        const comma = index < entries.length - 1 ? "," : "";
        code += `  ${key}: ${JSON.stringify(value, null, 2).replace(/\n/g, "\n  ")}${comma}\n`;
      });

      code += `});\n`;

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
      .replace(
        /(\/\/.*$)/gm,
        '<span class="code-comment">$1</span>'
      )
      // Keywords
      .replace(
        /\b(const|let|var|new|true|false|null)\b/g,
        '<span class="code-keyword">$1</span>'
      )
      // Strings
      .replace(
        /"([^"\\]|\\.)*"/g,
        '<span class="code-string">"$&"</span>'
      )
      .replace(/<span class="code-string">"(".*?")"<\/span>/g, '<span class="code-string">$1</span>')
      // Numbers
      .replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>')
      // Property names
      .replace(
        /(\w+):/g,
        '<span class="code-property">$1</span>:'
      );

    return code;
  }

  /**
   * Generate PHP configuration code for ALL uploaders
   */
  generatePhpCode() {
    // Make sure active uploader's config is saved
    if (this.activeUploaderId && this.uploaderInstances[this.activeUploaderId]) {
      this.uploaderInstances[this.activeUploaderId].config = { ...this.config };
    }

    const uploaders = Object.entries(this.uploaderInstances);

    let code = `<?php\n/**\n * FileUploader Server Configuration\n * Generated by Config Builder\n */\n\nreturn [\n`;

    uploaders.forEach(([id, data], uploaderIndex) => {
      const isActive = id === this.activeUploaderId;
      const changedConfig = this.getChangedConfig(data.config, true); // server-only

      // Generate key name from uploader name
      const keyName = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "") || `uploader${uploaderIndex + 1}`;

      // Add comment for each uploader
      const marker = isActive ? " ← Currently Editing" : "";
      code += `    // ${data.name}${marker}\n`;
      code += `    '${keyName}' => [\n`;

      const entries = Object.entries(changedConfig);
      entries.forEach(([key, value], index) => {
        const comma = index < entries.length - 1 ? "," : "";
        const phpValue = this.jsValueToPhp(value);
        code += `        '${key}' => ${phpValue}${comma}\n`;
      });

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
   * Convert JavaScript value to PHP syntax
   */
  jsValueToPhp(value) {
    if (value === null) return "null";
    if (value === true) return "true";
    if (value === false) return "false";
    if (typeof value === "number") return String(value);
    if (typeof value === "string") return `'${value.replace(/'/g, "\\'")}'`;

    if (Array.isArray(value)) {
      if (value.length === 0) return "[]";
      const items = value.map(v => this.jsValueToPhp(v)).join(", ");
      return `[${items}]`;
    }

    if (typeof value === "object") {
      const entries = Object.entries(value);
      if (entries.length === 0) return "[]";
      const items = entries.map(([k, v]) => `'${k}' => ${this.jsValueToPhp(v)}`).join(",\n        ");
      return `[\n        ${items}\n    ]`;
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
      .replace(/(&lt;\?php|<\?php)/g, '<span class="code-keyword">&lt;?php</span>')
      // Block comments
      .replace(/(\/\*\*[\s\S]*?\*\/)/g, '<span class="code-comment">$1</span>')
      // Single line comments
      .replace(/(\/\/.*$)/gm, '<span class="code-comment">$1</span>')
      // Keywords
      .replace(/\b(return|true|false|null)\b/g, '<span class="code-keyword">$1</span>')
      // Numbers
      .replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>')
      // Strings (single quotes)
      .replace(/'([^'\\]|\\.)*'/g, '<span class="code-string">$&</span>')
      // Array keys
      .replace(/'(\w+)'\s*=>/g, '<span class="code-property">\'$1\'</span> =>');

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
    if (!this.activeUploaderId || !this.uploaderInstances[this.activeUploaderId]) {
      // Initialize if needed
      if (Object.keys(this.uploaderInstances).length === 0) {
        this.uploaderCounter = 1;
        this.activeUploaderId = "uploader-1";
        this.uploaderInstances["uploader-1"] = {
          name: "Uploader 1",
          config: { ...this.config },
          preset: this.currentPreset,
          instance: null,
          containerId: null
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
      // Destroy all existing instances
      for (const [id, data] of Object.entries(this.uploaderInstances)) {
        if (data.instance && typeof data.instance.destroy === "function") {
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
        // Destroy existing active instance
        if (activeData.instance && typeof activeData.instance.destroy === "function") {
          activeData.instance.destroy();
        }
        activeData.instance = null;

        // Find and clear the active container
        const existingWrapper = previewEl.querySelector(`[data-uploader-wrapper="${this.activeUploaderId}"]`);
        if (existingWrapper) {
          const uploaderContainer = existingWrapper.querySelector(".fu-config-builder-uploader-container");
          if (uploaderContainer) {
            uploaderContainer.innerHTML = "";
            const containerId = `preview-${this.activeUploaderId}-${Date.now()}`;
            const container = document.createElement("div");
            container.id = containerId;
            uploaderContainer.appendChild(container);

            // Create uploader
            if (window.FileUploader) {
              const previewConfig = {
                ...activeData.config,
                autoFetchConfig: false,
                cleanupOnUnload: false,
              };
              activeData.instance = new window.FileUploader(`#${containerId}`, previewConfig);
              activeData.containerId = containerId;
            }
          }
        }
      }
    }
  }

  /**
   * Create a single uploader preview with header
   */
  createUploaderPreview(previewEl, id, data) {
    const isActive = id === this.activeUploaderId;
    const containerId = `preview-${id}-${Date.now()}`;

    const wrapper = document.createElement("div");
    wrapper.className = `fu-config-builder-uploader-wrapper ${isActive ? "active" : ""}`;
    wrapper.dataset.uploaderWrapper = id;

    wrapper.innerHTML = `
      <div class="fu-config-builder-uploader-header">
        <span class="fu-config-builder-uploader-label">${data.name}</span>
        ${isActive ? '<span class="fu-config-builder-uploader-badge">Editing</span>' : '<button class="fu-config-builder-uploader-edit-btn" data-uploader-id="' + id + '">Edit This</button>'}
      </div>
      <div class="fu-config-builder-uploader-container">
        <div id="${containerId}"></div>
      </div>
    `;

    previewEl.appendChild(wrapper);

    // Create uploader instance
    if (window.FileUploader) {
      const previewConfig = {
        ...data.config,
        autoFetchConfig: false,
        cleanupOnUnload: false,
      };
      data.instance = new window.FileUploader(`#${containerId}`, previewConfig);
      data.containerId = containerId;
    }

    // Add click handler for "Edit This" button
    const editBtn = wrapper.querySelector(".fu-config-builder-uploader-edit-btn");
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        this.selectUploader(id);
      });
    }
  }

  /**
   * Refresh all uploader previews (used after add/remove)
   */
  refreshAllPreviews() {
    this.updatePreview(true);
  }

  /**
   * Add a new uploader to the preview
   */
  addUploader() {
    // Save current config and preset first
    if (this.activeUploaderId && this.uploaderInstances[this.activeUploaderId]) {
      this.uploaderInstances[this.activeUploaderId].config = { ...this.config };
      this.uploaderInstances[this.activeUploaderId].preset = this.currentPreset;
    }

    this.uploaderCounter++;
    const newId = `uploader-${this.uploaderCounter}`;

    this.uploaderInstances[newId] = {
      name: `Uploader ${this.uploaderCounter}`,
      config: { ...this.getDefaultConfig() },
      preset: "default",
      instance: null,
      containerId: null
    };

    // Switch to the new uploader
    this.activeUploaderId = newId;
    this.config = { ...this.uploaderInstances[newId].config };
    this.currentPreset = "default";

    // Update UI
    this.updateUploaderTabsUI();
    this.render();
    this.attachEvents();
    this.refreshAllPreviews(); // Refresh all to show the new uploader
    this.updateCodeOutput();
  }

  /**
   * Duplicate an existing uploader with its config
   */
  duplicateUploader(uploaderId) {
    if (!this.uploaderInstances[uploaderId]) return;

    // Save current config and preset first
    if (this.activeUploaderId && this.uploaderInstances[this.activeUploaderId]) {
      this.uploaderInstances[this.activeUploaderId].config = { ...this.config };
      this.uploaderInstances[this.activeUploaderId].preset = this.currentPreset;
    }

    // Get the source uploader's config and preset
    const sourceData = this.uploaderInstances[uploaderId];

    this.uploaderCounter++;
    const newId = `uploader-${this.uploaderCounter}`;

    // Deep copy the config to avoid reference issues
    const copiedConfig = JSON.parse(JSON.stringify(sourceData.config));

    this.uploaderInstances[newId] = {
      name: `${sourceData.name} (Copy)`,
      config: copiedConfig,
      preset: sourceData.preset || null,
      instance: null,
      containerId: null
    };

    // Switch to the new uploader
    this.activeUploaderId = newId;
    this.config = { ...this.uploaderInstances[newId].config };
    this.currentPreset = this.uploaderInstances[newId].preset;

    // Update UI
    this.updateUploaderTabsUI();
    this.render();
    this.attachEvents();
    this.refreshAllPreviews(); // Refresh all to show the new uploader
    this.updateCodeOutput();
  }

  /**
   * Select an uploader and load its config
   */
  selectUploader(uploaderId) {
    if (!this.uploaderInstances[uploaderId]) return;
    if (this.activeUploaderId === uploaderId) return; // Already selected

    // Save current config and preset to the current uploader before switching
    if (this.activeUploaderId && this.uploaderInstances[this.activeUploaderId]) {
      this.uploaderInstances[this.activeUploaderId].config = { ...this.config };
      this.uploaderInstances[this.activeUploaderId].preset = this.currentPreset;
    }

    // Switch to new uploader
    this.activeUploaderId = uploaderId;
    this.config = { ...this.uploaderInstances[uploaderId].config };
    this.currentPreset = this.uploaderInstances[uploaderId].preset || null;

    // Update the uploader tab list UI
    this.updateUploaderTabsUI();

    // Re-render options to reflect new config
    this.render();
    this.attachEvents();
    this.refreshAllPreviews(); // Refresh all to update active states
    this.updateCodeOutput();
  }

  /**
   * Remove an uploader from the preview
   */
  removeUploader(uploaderId) {
    if (Object.keys(this.uploaderInstances).length <= 1) return;

    // Destroy the instance
    const data = this.uploaderInstances[uploaderId];
    if (data && data.instance) {
      if (typeof data.instance.destroy === "function") {
        data.instance.destroy();
      }
    }

    delete this.uploaderInstances[uploaderId];

    // If we removed the active uploader, switch to another one
    if (this.activeUploaderId === uploaderId) {
      const remainingIds = Object.keys(this.uploaderInstances);
      this.activeUploaderId = remainingIds[0];
      this.config = { ...this.uploaderInstances[this.activeUploaderId].config };
      this.currentPreset = this.uploaderInstances[this.activeUploaderId].preset || null;
    }

    // Update UI
    this.updateUploaderTabsUI();
    this.render();
    this.attachEvents();
    this.refreshAllPreviews();
    this.updateCodeOutput();
  }

  /**
   * Check if an uploader name is already in use
   */
  isNameDuplicate(name, excludeUploaderId = null) {
    const normalizedName = name.trim().toLowerCase();
    for (const [id, data] of Object.entries(this.uploaderInstances)) {
      if (id !== excludeUploaderId && data.name.trim().toLowerCase() === normalizedName) {
        return true;
      }
    }
    return false;
  }

  /**
   * Edit uploader name
   */
  editUploaderName(uploaderId) {
    const nameEl = this.element.querySelector(`.fu-config-builder-uploader-tab-name[data-uploader-id="${uploaderId}"]`);
    if (!nameEl) return;

    const currentName = this.uploaderInstances[uploaderId].name;
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentName;
    input.className = "fu-config-builder-uploader-tab-input";

    // Error message element
    const errorEl = document.createElement("span");
    errorEl.className = "fu-config-builder-name-error";
    errorEl.style.display = "none";
    errorEl.textContent = "Name already exists";

    const validateName = () => {
      const newName = input.value.trim();
      if (newName && this.isNameDuplicate(newName, uploaderId)) {
        input.classList.add("error");
        errorEl.style.display = "";
        return false;
      } else {
        input.classList.remove("error");
        errorEl.style.display = "none";
        return true;
      }
    };

    const finishEdit = (save = true) => {
      if (save) {
        const newName = input.value.trim();
        if (!newName) {
          // Empty name - keep current
          this.uploaderInstances[uploaderId].name = currentName;
          nameEl.textContent = currentName;
        } else if (this.isNameDuplicate(newName, uploaderId)) {
          // Duplicate name - show error and don't close
          input.classList.add("error");
          errorEl.style.display = "";
          input.focus();
          return;
        } else {
          // Valid name
          this.uploaderInstances[uploaderId].name = newName;
          nameEl.textContent = newName;
          // Update preview header
          this.updatePreviewHeader(uploaderId, newName);
          // Update code output
          this.updateCodeOutput();
        }
      }
      nameEl.style.display = "";
      input.remove();
      errorEl.remove();
    };

    input.addEventListener("input", validateName);
    input.addEventListener("blur", () => finishEdit(true));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (validateName()) {
          finishEdit(true);
        }
      } else if (e.key === "Escape") {
        finishEdit(false);
      }
    });

    nameEl.style.display = "none";
    nameEl.parentNode.insertBefore(input, nameEl);
    nameEl.parentNode.insertBefore(errorEl, input.nextSibling);
    input.focus();
    input.select();
  }

  /**
   * Update preview header with new name
   */
  updatePreviewHeader(uploaderId, newName) {
    const wrapper = this.element.querySelector(`[data-uploader-wrapper="${uploaderId}"]`);
    if (wrapper) {
      const label = wrapper.querySelector(".fu-config-builder-uploader-label");
      if (label) {
        label.textContent = newName;
      }
    }
  }

  /**
   * Update uploader tabs UI without full re-render
   */
  updateUploaderTabsUI() {
    const listEl = this.element.querySelector("#uploader-list");
    if (listEl) {
      listEl.innerHTML = this.renderUploaderTabs();

      // Re-attach uploader tab events
      this.element.querySelectorAll(".fu-config-builder-uploader-tab").forEach((tab) => {
        tab.addEventListener("click", (e) => {
          if (!e.target.closest(".fu-config-builder-uploader-tab-close") &&
              !e.target.closest(".fu-config-builder-uploader-tab-duplicate")) {
            this.selectUploader(tab.dataset.uploaderId);
          }
        });
      });

      this.element.querySelectorAll(".fu-config-builder-uploader-tab-close").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.removeUploader(btn.dataset.uploaderId);
        });
      });

      this.element.querySelectorAll(".fu-config-builder-uploader-tab-duplicate").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.duplicateUploader(btn.dataset.uploaderId);
        });
      });

      this.element.querySelectorAll(".fu-config-builder-uploader-tab-name").forEach((nameEl) => {
        nameEl.addEventListener("dblclick", (e) => {
          e.stopPropagation();
          this.editUploaderName(nameEl.dataset.uploaderId);
        });
      });
    }
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
    this.onConfigChange();
  }

  /**
   * Get all uploaders' configurations
   */
  getAllConfigs() {
    // Update current uploader's config
    if (this.activeUploaderId && this.uploaderInstances[this.activeUploaderId]) {
      this.uploaderInstances[this.activeUploaderId].config = { ...this.config };
    }

    return Object.entries(this.uploaderInstances).map(([id, data]) => ({
      id,
      name: data.name,
      config: { ...data.config }
    }));
  }
}
