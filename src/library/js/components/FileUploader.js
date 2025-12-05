/**
 * FileUploader Class
 * A flexible file uploader with drag & drop, preview, and AJAX upload
 * Compatible with Bootstrap 3-5 and standalone usage
 */

import { getIcon } from "../utils/icons.js";
import ScreenCapture from "../utils/ScreenCapture.js";
import VideoRecorder from "../utils/VideoRecorder.js";
import AudioWorkletRecorder from "../utils/AudioWorkletRecorder.js";
import RecordingUI from "../utils/RecordingUI.js";
import Tooltip from "./tooltip/index.js";
import { FileCarousel } from "./carousel/index.js";
import Alert from "./Alert.js";

// Static registry for all FileUploader instances (for cross-uploader drag-drop)
const uploaderRegistry = new Map();
let instanceCounter = 0;

export default class FileUploader {
  constructor(element, options = {}) {
    this.element =
      typeof element === "string" ? document.querySelector(element) : element;

    if (!this.element) {
      console.error("FileUploader: Element not found:", element);
      return;
    }

    // Generate unique instance ID
    this.instanceId = `file-uploader-${++instanceCounter}`;
    uploaderRegistry.set(this.instanceId, this);

    // Default options
    // URLs default to current directory - override with absolute paths if needed
    this.options = {
      uploadUrl: "./upload.php",
      deleteUrl: "./delete.php",
      downloadAllUrl: "./download-all.php",
      cleanupZipUrl: "./cleanup-zip.php",
      copyFileUrl: "./copy-file.php", // URL for copying files between directories (cross-uploader)
      configUrl: "./get-config.php",
      uploadDir: "", // Target folder for uploads (relative to server's base upload directory, e.g., "profile_pictures" or "documents/2024")
      allowedExtensions: [],
      perFileMaxSize: 10 * 1024 * 1024, // 10MB (fallback)
      perFileMaxSizeDisplay: "10MB",
      perFileMaxSizePerType: {}, // Per file max size per type - max size for a SINGLE file of each type
      perFileMaxSizePerTypeDisplay: {},
      perTypeMaxTotalSize: {}, // Per type max total size - TOTAL size for all files of that type combined
      perTypeMaxTotalSizeDisplay: {},
      perTypeMaxFileCount: {}, // Per type max file count - max files allowed per type (e.g., { image: 5, video: 3 })
      totalMaxSize: 100 * 1024 * 1024, // 100MB - total for all files combined
      totalMaxSizeDisplay: "100MB",
      maxFiles: 10, // Total max file count - max files across all types
      imageExtensions: ["jpg", "jpeg", "png", "gif", "webp", "svg"],
      videoExtensions: ["mp4", "mpeg", "mov", "avi", "webm"],
      audioExtensions: ["mp3", "wav", "ogg", "webm", "aac", "m4a", "flac"],
      documentExtensions: [
        "pdf",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "ppt",
        "pptx",
        "txt",
        "csv",
      ],
      archiveExtensions: ["zip", "rar", "7z", "tar", "gz"],
      multiple: true,
      autoFetchConfig: true,
      showLimits: true,
      showFileTypeCount: false, // Show count of files per type (image, video, document)
      showProgressBar: false, // Show progress bar background for Total Size and File Count
      showPerFileLimit: true, // Show per file size limit in type groups
      showTypeGroupSize: true, // Show total uploaded size per type group
      showTypeGroupCount: true, // Show file count per type group
      defaultLimitsView: "concise", // Default view mode for limits: 'concise' or 'detailed'
      allowLimitsViewToggle: true, // Allow toggling between concise and detailed view
      showLimitsToggle: true, // Show toggle button to show/hide limits section
      defaultLimitsVisible: true, // Default visibility state of limits section (true = shown, false = hidden)
      confirmBeforeDelete: false, // Show confirmation dialog before deleting files
      preventDuplicates: false, // Prevent uploading the same file again
      duplicateCheckBy: "name-size", // How to check duplicates: 'name', 'size', 'name-size', 'hash'
      // Alert notification options
      alertAnimation: "shake", // Animation for error alerts: 'fade', 'shake', 'bounce', 'slideDown', 'pop', 'flip'
      alertDuration: 5000, // Auto-dismiss duration in ms (0 = no auto-dismiss)
      showDownloadAllButton: true, // Show internal download-all button
      downloadAllButtonText: "Download All", // Text for download-all button
      downloadAllButtonClasses: [], // Custom classes for download-all button (Bootstrap, etc.)
      downloadAllButtonElement: null, // External element selector for download-all (cannot be used with showDownloadAllButton)
      showClearAllButton: true, // Show internal clear-all button
      clearAllButtonText: "Clear All", // Text for clear-all button
      clearAllButtonClasses: [], // Custom classes for clear-all button (Bootstrap, etc.)
      clearAllButtonElement: null, // External element selector for clear-all (cannot be used with showClearAllButton)
      cleanupOnUnload: true, // Automatically delete uploaded files from server when leaving the page
      enableScreenCapture: true, // Enable screenshot capture button
      enableVideoRecording: true, // Enable video recording button
      enableAudioRecording: true, // Enable audio recording button
      maxVideoRecordingDuration: 300, // Max video recording duration in seconds (default 5 minutes)
      maxAudioRecordingDuration: 300, // Max audio recording duration in seconds (default 5 minutes)
      recordingCountdownDuration: 3, // Countdown duration before recording starts in seconds (default 3)
      enableMicrophoneAudio: false, // Enable microphone audio recording
      enableSystemAudio: false, // Enable system audio recording
      // Carousel preview options
      enableCarouselPreview: true, // Enable carousel preview modal on file click
      carouselAutoPreload: true, // Auto-preload files in carousel (true, false, or array of types like ['image', 'video'])
      carouselEnableManualLoading: true, // Show "Load All" button in carousel
      carouselVisibleTypes: [
        "image",
        "video",
        "audio",
        "pdf",
        "excel",
        "csv",
        "text",
      ], // File types visible in carousel
      carouselPreviewableTypes: [
        "image",
        "video",
        "audio",
        "pdf",
        "csv",
        "excel",
        "text",
      ], // File types that can be previewed
      carouselMaxPreviewRows: 100, // Max rows to show for CSV/Excel preview
      carouselMaxTextPreviewChars: 50000, // Max characters for text file preview
      onUploadStart: null,
      onUploadSuccess: null,
      onUploadError: null,
      onDeleteSuccess: null,
      onDeleteError: null,
      onDuplicateFile: null, // Callback when duplicate file is detected
      // Cross-uploader drag-drop options
      enableCrossUploaderDrag: true, // Allow dragging files between uploaders
      ...options,
    };

    // Validate download-all button configuration
    if (
      this.options.showDownloadAllButton &&
      this.options.downloadAllButtonElement
    ) {
      console.error(
        "FileUploader: Cannot use both showDownloadAllButton and downloadAllButtonElement. Using internal button."
      );
      this.options.downloadAllButtonElement = null;
    }

    // Validate clear-all button configuration
    if (this.options.showClearAllButton && this.options.clearAllButtonElement) {
      console.error(
        "FileUploader: Cannot use both showClearAllButton and clearAllButtonElement. Using internal button."
      );
      this.options.clearAllButtonElement = null;
    }

    this.files = [];
    this.selectedFiles = new Set(); // Track selected file IDs
    this.limitsViewMode = this.options.defaultLimitsView || "concise"; // 'concise' or 'detailed'
    this.limitsVisible = this.options.defaultLimitsVisible !== false; // Default to visible
    this.screenCapture = null;
    this.videoRecorder = null;
    this.audioRecorder = null;
    this.recordingUI = new RecordingUI(this);
    this.carousel = null;
    this.carouselContainer = null;
    this.draggedFileObj = null; // Currently dragged file object
    this.init();
  }

  async init() {
    // Fetch config from server if enabled
    if (this.options.autoFetchConfig) {
      await this.fetchConfig();
    }

    this.createStructure();
    this.attachEvents();
    this.attachBeforeUnloadHandler();
    this.initCarousel();
  }

  async fetchConfig() {
    try {
      const response = await fetch(this.options.configUrl);
      const config = await response.json();

      // Merge server config with options
      this.options = {
        ...this.options,
        ...config,
      };
    } catch (error) {
      console.warn(
        "FileUploader: Could not fetch config from server, using default options"
      );
    }
  }

