/**
 * CrossUploaderManager.js
 *
 * Manages cross-uploader drag and drop functionality.
 * Handles file transfers between multiple FileUploader instances.
 *
 * @module CrossUploaderManager
 */

import { getIcon } from "../../shared/icons.js";
import { formatAlertDetails, getFileType, formatFileSize } from "../utils/helpers.js";

// Static registry for all FileUploader instances (for cross-uploader drag-drop)
export const uploaderRegistry = new Map();

// ============================================================
// CROSS UPLOADER MANAGER CLASS
// ============================================================

export class CrossUploaderManager {
  /**
   * Create a CrossUploaderManager instance
   * @param {FileUploader} uploader - The parent FileUploader instance
   */
  constructor(uploader) {
    this.uploader = uploader;
  }

  // ============================================================
  // CROSS-UPLOADER DROP HANDLING
  // ============================================================

  /**
   * Handle drop from another FileUploader instance
   * @param {Object} data - Drag data from source uploader
   * @param {Event} event - Drop event
   */
  async handleCrossUploaderDrop(data, event) {
    const { sourceUploaderId, fileId, fileName } = data;

    if (sourceUploaderId === this.uploader.instanceId) {
      return;
    }

    const sourceUploader = uploaderRegistry.get(sourceUploaderId);
    if (!sourceUploader) {
      console.error("Source uploader not found:", sourceUploaderId);
      return;
    }

    const sourceFileObj = sourceUploader.files.find((f) => f.id === fileId);
    if (!sourceFileObj) {
      console.error("File not found in source uploader:", fileId);
      return;
    }

    const validation = this.validateCrossUploaderFile(sourceFileObj);
    if (!validation.valid) {
      this.uploader.showError(validation.error);
      return;
    }

    if (this.uploader.options.preventDuplicates) {
      const duplicate = this.checkDuplicateByNameSize(sourceFileObj.name, sourceFileObj.size);
      if (duplicate) {
        this.uploader.showError(`"${sourceFileObj.name}" is a duplicate file and has already been uploaded.`);
        if (this.uploader.options.onDuplicateFile) {
          this.uploader.options.onDuplicateFile(sourceFileObj, duplicate);
        }
        return;
      }
    }

    const action = await this.showMoveOrCopyDialog(fileName);
    if (!action) return;

    const sourceUploadDir = sourceUploader.options.uploadDir || "";
    const targetUploadDir = this.uploader.options.uploadDir || "";
    const needsServerCopy = sourceUploadDir !== targetUploadDir;

    const result = await this.copyFileFromUploader(sourceFileObj, sourceUploader);

    if (!result.success) {
      this.uploader.showError(result.error || "Failed to copy/move file");
      return;
    }

    if (action === "move") {
      if (needsServerCopy) {
        await sourceUploader.uploadManager.deleteFile(sourceFileObj.id, { skipConfirmation: true });
      } else {
        this.removeFileFromUI(sourceFileObj.id, sourceUploader);
      }
    }
  }

  // ============================================================
  // DUPLICATE CHECKING
  // ============================================================

