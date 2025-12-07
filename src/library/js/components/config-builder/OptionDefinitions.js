/**
 * OptionDefinitions.js
 * Configuration option definitions for the ConfigBuilder
 * @module OptionDefinitions
 */

/**
 * Get all option definitions with metadata
 * @returns {Object} Option definitions grouped by category
 */
export function getOptionDefinitions() {
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
          affectsOptions: ["maxFiles"],
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
        // Page Capture Group
        enableFullPageCapture: {
          type: "boolean",
          default: true,
          label: "Enable Full Page Capture",
          hint: "Enable full page screenshot capture button (captures entire scrollable page)",
          affectsOptions: ["modalMediaButtons", "collapsibleCaptureButtons"],
          group: "Page Capture",
        },
        enableRegionCapture: {
          type: "boolean",
          default: true,
          label: "Enable Region Capture",
          hint: "Enable region selection screenshot capture button (user selects area to capture)",
          affectsOptions: ["modalMediaButtons", "collapsibleCaptureButtons"],
          group: "Page Capture",
        },
        regionCaptureShowDimensions: {
          type: "boolean",
          default: true,
          label: "Show Region Dimensions",
          hint: "Display width × height dimensions while selecting a region to capture",
          dependsOn: "enableRegionCapture",
          group: "Page Capture",
        },
        regionCaptureDimensionsPosition: {
          type: "select",
          default: "center",
          label: "Dimensions Position",
          hint: "Position of the dimensions display relative to the selection box",
          dependsOn: "enableRegionCapture",
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
          group: "Page Capture",
        },
        regionCaptureImmediateCapture: {
          type: "boolean",
          default: true,
          label: "Immediate Capture",
          hint: "When enabled, captures immediately after selection. When disabled, shows a confirmation toolbar allowing repositioning before capture.",
          dependsOn: "enableRegionCapture",
          group: "Page Capture",
        },

        // Screen Recording Group
        enableScreenCapture: {
          type: "boolean",
          default: true,
          label: "Enable Screenshot Capture",
          hint: "Enable screenshot capture button (uses display media API)",
          affectsOptions: ["enableMicrophoneAudio", "enableSystemAudio", "modalMediaButtons", "collapsibleCaptureButtons"],
          group: "Screen Recording",
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
          group: "Screen Recording",
        },
        maxVideoRecordingDuration: {
          type: "number",
          default: 300,
          min: 10,
          max: 3600,
          label: "Max Video Duration (sec)",
          hint: "Maximum video recording duration in seconds",
          dependsOn: "enableVideoRecording",
          group: "Screen Recording",
        },
        recordingCountdownDuration: {
          type: "number",
          default: 3,
          min: 0,
          max: 10,
          label: "Recording Countdown (sec)",
          hint: "Countdown duration before recording starts",
          dependsOn: "enableVideoRecording",
          group: "Screen Recording",
        },
        enableMicrophoneAudio: {
          type: "boolean",
          default: true,
          label: "Enable Microphone Audio",
          hint: "Record microphone audio during screen capture",
          dependsOn: "enableScreenCapture",
          group: "Screen Recording",
        },
        enableSystemAudio: {
          type: "boolean",
          default: true,
          label: "Enable System Audio",
          hint: "Record system audio during screen capture",
          dependsOn: "enableScreenCapture",
          group: "Screen Recording",
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
          group: "Screen Recording",
        },
        maxVideoRecordingFileSize: {
          type: "selectWithInput",
          default: null,
          label: "Max Video File Size",
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
          group: "Screen Recording",
        },

        // Audio Recording Group
        enableAudioRecording: {
          type: "boolean",
          default: true,
          label: "Enable Audio Recording",
          hint: "Enable audio recording button",
          affectsOptions: ["maxAudioRecordingDuration", "modalMediaButtons", "collapsibleCaptureButtons"],
          group: "Audio Recording",
        },
        maxAudioRecordingDuration: {
          type: "number",
          default: 300,
          min: 10,
          max: 3600,
          label: "Max Audio Duration (sec)",
          hint: "Maximum audio recording duration in seconds",
          dependsOn: "enableAudioRecording",
          group: "Audio Recording",
        },
        audioBitsPerSecond: {
          type: "selectWithInput",
          default: 128000,
          label: "Audio Bitrate",
          hint: "Audio quality/bitrate for recordings. Select a preset or enter a custom value.",
          dependsOn: "enableAudioRecording",
          formatType: "bitrate",
          options: [
            { value: 64000, label: "Low (64 Kbps)" },
            { value: 128000, label: "Medium (128 Kbps)" },
            { value: 192000, label: "High (192 Kbps)" },
            { value: 320000, label: "Ultra (320 Kbps)" },
          ],
          group: "Audio Recording",
        },
        maxAudioRecordingFileSize: {
          type: "selectWithInput",
          default: null,
          label: "Max Audio File Size",
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
          group: "Audio Recording",
        },

        // Display Options Group
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
          group: "Display Options",
        },
        showRecordingSize: {
          type: "boolean",
          default: true,
          label: "Show Recording Size",
          hint: "Show approximate file size during recording",
          showWhen: (config) => config.enableVideoRecording || config.enableAudioRecording,
          group: "Display Options",
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
 * Get the default value for an option
 * @param {Object} fileUploaderDefaults - FileUploader default options
 * @param {string} key - Option key
 * @param {*} fallbackDefault - Fallback default value
 * @returns {*} The default value
 */
export function getOptionDefault(fileUploaderDefaults, key, fallbackDefault) {
  if (fileUploaderDefaults && key in fileUploaderDefaults) {
    return structuredClone(fileUploaderDefaults[key]);
  }
  return fallbackDefault;
}

/**
 * Get default config from option definitions
 * @param {Object} optionDefinitions - Option definitions
 * @param {Object} fileUploaderDefaults - FileUploader defaults
 * @returns {Object} Default config
 */
export function getDefaultConfig(optionDefinitions, fileUploaderDefaults) {
  const config = {};
  for (const category of Object.values(optionDefinitions)) {
    for (const [key, def] of Object.entries(category.options)) {
      config[key] = getOptionDefault(fileUploaderDefaults, key, def.default);
    }
  }
  return config;
}
