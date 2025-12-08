/**
 * LimitsDisplayManager.js
 *
 * Manages the limits display UI for the FileUploader.
 * Handles both concise and detailed views of upload limits.
 *
 * @module LimitsDisplayManager
 */

import { getIcon } from "../../shared/icons.js";
import TooltipManager from "../../utils/TooltipManager.js";
import { formatFileSize, capitalizeFirst, getFileType } from "../utils/helpers.js";

// ============================================================
// LIMITS DISPLAY MANAGER CLASS
// ============================================================

export class LimitsDisplayManager {
  /**
   * Create a LimitsDisplayManager instance
   * @param {FileUploader} uploader - The parent FileUploader instance
   */
  constructor(uploader) {
    this.uploader = uploader;
  }

  // ============================================================
  // MAIN UPDATE METHOD
  // ============================================================

  /**
   * Update the limits display UI
   */
  updateDisplay() {
    if (!this.uploader.limitsContainer) return;

    const totalSize = this.getTotalSize();
    const totalSizeFormatted = formatFileSize(totalSize);
    const fileCount = this.uploader.files.filter((f) => f.uploaded).length;
    const typeLimits = this.uploader.options.perTypeLimits.perTypeMaxTotalSizeDisplay;
    const isDetailed = this.uploader.limitsViewMode === "detailed";

    const sizePercentage = this.uploader.options.limits.totalMaxSize > 0
      ? (totalSize / this.uploader.options.limits.totalMaxSize) * 100
      : 0;
    const filePercentage = this.uploader.options.limits.maxFiles > 0
      ? (fileCount / this.uploader.options.limits.maxFiles) * 100
      : 0;

    const hasTypeLimits =
      (typeLimits && Object.keys(typeLimits).length > 0) ||
      (this.uploader.options.perTypeLimits.perFileMaxSizePerType && Object.keys(this.uploader.options.perTypeLimits.perFileMaxSizePerType).length > 0) ||
      (this.uploader.options.perTypeLimits.perTypeMaxFileCount && Object.keys(this.uploader.options.perTypeLimits.perTypeMaxFileCount).length > 0);

    const allTypesWithLimits = [
      ...new Set([
        ...Object.keys(this.uploader.options.perTypeLimits.perTypeMaxTotalSizeDisplay || {}),
        ...Object.keys(this.uploader.options.perTypeLimits.perFileMaxSizePerType || {}),
        ...Object.keys(this.uploader.options.perTypeLimits.perTypeMaxFileCount || {}),
      ]),
    ];

    const viewModeToggleButton = this.uploader.options.limitsDisplay.allowLimitsViewToggle && hasTypeLimits
      ? this.createViewModeToggle(isDetailed)
      : "";

    let limitsHTML = hasTypeLimits
      ? `<div class="media-hub-limits-header">
          <span class="media-hub-limits-title">Upload Limits</span>
          ${viewModeToggleButton}
        </div>`
      : "";

    if (isDetailed) {
      limitsHTML += this.renderDetailedView(allTypesWithLimits, typeLimits, totalSizeFormatted, fileCount, sizePercentage, filePercentage);
    } else {
      limitsHTML += this.renderConciseView(allTypesWithLimits, typeLimits, totalSizeFormatted, fileCount, sizePercentage, filePercentage);
    }

    this.uploader.limitsContainer.innerHTML = limitsHTML;
    this.attachLimitsToggleEvents();
    TooltipManager.init(this.uploader.limitsContainer);

    // Show/hide button container based on file count
    const hasFiles = fileCount > 0;
    if (this.uploader.buttonContainer) {
      this.uploader.buttonContainer.style.display = hasFiles ? "flex" : "none";
    }
    if (this.uploader.downloadAllBtn && this.uploader.options.buttons.downloadAllButtonElement) {
      this.uploader.downloadAllBtn.disabled = !hasFiles;
    }
    if (this.uploader.clearAllBtn && this.uploader.options.buttons.clearAllButtonElement) {
      this.uploader.clearAllBtn.disabled = !hasFiles;
    }
  }

  // ============================================================
  // VIEW MODE TOGGLE
  // ============================================================

  createViewModeToggle(isDetailed) {
    return `
      <button type="button" class="media-hub-limits-toggle${isDetailed ? " is-expanded" : ""}"
              data-tooltip="${isDetailed ? "Switch to concise view" : "Switch to detailed view"}"
              data-tooltip-position="top">
        ${getIcon(isDetailed ? "grid_view" : "list_view", { class: "media-hub-toggle-icon" })}
        <span>${isDetailed ? "Concise" : "Details"}</span>
      </button>
    `;
  }

  // ============================================================
  // DETAILED VIEW
  // ============================================================

