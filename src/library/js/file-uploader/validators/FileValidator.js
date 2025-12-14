/**
 * FileValidator.js
 *
 * Validation utilities for file uploads.
 * Handles size limits, type restrictions, duplicates, and cross-uploader validation.
 *
 * @module FileValidator
 */

// ============================================================
// FILE VALIDATOR CLASS
// Encapsulates all file validation logic
// ============================================================

/**
 * FileValidator - Validates files against upload constraints
 *
 * @class
 * @param {Object} options - FileUploader options
 * @param {Function} getFilesCallback - Function to get current files array
 */
export class FileValidator {
  constructor(options, getFilesCallback) {
    this.options = options;
    this.getFiles = getFilesCallback;
  }

  // ============================================================
  // MAIN VALIDATION
  // ============================================================

  /**
   * Validate a file against all constraints
   * @param {File} file - The file to validate
   * @returns {Object} - { valid: boolean, error?: object }
   */
  validateFile(file) {
    const files = this.getFiles();
    const totalFileCount = files.length;

    // Check max files limit
    if (totalFileCount >= this.options.limits.maxFiles) {
      return {
        valid: false,
        error: {
          filename: file.name,
          error: "Maximum file limit reached",
          details: this.formatAlertDetails(
            "Limit:",
            `${this.options.limits.maxFiles} files`
          ),
        },
      };
    }

    // Check file extension
    const extension = this.getFileExtension(file.name);
    if (
      this.options.fileTypes.allowedExtensions.length > 0 &&
      !this.options.fileTypes.allowedExtensions.includes(extension)
    ) {
      const allowedExtensions = this.options.fileTypes.allowedExtensions
        .slice(0, 5)
        .map((ext) => `.${ext}`);
      const moreCount = this.options.fileTypes.allowedExtensions.length - 5;
      if (moreCount > 0) {
        allowedExtensions.push(`+${moreCount} more`);
      }
      return {
        valid: false,
        error: {
          filename: file.name,
          error: "File type not allowed",
          details: this.formatAlertDetails("Allowed:", allowedExtensions),
        },
      };
    }

    // Check per-file size limit
    const fileType = this.getFileType(extension);
    const perFileLimit =
      this.options.perTypeLimits.perFileMaxSizePerType[fileType] ||
      this.options.limits.perFileMaxSize;
    const perFileLimitDisplay =
      this.options.perTypeLimits.perFileMaxSizePerTypeDisplay[fileType] ||
      this.options.limits.perFileMaxSizeDisplay;

    if (file.size > perFileLimit) {
      return {
        valid: false,
        error: {
          filename: file.name,
          error: `Exceeds max ${fileType} file size`,
          details:
            this.formatAlertDetails("Size:", this.formatFileSize(file.size)) +
            " " +
            this.formatAlertDetails("Limit:", perFileLimitDisplay),
        },
      };
    }

    // Check per-file-type TOTAL size limit
    const typeLimit = this.options.perTypeLimits.perTypeMaxTotalSize[fileType];
    if (typeLimit) {
      const currentTypeSize = this.getFileTypeSize(fileType);
      if (currentTypeSize + file.size > typeLimit) {
        const limitDisplay = this.options.perTypeLimits.perTypeMaxTotalSizeDisplay[fileType];
        const remaining = typeLimit - currentTypeSize;
        return {
          valid: false,
          error: {
            filename: file.name,
            error: `Exceeds total ${fileType} size limit`,
            details:
              this.formatAlertDetails("Limit:", limitDisplay) +
              " " +
              this.formatAlertDetails(
                "Available:",
                this.formatFileSize(remaining)
              ),
          },
        };
      }
    }

    // Check total size limit
    const currentTotalSize = this.getTotalSize();
    if (currentTotalSize + file.size > this.options.limits.totalMaxSize) {
      const remaining = this.options.limits.totalMaxSize - currentTotalSize;
      return {
        valid: false,
        error: {
          filename: file.name,
          error: "Exceeds total upload size limit",
          details:
            this.formatAlertDetails(
              "Limit:",
              this.options.totalMaxSizeDisplay
            ) +
            " " +
            this.formatAlertDetails(
              "Available:",
              this.formatFileSize(remaining)
            ),
        },
      };
    }

    return { valid: true };
  }

