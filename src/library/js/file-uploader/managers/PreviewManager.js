/**
 * PreviewManager.js
 *
 * Manages file preview creation and display for the FileUploader.
 * Handles image thumbnails, video thumbnails, audio duration extraction.
 *
 * @module PreviewManager
 */

import { getIcon } from "../../shared/icons.js";
import TooltipManager from "../../utils/TooltipManager.js";
import { getFileType, formatFileSize } from "../utils/helpers.js";

// ============================================================
// PREVIEW MANAGER CLASS
// ============================================================

export class PreviewManager {
  /**
   * Create a PreviewManager instance
   * @param {FileUploader} uploader - The parent FileUploader instance
   */
  constructor(uploader) {
    this.uploader = uploader;
  }

  // ============================================================
  // PREVIEW CREATION
  // ============================================================

  /**
   * Create preview element for a file
   * @param {Object} fileObj - File object with file data
   */
  createPreview(fileObj) {
    let fileType = getFileType(fileObj.extension, this.uploader.options);

    // Override file type for captured audio recordings (webm can be both audio/video)
    if (fileObj.captureType === "audio_recording") {
      fileType = "audio";
    }

    const preview = document.createElement("div");
    preview.className = "media-hub-preview";
    preview.dataset.fileId = fileObj.id;

    // Make preview draggable for cross-uploader drag-drop
    if (this.uploader.options.dragDrop.enableCrossUploaderDrag) {
      preview.draggable = true;
      preview.dataset.uploaderId = this.uploader.instanceId;
      this.uploader.eventManager.attachPreviewDragEvents(preview, fileObj);
    }

    const previewInner = document.createElement("div");
    previewInner.className = "media-hub-preview-inner";

    // Create preview content based on file type
    let previewContent = "";

    if (fileType === "image") {
      const objectUrl = URL.createObjectURL(fileObj.file);
      previewContent = `<img src="${objectUrl}" alt="${fileObj.name}" class="media-hub-preview-image">`;
    } else if (fileType === "video") {
      const objectUrl = URL.createObjectURL(fileObj.file);
      previewContent = `
        <video src="${objectUrl}" class="media-hub-preview-video" data-file-id="${fileObj.id}"></video>
        <canvas class="media-hub-video-thumbnail" data-file-id="${fileObj.id}" style="display: none;"></canvas>
        <div class="media-hub-video-play-overlay">
          ${getIcon("play", { class: "media-hub-video-play-icon" })}
        </div>
        <div class="media-hub-media-duration" data-file-id="${fileObj.id}" style="display: none;"></div>
      `;
    } else if (fileType === "audio") {
      const objectUrl = URL.createObjectURL(fileObj.file);
      previewContent = `
        <div class="media-hub-preview-audio">
          ${getIcon("audio", { class: "media-hub-audio-icon" })}
          <audio src="${objectUrl}" class="media-hub-preview-audio-element" data-file-id="${fileObj.id}" style="display: none;"></audio>
          <div class="media-hub-media-duration" data-file-id="${fileObj.id}" style="display: none;"></div>
        </div>
      `;
    } else {
      // Determine icon based on file extension
      let iconName = "text_file";
      const ext = fileObj.extension.toLowerCase();

      if (ext === "pdf") {
        iconName = "pdf_file";
      } else if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
        iconName = "zip_file";
      } else if (ext === "xlsx" || ext === "xls") {
        iconName = "excel";
      } else if (ext === "csv") {
        iconName = "csv_file";
      } else if (ext === "doc" || ext === "docx") {
        iconName = "word_file";
      } else if (ext === "ppt" || ext === "pptx") {
        iconName = "ppt_file";
      } else if (["txt", "md", "log"].includes(ext)) {
        iconName = "text_file";
      }

      previewContent = `
        <div class="media-hub-preview-file">
          ${getIcon(iconName, { class: "media-hub-file-icon" })}
          <span class="media-hub-extension">.${fileObj.extension}</span>
        </div>
      `;
    }

