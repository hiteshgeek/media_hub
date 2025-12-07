/**
 * LimitsDisplayManager.js
 *
 * Manages the limits display UI for the FileUploader.
 * Handles both concise and detailed views of upload limits.
 *
 * @module LimitsDisplayManager
 */

import { getIcon } from "../../shared/icons.js";
import Tooltip from "../../components/tooltip/index.js";
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
    const typeLimits = this.uploader.options.perTypeMaxTotalSizeDisplay;
    const isDetailed = this.uploader.limitsViewMode === "detailed";

    const sizePercentage = this.uploader.options.totalMaxSize > 0
      ? (totalSize / this.uploader.options.totalMaxSize) * 100
      : 0;
    const filePercentage = this.uploader.options.maxFiles > 0
      ? (fileCount / this.uploader.options.maxFiles) * 100
      : 0;

    const hasTypeLimits =
      (typeLimits && Object.keys(typeLimits).length > 0) ||
      (this.uploader.options.perFileMaxSizePerType && Object.keys(this.uploader.options.perFileMaxSizePerType).length > 0) ||
      (this.uploader.options.perTypeMaxFileCount && Object.keys(this.uploader.options.perTypeMaxFileCount).length > 0);

    const allTypesWithLimits = [
      ...new Set([
        ...Object.keys(this.uploader.options.perTypeMaxTotalSizeDisplay || {}),
        ...Object.keys(this.uploader.options.perFileMaxSizePerType || {}),
        ...Object.keys(this.uploader.options.perTypeMaxFileCount || {}),
      ]),
    ];

    const viewModeToggleButton = this.uploader.options.allowLimitsViewToggle && hasTypeLimits
      ? this.createViewModeToggle(isDetailed)
      : "";

    let limitsHTML = hasTypeLimits
      ? `<div class="file-uploader-limits-header">
          <span class="file-uploader-limits-title">Upload Limits</span>
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
    Tooltip.initAll(this.uploader.limitsContainer);

    // Show/hide button container based on file count
    const hasFiles = fileCount > 0;
    if (this.uploader.buttonContainer) {
      this.uploader.buttonContainer.style.display = hasFiles ? "flex" : "none";
    }
    if (this.uploader.downloadAllBtn && this.uploader.options.downloadAllButtonElement) {
      this.uploader.downloadAllBtn.disabled = !hasFiles;
    }
    if (this.uploader.clearAllBtn && this.uploader.options.clearAllButtonElement) {
      this.uploader.clearAllBtn.disabled = !hasFiles;
    }
  }

  // ============================================================
  // VIEW MODE TOGGLE
  // ============================================================

  createViewModeToggle(isDetailed) {
    return `
      <button type="button" class="file-uploader-limits-toggle${isDetailed ? " is-expanded" : ""}"
              data-tooltip-text="${isDetailed ? "Switch to concise view" : "Switch to detailed view"}"
              data-tooltip-position="top">
        ${getIcon(isDetailed ? "grid_view" : "list_view", { class: "file-uploader-toggle-icon" })}
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
      html += '<div class="file-uploader-limits-types">';
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
    const typeCountLimit = this.uploader.options.perTypeMaxFileCount[type] || this.uploader.options.maxFiles;
    const typeSize = this.getFileTypeSize(type);
    const typeSizeFormatted = formatFileSize(typeSize);
    const typeLimitBytes = this.uploader.options.perTypeMaxTotalSize[type] || 0;

    let typeProgressPercentage = 0;
    if (typeLimitBytes > 0) {
      typeProgressPercentage = (typeSize / typeLimitBytes) * 100;
    } else if (typeCountLimit > 0) {
      typeProgressPercentage = (typeCount / typeCountLimit) * 100;
    }

    const typeIcon = getIcon(type, { class: "file-uploader-type-icon" });
    const perFileLimitDisplay = this.uploader.options.perFileMaxSizePerTypeDisplay[type] || this.uploader.options.perFileMaxSizeDisplay || "";

    return `
      <div class="file-uploader-type-card" ${tooltipText ? `data-tooltip-text="${tooltipText}" data-tooltip-position="top"` : ""}>
        <div class="file-uploader-type-card-header">
          <div class="file-uploader-type-icon-wrapper">${typeIcon}</div>
          <span class="file-uploader-type-name">${capitalizeFirst(type)}</span>
        </div>
        <div class="file-uploader-type-card-body">
          ${this.uploader.options.showPerFileLimit && perFileLimitDisplay ? `
            <div class="file-uploader-type-stat">
              <span class="file-uploader-type-stat-label">Per file</span>
              <span class="file-uploader-type-stat-value">${perFileLimitDisplay}</span>
            </div>
          ` : ""}
          ${this.uploader.options.showTypeGroupSize ? `
            <div class="file-uploader-type-stat">
              <span class="file-uploader-type-stat-label">Used</span>
              <span class="file-uploader-type-stat-value">${typeSizeFormatted}${typeLimitBytes > 0 && limit ? ` / ${limit}` : ""}</span>
            </div>
            ${this.uploader.options.showTypeProgressBar ? `
              <div class="file-uploader-type-progress">
                <div class="file-uploader-type-progress-bar" style="width: ${Math.min(100, typeProgressPercentage)}%"></div>
              </div>
            ` : ""}
          ` : ""}
          ${this.uploader.options.showTypeGroupCount ? `
            <div class="file-uploader-type-stat">
              <span class="file-uploader-type-stat-label">Files</span>
              <span class="file-uploader-type-stat-value">${typeCount} / ${typeCountLimit}</span>
            </div>
          ` : ""}
        </div>
      </div>
    `;
  }

  renderOtherTypeCard(allTypesWithLimits) {
    const typesWithLimits = Object.keys(this.uploader.options.perFileMaxSizePerType || {});
    const allTypesCovered = this.uploader.options.allowedExtensions.every((ext) => {
      const fileType = getFileType(ext, this.uploader.options);
      return typesWithLimits.includes(fileType);
    });

    if (allTypesCovered || !this.uploader.options.showPerFileLimit) return "";

    const otherExtensions = this.uploader.options.allowedExtensions.filter((ext) => {
      const fileType = getFileType(ext, this.uploader.options);
      return !typesWithLimits.includes(fileType);
    });

    const tooltipText = otherExtensions.length > 0
      ? `Allowed: ${otherExtensions.map((ext) => `.${ext}`).join(", ")}`
      : "";

    return `
      <div class="file-uploader-type-card" ${tooltipText ? `data-tooltip-text="${tooltipText}" data-tooltip-position="top"` : ""}>
        <div class="file-uploader-type-card-header">
          <div class="file-uploader-type-icon-wrapper">${getIcon("other", { class: "file-uploader-type-icon" })}</div>
          <span class="file-uploader-type-name">Other</span>
        </div>
        <div class="file-uploader-type-card-body">
          <div class="file-uploader-type-stat">
            <span class="file-uploader-type-stat-label">Per file</span>
            <span class="file-uploader-type-stat-value">${this.uploader.options.perFileMaxSizeDisplay}</span>
          </div>
        </div>
      </div>
    `;
  }

  renderGeneralLimitsSection(totalSizeFormatted, fileCount, sizePercentage, filePercentage) {
    return `
      <div class="file-uploader-general-limits">
        <div class="file-uploader-general-limits-header">
          <span class="file-uploader-general-limits-title">General Limits</span>
        </div>
        <div class="file-uploader-general-limits-grid">
          <div class="file-uploader-general-card" data-tooltip-text="Maximum total size for all uploaded files combined" data-tooltip-position="top">
            <div class="file-uploader-general-card-icon">${getIcon("storage", { class: "file-uploader-general-icon" })}</div>
            <div class="file-uploader-general-card-content">
              <span class="file-uploader-general-card-label">Total Size</span>
              <span class="file-uploader-general-card-value">${totalSizeFormatted} / ${this.uploader.options.totalMaxSizeDisplay}</span>
              ${this.uploader.options.showProgressBar ? `
                <div class="file-uploader-general-card-progress">
                  <div class="file-uploader-general-card-progress-bar" style="width: ${Math.min(100, sizePercentage)}%"></div>
                </div>
              ` : ""}
            </div>
          </div>
          <div class="file-uploader-general-card" data-tooltip-text="Maximum number of files that can be uploaded" data-tooltip-position="top">
            <div class="file-uploader-general-card-icon">${getIcon("calculator", { class: "file-uploader-general-icon" })}</div>
            <div class="file-uploader-general-card-content">
              <span class="file-uploader-general-card-label">Total Files</span>
              <span class="file-uploader-general-card-value">${fileCount} / ${this.uploader.options.maxFiles}</span>
              ${this.uploader.options.showProgressBar ? `
                <div class="file-uploader-general-card-progress">
                  <div class="file-uploader-general-card-progress-bar" style="width: ${Math.min(100, filePercentage)}%"></div>
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
    let html = '<div class="file-uploader-limits-grid file-uploader-limits-concise">';

    if (allTypesWithLimits.length > 0) {
      html += '<div class="file-uploader-type-chips">';
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
    const typeCountLimit = this.uploader.options.perTypeMaxFileCount[type] || this.uploader.options.maxFiles;
    const typeIcon = getIcon(type, { class: "file-uploader-chip-icon" });
    const tooltipText = allowedExtensions.length > 0
      ? `Allowed: ${allowedExtensions.map((ext) => `.${ext}`).join(", ")}`
      : "";

    const perFileLimitDisplay = this.uploader.options.perFileMaxSizePerTypeDisplay[type] || this.uploader.options.perFileMaxSizeDisplay || "";

    const infoItems = [];
    if (perFileLimitDisplay) {
      infoItems.push(`<span class="file-uploader-chip-limit">${perFileLimitDisplay} / file</span>`);
    }
    infoItems.push(`<span class="file-uploader-chip-max">${typeCountLimit} files</span>`);
    if (limit) {
      infoItems.push(`<span class="file-uploader-chip-max">Total ${limit}</span>`);
    }

    return `
      <div class="file-uploader-type-chip-expanded" ${tooltipText ? `data-tooltip-text="${tooltipText}" data-tooltip-position="top"` : ""}>
        <div class="file-uploader-chip-header">
          ${typeIcon}
          <span class="file-uploader-chip-name">${capitalizeFirst(type)}</span>
          ${typeCount > 0 ? `<span class="file-uploader-chip-badge">${typeCount}/${typeCountLimit}</span>` : ""}
        </div>
        <div class="file-uploader-chip-info">
          ${infoItems.join('<span class="file-uploader-chip-separator">•</span>')}
        </div>
      </div>
    `;
  }

  renderOtherTypeChip(allTypesWithLimits) {
    const allTypesCovered = this.uploader.options.allowedExtensions.every((ext) => {
      const fileType = getFileType(ext, this.uploader.options);
      return allTypesWithLimits.includes(fileType);
    });

    if (allTypesCovered) return "";

    const otherExtensions = this.uploader.options.allowedExtensions.filter((ext) => {
      const fileType = getFileType(ext, this.uploader.options);
      return !allTypesWithLimits.includes(fileType);
    });

    const tooltipText = otherExtensions.length > 0
      ? `Allowed: ${otherExtensions.map((ext) => `.${ext}`).join(", ")}`
      : "";
    const otherPerFileLimit = this.uploader.options.perFileMaxSizeDisplay || "";

    return `
      <div class="file-uploader-type-chip-expanded" ${tooltipText ? `data-tooltip-text="${tooltipText}" data-tooltip-position="top"` : ""}>
        <div class="file-uploader-chip-header">
          ${getIcon("other", { class: "file-uploader-chip-icon" })}
          <span class="file-uploader-chip-name">Other</span>
        </div>
        ${otherPerFileLimit ? `
          <div class="file-uploader-chip-info">
            <span class="file-uploader-chip-limit">${otherPerFileLimit} / file</span>
          </div>
        ` : ""}
      </div>
    `;
  }

  renderCompactSummary(totalSizeFormatted, fileCount, sizePercentage, filePercentage) {
    return `
      <div class="file-uploader-compact-summary">
        <div class="file-uploader-compact-item">
          <div class="file-uploader-compact-item-header">
            <span class="file-uploader-compact-item-label">Size</span>
            <span class="file-uploader-compact-item-value">${totalSizeFormatted} / ${this.uploader.options.totalMaxSizeDisplay}</span>
          </div>
          ${this.uploader.options.showProgressBar ? `
            <div class="file-uploader-compact-progress">
              <div class="file-uploader-compact-progress-bar" style="width: ${Math.min(100, sizePercentage)}%"></div>
            </div>
          ` : ""}
        </div>
        <div class="file-uploader-compact-item">
          <div class="file-uploader-compact-item-header">
            <span class="file-uploader-compact-item-label">Files</span>
            <span class="file-uploader-compact-item-value">${fileCount} / ${this.uploader.options.maxFiles}</span>
          </div>
          ${this.uploader.options.showProgressBar ? `
            <div class="file-uploader-compact-progress">
              <div class="file-uploader-compact-progress-bar" style="width: ${Math.min(100, filePercentage)}%"></div>
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
    const viewModeToggleBtn = this.uploader.limitsContainer.querySelector(".file-uploader-limits-toggle");
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
      image: this.uploader.options.imageExtensions,
      video: this.uploader.options.videoExtensions,
      audio: this.uploader.options.audioExtensions,
      document: this.uploader.options.documentExtensions,
      archive: this.uploader.options.archiveExtensions,
    };

    const extensions = typeMap[type.toLowerCase()] || [];

    if (this.uploader.options.allowedExtensions.length > 0) {
      return extensions.filter((ext) => this.uploader.options.allowedExtensions.includes(ext));
    }

    return extensions;
  }
}
