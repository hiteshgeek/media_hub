/**
 * FileUploader Class
 * A flexible file uploader with drag & drop, preview, and AJAX upload
 * Compatible with Bootstrap 3-5 and standalone usage
 */

import { getIcon } from "../utils/icons.js";
import ScreenCapture from "../utils/ScreenCapture.js";
import VideoRecorder from "../utils/VideoRecorder.js";

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
      archiveExtensions: ["zip", "rar", "7z"],
      multiple: true,
      autoFetchConfig: true,
      showLimits: true,
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
    this.screenCapture = null;
    this.videoRecorder = null;
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

    // Create button container for both buttons inside dropzone
    if (
      (this.downloadAllBtn && this.options.showDownloadAllButton) ||
      (this.clearAllBtn && this.options.showClearAllButton)
    ) {
      this.buttonContainer = document.createElement("div");
      this.buttonContainer.className = "file-uploader-button-container";
      this.buttonContainer.style.display = "none"; // Initially hidden

      if (this.downloadAllBtn && this.options.showDownloadAllButton) {
        this.buttonContainer.appendChild(this.downloadAllBtn);
      }
      if (this.clearAllBtn && this.options.showClearAllButton) {
        this.buttonContainer.appendChild(this.clearAllBtn);
      }

      this.dropZone.appendChild(this.buttonContainer);
    }

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
      this.downloadAllBtn.addEventListener("click", () => this.downloadAll());
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
      this.clearAllBtn.addEventListener("click", () => this.clearAll());
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
      this.clearAllBtn.addEventListener("click", () => this.clearAll());
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
      this.screenshotBtn.title = "Capture Screenshot";
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
      this.videoRecordBtn.title = "Record Video";
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
        <span class="file-uploader-recording-time">00:00</span>
      `;
      this.captureButtonContainer.appendChild(this.recordingIndicator);
    }

    // Append capture buttons to dropzone
    if (this.captureButtonContainer.children.length > 0) {
      this.dropZone.appendChild(this.captureButtonContainer);
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
    if (this.videoRecorder && this.videoRecorder.getRecordingStatus()) {
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

      // Initialize video recorder if not already done
      if (!this.videoRecorder) {
        this.videoRecorder = new VideoRecorder();
      }

      // Start recording
      await this.videoRecorder.startRecording();

      // Update UI
      if (this.videoRecordBtn) {
        this.videoRecordBtn.classList.add("recording");
        this.videoRecordBtn.innerHTML = getIcon("stop");
        this.videoRecordBtn.title = "Stop Recording";
        this.videoRecordBtn.disabled = false;
      }

      // Show recording indicator
      if (this.recordingIndicator) {
        this.recordingIndicator.style.display = "flex";
        this.startRecordingTimer();
      }
    } catch (error) {
      this.showError(error.message);

      // Re-enable button
      if (this.videoRecordBtn) {
        this.videoRecordBtn.disabled = false;
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

      // Stop recording indicator
      this.stopRecordingTimer();

      // Stop recording and get file
      const file = await this.videoRecorder.stopRecording();

      // Add recorded file with metadata
      this.handleCapturedFile(file, "recording");

      // Update UI
      if (this.videoRecordBtn) {
        this.videoRecordBtn.classList.remove("recording");
        this.videoRecordBtn.title = "Record Video";
        this.videoRecordBtn.disabled = false;
      }

      // Hide recording indicator
      if (this.recordingIndicator) {
        this.recordingIndicator.style.display = "none";
      }
    } catch (error) {
      this.showError(error.message);

      // Re-enable button
      if (this.videoRecordBtn) {
        this.videoRecordBtn.disabled = false;
      }
    }
  }

  startRecordingTimer() {
    this.recordingTimerInterval = setInterval(() => {
      if (this.videoRecorder) {
        const duration = this.videoRecorder.getRecordingDuration();
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        const timeText = `${String(minutes).padStart(2, "0")}:${String(
          seconds
        ).padStart(2, "0")}`;

        const timeElement = this.recordingIndicator.querySelector(
          ".file-uploader-recording-time"
        );
        if (timeElement) {
          timeElement.textContent = timeText;
        }
      }
    }, 1000);
  }

  stopRecordingTimer() {
    if (this.recordingTimerInterval) {
      clearInterval(this.recordingTimerInterval);
      this.recordingTimerInterval = null;
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

        const tooltip = `${
          tooltipText
            ? `
                                <span class="file-uploader-tooltip-wrapper">
                                    ${getIcon("info", {
                                      class: "file-uploader-info-icon",
                                    })}
                                    <span class="file-uploader-tooltip">${tooltipText}</span>
                                </span>
                            `
            : ""
        }`;

        limitsHTML += `
                    <div class="file-uploader-limit-item file-uploader-limit-stacked">
                        <span class="file-uploader-limit-label">
                            ${this.capitalizeFirst(type)}
                        </span>
                        <span class="file-uploader-limit-value">${limit}</span>
                        ${tooltip}
                    </div>
                `;
      }
    }

    // Total size limit
    limitsHTML += `
            <div class="file-uploader-limit-item file-uploader-limit-highlight file-uploader-limit-stacked">
                <span class="file-uploader-limit-label">Total Size</span>
                <span class="file-uploader-limit-value">${totalSizeFormatted} / ${this.options.totalSizeLimitDisplay}</span>
            </div>
        `;

    // Max files limit
    limitsHTML += `
            <div class="file-uploader-limit-item file-uploader-limit-highlight file-uploader-limit-stacked">
                <span class="file-uploader-limit-label">Files</span>
                <span class="file-uploader-limit-value">${fileCount} / ${this.options.maxFiles}</span>
            </div>
        `;

    limitsHTML += "</div>";

    this.limitsContainer.innerHTML = limitsHTML;

    // Show/hide button container based on file count
    const hasFiles = fileCount > 0;

    // For internal button container
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

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getAllowedExtensionsForType(type) {
    // Map file type to its extensions from options
    const typeMap = {
      image: this.options.imageExtensions,
      video: this.options.videoExtensions,
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
      const isInput = e.target === this.fileInput;

      if (
        !isPreview &&
        !isDownloadBtn &&
        !isClearBtn &&
        !isButtonContainer &&
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
    const fileType = this.getFileType(fileObj.extension);

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
      previewContent = `<video src="${objectUrl}" class="file-uploader-preview-video"></video>`;
    } else {
      previewContent = `
                <div class="file-uploader-preview-file">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                        <polyline points="13 2 13 9 20 9"></polyline>
                    </svg>
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
            ${previewContent}
            ${captureIndicator}
            <div class="file-uploader-preview-overlay">
                <div class="file-uploader-spinner"></div>
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

    fileObj.previewElement = preview;
    fileObj.downloadBtn = downloadBtn;
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
      const response = await fetch(this.options.uploadUrl, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        fileObj.uploaded = true;
        fileObj.uploading = false;
        fileObj.serverFilename = result.file.filename;
        fileObj.serverData = result.file;

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

  updatePreviewState(fileObj, state) {
    if (!fileObj.previewElement) return;

    const overlay = fileObj.previewElement.querySelector(
      ".file-uploader-preview-overlay"
    );

    fileObj.previewElement.classList.remove("uploading", "success", "error");

    if (state === "uploading") {
      fileObj.previewElement.classList.add("uploading");
      overlay.style.display = "flex";
    } else if (state === "success") {
      fileObj.previewElement.classList.add("success");
      overlay.style.display = "none";
    } else if (state === "error") {
      fileObj.previewElement.classList.add("error");
      overlay.style.display = "none";
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
}

// Export for use in modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = FileUploader;
}

export { FileUploader };