    // Add capture indicator if this is a captured/recorded file
    const captureIndicator = this.getCaptureIndicator(fileObj.captureType);

    const actions = `
      <div class="media-hub-actions">
        <button type="button" class="media-hub-download" data-file-id="${fileObj.id}" data-tooltip="Download file" data-tooltip-position="top" style="display: none;">
          ${getIcon("download")}
        </button>
        <button type="button" class="media-hub-delete" data-file-id="${fileObj.id}" data-tooltip="Delete file" data-tooltip-position="top">
          ${getIcon("trash")}
        </button>
      </div>
    `;

    previewInner.innerHTML = `
      <div class="media-hub-selection-checkbox">
        <input type="checkbox" class="media-hub-checkbox" data-file-id="${fileObj.id}">
      </div>
      ${previewContent}
      ${captureIndicator}
      <div class="media-hub-preview-overlay">
        <div class="media-hub-spinner"></div>
        <div class="media-hub-progress-container">
          <div class="media-hub-progress-bar"></div>
        </div>
        <div class="media-hub-progress-text">0%</div>
      </div>
      <div class="media-hub-success-overlay">
        ${getIcon("check_circle", { class: "media-hub-success-icon" })}
      </div>
    `;

    const info = document.createElement("div");
    info.className = "media-hub-info";

    info.innerHTML = `
      ${actions}
      <div class="media-hub-info-text">
        <div class="media-hub-filename" title="${fileObj.name}">${fileObj.name}</div>
        <div class="media-hub-meta">
          <span class="media-hub-type">${fileObj.extension.toUpperCase()}</span>
          <span class="media-hub-size">${formatFileSize(fileObj.size)}</span>
        </div>
      </div>
    `;

    preview.appendChild(previewInner);
    preview.appendChild(info);
    this.uploader.previewContainer.appendChild(preview);

    // Initialize tooltips for capture indicator
    TooltipManager.init(preview);

    // Attach delete event
    const deleteBtn = preview.querySelector(".media-hub-delete");
    deleteBtn.addEventListener("click", async () => {
      if (this.uploader.options.behavior.confirmBeforeDelete) {
        const confirmed = await this.uploader.crossUploaderManager.showConfirmDialog({
          title: "Delete File",
          message: `Are you sure you want to delete "<strong>${fileObj.name}</strong>"?`,
          confirmText: "Delete",
        });
        if (confirmed) {
          this.uploader.uploadManager.deleteFile(fileObj.id);
        }
      } else {
        this.uploader.uploadManager.deleteFile(fileObj.id);
      }
    });

    // Attach download event
    const downloadBtn = preview.querySelector(".media-hub-download");
    downloadBtn.addEventListener("click", () => this.uploader.uploadManager.downloadFile(fileObj.id));

    // Attach checkbox selection event
    const checkbox = preview.querySelector(".media-hub-checkbox");
    checkbox.addEventListener("change", (e) => {
      if (e.target.checked) {
        this.uploader.selectedFiles.add(fileObj.id);
        preview.classList.add("selected");
      } else {
        this.uploader.selectedFiles.delete(fileObj.id);
        preview.classList.remove("selected");
      }
      this.uploader.selectionManager.updateUI();
    });

    fileObj.previewElement = preview;
    fileObj.downloadBtn = downloadBtn;

    // Attach click event to open carousel preview
    if (this.uploader.options.carousel.enableCarouselPreview) {
      previewInner.addEventListener("click", (e) => {
        if (
          e.target.closest(".media-hub-checkbox") ||
          e.target.closest(".media-hub-actions") ||
          e.target.closest(".media-hub-preview-overlay") ||
          e.target.closest(".media-hub-success-overlay")
        ) {
          return;
        }
        if (fileObj.uploaded) {
          this.uploader.carouselManager.open(fileObj.id);
        }
      });
      previewInner.style.cursor = "pointer";
    }

