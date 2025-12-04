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

export default class FileUploader {
  constructor(element, options = {}) {
    this.element =
      typeof element === "string" ? document.querySelector(element) : element;

    if (!this.element) {
      console.error("FileUploader: Element not found");
      return;
    }

    // Default options
    this.options = {
      uploadUrl: "upload.php",
      deleteUrl: "delete.php",
      downloadAllUrl: "download-all.php",
      cleanupZipUrl: "cleanup-zip.php",
      configUrl: "get-config.php",
      allowedExtensions: [],
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFileSizeDisplay: "10MB",
      fileTypeSizeLimits: {},
      fileTypeSizeLimitsDisplay: {},
      totalSizeLimit: 100 * 1024 * 1024, // 100MB
      totalSizeLimitDisplay: "100MB",
      maxFiles: 10,
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
      preventDuplicates: false, // Prevent uploading the same file again
      duplicateCheckBy: "name-size", // How to check duplicates: 'name', 'size', 'name-size', 'hash'
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
      onUploadStart: null,
      onUploadSuccess: null,
      onUploadError: null,
      onDeleteSuccess: null,
      onDeleteError: null,
      onDuplicateFile: null, // Callback when duplicate file is detected
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
    this.screenCapture = null;
    this.videoRecorder = null;
    this.audioRecorder = null;
    this.recordingUI = new RecordingUI(this);
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

    this.dropZoneHeader.innerHTML = `
                ${getIcon("upload", { class: "file-uploader-icon" })}
                <p class="file-uploader-text">Drag & drop files here or click to browse</p>
                <p class="file-uploader-subtext">Maximum file size: ${
                  this.options.maxFileSizeDisplay
                }</p>
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
    this.selectedActionContainer.className = "file-uploader-selected-action-container";
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
      this.screenshotBtn.setAttribute("data-tooltip-text", "Capture Screenshot");
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
        timeElement.setAttribute("data-tooltip-text", "Click to toggle time display");
        timeElement.setAttribute("data-tooltip-position", "top");
        timeElement.dataset.showRemaining = "false";
        timeElement.addEventListener("click", (e) => {
          e.stopPropagation();
          // Toggle between elapsed/total and remaining time display
          timeElement.dataset.showRemaining = timeElement.dataset.showRemaining === "false" ? "true" : "false";
        });
      }

      this.captureButtonContainer.appendChild(this.recordingIndicator);
    }

    // Audio recording button
    if (this.options.enableAudioRecording && AudioWorkletRecorder.isSupported()) {
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
          timeElement.setAttribute("data-tooltip-text", "Click to toggle time display");
          timeElement.setAttribute("data-tooltip-position", "top");
          timeElement.dataset.showRemaining = "false";
          timeElement.addEventListener("click", (e) => {
            e.stopPropagation();
            // Toggle between elapsed/total and remaining time display
            timeElement.dataset.showRemaining = timeElement.dataset.showRemaining === "false" ? "true" : "false";
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
      if (!this.audioRecorder) {
        this.audioRecorder = new AudioWorkletRecorder({
          enableMicrophoneAudio: this.options.enableMicrophoneAudio,
          enableSystemAudio: this.options.enableSystemAudio,
          maxRecordingDuration: this.options.maxAudioRecordingDuration,
          sampleRate: 48000, // High quality audio
          bitDepth: 16,
          numberOfChannels: 2, // Stereo
        });
      }

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

    let limitsHTML = '<div class="file-uploader-limits-grid">';

    // File type specific limits
    const typeLimits = this.options.fileTypeSizeLimitsDisplay;
    if (typeLimits && Object.keys(typeLimits).length > 0) {
      for (const [type, limit] of Object.entries(typeLimits)) {
        // Get allowed extensions for this file type
        const allowedExtensions = this.getAllowedExtensionsForType(type);
        const tooltipText =
          allowedExtensions.length > 0
            ? `Allowed: ${allowedExtensions.map((ext) => `.${ext}`).join(", ")}`
            : "";

        // Get type statistics
        const typeCount = this.getFileTypeCount(type);
        const typeSize = this.getFileTypeSize(type);
        const typeSizeFormatted = this.formatFileSize(typeSize);
        const typeLimitBytes = this.options.fileTypeSizeLimits[type] || 0;

        // Build detailed information sections
        let detailsHtml = "";

        // Per file limit - display as "size / file"
        if (this.options.showPerFileLimit && this.options.maxFileSizeDisplay) {
          detailsHtml += `<div class="file-uploader-limit-detail">
            <span class="file-uploader-limit-detail-value">${this.options.maxFileSizeDisplay} / file</span>
          </div>`;
        }

        // Type group size - display as "current size / limit"
        if (this.options.showTypeGroupSize && typeLimitBytes > 0) {
          const sizePercentage = (typeSize / typeLimitBytes) * 100;
          detailsHtml += `<div class="file-uploader-limit-detail">
            <span class="file-uploader-limit-detail-value">${typeSizeFormatted} / ${limit}</span>
            ${this.options.showProgressBar ? `<div class="file-uploader-limit-progress-mini"><div class="file-uploader-limit-progress-bar" style="width: ${Math.min(100, sizePercentage)}%"></div></div>` : ""}
          </div>`;
        }

        // Type group file count
        if (this.options.showTypeGroupCount) {
          detailsHtml += `<div class="file-uploader-limit-detail">
            <span class="file-uploader-limit-detail-label">Files:</span>
            <span class="file-uploader-limit-detail-value">${typeCount}</span>
          </div>`;
        }

        limitsHTML += `
                    <div class="file-uploader-limit-item file-uploader-limit-detailed" ${
                      tooltipText ? `data-tooltip-text="${tooltipText}" data-tooltip-position="top"` : ""
                    }>
                        <div class="file-uploader-limit-header">
                            <span class="file-uploader-limit-label">
                                ${this.capitalizeFirst(type)}
                            </span>
                        </div>
                        ${detailsHtml ? `<div class="file-uploader-limit-details">${detailsHtml}</div>` : ""}
                    </div>
                `;
      }
    }

    // Total size limit with optional progress bar
    const sizePercentage =
      this.options.totalSizeLimit > 0
        ? (totalSize / this.options.totalSizeLimit) * 100
        : 0;
    const sizeProgressBar = this.options.showProgressBar
      ? `<div class="file-uploader-limit-progress"><div class="file-uploader-limit-progress-bar" style="width: ${Math.min(
          100,
          sizePercentage
        )}%"></div></div>`
      : "";