  /**
   * Validate a file from cross-uploader drag-drop operation
   * @param {Object} fileObj - The source file object from another uploader
   * @returns {Object} - { valid: boolean, error?: object }
   */
  validateCrossUploaderFile(fileObj) {
    const files = this.getFiles();
    const totalFileCount = files.length;

    // Check max files limit
    if (totalFileCount >= this.options.limits.maxFiles) {
      return {
        valid: false,
        error: {
          filename: fileObj.name,
          error: "Maximum file limit reached",
          details: this.formatAlertDetails(
            "Limit:",
            `${this.options.limits.maxFiles} files`
          ),
        },
      };
    }

    // Check file extension
    const extension = fileObj.extension || this.getFileExtension(fileObj.name);
    if (
      this.options.fileTypes.allowedExtensions.length > 0 &&
      !this.options.fileTypes.allowedExtensions.includes(extension)
    ) {
      const allowedExtensions = this.options.allowedExtensions
        .slice(0, 5)
        .map((ext) => `.${ext}`);
      const moreCount = this.options.fileTypes.allowedExtensions.length - 5;
      if (moreCount > 0) {
        allowedExtensions.push(`+${moreCount} more`);
      }
      return {
        valid: false,
        error: {
          filename: fileObj.name,
          error: "File type not allowed",
          details: this.formatAlertDetails("Allowed:", allowedExtensions),
        },
      };
    }

    // Check per-file size limit
    const fileType = this.getFileType(extension);
    const perFileLimit =
      this.options.perTypeLimits.perFileMaxSizePerType[fileType] ||
      this.options.limits.perFileMaxSize;
    const perFileLimitDisplay =
      this.options.perTypeLimits.perFileMaxSizePerTypeDisplay[fileType] ||
      this.options.limits.perFileMaxSizeDisplay;

    if (fileObj.size > perFileLimit) {
      return {
        valid: false,
        error: {
          filename: fileObj.name,
          error: `Exceeds max ${fileType} file size`,
          details:
            this.formatAlertDetails(
              "Size:",
              this.formatFileSize(fileObj.size)
            ) +
            " " +
            this.formatAlertDetails("Limit:", perFileLimitDisplay),
        },
      };
    }

    // Check per-file-type TOTAL size limit
    const typeLimit = this.options.perTypeLimits.perTypeMaxTotalSize[fileType];
    if (typeLimit) {
      const currentTypeSize = this.getFileTypeSize(fileType);
      if (currentTypeSize + fileObj.size > typeLimit) {
        const limitDisplay = this.options.perTypeLimits.perTypeMaxTotalSizeDisplay[fileType];
        const remaining = typeLimit - currentTypeSize;
        return {
          valid: false,
          error: {
            filename: fileObj.name,
            error: `Exceeds total ${fileType} size limit`,
            details:
              this.formatAlertDetails("Limit:", limitDisplay) +
              " " +
              this.formatAlertDetails(
                "Available:",
                this.formatFileSize(remaining)
              ),
          },
        };
      }
    }

    // Check per-file-type file COUNT limit
    const typeCountLimit = this.options.perTypeLimits.perTypeMaxFileCount[fileType];
    if (typeCountLimit) {
      const currentTypeCount = this.getFileTypeCount(fileType);
      if (currentTypeCount >= typeCountLimit) {
        return {
          valid: false,
          error: {
            filename: fileObj.name,
            error: `Maximum ${fileType} file count reached`,
            details: this.formatAlertDetails(
              "Limit:",
              `${typeCountLimit} ${fileType} files`
            ),
          },
        };
      }
    }

    // Check total size limit
    const currentTotalSize = this.getTotalSize();
    if (currentTotalSize + fileObj.size > this.options.limits.totalMaxSize) {
      const remaining = this.options.limits.totalMaxSize - currentTotalSize;
      return {
        valid: false,
        error: {
          filename: fileObj.name,
          error: "Exceeds total upload size limit",
          details:
            this.formatAlertDetails(
              "Limit:",
              this.options.totalMaxSizeDisplay
            ) +
            " " +
            this.formatAlertDetails(
              "Available:",
              this.formatFileSize(remaining)
            ),
        },
      };
    }

    return { valid: true };
  }

  // ============================================================
  // DUPLICATE DETECTION
  // ============================================================