  renderDetailedView(allTypesWithLimits, typeLimits, totalSizeFormatted, fileCount, sizePercentage, filePercentage) {
    let html = "";

    if (allTypesWithLimits.length > 0) {
      html += '<div class="media-hub-limits-types">';
      for (const type of allTypesWithLimits) {
        html += this.renderDetailedTypeCard(type, typeLimits);
      }
      html += this.renderOtherTypeCard(allTypesWithLimits);
      html += "</div>";
    }

    html += this.renderGeneralLimitsSection(totalSizeFormatted, fileCount, sizePercentage, filePercentage);
    return html;
  }

  renderDetailedTypeCard(type, typeLimits) {
    const limit = typeLimits ? typeLimits[type] : null;
    const allowedExtensions = this.getAllowedExtensionsForType(type);
    const tooltipText = allowedExtensions.length > 0
      ? `Allowed: ${allowedExtensions.map((ext) => `.${ext}`).join(", ")}`
      : "";

    const typeCount = this.getFileTypeCount(type);
    const typeCountLimit = this.uploader.options.perTypeLimits.perTypeMaxFileCount[type] || this.uploader.options.limits.maxFiles;
    const typeSize = this.getFileTypeSize(type);
    const typeSizeFormatted = formatFileSize(typeSize);
    const typeLimitBytes = this.uploader.options.perTypeLimits.perTypeMaxTotalSize[type] || 0;

    let typeProgressPercentage = 0;
    if (typeLimitBytes > 0) {
      typeProgressPercentage = (typeSize / typeLimitBytes) * 100;
    } else if (typeCountLimit > 0) {
      typeProgressPercentage = (typeCount / typeCountLimit) * 100;
    }

    const typeIcon = getIcon(type, { class: "media-hub-type-icon" });
    const perFileLimitDisplay = this.uploader.options.perTypeLimits.perFileMaxSizePerTypeDisplay[type] || this.uploader.options.limits.perFileMaxSizeDisplay || "";

    return `
      <div class="media-hub-type-card" ${tooltipText ? `data-tooltip="${tooltipText}" data-tooltip-position="top"` : ""}>
        <div class="media-hub-type-card-header">
          <div class="media-hub-type-icon-wrapper">${typeIcon}</div>
          <span class="media-hub-type-name">${capitalizeFirst(type)}</span>
        </div>
        <div class="media-hub-type-card-body">
          ${this.uploader.options.limitsDisplay.showPerFileLimit && perFileLimitDisplay ? `
            <div class="media-hub-type-stat">
              <span class="media-hub-type-stat-label">Per file</span>
              <span class="media-hub-type-stat-value">${perFileLimitDisplay}</span>
            </div>
          ` : ""}
          ${this.uploader.options.limitsDisplay.showTypeGroupSize ? `
            <div class="media-hub-type-stat">
              <span class="media-hub-type-stat-label">Used</span>
              <span class="media-hub-type-stat-value">${typeSizeFormatted}${typeLimitBytes > 0 && limit ? ` / ${limit}` : ""}</span>
            </div>
            ${this.uploader.options.limitsDisplay.showTypeProgressBar ? `
              <div class="media-hub-type-progress">
                <div class="media-hub-type-progress-bar" style="width: ${Math.min(100, typeProgressPercentage)}%"></div>
              </div>
            ` : ""}
          ` : ""}
          ${this.uploader.options.limitsDisplay.showTypeGroupCount ? `
            <div class="media-hub-type-stat">
              <span class="media-hub-type-stat-label">Files</span>
              <span class="media-hub-type-stat-value">${typeCount} / ${typeCountLimit}</span>
            </div>
          ` : ""}
        </div>
      </div>
    `;
  }

  renderOtherTypeCard(allTypesWithLimits) {
    const typesWithLimits = Object.keys(this.uploader.options.perTypeLimits.perFileMaxSizePerType || {});
    const allTypesCovered = this.uploader.options.fileTypes.allowedExtensions.every((ext) => {
      const fileType = getFileType(ext, this.uploader.options);
      return typesWithLimits.includes(fileType);
    });

    if (allTypesCovered || !this.uploader.options.limitsDisplay.showPerFileLimit) return "";

    const otherExtensions = this.uploader.options.fileTypes.allowedExtensions.filter((ext) => {
      const fileType = getFileType(ext, this.uploader.options);
      return !typesWithLimits.includes(fileType);
    });

    const tooltipText = otherExtensions.length > 0
      ? `Allowed: ${otherExtensions.map((ext) => `.${ext}`).join(", ")}`
      : "";

    return `
      <div class="media-hub-type-card" ${tooltipText ? `data-tooltip="${tooltipText}" data-tooltip-position="top"` : ""}>
        <div class="media-hub-type-card-header">
          <div class="media-hub-type-icon-wrapper">${getIcon("other", { class: "media-hub-type-icon" })}</div>
          <span class="media-hub-type-name">Other</span>
        </div>
        <div class="media-hub-type-card-body">
          <div class="media-hub-type-stat">
            <span class="media-hub-type-stat-label">Per file</span>
            <span class="media-hub-type-stat-value">${this.uploader.options.limits.perFileMaxSizeDisplay}</span>
          </div>
        </div>
      </div>
    `;
  }

