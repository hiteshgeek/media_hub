/**
 * EventManager.js
 *
 * Manages event handlers for the FileUploader.
 * Handles drag-drop, click events, and external drop zones.
 *
 * @module EventManager
 */

import Tooltip from "../../components/tooltip/index.js";

// ============================================================
// EVENT MANAGER CLASS
// ============================================================

export class EventManager {
  /**
   * Create an EventManager instance
   * @param {FileUploader} uploader - The parent FileUploader instance
   */
  constructor(uploader) {
    this.uploader = uploader;
    this.externalDropZoneElement = null;
    this.beforeUnloadHandler = null;
  }

  // ============================================================
  // MAIN EVENT ATTACHMENT
  // ============================================================

  /**
   * Attach all event handlers
   */
  attachEvents() {
    // Click to browse - only on dropzone or header, not on previews or buttons
    this.uploader.dropZone.addEventListener("click", (e) => {
      const isPreview = e.target.closest(".file-uploader-preview");
      const isDownloadBtn = e.target.closest(".file-uploader-download-all");
      const isClearBtn = e.target.closest(".file-uploader-clear-all");
      const isButtonContainer = e.target.closest(".file-uploader-button-container");
      const isActionContainer = e.target.closest(".file-uploader-action-container");
      const isInput = e.target === this.uploader.fileInput;

      if (!isPreview && !isDownloadBtn && !isClearBtn && !isButtonContainer && !isActionContainer && !isInput) {
        this.uploader.fileInput.click();
      }
    });

    // File input change
    this.uploader.fileInput.addEventListener("change", (e) => {
      this.uploader.handleFiles(e.target.files);
    });

    // Drag & drop events
    this.uploader.dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      this.uploader.dropZone.classList.add("file-uploader-dragover");
    });

    this.uploader.dropZone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      this.uploader.dropZone.classList.remove("file-uploader-dragover");
    });

    this.uploader.dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      this.uploader.dropZone.classList.remove("file-uploader-dragover");

      const crossUploaderData = e.dataTransfer.getData("application/x-file-uploader");

      if (crossUploaderData) {
        try {
          const data = JSON.parse(crossUploaderData);
          this.uploader.crossUploaderManager.handleCrossUploaderDrop(data, e);
        } catch (err) {
          console.error("Failed to parse cross-uploader data:", err);
        }
      } else if (e.dataTransfer.files.length > 0) {
        this.uploader.handleFiles(e.dataTransfer.files);
      }
    });

    // Set up external drop zone if specified
    this.setupExternalDropZone();
  }

  // ============================================================
  // EXTERNAL DROP ZONE
  // ============================================================

  /**
   * Set up external drop zone for drag-and-drop file uploads
   */
  setupExternalDropZone() {
    const externalDropZone = this.uploader.options.externalDropZone;
    if (!externalDropZone) return;

    let dropZoneElement;
    if (typeof externalDropZone === "string") {
      dropZoneElement = document.querySelector(externalDropZone);
    } else if (externalDropZone instanceof HTMLElement) {
      dropZoneElement = externalDropZone;
    }

    if (!dropZoneElement) return;

    this.externalDropZoneElement = dropZoneElement;
    const activeClass = this.uploader.options.externalDropZoneActiveClass;

    dropZoneElement.setAttribute("data-tooltip-text", "Drop files here");
    dropZoneElement.setAttribute("data-tooltip-position", "top");

    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      dropZoneElement.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    dropZoneElement.addEventListener("dragenter", () => {
      dropZoneElement.classList.add(activeClass);
    });

    dropZoneElement.addEventListener("dragover", () => {
      dropZoneElement.classList.add(activeClass);
    });

    dropZoneElement.addEventListener("dragleave", (e) => {
      if (!dropZoneElement.contains(e.relatedTarget)) {
        dropZoneElement.classList.remove(activeClass);
      }
    });

    dropZoneElement.addEventListener("drop", (e) => {
      dropZoneElement.classList.remove(activeClass);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        this.uploader.handleFiles(files);
      }
    });

    Tooltip.init(dropZoneElement);
  }

  // ============================================================
  // PREVIEW DRAG EVENTS
  // ============================================================

  /**
   * Attach drag events to file preview for cross-uploader functionality
   * @param {HTMLElement} preview - Preview element
   * @param {Object} fileObj - File object
   */
  attachPreviewDragEvents(preview, fileObj) {
    preview.addEventListener("dragstart", (e) => {
      if (!fileObj.uploaded) {
        e.preventDefault();
        return;
      }

      this.uploader.draggedFileObj = fileObj;
      preview.classList.add("file-uploader-dragging");

      const dragData = {
        sourceUploaderId: this.uploader.instanceId,
        fileId: fileObj.id,
        fileName: fileObj.name,
        fileSize: fileObj.size,
        serverFilename: fileObj.serverFilename,
        serverData: fileObj.serverData,
      };

      e.dataTransfer.setData("application/x-file-uploader", JSON.stringify(dragData));
      e.dataTransfer.effectAllowed = "copyMove";
    });

    preview.addEventListener("dragend", (e) => {
      preview.classList.remove("file-uploader-dragging");
      this.uploader.draggedFileObj = null;
    });
  }

  // ============================================================
  // BEFORE UNLOAD HANDLER
  // ============================================================

  /**
   * Attach beforeunload handler for cleanup
   */
  attachBeforeUnloadHandler() {
    if (!this.uploader.options.cleanupOnUnload) {
      return;
    }

    this.beforeUnloadHandler = () => {
      const uploadedFiles = this.uploader.files.filter((f) => f.uploaded);

      if (uploadedFiles.length > 0) {
        const fileData = uploadedFiles.map((f) => ({
          filename: f.serverFilename,
        }));

        const payload = { files: fileData };
        if (this.uploader.options.uploadDir) {
          payload.uploadDir = this.uploader.options.uploadDir;
        }

        if (navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify(payload)], {
            type: "application/json",
          });
          navigator.sendBeacon(this.uploader.options.deleteUrl, blob);
        }
      }
    };

    window.addEventListener("beforeunload", this.beforeUnloadHandler);
  }

  // ============================================================
  // CLEANUP
  // ============================================================

  /**
   * Remove beforeunload handler
   */
  removeBeforeUnloadHandler() {
    if (this.beforeUnloadHandler) {
      window.removeEventListener("beforeunload", this.beforeUnloadHandler);
    }
  }
}
