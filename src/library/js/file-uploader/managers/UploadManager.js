/**
 * UploadManager.js
 *
 * Manages file upload, delete, and download operations for the FileUploader.
 * Handles progress tracking, state updates, and server communication.
 *
 * @module UploadManager
 */

import { getIcon } from "../../shared/icons.js";

// ============================================================
// UPLOAD MANAGER CLASS
// ============================================================

export class UploadManager {
  /**
   * Create an UploadManager instance
   * @param {FileUploader} uploader - The parent FileUploader instance
   */
  constructor(uploader) {
    this.uploader = uploader;
  }

  // ============================================================
  // REQUEST DATA HELPERS
  // ============================================================

  /**
   * Build request data by merging global additionalData, per-request data, and onBeforeRequest callback
   * @param {string} requestType - Type: 'upload', 'delete', 'download', 'copy', 'cleanup'
   * @param {Object} baseData - Base data for the request
   * @param {Object} context - Additional context (fileObj, files, etc.)
   * @returns {Object} - Merged data object
   */
  buildRequestData(requestType, baseData = {}, context = {}) {
    const options = this.uploader.options;

    // Map request type to per-request data option (these are inside urls category)
    const perRequestDataMap = {
      upload: options.urls.uploadData,
      delete: options.urls.deleteData,
      download: options.urls.downloadData,
      copy: options.urls.copyData,
      cleanup: options.urls.cleanupData,
    };

    // Merge: baseData + additionalData (global) + per-request data
    let data = {
      ...baseData,
      ...options.urls.additionalData,
      ...(perRequestDataMap[requestType] || {}),
    };

    // Call onBeforeRequest callback if provided
    if (typeof options.callbacks.onBeforeRequest === "function") {
      const result = options.callbacks.onBeforeRequest(requestType, data, context);
      // If callback returns an object, use it as the new data
      if (result && typeof result === "object") {
        data = result;
      }
    }

    return data;
  }

  /**
   * Append request data to FormData for upload requests
   * @param {FormData} formData - FormData to append to
   * @param {string} requestType - Request type
   * @param {Object} context - Additional context
   */
  appendRequestDataToFormData(formData, requestType, context = {}) {
    const options = this.uploader.options;

    // Map request type to per-request data option (these are inside urls category)
    const perRequestDataMap = {
      upload: options.urls.uploadData,
      delete: options.urls.deleteData,
      download: options.urls.downloadData,
      copy: options.urls.copyData,
      cleanup: options.urls.cleanupData,
    };

    // Collect all additional data
    let additionalFields = {
      ...options.urls.additionalData,
      ...(perRequestDataMap[requestType] || {}),
    };

    // Call onBeforeRequest callback
    if (typeof options.callbacks.onBeforeRequest === "function") {
      const result = options.callbacks.onBeforeRequest(requestType, additionalFields, context);
      if (result && typeof result === "object") {
        additionalFields = result;
      }
    }

    // Append each field to FormData
    for (const [key, value] of Object.entries(additionalFields)) {
      formData.append(key, value);
    }
  }

  // ============================================================
  // UPLOAD OPERATIONS
  // ============================================================

