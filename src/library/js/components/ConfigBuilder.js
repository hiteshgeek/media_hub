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
    this.element.innerHTML = `
      <div class="fu-config-builder">
        <div class="fu-config-builder-header">
          <h1>FileUploader Configuration Builder</h1>
          <p>Explore all options and generate configuration code for your uploader</p>
        </div>

        <!-- Options Panel -->
        <div class="fu-config-builder-panel fu-config-builder-options">
          <div class="fu-config-builder-panel-header">
            <h2>Configuration Options</h2>
          </div>
          <div class="fu-config-builder-panel-content">
            <!-- Presets -->
            <div class="fu-config-builder-presets">
              <button class="fu-config-builder-preset ${this.currentPreset === "default" ? "active" : ""}" data-preset="default">Default</button>
              <button class="fu-config-builder-preset ${this.currentPreset === "minimal" ? "active" : ""}" data-preset="minimal">Minimal</button>
              <button class="fu-config-builder-preset ${this.currentPreset === "images-only" ? "active" : ""}" data-preset="images-only">Images Only</button>
              <button class="fu-config-builder-preset ${this.currentPreset === "documents" ? "active" : ""}" data-preset="documents">Documents</button>
              <button class="fu-config-builder-preset ${this.currentPreset === "media" ? "active" : ""}" data-preset="media">Media</button>
              <button class="fu-config-builder-preset ${this.currentPreset === "single-file" ? "active" : ""}" data-preset="single-file">Single File</button>
            </div>

            <!-- Categories -->
            ${this.renderCategories()}
          </div>
        </div>

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
   * Render number input option
   */
  renderNumberInput(key, def, isDisabled = false, dependencyIndicator = "") {
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
   * Render size input with unit selector
   */
  renderSizeInput(key, def, isDisabled = false, dependencyIndicator = "") {
    const bytes = this.config[key];
    const { value, unit } = this.bytesToUnit(bytes);

    return `
      <div class="fu-config-builder-group ${isDisabled ? "disabled" : ""}">
        <label class="fu-config-builder-label">
          ${def.label}
          ${dependencyIndicator}
          <code>${key}</code>
        </label>
        <div class="fu-config-builder-number-group">
          <input type="number" class="fu-config-builder-input fu-config-builder-number-input"
                 data-option="${key}" data-type="size"
                 value="${value}" min="0" ${isDisabled ? "disabled" : ""}>
          <select class="fu-config-builder-select fu-config-builder-unit-select" data-option="${key}-unit" ${isDisabled ? "disabled" : ""}>
            <option value="bytes" ${unit === "bytes" ? "selected" : ""}>Bytes</option>
            <option value="KB" ${unit === "KB" ? "selected" : ""}>KB</option>
            <option value="MB" ${unit === "MB" ? "selected" : ""}>MB</option>
            <option value="GB" ${unit === "GB" ? "selected" : ""}>GB</option>
          </select>
        </div>
        <div class="fu-config-builder-hint">${def.hint}</div>
      </div>
    `;
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
      image: ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"],
      video: ["mp4", "mpeg", "mov", "avi", "webm", "mkv", "flv"],
      audio: ["mp3", "wav", "ogg", "aac", "m4a", "flac", "wma"],
      document: [
        "pdf",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "ppt",
        "pptx",
        "txt",
        "csv",
        "rtf",
      ],
      archive: ["zip", "rar", "7z", "tar", "gz", "bz2"],
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
      const allSelected = exts.every((ext) => selected.includes(ext));
      html += `
        <div class="fu-config-builder-ext-group">
          <div class="fu-config-builder-ext-group-header">
            <span class="fu-config-builder-ext-group-title">${group}</span>
            <span class="fu-config-builder-ext-group-toggle" data-group="${group}">
              ${allSelected ? "Deselect All" : "Select All"}
            </span>
          </div>
          <div class="fu-config-builder-extensions">
            ${exts.map((ext) => `<span class="fu-config-builder-ext ${selected.includes(ext) ? "selected" : ""}" data-ext="${ext}">.${ext}</span>`).join("")}
          </div>
        </div>
      `;
    }

    html += `</div></div>`;
    return html;
  }

  /**
   * Render per-type size inputs
   */
  renderTypeSizeInputs(key, def) {
    const types = def.types || [];
    const values = this.config[key] || {};

    let html = `
      <div class="fu-config-builder-group">
        <label class="fu-config-builder-label">
          ${def.label}
          <code>${key}</code>
        </label>
        <div class="fu-config-builder-hint" style="margin-bottom: 12px;">${def.hint}</div>
        <div class="fu-config-builder-limits-grid" data-option="${key}" data-type="typeSize">
    `;

    for (const type of types) {
      const bytes = values[type] || 0;
      const { value, unit } = this.bytesToUnit(bytes);

      html += `
        <div class="fu-config-builder-limit-row">
          <span class="fu-config-builder-limit-type">${type}</span>
          <input type="number" class="fu-config-builder-input"
                 data-type-key="${type}" value="${value || ""}"
                 min="0" placeholder="No limit">
          <select class="fu-config-builder-select" data-type-unit="${type}">
            <option value="bytes" ${unit === "bytes" ? "selected" : ""}>Bytes</option>
            <option value="KB" ${unit === "KB" ? "selected" : ""}>KB</option>
            <option value="MB" ${unit === "MB" ? "selected" : ""}>MB</option>
            <option value="GB" ${unit === "GB" ? "selected" : ""}>GB</option>
          </select>
        </div>
      `;
    }

    html += `</div></div>`;
    return html;
  }

  /**
   * Render per-type count inputs
   */
  renderTypeCountInputs(key, def) {
    const types = def.types || [];
    const values = this.config[key] || {};

    let html = `
      <div class="fu-config-builder-group">
        <label class="fu-config-builder-label">
          ${def.label}
          <code>${key}</code>
        </label>
        <div class="fu-config-builder-hint" style="margin-bottom: 12px;">${def.hint}</div>
        <div class="fu-config-builder-limits-grid" data-option="${key}" data-type="typeCount">
    `;

    for (const type of types) {
      html += `
        <div class="fu-config-builder-limit-row">
          <span class="fu-config-builder-limit-type">${type}</span>
          <input type="number" class="fu-config-builder-input"
                 data-type-key="${type}" value="${values[type] || ""}"
                 min="0" placeholder="No limit">
          <span></span>
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
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
        "image/bmp",
        "image/x-icon",
      ],
      video: [
        "video/mp4",
        "video/mpeg",
        "video/quicktime",
        "video/x-msvideo",
        "video/webm",
        "video/x-matroska",
        "video/x-flv",
      ],
      audio: [
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "audio/aac",
        "audio/mp4",
        "audio/flac",
        "audio/x-ms-wma",
        "audio/webm",
      ],
      document: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain",
        "text/csv",
        "application/rtf",
      ],
      archive: [
        "application/zip",
        "application/x-rar-compressed",
        "application/x-7z-compressed",
        "application/x-tar",
        "application/gzip",
        "application/x-bzip2",
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
      const allSelected = mimes.every((mime) => selected.includes(mime));
      html += `
        <div class="fu-config-builder-mime-group">
          <div class="fu-config-builder-mime-group-header">
            <span class="fu-config-builder-mime-group-title">${group}</span>
            <span class="fu-config-builder-mime-group-toggle" data-group="${group}">
              ${allSelected ? "Deselect All" : "Select All"}
            </span>
          </div>
          <div class="fu-config-builder-mimes">
            ${mimes.map((mime) => `
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
   * Get category icon SVG
   */
  getCategoryIcon(icon) {
    const icons = {
      link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>',
      size: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>',
      layers:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
      file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
      settings:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
      eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
      bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>',
      button:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="8" width="18" height="8" rx="2"/><path d="M7 12h10"/></svg>',
      camera:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>',
      image:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
      move: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>',
      shield:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    };

    return `<span class="fu-config-builder-category-icon">${icons[icon] || icons.settings}</span>`;
  }

  /**
   * Convert bytes to appropriate unit
   */
  bytesToUnit(bytes) {
    if (!bytes || bytes === 0) return { value: 0, unit: "MB" };

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
   * Convert value with unit to bytes
   */
  unitToBytes(value, unit) {
    const num = parseFloat(value) || 0;
    switch (unit) {
      case "GB":
        return num * 1024 * 1024 * 1024;
      case "MB":
        return num * 1024 * 1024;
      case "KB":
        return num * 1024;
      default:
        return num;
    }
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
    // Category collapse/expand
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

    // Size inputs
    this.element.querySelectorAll('.fu-config-builder-input[data-type="size"]').forEach((input) => {
      const unitSelect = this.element.querySelector(
        `[data-option="${input.dataset.option}-unit"]`
      );

      const updateSize = () => {
        const value = parseFloat(input.value) || 0;
        const unit = unitSelect.value;
        const optionKey = input.dataset.option;
        this.config[optionKey] = this.unitToBytes(value, unit);

        // Also set display value (e.g., perFileMaxSizeDisplay)
        const displayKey = optionKey + "Display";
        this.config[displayKey] = this.formatBytesDisplay(value, unit);

        this.onConfigChange();
      };

      input.addEventListener("input", updateSize);
      unitSelect.addEventListener("change", updateSize);
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

    // Type size inputs
    this.element.querySelectorAll('[data-type="typeSize"]').forEach((container) => {
      container.querySelectorAll("input").forEach((input) => {
        const unitSelect = container.querySelector(
          `[data-type-unit="${input.dataset.typeKey}"]`
        );

        const updateTypeSize = () => {
          const value = parseFloat(input.value) || 0;
          const unit = unitSelect ? unitSelect.value : "MB";
          const bytes = this.unitToBytes(value, unit);
          const typeKey = input.dataset.typeKey;
          const optionKey = container.dataset.option;

          // Initialize objects if needed
          if (!this.config[optionKey]) {
            this.config[optionKey] = {};
          }

          // Get the corresponding display key
          const displayKey = optionKey + "Display";
          if (!this.config[displayKey]) {
            this.config[displayKey] = {};
          }

          if (bytes > 0) {
            this.config[optionKey][typeKey] = bytes;
            // Set the display value (e.g., "5MB")
            this.config[displayKey][typeKey] = this.formatBytesDisplay(value, unit);
          } else {
            delete this.config[optionKey][typeKey];
            delete this.config[displayKey][typeKey];
          }
          this.onConfigChange();
        };

        input.addEventListener("input", updateTypeSize);
        if (unitSelect) {
          unitSelect.addEventListener("change", updateTypeSize);
        }
      });
    });

    // Type count inputs
    this.element.querySelectorAll('[data-type="typeCount"]').forEach((container) => {
      container.querySelectorAll("input").forEach((input) => {
        input.addEventListener("input", () => {
          const value = parseInt(input.value) || 0;

          if (!this.config[container.dataset.option]) {
            this.config[container.dataset.option] = {};
          }

          if (value > 0) {
            this.config[container.dataset.option][input.dataset.typeKey] =
              value;
          } else {
            delete this.config[container.dataset.option][input.dataset.typeKey];
          }
          this.onConfigChange();
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
   * Apply a preset configuration
   */
  applyPreset(preset) {
    // Track current preset
    this.currentPreset = preset;

    // Reset to defaults first
    this.config = this.getDefaultConfig();

    switch (preset) {
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
   * Clear preset selection (when user manually changes an option)
   */
  clearPresetSelection() {
    if (this.currentPreset) {
      this.currentPreset = null;
      this.element.querySelectorAll(".fu-config-builder-preset").forEach((btn) => {
        btn.classList.remove("active");
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
    return code
      // Comments (must be first)
      .replace(/(\/\/.*$)/gm, '<span class="code-comment">$1</span>')
      // Keywords
      .replace(/\b(const|let|var|new|true|false|null)\b/g, '<span class="code-keyword">$1</span>')
      // Strings
      .replace(/"([^"\\]|\\.)*"/g, '<span class="code-string">"$&"</span>')
      .replace(/<span class="code-string">"(".*?")"<\/span>/g, '<span class="code-string">$1</span>')
      // Numbers
      .replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>')
      // Property names
      .replace(/(\w+):/g, '<span class="code-property">$1</span>:');
  }

  /**
   * Highlight PHP code
   */
  highlightPhpCode(code) {
    return code
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