    limitsHTML += `
            <div class="file-uploader-limit-item file-uploader-total-size-limit-item file-uploader-limit-highlight file-uploader-limit-stacked ${
              this.options.showProgressBar
                ? "file-uploader-limit-with-progress"
                : ""
            }" data-tooltip-text="Combined size of all uploaded files" data-tooltip-position="top">
                <span class="file-uploader-limit-label">Total Size</span>
                <span class="file-uploader-limit-value">${totalSizeFormatted} / ${
      this.options.totalSizeLimitDisplay
    }</span>
                ${sizeProgressBar}
            </div>
        `;

    // Max files limit with optional progress bar
    const filePercentage =
      this.options.maxFiles > 0 ? (fileCount / this.options.maxFiles) * 100 : 0;
    const fileProgressBar = this.options.showProgressBar
      ? `<div class="file-uploader-limit-progress"><div class="file-uploader-limit-progress-bar" style="width: ${Math.min(
          100,
          filePercentage
        )}%"></div></div>`
      : "";

    limitsHTML += `
            <div class="file-uploader-limit-item file-uploader-file-count-limit-item file-uploader-limit-highlight file-uploader-limit-stacked ${
              this.options.showProgressBar
                ? "file-uploader-limit-with-progress"
                : ""
            }" data-tooltip-text="Number of files uploaded" data-tooltip-position="top">
                <span class="file-uploader-limit-label">Files</span>
                <span class="file-uploader-limit-value">${fileCount} / ${
      this.options.maxFiles
    }</span>
                ${fileProgressBar}
            </div>
        `;

    limitsHTML += "</div>";