  createStructure() {
    // Create wrapper
    this.wrapper = document.createElement("div");
    this.wrapper.className = "file-uploader-wrapper";

    // Create drop zone
    this.dropZone = document.createElement("div");
    this.dropZone.className = "file-uploader-dropzone";

    // Create dropzone header (upload prompt)
    this.dropZoneHeader = document.createElement("div");
    this.dropZoneHeader.className = "file-uploader-dropzone-content";

    // Check if ANY type-level limits are defined (per-file size, total size, or file count)
    // If any type-level limit exists, don't show the fallback "Maximum file size" in dropzone
    const hasAnyTypeLevelLimits =
      Object.keys(this.options.perFileMaxSizePerType || {}).length > 0 ||
      Object.keys(this.options.perTypeMaxTotalSize || {}).length > 0 ||
      Object.keys(this.options.perTypeMaxFileCount || {}).length > 0;

    // Only show fallback limit if no type-level limits are defined at all
    const showFallbackLimit = !hasAnyTypeLevelLimits;

    this.dropZoneHeader.innerHTML = `
                ${getIcon("upload", { class: "file-uploader-icon" })}
                <p class="file-uploader-text">Drag & drop files here or click to browse</p>
                ${
                  showFallbackLimit
                    ? `<p class="file-uploader-subtext">Maximum file size: ${this.options.perFileMaxSizeDisplay}</p>`
                    : ""
                }
        `;

    // Create file input
    this.fileInput = document.createElement("input");
    this.fileInput.type = "file";
    this.fileInput.className = "file-uploader-input";
    this.fileInput.multiple = this.options.multiple;

    if (this.options.allowedExtensions.length > 0) {
      this.fileInput.accept = this.options.allowedExtensions
        .map((ext) => "." + ext)
        .join(",");
    }

    // Create preview container (will be inside dropzone)
    this.previewContainer = document.createElement("div");
    this.previewContainer.className = "file-uploader-preview-container";

    // Create limits display (if enabled)
    if (this.options.showLimits) {
      this.limitsContainer = document.createElement("div");
      this.limitsContainer.className = "file-uploader-limits";
      this.updateLimitsDisplay();
    }

    // Setup download all button (internal or external)
    this.setupDownloadAllButton();

    // Setup clear all button (internal or external)
    this.setupClearAllButton();

    // Append elements to dropzone
    this.dropZone.appendChild(this.fileInput);
    this.dropZone.appendChild(this.dropZoneHeader);
    this.dropZone.appendChild(this.previewContainer);

    // Create action container wrapper for both button and capture containers
    this.actionContainer = document.createElement("div");
    this.actionContainer.className = "file-uploader-action-container";
    // Action container is always visible (for capture buttons)

    // Create limits toggle button inside action container (if enabled) - before button container
    if (this.options.showLimits && this.options.showLimitsToggle) {
      this.createLimitsToggleButton();
    }

    // Create button container for both buttons inside dropzone
    if (
      (this.downloadAllBtn && this.options.showDownloadAllButton) ||
      (this.clearAllBtn && this.options.showClearAllButton)
    ) {
      this.buttonContainer = document.createElement("div");
      this.buttonContainer.className = "file-uploader-button-container";
      this.buttonContainer.style.display = "none"; // Initially hidden until files are added

      if (this.downloadAllBtn && this.options.showDownloadAllButton) {
        this.buttonContainer.appendChild(this.downloadAllBtn);
      }
      if (this.clearAllBtn && this.options.showClearAllButton) {
        this.buttonContainer.appendChild(this.clearAllBtn);
      }

      this.actionContainer.appendChild(this.buttonContainer);
    }

    // Create selected files action buttons container
    this.selectedActionContainer = document.createElement("div");
    this.selectedActionContainer.className =
      "file-uploader-selected-action-container";
    this.selectedActionContainer.style.display = "none"; // Initially hidden until files are selected

    // Create selection info text
    const selectionInfo = document.createElement("span");
    selectionInfo.className = "file-uploader-selection-info";
    selectionInfo.textContent = "0 selected";
    this.selectedActionContainer.appendChild(selectionInfo);

    // Create download selected button
    const downloadSelectedBtn = document.createElement("button");
    downloadSelectedBtn.type = "button";
    downloadSelectedBtn.className = "file-uploader-download-selected";
    downloadSelectedBtn.innerHTML = `
      ${getIcon("download")}
      <span>Download</span>
    `;
    downloadSelectedBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.downloadSelected();
    });
    this.selectedActionContainer.appendChild(downloadSelectedBtn);

    // Create delete selected button
    const deleteSelectedBtn = document.createElement("button");
    deleteSelectedBtn.type = "button";
    deleteSelectedBtn.className = "file-uploader-delete-selected";
    deleteSelectedBtn.innerHTML = `
      ${getIcon("trash")}
      <span>Delete</span>
    `;
    deleteSelectedBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.deleteSelected();
    });
    this.selectedActionContainer.appendChild(deleteSelectedBtn);

    this.actionContainer.appendChild(this.selectedActionContainer);

    // Create capture buttons container (bottom right corner)
    this.createCaptureButtons();

    // Append dropzone and other elements to wrapper
    this.wrapper.appendChild(this.dropZone);
    if (this.options.showLimits) {
      // Set initial visibility
      if (!this.limitsVisible) {
        this.limitsContainer.style.display = "none";
      }
      this.wrapper.appendChild(this.limitsContainer);
    }
    this.element.appendChild(this.wrapper);
  }

  setupDownloadAllButton() {
    // Use external element if provided
    if (this.options.downloadAllButtonElement) {
      const selector = this.options.downloadAllButtonElement;
      this.downloadAllBtn =
        typeof selector === "string"
          ? document.querySelector(selector)
          : selector;

      if (!this.downloadAllBtn) {
        console.error(
          `FileUploader: Download button element not found: ${selector}`
        );
        return;
      }

      // Set initial state
      this.downloadAllBtn.style.display = "none";
      this.downloadAllBtn.disabled = true;

      // Attach click handler
      this.downloadAllBtn.addEventListener("click", () => this.downloadAll());
    }
    // Create internal button
    else if (this.options.showDownloadAllButton) {
      this.downloadAllBtn = document.createElement("button");
      this.downloadAllBtn.type = "button";

      // Build class list
      const classes = ["file-uploader-download-all"];
      if (
        this.options.downloadAllButtonClasses &&
        this.options.downloadAllButtonClasses.length > 0
      ) {
        classes.push(...this.options.downloadAllButtonClasses);
      }
      this.downloadAllBtn.className = classes.join(" ");

      // Don't set display:none here, let updateLimitsDisplay handle it via container
      this.downloadAllBtn.innerHTML = `
            ${getIcon("download")}
            <span>${this.options.downloadAllButtonText}</span>
        `;
      this.downloadAllBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.downloadAll();
      });
    }
  }

  setupClearAllButton() {
    // Use external element if provided
    if (this.options.clearAllButtonElement) {
      const selector = this.options.clearAllButtonElement;
      this.clearAllBtn =
        typeof selector === "string"
          ? document.querySelector(selector)
          : selector;

      if (!this.clearAllBtn) {
        console.error(
          `FileUploader: Clear button element not found: ${selector}`
        );
        return;
      }

      // Set initial state
      this.clearAllBtn.style.display = "none";
      this.clearAllBtn.disabled = true;

      // Attach click handler
      this.clearAllBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.clearAll();
      });
    }
    // Create internal button
    else if (this.options.showClearAllButton) {
      this.clearAllBtn = document.createElement("button");
      this.clearAllBtn.type = "button";

      // Build class list
      const classes = ["file-uploader-clear-all"];
      if (
        this.options.clearAllButtonClasses &&
        this.options.clearAllButtonClasses.length > 0
      ) {
        classes.push(...this.options.clearAllButtonClasses);
      }
      this.clearAllBtn.className = classes.join(" ");

      // Don't set display:none here, let updateLimitsDisplay handle it via container
      this.clearAllBtn.innerHTML = `
            ${getIcon("trash")}
            <span>${this.options.clearAllButtonText}</span>
        `;
      this.clearAllBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.clearAll();
      });
    }
  }

  createCaptureButtons() {
    // Container for capture buttons (bottom right corner)
    this.captureButtonContainer = document.createElement("div");
    this.captureButtonContainer.className = "file-uploader-capture-container";

    // Screenshot button
    if (this.options.enableScreenCapture && ScreenCapture.isSupported()) {
      this.screenshotBtn = document.createElement("button");
      this.screenshotBtn.type = "button";
      this.screenshotBtn.className = "file-uploader-capture-btn";
      this.screenshotBtn.setAttribute(
        "data-tooltip-text",
        "Capture Screenshot"
      );
      this.screenshotBtn.setAttribute("data-tooltip-position", "top");
      this.screenshotBtn.innerHTML = getIcon("camera");
      this.screenshotBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.captureScreenshot();
      });
      this.captureButtonContainer.appendChild(this.screenshotBtn);
    }

    // Video recording button
    if (this.options.enableVideoRecording && VideoRecorder.isSupported()) {
      this.videoRecordBtn = document.createElement("button");
      this.videoRecordBtn.type = "button";
      this.videoRecordBtn.className = "file-uploader-capture-btn";
      this.videoRecordBtn.setAttribute("data-tooltip-text", "Record Video");
      this.videoRecordBtn.setAttribute("data-tooltip-position", "top");
      this.videoRecordBtn.innerHTML = getIcon("video");
      this.videoRecordBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleVideoRecording();
      });
      this.captureButtonContainer.appendChild(this.videoRecordBtn);

      // Recording indicator (hidden by default)
      this.recordingIndicator = document.createElement("div");
      this.recordingIndicator.className = "file-uploader-recording-indicator";
      this.recordingIndicator.style.display = "none";
      this.recordingIndicator.innerHTML = `
        <span class="file-uploader-recording-dot"></span>
        <span class="file-uploader-recording-time">00:00 / 05:00</span>
      `;
      // Prevent recording indicator from triggering file upload
      this.recordingIndicator.addEventListener("click", (e) => {
        e.stopPropagation();
      });

      // Make time element clickable to toggle time display format
      const timeElement = this.recordingIndicator.querySelector(
        ".file-uploader-recording-time"
      );
      if (timeElement) {
        timeElement.style.cursor = "pointer";
        timeElement.setAttribute(
          "data-tooltip-text",
          "Click to toggle time display"
        );
        timeElement.setAttribute("data-tooltip-position", "top");
        timeElement.dataset.showRemaining = "false";
        timeElement.addEventListener("click", (e) => {
          e.stopPropagation();
          // Toggle between elapsed/total and remaining time display
          timeElement.dataset.showRemaining =
            timeElement.dataset.showRemaining === "false" ? "true" : "false";
        });
      }

      this.captureButtonContainer.appendChild(this.recordingIndicator);
    }

    // Audio recording button
    if (
      this.options.enableAudioRecording &&
      AudioWorkletRecorder.isSupported()
    ) {
      this.audioRecordBtn = document.createElement("button");
      this.audioRecordBtn.type = "button";
      this.audioRecordBtn.className = "file-uploader-capture-btn";
      this.audioRecordBtn.setAttribute("data-tooltip-text", "Record Audio");
      this.audioRecordBtn.setAttribute("data-tooltip-position", "top");
      this.audioRecordBtn.innerHTML = getIcon("audio");
      this.audioRecordBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleAudioRecording();
      });
      this.captureButtonContainer.appendChild(this.audioRecordBtn);

      // Create recording indicator if not already created by video button
      if (!this.recordingIndicator) {
        this.recordingIndicator = document.createElement("div");
        this.recordingIndicator.className = "file-uploader-recording-indicator";
        this.recordingIndicator.style.display = "none";
        this.recordingIndicator.innerHTML = `
          <span class="file-uploader-recording-dot"></span>
          <span class="file-uploader-recording-time">00:00 / 05:00</span>
        `;
        this.recordingIndicator.addEventListener("click", (e) => {
          e.stopPropagation();
        });

        const timeElement = this.recordingIndicator.querySelector(
          ".file-uploader-recording-time"
        );
        if (timeElement) {
          timeElement.style.cursor = "pointer";
          timeElement.setAttribute(
            "data-tooltip-text",
            "Click to toggle time display"
          );
          timeElement.setAttribute("data-tooltip-position", "top");
          timeElement.dataset.showRemaining = "false";
          timeElement.addEventListener("click", (e) => {
            e.stopPropagation();
            // Toggle between elapsed/total and remaining time display
            timeElement.dataset.showRemaining =
              timeElement.dataset.showRemaining === "false" ? "true" : "false";
          });
        }

        this.captureButtonContainer.appendChild(this.recordingIndicator);
      }
    }

    // Append capture buttons to action container
    if (this.captureButtonContainer.children.length > 0) {
      this.actionContainer.appendChild(this.captureButtonContainer);
      // Initialize tooltips for capture buttons
      Tooltip.initAll(this.captureButtonContainer);
    }

    // Append action container to dropzone if it has children
    if (this.actionContainer.children.length > 0) {
      this.dropZone.appendChild(this.actionContainer);
    }
  }

  createLimitsToggleButton() {
    // Create the toggle button (styled exactly like Download All button)
    this.limitsToggleBtn = document.createElement("button");
    this.limitsToggleBtn.type = "button";
    this.limitsToggleBtn.className = "file-uploader-limits-toggle-btn";

    // Create icon element once (will be rotated via CSS)
    const iconWrapper = document.createElement("span");
    iconWrapper.className = "file-uploader-toggle-icon-wrapper";
    iconWrapper.innerHTML = getIcon("chevron_up", {
      class: "file-uploader-toggle-icon",
    });
    this.limitsToggleBtn.appendChild(iconWrapper);

    // Create text element
    this.limitsToggleBtnText = document.createElement("span");
    this.limitsToggleBtnText.textContent = "Size Limits";
    this.limitsToggleBtn.appendChild(this.limitsToggleBtnText);

    // Set initial state
    this.updateLimitsToggleButton();

    this.limitsToggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleLimitsVisibility();
    });

    // Add directly to action container (before button container)
    this.actionContainer.appendChild(this.limitsToggleBtn);

    // Initialize tooltip
    Tooltip.initAll(this.limitsToggleBtn);
  }

  updateLimitsToggleButton() {
    if (!this.limitsToggleBtn) return;

    // Toggle expanded class for CSS animation (rotates the chevron)
    if (this.limitsVisible) {
      this.limitsToggleBtn.classList.add("is-expanded");
    } else {
      this.limitsToggleBtn.classList.remove("is-expanded");
    }

    this.limitsToggleBtn.setAttribute(
      "data-tooltip-text",
      this.limitsVisible ? "Hide upload limits" : "Show upload limits"
    );
    this.limitsToggleBtn.setAttribute("data-tooltip-position", "top");
  }

  toggleLimitsVisibility() {
    this.limitsVisible = !this.limitsVisible;

    if (this.limitsContainer) {
      this.limitsContainer.style.display = this.limitsVisible ? "" : "none";
    }

    this.updateLimitsToggleButton();

    // Re-initialize tooltip after button update
    if (this.limitsToggleBtn) {
      Tooltip.initAll(this.limitsToggleBtn);
    }
  }

  async captureScreenshot() {
    try {
      // Disable button during capture
      if (this.screenshotBtn) {
        this.screenshotBtn.disabled = true;
      }

      // Initialize screen capture if not already done
      if (!this.screenCapture) {
        this.screenCapture = new ScreenCapture();
      }

      // Capture screenshot
      const file = await this.screenCapture.capture();

      // Add captured file with metadata
      this.handleCapturedFile(file, "screenshot");
    } catch (error) {
      this.showError(error.message);
    } finally {
      // Re-enable button
      if (this.screenshotBtn) {
        this.screenshotBtn.disabled = false;
      }
    }
  }

  async toggleVideoRecording() {
    if (
      this.videoRecorder &&
      this.videoRecorder.getRecordingStatus().isRecording
    ) {
      // Stop recording
      await this.stopVideoRecording();
    } else {
      // Start recording
      await this.startVideoRecording();
    }
  }

  async startVideoRecording() {
    try {
      // Disable button during setup
      if (this.videoRecordBtn) {
        this.videoRecordBtn.disabled = true;
      }

      // Initialize video recorder with options
      if (!this.videoRecorder) {
        this.videoRecorder = new VideoRecorder({
          maxDuration: this.options.maxVideoRecordingDuration * 1000, // Convert to ms
          systemAudioConstraints: this.options.enableSystemAudio,
          microphoneAudioConstraints: this.options.enableMicrophoneAudio,
        });
      }

      // Set recording type BEFORE starting recording
      this.recordingUI.recordingType = "video";

      // Start recording
      await this.videoRecorder.startRecording();

      // Set up handler for when user stops sharing from system button
      this.recordingUI.setupStreamEndedHandler();

      // Hide screenshot and audio buttons during recording
      if (this.screenshotBtn) {
        this.screenshotBtn.style.display = "none";
      }
      if (this.audioRecordBtn) {
        this.audioRecordBtn.style.display = "none";
      }

      // Create recording toolbar
      this.recordingUI.createRecordingToolbar();

      // Hide video record button during recording (stop button is in toolbar)
      if (this.videoRecordBtn) {
        this.videoRecordBtn.style.display = "none";
      }

      // Show recording indicator and start timer
      this.recordingUI.showRecordingIndicator();
    } catch (error) {
      this.showError(error.message);

      // Show buttons again on error
      if (this.videoRecordBtn) {
        this.videoRecordBtn.style.display = "";
        this.videoRecordBtn.disabled = false;
      }
      if (this.screenshotBtn) {
        this.screenshotBtn.style.display = "";
      }
    }
  }

  async stopVideoRecording() {
    try {
      // Disable button during processing
      if (this.videoRecordBtn) {
        this.videoRecordBtn.disabled = true;
        this.videoRecordBtn.innerHTML = getIcon("video");
      }

      // Stop recording indicator and remove toolbar
      this.recordingUI.cleanup();

      // Stop recording and get file
      const file = await this.videoRecorder.stopRecording();

      // Add recorded file with metadata
      this.handleCapturedFile(file, "recording");

      // Show video record button and screenshot button again
      if (this.videoRecordBtn) {
        this.videoRecordBtn.classList.remove("recording");
        this.videoRecordBtn.style.display = "";
        this.videoRecordBtn.title = "Record Video";
        this.videoRecordBtn.disabled = false;
      }

      if (this.screenshotBtn) {
        this.screenshotBtn.style.display = "";
      }

      if (this.audioRecordBtn) {
        this.audioRecordBtn.style.display = "";
      }
    } catch (error) {
      this.showError(error.message);

      // Clean up UI on error
      this.recordingUI.cleanup();

      // Show buttons again on error
      if (this.videoRecordBtn) {
        this.videoRecordBtn.style.display = "";
        this.videoRecordBtn.disabled = false;
      }
      if (this.screenshotBtn) {
        this.screenshotBtn.style.display = "";
      }
      if (this.audioRecordBtn) {
        this.audioRecordBtn.style.display = "";
      }
    }
  }

  async toggleAudioRecording() {
    if (
      this.audioRecorder &&
      this.audioRecorder.getRecordingStatus().isRecording
    ) {
      // Stop recording
      await this.stopAudioRecording();
    } else {
      // Start recording
      await this.startAudioRecording();
    }
  }

  async startAudioRecording() {
    try {
      // Disable button during setup
      if (this.audioRecordBtn) {
        this.audioRecordBtn.disabled = true;
      }

      // Initialize audio recorder with options
      // If audio recording is enabled but no specific source is set, default to microphone
      const enableMic =
        this.options.enableMicrophoneAudio ||
        (!this.options.enableMicrophoneAudio &&
          !this.options.enableSystemAudio);

      if (!this.audioRecorder) {
        this.audioRecorder = new AudioWorkletRecorder({
          enableMicrophoneAudio: enableMic,
          enableSystemAudio: this.options.enableSystemAudio,
          maxRecordingDuration: this.options.maxAudioRecordingDuration,
          sampleRate: 48000, // High quality audio
          bitDepth: 16,
          numberOfChannels: 2, // Stereo
        });
      }

      // Set recording type BEFORE starting recording
      this.recordingUI.recordingType = "audio";

      // Start recording
      await this.audioRecorder.startRecording();

      // Set up handler for when user stops sharing from system button
      this.recordingUI.setupStreamEndedHandler();

      // Hide other capture buttons during recording
      if (this.screenshotBtn) {
        this.screenshotBtn.style.display = "none";
      }
      if (this.videoRecordBtn) {
        this.videoRecordBtn.style.display = "none";
      }

      // Create audio recording toolbar
      this.recordingUI.createAudioRecordingToolbar();

      // Hide audio record button during recording (stop button is in toolbar)
      if (this.audioRecordBtn) {
        this.audioRecordBtn.style.display = "none";
      }

      // Show recording indicator and start timer
      this.recordingUI.showRecordingIndicator();
    } catch (error) {
      this.showError(error.message);

      // Show buttons again on error
      if (this.audioRecordBtn) {
        this.audioRecordBtn.style.display = "";
        this.audioRecordBtn.disabled = false;
      }
      if (this.screenshotBtn) {
        this.screenshotBtn.style.display = "";
      }
      if (this.videoRecordBtn) {
        this.videoRecordBtn.style.display = "";
      }
    }
  }

  async stopAudioRecording() {
    try {
      // Disable button during processing
      if (this.audioRecordBtn) {
        this.audioRecordBtn.disabled = true;
        this.audioRecordBtn.innerHTML = getIcon("audio");
      }

      // Stop recording indicator and remove toolbar
      this.recordingUI.cleanup();

      // Stop recording and get file
      const file = await this.audioRecorder.stopRecording();

      // Add recorded file with metadata
      this.handleCapturedFile(file, "audio_recording");

      // Show all capture buttons again
      if (this.audioRecordBtn) {
        this.audioRecordBtn.classList.remove("recording");
        this.audioRecordBtn.style.display = "";
        this.audioRecordBtn.title = "Record Audio";
        this.audioRecordBtn.disabled = false;
      }

      if (this.screenshotBtn) {
        this.screenshotBtn.style.display = "";
      }

      if (this.videoRecordBtn) {
        this.videoRecordBtn.style.display = "";
      }
    } catch (error) {
      this.showError(error.message);

      // Clean up UI on error
      this.recordingUI.cleanup();

      // Show buttons again on error
      if (this.audioRecordBtn) {
        this.audioRecordBtn.style.display = "";
        this.audioRecordBtn.disabled = false;
      }
      if (this.screenshotBtn) {
        this.screenshotBtn.style.display = "";
      }
      if (this.videoRecordBtn) {
        this.videoRecordBtn.style.display = "";
      }
    }
  }

  handleCapturedFile(file, captureType) {
    // Create file object with capture metadata
    const fileObj = {
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type,
      extension: this.getFileExtension(file.name),
      uploaded: false,
      uploading: false,
      error: null,
      serverFilename: null,
      captureType: captureType, // 'screenshot' or 'recording'
    };

    // Validate the file
    const validation = this.validateFile(file);

    if (!validation.valid) {
      this.showError(validation.error);
      return;
    }

    this.files.push(fileObj);
    this.createPreview(fileObj);
    this.uploadFile(fileObj);
  }

  updateLimitsDisplay() {
    if (!this.limitsContainer) return;

    const totalSize = this.getTotalSize();
    const totalSizeFormatted = this.formatFileSize(totalSize);
    const fileCount = this.files.filter((f) => f.uploaded).length;
    const typeLimits = this.options.perTypeMaxTotalSizeDisplay;
    const isDetailed = this.limitsViewMode === "detailed";

    // Calculate percentages
    const sizePercentage =
      this.options.totalMaxSize > 0
        ? (totalSize / this.options.totalMaxSize) * 100
        : 0;
    const filePercentage =
      this.options.maxFiles > 0 ? (fileCount / this.options.maxFiles) * 100 : 0;

    // Check if there are any type-level limits to display
    const hasTypeLimits = typeLimits && Object.keys(typeLimits).length > 0;

    // View mode toggle button (concise/detailed) - uses grid_view and list_view icons
    const viewModeToggleButton =
      this.options.allowLimitsViewToggle && hasTypeLimits
        ? `
      <button type="button" class="file-uploader-limits-toggle${
        isDetailed ? " is-expanded" : ""
      }" data-tooltip-text="${
            isDetailed ? "Switch to concise view" : "Switch to detailed view"
          }" data-tooltip-position="top">
        ${getIcon(isDetailed ? "grid_view" : "list_view", {
          class: "file-uploader-toggle-icon",
        })}
        <span>${isDetailed ? "Concise" : "Details"}</span>
      </button>
    `
        : "";

    // Only show the header if there are type limits to display
    let limitsHTML = hasTypeLimits
      ? `
      <div class="file-uploader-limits-header">
        <span class="file-uploader-limits-title">Upload Limits</span>
        ${viewModeToggleButton}
      </div>
    `
      : "";

    if (isDetailed) {
      // ===== DETAILED VIEW =====

      // File type specific limits - Top Section (Card Grid)
      if (typeLimits && Object.keys(typeLimits).length > 0) {
        limitsHTML += '<div class="file-uploader-limits-types">';

        for (const [type, limit] of Object.entries(typeLimits)) {
          const allowedExtensions = this.getAllowedExtensionsForType(type);
          const tooltipText =
            allowedExtensions.length > 0
              ? `Allowed: ${allowedExtensions
                  .map((ext) => `.${ext}`)
                  .join(", ")}`
              : "";

          const typeCount = this.getFileTypeCount(type);
          const typeCountLimit =
            this.options.perTypeMaxFileCount[type] || this.options.maxFiles;
          const typeSize = this.getFileTypeSize(type);
          const typeSizeFormatted = this.formatFileSize(typeSize);
          const typeLimitBytes = this.options.perTypeMaxTotalSize[type] || 0;
          const typeSizePercentage =
            typeLimitBytes > 0 ? (typeSize / typeLimitBytes) * 100 : 0;
          const typeIcon = getIcon(type, { class: "file-uploader-type-icon" });

          limitsHTML += `
            <div class="file-uploader-type-card" ${
              tooltipText
                ? `data-tooltip-text="${tooltipText}" data-tooltip-position="top"`
                : ""
            }>
              <div class="file-uploader-type-card-header">
                <div class="file-uploader-type-icon-wrapper">
                  ${typeIcon}
                </div>
                <span class="file-uploader-type-name">${this.capitalizeFirst(
                  type
                )}</span>
              </div>
              <div class="file-uploader-type-card-body">
                ${
                  this.options.showPerFileLimit
                    ? `
                  <div class="file-uploader-type-stat">
                    <span class="file-uploader-type-stat-label">Per file</span>
                    <span class="file-uploader-type-stat-value">${
                      this.options.perFileMaxSizePerTypeDisplay[type] ||
                      this.options.maxFileSizeDisplay
                    }</span>
                  </div>
                `
                    : ""
                }
                ${
                  this.options.showTypeGroupSize && typeLimitBytes > 0
                    ? `
                  <div class="file-uploader-type-stat">
                    <span class="file-uploader-type-stat-label">Used</span>
                    <span class="file-uploader-type-stat-value">${typeSizeFormatted} / ${limit}</span>
                  </div>
                  <div class="file-uploader-type-progress">
                    <div class="file-uploader-type-progress-bar" style="width: ${Math.min(
                      100,
                      typeSizePercentage
                    )}%"></div>
                  </div>
                `
                    : ""
                }
                ${
                  this.options.showTypeGroupCount
                    ? `
                  <div class="file-uploader-type-stat">
                    <span class="file-uploader-type-stat-label">Files</span>
                    <span class="file-uploader-type-stat-value">${typeCount} / ${typeCountLimit}</span>
                  </div>
                `
                    : ""
                }
              </div>
            </div>
          `;
        }

        // Add "Other" card for file types without specific limits
        const typesWithLimits = Object.keys(
          this.options.perFileMaxSizePerType || {}
        );
        const allTypesCovered = this.options.allowedExtensions.every((ext) => {
          const fileType = this.getFileType(ext);
          return typesWithLimits.includes(fileType);
        });

        if (!allTypesCovered && this.options.showPerFileLimit) {
          const otherExtensions = this.options.allowedExtensions.filter(
            (ext) => {
              const fileType = this.getFileType(ext);
              return !typesWithLimits.includes(fileType);
            }
          );

          const tooltipText =
            otherExtensions.length > 0
              ? `Allowed: ${otherExtensions.map((ext) => `.${ext}`).join(", ")}`
              : "";

          limitsHTML += `
            <div class="file-uploader-type-card" ${
              tooltipText
                ? `data-tooltip-text="${tooltipText}" data-tooltip-position="top"`
                : ""
            }>
              <div class="file-uploader-type-card-header">
                <div class="file-uploader-type-icon-wrapper">
                  ${getIcon("other", { class: "file-uploader-type-icon" })}
                </div>
                <span class="file-uploader-type-name">Other</span>
              </div>
              <div class="file-uploader-type-card-body">
                <div class="file-uploader-type-stat">
                  <span class="file-uploader-type-stat-label">Per file</span>
                  <span class="file-uploader-type-stat-value">${
                    this.options.perFileMaxSizeDisplay
                  }</span>
                </div>
              </div>
            </div>
          `;
        }

        limitsHTML += "</div>";
      }

      // General Limits Section - Overall constraints
      const generalLimitsHTML = `
        <div class="file-uploader-general-limits">
          <div class="file-uploader-general-limits-header">
            <span class="file-uploader-general-limits-title">General Limits</span>
          </div>
          <div class="file-uploader-general-limits-grid">
            <div class="file-uploader-general-card" data-tooltip-text="Maximum total size for all uploaded files combined" data-tooltip-position="top">
              <div class="file-uploader-general-card-icon">
                ${getIcon("storage", { class: "file-uploader-general-icon" })}
              </div>
              <div class="file-uploader-general-card-content">
                <span class="file-uploader-general-card-label">Total Size</span>
                <span class="file-uploader-general-card-value">${totalSizeFormatted} / ${
        this.options.totalMaxSizeDisplay
      }</span>
                ${
                  this.options.showProgressBar
                    ? `
                  <div class="file-uploader-general-card-progress">
                    <div class="file-uploader-general-card-progress-bar" style="width: ${Math.min(
                      100,
                      sizePercentage
                    )}%"></div>
                  </div>
                `
                    : ""
                }
              </div>
            </div>
            <div class="file-uploader-general-card" data-tooltip-text="Maximum number of files that can be uploaded" data-tooltip-position="top">
              <div class="file-uploader-general-card-icon">
                ${getIcon("calculator", {
                  class: "file-uploader-general-icon",
                })}
              </div>
              <div class="file-uploader-general-card-content">
                <span class="file-uploader-general-card-label">Total Files</span>
                <span class="file-uploader-general-card-value">${fileCount} / ${
        this.options.maxFiles
      }</span>
                ${
                  this.options.showProgressBar
                    ? `
                  <div class="file-uploader-general-card-progress">
                    <div class="file-uploader-general-card-progress-bar" style="width: ${Math.min(
                      100,
                      filePercentage
                    )}%"></div>
                  </div>
                `
                    : ""
                }
              </div>
            </div>
          </div>
        </div>
      `;

      limitsHTML += generalLimitsHTML;

      // Summary Section - Bottom Bar (deprecated, keeping for backwards compatibility)
      limitsHTML += `
        <div class="file-uploader-limits-summary" style="display: none;">
          <div class="file-uploader-summary-item" data-tooltip-text="Combined size of all uploaded files" data-tooltip-position="top">
            <div class="file-uploader-summary-header">
              <span class="file-uploader-summary-label">Total Size</span>
              <span class="file-uploader-summary-value">${totalSizeFormatted} / ${
        this.options.totalMaxSizeDisplay
      }</span>
            </div>
            ${
              this.options.showProgressBar
                ? `
              <div class="file-uploader-summary-progress">
                <div class="file-uploader-summary-progress-bar" style="width: ${Math.min(
                  100,
                  sizePercentage
                )}%"></div>
              </div>
            `
                : ""
            }
          </div>
          <div class="file-uploader-summary-item" data-tooltip-text="Number of files uploaded" data-tooltip-position="top">
            <div class="file-uploader-summary-header">
              <span class="file-uploader-summary-label">Files</span>
              <span class="file-uploader-summary-value">${fileCount} / ${
        this.options.maxFiles
      }</span>
            </div>
            ${
              this.options.showProgressBar
                ? `
              <div class="file-uploader-summary-progress">
                <div class="file-uploader-summary-progress-bar" style="width: ${Math.min(
                  100,
                  filePercentage
                )}%"></div>
              </div>
            `
                : ""
            }
          </div>
        </div>
      `;
    } else {
      // ===== CONCISE VIEW =====
      limitsHTML +=
        '<div class="file-uploader-limits-grid file-uploader-limits-concise">';

      // File type chips with expanded info (equal width)
      if (typeLimits && Object.keys(typeLimits).length > 0) {
        limitsHTML += '<div class="file-uploader-type-chips">';
        for (const [type, limit] of Object.entries(typeLimits)) {
          const allowedExtensions = this.getAllowedExtensionsForType(type);
          const typeCount = this.getFileTypeCount(type);
          const typeCountLimit =
            this.options.perTypeMaxFileCount[type] || this.options.maxFiles;
          const typeIcon = getIcon(type, { class: "file-uploader-chip-icon" });
          const tooltipText =
            allowedExtensions.length > 0
              ? `Allowed: ${allowedExtensions
                  .map((ext) => `.${ext}`)
                  .join(", ")}`
              : "";

          limitsHTML += `
            <div class="file-uploader-type-chip-expanded" ${
              tooltipText
                ? `data-tooltip-text="${tooltipText}" data-tooltip-position="top"`
                : ""
            }>
              <div class="file-uploader-chip-header">
                ${typeIcon}
                <span class="file-uploader-chip-name">${this.capitalizeFirst(
                  type
                )}</span>
                ${
                  typeCount > 0
                    ? `<span class="file-uploader-chip-badge">${typeCount}/${typeCountLimit}</span>`
                    : ""
                }
              </div>
              <div class="file-uploader-chip-info">
                <span class="file-uploader-chip-limit">${
                  this.options.perFileMaxSizePerTypeDisplay[type] ||
                  this.options.maxFileSizeDisplay
                } / file</span>
                <span class="file-uploader-chip-separator">•</span>
                <span class="file-uploader-chip-max">${typeCountLimit} files</span>
                <span class="file-uploader-chip-separator">•</span>
                <span class="file-uploader-chip-max">Total ${limit}</span>
              </div>
            </div>
          `;
        }

        // Add "Other" chip for file types without specific limits
        const typesWithLimits2 = Object.keys(
          this.options.perFileMaxSizePerType || {}
        );
        const allTypesCovered2 = this.options.allowedExtensions.every((ext) => {
          const fileType = this.getFileType(ext);
          return typesWithLimits2.includes(fileType);
        });

        if (!allTypesCovered2) {
          const otherExtensions = this.options.allowedExtensions.filter(
            (ext) => {
              const fileType = this.getFileType(ext);
              return !typesWithLimits2.includes(fileType);
            }
          );

          const tooltipText =
            otherExtensions.length > 0
              ? `Allowed: ${otherExtensions.map((ext) => `.${ext}`).join(", ")}`
              : "";

          limitsHTML += `
            <div class="file-uploader-type-chip-expanded" ${
              tooltipText
                ? `data-tooltip-text="${tooltipText}" data-tooltip-position="top"`
                : ""
            }>
              <div class="file-uploader-chip-header">
                ${getIcon("other", { class: "file-uploader-chip-icon" })}
                <span class="file-uploader-chip-name">Other</span>
              </div>
              <div class="file-uploader-chip-info">
                <span class="file-uploader-chip-limit">${
                  this.options.perFileMaxSizeDisplay
                } / file</span>
              </div>
            </div>
          `;
        }

        limitsHTML += "</div>";
      }

      // Compact summary bar with two separate progress bars
      limitsHTML += '<div class="file-uploader-compact-summary">';

      // Total Size progress bar and stat
      limitsHTML += `
        <div class="file-uploader-compact-item">
          <div class="file-uploader-compact-item-header">
            <span class="file-uploader-compact-item-label">Size</span>
            <span class="file-uploader-compact-item-value">${totalSizeFormatted} / ${
        this.options.totalMaxSizeDisplay
      }</span>
          </div>
          <div class="file-uploader-compact-progress">
            <div class="file-uploader-compact-progress-bar" style="width: ${Math.min(
              100,
              sizePercentage
            )}%"></div>
          </div>
        </div>
      `;

      // Total Files progress bar and stat
      limitsHTML += `
        <div class="file-uploader-compact-item">
          <div class="file-uploader-compact-item-header">
            <span class="file-uploader-compact-item-label">Files</span>
            <span class="file-uploader-compact-item-value">${fileCount} / ${
        this.options.maxFiles
      }</span>
          </div>
          <div class="file-uploader-compact-progress">
            <div class="file-uploader-compact-progress-bar" style="width: ${Math.min(
              100,
              filePercentage
            )}%"></div>
          </div>
        </div>
      `;

      limitsHTML += "</div>";
      limitsHTML += "</div>";
    }

    this.limitsContainer.innerHTML = limitsHTML;

    // Attach toggle events
    this.attachLimitsToggleEvents();

    // Initialize tooltips for limits grid items
    Tooltip.initAll(this.limitsContainer);

    // Show/hide button container based on file count
    const hasFiles = fileCount > 0;

    // For internal button container (download/clear buttons)
    if (this.buttonContainer) {
      this.buttonContainer.style.display = hasFiles ? "flex" : "none";
    }

    // For external buttons, use disabled state
    if (this.downloadAllBtn && this.options.downloadAllButtonElement) {
      this.downloadAllBtn.disabled = !hasFiles;
    }
    if (this.clearAllBtn && this.options.clearAllButtonElement) {
      this.clearAllBtn.disabled = !hasFiles;
    }
  }

  attachLimitsToggleEvents() {
    // Attach view mode toggle event (concise/detailed)
    const viewModeToggleBtn = this.limitsContainer.querySelector(
      ".file-uploader-limits-toggle"
    );
    if (viewModeToggleBtn) {
      viewModeToggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.limitsViewMode =
          this.limitsViewMode === "concise" ? "detailed" : "concise";
        this.updateLimitsDisplay();
      });
    }
  }

  getFileTypeCount(type) {
    // Count uploaded files by type
    return this.files.filter((f) => {
      if (!f.uploaded) return false;
      const fileType = this.getFileType(f.extension);
      return fileType === type.toLowerCase();
    }).length;
  }

  getFileTypeSize(type) {
    // Calculate total size of uploaded files by type
    return this.files
      .filter((f) => {
        if (!f.uploaded) return false;
        const fileType = this.getFileType(f.extension);
        return fileType === type.toLowerCase();
      })
      .reduce((total, file) => total + file.size, 0);
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getAllowedExtensionsForType(type) {
    // Map file type to its extensions from options
    const typeMap = {
      image: this.options.imageExtensions,
      video: this.options.videoExtensions,
      audio: this.options.audioExtensions,
      document: this.options.documentExtensions,
      archive: this.options.archiveExtensions,
    };

    const extensions = typeMap[type.toLowerCase()] || [];

    // Filter by allowed extensions if specified
    if (this.options.allowedExtensions.length > 0) {
      return extensions.filter((ext) =>
        this.options.allowedExtensions.includes(ext)
      );
    }

    return extensions;
  }

  attachEvents() {
    // Click to browse - only on dropzone or header, not on previews or buttons
    this.dropZone.addEventListener("click", (e) => {
      // Don't trigger if clicking on file input, preview items, buttons, or their children
      const isPreview = e.target.closest(".file-uploader-preview");
      const isDownloadBtn = e.target.closest(".file-uploader-download-all");
      const isClearBtn = e.target.closest(".file-uploader-clear-all");
      const isButtonContainer = e.target.closest(
        ".file-uploader-button-container"
      );
      const isActionContainer = e.target.closest(
        ".file-uploader-action-container"
      );
      const isInput = e.target === this.fileInput;

      if (
        !isPreview &&
        !isDownloadBtn &&
        !isClearBtn &&
        !isButtonContainer &&
        !isActionContainer &&
        !isInput
      ) {
        this.fileInput.click();
      }
    });

    // File input change
    this.fileInput.addEventListener("change", (e) => {
      this.handleFiles(e.target.files);
    });

    // Drag & drop events
    this.dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      this.dropZone.classList.add("file-uploader-dragover");
    });

    this.dropZone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      this.dropZone.classList.remove("file-uploader-dragover");
    });

    this.dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      this.dropZone.classList.remove("file-uploader-dragover");

      // Check if this is a cross-uploader drag
      const crossUploaderData = e.dataTransfer.getData(
        "application/x-file-uploader"
      );

      if (crossUploaderData) {
        // Cross-uploader drop
        try {
          const data = JSON.parse(crossUploaderData);
          this.handleCrossUploaderDrop(data, e);
        } catch (err) {
          console.error("Failed to parse cross-uploader data:", err);
        }
      } else if (e.dataTransfer.files.length > 0) {
        // Regular file drop from OS
        this.handleFiles(e.dataTransfer.files);
      }
    });
  }

  /**
   * Attach drag events to file preview for cross-uploader functionality
   */
  attachPreviewDragEvents(preview, fileObj) {
    preview.addEventListener("dragstart", (e) => {
      // Only allow drag if file is uploaded
      if (!fileObj.uploaded) {
        e.preventDefault();
        return;
      }

      this.draggedFileObj = fileObj;
      preview.classList.add("file-uploader-dragging");

      // Set custom data for cross-uploader identification
      const dragData = {
        sourceUploaderId: this.instanceId,
        fileId: fileObj.id,
        fileName: fileObj.name,
        fileSize: fileObj.size,
        serverFilename: fileObj.serverFilename,
        serverData: fileObj.serverData,
      };

      e.dataTransfer.setData(
        "application/x-file-uploader",
        JSON.stringify(dragData)
      );
      e.dataTransfer.effectAllowed = "copyMove";
    });

    preview.addEventListener("dragend", (e) => {
      preview.classList.remove("file-uploader-dragging");
      this.draggedFileObj = null;
    });
  }

  /**
   * Handle drop from another FileUploader instance
   */
  async handleCrossUploaderDrop(data, event) {
    const { sourceUploaderId, fileId, fileName } = data;

    // Check if dropped on same uploader - ignore
    if (sourceUploaderId === this.instanceId) {
      return;
    }

    // Get the source uploader instance
    const sourceUploader = uploaderRegistry.get(sourceUploaderId);
    if (!sourceUploader) {
      console.error("Source uploader not found:", sourceUploaderId);
      return;
    }

    // Find the file object in source uploader
    const sourceFileObj = sourceUploader.files.find((f) => f.id === fileId);
    if (!sourceFileObj) {
      console.error("File not found in source uploader:", fileId);
      return;
    }

    // Validate the file against this uploader's constraints
    const validation = this.validateCrossUploaderFile(sourceFileObj);
    if (!validation.valid) {
      this.showError(validation.error);
      return;
    }

    // Check for duplicates if enabled
    if (this.options.preventDuplicates) {
      const duplicate = this.checkDuplicateByNameSize(
        sourceFileObj.name,
        sourceFileObj.size
      );
      if (duplicate) {
        this.showError(
          `"${sourceFileObj.name}" is a duplicate file and has already been uploaded.`
        );
        if (this.options.onDuplicateFile) {
          this.options.onDuplicateFile(sourceFileObj, duplicate);
        }
        return;
      }
    }

    // Show move/copy dialog
    const action = await this.showMoveOrCopyDialog(fileName);

    if (!action) {
      // User cancelled
      return;
    }

    // Determine if we need server-side copy (different uploadDir)
    const sourceUploadDir = sourceUploader.options.uploadDir || "";
    const targetUploadDir = this.options.uploadDir || "";
    const needsServerCopy = sourceUploadDir !== targetUploadDir;

    // Copy/move the file to this uploader
    const result = await this.copyFileFromUploader(
      sourceFileObj,
      sourceUploader
    );

    if (!result.success) {
      this.showError(result.error || "Failed to copy/move file");
      return;
    }

    // If move was selected and copy succeeded, handle source cleanup
    if (action === "move") {
      if (needsServerCopy) {
        // Different directories: delete file from source server location
        await sourceUploader.deleteFile(sourceFileObj.id, {
          skipConfirmation: true,
        });
      } else {
        // Same directory: just remove from UI (file is shared)
        sourceUploader.removeFileFromUI(sourceFileObj.id);
      }
    }
  }

  /**
   * Check if a file with given name and size already exists
   * @param {string} name - File name
   * @param {number} size - File size
   * @returns {Object|null} - Returns the duplicate file object if found, null otherwise
   */
  checkDuplicateByNameSize(name, size) {
    const checkBy = this.options.duplicateCheckBy;
    const existingFiles = this.files.filter((f) => f.uploaded || f.uploading);

    for (const existingFile of existingFiles) {
      let isDuplicate = false;

      switch (checkBy) {
        case "name":
          isDuplicate = existingFile.name === name;
          break;
        case "size":
          isDuplicate = existingFile.size === size;
          break;
        case "name-size":
        default:
          isDuplicate =
            existingFile.name === name && existingFile.size === size;
      }

      if (isDuplicate) {
        return existingFile;
      }
    }
    return null;
  }

  /**
   * Remove a file from UI without deleting from server
   * Used when moving files between uploaders
   * @param {string|number} fileId - The file ID to remove
   */
  removeFileFromUI(fileId) {
    const fileObj = this.files.find((f) => f.id === fileId);
    if (!fileObj) return;

    // Remove preview element from DOM
    if (fileObj.previewElement) {
      fileObj.previewElement.remove();
    }

    // Remove from files array
    this.files = this.files.filter((f) => f.id !== fileId);

    // Remove from selected files if present
    this.selectedFiles.delete(fileId);
    this.updateSelectionUI();

    // Update limits display
    this.updateLimitsDisplay();

    // Update carousel
    this.updateCarousel();
  }

  /**
   * Show dialog asking user to move or copy the file
   */
  showMoveOrCopyDialog(fileName) {
    return new Promise((resolve) => {
      // Create dialog overlay
      const overlay = document.createElement("div");
      overlay.className = "file-uploader-dialog-overlay";

      const dialog = document.createElement("div");
      dialog.className = "file-uploader-dialog";

      dialog.innerHTML = `
        <div class="file-uploader-dialog-header">
          <h4>Transfer File</h4>
        </div>
        <div class="file-uploader-dialog-body">
          <p>What would you like to do with "<strong>${fileName}</strong>"?</p>
        </div>
        <div class="file-uploader-dialog-footer">
          <button type="button" class="file-uploader-dialog-btn file-uploader-dialog-btn-secondary" data-action="cancel">
            Cancel
          </button>
          <button type="button" class="file-uploader-dialog-btn file-uploader-dialog-btn-primary" data-action="copy">
            ${getIcon("copy")} Copy
          </button>
          <button type="button" class="file-uploader-dialog-btn file-uploader-dialog-btn-primary" data-action="move">
            ${getIcon("move")} Move
          </button>
        </div>
      `;

      overlay.appendChild(dialog);
      document.body.appendChild(overlay);

      // Focus the dialog
      dialog.querySelector("button[data-action='move']").focus();

      // Handle button clicks
      const handleClick = (e) => {
        const action = e.target.closest("button")?.dataset.action;
        if (action) {
          overlay.remove();
          resolve(action === "cancel" ? null : action);
        }
      };

      // Handle escape key
      const handleKeydown = (e) => {
        if (e.key === "Escape") {
          overlay.remove();
          resolve(null);
        }
      };

      dialog.addEventListener("click", handleClick);
      document.addEventListener("keydown", handleKeydown, { once: true });

      // Handle click outside dialog
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.remove();
          resolve(null);
        }
      });
    });
  }

  /**
   * Show a confirmation dialog
   * @param {Object} options - Dialog options
   * @param {string} options.title - Dialog title
   * @param {string} options.message - Dialog message (can include HTML)
   * @param {string} options.confirmText - Text for confirm button (default: "Delete")
   * @param {string} options.cancelText - Text for cancel button (default: "Cancel")
   * @param {string} options.confirmClass - CSS class for confirm button (default: "danger")
   * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled
   */
  showConfirmDialog(options = {}) {
    const {
      title = "Confirm",
      message = "Are you sure?",
      confirmText = "Delete",
      cancelText = "Cancel",
      confirmClass = "danger",
    } = options;

    return new Promise((resolve) => {
      // Create dialog overlay
      const overlay = document.createElement("div");
      overlay.className = "file-uploader-dialog-overlay";

      const dialog = document.createElement("div");
      dialog.className = "file-uploader-dialog file-uploader-dialog-confirm";

      dialog.innerHTML = `
        <div class="file-uploader-dialog-header">
          <h4>${title}</h4>
        </div>
        <div class="file-uploader-dialog-body">
          <p>${message}</p>
        </div>
        <div class="file-uploader-dialog-footer">
          <button type="button" class="file-uploader-dialog-btn file-uploader-dialog-btn-secondary" data-action="cancel">
            ${cancelText}
          </button>
          <button type="button" class="file-uploader-dialog-btn file-uploader-dialog-btn-${confirmClass}" data-action="confirm">
            ${getIcon("trash")} ${confirmText}
          </button>
        </div>
      `;

      overlay.appendChild(dialog);
      document.body.appendChild(overlay);

      // Focus the cancel button (safer default)
      dialog.querySelector("button[data-action='cancel']").focus();

      // Handle button clicks
      const handleClick = (e) => {
        const action = e.target.closest("button")?.dataset.action;
        if (action) {
          overlay.remove();
          document.removeEventListener("keydown", handleKeydown);
          resolve(action === "confirm");
        }
      };

      // Handle escape key
      const handleKeydown = (e) => {
        if (e.key === "Escape") {
          overlay.remove();
          document.removeEventListener("keydown", handleKeydown);
          resolve(false);
        }
      };

      dialog.addEventListener("click", handleClick);
      document.addEventListener("keydown", handleKeydown);

      // Handle click outside dialog
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.remove();
          document.removeEventListener("keydown", handleKeydown);
          resolve(false);
        }
      });
    });
  }

  /**
   * Copy a file from another uploader to this one
   */
  async copyFileFromUploader(sourceFileObj, sourceUploader) {
    const sourceUploadDir = sourceUploader.options.uploadDir || "";
    const targetUploadDir = this.options.uploadDir || "";
    const needsServerCopy = sourceUploadDir !== targetUploadDir;

    let serverFilename = sourceFileObj.serverFilename;
    let serverData = { ...sourceFileObj.serverData };

    // If different directories, call server to copy the file
    if (needsServerCopy) {
      try {
        const response = await fetch(this.options.copyFileUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sourceFilename: sourceFileObj.serverFilename,
            sourceUploadDir: sourceUploadDir,
            targetUploadDir: targetUploadDir,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          return {
            success: false,
            error: result.error || "Failed to copy file on server",
          };
        }

        // Update with new server data
        serverFilename = result.file.filename;
        serverData = result.file;

        // If file was renamed due to conflict, notify
        if (result.renamed) {
          console.log(
            `File renamed from "${sourceFileObj.serverFilename}" to "${serverFilename}" to avoid conflict`
          );
        }
      } catch (error) {
        console.error("Error copying file to server:", error);
        return { success: false, error: "Network error while copying file" };
      }
    }

    // Create a new file object with the same data
    const newFileObj = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      file: sourceFileObj.file,
      name: sourceFileObj.name,
      size: sourceFileObj.size,
      type: sourceFileObj.type,
      extension: sourceFileObj.extension,
      uploaded: true,
      uploading: false,
      serverFilename: serverFilename,
      serverData: serverData,
      captureType: sourceFileObj.captureType,
    };

    // Add to files array
    this.files.push(newFileObj);

    // Create preview
    this.createPreview(newFileObj);

    // Show success state (file is already uploaded)
    this.updatePreviewState(newFileObj, "success");

    // Show download button (since file is already uploaded)
    if (newFileObj.downloadBtn) {
      newFileObj.downloadBtn.style.display = "flex";
    }

    // Update limits display
    this.updateLimitsDisplay();

    // Update carousel
    this.updateCarousel();

    return { success: true, fileObj: newFileObj };
  }

  handleFiles(fileList) {
    const files = Array.from(fileList);

    files.forEach((file) => {
      // Check for duplicates if enabled
      if (this.options.preventDuplicates) {
        const duplicate = this.checkDuplicate(file);
        if (duplicate) {
          this.showError(
            `"${file.name}" is a duplicate file and has already been uploaded.`
          );

          // Call duplicate callback if provided
          if (this.options.onDuplicateFile) {
            this.options.onDuplicateFile(file, duplicate);
          }

          return; // Skip this file
        }
      }

      // Validate file
      const validation = this.validateFile(file);

      if (!validation.valid) {
        // Show error message with file name - do NOT create preview
        this.showError(validation.error);
        return; // Skip this file completely
      }

      // Create file object
      const fileObj = {
        id: Date.now() + Math.random(),
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        extension: this.getFileExtension(file.name),
        uploaded: false,
        uploading: false,
        error: null,
        serverFilename: null,
      };

      this.files.push(fileObj);
      this.createPreview(fileObj);
      this.uploadFile(fileObj);
    });

    // Clear input
    this.fileInput.value = "";
  }

  validateFile(file) {
    // Check max files limit - count all files (uploaded + uploading + pending)
    const totalFileCount = this.files.length;
    if (totalFileCount >= this.options.maxFiles) {
      return {
        valid: false,
        error: `Maximum number of files (${this.options.maxFiles}) reached. Please delete some files before uploading more.`,
      };
    }

    // Check file extension
    const extension = this.getFileExtension(file.name);
    if (
      this.options.allowedExtensions.length > 0 &&
      !this.options.allowedExtensions.includes(extension)
    ) {
      const allowedList = this.options.allowedExtensions
        .slice(0, 5)
        .map((ext) => `.${ext}`)
        .join(", ");
      const moreText =
        this.options.allowedExtensions.length > 5
          ? ` and ${this.options.allowedExtensions.length - 5} more`
          : "";
      return {
        valid: false,
        error: `"${file.name}" file type is not allowed. Allowed types: ${allowedList}${moreText}.`,
      };
    }

    // Check per-file size limit (for a SINGLE file)
    const fileType = this.getFileType(extension);

    // Use per-type limit if available, otherwise use general limit
    const perFileLimit =
      this.options.perFileMaxSizePerType[fileType] ||
      this.options.perFileMaxSize;
    const perFileLimitDisplay =
      this.options.perFileMaxSizePerTypeDisplay[fileType] ||
      this.options.perFileMaxSizeDisplay;

    if (file.size > perFileLimit) {
      return {
        valid: false,
        error: `"${file.name}" exceeds the maximum ${fileType} file size of ${perFileLimitDisplay}.`,
      };
    }

    // Check per-file-type TOTAL size limit (for all files of that type combined)
    const typeLimit = this.options.perTypeMaxTotalSize[fileType];
    if (typeLimit) {
      const currentTypeSize = this.getFileTypeSize(fileType);
      if (currentTypeSize + file.size > typeLimit) {
        const limitDisplay = this.options.perTypeMaxTotalSizeDisplay[fileType];
        const remaining = typeLimit - currentTypeSize;
        return {
          valid: false,
          error: `Adding "${
            file.name
          }" would exceed the total ${fileType} size limit of ${limitDisplay}. Available: ${this.formatFileSize(
            remaining
          )}.`,
        };
      }
    }

    // Check total size limit
    const currentTotalSize = this.getTotalSize();
    if (currentTotalSize + file.size > this.options.totalMaxSize) {
      const remaining = this.options.totalMaxSize - currentTotalSize;
      return {
        valid: false,
        error: `Adding "${file.name}" would exceed the total size limit of ${
          this.options.totalMaxSizeDisplay
        }. Available: ${this.formatFileSize(remaining)}.`,
      };
    }

    return { valid: true };
  }

  /**
   * Validate a file from cross-uploader drag-drop operation
   * Checks all constraints (extension, size limits, file count, etc.)
   * @param {Object} fileObj - The source file object from another uploader
   * @returns {Object} - { valid: boolean, error?: string }
   */
  validateCrossUploaderFile(fileObj) {
    // Check max files limit
    const totalFileCount = this.files.length;
    if (totalFileCount >= this.options.maxFiles) {
      return {
        valid: false,
        error: `Maximum number of files (${this.options.maxFiles}) reached. Please delete some files before adding more.`,
      };
    }

    // Check file extension
    const extension = fileObj.extension || this.getFileExtension(fileObj.name);
    if (
      this.options.allowedExtensions.length > 0 &&
      !this.options.allowedExtensions.includes(extension)
    ) {
      const allowedList = this.options.allowedExtensions
        .slice(0, 5)
        .map((ext) => `.${ext}`)
        .join(", ");
      const moreText =
        this.options.allowedExtensions.length > 5
          ? ` and ${this.options.allowedExtensions.length - 5} more`
          : "";
      return {
        valid: false,
        error: `"${fileObj.name}" file type (.${extension}) is not allowed in this uploader. Allowed types: ${allowedList}${moreText}.`,
      };
    }

    // Check per-file size limit
    const fileType = this.getFileType(extension);
    const perFileLimit =
      this.options.perFileMaxSizePerType[fileType] ||
      this.options.perFileMaxSize;
    const perFileLimitDisplay =
      this.options.perFileMaxSizePerTypeDisplay[fileType] ||
      this.options.perFileMaxSizeDisplay;

    if (fileObj.size > perFileLimit) {
      return {
        valid: false,
        error: `"${fileObj.name}" exceeds the maximum ${fileType} file size of ${perFileLimitDisplay}.`,
      };
    }

    // Check per-file-type TOTAL size limit
    const typeLimit = this.options.perTypeMaxTotalSize[fileType];
    if (typeLimit) {
      const currentTypeSize = this.getFileTypeSize(fileType);
      if (currentTypeSize + fileObj.size > typeLimit) {
        const limitDisplay = this.options.perTypeMaxTotalSizeDisplay[fileType];
        const remaining = typeLimit - currentTypeSize;
        return {
          valid: false,
          error: `Adding "${
            fileObj.name
          }" would exceed the total ${fileType} size limit of ${limitDisplay}. Available: ${this.formatFileSize(
            remaining
          )}.`,
        };
      }
    }

    // Check per-file-type file COUNT limit
    const typeCountLimit = this.options.perTypeMaxFileCount[fileType];
    if (typeCountLimit) {
      const currentTypeCount = this.getFileTypeCount(fileType);
      if (currentTypeCount >= typeCountLimit) {
        return {
          valid: false,
          error: `Maximum number of ${fileType} files (${typeCountLimit}) reached. Please delete some ${fileType} files before adding more.`,
        };
      }
    }

    // Check total size limit
    const currentTotalSize = this.getTotalSize();
    if (currentTotalSize + fileObj.size > this.options.totalMaxSize) {
      const remaining = this.options.totalMaxSize - currentTotalSize;
      return {
        valid: false,
        error: `Adding "${fileObj.name}" would exceed the total size limit of ${
          this.options.totalMaxSizeDisplay
        }. Available: ${this.formatFileSize(remaining)}.`,
      };
    }

    return { valid: true };
  }

  /**
   * Check if a file is a duplicate
   * @param {File} file - The file to check
   * @returns {Object|null} - Returns the duplicate file object if found, null otherwise
   */
  checkDuplicate(file) {
    const checkBy = this.options.duplicateCheckBy;

    // Only check against uploaded or uploading files
    const existingFiles = this.files.filter((f) => f.uploaded || f.uploading);

    for (const existingFile of existingFiles) {
      let isDuplicate = false;

      switch (checkBy) {
        case "name":
          // Check by file name only
          isDuplicate = existingFile.name === file.name;
          break;

        case "size":
          // Check by file size only
          isDuplicate = existingFile.size === file.size;
          break;

        case "name-size":
          // Check by both name and size (default)
          isDuplicate =
            existingFile.name === file.name && existingFile.size === file.size;
          break;

        case "hash":
          // For hash-based comparison, we would need to compute file hash
          // This is async and more complex, so we'll use name-size as fallback
          console.warn(
            'FileUploader: Hash-based duplicate check not implemented yet. Using "name-size" instead.'
          );
          isDuplicate =
            existingFile.name === file.name && existingFile.size === file.size;
          break;

        default:
          // Default to name-size
          isDuplicate =
            existingFile.name === file.name && existingFile.size === file.size;
      }

      if (isDuplicate) {
        return existingFile;
      }
    }

    return null;
  }

  getTotalSize() {
    return this.files
      .filter((f) => f.uploaded)
      .reduce((total, f) => total + f.size, 0);
  }

  getFileExtension(filename) {
    return filename.split(".").pop().toLowerCase();
  }

  getFileType(extension) {
    if (this.options.imageExtensions.includes(extension)) {
      return "image";
    } else if (this.options.videoExtensions.includes(extension)) {
      return "video";
    } else if (this.options.audioExtensions.includes(extension)) {
      return "audio";
    } else if (this.options.documentExtensions.includes(extension)) {
      return "document";
    } else if (this.options.archiveExtensions.includes(extension)) {
      return "archive";
    }
    return "other";
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  createPreview(fileObj) {
    let fileType = this.getFileType(fileObj.extension);

    // Override file type for captured audio recordings (webm can be both audio/video)
    if (fileObj.captureType === "audio_recording") {
      fileType = "audio";
    }

    const preview = document.createElement("div");
    preview.className = "file-uploader-preview";
    preview.dataset.fileId = fileObj.id;

    // Make preview draggable for cross-uploader drag-drop
    if (this.options.enableCrossUploaderDrag) {
      preview.draggable = true;
      preview.dataset.uploaderId = this.instanceId;
      this.attachPreviewDragEvents(preview, fileObj);
    }

    const previewInner = document.createElement("div");
    previewInner.className = "file-uploader-preview-inner";

    // Create preview content based on file type
    let previewContent = "";

    if (fileType === "image") {
      const objectUrl = URL.createObjectURL(fileObj.file);
      previewContent = `<img src="${objectUrl}" alt="${fileObj.name}" class="file-uploader-preview-image">`;
    } else if (fileType === "video") {
      const objectUrl = URL.createObjectURL(fileObj.file);
      // Create video element with thumbnail extraction
      previewContent = `
        <video src="${objectUrl}" class="file-uploader-preview-video" data-file-id="${
        fileObj.id
      }"></video>
        <canvas class="file-uploader-video-thumbnail" data-file-id="${
          fileObj.id
        }" style="display: none;"></canvas>
        <div class="file-uploader-video-play-overlay">
          ${getIcon("play", { class: "file-uploader-video-play-icon" })}
        </div>
        <div class="file-uploader-media-duration" data-file-id="${
          fileObj.id
        }" style="display: none;"></div>
      `;
    } else if (fileType === "audio") {
      // Audio file preview with icon only (no audio element needed)
      const objectUrl = URL.createObjectURL(fileObj.file);
      previewContent = `
        <div class="file-uploader-preview-audio">
          ${getIcon("audio", { class: "file-uploader-audio-icon" })}
          <audio src="${objectUrl}" class="file-uploader-preview-audio-element" data-file-id="${
        fileObj.id
      }" style="display: none;"></audio>
          <div class="file-uploader-media-duration" data-file-id="${
            fileObj.id
          }" style="display: none;"></div>
        </div>
      `;
    } else {
      // Determine icon based on file extension
      let iconName = "text_file"; // Default icon
      const ext = fileObj.extension.toLowerCase();

      if (ext === "pdf") {
        iconName = "pdf_file";
      } else if (
        ext === "zip" ||
        ext === "rar" ||
        ext === "7z" ||
        ext === "tar" ||
        ext === "gz"
      ) {
        iconName = "zip_file";
      } else if (ext === "xlsx" || ext === "xls") {
        iconName = "excel";
      } else if (ext === "csv") {
        iconName = "csv_file";
      } else if (ext === "doc" || ext === "docx") {
        iconName = "word_file";
      } else if (ext === "ppt" || ext === "pptx") {
        iconName = "ppt_file";
      } else if (ext === "txt" || ext === "md" || ext === "log") {
        iconName = "text_file";
      }

      previewContent = `
                <div class="file-uploader-preview-file">
                    ${getIcon(iconName, { class: "file-uploader-file-icon" })}
                    <span class="file-uploader-extension">.${
                      fileObj.extension
                    }</span>
                </div>
            `;
    }

    // Add capture indicator if this is a captured/recorded file
    const captureIndicator =
      fileObj.captureType === "screenshot"
        ? `<div class="file-uploader-capture-indicator" title="Captured Screenshot">
              ${getIcon("camera")}
           </div>`
        : fileObj.captureType === "recording"
        ? `<div class="file-uploader-capture-indicator" title="Recorded Video">
              ${getIcon("video")}
           </div>`
        : fileObj.captureType === "audio_recording"
        ? `<div class="file-uploader-capture-indicator" title="Recorded Audio">
              ${getIcon("audio")}
           </div>`
        : "";

    const actions = `<div class="file-uploader-actions">
                <button type="button" class="file-uploader-download" data-file-id="${
                  fileObj.id
                }" title="Download file" style="display: none;">
                    ${getIcon("download")}
                </button>
                <button type="button" class="file-uploader-delete" data-file-id="${
                  fileObj.id
                }" title="Delete file">
                    ${getIcon("trash")}
                </button>
            </div>`;

    previewInner.innerHTML = `
            <div class="file-uploader-selection-checkbox">
              <input type="checkbox" class="file-uploader-checkbox" data-file-id="${
                fileObj.id
              }">
            </div>
            ${previewContent}
            ${captureIndicator}
            <div class="file-uploader-preview-overlay">
                <div class="file-uploader-spinner"></div>
                <div class="file-uploader-progress-container">
                    <div class="file-uploader-progress-bar"></div>
                </div>
                <div class="file-uploader-progress-text">0%</div>
            </div>
            <div class="file-uploader-success-overlay">
                ${getIcon("check_circle", {
                  class: "file-uploader-success-icon",
                })}
            </div>
        `;

    const info = document.createElement("div");
    info.className = "file-uploader-info";

    info.innerHTML = `
            ${actions}            
            <div class="file-uploader-info-text">            
                <div class="file-uploader-filename" title="${fileObj.name}">${
      fileObj.name
    }</div>
                <div class="file-uploader-meta">
                    <span class="file-uploader-type">${fileObj.extension.toUpperCase()}</span>
                    <span class="file-uploader-size">${this.formatFileSize(
                      fileObj.size
                    )}</span>
                </div>
            </div>            
        `;

    preview.appendChild(previewInner);
    preview.appendChild(info);
    this.previewContainer.appendChild(preview);

    // Attach delete event
    const deleteBtn = preview.querySelector(".file-uploader-delete");
    deleteBtn.addEventListener("click", async () => {
      if (this.options.confirmBeforeDelete) {
        const confirmed = await this.showConfirmDialog({
          title: "Delete File",
          message: `Are you sure you want to delete "<strong>${fileObj.name}</strong>"?`,
          confirmText: "Delete",
        });
        if (confirmed) {
          this.deleteFile(fileObj.id);
        }
      } else {
        this.deleteFile(fileObj.id);
      }
    });

    // Attach download event (will be shown after upload completes)
    const downloadBtn = preview.querySelector(".file-uploader-download");
    downloadBtn.addEventListener("click", () => this.downloadFile(fileObj.id));

    // Attach checkbox selection event
    const checkbox = preview.querySelector(".file-uploader-checkbox");
    checkbox.addEventListener("change", (e) => {
      if (e.target.checked) {
        this.selectedFiles.add(fileObj.id);
        preview.classList.add("selected");
      } else {
        this.selectedFiles.delete(fileObj.id);
        preview.classList.remove("selected");
      }
      this.updateSelectionUI();
    });

    fileObj.previewElement = preview;
    fileObj.downloadBtn = downloadBtn;

    // Attach click event to open carousel preview (only on the preview inner area)
    if (this.options.enableCarouselPreview) {
      previewInner.addEventListener("click", (e) => {
        // Don't open carousel if clicking on checkbox, buttons, or overlays
        if (
          e.target.closest(".file-uploader-checkbox") ||
          e.target.closest(".file-uploader-actions") ||
          e.target.closest(".file-uploader-preview-overlay") ||
          e.target.closest(".file-uploader-success-overlay")
        ) {
          return;
        }

        // Only open carousel if file is uploaded
        if (fileObj.uploaded) {
          this.openCarousel(fileObj.id);
        }
      });

      // Add cursor pointer style to indicate clickability
      previewInner.style.cursor = "pointer";
    }

    // Extract video thumbnail if this is a video file
    if (fileType === "video") {
      this.extractVideoThumbnail(fileObj.id);
    }

    // Extract audio duration if this is an audio file
    if (fileType === "audio") {
      this.extractAudioDuration(fileObj.id);
    }
  }

  extractVideoThumbnail(fileId) {
    const preview = this.previewContainer.querySelector(
      `[data-file-id="${fileId}"]`
    );
    if (!preview) return;

    const video = preview.querySelector(".file-uploader-preview-video");
    const canvas = preview.querySelector(".file-uploader-video-thumbnail");

    if (!video || !canvas) return;

    // Wait for video metadata to load
    video.addEventListener("loadedmetadata", () => {
      // Display video duration
      this.displayMediaDuration(fileId, video.duration);

      // Seek to 1 second (or 10% of duration, whichever is smaller)
      const seekTime = Math.min(1, video.duration * 0.1);
      video.currentTime = seekTime;
    });

    // Capture frame when seeked
    video.addEventListener(
      "seeked",
      () => {
        try {
          // Set canvas dimensions to match video
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Draw video frame to canvas
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Convert canvas to image and replace video element
          const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.8);

          // Create thumbnail image
          const thumbnailImg = document.createElement("img");
          thumbnailImg.src = thumbnailUrl;
          thumbnailImg.className =
            "file-uploader-preview-image file-uploader-video-thumbnail-img";
          thumbnailImg.alt = "Video thumbnail";

          // Replace video with thumbnail
          video.style.display = "none";
          video.parentNode.insertBefore(thumbnailImg, video);

          // Clean up
          canvas.remove();
        } catch (error) {
          console.warn("Failed to extract video thumbnail:", error);
          // Keep video element visible if thumbnail extraction fails
        }
      },
      { once: true }
    );

    // Handle load errors
    video.addEventListener(
      "error",
      () => {
        console.warn("Failed to load video for thumbnail extraction");
        canvas.remove();
      },
      { once: true }
    );
  }

  extractAudioDuration(fileId) {
    const preview = this.previewContainer.querySelector(
      `[data-file-id="${fileId}"]`
    );
    if (!preview) return;

    const audio = preview.querySelector(".file-uploader-preview-audio-element");
    if (!audio) return;

    // Wait for audio metadata to load
    audio.addEventListener(
      "loadedmetadata",
      () => {
        // Display audio duration
        this.displayMediaDuration(fileId, audio.duration);
      },
      { once: true }
    );

    // Handle load errors
    audio.addEventListener(
      "error",
      () => {
        console.warn("Failed to load audio metadata");
      },
      { once: true }
    );
  }

  displayMediaDuration(fileId, duration) {
    const preview = this.previewContainer.querySelector(
      `[data-file-id="${fileId}"]`
    );
    if (!preview) return;

    const durationElement = preview.querySelector(
      ".file-uploader-media-duration"
    );
    if (!durationElement) return;

    // Format duration as MM:SS or HH:MM:SS
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);

    let formattedDuration;
    if (hours > 0) {
      formattedDuration = `${hours}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(seconds).padStart(2, "0")}`;
    } else {
      formattedDuration = `${minutes}:${String(seconds).padStart(2, "0")}`;
    }

    durationElement.textContent = formattedDuration;
    durationElement.style.display = "block";
  }

  async uploadFile(fileObj) {
    fileObj.uploading = true;
    this.updatePreviewState(fileObj, "uploading");

    if (this.options.onUploadStart) {
      this.options.onUploadStart(fileObj);
    }

    const formData = new FormData();
    formData.append("file", fileObj.file);

    // Add upload directory if specified
    if (this.options.uploadDir) {
      formData.append("uploadDir", this.options.uploadDir);
    }

    try {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          this.updateProgress(fileObj, percentComplete);
        }
      });

      // Handle completion
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);
              resolve(result);
            } catch (e) {
              reject(new Error("Invalid JSON response"));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error during upload"));
        });

        xhr.addEventListener("abort", () => {
          reject(new Error("Upload cancelled"));
        });
      });

      // Send request
      xhr.open("POST", this.options.uploadUrl);
      xhr.send(formData);

      const result = await uploadPromise;

      if (result.success) {
        fileObj.uploaded = true;
        fileObj.uploading = false;
        fileObj.serverFilename = result.file.filename;
        fileObj.serverData = result.file;

        // Ensure progress reaches 100%
        this.updateProgress(fileObj, 100);

        // Show success state with checkmark
        this.updatePreviewState(fileObj, "success");

        // Show download button after successful upload
        if (fileObj.downloadBtn) {
          fileObj.downloadBtn.style.display = "flex";
        }

        // Update limits display
        this.updateLimitsDisplay();

        // Update carousel with new file
        this.updateCarousel();

        if (this.options.onUploadSuccess) {
          this.options.onUploadSuccess(fileObj, result);
        }
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      fileObj.uploading = false;
      fileObj.error = error.message;

      // Remove the preview since upload failed
      if (fileObj.previewElement) {
        fileObj.previewElement.remove();
      }

      // Remove from files array
      this.files = this.files.filter((f) => f.id !== fileObj.id);

      // Show error message
      this.showError(error.message);

      if (this.options.onUploadError) {
        this.options.onUploadError(fileObj, error);
      }
    }
  }

  updateProgress(fileObj, percent) {
    if (!fileObj.previewElement) return;

    const progressBar = fileObj.previewElement.querySelector(
      ".file-uploader-progress-bar"
    );
    const progressText = fileObj.previewElement.querySelector(
      ".file-uploader-progress-text"
    );

    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }

    if (progressText) {
      progressText.textContent = `${Math.round(percent)}%`;
    }
  }

  updatePreviewState(fileObj, state) {
    if (!fileObj.previewElement) return;

    const overlay = fileObj.previewElement.querySelector(
      ".file-uploader-preview-overlay"
    );
    const successOverlay = fileObj.previewElement.querySelector(
      ".file-uploader-success-overlay"
    );
    const spinner = fileObj.previewElement.querySelector(
      ".file-uploader-spinner"
    );
    const progressContainer = fileObj.previewElement.querySelector(
      ".file-uploader-progress-container"
    );
    const progressText = fileObj.previewElement.querySelector(
      ".file-uploader-progress-text"
    );

    fileObj.previewElement.classList.remove("uploading", "success", "error");

    if (state === "uploading") {
      fileObj.previewElement.classList.add("uploading");
      overlay.style.display = "flex";
      if (spinner) spinner.style.display = "none";
      if (progressContainer) progressContainer.style.display = "block";
      if (progressText) progressText.style.display = "block";
      if (successOverlay) {
        successOverlay.classList.remove("slide-in", "slide-out");
      }
    } else if (state === "success") {
      fileObj.previewElement.classList.add("success");

      // Hide upload overlay
      overlay.style.display = "none";

      // Show success checkmark with slide-in animation
      if (successOverlay) {
        // Remove any existing animation classes and force reflow
        successOverlay.classList.remove("slide-in", "slide-out");

        // Force reflow to restart animation
        void successOverlay.offsetWidth;

        // Trigger slide-in animation
        successOverlay.classList.add("slide-in");

        // After 1.2 seconds, start slide-out animation
        setTimeout(() => {
          if (successOverlay) {
            successOverlay.classList.remove("slide-in");
            successOverlay.classList.add("slide-out");

            // After slide-out animation completes (300ms), remove class
            setTimeout(() => {
              if (successOverlay) {
                successOverlay.classList.remove("slide-out");
              }
            }, 100);
          }
        }, 500);
      }
    } else if (state === "error") {
      fileObj.previewElement.classList.add("error");
      overlay.style.display = "none";
      if (successOverlay) {
        successOverlay.classList.remove("slide-in", "slide-out");
      }
    }
  }

  /**
   * Delete a file
   * @param {string|number} fileId - The file ID to delete
   * @param {Object} options - Delete options
   * @param {boolean} options.skipCarouselUpdate - Skip carousel update (for batch operations)
   */
  async deleteFile(fileId, options = {}) {
    const { skipCarouselUpdate = false } = options;
    const fileObj = this.files.find((f) => f.id === fileId);
    if (!fileObj) return;

    // If file was uploaded to server, delete from server
    if (fileObj.uploaded && fileObj.serverFilename) {
      try {
        const deleteData = {
          filename: fileObj.serverFilename,
        };

        // Add upload directory if specified
        if (this.options.uploadDir) {
          deleteData.uploadDir = this.options.uploadDir;
        }

        const response = await fetch(this.options.deleteUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(deleteData),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Delete failed");
        }

        if (this.options.onDeleteSuccess) {
          this.options.onDeleteSuccess(fileObj, result);
        }
      } catch (error) {
        this.showError(`Failed to delete ${fileObj.name}: ${error.message}`);

        if (this.options.onDeleteError) {
          this.options.onDeleteError(fileObj, error);
        }
        return;
      }
    }

    // Remove from UI
    if (fileObj.previewElement) {
      fileObj.previewElement.remove();
    }

    // Remove from files array
    this.files = this.files.filter((f) => f.id !== fileId);

    // Remove from selected files if present
    this.selectedFiles.delete(fileId);
    this.updateSelectionUI();

    // Update limits display
    this.updateLimitsDisplay();

    // Update carousel after file deletion (unless skipped for batch operations)
    if (!skipCarouselUpdate) {
      this.updateCarousel();
    }
  }

  downloadFile(fileId) {
    const fileObj = this.files.find((f) => f.id === fileId);
    if (!fileObj || !fileObj.uploaded) return;

    // Create download link
    const downloadUrl =
      fileObj.serverData?.url || `uploads/${fileObj.serverFilename}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileObj.name; // Use original filename for download
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  showError(message) {
    console.error("FileUploader:", message);

    // Use the Alert notification system
    Alert.error(message, {
      animation: this.options.alertAnimation,
      duration: this.options.alertDuration,
    });
  }

  /**
   * Show a success notification
   * @param {string} message - Success message to display
   */
  showSuccess(message) {
    Alert.success(message, {
      animation: this.options.alertAnimation,
      duration: this.options.alertDuration,
    });
  }

  /**
   * Show a warning notification
   * @param {string} message - Warning message to display
   */
  showWarning(message) {
    Alert.warning(message, {
      animation: this.options.alertAnimation,
      duration: this.options.alertDuration,
    });
  }

  /**
   * Show an info notification
   * @param {string} message - Info message to display
   */
  showInfo(message) {
    Alert.info(message, {
      animation: this.options.alertAnimation,
      duration: this.options.alertDuration,
    });
  }

  getFiles() {
    return this.files;
  }

  getUploadedFiles() {
    return this.files.filter((f) => f.uploaded);
  }

  getUploadedFileNames() {
    // Returns array of server filenames for form submission
    return this.files.filter((f) => f.uploaded).map((f) => f.serverFilename);
  }

  getUploadedFilesData() {
    // Returns detailed data for form submission
    return this.files
      .filter((f) => f.uploaded)
      .map((f) => ({
        originalName: f.name,
        serverFilename: f.serverFilename,
        size: f.size,
        type: f.type,
        extension: f.extension,
        url: f.serverData?.url || `uploads/${f.serverFilename}`,
      }));
  }

  async downloadAll() {
    const uploadedFiles = this.getUploadedFilesData();

    if (uploadedFiles.length === 0) {
      this.showError("No files to download");
      return;
    }

    console.log("Downloading files:", uploadedFiles);

    // Show loading state
    const originalHTML = this.downloadAllBtn.innerHTML;
    this.downloadAllBtn.disabled = true;
    this.downloadAllBtn.innerHTML = `
            <div class="file-uploader-spinner" style="width: 16px; height: 16px; border-width: 2px;"></div>
            <span>Preparing...</span>
        `;

    try {
      const requestBody = { files: uploadedFiles };
      console.log("Sending request to:", this.options.downloadAllUrl);
      console.log("Request body:", requestBody);

      const response = await fetch(this.options.downloadAllUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);

      const responseText = await response.text();
      console.log("Response text:", responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error(
          "Invalid JSON response: " + responseText.substring(0, 200)
        );
      }

      if (!result.success) {
        throw new Error(result.error || "Download failed");
      }

      // Download the file
      const link = document.createElement("a");
      link.href = result.url;
      link.download = result.filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup temporary zip file if created
      if (result.type === "zip" && result.cleanup) {
        setTimeout(async () => {
          try {
            await fetch(this.options.cleanupZipUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                filename: result.cleanup,
              }),
            });
          } catch (error) {
            console.warn("Failed to cleanup temporary zip:", error);
          }
        }, 2000); // Wait 2 seconds for download to start
      }
    } catch (error) {
      this.showError(`Download failed: ${error.message}`);
    } finally {
      // Restore button state
      this.downloadAllBtn.disabled = false;
      this.downloadAllBtn.innerHTML = originalHTML;
    }
  }

  clear() {
    // Stop any active preloading first
    if (this.carousel) {
      this.carousel.updateFiles([]);
    }

    // Delete files from server (skip carousel updates during batch)
    this.files.forEach((fileObj) => {
      if (fileObj.uploaded && fileObj.serverFilename) {
        this.deleteFile(fileObj.id, { skipCarouselUpdate: true });
      }
    });
    this.files = [];
    this.previewContainer.innerHTML = "";

    // Update carousel once at the end
    this.updateCarousel();
  }

  async clearAll() {
    const uploadedFiles = this.files.filter((f) => f.uploaded);

    if (uploadedFiles.length === 0) {
      this.showError("No files to clear");
      return;
    }

    // Show confirmation dialog if enabled
    if (this.options.confirmBeforeDelete) {
      const confirmed = await this.showConfirmDialog({
        title: "Clear All Files",
        message: `Are you sure you want to delete all <strong>${uploadedFiles.length}</strong> file(s)?`,
        confirmText: "Delete All",
      });

      if (!confirmed) {
        return;
      }
    }

    // Stop any active preloading first
    if (this.carousel) {
      this.carousel.updateFiles([]);
    }

    // Delete all files (skip carousel updates during batch)
    const deletePromises = uploadedFiles.map((fileObj) =>
      this.deleteFile(fileObj.id, { skipCarouselUpdate: true })
    );

    await Promise.all(deletePromises);

    // Update carousel once at the end
    this.updateCarousel();
  }

  attachBeforeUnloadHandler() {
    // Only attach if cleanupOnUnload is enabled
    if (!this.options.cleanupOnUnload) {
      return;
    }

    // Store bound handler so we can remove it later
    this.beforeUnloadHandler = () => {
      const uploadedFiles = this.files.filter((f) => f.uploaded);

      if (uploadedFiles.length > 0) {
        // Prepare file data for deletion
        const fileData = uploadedFiles.map((f) => ({
          filename: f.serverFilename,
        }));

        // Build request payload with uploadDir if specified
        const payload = { files: fileData };
        if (this.options.uploadDir) {
          payload.uploadDir = this.options.uploadDir;
        }

        // Use sendBeacon for reliable cleanup even when page is unloading
        // This is a fire-and-forget request that will complete even if page closes
        if (navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify(payload)], {
            type: "application/json",
          });
          navigator.sendBeacon(this.options.deleteUrl, blob);
        }
      }
    };

    // Attach the handler
    window.addEventListener("beforeunload", this.beforeUnloadHandler);
  }

  destroy() {
    // Remove event listeners
    if (this.beforeUnloadHandler) {
      window.removeEventListener("beforeunload", this.beforeUnloadHandler);
    }

    // Cleanup carousel
    this.destroyCarousel();

    this.wrapper.remove();
    this.files = [];
  }

  // Update selection UI (show/hide selected action buttons and update count)
  updateSelectionUI() {
    const selectedCount = this.selectedFiles.size;
    const selectionInfo = this.selectedActionContainer.querySelector(
      ".file-uploader-selection-info"
    );

    if (selectedCount > 0) {
      selectionInfo.textContent = `${selectedCount} selected`;
      this.selectedActionContainer.style.display = "flex";
      // Hide regular button container when selection is active
      if (this.buttonContainer) {
        this.buttonContainer.style.display = "none";
      }
    } else {
      this.selectedActionContainer.style.display = "none";
      // Show regular button container if files exist
      const hasFiles = this.files.length > 0;
      if (this.buttonContainer) {
        this.buttonContainer.style.display = hasFiles ? "flex" : "none";
      }
    }
  }

  // Download selected files
  async downloadSelected() {
    const selectedFilesData = this.files
      .filter((f) => this.selectedFiles.has(f.id) && f.uploaded)
      .map((f) => ({
        originalName: f.name,
        serverFilename: f.serverFilename,
        size: f.size,
        type: f.type,
        extension: f.extension,
        url: f.serverData?.url || `uploads/${f.serverFilename}`,
      }));

    if (selectedFilesData.length === 0) {
      console.warn("No uploaded files selected to download");
      return;
    }

    // If only one file is selected, download it directly
    if (selectedFilesData.length === 1) {
      const file = selectedFilesData[0];
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.originalName;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // For multiple files, create a zip (use existing downloadAll infrastructure)
    try {
      const response = await fetch(this.options.downloadAllUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ files: selectedFilesData }),
      });

      const responseText = await response.text();
      let result;

      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error(
          "Invalid JSON response: " + responseText.substring(0, 200)
        );
      }

      if (!result.success) {
        throw new Error(result.error || "Download failed");
      }

      // Download the file using result.url (not downloadUrl)
      const link = document.createElement("a");
      link.href = result.url;
      link.download = result.filename || "selected-files.zip";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup temporary zip file if created
      if (result.type === "zip" && result.cleanup) {
        setTimeout(async () => {
          try {
            await fetch(this.options.cleanupZipUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                filename: result.cleanup,
              }),
            });
          } catch (error) {
            console.warn("Failed to cleanup temporary zip:", error);
          }
        }, 2000); // Wait 2 seconds for download to start
      }
    } catch (error) {
      console.error("Download selected failed:", error);
      this.showError(`Download failed: ${error.message}`);
    }
  }

  // Delete selected files
  async deleteSelected() {
    const selectedFileIds = Array.from(this.selectedFiles);

    if (selectedFileIds.length === 0) {
      return;
    }

    // Confirm deletion if enabled
    if (this.options.confirmBeforeDelete) {
      const confirmed = await this.showConfirmDialog({
        title: "Delete Selected",
        message: `Are you sure you want to delete <strong>${selectedFileIds.length}</strong> selected file(s)?`,
        confirmText: "Delete",
      });
      if (!confirmed) {
        return;
      }
    }

    // Delete each selected file
    for (const fileId of selectedFileIds) {
      await this.deleteFile(fileId);
    }

    // Clear selection
    this.selectedFiles.clear();
    this.updateSelectionUI();
  }

  // ============================================================================
  // Carousel Preview Methods
  // ============================================================================

  /**
   * Initialize the carousel preview component
   */
  initCarousel() {
    if (!this.options.enableCarouselPreview) return;

    // Create carousel container (appended to body for proper z-index stacking)
    this.carouselContainer = document.createElement("div");
    this.carouselContainer.className = "file-uploader-carousel-container";
    document.body.appendChild(this.carouselContainer);

    // Initialize carousel with empty files (will update when files are uploaded)
    this.carousel = new FileCarousel({
      container: this.carouselContainer,
      files: [],
      autoPreload: this.options.carouselAutoPreload,
      enableManualLoading: this.options.carouselEnableManualLoading,
      visibleTypes: this.options.carouselVisibleTypes,
      previewableTypes: this.options.carouselPreviewableTypes,
      maxPreviewRows: this.options.carouselMaxPreviewRows,
      maxTextPreviewChars: this.options.carouselMaxTextPreviewChars,
      onFileDownload: (file) => {
        // Use the file uploader's download logic
        const fileObj = this.files.find((f) => f.id === file.originalId);
        if (fileObj) {
          this.downloadFile(fileObj.id);
        }
      },
    });
  }

  /**
   * Convert file uploader files to carousel format
   * @returns {Array} Files in carousel format
   */
  getCarouselFiles() {
    return this.files
      .filter((f) => f.uploaded && f.serverFilename)
      .map((f) => {
        const fileType = this.getFileType(f.extension);
        const carouselType = this.mapToCarouselType(f.extension, fileType);
        const url = f.serverData?.url || `uploads/${f.serverFilename}`;

        // Get thumbnail for images/videos
        let thumbnail = null;
        if (fileType === "image") {
          thumbnail = url;
        } else if (fileType === "video" && f.previewElement) {
          const thumbImg = f.previewElement.querySelector(
            ".file-uploader-video-thumbnail-img"
          );
          if (thumbImg) {
            thumbnail = thumbImg.src;
          }
        }

        return {
          originalId: f.id,
          name: f.name,
          carouselType: carouselType,
          url: url,
          thumbnail: thumbnail,
          size: f.size,
          extension: f.extension,
        };
      });
  }

  /**
   * Map file extension to carousel type
   * @param {string} extension - File extension
   * @param {string} fileType - File type from getFileType()
   * @returns {string} Carousel type
   */
  mapToCarouselType(extension, fileType) {
    const ext = extension.toLowerCase();

    // Direct mapping for known types
    if (fileType === "image") return "image";
    if (fileType === "video") return "video";
    if (fileType === "audio") return "audio";

    // Document types with specific carousel support
    if (ext === "pdf") return "pdf";
    if (ext === "xlsx" || ext === "xls") return "excel";
    if (ext === "csv") return "csv";
    if (
      ext === "txt" ||
      ext === "md" ||
      ext === "log" ||
      ext === "json" ||
      ext === "xml"
    )
      return "text";

    // Default to text for other document types (won't have preview)
    return "text";
  }

  /**
   * Update carousel with current files
   */
  updateCarousel() {
    if (!this.carousel || !this.options.enableCarouselPreview) return;

    const carouselFiles = this.getCarouselFiles();
    this.carousel.updateFiles(carouselFiles);
  }

  /**
   * Open carousel at specific file
   * @param {string} fileId - File ID to open
   */
  openCarousel(fileId) {
    if (!this.carousel || !this.options.enableCarouselPreview) return;

    // Update carousel files first
    this.updateCarousel();

    // Find index of file in carousel
    const carouselFiles = this.getCarouselFiles();
    const index = carouselFiles.findIndex((f) => f.originalId === fileId);

    if (index !== -1) {
      this.carousel.open(index);
    }
  }

  /**
   * Destroy carousel instance
   */
  destroyCarousel() {
    if (this.carousel) {
      this.carousel.destroy();
      this.carousel = null;
    }
    if (this.carouselContainer) {
      this.carouselContainer.remove();
      this.carouselContainer = null;
    }
  }
}

// Export for use in modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = FileUploader;
}

export { FileUploader };