    // Extract thumbnails/duration
    if (fileType === "video") {
      this.extractVideoThumbnail(fileObj.id);
    }
    if (fileType === "audio") {
      this.extractAudioDuration(fileObj.id);
    }
  }

  // ============================================================
  // CAPTURE INDICATORS
  // ============================================================

  /**
   * Get capture indicator HTML based on capture type
   * @param {string} captureType - Type of capture
   * @returns {string} HTML string for capture indicator
   */
  getCaptureIndicator(captureType) {
    const indicators = {
      screenshot: { tooltip: "Captured Screenshot", icon: "camera" },
      "fullpage-screenshot": { tooltip: "Full Page Capture", icon: "fullpage_capture" },
      "region-screenshot": { tooltip: "Region Capture", icon: "region_capture" },
      recording: { tooltip: "Recorded Video", icon: "video" },
      audio_recording: { tooltip: "Recorded Audio", icon: "audio" },
    };

    const config = indicators[captureType];
    if (!config) return "";

    return `
      <div class="media-hub-capture-indicator" data-tooltip="${config.tooltip}" data-tooltip-position="left">
        ${getIcon(config.icon)}
      </div>
    `;
  }

  // ============================================================
  // VIDEO THUMBNAIL EXTRACTION
  // ============================================================

  /**
   * Extract thumbnail from video file
   * @param {string} fileId - File ID
   */
  extractVideoThumbnail(fileId) {
    const preview = this.uploader.previewContainer.querySelector(`[data-file-id="${fileId}"]`);
    if (!preview) return;

    const video = preview.querySelector(".media-hub-preview-video");
    const canvas = preview.querySelector(".media-hub-video-thumbnail");
    if (!video || !canvas) return;

    video.addEventListener("loadedmetadata", () => {
      this.displayMediaDuration(fileId, video.duration);
      const seekTime = Math.min(1, video.duration * 0.1);
      video.currentTime = seekTime;
    });

    video.addEventListener(
      "seeked",
      () => {
        try {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.8);

          const thumbnailImg = document.createElement("img");
          thumbnailImg.src = thumbnailUrl;
          thumbnailImg.className = "media-hub-preview-image media-hub-video-thumbnail-img";
          thumbnailImg.alt = "Video thumbnail";

          video.style.display = "none";
          video.parentNode.insertBefore(thumbnailImg, video);
          canvas.remove();
        } catch (error) {
          console.warn("Failed to extract video thumbnail:", error);
        }
      },
      { once: true }
    );

    video.addEventListener(
      "error",
      () => {
        console.warn("Failed to load video for thumbnail extraction");
        canvas.remove();
      },
      { once: true }
    );
  }

  // ============================================================
  // AUDIO DURATION EXTRACTION
  // ============================================================

  /**
   * Extract duration from audio file
   * @param {string} fileId - File ID
   */
  extractAudioDuration(fileId) {
    const preview = this.uploader.previewContainer.querySelector(`[data-file-id="${fileId}"]`);
    if (!preview) return;

    const audio = preview.querySelector(".media-hub-preview-audio-element");
    if (!audio) return;

    audio.addEventListener(
      "loadedmetadata",
      () => {
        this.displayMediaDuration(fileId, audio.duration);
      },
      { once: true }
    );

    audio.addEventListener(
      "error",
      () => {
        console.warn("Failed to load audio metadata");
      },
      { once: true }
    );
  }

  // ============================================================
  // DURATION DISPLAY
  // ============================================================

  /**
   * Display media duration on preview
   * @param {string} fileId - File ID
   * @param {number} duration - Duration in seconds
   */
  displayMediaDuration(fileId, duration) {
    const preview = this.uploader.previewContainer.querySelector(`[data-file-id="${fileId}"]`);
    if (!preview) return;

    const durationElement = preview.querySelector(".media-hub-media-duration");
    if (!durationElement) return;

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
}