  /**
   * Check if a file is a duplicate
   * @param {File} file - The file to check
   * @returns {Object|null} - Returns the duplicate file object if found, null otherwise
   */
  checkDuplicate(file) {
    const checkBy = this.options.behavior.duplicateCheckBy;
    const files = this.getFiles();

    // Only check against uploaded or uploading files
    const existingFiles = files.filter((f) => f.uploaded || f.uploading);

    for (const existingFile of existingFiles) {
      let isDuplicate = false;

      switch (checkBy) {
        case "name":
          isDuplicate = existingFile.name === file.name;
          break;

        case "size":
          isDuplicate = existingFile.size === file.size;
          break;

        case "name-size":
          isDuplicate =
            existingFile.name === file.name && existingFile.size === file.size;
          break;

        case "hash":
          // Hash-based comparison not implemented - fallback to name-size
          console.warn(
            'FileUploader: Hash-based duplicate check not implemented. Using "name-size" instead.'
          );
          isDuplicate =
            existingFile.name === file.name && existingFile.size === file.size;
          break;

        default:
          isDuplicate =
            existingFile.name === file.name && existingFile.size === file.size;
      }

      if (isDuplicate) {
        return existingFile;
      }
    }

    return null;
  }

  /**
   * Check duplicate by name and size (for cross-uploader)
   * @param {string} name - File name
   * @param {number} size - File size
   * @returns {Object|null} - Duplicate file object or null
   */
  checkDuplicateByNameSize(name, size) {
    const checkBy = this.options.behavior.duplicateCheckBy;
    const files = this.getFiles();
    const existingFiles = files.filter((f) => f.uploaded);

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
          isDuplicate = existingFile.name === name && existingFile.size === size;
      }

      if (isDuplicate) {
        return existingFile;
      }
    }

    return null;
  }

  // ============================================================
  // FILE TYPE UTILITIES
  // ============================================================

  /**
   * Get file extension from filename
   * @param {string} filename - File name
   * @returns {string} - Lowercase extension
   */
  getFileExtension(filename) {
    return filename.split(".").pop().toLowerCase();
  }

  /**
   * Get file type category from extension
   * @param {string} extension - File extension
   * @returns {string} - File type (image, video, audio, document, archive, other)
   */
  getFileType(extension) {
    if (this.options.fileTypes.imageExtensions.includes(extension)) {
      return "image";
    } else if (this.options.fileTypes.videoExtensions.includes(extension)) {
      return "video";
    } else if (this.options.fileTypes.audioExtensions.includes(extension)) {
      return "audio";
    } else if (this.options.fileTypes.documentExtensions.includes(extension)) {
      return "document";
    } else if (this.options.fileTypes.archiveExtensions.includes(extension)) {
      return "archive";
    }
    return "other";
  }

  // ============================================================
  // SIZE CALCULATIONS
  // ============================================================

  /**
   * Get total size of uploaded files
   * @returns {number} - Total size in bytes
   */
  getTotalSize() {
    return this.getFiles()
      .filter((f) => f.uploaded)
      .reduce((total, f) => total + f.size, 0);
  }

  /**
   * Get file count by type
   * @param {string} type - File type
   * @returns {number} - Count of files
   */
  getFileTypeCount(type) {
    return this.getFiles().filter((f) => {
      if (!f.uploaded) return false;
      const ext = this.getFileExtension(f.name);
      const fileType = this.getFileType(ext);
      return fileType === type;
    }).length;
  }

  /**
   * Get total size by file type
   * @param {string} type - File type
   * @returns {number} - Total size in bytes
   */
  getFileTypeSize(type) {
    return this.getFiles()
      .filter((f) => {
        if (!f.uploaded) return false;
        const ext = this.getFileExtension(f.name);
        const fileType = this.getFileType(ext);
        return fileType === type;
      })
      .reduce((total, f) => total + f.size, 0);
  }

  // ============================================================
  // FORMATTING UTILITIES
  // ============================================================

  /**
   * Format file size for display
   * @param {number} bytes - Size in bytes
   * @returns {string} - Formatted size string
   */
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  /**
   * Format alert details with chips
   * @param {string} label - Label text
   * @param {string|Array} values - Values to display
   * @returns {string} - HTML string
   */
  formatAlertDetails(label, values) {
    const labelClass = "media-hub-alert-label";
    const chipClass = "media-hub-alert-chip";

    if (Array.isArray(values)) {
      const chipsHtml = values
        .map((v) => `<span class="${chipClass}">${v}</span>`)
        .join(" ");
      return `<span class="${labelClass}">${label}</span> ${chipsHtml}`;
    }

    return `<span class="${labelClass}">${label}</span> <span class="${chipClass}">${values}</span>`;
  }
}

export default FileValidator;