  renderGeneralLimitsSection(totalSizeFormatted, fileCount, sizePercentage, filePercentage) {
    return `
      <div class="media-hub-general-limits">
        <div class="media-hub-general-limits-header">
          <span class="media-hub-general-limits-title">General Limits</span>
        </div>
        <div class="media-hub-general-limits-grid">
          <div class="media-hub-general-card" data-tooltip="Maximum total size for all uploaded files combined" data-tooltip-position="top">
            <div class="media-hub-general-card-icon">${getIcon("storage", { class: "media-hub-general-icon" })}</div>
            <div class="media-hub-general-card-content">
              <span class="media-hub-general-card-label">Total Size</span>
              <span class="media-hub-general-card-value">${totalSizeFormatted} / ${this.uploader.options.limits.totalMaxSizeDisplay}</span>
              ${this.uploader.options.limitsDisplay.showProgressBar ? `
                <div class="media-hub-general-card-progress">
                  <div class="media-hub-general-card-progress-bar" style="width: ${Math.min(100, sizePercentage)}%"></div>
                </div>
              ` : ""}
            </div>
          </div>
          <div class="media-hub-general-card" data-tooltip="Maximum number of files that can be uploaded" data-tooltip-position="top">
            <div class="media-hub-general-card-icon">${getIcon("calculator", { class: "media-hub-general-icon" })}</div>
            <div class="media-hub-general-card-content">
              <span class="media-hub-general-card-label">Total Files</span>
              <span class="media-hub-general-card-value">${fileCount} / ${this.uploader.options.limits.maxFiles}</span>
              ${this.uploader.options.limitsDisplay.showProgressBar ? `
                <div class="media-hub-general-card-progress">
                  <div class="media-hub-general-card-progress-bar" style="width: ${Math.min(100, filePercentage)}%"></div>
                </div>
              ` : ""}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ============================================================
  // CONCISE VIEW
  // ============================================================

  renderConciseView(allTypesWithLimits, typeLimits, totalSizeFormatted, fileCount, sizePercentage, filePercentage) {
    let html = '<div class="media-hub-limits-grid media-hub-limits-concise">';

    if (allTypesWithLimits.length > 0) {
      html += '<div class="media-hub-type-chips">';
      for (const type of allTypesWithLimits) {
        html += this.renderConciseTypeChip(type, typeLimits);
      }
      html += this.renderOtherTypeChip(allTypesWithLimits);
      html += "</div>";
    }

    html += this.renderCompactSummary(totalSizeFormatted, fileCount, sizePercentage, filePercentage);
    html += "</div>";
    return html;
  }

  renderConciseTypeChip(type, typeLimits) {
    const limit = typeLimits ? typeLimits[type] : null;
    const allowedExtensions = this.getAllowedExtensionsForType(type);
    const typeCount = this.getFileTypeCount(type);
    const typeCountLimit = this.uploader.options.perTypeLimits.perTypeMaxFileCount[type] || this.uploader.options.limits.maxFiles;
    const typeIcon = getIcon(type, { class: "media-hub-chip-icon" });
    const tooltipText = allowedExtensions.length > 0
      ? `Allowed: ${allowedExtensions.map((ext) => `.${ext}`).join(", ")}`
      : "";

    const perFileLimitDisplay = this.uploader.options.perTypeLimits.perFileMaxSizePerTypeDisplay[type] || this.uploader.options.limits.perFileMaxSizeDisplay || "";

    const infoItems = [];
    if (perFileLimitDisplay) {
      infoItems.push(`<span class="media-hub-chip-limit">${perFileLimitDisplay} / file</span>`);
    }
    infoItems.push(`<span class="media-hub-chip-max">${typeCountLimit} files</span>`);
    if (limit) {
      infoItems.push(`<span class="media-hub-chip-max">Total ${limit}</span>`);
    }

    return `
      <div class="media-hub-type-chip-expanded" ${tooltipText ? `data-tooltip="${tooltipText}" data-tooltip-position="top"` : ""}>
        <div class="media-hub-chip-header">
          ${typeIcon}
          <span class="media-hub-chip-name">${capitalizeFirst(type)}</span>
          ${typeCount > 0 ? `<span class="media-hub-chip-badge">${typeCount}/${typeCountLimit}</span>` : ""}
        </div>
        <div class="media-hub-chip-info">
          ${infoItems.join('<span class="media-hub-chip-separator">•</span>')}
        </div>
      </div>
    `;
  }

  renderOtherTypeChip(allTypesWithLimits) {
    const allTypesCovered = this.uploader.options.fileTypes.allowedExtensions.every((ext) => {
      const fileType = getFileType(ext, this.uploader.options);
      return allTypesWithLimits.includes(fileType);
    });

    if (allTypesCovered) return "";

    const otherExtensions = this.uploader.options.fileTypes.allowedExtensions.filter((ext) => {
      const fileType = getFileType(ext, this.uploader.options);
      return !allTypesWithLimits.includes(fileType);
    });

    const tooltipText = otherExtensions.length > 0
      ? `Allowed: ${otherExtensions.map((ext) => `.${ext}`).join(", ")}`
      : "";
    const otherPerFileLimit = this.uploader.options.limits.perFileMaxSizeDisplay || "";

    return `
      <div class="media-hub-type-chip-expanded" ${tooltipText ? `data-tooltip="${tooltipText}" data-tooltip-position="top"` : ""}>
        <div class="media-hub-chip-header">
          ${getIcon("other", { class: "media-hub-chip-icon" })}
          <span class="media-hub-chip-name">Other</span>
        </div>
        ${otherPerFileLimit ? `
          <div class="media-hub-chip-info">
            <span class="media-hub-chip-limit">${otherPerFileLimit} / file</span>
          </div>
        ` : ""}
      </div>
    `;
  }

  renderCompactSummary(totalSizeFormatted, fileCount, sizePercentage, filePercentage) {
    return `
      <div class="media-hub-compact-summary">
        <div class="media-hub-compact-item">
          <div class="media-hub-compact-item-header">
            <span class="media-hub-compact-item-label">Size</span>
            <span class="media-hub-compact-item-value">${totalSizeFormatted} / ${this.uploader.options.limits.totalMaxSizeDisplay}</span>
          </div>
          ${this.uploader.options.limitsDisplay.showProgressBar ? `
            <div class="media-hub-compact-progress">
              <div class="media-hub-compact-progress-bar" style="width: ${Math.min(100, sizePercentage)}%"></div>
            </div>
          ` : ""}
        </div>
        <div class="media-hub-compact-item">
          <div class="media-hub-compact-item-header">
            <span class="media-hub-compact-item-label">Files</span>
            <span class="media-hub-compact-item-value">${fileCount} / ${this.uploader.options.limits.maxFiles}</span>
          </div>
          ${this.uploader.options.limitsDisplay.showProgressBar ? `
            <div class="media-hub-compact-progress">
              <div class="media-hub-compact-progress-bar" style="width: ${Math.min(100, filePercentage)}%"></div>
            </div>
          ` : ""}
        </div>
      </div>
    `;
  }

  // ============================================================
  // EVENT HANDLERS
  // ============================================================

  attachLimitsToggleEvents() {
    const viewModeToggleBtn = this.uploader.limitsContainer.querySelector(".media-hub-limits-toggle");
    if (viewModeToggleBtn) {
      viewModeToggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.uploader.limitsViewMode = this.uploader.limitsViewMode === "concise" ? "detailed" : "concise";
        this.updateDisplay();
      });
    }
  }

  // ============================================================
  // HELPER METHODS
  // ============================================================

  getTotalSize() {
    return this.uploader.files
      .filter((f) => f.uploaded)
      .reduce((total, f) => total + f.size, 0);
  }

  getFileTypeCount(type) {
    return this.uploader.files.filter((f) => {
      if (!f.uploaded) return false;
      const fileType = getFileType(f.extension, this.uploader.options);
      return fileType === type.toLowerCase();
    }).length;
  }

  getFileTypeSize(type) {
    return this.uploader.files
      .filter((f) => {
        if (!f.uploaded) return false;
        const fileType = getFileType(f.extension, this.uploader.options);
        return fileType === type.toLowerCase();
      })
      .reduce((total, file) => total + file.size, 0);
  }

  getAllowedExtensionsForType(type) {
    const typeMap = {
      image: this.uploader.options.fileTypes.imageExtensions,
      video: this.uploader.options.fileTypes.videoExtensions,
      audio: this.uploader.options.fileTypes.audioExtensions,
      document: this.uploader.options.fileTypes.documentExtensions,
      archive: this.uploader.options.fileTypes.archiveExtensions,
    };

    const extensions = typeMap[type.toLowerCase()] || [];

    if (this.uploader.options.fileTypes.allowedExtensions.length > 0) {
      return extensions.filter((ext) => this.uploader.options.fileTypes.allowedExtensions.includes(ext));
    }

    return extensions;
  }
}
