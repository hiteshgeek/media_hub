/**
 * SelectionManager.js
 *
 * Manages multi-file selection operations for the FileUploader.
 * Handles selection UI updates, batch download, and batch delete.
 *
 * @module SelectionManager
 */

import { getIcon } from "../../shared/icons.js";

// ============================================================
// SELECTION MANAGER CLASS
// ============================================================

export class SelectionManager {
  /**
   * Create a SelectionManager instance
   * @param {FileUploader} uploader - The parent FileUploader instance
   */
  constructor(uploader) {
    this.uploader = uploader;
  }

  // ============================================================
  // UI UPDATES
  // ============================================================

  /**
   * Update selection UI (show/hide selected action buttons and update count)
   */
  updateUI() {
    const selectedCount = this.uploader.selectedFiles.size;
    const selectionInfo = this.uploader.selectedActionContainer.querySelector(
      ".file-uploader-selection-info"
    );

    if (selectedCount > 0) {
      selectionInfo.textContent = `${selectedCount} selected`;
      this.uploader.selectedActionContainer.style.display = "flex";
      // Hide regular button container when selection is active
      if (this.uploader.buttonContainer) {
        this.uploader.buttonContainer.style.display = "none";
      }
    } else {
      this.uploader.selectedActionContainer.style.display = "none";
      // Show regular button container if files exist
      const hasFiles = this.uploader.files.length > 0;
      if (this.uploader.buttonContainer) {
        this.uploader.buttonContainer.style.display = hasFiles ? "flex" : "none";
      }
    }
  }

  // ============================================================
  // BATCH OPERATIONS
  // ============================================================

  /**
   * Download selected files
   * Creates a zip for multiple files or direct download for single file
   */
  async downloadSelected() {
    const selectedFilesData = this.uploader.files
      .filter((f) => this.uploader.selectedFiles.has(f.id) && f.uploaded)
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
      const response = await fetch(this.uploader.options.downloadAllUrl, {
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

      // Download the file using result.url
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
            await fetch(this.uploader.options.cleanupZipUrl, {
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
      this.uploader.showError(`Download failed: ${error.message}`);
    }
  }

  /**
   * Delete selected files
   * Shows confirmation dialog if enabled
   */
  async deleteSelected() {
    const selectedFileIds = Array.from(this.uploader.selectedFiles);

    if (selectedFileIds.length === 0) {
      return;
    }

    // Confirm deletion if enabled
    if (this.uploader.options.confirmBeforeDelete) {
      const confirmed = await this.uploader.crossUploaderManager.showConfirmDialog({
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
      await this.uploader.uploadManager.deleteFile(fileId);
    }

    // Clear selection
    this.uploader.selectedFiles.clear();
    this.updateUI();
  }
}
