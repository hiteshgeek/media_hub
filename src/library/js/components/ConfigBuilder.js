/**
 * FileUploader Config Builder
 * Visual configuration interface for the FileUploader component
 * Allows users to explore all options and generate configuration code
 */

import Tooltip from "./tooltip/Tooltip.js";

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
    this.activeMainTab = localStorage.getItem("fu-config-builder-main-tab") || "config";
    this.currentCategory = localStorage.getItem("fu-config-builder-category") || "urls";
    this.currentStyleSection = localStorage.getItem("fu-config-builder-style-section") || "primaryColors";

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
          cleanupOnDestroy: {
            type: "boolean",
            default: true,
            label: "Cleanup On Destroy",
            hint: "Delete uploaded files from server when the uploader instance is destroyed",
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
            affectsOptions: [
              "showProgressBar",
              "showTypeProgressBar",
              "showPerFileLimit",
              "showTypeGroupSize",
              "showTypeGroupCount",
              "defaultLimitsView",
              "allowLimitsViewToggle",
              "showLimitsToggle",
              "defaultLimitsVisible",
            ],
          },
          showProgressBar: {
            type: "boolean",
            default: false,
            label: "Show Summary Progress Bar",
            hint: "Show progress bar for Total Size and File Count summary",
            dependsOn: "showLimits",
          },
          showTypeProgressBar: {
            type: "boolean",
            default: true,
            label: "Show Type Progress Bar",
            hint: "Show progress bar in type grid cards",
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
          enableFullPageCapture: {
            type: "boolean",
            default: true,
            label: "Enable Full Page Capture",
            hint: "Enable full page screenshot capture button (captures entire scrollable page)",
            affectsOptions: ["modalMediaButtons", "collapsibleCaptureButtons"],
          },
          enableRegionCapture: {
            type: "boolean",
            default: true,
            label: "Enable Region Capture",
            hint: "Enable region selection screenshot capture button (user selects area to capture)",
            affectsOptions: ["modalMediaButtons", "collapsibleCaptureButtons"],
          },
          enableScreenCapture: {
            type: "boolean",
            default: true,
            label: "Enable Screenshot Capture",
            hint: "Enable screenshot capture button",
            affectsOptions: ["enableMicrophoneAudio", "enableSystemAudio", "modalMediaButtons", "collapsibleCaptureButtons"],
          },
          enableVideoRecording: {
            type: "boolean",
            default: true,
            label: "Enable Screen Recording",
            hint: "Enable screen recording button",
            affectsOptions: [
              "maxVideoRecordingDuration",
              "recordingCountdownDuration",
              "modalMediaButtons",
              "collapsibleCaptureButtons",
            ],
          },
          enableAudioRecording: {
            type: "boolean",
            default: true,
            label: "Enable Audio Recording",
            hint: "Enable audio recording button",
            affectsOptions: ["maxAudioRecordingDuration", "modalMediaButtons", "collapsibleCaptureButtons"],
          },
          collapsibleCaptureButtons: {
            type: "boolean",
            default: false,
            label: "Collapsible Capture Buttons",
            hint: "Show capture buttons in a collapsible/expandable format with toggle button",
            showWhen: (config) =>
              config.enableFullPageCapture ||
              config.enableRegionCapture ||
              config.enableScreenCapture ||
              config.enableVideoRecording ||
              config.enableAudioRecording,
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
            default: true,
            label: "Enable Microphone Audio",
            hint: "Record microphone audio during screen capture",
            dependsOn: "enableScreenCapture",
          },
          enableSystemAudio: {
            type: "boolean",
            default: true,
            label: "Enable System Audio",
            hint: "Record system audio during screen capture",
            dependsOn: "enableScreenCapture",
          },
          showRecordingSize: {
            type: "boolean",
            default: true,
            label: "Show Recording Size",
            hint: "Show approximate file size during recording",
            dependsOn: "enableVideoRecording",
          },
          videoBitsPerSecond: {
            type: "selectWithInput",
            default: 2500000,
            label: "Video Bitrate",
            hint: "Video quality/bitrate for screen recording. Select a preset or enter a custom value.",
            dependsOn: "enableVideoRecording",
            formatType: "bitrate",
            options: [
              { value: 1000000, label: "Low (1 Mbps)" },
              { value: 2500000, label: "Medium (2.5 Mbps)" },
              { value: 5000000, label: "High (5 Mbps)" },
              { value: 8000000, label: "Ultra (8 Mbps)" },
            ],
          },
          audioBitsPerSecond: {
            type: "selectWithInput",
            default: 128000,
            label: "Audio Bitrate",
            hint: "Audio quality/bitrate for recordings. Select a preset or enter a custom value.",
            dependsOn: "enableVideoRecording",
            formatType: "bitrate",
            options: [
              { value: 64000, label: "Low (64 Kbps)" },
              { value: 128000, label: "Medium (128 Kbps)" },
              { value: 192000, label: "High (192 Kbps)" },
              { value: 320000, label: "Ultra (320 Kbps)" },
            ],
          },
          maxVideoRecordingFileSize: {
            type: "selectWithInput",
            default: null,
            label: "Max Video Recording File Size",
            hint: "Maximum file size for screen/video recordings (auto-stops when reached). Select a preset or enter a custom value.",
            dependsOn: "enableVideoRecording",
            formatType: "size",
            options: [
              { value: null, label: "No Limit (use per-file limit)" },
              { value: 5242880, label: "5 MB" },
              { value: 10485760, label: "10 MB" },
              { value: 26214400, label: "25 MB" },
              { value: 52428800, label: "50 MB" },
              { value: 104857600, label: "100 MB" },
              { value: 262144000, label: "250 MB" },
              { value: 524288000, label: "500 MB" },
            ],
          },
          maxAudioRecordingFileSize: {
            type: "selectWithInput",
            default: null,
            label: "Max Audio Recording File Size",
            hint: "Maximum file size for audio recordings (auto-stops when reached). Select a preset or enter a custom value.",
            dependsOn: "enableAudioRecording",
            formatType: "size",
            options: [
              { value: null, label: "No Limit (use per-file limit)" },
              { value: 1048576, label: "1 MB" },
              { value: 5242880, label: "5 MB" },
              { value: 10485760, label: "10 MB" },
              { value: 26214400, label: "25 MB" },
              { value: 52428800, label: "50 MB" },
              { value: 104857600, label: "100 MB" },
            ],
          },
          regionCaptureShowDimensions: {
            type: "boolean",
            default: true,
            label: "Show Region Dimensions",
            hint: "Display width × height dimensions while selecting a region to capture",
            dependsOn: "enableRegionCapture",
          },
          regionCaptureDimensionsPosition: {
            type: "select",
            default: "bottom-center",
            label: "Dimensions Position",
            hint: "Position of the dimensions display relative to the selection box",
            dependsOn: "regionCaptureShowDimensions",
            options: [
              { value: "top-left", label: "Top Left" },
              { value: "top-center", label: "Top Center" },
              { value: "top-right", label: "Top Right" },
              { value: "center-left", label: "Center Left" },
              { value: "center", label: "Center" },
              { value: "center-right", label: "Center Right" },
              { value: "bottom-left", label: "Bottom Left" },
              { value: "bottom-center", label: "Bottom Center" },
              { value: "bottom-right", label: "Bottom Right" },
            ],
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
            affectsOptions: [
              "carouselAutoPreload",
              "carouselEnableManualLoading",
              "carouselShowDownloadButton",
              "carouselMaxPreviewRows",
              "carouselMaxTextPreviewChars",
              "carouselVisibleTypes",
              "carouselPreviewableTypes",
            ],
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
          carouselShowDownloadButton: {
            type: "boolean",
            default: true,
            label: "Show Download Button",
            hint: "Show download button in carousel preview",
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
            default: ["image", "video", "audio", "pdf", "excel", "csv", "text"],
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
            default: ["image", "video", "audio", "pdf", "csv", "excel", "text"],
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

      // Display Mode
      displayMode: {
        title: "Display Mode",
        icon: "layout",
        options: {
          displayMode: {
            type: "select",
            default: "inline",
            label: "Display Mode",
            hint: "How the uploader is displayed on the page",
            options: [
              { value: "inline", label: "Inline (default)" },
              { value: "modal-minimal", label: "Modal with Minimal Preview" },
              { value: "modal-detailed", label: "Modal with Detailed Preview" },
            ],
            affectsOptions: [
              "modalButtonText",
              "modalButtonIcon",
              "modalTitle",
              "modalSize",
              "bootstrapVersion",
            ],
          },
          modalButtonText: {
            type: "text",
            default: "Upload Files",
            label: "Modal Button Text",
            hint: "Text for the button that opens the modal",
            dependsOn: "displayMode",
            showWhen: (config) =>
              config.displayMode === "modal-minimal" ||
              config.displayMode === "modal-detailed",
          },
          modalButtonIcon: {
            type: "select",
            default: "upload",
            label: "Modal Button Icon",
            hint: "Icon to show on the modal trigger button",
            options: [
              { value: "upload", label: "Upload Cloud" },
              { value: "plus", label: "Plus" },
              { value: "folder", label: "Folder" },
              { value: "none", label: "No Icon" },
            ],
            dependsOn: "displayMode",
            showWhen: (config) =>
              config.displayMode === "modal-minimal" ||
              config.displayMode === "modal-detailed",
          },
          modalTitle: {
            type: "text",
            default: "Upload Files",
            label: "Modal Title",
            hint: "Title shown in the modal header",
            dependsOn: "displayMode",
            showWhen: (config) =>
              config.displayMode === "modal-minimal" ||
              config.displayMode === "modal-detailed",
          },
          modalSize: {
            type: "select",
            default: "lg",
            label: "Modal Size",
            hint: "Size of the modal dialog",
            options: [
              { value: "sm", label: "Small" },
              { value: "md", label: "Medium" },
              { value: "lg", label: "Large" },
              { value: "xl", label: "Extra Large" },
            ],
            dependsOn: "displayMode",
            showWhen: (config) =>
              config.displayMode === "modal-minimal" ||
              config.displayMode === "modal-detailed",
          },
          bootstrapVersion: {
            type: "select",
            default: "5",
            label: "Bootstrap Version",
            hint: "Bootstrap version for modal markup",
            options: [
              { value: "3", label: "Bootstrap 3" },
              { value: "4", label: "Bootstrap 4" },
              { value: "5", label: "Bootstrap 5" },
            ],
            dependsOn: "displayMode",
            showWhen: (config) =>
              config.displayMode === "modal-minimal" ||
              config.displayMode === "modal-detailed",
          },
          modalMediaButtons: {
            type: "multiSelect",
            default: [],
            label: "Media Capture Buttons",
            hint: "Show media capture buttons alongside the modal button for quick access (only enabled options from Media Capture section are available)",
            options: ["fullpage", "region", "screenshot", "video", "audio"],
            optionLabels: {
              fullpage: "Full Page Capture",
              region: "Region Capture",
              screenshot: "Screenshot Capture",
              video: "Screen Recording",
              audio: "Audio Recording",
            },
            filterOptions: (config) => {
              // Only show options that are enabled in Media Capture settings
              const available = [];
              if (config.enableFullPageCapture) available.push("fullpage");
              if (config.enableRegionCapture) available.push("region");
              if (config.enableScreenCapture) available.push("screenshot");
              if (config.enableVideoRecording) available.push("video");
              if (config.enableAudioRecording) available.push("audio");
              return available;
            },
            showWhen: (config) =>
              config.displayMode === "modal-minimal" ||
              config.displayMode === "modal-detailed",
          },
          enableModalDropZone: {
            type: "boolean",
            default: true,
            label: "Enable Drop Zone on Button",
            hint: "Allow drag and drop files directly onto the modal trigger button",
            showWhen: (config) =>
              config.displayMode === "modal-minimal" ||
              config.displayMode === "modal-detailed",
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
   * Get style variable definitions organized by section
   */
  getStyleDefinitions() {
    return {
      primaryColors: {
        title: "Primary Colors",
        icon: "palette",
        variables: {
          "--fu-primary-50": {
            type: "color",
            default: "#ebf8ff",
            label: "Primary 50",
          },
          "--fu-primary-100": {
            type: "color",
            default: "#bee3f8",
            label: "Primary 100",
          },
          "--fu-primary-200": {
            type: "color",
            default: "#90cdf4",
            label: "Primary 200",
          },
          "--fu-primary-300": {
            type: "color",
            default: "#63b3ed",
            label: "Primary 300",
          },
          "--fu-primary-400": {
            type: "color",
            default: "#4299e1",
            label: "Primary 400",
          },
          "--fu-primary-500": {
            type: "color",
            default: "#3182ce",
            label: "Primary 500",
          },
          "--fu-primary-600": {
            type: "color",
            default: "#2b6cb0",
            label: "Primary 600",
          },
          "--fu-primary-700": {
            type: "color",
            default: "#2c5282",
            label: "Primary 700",
          },
          "--fu-primary-800": {
            type: "color",
            default: "#2a4365",
            label: "Primary 800",
          },
          "--fu-primary-900": {
            type: "color",
            default: "#1a365d",
            label: "Primary 900",
          },
        },
      },
      grayColors: {
        title: "Gray Colors",
        icon: "palette",
        variables: {
          "--fu-gray-50": {
            type: "color",
            default: "#f7fafc",
            label: "Gray 50",
          },
          "--fu-gray-100": {
            type: "color",
            default: "#edf2f7",
            label: "Gray 100",
          },
          "--fu-gray-200": {
            type: "color",
            default: "#e2e8f0",
            label: "Gray 200",
          },
          "--fu-gray-300": {
            type: "color",
            default: "#cbd5e0",
            label: "Gray 300",
          },
          "--fu-gray-400": {
            type: "color",
            default: "#a0aec0",
            label: "Gray 400",
          },
          "--fu-gray-500": {
            type: "color",
            default: "#718096",
            label: "Gray 500",
          },
          "--fu-gray-600": {
            type: "color",
            default: "#4a5568",
            label: "Gray 600",
          },
          "--fu-gray-700": {
            type: "color",
            default: "#2d3748",
            label: "Gray 700",
          },
          "--fu-gray-800": {
            type: "color",
            default: "#1a202c",
            label: "Gray 800",
          },
          "--fu-gray-900": {
            type: "color",
            default: "#171923",
            label: "Gray 900",
          },
        },
      },
      statusColors: {
        title: "Status Colors",
        icon: "check",
        variables: {
          "--fu-success-50": {
            type: "color",
            default: "#f0fff4",
            label: "Success 50",
          },
          "--fu-success-100": {
            type: "color",
            default: "#c6f6d5",
            label: "Success 100",
          },
          "--fu-success-500": {
            type: "color",
            default: "#48bb78",
            label: "Success 500",
          },
          "--fu-success-600": {
            type: "color",
            default: "#38a169",
            label: "Success 600",
          },
          "--fu-success-700": {
            type: "color",
            default: "#2f855a",
            label: "Success 700",
          },
          "--fu-success-800": {
            type: "color",
            default: "#276749",
            label: "Success 800",
          },
          "--fu-error-50": {
            type: "color",
            default: "#fff5f5",
            label: "Error 50",
          },
          "--fu-error-100": {
            type: "color",
            default: "#fed7d7",
            label: "Error 100",
          },
          "--fu-error-500": {
            type: "color",
            default: "#fc8181",
            label: "Error 500",
          },
          "--fu-error-600": {
            type: "color",
            default: "#e53e3e",
            label: "Error 600",
          },
          "--fu-error-700": {
            type: "color",
            default: "#c53030",
            label: "Error 700",
          },
          "--fu-error-800": {
            type: "color",
            default: "#9b2c2c",
            label: "Error 800",
          },
          "--fu-warning-50": {
            type: "color",
            default: "#fffbeb",
            label: "Warning 50",
          },
          "--fu-warning-100": {
            type: "color",
            default: "#fef3c7",
            label: "Warning 100",
          },
          "--fu-warning-400": {
            type: "color",
            default: "#fbbf24",
            label: "Warning 400",
          },
          "--fu-warning-500": {
            type: "color",
            default: "#f59e0b",
            label: "Warning 500",
          },
          "--fu-warning-600": {
            type: "color",
            default: "#d97706",
            label: "Warning 600",
          },
          "--fu-warning-700": {
            type: "color",
            default: "#b45309",
            label: "Warning 700",
          },
        },
      },
      semanticColorsLight: {
        title: "Semantic Colors (Light Mode)",
        icon: "sun",
        mode: "light",
        variables: {
          "--fu-color-primary": {
            type: "color",
            default: "#4299e1",
            label: "Primary",
          },
          "--fu-color-primary-hover": {
            type: "color",
            default: "#3182ce",
            label: "Primary Hover",
          },
          "--fu-color-primary-light": {
            type: "color",
            default: "#ebf8ff",
            label: "Primary Light",
          },
          "--fu-color-text": {
            type: "color",
            default: "#2d3748",
            label: "Text",
          },
          "--fu-color-text-muted": {
            type: "color",
            default: "#718096",
            label: "Text Muted",
          },
          "--fu-color-text-light": {
            type: "color",
            default: "#4a5568",
            label: "Text Light",
          },
          "--fu-color-bg": {
            type: "color",
            default: "#ffffff",
            label: "Background",
          },
          "--fu-color-bg-light": {
            type: "color",
            default: "#f7fafc",
            label: "Background Light",
          },
          "--fu-color-bg-hover": {
            type: "color",
            default: "#ebf8ff",
            label: "Background Hover",
          },
          "--fu-color-border": {
            type: "color",
            default: "#cbd5e0",
            label: "Border",
          },
          "--fu-color-border-light": {
            type: "color",
            default: "#e2e8f0",
            label: "Border Light",
          },
          "--fu-color-border-hover": {
            type: "color",
            default: "#4299e1",
            label: "Border Hover",
          },
          "--fu-color-success": {
            type: "color",
            default: "#48bb78",
            label: "Success",
          },
          "--fu-color-success-bg": {
            type: "color",
            default: "#c6f6d5",
            label: "Success Background",
          },
          "--fu-color-success-text": {
            type: "color",
            default: "#2f855a",
            label: "Success Text",
          },
          "--fu-color-error": {
            type: "color",
            default: "#fc8181",
            label: "Error",
          },
          "--fu-color-error-bg": {
            type: "color",
            default: "#fed7d7",
            label: "Error Background",
          },
          "--fu-color-error-text": {
            type: "color",
            default: "#c53030",
            label: "Error Text",
          },
          "--fu-color-error-hover": {
            type: "color",
            default: "#9b2c2c",
            label: "Error Hover",
          },
        },
      },
      semanticColorsDark: {
        title: "Semantic Colors (Dark Mode)",
        icon: "moon",
        mode: "dark",
        variables: {
          // Same variables as light mode, but with dark mode default values
          // These override the light mode values via @media (prefers-color-scheme: dark)
          "--fu-color-text": {
            type: "color",
            default: "#e2e8f0",
            label: "Text",
          },
          "--fu-color-text-muted": {
            type: "color",
            default: "#a0aec0",
            label: "Text Muted",
          },
          "--fu-color-text-light": {
            type: "color",
            default: "#cbd5e0",
            label: "Text Light",
          },
          "--fu-color-bg": {
            type: "color",
            default: "#1a202c",
            label: "Background",
          },
          "--fu-color-bg-light": {
            type: "color",
            default: "#2d3748",
            label: "Background Light",
          },
          "--fu-color-bg-hover": {
            type: "color",
            default: "#1a365d",
            label: "Background Hover",
          },
          "--fu-color-border": {
            type: "color",
            default: "#4a5568",
            label: "Border",
          },
          "--fu-color-border-light": {
            type: "color",
            default: "#2d3748",
            label: "Border Light",
          },
          "--fu-color-border-hover": {
            type: "color",
            default: "#4299e1",
            label: "Border Hover",
          },
        },
      },
      spacing: {
        title: "Spacing",
        icon: "size",
        variables: {
          "--fu-spacing-xs": {
            type: "size",
            default: "4px",
            label: "Extra Small",
          },
          "--fu-spacing-sm": { type: "size", default: "8px", label: "Small" },
          "--fu-spacing-md": { type: "size", default: "12px", label: "Medium" },
          "--fu-spacing-lg": { type: "size", default: "16px", label: "Large" },
          "--fu-spacing-xl": {
            type: "size",
            default: "20px",
            label: "Extra Large",
          },
          "--fu-spacing-2xl": {
            type: "size",
            default: "24px",
            label: "2X Large",
          },
          "--fu-spacing-3xl": {
            type: "size",
            default: "32px",
            label: "3X Large",
          },
          "--fu-spacing-4xl": {
            type: "size",
            default: "40px",
            label: "4X Large",
          },
        },
      },
      typography: {
        title: "Typography",
        icon: "text",
        variables: {
          "--fu-font-size-xs": {
            type: "size",
            default: "12px",
            label: "Font Size XS",
          },
          "--fu-font-size-sm": {
            type: "size",
            default: "13px",
            label: "Font Size SM",
          },
          "--fu-font-size-base": {
            type: "size",
            default: "14px",
            label: "Font Size Base",
          },
          "--fu-font-size-md": {
            type: "size",
            default: "16px",
            label: "Font Size MD",
          },
          "--fu-font-size-lg": {
            type: "size",
            default: "18px",
            label: "Font Size LG",
          },
          "--fu-font-size-xl": {
            type: "size",
            default: "20px",
            label: "Font Size XL",
          },
          "--fu-font-weight-normal": {
            type: "number",
            default: "400",
            label: "Weight Normal",
          },
          "--fu-font-weight-medium": {
            type: "number",
            default: "500",
            label: "Weight Medium",
          },
          "--fu-font-weight-semibold": {
            type: "number",
            default: "600",
            label: "Weight Semibold",
          },
          "--fu-font-weight-bold": {
            type: "number",
            default: "700",
            label: "Weight Bold",
          },
        },
      },
      borderRadius: {
        title: "Border Radius",
        icon: "window",
        variables: {
          "--fu-radius-xs": {
            type: "size",
            default: "3px",
            label: "Extra Small",
          },
          "--fu-radius-sm": { type: "size", default: "4px", label: "Small" },
          "--fu-radius-md": { type: "size", default: "6px", label: "Medium" },
          "--fu-radius-lg": { type: "size", default: "8px", label: "Large" },
          "--fu-radius-xl": {
            type: "size",
            default: "12px",
            label: "Extra Large",
          },
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
            default:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            label: "Medium Shadow",
          },
          "--fu-shadow-lg": {
            type: "text",
            default:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            label: "Large Shadow",
          },
          "--fu-shadow-xl": {
            type: "text",
            default:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            label: "XL Shadow",
          },
        },
      },
      transitions: {
        title: "Transitions",
        icon: "settings",
        variables: {
          "--fu-transition-fast": {
            type: "text",
            default: "all 0.15s ease",
            label: "Fast",
          },
          "--fu-transition-base": {
            type: "text",
            default: "all 0.2s ease",
            label: "Base",
          },
          "--fu-transition-slow": {
            type: "text",
            default: "all 0.3s ease",
            label: "Slow",
          },
        },
      },
      components: {
        title: "Component Sizes",
        icon: "settings",
        variables: {
          "--fu-dropzone-border-width": {
            type: "size",
            default: "2px",
            label: "Dropzone Border",
          },
          "--fu-preview-height": {
            type: "size",
            default: "150px",
            label: "Preview Height",
          },
          "--fu-preview-height-mobile": {
            type: "size",
            default: "120px",
            label: "Preview Height Mobile",
          },
          "--fu-icon-size-sm": {
            type: "size",
            default: "18px",
            label: "Icon Small",
          },
          "--fu-icon-size-md": {
            type: "size",
            default: "20px",
            label: "Icon Medium",
          },
          "--fu-icon-size-lg": {
            type: "size",
            default: "40px",
            label: "Icon Large",
          },
          "--fu-icon-size-xl": {
            type: "size",
            default: "48px",
            label: "Icon XL",
          },
          "--fu-icon-size-2xl": {
            type: "size",
            default: "64px",
            label: "Icon 2XL",
          },
          "--fu-button-size": {
            type: "size",
            default: "40px",
            label: "Button Size",
          },
          "--fu-spinner-size": {
            type: "size",
            default: "40px",
            label: "Spinner Size",
          },
          "--fu-spinner-border-width": {
            type: "size",
            default: "4px",
            label: "Spinner Border",
          },
          "--fu-limit-item-width": {
            type: "size",
            default: "105px",
            label: "Limit Item Width",
          },
          "--fu-limit-item-width-large": {
            type: "size",
            default: "150px",
            label: "Limit Item Width Large",
          },
        },
      },
    };
  }

  /**
   * Get default style values from definitions
   */
  getDefaultStyleValues() {
    const values = {};
    for (const section of Object.values(this.styleDefinitions)) {
      for (const [varName, def] of Object.entries(section.variables)) {
        values[varName] = def.default;
      }
    }
    return values;
  }

  /**
   * Get mapping of CSS variables to selectors for highlighting
   */
  getVarToSelectorMap() {
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
   */
  getVarSourceMap() {
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
   * Initialize tooltips for all elements with data-tooltip-text attribute
   */
  initTooltips() {
    Tooltip.initAll(this.element);
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
   */
  getThemeVars(effectiveTheme) {
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
      <div class="fu-config-builder theme-${this.getEffectiveThemeMode()}" data-theme="${this.theme}">
        <div class="fu-config-builder-header">
          <div class="fu-config-builder-header-left">
            <a href="index.php" class="fu-config-builder-home-link" data-tooltip-text="Back to Home" data-tooltip-position="bottom">
              <svg viewBox="0 0 576 512" fill="currentColor"><path d="M575.8 255.5c0 18-15 32.1-32 32.1l-32 0 0 160c0 35.3-28.7 64-64 64l-320 0c-35.3 0-64-28.7-64-64l0-160-32 0c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/></svg>
            </a>
            <div class="fu-config-builder-theme-switcher" id="theme-switcher">
              <button class="fu-config-builder-theme-btn ${
                this.theme === "light" ? "active" : ""
              }" data-theme="light" data-tooltip-text="Light Mode" data-tooltip-position="bottom">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              </button>
              <button class="fu-config-builder-theme-btn ${
                this.theme === "dark" ? "active" : ""
              }" data-theme="dark" data-tooltip-text="Dark Mode" data-tooltip-position="bottom">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              </button>
              <button class="fu-config-builder-theme-btn ${
                this.theme === "system" ? "active" : ""
              }" data-theme="system" data-tooltip-text="System Default" data-tooltip-position="bottom">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              </button>
            </div>
          </div>
          <div class="fu-config-builder-header-text">
            <h1>FileUploader Configuration Builder</h1>
            <p>Explore all options and generate configuration code for your uploader</p>
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
                  <button class="fu-config-builder-reset-styles-btn" id="reset-styles" data-tooltip-text="Reset All Styles" data-tooltip-position="right">
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
                          <button class="fu-config-builder-code-btn" id="copy-css" data-tooltip-text="Copy to clipboard" data-tooltip-position="top">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                            Copy
                          </button>
                          <button class="fu-config-builder-code-btn" id="download-css" data-tooltip-text="Download CSS file" data-tooltip-position="top">
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
        }" data-category="${categoryKey}" data-tooltip-text="${category.title}" data-tooltip-position="right">
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
        } ${modeClass}" data-style-section="${sectionKey}" data-tooltip-text="${section.title}" data-tooltip-position="right">
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
      const currentValue = this.styleValues[varName] || computedValue || def.default;

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
    const unitOptions = units.map(u =>
      `<option value="${u}" ${this.sliderConfig.unit === u ? "selected" : ""}>${u}</option>`
    ).join("");

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
    const unitOptions = units.map(u =>
      `<option value="${u}" ${this.sliderConfig.unit === u ? "selected" : ""}>${u}</option>`
    ).join("");

    return `
      <div class="fu-config-builder-pertype-config">
        <div class="fu-config-builder-pertype-view-toggle">
          <span class="fu-config-builder-pertype-view-label">Group by:</span>
          <div class="fu-config-builder-pertype-view-buttons">
            <button type="button" class="fu-config-builder-pertype-view-btn ${viewMode === "byLimitType" ? "active" : ""}" data-view="byLimitType">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
              By Limit Type
            </button>
            <button type="button" class="fu-config-builder-pertype-view-btn ${viewMode === "byFileType" ? "active" : ""}" data-view="byFileType">
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
            <input type="number" id="pertype-slider-config-min" value="${this.sliderConfig.minValue}" min="1" max="10000">
          </div>
          <div class="fu-config-builder-slider-config-item">
            <label>Max (${this.sliderConfig.unit})</label>
            <input type="number" id="pertype-slider-config-max" value="${this.sliderConfig.maxValue}" min="10" max="100000">
          </div>
          <div class="fu-config-builder-slider-config-item">
            <label>Slider Step</label>
            <input type="number" id="pertype-slider-config-step" value="${this.sliderConfig.sliderStep}" min="1" max="1000">
          </div>
          <div class="fu-config-builder-slider-config-item">
            <label>+/- Step</label>
            <input type="number" id="pertype-slider-config-btn-step" value="${this.sliderConfig.buttonStep}" min="1" max="100">
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
   */
  renderPerTypeLimitsByFileType(options) {
    const types = ["image", "video", "audio", "document", "archive"];
    const perFileMaxSizeValues = this.config.perFileMaxSizePerType || {};
    const perTypeMaxTotalSizeValues = this.config.perTypeMaxTotalSize || {};
    const perTypeMaxFileCountValues = this.config.perTypeMaxFileCount || {};
    const perFileMaxSizePerTypeDef = options.perFileMaxSizePerType || {};
    const perTypeMaxTotalSizeDef = options.perTypeMaxTotalSize || {};
    const perTypeMaxFileCountDef = options.perTypeMaxFileCount || {};

    const maxBytes = this.getSliderMaxBytes();
    const units = ["bytes", "KB", "MB", "GB"];

    const minusIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"/></svg>`;
    const plusIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/></svg>`;

    let html = '<div class="fu-config-builder-pertype-by-filetype">';

    for (const type of types) {
      const typeIcon = this.getFileTypeIcon(type);
      const perFileSizeBytes = perFileMaxSizeValues[type] || 0;
      const totalSizeBytes = perTypeMaxTotalSizeValues[type] || 0;
      const fileCount = perTypeMaxFileCountValues[type] || 0;

      // Calculate display values for sizes
      const perFileDisplay = perFileSizeBytes > 0 ? this.bytesToBestUnit(perFileSizeBytes) : { value: 0, unit: this.sliderConfig.unit };
      const totalSizeDisplay = totalSizeBytes > 0 ? this.bytesToBestUnit(totalSizeBytes) : { value: 0, unit: this.sliderConfig.unit };
      const perFileMaxValue = this.bytesToUnit(maxBytes, perFileDisplay.unit);
      const totalSizeMaxValue = this.bytesToUnit(maxBytes, totalSizeDisplay.unit);
      const stepBytes = this.getSliderStepBytes();
      const perFileStepValue = Math.max(1, this.bytesToUnit(stepBytes, perFileDisplay.unit));
      const totalSizeStepValue = Math.max(1, this.bytesToUnit(stepBytes, totalSizeDisplay.unit));

      const perFileUnitOptions = units.map(u =>
        `<option value="${u}" ${perFileDisplay.unit === u ? "selected" : ""}>${u}</option>`
      ).join("");
      const totalSizeUnitOptions = units.map(u =>
        `<option value="${u}" ${totalSizeDisplay.unit === u ? "selected" : ""}>${u}</option>`
      ).join("");

      html += `
        <div class="fu-config-builder-filetype-card" data-file-type="${type}">
          <div class="fu-config-builder-filetype-card-header">
            ${typeIcon}
            <span class="fu-config-builder-filetype-card-title">${this.capitalizeFirst(type)}</span>
          </div>
          <div class="fu-config-builder-filetype-card-content">
            <!-- Per File Max Size -->
            <div class="fu-config-builder-filetype-limit-row">
              <label class="fu-config-builder-filetype-limit-label">
                Per File Max
                <code>perFileMaxSizePerType.${type}</code>
              </label>
              <div class="fu-config-builder-type-slider-controls" data-option="perFileMaxSizePerType" data-type-key="${type}" data-unit="${perFileDisplay.unit}">
                <button type="button" class="fu-config-builder-slider-btn fu-config-builder-slider-btn-sm" data-action="decrease">
                  ${minusIcon}
                </button>
                <input type="range"
                       class="fu-config-builder-slider-input"
                       data-slider-type="${type}"
                       value="${perFileDisplay.value}"
                       min="0"
                       max="${perFileMaxValue}"
                       step="${perFileStepValue}">
                <button type="button" class="fu-config-builder-slider-btn fu-config-builder-slider-btn-sm" data-action="increase">
                  ${plusIcon}
                </button>
                <input type="number"
                       class="fu-config-builder-slider-value-input fu-config-builder-slider-value-input-sm"
                       data-value-type="${type}"
                       value="${perFileDisplay.value || ""}"
                       min="0"
                       max="${perFileMaxValue}"
                       placeholder="0">
                <select class="fu-config-builder-unit-dropdown fu-config-builder-unit-dropdown-sm" data-unit-type="${type}">
                  ${perFileUnitOptions}
                </select>
              </div>
              <div class="fu-config-builder-slider-labels fu-config-builder-slider-labels-sm">
                <span class="fu-config-builder-slider-label">0 ${perFileDisplay.unit}</span>
                <span class="fu-config-builder-slider-label">${perFileMaxValue} ${perFileDisplay.unit}</span>
              </div>
            </div>
            <!-- Total Size Max -->
            <div class="fu-config-builder-filetype-limit-row">
              <label class="fu-config-builder-filetype-limit-label">
                Total Max Size
                <code>perTypeMaxTotalSize.${type}</code>
              </label>
              <div class="fu-config-builder-type-slider-controls" data-option="perTypeMaxTotalSize" data-type-key="${type}" data-unit="${totalSizeDisplay.unit}">
                <button type="button" class="fu-config-builder-slider-btn fu-config-builder-slider-btn-sm" data-action="decrease">
                  ${minusIcon}
                </button>
                <input type="range"
                       class="fu-config-builder-slider-input"
                       data-slider-type="${type}"
                       value="${totalSizeDisplay.value}"
                       min="0"
                       max="${totalSizeMaxValue}"
                       step="${totalSizeStepValue}">
                <button type="button" class="fu-config-builder-slider-btn fu-config-builder-slider-btn-sm" data-action="increase">
                  ${plusIcon}
                </button>
                <input type="number"
                       class="fu-config-builder-slider-value-input fu-config-builder-slider-value-input-sm"
                       data-value-type="${type}"
                       value="${totalSizeDisplay.value || ""}"
                       min="0"
                       max="${totalSizeMaxValue}"
                       placeholder="0">
                <select class="fu-config-builder-unit-dropdown fu-config-builder-unit-dropdown-sm" data-unit-type="${type}">
                  ${totalSizeUnitOptions}
                </select>
              </div>
              <div class="fu-config-builder-slider-labels fu-config-builder-slider-labels-sm">
                <span class="fu-config-builder-slider-label">0 ${totalSizeDisplay.unit}</span>
                <span class="fu-config-builder-slider-label">${totalSizeMaxValue} ${totalSizeDisplay.unit}</span>
              </div>
            </div>
            <!-- Max File Count -->
            <div class="fu-config-builder-filetype-limit-row">
              <label class="fu-config-builder-filetype-limit-label">
                Max Files
                <code>perTypeMaxFileCount.${type}</code>
              </label>
              <div class="fu-config-builder-type-slider-controls fu-config-builder-type-count-controls" data-option="perTypeMaxFileCount" data-type-key="${type}">
                <button type="button" class="fu-config-builder-slider-btn fu-config-builder-slider-btn-sm" data-action="decrease">
                  ${minusIcon}
                </button>
                <input type="range"
                       class="fu-config-builder-slider-input"
                       data-slider-type="${type}"
                       value="${fileCount}"
                       min="0"
                       max="100"
                       step="1">
                <button type="button" class="fu-config-builder-slider-btn fu-config-builder-slider-btn-sm" data-action="increase">
                  ${plusIcon}
                </button>
                <input type="number"
                       class="fu-config-builder-slider-value-input fu-config-builder-slider-value-input-sm"
                       data-value-type="${type}"
                       value="${fileCount || ""}"
                       min="0"
                       max="100"
                       placeholder="0">
                <span class="fu-config-builder-count-label">files</span>
              </div>
              <div class="fu-config-builder-slider-labels fu-config-builder-slider-labels-sm">
                <span class="fu-config-builder-slider-label">0</span>
                <span class="fu-config-builder-slider-label">100 files</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    html += '</div>';
    return html;
  }

  /**
   * Get file type icon
   */
  getFileTypeIcon(type) {
    const icons = {
      image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
      video: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`,
      audio: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
      document: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
      archive: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`
    };
    return icons[type] || icons.document;
  }

  /**
   * Capitalize first letter
   */
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Re-render the perTypeLimits panel content when view mode changes
   */
  rerenderPerTypeLimitsPanel() {
    const panel = this.element.querySelector('[data-category-panel="perTypeLimits"]');
    if (!panel) return;

    const optionsContainer = panel.querySelector('.fu-config-builder-category-options');
    if (!optionsContainer) return;

    const category = this.optionDefinitions.perTypeLimits;
    optionsContainer.innerHTML = this.renderPerTypeLimitsContent(category.options);

    // Re-attach events for the new content
    this.attachPerTypeByFileTypeEvents();

    // Also re-attach the original type slider events for "By Limit Type" view
    if (this.perTypeLimitsViewMode !== "byFileType") {
      // Re-attach type size slider events
      panel.querySelectorAll('[data-type="typeSizeSlider"]').forEach((container) => {
        this.attachTypeSizeSliderEvents(container);
      });
      // Re-attach type count slider events
      panel.querySelectorAll('[data-type="typeCountSlider"]').forEach((container) => {
        this.attachTypeCountSliderEvents(container);
      });
    }
  }

  /**
   * Attach events for type size sliders within a container
   */
  attachTypeSizeSliderEvents(container) {
    const optionKey = container.dataset.option;

    container.querySelectorAll(".fu-config-builder-type-slider-block").forEach((block) => {
      const typeKey = block.dataset.typeKey;
      const slider = block.querySelector(".fu-config-builder-slider-input");
      const valueInput = block.querySelector(".fu-config-builder-slider-value-input");
      const unitDropdown = block.querySelector(".fu-config-builder-unit-dropdown");
      const decreaseBtn = block.querySelector('[data-action="decrease"]');
      const increaseBtn = block.querySelector('[data-action="increase"]');

      if (!slider || !valueInput || !decreaseBtn || !increaseBtn || !unitDropdown) return;

      const getCurrentUnit = () => unitDropdown.value;

      const updateTypeValue = (value, unit) => {
        const maxValue = this.bytesToUnit(this.getSliderMaxBytes(), unit);
        value = Math.max(0, Math.min(maxValue, value));

        slider.value = value;
        valueInput.value = value || "";

        if (!this.config[optionKey]) {
          this.config[optionKey] = {};
        }

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

      unitDropdown.addEventListener("change", () => {
        const newUnit = unitDropdown.value;
        const currentBytes = this.config[optionKey]?.[typeKey] || 0;
        const newValue = currentBytes > 0 ? this.bytesToUnit(currentBytes, newUnit) : 0;
        slider.value = newValue;
        valueInput.value = newValue || "";
        block.dataset.unit = newUnit;
      });

      slider.addEventListener("input", () => {
        updateTypeValue(parseInt(slider.value) || 0, getCurrentUnit());
      });

      valueInput.addEventListener("input", () => {
        updateTypeValue(parseInt(valueInput.value) || 0, getCurrentUnit());
      });

      decreaseBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const unit = getCurrentUnit();
        const buttonStep = this.bytesToUnit(this.sliderConfig.buttonStep * 1024 * 1024, unit);
        const currentValue = parseInt(valueInput.value) || 0;
        updateTypeValue(currentValue - buttonStep, unit);
      });

      increaseBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const unit = getCurrentUnit();
        const buttonStep = this.bytesToUnit(this.sliderConfig.buttonStep * 1024 * 1024, unit);
        const currentValue = parseInt(valueInput.value) || 0;
        updateTypeValue(currentValue + buttonStep, unit);
      });
    });
  }

  /**
   * Attach events for type count sliders within a container
   */
  attachTypeCountSliderEvents(container) {
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
  }

  /**
   * Attach events for "By File Type" view sliders
   */
  attachPerTypeByFileTypeEvents() {
    // Handle slider controls in the "By File Type" view
    this.element.querySelectorAll('.fu-config-builder-pertype-by-filetype .fu-config-builder-type-slider-controls').forEach((controls) => {
      const optionKey = controls.dataset.option;
      const typeKey = controls.dataset.typeKey;
      const isCountSlider = controls.classList.contains('fu-config-builder-type-count-controls');

      const slider = controls.querySelector(".fu-config-builder-slider-input");
      const valueInput = controls.querySelector(".fu-config-builder-slider-value-input");
      const unitDropdown = controls.querySelector(".fu-config-builder-unit-dropdown");
      const decreaseBtn = controls.querySelector('[data-action="decrease"]');
      const increaseBtn = controls.querySelector('[data-action="increase"]');

      if (!slider || !valueInput || !decreaseBtn || !increaseBtn) return;

      if (isCountSlider) {
        // Count slider logic
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

        slider.addEventListener("input", () => updateTypeValue(parseInt(slider.value) || 0));
        valueInput.addEventListener("input", () => updateTypeValue(parseInt(valueInput.value) || 0));
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
      } else {
        // Size slider logic
        const getCurrentUnit = () => unitDropdown?.value || this.sliderConfig.unit;

        const updateTypeValue = (value, unit) => {
          const maxValue = this.bytesToUnit(this.getSliderMaxBytes(), unit);
          value = Math.max(0, Math.min(maxValue, value));

          slider.value = value;
          valueInput.value = value || "";

          if (!this.config[optionKey]) {
            this.config[optionKey] = {};
          }

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

        if (unitDropdown) {
          unitDropdown.addEventListener("change", () => {
            const newUnit = unitDropdown.value;
            const currentBytes = this.config[optionKey]?.[typeKey] || 0;
            const newValue = currentBytes > 0 ? this.bytesToUnit(currentBytes, newUnit) : 0;
            slider.value = newValue;
            valueInput.value = newValue || "";
            controls.dataset.unit = newUnit;
          });
        }

        slider.addEventListener("input", () => {
          updateTypeValue(parseInt(slider.value) || 0, getCurrentUnit());
        });

        valueInput.addEventListener("input", () => {
          updateTypeValue(parseInt(valueInput.value) || 0, getCurrentUnit());
        });

        decreaseBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const unit = getCurrentUnit();
          const buttonStep = this.bytesToUnit(this.sliderConfig.buttonStep * 1024 * 1024, unit);
          const currentValue = parseInt(valueInput.value) || 0;
          updateTypeValue(currentValue - buttonStep, unit);
        });

        increaseBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const unit = getCurrentUnit();
          const buttonStep = this.bytesToUnit(this.sliderConfig.buttonStep * 1024 * 1024, unit);
          const currentValue = parseInt(valueInput.value) || 0;
          updateTypeValue(currentValue + buttonStep, unit);
        });
      }
    });
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
        instance: null,
      };
    }

    let html = "";
    for (const [id, data] of Object.entries(this.uploaderInstances)) {
      const isActive = id === this.activeUploaderId;
      html += `
        <div class="fu-config-builder-uploader-tab ${
          isActive ? "active" : ""
        }" data-uploader-id="${id}">
          <span class="fu-config-builder-uploader-tab-name" data-uploader-id="${id}">${
        data.name
      }</span>
          <div class="fu-config-builder-uploader-tab-actions">
            <button class="fu-config-builder-uploader-tab-duplicate" data-uploader-id="${id}" data-tooltip-text="Duplicate uploader" data-tooltip-position="bottom">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
            </button>
            ${
              Object.keys(this.uploaderInstances).length > 1
                ? `
              <button class="fu-config-builder-uploader-tab-close" data-uploader-id="${id}" data-tooltip-text="Remove uploader" data-tooltip-position="bottom">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            `
                : ""
            }
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

    for (const [key, def] of Object.entries(options)) {
      html += this.renderOption(key, def);
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
      ? `<span class="fu-config-builder-depends-on" data-tooltip-text="Requires: ${def.dependsOn}" data-tooltip-position="top">
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
        content = this.renderSelectWithInput(key, def, isDisabled, dependencyIndicator);
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
      default:
        return "";
    }

    // Wrap with dependency container if has dependency or showWhen
    if (def.dependsOn || def.showWhen) {
      const hiddenClass = def.showWhen && !def.showWhen(this.config) ? "fu-config-builder-hidden" : "";
      return `<div class="fu-config-builder-option-wrapper ${dependencyClass} ${hiddenClass}" data-depends-on="${def.dependsOn || ""}" data-option-key="${key}">${content}</div>`;
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
          <code>${key}</code>
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
          <code>${key}</code>
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
    return this.unitToBytes(this.sliderConfig.sliderStep, this.sliderConfig.unit);
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
          <code>${key}</code>
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
   * Render select dropdown with custom input option
   * Allows users to either select from presets or enter a custom value
   */
  renderSelectWithInput(key, def, isDisabled = false, dependencyIndicator = "") {
    const currentValue = this.config[key];
    const isCustomValue = currentValue !== null && !def.options.some(opt => opt.value === currentValue);

    // Add "Custom" option if not already present
    const optionsWithCustom = [
      ...def.options,
      { value: "__custom__", label: "Custom..." }
    ];

    const options = optionsWithCustom
      .map(
        (opt) =>
          `<option value="${opt.value}" ${
            (opt.value === "__custom__" && isCustomValue) ||
            (!isCustomValue && this.config[key] === opt.value) ? "selected" : ""
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
        <option value="bytes" ${inputUnit === "bytes" ? "selected" : ""}>bytes</option>
        <option value="KB" ${inputUnit === "KB" ? "selected" : ""}>KB</option>
        <option value="MB" ${inputUnit === "MB" ? "selected" : ""}>MB</option>
        <option value="GB" ${inputUnit === "GB" ? "selected" : ""}>GB</option>
      `;
    } else if (def.formatType === "bitrate") {
      unitOptions = `
        <option value="bps" ${inputUnit === "bps" ? "selected" : ""}>bps</option>
        <option value="Kbps" ${inputUnit === "Kbps" ? "selected" : ""}>Kbps</option>
        <option value="Mbps" ${inputUnit === "Mbps" ? "selected" : ""}>Mbps</option>
      `;
    }

    return `
      <div class="fu-config-builder-group ${isDisabled ? "disabled" : ""}">
        <label class="fu-config-builder-label">
          ${def.label}
          ${dependencyIndicator}
          <code>${key}</code>
        </label>
        <div class="fu-config-builder-select-with-input" data-option="${key}" data-type="selectWithInput" data-format-type="${def.formatType || ""}">
          <select class="fu-config-builder-select" data-role="preset" ${isDisabled ? "disabled" : ""}>
            ${options}
          </select>
          <input type="number" class="fu-config-builder-input fu-config-builder-custom-value ${isCustomValue ? "visible" : ""}" data-role="custom-value"
                 value="${inputValue}" placeholder="Value" ${isDisabled ? "disabled" : ""}
                 min="0" step="any">
          ${unitOptions ? `<select class="fu-config-builder-select fu-config-builder-custom-unit ${isCustomValue ? "visible" : ""}" data-role="custom-unit" ${isDisabled ? "disabled" : ""}>${unitOptions}</select>` : ""}
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
              ${!isAvailable ? 'title="Enable this option in Media Capture settings first"' : ""}>${label}</span>`;
      })
      .join("");

    return `
      <div class="fu-config-builder-group ${isDisabled ? "disabled" : ""}">
        <label class="fu-config-builder-label">
          ${def.label}
          ${dependencyIndicator}
          <code>${key}</code>
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
          <code>${key}</code>
        </label>
        <div class="fu-config-builder-hint" style="margin-bottom: 12px;">${def.hint}</div>
        <div class="fu-config-builder-type-sliders" data-option="${key}" data-type="typeSizeSlider">
    `;

    for (const type of types) {
      const bytes = values[type] || 0;
      const { value: displayValue, unit: displayUnit } =
        bytes > 0 ? this.bytesToBestUnit(bytes) : { value: 0, unit: this.sliderConfig.unit };
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
            <span class="fu-config-builder-type-slider-title">${this.capitalizeFirst(type)}</span>
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
          <code>${key}</code>
        </label>
        <div class="fu-config-builder-hint" style="margin-bottom: 12px;">${def.hint}</div>
        <div class="fu-config-builder-type-sliders" data-option="${key}" data-type="typeCountSlider">
    `;

    for (const type of types) {
      const value = values[type] || 0;
      const typeIcon = this.getFileTypeIcon(type);

      html += `
        <div class="fu-config-builder-type-slider-block" data-type-key="${type}">
          <div class="fu-config-builder-type-slider-header">
            ${typeIcon}
            <span class="fu-config-builder-type-slider-title">${this.capitalizeFirst(type)}</span>
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
   */
  getCategoryIcon(icon) {
    const icons = {
      // URL Configuration - Link icon
      link: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>',
      // File Size Limits - Ruler/scale icon
      size: '<svg viewBox="0 0 512 512" fill="currentColor"><path d="M177.9 494.1c-18.7 18.7-49.1 18.7-67.9 0L17.9 402.1c-18.7-18.7-18.7-49.1 0-67.9l50.7-50.7 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 41.4-41.4 48 48c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-48-48 50.7-50.7c18.7-18.7 49.1-18.7 67.9 0l92.1 92.1c18.7 18.7 18.7 49.1 0 67.9L177.9 494.1z"/></svg>',
      // Per-Type Limits - Layers/stack icon
      layers:
        '<svg viewBox="0 0 576 512" fill="currentColor"><path d="M264.5 5.2c14.9-6.9 32.1-6.9 47 0l218.6 101c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L45.9 149.8C37.4 145.8 32 137.3 32 128s5.4-17.9 13.9-21.8L264.5 5.2zM476.9 209.6l53.2 24.6c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L45.9 277.8C37.4 273.8 32 265.3 32 256s5.4-17.9 13.9-21.8l53.2-24.6 152 70.2c23.4 10.8 50.4 10.8 73.8 0l152-70.2zm-152 198.2l152-70.2 53.2 24.6c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L45.9 405.8C37.4 401.8 32 393.3 32 384s5.4-17.9 13.9-21.8l53.2-24.6 152 70.2c23.4 10.8 50.4 10.8 73.8 0z"/></svg>',
      // Allowed File Types - File icon
      file: '<svg viewBox="0 0 384 512" fill="currentColor"><path d="M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 288c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128z"/></svg>',
      // Upload Behavior - Gear/cog icon
      settings:
        '<svg viewBox="0 0 512 512" fill="currentColor"><path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>',
      // Limits Display - Eye icon
      eye: '<svg viewBox="0 0 576 512" fill="currentColor"><path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"/></svg>',
      // Alert Notifications - Bell icon
      bell: '<svg viewBox="0 0 448 512" fill="currentColor"><path d="M224 0c-17.7 0-32 14.3-32 32l0 19.2C119 66 64 130.6 64 208l0 18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416l384 0c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8l0-18.8c0-77.4-55-142-128-156.8L256 32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3l-64 0-64 0c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7z"/></svg>',
      // Buttons - Square with plus
      button:
        '<svg viewBox="0 0 448 512" fill="currentColor"><path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM200 344l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/></svg>',
      // Media Capture - Camera icon
      camera:
        '<svg viewBox="0 0 512 512" fill="currentColor"><path d="M149.1 64.8L138.7 96 64 96C28.7 96 0 124.7 0 160L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64l-74.7 0L362.9 64.8C356.4 45.2 338.1 32 317.4 32L194.6 32c-20.7 0-39 13.2-45.5 32.8zM256 192a96 96 0 1 1 0 192 96 96 0 1 1 0-192z"/></svg>',
      // Carousel Preview - Image/photo icon
      image:
        '<svg viewBox="0 0 512 512" fill="currentColor"><path d="M0 96C0 60.7 28.7 32 64 32l384 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6l96 0 32 0 208 0c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7l-120-176zM112 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"/></svg>',
      // MIME Type Validation - Shield with check
      shield:
        '<svg viewBox="0 0 512 512" fill="currentColor"><path d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0zm0 66.8l0 378.1C394 378 431.1 230.1 432 141.4L256 66.8z"/></svg>',
      // Sun icon - Light mode
      sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
      // Moon icon - Dark mode
      moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
      // Palette icon - Colors
      palette:
        '<svg viewBox="0 0 512 512" fill="currentColor"><path d="M512 256c0 .9 0 1.8 0 2.7c-.4 36.5-33.6 61.3-70.1 61.3L344 320c-26.5 0-48 21.5-48 48c0 3.4 .4 6.7 1 9.9c2.1 10.2 6.5 20 10.8 29.9c6.1 13.8 12.1 27.5 12.1 42c0 31.8-21.6 60.7-53.4 62c-3.5 .1-7 .2-10.6 .2C114.6 512 0 397.4 0 256S114.6 0 256 0S512 114.6 512 256zM128 288a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm0-96a32 32 0 1 0 0-64 32 32 0 1 0 0 64zM288 96a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm96 96a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"/></svg>',
      // Check icon
      check:
        '<svg viewBox="0 0 448 512" fill="currentColor"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>',
      // Text/Typography icon
      text: '<svg viewBox="0 0 448 512" fill="currentColor"><path d="M254 52.8C249.3 40.3 237.3 32 224 32s-25.3 8.3-30 20.8L57.8 416L32 416c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-1.8 0 18-48 159.6 0 18 48-1.8 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-25.8 0L254 52.8zM279.8 304l-111.6 0L224 155.1 279.8 304z"/></svg>',
      // Window/Border radius icon
      window:
        '<svg viewBox="0 0 512 512" fill="currentColor"><path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM96 96l320 0c17.7 0 32 14.3 32 32l0 256c0 17.7-14.3 32-32 32L96 416c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32z"/></svg>',
      // Move/Cross-uploader icon
      move: '<svg viewBox="0 0 512 512" fill="currentColor"><path d="M278.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l9.4-9.4L224 224l-114.7 0 9.4-9.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-64 64c-12.5 12.5-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-9.4-9.4L224 288l0 114.7-9.4-9.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l64 64c12.5 12.5 32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-9.4 9.4L288 288l114.7 0-9.4 9.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l64-64c12.5-12.5 12.5-32.8 0-45.3l-64-64c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l9.4 9.4L288 224l0-114.7 9.4 9.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-64-64z"/></svg>',
      // Layout/Display Mode icon - Grid with sidebar
      layout:
        '<svg viewBox="0 0 448 512" fill="currentColor"><path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32l0 320c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32L0 96zM352 352l0-192-96 0 0 192 96 0zM320 128l-256 0 0 256 256 0 0-256z"/></svg>',
    };

    return `<span class="fu-config-builder-category-icon">${
      icons[icon] || icons.settings
    }</span>`;
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
        a.download = "file-uploader-custom.css";
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
      const minLabel = this.element.querySelector("#slider-config-min")?.closest(".fu-config-builder-slider-config-item")?.querySelector("label");
      const maxLabel = this.element.querySelector("#slider-config-max")?.closest(".fu-config-builder-slider-config-item")?.querySelector("label");
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

    // Select with custom input
    this.element
      .querySelectorAll('[data-type="selectWithInput"]')
      .forEach((container) => {
        const optionKey = container.dataset.option;
        const formatType = container.dataset.formatType;
        const presetSelect = container.querySelector('[data-role="preset"]');
        const customValueInput = container.querySelector('[data-role="custom-value"]');
        const customUnitSelect = container.querySelector('[data-role="custom-unit"]');

        // Helper to convert value with unit to base unit (bytes or bps)
        const convertToBaseUnit = (value, unit) => {
          const numValue = parseFloat(value) || 0;
          if (formatType === "size") {
            switch (unit) {
              case "GB": return numValue * 1024 * 1024 * 1024;
              case "MB": return numValue * 1024 * 1024;
              case "KB": return numValue * 1024;
              default: return numValue;
            }
          } else if (formatType === "bitrate") {
            switch (unit) {
              case "Mbps": return numValue * 1000000;
              case "Kbps": return numValue * 1000;
              default: return numValue;
            }
          }
          return numValue;
        };

        // Helper to show/hide custom inputs
        const showCustomInputs = (show) => {
          if (customValueInput) {
            customValueInput.classList.toggle("visible", show);
          }
          if (customUnitSelect) {
            customUnitSelect.classList.toggle("visible", show);
          }
        };

        // Handle preset selection change
        presetSelect.addEventListener("change", () => {
          const selectedValue = presetSelect.value;
          if (selectedValue === "__custom__") {
            // Show custom inputs
            showCustomInputs(true);
            // Set a default value if empty
            if (!customValueInput.value) {
              customValueInput.value = formatType === "bitrate" ? "1" : "10";
              if (customUnitSelect) {
                customUnitSelect.value = formatType === "bitrate" ? "Mbps" : "MB";
              }
            }
            // Update config with custom value
            const unit = customUnitSelect ? customUnitSelect.value : "";
            this.config[optionKey] = convertToBaseUnit(customValueInput.value, unit);
          } else {
            // Hide custom inputs and use preset value
            showCustomInputs(false);
            // Handle null value
            this.config[optionKey] = selectedValue === "null" ? null : parseFloat(selectedValue);
          }
          this.onConfigChange();
        });

        // Handle custom value input change
        if (customValueInput) {
          customValueInput.addEventListener("input", () => {
            const unit = customUnitSelect ? customUnitSelect.value : "";
            this.config[optionKey] = convertToBaseUnit(customValueInput.value, unit);
            this.onConfigChange();
          });
        }

        // Handle custom unit change
        if (customUnitSelect) {
          customUnitSelect.addEventListener("change", () => {
            this.config[optionKey] = convertToBaseUnit(customValueInput.value, customUnitSelect.value);
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
    const pertypeSliderUnit = this.element.querySelector("#pertype-slider-config-unit");
    const pertypeSliderMin = this.element.querySelector("#pertype-slider-config-min");
    const pertypeSliderMax = this.element.querySelector("#pertype-slider-config-max");
    const pertypeSliderStep = this.element.querySelector("#pertype-slider-config-step");
    const pertypeSliderBtnStep = this.element.querySelector("#pertype-slider-config-btn-step");

    // Helper to update pertype label text when unit changes
    const updatePertypeSliderConfigLabels = () => {
      const minLabel = this.element.querySelector("#pertype-slider-config-min")?.closest(".fu-config-builder-slider-config-item")?.querySelector("label");
      const maxLabel = this.element.querySelector("#pertype-slider-config-max")?.closest(".fu-config-builder-slider-config-item")?.querySelector("label");
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
        this.sliderConfig.buttonStep = parseInt(pertypeSliderBtnStep.value) || 10;
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
        const minValue = this.bytesToUnit(this.getSliderMinBytes(), currentUnit);
        const maxValue = this.bytesToUnit(this.getSliderMaxBytes(), currentUnit);
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
        .querySelectorAll('.fu-config-builder-size-slider[data-type="sizeSlider"] .fu-config-builder-unit-dropdown')
        .forEach((dropdown) => {
          if (dropdown.value !== newUnit) {
            dropdown.value = newUnit;
            // Reset the slider value to 0 when unit changes
            const container = dropdown.closest(".fu-config-builder-size-slider");
            const slider = container?.querySelector(".fu-config-builder-slider-input");
            const valueInput = container?.querySelector(".fu-config-builder-slider-value-input");
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
        .querySelectorAll('.fu-config-builder-filetype-card .fu-config-builder-unit-dropdown-sm')
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
    for (const [categoryKey, category] of Object.entries(this.optionDefinitions)) {
      for (const [optionKey, def] of Object.entries(category.options)) {
        if (def.showWhen && typeof def.showWhen === "function") {
          const wrapper = this.element.querySelector(`[data-option-key="${optionKey}"]`);
          if (wrapper) {
            const shouldShow = def.showWhen(this.config);
            if (shouldShow) {
              wrapper.classList.remove("fu-config-builder-hidden");
              wrapper.classList.remove("fu-config-builder-disabled");
              // Enable inputs inside
              wrapper.querySelectorAll("input, select").forEach((el) => {
                el.disabled = false;
              });
              wrapper.querySelectorAll(".fu-config-builder-group").forEach((el) => {
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
            container.querySelectorAll(".fu-config-builder-tag").forEach((tag) => {
              const value = tag.dataset.value;
              const isAvailable = availableOptions.includes(value);

              if (isAvailable) {
                tag.classList.remove("disabled");
                tag.removeAttribute("title");
              } else {
                tag.classList.add("disabled");
                tag.classList.remove("selected"); // Deselect if disabled
                tag.setAttribute("title", "Enable this option in Media Capture settings first");
              }
            });

            // Update config to remove any selected values that are no longer available
            const validSelected = currentSelected.filter((s) => availableOptions.includes(s));
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
    const modalTabBtn = this.element.querySelector(".fu-config-builder-modal-tab");

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
      (data) => data.config.displayMode === "modal-minimal" || data.config.displayMode === "modal-detailed"
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
        if (displayMode !== "modal-minimal" && displayMode !== "modal-detailed") {
          return;
        }
        // Render specific modal section (html, css, or js)
        const section = type.replace("modal-", "");
        html += this.renderModalCodeSection(id, data, section);
        return;
      }

      const isActive = id === this.activeUploaderId;
      let code;
      if (type === "js") {
        code = this.generateSingleUploaderJsCode(id, data);
      } else if (type === "php") {
        code = this.generateSingleUploaderPhpCode(id, data);
      }

      const highlightedCode = type === "js"
        ? this.highlightJsCode(code)
        : this.highlightPhpCode(code);

      // Generate filename from uploader name
      const filename =
        data.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || `uploader`;

      const fileExt = type === "js" ? "js" : "php";

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
              <div class="fu-config-builder-code-actions">
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
          </div>
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

    const modeBadge = `<span class="fu-config-builder-mode-badge">${isMinimal ? "Minimal" : "Detailed"} Mode</span>`;
    const editingBadge = isActive ? ' <span class="fu-config-builder-code-badge">Editing</span>' : "";

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
      <div class="fu-config-builder-code-card ${isActive ? "active" : ""}" data-uploader-id="${id}" data-modal-section="${section}">
        <div class="fu-config-builder-code">
          <div class="fu-config-builder-code-header">
            <span class="fu-config-builder-code-title">${data.name}${editingBadge} ${modeBadge}</span>
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
    const mediaButtons = this.filterEnabledMediaButtons(config.modalMediaButtons || [], config);

    const modalId = `${varName}Modal`;
    const containerId = `${varName}Container`;
    const isMinimal = displayMode === "modal-minimal";

    const iconSvg = this.getModalButtonIconSvg(buttonIcon);

    return this.generateModalHtml(varName, modalId, containerId, buttonText, iconSvg, modalTitle, modalSize, bootstrapVersion, isMinimal, mediaButtons);
  }

  /**
   * Generate only the JS portion of modal code (without HTML/CSS)
   */
  generateModalJsOnly(varName, config, changedConfig) {
    const displayMode = config.displayMode;
    const bootstrapVersion = config.bootstrapVersion || "5";
    const isMinimal = displayMode === "modal-minimal";
    // Filter media buttons to only include those whose capture option is enabled
    const mediaButtons = this.filterEnabledMediaButtons(config.modalMediaButtons || [], config);
    const enableModalDropZone = config.enableModalDropZone !== false;

    const modalId = `${varName}Modal`;
    const containerId = `${varName}Container`;

    return this.generateModalJs(varName, modalId, containerId, changedConfig, bootstrapVersion, isMinimal, mediaButtons, enableModalDropZone);
  }

  /**
   * Highlight HTML code with syntax coloring
   */
  highlightHtmlCode(code) {
    // Escape HTML entities first
    let escaped = this.escapeHtml(code);

    // Highlight HTML tags
    escaped = escaped.replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="fu-config-builder-code-tag">$2</span>');

    // Highlight attributes
    escaped = escaped.replace(/\s([\w-]+)=/g, ' <span class="fu-config-builder-code-attr">$1</span>=');

    // Highlight attribute values
    escaped = escaped.replace(/=(&quot;[^&]*&quot;)/g, '=<span class="fu-config-builder-code-string">$1</span>');

    // Highlight comments
    escaped = escaped.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="fu-config-builder-code-comment">$1</span>');

    return escaped;
  }

  /**
   * Highlight CSS code with syntax coloring
   */
  highlightCssCode(code) {
    // Escape HTML entities first
    let escaped = this.escapeHtml(code);

    // Highlight selectors (before {)
    escaped = escaped.replace(/^([^{]+)\{/gm, '<span class="fu-config-builder-code-selector">$1</span>{');

    // Highlight properties
    escaped = escaped.replace(/\s+([\w-]+):/g, '\n  <span class="fu-config-builder-code-property">$1</span>:');

    // Highlight values (after :)
    escaped = escaped.replace(/:\s*([^;]+);/g, ': <span class="fu-config-builder-code-value">$1</span>;');

    // Highlight comments
    escaped = escaped.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="fu-config-builder-code-comment">$1</span>');

    return escaped;
  }

  /**
   * Attach event handlers to code card buttons
   */
  attachCodeCardEvents(container, type) {
    // Standard copy buttons (for JS and PHP tabs)
    container.querySelectorAll('[data-action="copy"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        const uploaderId = btn.dataset.uploaderId;
        const uploaderData = this.uploaderInstances[uploaderId];
        let code;
        if (type === "js") {
          code = this.generateSingleUploaderJsCode(uploaderId, uploaderData);
        } else if (type === "php") {
          code = this.generateSingleUploaderPhpCode(uploaderId, uploaderData);
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
        let code, ext, mimeType;
        if (type === "js") {
          code = this.generateSingleUploaderJsCode(uploaderId, uploaderData);
          ext = "js";
          mimeType = "text/javascript";
        } else if (type === "php") {
          code = this.generateSingleUploaderPhpCode(uploaderId, uploaderData);
          ext = "php";
          mimeType = "text/php";
        }
        this.downloadFile(code, `${filename}-config.${ext}`, mimeType);
      });
    });

    // Section-specific copy buttons (for Modal tab)
    container.querySelectorAll('[data-action="copy-section"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        const uploaderId = btn.dataset.uploaderId;
        const section = btn.dataset.section;
        const uploaderData = this.uploaderInstances[uploaderId];
        const code = this.getModalSectionCode(uploaderId, uploaderData, section);
        this.copyToClipboard(code, btn);
      });
    });

    // Section-specific download buttons (for Modal tab)
    container.querySelectorAll('[data-action="download-section"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        const uploaderId = btn.dataset.uploaderId;
        const section = btn.dataset.section;
        const filename = btn.dataset.filename;
        const ext = btn.dataset.ext;
        const uploaderData = this.uploaderInstances[uploaderId];
        const code = this.getModalSectionCode(uploaderId, uploaderData, section);
        const mimeType = section === "js" ? "text/javascript" : section === "css" ? "text/css" : "text/html";
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
   */
  generateSingleUploaderJsCode(id, data) {
    const changedConfig = this.getChangedConfig(data.config);
    const displayMode = data.config.displayMode || "inline";

    // Generate variable name from uploader name
    const varName =
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "") || "uploader";

    // For modal modes, use the container ID as selector
    const containerId = displayMode === "modal-minimal" || displayMode === "modal-detailed"
      ? `${varName}Container`
      : varName;

    // Group the changed config by category
    const groupedConfig = this.groupChangedConfig(changedConfig);
    const hasChanges = Object.keys(changedConfig).length > 0;

    // Generate defaults comment header
    let code = this.generateDefaultsComment(changedConfig, "js");

    if (!hasChanges) {
      code += `const ${varName} = new FileUploader('#${containerId}');`;
      return code;
    }

    code += `const ${varName} = new FileUploader('#${containerId}', {\n`;

    // Output grouped config
    const groupKeys = ConfigBuilder.GROUP_ORDER.filter(g => groupedConfig[g]);
    groupKeys.forEach((groupKey, groupIndex) => {
      const groupTitle = ConfigBuilder.GROUP_TITLES[groupKey] || groupKey;
      const groupEntries = Object.entries(groupedConfig[groupKey]);
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
      const group = ConfigBuilder.OPTION_TO_GROUP[key] || "other";
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
      comment += " * Default configuration values for reference (server-relevant options):\n";
      comment += " * [\n";

      ConfigBuilder.GROUP_ORDER.forEach(groupKey => {
        // Skip non-PHP relevant groups
        if (!phpRelevantGroups.includes(groupKey)) return;
        if (!groupedDefaults[groupKey]) return;

        // Filter to only PHP-relevant keys within this group
        const phpKeysInGroup = Object.entries(groupedDefaults[groupKey])
          .filter(([key]) => phpRelevantKeys.includes(key));

        // Skip group if no PHP-relevant keys
        if (phpKeysInGroup.length === 0) return;

        const groupTitle = ConfigBuilder.PHP_GROUP_TITLES[groupKey] || ConfigBuilder.GROUP_TITLES[groupKey] || groupKey;
        comment += ` *   // ${groupTitle}\n`;
        comment += ` *   '${groupKey}' => [\n`;

        phpKeysInGroup.forEach(([key, value]) => {
          const formattedValue = this.formatDefaultValueForComment(key, value, language);
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

      ConfigBuilder.GROUP_ORDER.forEach(groupKey => {
        if (!groupedDefaults[groupKey]) return;

        const groupTitle = ConfigBuilder.GROUP_TITLES[groupKey] || groupKey;
        comment += ` *   // ${groupTitle}\n`;
        comment += ` *   ${groupKey}: {\n`;

        Object.entries(groupedDefaults[groupKey]).forEach(([key, value]) => {
          const formattedValue = this.formatDefaultValueForComment(key, value, language);
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
    const mediaButtons = this.filterEnabledMediaButtons(config.modalMediaButtons || [], config);
    const enableModalDropZone = config.enableModalDropZone !== false;

    const modalId = `${varName}Modal`;
    const containerId = `${varName}Container`;
    const isMinimal = displayMode === "modal-minimal";

    // Button icon SVG
    const iconSvg = this.getModalButtonIconSvg(buttonIcon);

    let code = `// ============================================\n`;
    code += `// ${data.name} - Modal Mode (${isMinimal ? "Minimal" : "Detailed"} Preview)\n`;
    code += `// ============================================\n\n`;

    // CSS Section (only once per mode type)
    code += `/* ----- CSS (add to your stylesheet) ----- */\n\n`;
    code += this.generateModalCss(isMinimal, mediaButtons);

    // HTML Section
    code += `\n\n/* ----- HTML ----- */\n\n`;
    code += this.generateModalHtml(varName, modalId, containerId, buttonText, iconSvg, modalTitle, modalSize, bootstrapVersion, isMinimal, mediaButtons);

    // JS Section
    code += `\n\n/* ----- JavaScript ----- */\n\n`;
    code += this.generateModalJs(varName, modalId, containerId, changedConfig, bootstrapVersion, isMinimal, mediaButtons, enableModalDropZone);

    return code;
  }

  /**
   * Generate CSS for modal preview styles
   */
  generateModalCss(isMinimal, mediaButtons = []) {
    const hasMediaButtons = mediaButtons && mediaButtons.length > 0;

    // Common media button CSS
    const mediaButtonCss = hasMediaButtons ? `
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
` : '';

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
      upload: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
      plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
      folder: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>',
      none: "",
    };
    return icons[icon] || icons.upload;
  }

  /**
   * Generate modal HTML markup
   */
  generateModalHtml(varName, modalId, containerId, buttonText, iconSvg, modalTitle, modalSize, bsVersion, isMinimal, mediaButtons = []) {
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
        html += `    <button type="button" id="${varName}Btn" class="btn btn-primary" data-${bsVersion === "3" ? "toggle" : "bs-toggle"}="modal" data-${bsVersion === "3" ? "target" : "bs-target"}="#${modalId}">\n`;
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
        html += `  <button type="button" id="${varName}Btn" class="btn btn-primary" data-${bsVersion === "3" ? "toggle" : "bs-toggle"}="modal" data-${bsVersion === "3" ? "target" : "bs-target"}="#${modalId}">\n`;
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
        html += `  <button type="button" id="${varName}Btn" class="btn btn-primary" data-${bsVersion === "3" ? "toggle" : "bs-toggle"}="modal" data-${bsVersion === "3" ? "target" : "bs-target"}="#${modalId}">\n`;
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
        html += `<button type="button" id="${varName}Btn" class="btn btn-primary" data-${bsVersion === "3" ? "toggle" : "bs-toggle"}="modal" data-${bsVersion === "3" ? "target" : "bs-target"}="#${modalId}">\n`;
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
      html += `  <a class="edit-files-link" data-${bsVersion === "3" ? "toggle" : "bs-toggle"}="modal" data-${bsVersion === "3" ? "target" : "bs-target"}="#${modalId}">\n`;
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
  generateModalJs(varName, modalId, containerId, changedConfig, bsVersion, isMinimal, mediaButtons = [], enableModalDropZone = true) {
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
    const modalEvent = bsVersion === "3" ? "hidden.bs.modal" : "hidden.bs.modal";
    code += `// Update preview when modal closes\n`;
    code += `document.getElementById('${modalId}').addEventListener('${modalEvent}', update${this.capitalizeFirst(varName)}Preview);\n\n`;

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
      if (mediaButtons.includes('screenshot')) {
        code += `      case 'screenshot':\n`;
        code += `        // Capture screenshot using FileUploader's built-in method\n`;
        code += `        ${varName}.captureScreenshot();\n`;
        code += `        break;\n`;
      }
      if (mediaButtons.includes('video')) {
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
      if (mediaButtons.includes('audio')) {
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
      if (mediaButtons.includes('fullpage')) {
        code += `      case 'fullpage':\n`;
        code += `        // Capture full page screenshot\n`;
        code += `        ${varName}.captureFullPage();\n`;
        code += `        break;\n`;
      }
      if (mediaButtons.includes('region')) {
        code += `      case 'region':\n`;
        code += `        // Capture selected region screenshot\n`;
        code += `        ${varName}.captureRegion();\n`;
        code += `        break;\n`;
      }
      code += `    }\n`;
      code += `  });\n`;
      code += `});\n`;

      // Add listeners for recording state changes
      if (mediaButtons.includes('video') || mediaButtons.includes('audio')) {
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
   */
  generateSingleUploaderPhpCode(id, data) {
    const changedConfig = this.getChangedConfig(data.config, true); // server-only

    // Generate defaults comment header
    const defaultsComment = this.generateDefaultsComment(changedConfig, "php");

    let code = `<?php\n/**\n * ${data.name} - Server Configuration\n * Generated by Config Builder\n */\n\n`;

    // Add defaults reference comment if there are changes
    if (defaultsComment) {
      code += defaultsComment;
    }

    // Group the changed config by category
    const groupedConfig = this.groupChangedConfig(changedConfig);
    const hasChanges = Object.keys(changedConfig).length > 0;

    if (!hasChanges) {
      code += `return [];\n`;
      return code;
    }

    code += `return [\n`;

    // Output grouped config (only PHP-relevant groups)
    const phpRelevantGroups = ["urls", "limits", "perTypeLimits", "fileTypes"];
    const groupKeys = phpRelevantGroups.filter(g => groupedConfig[g]);
    groupKeys.forEach((groupKey, groupIndex) => {
      const groupTitle = ConfigBuilder.PHP_GROUP_TITLES[groupKey] || ConfigBuilder.GROUP_TITLES[groupKey] || groupKey;
      const groupEntries = Object.entries(groupedConfig[groupKey]);
      const isLastGroup = groupIndex === groupKeys.length - 1;

      code += `    // ${groupTitle}\n`;
      code += `    '${groupKey}' => [\n`;

      groupEntries.forEach(([key, value], index) => {
        const comma = index < groupEntries.length - 1 ? "," : "";
        const phpValue = this.jsValueToPhp(value, key);
        code += `        '${key}' => ${phpValue}${comma}\n`;
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
    if (iconType === 'none') return '';
    const icons = {
      upload: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
      plus: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
      folder: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>'
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
    chevron_right: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor"><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>`
  };

  static MEDIA_CAPTURE_TITLES = {
    screenshot: "Capture Screenshot",
    video: "Record Screen",
    audio: "Record Audio",
    fullpage: "Capture Full Page",
    region: "Capture Region"
  };

  /**
   * Filter media buttons to only include those whose capture option is enabled
   * @param {string[]} buttons - Array of button types
   * @param {Object} config - The config object
   * @returns {string[]} Filtered array of button types
   */
  filterEnabledMediaButtons(buttons, config) {
    if (!buttons || buttons.length === 0) return [];
    return buttons.filter(btn => {
      if (btn === 'screenshot') return config.enableScreenCapture !== false;
      if (btn === 'fullpage') return config.enableFullPageCapture !== false;
      if (btn === 'region') return config.enableRegionCapture !== false;
      if (btn === 'video') return config.enableVideoRecording !== false;
      if (btn === 'audio') return config.enableAudioRecording !== false;
      return false;
    });
  }

  /**
   * Generate media capture buttons HTML with expandable toggle
   * Uses file-uploader-capture-btn class for consistent styling with FileUploader
   * @param {string[]} buttonTypes - Array of button types: 'screenshot', 'video', 'audio'
   * @param {string} uploaderId - The uploader ID for data attribute
   * @returns {string} HTML string for the expandable media capture buttons container
   */
  getMediaCaptureButtonsHtml(buttonTypes, uploaderId) {
    if (!buttonTypes || buttonTypes.length === 0) return '';

    const buttons = buttonTypes.map(btnType => {
      const icon = ConfigBuilder.MEDIA_CAPTURE_ICONS[btnType];
      const title = ConfigBuilder.MEDIA_CAPTURE_TITLES[btnType];
      if (!icon) return '';

      return `<button type="button" class="file-uploader-capture-btn has-tooltip" data-capture-type="${btnType}" data-uploader-id="${uploaderId}" data-tooltip="${title}" data-tooltip-position="top">${icon}</button>`;
    }).join('');

    const chevronIcon = ConfigBuilder.MEDIA_CAPTURE_ICONS.chevron_right;

    return `
      <div class="file-uploader-capture-expandable" data-uploader-id="${uploaderId}">
        <button type="button" class="file-uploader-capture-toggle has-tooltip" data-uploader-id="${uploaderId}" data-tooltip="Media Capture" data-tooltip-position="top">
          <span class="toggle-chevron">${chevronIcon}</span>
        </button>
        <div class="file-uploader-capture-buttons-wrapper">
          <div class="file-uploader-capture-container" data-uploader-id="${uploaderId}">${buttons}</div>
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

    const buttons = container.querySelectorAll('.file-uploader-capture-btn[data-uploader-id="' + uploaderId + '"]');

    buttons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const captureType = btn.dataset.captureType;

        const uploaderData = this.uploaderInstances[uploaderId];
        if (!uploaderData || !uploaderData.instance) {
          return;
        }

        const uploader = uploaderData.instance;

        try {
          if (captureType === 'screenshot') {
            if (typeof uploader.captureScreenshot === 'function') {
              await uploader.captureScreenshot();
              this.updatePreviewFileInfo(uploaderId);
            }
          } else if (captureType === 'video') {
            if (typeof uploader.toggleVideoRecording === 'function') {
              await uploader.toggleVideoRecording();
              this.updatePreviewFileInfo(uploaderId);
            }
          } else if (captureType === 'audio') {
            if (typeof uploader.toggleAudioRecording === 'function') {
              await uploader.toggleAudioRecording();
              this.updatePreviewFileInfo(uploaderId);
            }
          } else if (captureType === 'fullpage') {
            if (typeof uploader.captureFullPage === 'function') {
              await uploader.captureFullPage();
              this.updatePreviewFileInfo(uploaderId);
            }
          } else if (captureType === 'region') {
            if (typeof uploader.captureRegion === 'function') {
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
    const toggleBtn = container.querySelector('.file-uploader-capture-toggle[data-uploader-id="' + uploaderId + '"]');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const expandable = toggleBtn.closest('.file-uploader-capture-expandable');
      if (expandable) {
        expandable.classList.toggle('expanded');
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

    const wrapper = document.querySelector(`[data-uploader-wrapper="${uploaderId}"]`);
    if (!wrapper) return;

    const displayMode = uploaderData.config?.displayMode || 'inline';
    const isMinimal = displayMode === 'modal-minimal';

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
      console.warn('[ConfigBuilder] Could not find previewContainer for observer:', uploaderId);
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
      attributeFilter: ['class', 'data-status'] // Watch for status changes like upload complete
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
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // Handle empty state (all files deleted)
    if (fileCount === 0) {
      if (isMinimal) {
        const badge = wrapper.querySelector(`[data-file-badge="${uploaderId}"]`);
        if (badge) {
          badge.classList.remove('has-files');
          badge.innerHTML = `<span class="badge-text">No files selected</span>`;
        }
      } else {
        const summary = wrapper.querySelector(`[data-file-summary="${uploaderId}"]`);
        if (summary) {
          summary.classList.remove('has-files');
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
    files.forEach(file => {
      totalSize += file.size || 0;
    });

    if (isMinimal) {
      // Update minimal badge
      const badge = wrapper.querySelector(`[data-file-badge="${uploaderId}"]`);
      if (badge) {
        badge.classList.add('has-files');
        badge.innerHTML = `
          <span class="badge-count">${fileCount}</span> file${fileCount !== 1 ? 's' : ''}
          <span class="badge-separator">|</span>
          <span class="badge-size">${formatSize(totalSize)}</span>
        `;

        // Add pulse animation when files are added
        if (filesAdded) {
          badge.classList.remove('file-added-pulse');
          // Force reflow to restart animation
          void badge.offsetWidth;
          badge.classList.add('file-added-pulse');
        }
      }
    } else {
      // Update detailed summary
      const summary = wrapper.querySelector(`[data-file-summary="${uploaderId}"]`);
      if (summary) {
        // Group files by type with icons
        const typeConfig = {
          'Images': { icon: 'image', color: '#8b5cf6' },
          'Videos': { icon: 'video', color: '#ef4444' },
          'Audio': { icon: 'audio', color: '#f59e0b' },
          'Documents': { icon: 'document', color: '#3b82f6' },
          'Archives': { icon: 'archive', color: '#6366f1' },
          'Other': { icon: 'other', color: '#6b7280' }
        };

        const typeGroups = {};
        files.forEach(file => {
          const ext = (file.name || '').split('.').pop().toLowerCase();
          let type = 'Other';
          if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) type = 'Images';
          else if (['mp4', 'webm', 'avi', 'mov', 'mkv'].includes(ext)) type = 'Videos';
          else if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext)) type = 'Audio';
          else if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) type = 'Documents';
          else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) type = 'Archives';

          if (!typeGroups[type]) typeGroups[type] = 0;
          typeGroups[type]++;
        });

        const typeIcons = {
          'Images': '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
          'Videos': '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>',
          'Audio': '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
          'Documents': '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>',
          'Archives': '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/></svg>',
          'Other': '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M13 2v7h7"/></svg>'
        };

        const typeBadges = Object.entries(typeGroups)
          .map(([type, count]) => {
            const config = typeConfig[type] || typeConfig['Other'];
            return `
              <div class="summary-type">
                <span class="type-icon icon-${config.icon}">${typeIcons[type] || typeIcons['Other']}</span>
                <span class="type-name">${type}</span>
                <span class="type-count">${count}</span>
              </div>
            `;
          })
          .join('');

        summary.classList.add('has-files');
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
                <span class="stat-label">file${fileCount !== 1 ? 's' : ''}</span>
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
          summary.classList.remove('file-added-pulse');
          // Force reflow to restart animation
          void summary.offsetWidth;
          summary.classList.add('file-added-pulse');
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
      stringPlaceholders.push(`<span class="code-string">${displayMatch}</span>`);
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
  static OPTION_TO_GROUP = {
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
  static GROUP_TITLES = {
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
  static GROUP_ORDER = [
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
   * Group changed config options by their category
   * @param {Object} changedConfig - Flat changed config object
   * @returns {Object} - Config grouped by category
   */
  groupChangedConfig(changedConfig) {
    const grouped = {};

    for (const [key, value] of Object.entries(changedConfig)) {
      const group = ConfigBuilder.OPTION_TO_GROUP[key] || "other";
      if (!grouped[group]) {
        grouped[group] = {};
      }
      grouped[group][key] = value;
    }

    return grouped;
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

      const groupKeys = ConfigBuilder.GROUP_ORDER.filter(g => groupedConfig[g]);

      if (groupKeys.length === 0) {
        code += `const ${varName} = new FileUploader('#${varName}');\n`;
      } else {
        code += `const ${varName} = new FileUploader('#${varName}', {\n`;

        groupKeys.forEach((groupKey, groupIndex) => {
          const groupOptions = groupedConfig[groupKey];
          const groupTitle = ConfigBuilder.GROUP_TITLES[groupKey] || groupKey;
          const isLastGroup = groupIndex === groupKeys.length - 1;

          // Add group comment
          code += `  // ${groupTitle}\n`;
          code += `  ${groupKey}: {\n`;

          const entries = Object.entries(groupOptions);
          entries.forEach(([key, value], index) => {
            const isLastEntry = index === entries.length - 1;
            const comma = isLastEntry ? "" : ",";
            const formattedValue = this.formatJsValue(key, value, "    ", comma);
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
      const groupKeys = phpGroups.filter(g => groupedConfig[g]);

      if (groupKeys.length === 0) {
        // No server-relevant options changed
        code += `        // Using defaults\n`;
      } else {
        groupKeys.forEach((groupKey, groupIndex) => {
          const groupOptions = groupedConfig[groupKey];
          const groupTitle = ConfigBuilder.PHP_GROUP_TITLES[groupKey] || groupKey;
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
    const bitrateKeys = [
      "videoBitsPerSecond",
      "audioBitsPerSecond",
    ];
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
    return JSON.stringify(value, null, 2).replace(/\n/g, `\n${indent}`) + trailingComma;
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
          const isModalMode = currentDisplayMode === "modal-minimal" || currentDisplayMode === "modal-detailed";
          const isMinimalMode = currentDisplayMode === "modal-minimal";
          const wrapperHasModalPreview = existingWrapper.querySelector(".fu-config-builder-modal-preview") !== null;
          const wrapperHasMinimalPreview = existingWrapper.querySelector(".fu-config-builder-modal-minimal-preview") !== null;

          // If display mode type changed (inline <-> modal, or minimal <-> detailed), rebuild the entire wrapper
          // Also rebuild for modal mode when any modal option changes (button text, title, etc.)
          const needsRebuild = (isModalMode !== wrapperHasModalPreview) ||
                               (isModalMode && wrapperHasModalPreview && (isMinimalMode !== wrapperHasMinimalPreview)) ||
                               isModalMode; // Always rebuild for modal mode to reflect option changes

          if (needsRebuild) {
            // Remove the old wrapper and recreate it
            existingWrapper.remove();
            this.createUploaderPreview(previewEl, this.activeUploaderId, activeData);
          } else {
            // Inline mode - just update the container content
            const uploaderContainer = existingWrapper.querySelector(
              ".fu-config-builder-uploader-container"
            );
            if (uploaderContainer) {
              uploaderContainer.innerHTML = "";
              const containerId = `preview-${this.activeUploaderId}-${Date.now()}`;
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
   * Create a single uploader preview with header
   */
  createUploaderPreview(previewEl, id, data) {
    const isActive = id === this.activeUploaderId;
    const containerId = `preview-${id}-${Date.now()}`;
    const displayMode = data.config.displayMode || "inline";
    const isModalMode = displayMode === "modal-minimal" || displayMode === "modal-detailed";

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
      const mediaButtons = this.filterEnabledMediaButtons(data.config.modalMediaButtons || [], data.config);

      // Get the button icon SVG
      const buttonIconSvg = this.getModalButtonIcon(buttonIcon);

      // Generate media capture buttons HTML using the reusable function
      const mediaButtonsHtml = this.getMediaCaptureButtonsHtml(mediaButtons, id);

      wrapper.innerHTML = `
        <div class="fu-config-builder-uploader-header">
          <span class="fu-config-builder-uploader-label">${data.name} <span class="fu-config-builder-mode-badge">${isMinimal ? "Minimal" : "Detailed"} Mode</span></span>
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
          ${isMinimal ? `
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
          ` : `
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
          `}
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
          if (mediaButtons.includes('screenshot')) {
            previewConfig.enableScreenCapture = true;
          }
          if (mediaButtons.includes('video')) {
            previewConfig.enableVideoRecording = true;
          }
          if (mediaButtons.includes('audio')) {
            previewConfig.enableAudioRecording = true;
          }
          if (mediaButtons.includes('fullpage')) {
            previewConfig.enableFullPageCapture = true;
          }
          if (mediaButtons.includes('region')) {
            previewConfig.enableRegionCapture = true;
          }

          // Set external recording toolbar container for video/audio recording
          // This shows recording controls (pause, stop, etc.) next to the media capture buttons
          // Use a selector string so it works even after DOM updates
          previewConfig.externalRecordingToolbarContainer = `.file-uploader-capture-container[data-uploader-id="${id}"]`;
        }

        data.instance = new window.FileUploader(`#${containerId}`, previewConfig);
        data.containerId = containerId;

        // Set up file change observer to auto-update preview info
        this.setupFileChangeObserver(id);
      }

      // Add modal open/close handlers
      const modalOpenBtn = wrapper.querySelector(`[data-modal-id="${modalId}"]`);
      const modal = wrapper.querySelector(`#${modalId}`);
      const modalCloseBtns = wrapper.querySelectorAll(`[data-close-modal="${modalId}"]`);

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
        data.instance = new window.FileUploader(`#${containerId}`, previewConfig);
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
      { selector: ".file-uploader-dropzone", name: "Dropzone" },
      { selector: ".file-uploader-dropzone-icon", name: "Dropzone Icon" },
      { selector: ".file-uploader-dropzone-text", name: "Dropzone Text" },
      { selector: ".file-uploader-hint", name: "Hint" },
      { selector: ".file-uploader-files", name: "Files List" },
      { selector: ".file-uploader-file", name: "File Item" },
      { selector: ".file-uploader-file-preview", name: "File Preview" },
      { selector: ".file-uploader-file-name", name: "File Name" },
      { selector: ".file-uploader-file-size", name: "File Size" },
      { selector: ".file-uploader-btn", name: "Button" },
      { selector: ".file-uploader-progress-bar", name: "Progress Bar" },
      { selector: ".file-uploader-compact-progress", name: "Compact Progress" },
      { selector: ".file-uploader-type-progress", name: "Type Progress" },
      { selector: ".file-uploader-limit-progress", name: "Limit Progress" },
      { selector: ".file-uploader-limits", name: "Limits" },
      { selector: ".file-uploader-limits-summary", name: "Limits Summary" },
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
          const actualComputedValue = computedStyles.getPropertyValue(varName).trim();

          // Use actual computed value if available, otherwise fall back to stored/default
          const currentValue = actualComputedValue || this.styleValues[varName] || def.default;
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
          ? `<code class="fu-config-builder-css-var-source" data-source-var="${v.sourceVar}" data-tooltip-text="Uses ${v.sourceVar}" data-tooltip-position="top">← ${v.sourceVar}</code>`
          : "";

        // If there's a source var, clicking should navigate to it
        const dataSourceAttr = v.sourceVar ? `data-source-var="${v.sourceVar}"` : "";

        html += `
          <div class="fu-config-builder-css-var-item ${
            v.isModified ? "modified" : ""
          }${v.sourceVar ? " has-source" : ""}" data-var-name="${
          v.name
        }" data-section="${sectionKey}" ${dataSourceAttr} data-tooltip-text="${v.sourceVar ? `Uses ${v.sourceVar} - Click to edit source` : "Click to edit in Styles panel"}" data-tooltip-position="top">
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
   */
  refreshAllPreviews() {
    this.updatePreview(true);
  }

  /**
   * Add a new uploader to the preview
   */
  addUploader() {
    // Save current config and preset first
    if (
      this.activeUploaderId &&
      this.uploaderInstances[this.activeUploaderId]
    ) {
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
      containerId: null,
    };

    // Switch to the new uploader
    this.activeUploaderId = newId;
    this.config = { ...this.uploaderInstances[newId].config };
    this.currentPreset = "default";

    // Update UI
    this.updateUploaderTabsUI();
    this.render();
    this.attachEvents();
    this.initTooltips();
    this.refreshAllPreviews(); // Refresh all to show the new uploader
    this.updateCodeOutput();
  }

  /**
   * Duplicate an existing uploader with its config
   */
  duplicateUploader(uploaderId) {
    if (!this.uploaderInstances[uploaderId]) return;

    // Save current config and preset first
    if (
      this.activeUploaderId &&
      this.uploaderInstances[this.activeUploaderId]
    ) {
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
      containerId: null,
    };

    // Switch to the new uploader
    this.activeUploaderId = newId;
    this.config = { ...this.uploaderInstances[newId].config };
    this.currentPreset = this.uploaderInstances[newId].preset;

    // Update UI
    this.updateUploaderTabsUI();
    this.render();
    this.attachEvents();
    this.initTooltips();
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
    if (
      this.activeUploaderId &&
      this.uploaderInstances[this.activeUploaderId]
    ) {
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
    this.initTooltips();
    this.refreshAllPreviews(); // Refresh all to update active states
    this.updateCodeOutput();
  }

  /**
   * Remove an uploader from the preview
   */
  removeUploader(uploaderId) {
    if (Object.keys(this.uploaderInstances).length <= 1) return;

    // Destroy the instance and disconnect observer
    const data = this.uploaderInstances[uploaderId];
    if (data) {
      // Disconnect file change observer
      if (data.fileChangeObserver) {
        data.fileChangeObserver.disconnect();
        data.fileChangeObserver = null;
      }
      if (data.instance && typeof data.instance.destroy === "function") {
        data.instance.destroy();
      }
    }

    delete this.uploaderInstances[uploaderId];

    // If we removed the active uploader, switch to another one
    if (this.activeUploaderId === uploaderId) {
      const remainingIds = Object.keys(this.uploaderInstances);
      this.activeUploaderId = remainingIds[0];
      this.config = { ...this.uploaderInstances[this.activeUploaderId].config };
      this.currentPreset =
        this.uploaderInstances[this.activeUploaderId].preset || null;
    }

    // Update UI
    this.updateUploaderTabsUI();
    this.render();
    this.attachEvents();
    this.initTooltips();
    this.refreshAllPreviews();
    this.updateCodeOutput();
  }

  /**
   * Check if an uploader name is already in use
   */
  isNameDuplicate(name, excludeUploaderId = null) {
    const normalizedName = name.trim().toLowerCase();
    for (const [id, data] of Object.entries(this.uploaderInstances)) {
      if (
        id !== excludeUploaderId &&
        data.name.trim().toLowerCase() === normalizedName
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Edit uploader name
   */
  editUploaderName(uploaderId) {
    const nameEl = this.element.querySelector(
      `.fu-config-builder-uploader-tab-name[data-uploader-id="${uploaderId}"]`
    );
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
    const wrapper = this.element.querySelector(
      `[data-uploader-wrapper="${uploaderId}"]`
    );
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

      this.element
        .querySelectorAll(".fu-config-builder-uploader-tab-close")
        .forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.removeUploader(btn.dataset.uploaderId);
          });
        });

      this.element
        .querySelectorAll(".fu-config-builder-uploader-tab-duplicate")
        .forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.duplicateUploader(btn.dataset.uploaderId);
          });
        });

      this.element
        .querySelectorAll(".fu-config-builder-uploader-tab-name")
        .forEach((nameEl) => {
          nameEl.addEventListener("dblclick", (e) => {
            e.stopPropagation();
            this.editUploaderName(nameEl.dataset.uploaderId);
          });
        });

      // Initialize tooltips for new uploader tab elements
      Tooltip.initAll(listEl);
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
  // Search Functionality
  // ============================================================================

  /**
   * Attach search event handlers
   */
  attachSearchEvents() {
    const searchInput = this.element.querySelector("#option-search");
    const clearBtn = this.element.querySelector("#search-clear");
    const resultsContainer = this.element.querySelector("#search-results");

    if (!searchInput) return;

    // Build search index on first focus
    searchInput.addEventListener("focus", () => {
      if (!this.searchIndex) {
        this.buildSearchIndex();
      }
    });

    // Handle input with debounce
    let debounceTimer;
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim();

      // Show/hide clear button
      if (clearBtn) {
        clearBtn.style.display = query ? "flex" : "none";
      }

      // Debounce search
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (query.length >= 1) {
          const results = this.fuzzySearch(query);
          this.renderSearchResults(results, query);
        } else {
          this.hideSearchResults();
        }
      }, 150);
    });

    // Clear button
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        clearBtn.style.display = "none";
        this.hideSearchResults();
        searchInput.focus();
      });
    }

    // Handle keyboard navigation
    searchInput.addEventListener("keydown", (e) => {
      if (!resultsContainer || resultsContainer.style.display === "none") return;

      const items = resultsContainer.querySelectorAll(".fu-config-builder-search-result-item");
      const activeItem = resultsContainer.querySelector(".fu-config-builder-search-result-item.active");
      let activeIndex = Array.from(items).indexOf(activeItem);

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (activeIndex < items.length - 1) {
            items[activeIndex]?.classList.remove("active");
            items[activeIndex + 1]?.classList.add("active");
            items[activeIndex + 1]?.scrollIntoView({ block: "nearest" });
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (activeIndex > 0) {
            items[activeIndex]?.classList.remove("active");
            items[activeIndex - 1]?.classList.add("active");
            items[activeIndex - 1]?.scrollIntoView({ block: "nearest" });
          }
          break;
        case "Enter":
          e.preventDefault();
          if (activeItem) {
            activeItem.click();
          }
          break;
        case "Escape":
          this.hideSearchResults();
          searchInput.blur();
          break;
      }
    });

    // Close results when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".fu-config-builder-search")) {
        this.hideSearchResults();
      }
    });
  }

  /**
   * Build search index from option definitions
   */
  buildSearchIndex() {
    this.searchIndex = [];

    // Index config options
    for (const [categoryKey, category] of Object.entries(this.optionDefinitions)) {
      for (const [optionKey, option] of Object.entries(category.options)) {
        this.searchIndex.push({
          key: optionKey,
          label: option.label || optionKey,
          hint: option.hint || "",
          category: category.title,
          categoryKey: categoryKey,
          icon: category.icon,
          type: "config",
          searchText: `${option.label || optionKey} ${option.hint || ""} ${optionKey}`.toLowerCase()
        });
      }
    }

    // Index style options
    for (const [sectionKey, section] of Object.entries(this.styleDefinitions)) {
      // Handle variables as object (key-value pairs)
      if (section.variables && typeof section.variables === 'object') {
        for (const [varKey, variable] of Object.entries(section.variables)) {
          this.searchIndex.push({
            key: varKey,
            label: variable.label || varKey,
            hint: variable.hint || "",
            category: section.title,
            categoryKey: sectionKey,
            icon: section.icon,
            type: "style",
            searchText: `${variable.label || varKey} ${variable.hint || ""} ${varKey}`.toLowerCase()
          });
        }
      }
    }
  }

  /**
   * Fuzzy search implementation
   * @param {string} query - Search query
   * @returns {Array} Matching results sorted by relevance
   */
  fuzzySearch(query) {
    if (!this.searchIndex) return [];

    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);
    const results = [];

    for (const item of this.searchIndex) {
      const score = this.calculateFuzzyScore(item, queryWords, queryLower);
      if (score > 0) {
        results.push({ ...item, score });
      }
    }

    // Sort by score (higher is better) and limit results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);
  }

  /**
   * Calculate fuzzy match score for an item
   * @param {Object} item - Search index item
   * @param {Array} queryWords - Query split into words
   * @param {string} queryLower - Lowercase query
   * @returns {number} Match score (0 = no match)
   */
  calculateFuzzyScore(item, queryWords, queryLower) {
    let score = 0;
    const labelLower = item.label.toLowerCase();
    const keyLower = item.key.toLowerCase();
    const hintLower = item.hint.toLowerCase();

    // Exact match in label (highest priority)
    if (labelLower === queryLower) {
      score += 100;
    } else if (labelLower.startsWith(queryLower)) {
      score += 80;
    } else if (labelLower.includes(queryLower)) {
      score += 60;
    }

    // Match in key
    if (keyLower.includes(queryLower)) {
      score += 40;
    }

    // Match in hint
    if (hintLower.includes(queryLower)) {
      score += 20;
    }

    // Word-by-word matching for multi-word queries
    if (queryWords.length > 1) {
      let wordMatches = 0;
      for (const word of queryWords) {
        if (labelLower.includes(word) || keyLower.includes(word) || hintLower.includes(word)) {
          wordMatches++;
        }
      }
      if (wordMatches === queryWords.length) {
        score += 30; // All words found
      } else if (wordMatches > 0) {
        score += wordMatches * 5;
      }
    }

    // Fuzzy character matching (for typos)
    if (score === 0) {
      const fuzzyScore = this.fuzzyCharMatch(queryLower, labelLower);
      if (fuzzyScore > 0.6) {
        score += fuzzyScore * 30;
      }
    }

    return score;
  }

  /**
   * Fuzzy character matching using Levenshtein-like approach
   * @param {string} query - Query string
   * @param {string} target - Target string to match against
   * @returns {number} Match ratio (0-1)
   */
  fuzzyCharMatch(query, target) {
    if (query.length === 0) return 0;
    if (target.length === 0) return 0;

    let matchCount = 0;
    let targetIndex = 0;

    for (const char of query) {
      const foundIndex = target.indexOf(char, targetIndex);
      if (foundIndex !== -1) {
        matchCount++;
        targetIndex = foundIndex + 1;
      }
    }

    return matchCount / query.length;
  }

  /**
   * Render search results dropdown
   * @param {Array} results - Search results
   * @param {string} query - Original query for highlighting
   */
  renderSearchResults(results, query) {
    const container = this.element.querySelector("#search-results");
    if (!container) return;

    if (results.length === 0) {
      container.innerHTML = `
        <div class="fu-config-builder-search-empty">
          No options found for "${query}"
        </div>
      `;
      container.style.display = "block";
      return;
    }

    const html = results.map((result, index) => {
      const highlightedLabel = this.highlightMatch(result.label, query);
      // Use category icon if available, otherwise fall back to type-based icon
      const iconHtml = result.icon
        ? this.getCategoryIcon(result.icon)
        : (result.type === "config"
          ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/></svg>`
          : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21a9 9 0 0 1 0 -18c4.97 0 9 3.582 9 8c0 1.06 -.474 2.078 -1.318 2.828c-.844 .75 -1.989 1.172 -3.182 1.172h-2.5a2 2 0 0 0 -1 3.75a1.3 1.3 0 0 1 -1 2.25"/></svg>`);

      return `
        <div class="fu-config-builder-search-result-item ${index === 0 ? "active" : ""}"
             data-option-key="${result.key}"
             data-category-key="${result.categoryKey}"
             data-type="${result.type}">
          <div class="fu-config-builder-search-result-icon">${iconHtml}</div>
          <div class="fu-config-builder-search-result-content">
            <div class="fu-config-builder-search-result-label">${highlightedLabel}</div>
            <div class="fu-config-builder-search-result-key">${result.key}</div>
            ${result.hint ? `<div class="fu-config-builder-search-result-hint">${result.hint}</div>` : ""}
          </div>
        </div>
      `;
    }).join("");

    container.innerHTML = html;
    container.style.display = "block";

    // Add click handlers
    container.querySelectorAll(".fu-config-builder-search-result-item").forEach(item => {
      item.addEventListener("click", () => {
        this.navigateToOption(
          item.dataset.optionKey,
          item.dataset.categoryKey,
          item.dataset.type
        );
      });
    });
  }

  /**
   * Highlight matching parts of text
   * @param {string} text - Text to highlight
   * @param {string} query - Query to highlight
   * @returns {string} HTML with highlighted matches
   */
  highlightMatch(text, query) {
    if (!query) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  }

  /**
   * Hide search results dropdown
   */
  hideSearchResults() {
    const container = this.element.querySelector("#search-results");
    if (container) {
      container.style.display = "none";
    }
  }

  /**
   * Navigate to a specific option
   * @param {string} optionKey - Option key
   * @param {string} categoryKey - Category key
   * @param {string} type - 'config' or 'style'
   */
  navigateToOption(optionKey, categoryKey, type) {
    // Hide search results and clear input
    this.hideSearchResults();
    const searchInput = this.element.querySelector("#option-search");
    if (searchInput) {
      searchInput.value = "";
      const clearBtn = this.element.querySelector("#search-clear");
      if (clearBtn) clearBtn.style.display = "none";
    }

    // Switch to correct main tab
    const mainTab = type === "style" ? "styles" : "config";
    const mainTabBtn = this.element.querySelector(`[data-main-tab="${mainTab}"]`);
    if (mainTabBtn && !mainTabBtn.classList.contains("active")) {
      mainTabBtn.click();
    }

    // Small delay to allow tab switch animation
    setTimeout(() => {
      if (type === "config") {
        // Switch to correct category tab
        const categoryTab = this.element.querySelector(`[data-category="${categoryKey}"]`);
        if (categoryTab && !categoryTab.classList.contains("active")) {
          categoryTab.click();
        }

        // Find and highlight the option
        setTimeout(() => {
          const optionEl = this.element.querySelector(`[data-option="${optionKey}"]`);
          if (optionEl) {
            const row = optionEl.closest(".fu-config-builder-option-row");
            if (row) {
              row.scrollIntoView({ behavior: "smooth", block: "center" });
              row.classList.add("fu-config-builder-highlight");
              setTimeout(() => row.classList.remove("fu-config-builder-highlight"), 2000);
            }
          }
        }, 100);
      } else {
        // Style option - switch to correct style section
        const styleTab = this.element.querySelector(`[data-style-section="${categoryKey}"]`);
        if (styleTab && !styleTab.classList.contains("active")) {
          styleTab.click();
        }

        // Find and highlight the variable
        setTimeout(() => {
          const varItem = this.element.querySelector(`[data-css-var="${optionKey}"]`);
          if (varItem) {
            varItem.scrollIntoView({ behavior: "smooth", block: "center" });
            varItem.classList.add("fu-config-builder-highlight");
            setTimeout(() => varItem.classList.remove("fu-config-builder-highlight"), 2000);
          }
        }, 100);
      }
    }, 50);
  }
}