  /**
   * Upload a file to the server
   * @param {Object} fileObj - File object to upload
   */
  async uploadFile(fileObj) {
    fileObj.uploading = true;
    this.updatePreviewState(fileObj, "uploading");

    if (this.uploader.options.callbacks.onUploadStart) {
      this.uploader.options.callbacks.onUploadStart(fileObj);
    }

    const formData = new FormData();
    formData.append("file", fileObj.file);

    if (this.uploader.options.urls.uploadDir) {
      formData.append("uploadDir", this.uploader.options.urls.uploadDir);
    }

    // Add additional data to upload request (global + uploadData + onBeforeRequest)
    this.appendRequestDataToFormData(formData, "upload", { fileObj });

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          this.updateProgress(fileObj, percentComplete);
        }
      });

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

      xhr.open("POST", this.uploader.options.urls.uploadUrl);
      xhr.send(formData);

      const result = await uploadPromise;

      if (result.success) {
        fileObj.uploaded = true;
        fileObj.uploading = false;
        fileObj.serverFilename = result.file.filename;
        fileObj.serverData = result.file;

        this.updateProgress(fileObj, 100);
        this.updatePreviewState(fileObj, "success");

        if (fileObj.downloadBtn) {
          fileObj.downloadBtn.style.display = "flex";
        }

        this.uploader.limitsManager.updateDisplay();
        this.uploader.carouselManager.update();

        if (this.uploader.options.callbacks.onUploadSuccess) {
          this.uploader.options.callbacks.onUploadSuccess(fileObj, result);
        }
      } else {
        const error = new Error(
          typeof result.error === "string" ? result.error : "Upload failed"
        );
        error.serverError = result.error;
        throw error;
      }
    } catch (error) {
      fileObj.uploading = false;
      fileObj.error = error.message;

      if (fileObj.previewElement) {
        fileObj.previewElement.remove();
      }

      this.uploader.files = this.uploader.files.filter((f) => f.id !== fileObj.id);

      let errorData = error.serverError || error.message;
      if (typeof errorData === "object" && errorData !== null) {
        errorData = this.uploader.formatServerError(errorData);
      }
      this.uploader.showError(errorData);

      if (this.uploader.options.callbacks.onUploadError) {
        this.uploader.options.callbacks.onUploadError(fileObj, error);
      }
    }
  }

  // ============================================================
  // PROGRESS TRACKING
  // ============================================================

  /**
   * Update upload progress display
   * @param {Object} fileObj - File object
   * @param {number} percent - Progress percentage (0-100)
   */
  updateProgress(fileObj, percent) {
    if (!fileObj.previewElement) return;

    const progressBar = fileObj.previewElement.querySelector(".media-hub-progress-bar");
    const progressText = fileObj.previewElement.querySelector(".media-hub-progress-text");

    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }
    if (progressText) {
      progressText.textContent = `${Math.round(percent)}%`;
    }
  }

  // ============================================================
  // STATE MANAGEMENT
  // ============================================================

  /**
   * Update preview visual state
   * @param {Object} fileObj - File object
   * @param {string} state - State: 'uploading', 'success', or 'error'
   */
  updatePreviewState(fileObj, state) {
    if (!fileObj.previewElement) return;

    const overlay = fileObj.previewElement.querySelector(".media-hub-preview-overlay");
    const successOverlay = fileObj.previewElement.querySelector(".media-hub-success-overlay");
    const spinner = fileObj.previewElement.querySelector(".media-hub-spinner");
    const progressContainer = fileObj.previewElement.querySelector(".media-hub-progress-container");
    const progressText = fileObj.previewElement.querySelector(".media-hub-progress-text");

    fileObj.previewElement.classList.remove("uploading", "success", "error");

    if (state === "uploading") {
      fileObj.previewElement.classList.add("uploading");
      overlay.style.display = "flex";

      // Show progress bar or spinner based on showUploadProgress option
      const showProgress = this.uploader.options.behavior.showUploadProgress !== false;
      if (spinner) spinner.style.display = showProgress ? "none" : "block";
      if (progressContainer) progressContainer.style.display = showProgress ? "block" : "none";
      if (progressText) progressText.style.display = showProgress ? "block" : "none";

      if (successOverlay) {
        successOverlay.classList.remove("slide-in", "slide-out");
      }
    } else if (state === "success") {
      fileObj.previewElement.classList.add("success");
      overlay.style.display = "none";

      if (successOverlay) {
        successOverlay.classList.remove("slide-in", "slide-out");
        void successOverlay.offsetWidth;
        successOverlay.classList.add("slide-in");

        setTimeout(() => {
          if (successOverlay) {
            successOverlay.classList.remove("slide-in");
            successOverlay.classList.add("slide-out");
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

  // ============================================================
  // DELETE OPERATIONS
  // ============================================================

  /**
   * Delete a file from server and UI
   * @param {string|number} fileId - File ID to delete
   * @param {Object} options - Delete options
   * @param {boolean} options.skipCarouselUpdate - Skip carousel update
   * @param {boolean} options.skipConfirmation - Skip confirmation dialog
   */
  async deleteFile(fileId, options = {}) {
    const { skipCarouselUpdate = false, skipConfirmation = false } = options;
    const fileObj = this.uploader.files.find((f) => f.id === fileId);
    if (!fileObj) return;

    // Show deleting state
    if (fileObj.previewElement) {
      fileObj.previewElement.classList.add("deleting");
      // Disable action buttons during delete
      const deleteBtn = fileObj.previewElement.querySelector(".media-hub-delete");
      const downloadBtn = fileObj.previewElement.querySelector(".media-hub-download");
      if (deleteBtn) deleteBtn.disabled = true;
      if (downloadBtn) downloadBtn.disabled = true;
    }

    if (fileObj.uploaded && fileObj.serverFilename) {
      try {
        const baseData = { filename: fileObj.serverFilename };
        if (this.uploader.options.urls.uploadDir) {
          baseData.uploadDir = this.uploader.options.urls.uploadDir;
        }

        const deleteData = this.buildRequestData("delete", baseData, { fileObj });

        const response = await fetch(this.uploader.options.urls.deleteUrl, {
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

        if (this.uploader.options.callbacks.onDeleteSuccess) {
          this.uploader.options.callbacks.onDeleteSuccess(fileObj, result);
        }
      } catch (error) {
        // Remove deleting state on error
        if (fileObj.previewElement) {
          fileObj.previewElement.classList.remove("deleting");
          const deleteBtn = fileObj.previewElement.querySelector(".media-hub-delete");
          const downloadBtn = fileObj.previewElement.querySelector(".media-hub-download");
          if (deleteBtn) deleteBtn.disabled = false;
          if (downloadBtn) downloadBtn.disabled = false;
        }

        this.uploader.showError(`Failed to delete ${fileObj.name}: ${error.message}`);

        if (this.uploader.options.callbacks.onDeleteError) {
          this.uploader.options.callbacks.onDeleteError(fileObj, error);
        }
        return;
      }
    }

    if (fileObj.previewElement) {
      fileObj.previewElement.remove();
    }

    this.uploader.files = this.uploader.files.filter((f) => f.id !== fileId);
    this.uploader.selectedFiles.delete(fileId);
    this.uploader.selectionManager.updateUI();
    this.uploader.limitsManager.updateDisplay();

    if (!skipCarouselUpdate) {
      this.uploader.carouselManager.update();
    }
  }

  // ============================================================
  // DOWNLOAD OPERATIONS
  // ============================================================

  /**
   * Download a single file
   * @param {string|number} fileId - File ID to download
   */
  downloadFile(fileId) {
    const fileObj = this.uploader.files.find((f) => f.id === fileId);
    if (!fileObj || !fileObj.uploaded) return;

    const downloadUrl = fileObj.serverData?.url || `uploads/${fileObj.serverFilename}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileObj.name;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Download all uploaded files as zip
   */
  async downloadAll() {
    const uploadedFiles = this.uploader.getUploadedFilesData();

    if (uploadedFiles.length === 0) {
      this.uploader.showError("No files to download");
      return;
    }

    const originalHTML = this.uploader.downloadAllBtn.innerHTML;
    this.uploader.downloadAllBtn.disabled = true;
    this.uploader.downloadAllBtn.innerHTML = `
      <div class="media-hub-spinner" style="width: 16px; height: 16px; border-width: 2px;"></div>
      <span>Preparing...</span>
    `;

    try {
      const downloadData = this.buildRequestData("download", { files: uploadedFiles }, { files: uploadedFiles });

      const response = await fetch(this.uploader.options.urls.downloadAllUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(downloadData),
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

      const link = document.createElement("a");
      // Convert relative URL to absolute URL to ensure browser can locate the file
      link.href = new URL(result.url, window.location.href).href;
      link.download = result.filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      // Delay removing link to ensure download starts
      setTimeout(() => {
        document.body.removeChild(link);
      }, 1000);

      if (result.type === "zip" && result.cleanup) {
        // Increased timeout to give browser time to download before cleanup
        setTimeout(async () => {
          try {
            const cleanupData = this.buildRequestData("cleanup", { filename: result.cleanup }, {});

            await fetch(this.uploader.options.urls.cleanupZipUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(cleanupData),
            });
          } catch (error) {
            console.warn("Failed to cleanup temporary zip:", error);
          }
        }, 5000);
      }
    } catch (error) {
      this.uploader.showError(`Download failed: ${error.message}`);
    } finally {
      this.uploader.downloadAllBtn.disabled = false;
      this.uploader.downloadAllBtn.innerHTML = originalHTML;
    }
  }

  // ============================================================
  // BULK OPERATIONS
  // ============================================================

  /**
   * Clear all files without confirmation
   */
  clear() {
    if (this.uploader.carouselManager.carousel) {
      this.uploader.carouselManager.carousel.updateFiles([]);
    }

    this.uploader.files.forEach((fileObj) => {
      if (fileObj.uploaded && fileObj.serverFilename) {
        this.deleteFile(fileObj.id, { skipCarouselUpdate: true });
      }
    });
    this.uploader.files = [];
    this.uploader.previewContainer.innerHTML = "";
    this.uploader.carouselManager.update();
  }

  /**
   * Clear all files with confirmation
   */
  async clearAll() {
    const uploadedFiles = this.uploader.files.filter((f) => f.uploaded);

    if (uploadedFiles.length === 0) {
      this.uploader.showError("No files to clear");
      return;
    }

    if (this.uploader.options.behavior.confirmBeforeDelete) {
      const confirmed = await this.uploader.crossUploaderManager.showConfirmDialog({
        title: "Clear All Files",
        message: `Are you sure you want to delete all <strong>${uploadedFiles.length}</strong> file(s)?`,
        confirmText: "Delete All",
      });

      if (!confirmed) {
        return;
      }
    }

    if (this.uploader.carouselManager.carousel) {
      this.uploader.carouselManager.carousel.updateFiles([]);
    }

    const deletePromises = uploadedFiles.map((fileObj) =>
      this.deleteFile(fileObj.id, { skipCarouselUpdate: true })
    );

    await Promise.all(deletePromises);
    this.uploader.carouselManager.update();
  }

  // ============================================================
  // CLEANUP
  // ============================================================

  /**
   * Cleanup uploaded files on page unload or destroy
   * Uses sendBeacon for reliability
   */
  cleanupUploadedFiles() {
    const uploadedFiles = this.uploader.files.filter((f) => f.uploaded);
    if (uploadedFiles.length === 0) return;

    const fileData = uploadedFiles.map((f) => ({
      filename: f.serverFilename,
    }));

    const baseData = { files: fileData };
    if (this.uploader.options.urls.uploadDir) {
      baseData.uploadDir = this.uploader.options.urls.uploadDir;
    }

    // Use "delete" type since this is deleting uploaded files (uses deleteData)
    const payload = this.buildRequestData("delete", baseData, { files: uploadedFiles });

    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      navigator.sendBeacon(this.uploader.options.urls.deleteUrl, blob);
    } else {
      fetch(this.uploader.options.urls.deleteUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  }
}