  /**
   * Check if a file with given name and size already exists
   * @param {string} name - File name
   * @param {number} size - File size
   * @returns {Object|null} - Returns the duplicate file object if found
   */
  checkDuplicateByNameSize(name, size) {
    const checkBy = this.uploader.options.duplicateCheckBy;
    const existingFiles = this.uploader.files.filter((f) => f.uploaded || f.uploading);

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
  // UI OPERATIONS
  // ============================================================

  /**
   * Remove a file from UI without deleting from server
   * @param {string|number} fileId - The file ID to remove
   * @param {FileUploader} uploader - The uploader to remove from (defaults to this.uploader)
   */
  removeFileFromUI(fileId, uploader = this.uploader) {
    const fileObj = uploader.files.find((f) => f.id === fileId);
    if (!fileObj) return;

    if (fileObj.previewElement) {
      fileObj.previewElement.remove();
    }

    uploader.files = uploader.files.filter((f) => f.id !== fileId);
    uploader.selectedFiles.delete(fileId);
    uploader.selectionManager.updateUI();
    uploader.limitsManager.updateDisplay();
    uploader.carouselManager.update();
  }

  // ============================================================
  // DIALOGS
  // ============================================================

  /**
   * Show dialog asking user to move or copy the file
   * @param {string} fileName - Name of file being transferred
   * @returns {Promise<string|null>} - 'move', 'copy', or null if cancelled
   */
  showMoveOrCopyDialog(fileName) {
    return new Promise((resolve) => {
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
      dialog.querySelector("button[data-action='move']").focus();

      const handleClick = (e) => {
        const action = e.target.closest("button")?.dataset.action;
        if (action) {
          overlay.remove();
          resolve(action === "cancel" ? null : action);
        }
      };

      const handleKeydown = (e) => {
        if (e.key === "Escape") {
          overlay.remove();
          resolve(null);
        }
      };

      dialog.addEventListener("click", handleClick);
      document.addEventListener("keydown", handleKeydown, { once: true });

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
   * @returns {Promise<boolean>} - Resolves to true if confirmed
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
      dialog.querySelector("button[data-action='cancel']").focus();

      const handleClick = (e) => {
        const action = e.target.closest("button")?.dataset.action;
        if (action) {
          overlay.remove();
          document.removeEventListener("keydown", handleKeydown);
          resolve(action === "confirm");
        }
      };

      const handleKeydown = (e) => {
        if (e.key === "Escape") {
          overlay.remove();
          document.removeEventListener("keydown", handleKeydown);
          resolve(false);
        }
      };

      dialog.addEventListener("click", handleClick);
      document.addEventListener("keydown", handleKeydown);

      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.remove();
          document.removeEventListener("keydown", handleKeydown);
          resolve(false);
        }
      });
    });
  }

  // ============================================================
  // FILE COPY OPERATIONS
  // ============================================================

  /**
   * Copy a file from another uploader to this one
   * @param {Object} sourceFileObj - Source file object
   * @param {FileUploader} sourceUploader - Source uploader instance
   * @returns {Promise<Object>} - Result with success status
   */
  async copyFileFromUploader(sourceFileObj, sourceUploader) {
    const sourceUploadDir = sourceUploader.options.uploadDir || "";
    const targetUploadDir = this.uploader.options.uploadDir || "";
    const needsServerCopy = sourceUploadDir !== targetUploadDir;

    let serverFilename = sourceFileObj.serverFilename;
    let serverData = { ...sourceFileObj.serverData };

    if (needsServerCopy) {
      try {
        const response = await fetch(this.uploader.options.copyFileUrl, {
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
          return { success: false, error: result.error || "Failed to copy file on server" };
        }

        serverFilename = result.file.filename;
        serverData = result.file;

        if (result.renamed) {
          console.log(`File renamed from "${sourceFileObj.serverFilename}" to "${serverFilename}" to avoid conflict`);
        }
      } catch (error) {
        console.error("Error copying file to server:", error);
        return { success: false, error: "Network error while copying file" };
      }
    }

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

    this.uploader.files.push(newFileObj);
    this.uploader.previewManager.createPreview(newFileObj);
    this.uploader.uploadManager.updatePreviewState(newFileObj, "success");

    if (newFileObj.downloadBtn) {
      newFileObj.downloadBtn.style.display = "flex";
    }

    this.uploader.limitsManager.updateDisplay();
    this.uploader.carouselManager.update();

    return { success: true, fileObj: newFileObj };
  }

  // ============================================================
  // VALIDATION
  // ============================================================

  /**
   * Validate a file from cross-uploader drag-drop operation
   * @param {Object} fileObj - The source file object
   * @returns {Object} - { valid: boolean, error?: string|object }
   */
  validateCrossUploaderFile(fileObj) {
    const totalFileCount = this.uploader.files.length;
    if (totalFileCount >= this.uploader.options.maxFiles) {
      return {
        valid: false,
        error: {
          filename: fileObj.name,
          error: "Maximum file limit reached",
          details: formatAlertDetails("Limit:", `${this.uploader.options.maxFiles} files`),
        },
      };
    }

    const extension = fileObj.extension || fileObj.name.split(".").pop().toLowerCase();
    if (
      this.uploader.options.allowedExtensions.length > 0 &&
      !this.uploader.options.allowedExtensions.includes(extension)
    ) {
      const allowedExtensions = this.uploader.options.allowedExtensions.slice(0, 5).map((ext) => `.${ext}`);
      const moreCount = this.uploader.options.allowedExtensions.length - 5;
      if (moreCount > 0) {
        allowedExtensions.push(`+${moreCount} more`);
      }
      return {
        valid: false,
        error: {
          filename: fileObj.name,
          error: "File type not allowed",
          details: formatAlertDetails("Allowed:", allowedExtensions),
        },
      };
    }

    const fileType = getFileType(extension, this.uploader.options);
    const perFileLimit = this.uploader.options.perFileMaxSizePerType[fileType] || this.uploader.options.perFileMaxSize;
    const perFileLimitDisplay = this.uploader.options.perFileMaxSizePerTypeDisplay[fileType] || this.uploader.options.perFileMaxSizeDisplay;

    if (fileObj.size > perFileLimit) {
      return {
        valid: false,
        error: {
          filename: fileObj.name,
          error: `Exceeds max ${fileType} file size`,
          details: formatAlertDetails("Size:", formatFileSize(fileObj.size)) + " " + formatAlertDetails("Limit:", perFileLimitDisplay),
        },
      };
    }

    const typeLimit = this.uploader.options.perTypeMaxTotalSize[fileType];
    if (typeLimit) {
      const currentTypeSize = this.uploader.limitsManager.getFileTypeSize(fileType);
      if (currentTypeSize + fileObj.size > typeLimit) {
        const limitDisplay = this.uploader.options.perTypeMaxTotalSizeDisplay[fileType];
        const remaining = typeLimit - currentTypeSize;
        return {
          valid: false,
          error: {
            filename: fileObj.name,
            error: `Exceeds total ${fileType} size limit`,
            details: formatAlertDetails("Limit:", limitDisplay) + " " + formatAlertDetails("Available:", formatFileSize(remaining)),
          },
        };
      }
    }

    const typeCountLimit = this.uploader.options.perTypeMaxFileCount[fileType];
    if (typeCountLimit) {
      const currentTypeCount = this.uploader.limitsManager.getFileTypeCount(fileType);
      if (currentTypeCount >= typeCountLimit) {
        return {
          valid: false,
          error: {
            filename: fileObj.name,
            error: `Maximum ${fileType} file count reached`,
            details: formatAlertDetails("Limit:", `${typeCountLimit} ${fileType} files`),
          },
        };
      }
    }

    const currentTotalSize = this.uploader.limitsManager.getTotalSize();
    if (currentTotalSize + fileObj.size > this.uploader.options.totalMaxSize) {
      const remaining = this.uploader.options.totalMaxSize - currentTotalSize;
      return {
        valid: false,
        error: {
          filename: fileObj.name,
          error: "Exceeds total upload size limit",
          details: formatAlertDetails("Limit:", this.uploader.options.totalMaxSizeDisplay) + " " + formatAlertDetails("Available:", formatFileSize(remaining)),
        },
      };
    }

    return { valid: true };
  }
}