    this.limitsContainer.innerHTML = limitsHTML;

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
      this.handleFiles(e.dataTransfer.files);
    });
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
    // Check max files limit
    const uploadedCount = this.files.filter((f) => f.uploaded).length;
    if (uploadedCount >= this.options.maxFiles) {
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

    // Check per-file-type size limit
    const fileType = this.getFileType(extension);
    const typeLimit = this.options.fileTypeSizeLimits[fileType];
    if (typeLimit && file.size > typeLimit) {
      const limitDisplay = this.options.fileTypeSizeLimitsDisplay[fileType];
      return {
        valid: false,
        error: `"${file.name}" exceeds the ${fileType} file size limit of ${limitDisplay}.`,
      };
    }

    // Check general file size
    if (file.size > this.options.maxFileSize) {
      return {
        valid: false,
        error: `"${file.name}" is too large. Maximum file size is ${this.options.maxFileSizeDisplay}.`,
      };
    }

    // Check total size limit
    const currentTotalSize = this.getTotalSize();
    if (currentTotalSize + file.size > this.options.totalSizeLimit) {
      const remaining = this.options.totalSizeLimit - currentTotalSize;
      return {
        valid: false,
        error: `Adding "${file.name}" would exceed the total size limit of ${
          this.options.totalSizeLimitDisplay
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
        <div class="file-uploader-media-duration" data-file-id="${fileObj.id}" style="display: none;"></div>
      `;
    } else if (fileType === "audio") {
      // Audio file preview with icon only (no audio element needed)
      const objectUrl = URL.createObjectURL(fileObj.file);
      previewContent = `
        <div class="file-uploader-preview-audio">
          ${getIcon("audio", { class: "file-uploader-audio-icon" })}
          <audio src="${objectUrl}" class="file-uploader-preview-audio-element" data-file-id="${fileObj.id}" style="display: none;"></audio>
          <div class="file-uploader-media-duration" data-file-id="${fileObj.id}" style="display: none;"></div>
        </div>
      `;
    } else {
      // Determine icon based on file extension
      let iconName = "text_file"; // Default icon
      const ext = fileObj.extension.toLowerCase();

      if (ext === "pdf") {
        iconName = "pdf_file";
      } else if (ext === "zip" || ext === "rar" || ext === "7z" || ext === "tar" || ext === "gz") {
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
                    <span class="file-uploader-extension">.${fileObj.extension}</span>
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
              <input type="checkbox" class="file-uploader-checkbox" data-file-id="${fileObj.id}">
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
    deleteBtn.addEventListener("click", () => this.deleteFile(fileObj.id));

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

    const durationElement = preview.querySelector(".file-uploader-media-duration");
    if (!durationElement) return;

    // Format duration as MM:SS or HH:MM:SS
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);

    let formattedDuration;
    if (hours > 0) {
      formattedDuration = `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
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

        // After 2.5 seconds, start slide-out animation
        setTimeout(() => {
          if (successOverlay) {
            successOverlay.classList.remove("slide-in");
            successOverlay.classList.add("slide-out");

            // After slide-out animation completes (400ms), remove class
            setTimeout(() => {
              if (successOverlay) {
                successOverlay.classList.remove("slide-out");
              }
            }, 400);
          }
        }, 2500);
      }
    } else if (state === "error") {
      fileObj.previewElement.classList.add("error");
      overlay.style.display = "none";
      if (successOverlay) {
        successOverlay.classList.remove("slide-in", "slide-out");
      }
    }
  }

  async deleteFile(fileId) {
    const fileObj = this.files.find((f) => f.id === fileId);
    if (!fileObj) return;

    // If file was uploaded to server, delete from server
    if (fileObj.uploaded && fileObj.serverFilename) {
      try {
        const response = await fetch(this.options.deleteUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: fileObj.serverFilename,
          }),
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

    // Create error message with icon
    const errorDiv = document.createElement("div");
    errorDiv.className = "file-uploader-error";
    errorDiv.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="file-uploader-error-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>${message}</span>
        `;

    // Insert error message before the dropzone (since preview is now inside dropzone)
    this.wrapper.insertBefore(errorDiv, this.dropZone);

    // Auto-remove after 6 seconds
    setTimeout(() => {
      errorDiv.style.opacity = "0";
      setTimeout(() => errorDiv.remove(), 300);
    }, 6000);
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
    this.files.forEach((fileObj) => {
      if (fileObj.uploaded && fileObj.serverFilename) {
        this.deleteFile(fileObj.id);
      }
    });
    this.files = [];
    this.previewContainer.innerHTML = "";
  }

  async clearAll() {
    const uploadedFiles = this.files.filter((f) => f.uploaded);

    if (uploadedFiles.length === 0) {
      this.showError("No files to clear");
      return;
    }

    // Show confirmation dialog
    const confirmed = confirm(
      `Are you sure you want to delete all ${uploadedFiles.length} file(s)?`
    );

    if (!confirmed) {
      return;
    }

    // Delete all files
    const deletePromises = uploadedFiles.map((fileObj) =>
      this.deleteFile(fileObj.id)
    );

    await Promise.all(deletePromises);
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

        // Use sendBeacon for reliable cleanup even when page is unloading
        // This is a fire-and-forget request that will complete even if page closes
        if (navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify({ files: fileData })], {
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

    this.wrapper.remove();
    this.files = [];
  }

  // Update selection UI (show/hide selected action buttons and update count)
  updateSelectionUI() {
    const selectedCount = this.selectedFiles.size;
    const selectionInfo = this.selectedActionContainer.querySelector(".file-uploader-selection-info");

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
      .filter(f => this.selectedFiles.has(f.id) && f.uploaded)
      .map(f => ({
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
        throw new Error("Invalid JSON response: " + responseText.substring(0, 200));
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

    // Confirm deletion
    if (!confirm(`Delete ${selectedFileIds.length} selected file(s)?`)) {
      return;
    }

    // Delete each selected file
    for (const fileId of selectedFileIds) {
      await this.deleteFile(fileId);
    }

    // Clear selection
    this.selectedFiles.clear();
    this.updateSelectionUI();
  }
}

// Export for use in modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = FileUploader;
}

export { FileUploader };
